// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { WithId } from '@medplum/core';
import { getReferenceString, isReference } from '@medplum/core';
import type {
  Period,
  Practitioner,
  Questionnaire,
  QuestionnaireResponse,
  Reference,
  Schedule,
  Slot,
} from '@medplum/fhirtypes';
import { useMedplum, useResource } from '@medplum/solid-hooks';
import type { JSX } from 'solid-js';
import { createEffect, createMemo, createSignal, For, Show } from 'solid-js';
import { CalendarInput } from '../CalendarInput/CalendarInput';
import { getStartMonth } from '../CalendarInput/CalendarInput.utils';
import { QuestionnaireForm } from '../QuestionnaireForm/QuestionnaireForm';
import { ResourceAvatar } from '../ResourceAvatar/ResourceAvatar';
import { ResourceName } from '../ResourceName/ResourceName';

/**
 * Custom function to search for available slots within a given time period
 * @param period - The time period to search within
 * @returns Promise resolving to an array of available slots
 */
export type SlotSearchFunction = (period: Period) => Promise<Slot[]>;

export interface SchedulerProps {
  /** Schedule resource(s) or custom slot search function */
  readonly schedule: Schedule | Reference<Schedule> | Schedule[] | Reference<Schedule>[] | SlotSearchFunction;
  /** Questionnaire for booking details */
  readonly questionnaire: Questionnaire | Reference<Questionnaire>;
}

/**
 * Scheduler component for booking appointments.
 * Displays a calendar, time slots, and a questionnaire form.
 * @param props
 */
