// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { formatTiming } from '@medplum/core';
import type { Timing, TimingRepeat } from '@medplum/fhirtypes';
import { Pencil, Plus, Trash2 } from 'lucide-solid';
import type { JSX } from 'solid-js';
import { createSignal, For, Show } from 'solid-js';
import { Button } from '../Button/Button';
import { DateTimeInput } from '../DateTimeInput/DateTimeInput';
import { FormSection } from '../FormSection/FormSection';
import { Modal } from '../Modal/Modal';
import { NativeSelect } from '../NativeSelect/NativeSelect';
import { Switch } from '../Switch/Switch';
import { TextInput } from '../TextInput/TextInput';

const daysOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
type DayOfWeek = (typeof daysOfWeek)[number];
type PeriodUnit = 'a' | 's' | 'min' | 'h' | 'd' | 'wk' | 'mo';

const periodUnitOptions = [
  { label: 'minute', value: 'min' },
  { label: 'hour', value: 'h' },
  { label: 'day', value: 'd' },
  { label: 'week', value: 'wk' },
  { label: 'month', value: 'mo' },
  { label: 'year', value: 'a' },
];

export interface TimingInputProps {
  /** Input name */
  readonly name?: string;
  /** Default timing value */
  readonly defaultValue?: Timing;
  /** Callback when timing changes */
  readonly onChange?: (value: Timing | undefined) => void;
  /** Whether input is disabled */
  readonly disabled?: boolean;
  /** Whether modal is open by default */
  readonly defaultModalOpen?: boolean;
  /** Test ID */
  readonly testId?: string;
}

const defaultTimingValue: Timing = {
  repeat: {
    period: 1,
    periodUnit: 'd',
  },
};

/**
 * TimingInput allows editing FHIR Timing values for medication schedules.
 * Opens a modal dialog for complex editing.
 * @param props
 */
export function TimingInput(props: TimingInputProps): JSX.Element {
  const [value, setValue] = createSignal<Timing | undefined>(props.defaultValue);
  const [open, setOpen] = createSignal(!props.disabled && (props.defaultModalOpen ?? false));

  return (
    <div data-testid={props.testId}>
      <div class="flex items-center gap-2">
        <span data-testid="timinginput-display" class="flex-1">
          {formatTiming(value()) || 'No repeat'}
        </span>
        <Button 
          disabled={props.disabled} 
          onClick={() => setOpen(true)}
          class="btn-sm"
        >
          <Pencil class="w-4 h-4 mr-1" />
          Edit
        </Button>
      </div>
      
      <Show when={!props.disabled}>
        <TimingEditorDialog
          visible={open()}
          defaultValue={value()}
          onOk={(newValue) => {
            setValue(newValue);
            if (props.onChange) {
              props.onChange(newValue);
            }
            setOpen(false);
          }}
          onCancel={() => setOpen(false)}
        />
      </Show>
    </div>
  );
}

interface TimingEditorDialogProps {
  readonly visible: boolean;
  readonly defaultValue?: Timing;
  readonly onOk: (newValue: Timing) => void;
  readonly onCancel: () => void;
}

