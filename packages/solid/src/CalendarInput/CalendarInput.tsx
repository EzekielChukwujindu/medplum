// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { Slot } from '@medplum/fhirtypes';
import { ChevronLeft, ChevronRight } from 'lucide-solid';
import type { JSX } from 'solid-js';
import { createMemo, createSignal, For, Show } from 'solid-js';
import { Button } from '../Button/Button';
import { getMonthString, getStartMonth } from './CalendarInput.utils';

export interface CalendarInputProps {
  /** Available appointment slots */
  readonly slots: Slot[];
  /** Callback when month changes */
  readonly onChangeMonth: (date: Date) => void;
  /** Callback when a date is clicked */
  readonly onClick: (date: Date) => void;
}

interface CalendarCell {
  readonly date: Date;
  readonly available: boolean;
}

type OptionalCalendarCell = CalendarCell | undefined;

/**
 * CalendarInput displays a monthly calendar for slot scheduling.
 * Highlights available days based on slots.
 * @param props
 */
export function CalendarInput(props: CalendarInputProps): JSX.Element {
  const [month, setMonth] = createSignal<Date>(getStartMonth());

  function moveMonth(delta: number): void {
    const currMonth = month();
    const newMonth = new Date(currMonth.getTime());
    newMonth.setMonth(currMonth.getMonth() + delta);
    props.onChangeMonth(newMonth);
    setMonth(newMonth);
  }

  const grid = createMemo(() => buildGrid(month(), props.slots));

  return (
    <div>
      <div class="flex justify-between items-center gap-2 mb-4">
        <p class="flex-1 font-medium">{getMonthString(month())}</p>
        <div class="flex gap-1">
          <Button 
            onClick={() => moveMonth(-1)} 
            aria-label="Previous month"
            class="btn-sm btn-outline"
          >
            <ChevronLeft class="w-4 h-4" />
          </Button>
          <Button 
            onClick={() => moveMonth(1)} 
            aria-label="Next month"
            class="btn-sm btn-outline"
          >
            <ChevronRight class="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <table class="table table-compact w-full text-center">
        <thead>
          <tr>
            <th>SUN</th>
            <th>MON</th>
            <th>TUE</th>
            <th>WED</th>
            <th>THU</th>
            <th>FRI</th>
            <th>SAT</th>
          </tr>
        </thead>
        <tbody>
          <For each={grid()}>
            {(week) => (
              <tr>
                <For each={week}>
                  {(day) => (
                    <td class="p-1">
                      <Show when={day}>
                        {(d) => (
                          <button
                            type="button"
                            class={`btn btn-sm ${d().available ? 'btn-primary' : 'btn-ghost btn-disabled'}`}
                            disabled={!d().available}
                            onClick={() => props.onClick(d().date)}
                          >
                            {d().date.getDate()}
                          </button>
                        )}
                      </Show>
                    </td>
                  )}
                </For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
}

function buildGrid(startDate: Date, slots: Slot[]): OptionalCalendarCell[][] {
  const d = new Date(startDate.getFullYear(), startDate.getMonth());
  const grid: OptionalCalendarCell[][] = [];
  let row: OptionalCalendarCell[] = [];

  // Fill leading empty days
  for (let i = 0; i < d.getDay(); i++) {
    row.push(undefined);
  }

  while (d.getMonth() === startDate.getMonth()) {
    row.push({
      date: new Date(d.getTime()),
      available: isDayAvailable(d, slots),
    });

    if (d.getDay() === 6) {
      grid.push(row);
      row = [];
    }

    d.setDate(d.getDate() + 1);
  }

  // Fill trailing empty days
  if (d.getDay() !== 0) {
    for (let i = d.getDay(); i < 7; i++) {
      row.push(undefined);
    }
    grid.push(row);
  }

  return grid;
}

/**
 * Returns true if the given date is available for booking.
 * @param day - The day to check.
 * @param slots - The list of available slots.
 * @returns True if there are any available slots for the day.
 */
function isDayAvailable(day: Date, slots: Slot[]): boolean {
  for (const slot of slots) {
    const slotStart = new Date(slot.start as string);
    if (
      slotStart.getFullYear() === day.getFullYear() &&
      slotStart.getMonth() === day.getMonth() &&
      slotStart.getDate() === day.getDate()
    ) {
      return true;
    }
  }
  return false;
}