export function Scheduler(props: SchedulerProps): JSX.Element | null {
  const medplum = useMedplum();
  const questionnaire = useResource(props.questionnaire as Reference<Questionnaire>);

  const [month, setMonth] = createSignal<Date>(getStartMonth());
  const [date, setDate] = createSignal<Date | undefined>();
  const [response, setResponse] = createSignal<QuestionnaireResponse | undefined>();
  const [actor, setActor] = createSignal<Reference<Practitioner> | undefined>();
  const [slots, setSlots] = createSignal<Slot[] | undefined>();
  const [selectedSlot, setSelectedSlot] = createSignal<Slot | undefined>();

  createEffect(() => {
    if (!props.schedule) {
      setSlots([]);
      return;
    }

    // Function to fetch slots
    let fetchSlots: SlotSearchFunction;

    // If the user provides a function to fetch slots, use it
    if (typeof props.schedule === 'function') {
      fetchSlots = props.schedule;
    } else {
      // Otherwise, search based on the schedule(s) provided
      fetchSlots = async (period: Period): Promise<Slot[]> => {
        const scheduleArray: string[] = [];
        if (!Array.isArray(props.schedule)) {
          scheduleArray.push(
            isReference<Schedule>(props.schedule as Reference<Schedule>, 'Schedule')
              ? (props.schedule as Reference<Schedule>).reference!
              : getReferenceString(props.schedule as WithId<Schedule>)
          );
        } else {
          for (const schedule of props.schedule) {
            if (isReference(schedule)) {
              scheduleArray.push((schedule as Reference<Schedule>).reference as string);
            } else {
              const scheduleRef = getReferenceString(schedule as WithId<Schedule>);
              scheduleArray.push(scheduleRef);
            }
          }
        }
        const slotSearchParams = new URLSearchParams([
          ['_count', (30 * 24).toString()],
          ['schedule', scheduleArray.join(',')],
          ['start', 'gt' + period.start],
          ['start', 'lt' + period.end],
        ]);
        return medplum.searchResources('Slot', slotSearchParams);
      };

      // If a single schedule is provided, set the actor
      if (props.schedule && !Array.isArray(props.schedule)) {
        if (isReference(props.schedule)) {
          medplum
            .readReference<Schedule>(props.schedule as Reference<Schedule>)
            .then((schedule) => {
              const actorRef = schedule.actor?.[0] as Reference<Practitioner>;
              setActor(actorRef);
            })
            .catch(console.error);
        } else {
          setActor((props.schedule as Schedule).actor?.[0] as Reference<Practitioner>);
        }
      }
    }

    fetchSlots({ start: getStart(month()), end: getEnd(month()) })
      .then(setSlots)
      .catch(console.error);
  });

  // Create a map of start times to slots to handle duplicate start times
  const startTimeToSlotMap = createMemo(() => {
    const currentDate = date();
    if (!currentDate) {
      return null;
    }
    const sortedSlots = (slots() || [])
      // Filter slots to only include those that are within the date range
      .filter((slot) => {
        return (
          new Date(slot.start as string).getTime() > currentDate.getTime() &&
          new Date(slot.start as string).getTime() < currentDate.getTime() + 24 * 3600 * 1000
        );
      })
      // Sort slots by start time
      .sort((a, b) => {
        return new Date(a.start as string).getTime() - new Date(b.start as string).getTime();
      });
    const map = new Map<string, Slot>();
    for (const slot of sortedSlots) {
      map.set(formatTime(new Date(slot.start as string)), slot);
    }
    return map;
  });

  return (
    <Show when={slots() && questionnaire()} fallback={<div class="loading loading-spinner loading-lg" />}>
      <div class="flex gap-4 p-4" data-testid="scheduler">
        {/* Info panel */}
        <div class="flex flex-col items-center gap-2 p-4 border rounded-lg min-w-[200px]">
          <Show when={actor()}>
            <ResourceAvatar value={actor()!} size="lg" />
            <span class="text-xl font-medium">
              <ResourceName value={actor()!} />
            </span>
          </Show>
          <p class="text-sm text-base-content/70">1 hour</p>
          <Show when={date()}>
            <p class="text-sm">{date()!.toLocaleDateString()}</p>
          </Show>
          <Show when={selectedSlot()}>
            <p class="text-sm font-semibold">{formatTime(new Date(selectedSlot()!.start as string))}</p>
          </Show>
        </div>

        {/* Selection panel */}
        <div class="flex-1">
          {/* Step 1: Select date */}
          <Show when={!date()}>
            <div>
              <h3 class="text-lg font-semibold mb-4">Select date</h3>
              <CalendarInput slots={slots()!} onChangeMonth={setMonth} onClick={setDate} />
            </div>
          </Show>

          {/* Step 2: Select time */}
          <Show when={date() && !selectedSlot()}>
            <div>
              <h3 class="text-lg font-semibold mb-4">Select time</h3>
              <div class="flex flex-col gap-2">
                <For each={Array.from(startTimeToSlotMap()?.entries() ?? [])}>
                  {([startTime, slot]) => (
                    <button
                      type="button"
                      class="btn btn-outline w-36"
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {startTime}
                    </button>
                  )}
                </For>
              </div>
            </div>
          </Show>

          {/* Step 3: Fill out questionnaire */}
          <Show when={date() && selectedSlot() && !response()}>
            <QuestionnaireForm
              questionnaire={questionnaire()!}
              submitButtonText="Next"
              onSubmit={setResponse}
            />
          </Show>

          {/* Step 4: Confirmation */}
          <Show when={date() && selectedSlot() && response()}>
            <div class="text-center py-8">
              <h3 class="text-lg font-semibold text-success">You're all set!</h3>
              <p class="text-base-content/70 mt-2">Check your email for a calendar invite.</p>
            </div>
          </Show>
        </div>
      </div>
    </Show>
  );
}

function getStart(month: Date): string {
  return formatSlotInstant(month.getTime());
}

function getEnd(month: Date): string {
  return formatSlotInstant(month.getTime() + 31 * 24 * 60 * 60 * 1000);
}

function formatSlotInstant(time: number): string {
  const date = new Date(Math.max(Date.now(), time));
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}