function TimingEditorDialog(props: TimingEditorDialogProps): JSX.Element {
  const [value, setValue] = createSignal<Timing>(props.defaultValue || defaultTimingValue);
  const [timeOfDayItems, setTimeOfDayItems] = createSignal<string[]>(
    props.defaultValue?.repeat?.timeOfDay ?? []
  );

  function setStart(newStart: string): void {
    setValue((v) => ({ ...v, event: [newStart] }));
  }

  function setRepeat(repeat: TimingRepeat | undefined): void {
    setValue((v) => ({ ...v, repeat }));
  }

  function setPeriod(period: number | undefined): void {
    setValue((v) => ({ ...v, repeat: { ...v.repeat, period } }));
  }

  function setPeriodUnit(periodUnit: string): void {
    setValue((v) => ({ ...v, repeat: { ...v.repeat, periodUnit: periodUnit as PeriodUnit } }));
  }

  function toggleDayOfWeek(day: DayOfWeek): void {
    setValue((v) => {
      const current = v.repeat?.dayOfWeek ?? [];
      const newDays = current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day];
      return { ...v, repeat: { ...v.repeat, dayOfWeek: newDays.length ? newDays : undefined } };
    });
  }

  function addTimeOfDay(): void {
    const newItems = [...timeOfDayItems(), '00:00:00'];
    setTimeOfDayItems(newItems);
    setValue((v) => ({ ...v, repeat: { ...v.repeat, timeOfDay: newItems } }));
  }

  function updateTimeOfDay(index: number, newValue: string): void {
    const newItems = timeOfDayItems().with(index, `${newValue}:00`);
    setTimeOfDayItems(newItems);
    setValue((v) => ({ ...v, repeat: { ...v.repeat, timeOfDay: newItems } }));
  }

  function removeTimeOfDay(index: number): void {
    const newItems = timeOfDayItems().filter((_, i) => i !== index);
    setTimeOfDayItems(newItems);
    setValue((v) => ({ 
      ...v, 
      repeat: { ...v.repeat, timeOfDay: newItems.length ? newItems : undefined } 
    }));
  }

  return (
    <Modal
      title="Timing"
      open={props.visible}
      onClose={props.onCancel}
    >
      <div class="space-y-4">
        <FormSection title="Starts on" htmlFor="timing-dialog-start">
          <DateTimeInput
            name="timing-dialog-start"
            onChange={setStart}
          />
        </FormSection>

        <Switch
          label="Repeat"
          checked={!!value().repeat}
          onChange={(checked) => setRepeat(checked ? defaultTimingValue.repeat : undefined)}
        />

        <Show when={value().repeat}>
          <FormSection title="Repeat every" htmlFor="timing-dialog-period">
            <div class="flex gap-2">
              <TextInput
                type="number"
                name="timing-dialog-period"
                value={String(value().repeat?.period ?? 1)}
                onChange={(v) => setPeriod(Number.parseInt(v, 10) || 1)}
                class="w-20"
              />
              <NativeSelect
                name="timing-dialog-periodUnit"
                value={value().repeat?.periodUnit}
                onChange={setPeriodUnit}
                data={periodUnitOptions}
              />
            </div>
          </FormSection>

          <Show when={value().repeat?.periodUnit === 'wk'}>
            <FormSection title="Repeat on">
              <div class="flex flex-wrap gap-1 mt-2">
                <For each={[...daysOfWeek]}>
                  {(day) => {
                    const isSelected = () => value().repeat?.dayOfWeek?.includes(day) ?? false;
                    return (
                      <button
                        type="button"
                        class={`btn btn-sm btn-circle ${isSelected() ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => toggleDayOfWeek(day)}
                      >
                        {day.charAt(0).toUpperCase()}
                      </button>
                    );
                  }}
                </For>
              </div>
            </FormSection>
          </Show>

          <FormSection title="At times">
            <div class="space-y-2 mt-2">
              <For each={timeOfDayItems()}>
                {(time, index) => (
                  <div class="flex gap-2 items-center">
                    <input
                      type="time"
                      class="input input-bordered input-sm flex-1"
                      value={time.slice(0, 5)}
                      onChange={(e) => updateTimeOfDay(index(), e.currentTarget.value)}
                    />
                    <button
                      type="button"
                      class="btn btn-ghost btn-sm btn-square"
                      onClick={() => removeTimeOfDay(index())}
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                )}
              </For>
              <button
                type="button"
                class="btn btn-ghost btn-sm gap-1"
                onClick={addTimeOfDay}
              >
                <Plus class="w-4 h-4" />
                Add Time
              </button>
            </div>
          </FormSection>
        </Show>

        <div class="flex justify-end gap-2 pt-4">
          <Button onClick={props.onCancel} class="btn-ghost">
            Cancel
          </Button>
          <Button onClick={() => props.onOk(value())}>
            OK
          </Button>
        </div>
      </div>
    </Modal>
  );
}
