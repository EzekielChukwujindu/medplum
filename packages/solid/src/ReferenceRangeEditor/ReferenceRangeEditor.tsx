// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { formatRange, getCodeBySystem } from '@medplum/core';
import type {
  CodeableConcept,
  ObservationDefinition,
  ObservationDefinitionQualifiedInterval,
} from '@medplum/fhirtypes';
import { CircleMinus, CirclePlus } from 'lucide-solid';
import type { JSX, Setter } from 'solid-js';
import { createEffect, createSignal, For } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';
import { Container } from '../Container/Container';
import { RangeInput } from '../RangeInput/RangeInput';
import { killEvent } from '../utils/dom';

// Properties of qualified intervals used for grouping
const intervalFilters = ['gender', 'age', 'gestationalAge', 'context', 'appliesTo', 'category'] as const;

export interface ReferenceRangeEditorProps {
  readonly definition: ObservationDefinition;
  readonly onSubmit: (result: ObservationDefinition) => void;
}

// Helper type that groups of qualified intervals by equal filter criteria
export type IntervalGroup = {
  id: string;
  filters: Record<string, any>;
  intervals: ObservationDefinitionQualifiedInterval[];
};

const defaultProps: ReferenceRangeEditorProps = {
  definition: {
    resourceType: 'ObservationDefinition',
    code: { text: '' },
  },
  onSubmit: () => {
    return undefined;
  },
};

export function ReferenceRangeEditor(props: ReferenceRangeEditorProps): JSX.Element {
  const mergedProps = () => ({ ...defaultProps, ...props });
  
  const [intervalGroups, setIntervalGroups] = createStore<IntervalGroup[]>([]);
  const [groupId, setGroupId] = createSignal(1);
  const [intervalId, setIntervalId] = createSignal(1);

  createEffect(() => {
    const defaultDefinition = mergedProps().definition;
    const definition = ensureQualifiedIntervalKeys(defaultDefinition, setIntervalId);
    setIntervalGroups(reconcile(groupQualifiedIntervals(definition.qualifiedInterval || [], setGroupId)));
  });

  function submitDefinition(e: Event): void {
      e.preventDefault();
      const defaultDefinition = mergedProps().definition;
    const qualifiedInterval = intervalGroups
      .flatMap((group) => group.intervals)
      .filter((interval) => !isEmptyInterval(interval));
    props.onSubmit({ ...defaultDefinition, qualifiedInterval });
  }

  function addGroup(addedGroup: IntervalGroup): void {
    setIntervalGroups((currentGroups) => [...currentGroups, addedGroup]);
  }

  function removeGroup(removedGroup: IntervalGroup): void {
    setIntervalGroups((currentGroups) => currentGroups.filter((group) => group.id !== removedGroup.id));
  }

  function changeInterval(groupId: string, changedInterval: ObservationDefinitionQualifiedInterval): void {
    setIntervalGroups(
      (group) => group.id === groupId,
      'intervals',
      (interval) => interval.id === changedInterval.id,
      changedInterval
    );
     // Note: If using filter logic that relies on updating intervals, the above only updates the specific interval.
     // The ReferenceRangeGroupFilters uses this to update all intervals when a filter changes.
     // BUT ReferenceRangeGroupFilters calls onChange in a loop!
     // See ReferenceRangeGroupFilters implementation.
  }

  function addInterval(groupId: string, addedInterval: ObservationDefinitionQualifiedInterval): void {
    if (addedInterval.id === undefined) {
      addedInterval.id = `id-${intervalId()}`;
      setIntervalId((id) => id + 1);
    }
    
    // Check if we need to merge filters - existing logic does this.
    // We need to find the group and append.
    const groupIndex = intervalGroups.findIndex((g) => g.id === groupId);
    if (groupIndex !== -1) {
       const group = intervalGroups[groupIndex];
       addedInterval = { ...addedInterval, ...group.filters };
       setIntervalGroups(groupIndex, 'intervals', (intervals) => [...intervals, addedInterval]);
    }
  }

  function removeInterval(groupId: string, removedInterval: ObservationDefinitionQualifiedInterval): void {
     setIntervalGroups(
      (group) => group.id === groupId,
      'intervals',
      (intervals) => intervals.filter((interval) => interval.id !== removedInterval.id)
    );
  }

  const unit = () => getUnitString(mergedProps().definition.quantitativeDetails?.unit);

  return (
    <form data-testid="reference-range-editor" onSubmit={submitDefinition}>
      <div class="flex flex-col gap-4">
        <For each={intervalGroups}>
          {(intervalGroup) => (
            <ReferenceRangeGroupEditor
              unit={unit()}
              onChange={changeInterval}
              onAdd={addInterval}
              onRemove={removeInterval}
              onRemoveGroup={removeGroup}
              intervalGroup={intervalGroup}
            />
          )}
        </For>
      </div>
      <button
        class="btn btn-ghost btn-sm gap-2 mt-2"
        title="Add Group"
        onClick={(e: MouseEvent) => {
          killEvent(e);
          addGroup({ id: `group-id-${groupId()}`, filters: {} as IntervalGroup['filters'], intervals: [] });
          setGroupId((id) => id + 1);
        }}
        type="button"
      >
        <CirclePlus class="h-4 w-4" />
      </button>

      <div class="flex justify-end mt-4">
        <button class="btn btn-primary" type="submit">Save</button>
      </div>
    </form>
  );
}

export interface ReferenceRangeGroupEditorProps {
  readonly intervalGroup: IntervalGroup;
  readonly unit: string | undefined;
  readonly onChange: (groupId: string, changed: ObservationDefinitionQualifiedInterval) => void;
  readonly onAdd: (groupId: string, added: ObservationDefinitionQualifiedInterval) => void;
  readonly onRemove: (groupId: string, removed: ObservationDefinitionQualifiedInterval) => void;
  readonly onRemoveGroup: (removedGroup: IntervalGroup) => void;
}

export function ReferenceRangeGroupEditor(props: ReferenceRangeGroupEditorProps): JSX.Element {
  const { intervalGroup, unit } = props;
  return (
    <Container data-testid={intervalGroup.id}> // classes.section
      <div class="flex flex-col gap-4">
        <div class="flex justify-end">
          <button
            class="btn btn-ghost btn-sm btn-square text-base-content/60"
            title="Remove Group"
            data-testid={`remove-group-button-${intervalGroup.id}`}
             onClick={(e: MouseEvent) => {
              killEvent(e);
              props.onRemoveGroup(intervalGroup);
            }}
             type="button"
          >
            <CircleMinus class="h-4 w-4" />
          </button>
        </div>
        <ReferenceRangeGroupFilters intervalGroup={intervalGroup} onChange={props.onChange} />
        <div class="divider my-0" />
        <For each={intervalGroup.intervals}>
            {(interval) => (
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                  <div class="form-control w-full max-w-xs">
                     <label class="label" for={`condition-${interval.id}`}>
                         <span class="label-text">Condition:</span>
                     </label>
                    <input
                        type="text"
                        id={`condition-${interval.id}`}
                        class="input input-bordered input-sm w-full"
                        data-testid={`condition-${interval.id}`}
                        value={interval.condition || ''}
                        onChange={(e) => {
                            props.onChange(intervalGroup.id, { ...interval, condition: e.currentTarget.value.trim() });
                        }}
                    />
                  </div>
                  <button
                    class="btn btn-ghost btn-sm btn-square mt-8 text-base-content/60"
                    title="Remove Interval"
                    data-testid={`remove-interval-${interval.id}`}
                    onClick={(e: MouseEvent) => {
                      killEvent(e);
                      props.onRemove(intervalGroup.id, interval);
                    }}
                     type="button"
                  >
                    <CircleMinus class="h-4 w-4" />
                  </button>
                </div>
    
                <RangeInput
                  path=""
                  // onChange={(range) => {
                  //   props.onChange(intervalGroup.id, { ...interval, range });
                  // }}
                  // Solid RangeInput has onChange that passes arguments
                  onChange={(range: any) => {
                     props.onChange(intervalGroup.id, { ...interval, range });
                  }}
                  name={`range-${interval.id}`}
                  defaultValue={interval.range}
                />
              </div>
            )}
        </For>
        <button
          class="btn btn-ghost btn-sm gap-2"
          title="Add Interval"
          onClick={(e: MouseEvent) => {
            killEvent(e);
            props.onAdd(intervalGroup.id, {
              range: {
                low: { unit },
                high: { unit },
              },
            });
          }}
          type="button"
        >
          <CirclePlus class="h-4 w-4" />
        </button>
      </div>
    </Container>
  );
}

interface ReferenceRangeGroupFiltersProps {
  readonly intervalGroup: IntervalGroup;
  readonly onChange: ReferenceRangeGroupEditorProps['onChange'];
}

function ReferenceRangeGroupFilters(props: ReferenceRangeGroupFiltersProps): JSX.Element {
  const { intervalGroup, onChange } = props;

  // Calculate default age filter for display
  const defaultAgeFilter = {
    low: {
      unit: 'years',
      system: 'http://unitsofmeasure.org',
      ...intervalGroup.filters.age?.low,
    },
    high: {
      unit: 'years',
      system: 'http://unitsofmeasure.org',
      ...intervalGroup.filters.age?.high,
    },
  };

  return (
    <div class="flex flex-col gap-2 w-1/2">
      <div class="form-control w-full">
        <label class="label" for={`gender-${intervalGroup.id}`}>
             <span class="label-text">Gender:</span>
        </label>
        <select
          id={`gender-${intervalGroup.id}`}
          class="select select-bordered select-sm w-full"
          value={intervalGroup.filters.gender || ''}
          onChange={(e) => {
            const intervalsToUpdate = [...intervalGroup.intervals];
            for (const interval of intervalsToUpdate) {
              let newGender: string | undefined = e.currentTarget.value;
              if (newGender === '') {
                newGender = undefined;
              }
              onChange(intervalGroup.id, {
                ...interval,
                gender: newGender as ObservationDefinitionQualifiedInterval['gender'],
              });
            }
          }}
        >
            <option value=""></option>
            <option value="male">male</option>
            <option value="female">female</option>
        </select>
      </div>
      
      <div class="flex gap-2 items-center">
        <label class="label whitespace-nowrap" for={`div-age-${intervalGroup.id}`}>
             Age:
        </label>
        <div id={`div-age-${intervalGroup.id}`} class="flex-grow">
          <RangeInput
            path=""
            name={`age-${intervalGroup.id}`}
            defaultValue={defaultAgeFilter}
            onChange={(ageRange: any) => {
              const intervalsToUpdate = [...intervalGroup.intervals];
              for (const interval of intervalsToUpdate) {
                onChange(intervalGroup.id, { ...interval, age: ageRange });
              }
            }}
          />
        </div>
      </div>
      
      <div class="form-control w-full">
        <label class="label" for={`context-${intervalGroup.id}`}>
             <span class="label-text">Endocrine:</span>
        </label>
        <select
             id={`context-${intervalGroup.id}`}
             class="select select-bordered select-sm w-full"
             value={intervalGroup.filters.context?.text || ''}
             onChange={(e) => {
                const val = e.currentTarget.value;
                const intervalsToUpdate = [...intervalGroup.intervals];
                for (const interval of intervalsToUpdate) {
                    if (val === '') {
                         onChange(intervalGroup.id, { ...interval, context: undefined });
                    } else {
                         onChange(intervalGroup.id, {
                           ...interval,
                           context: {
                             text: val,
                             coding: [
                               { code: val, system: 'http://terminology.hl7.org/CodeSystem/referencerange-meaning' },
                             ],
                           },
                         });
                    }
                }
             }}
        >
             <option value=""></option>
             <option value="pre-puberty">pre-puberty</option>
             <option value="follicular">follicular</option>
             <option value="midcycle">midcycle</option>
             <option value="luteal">luteal</option>
             <option value="postmenopausal">postmenopausal</option>
        </select>
      </div>

       <div class="form-control w-full">
        <label class="label" for={`category-${intervalGroup.id}`}>
             <span class="label-text">Category:</span>
        </label>
         <select
             id={`category-${intervalGroup.id}`}
             class="select select-bordered select-sm w-full"
             aria-label="Category:"
             value={intervalGroup.filters.category || ''}
              onChange={(e) => {
                const val = e.currentTarget.value;
                const intervalsToUpdate = [...intervalGroup.intervals];
                 for (const interval of intervalsToUpdate) {
                    if (val === '') {
                         onChange(intervalGroup.id, { ...interval, category: undefined });
                    } else {
                         onChange(intervalGroup.id, {
                          ...interval,
                          category: val as 'reference' | 'critical' | 'absolute',
                        });
                    }
                 }
              }}
         >
             <option value=""></option>
             <option value="reference">reference</option>
             <option value="critical">critical</option>
             <option value="absolute">absolute</option>
         </select>
      </div>
    </div>
  );
}

function ensureQualifiedIntervalKeys(
  definition: ObservationDefinition,
  setIntervalId: Setter<number>
): ObservationDefinition {
  const intervals = definition.qualifiedInterval || [];
  let nextId =
    Math.max(
      ...intervals.map((interval) => {
        const existingNum = Number.parseInt(interval.id?.substring(3) || '', 10);
        return !Number.isNaN(existingNum) ? existingNum : Number.NEGATIVE_INFINITY;
      })
    ) + 1;

  if (!Number.isFinite(nextId)) {
    nextId = 1;
  }

  definition = {
    ...definition,
    qualifiedInterval: intervals.map((interval) => ({
      ...interval,
      id: interval.id || `id-${nextId++}`,
    })),
  };
  setIntervalId(nextId);
  return definition;
}

function groupQualifiedIntervals(
  intervals: ObservationDefinitionQualifiedInterval[],
  setGroupId: Setter<number>
): IntervalGroup[] {
  let groupId = 1;
  const groups: Record<string, IntervalGroup> = {};
  for (const interval of intervals) {
    const groupKey = generateGroupKey(interval);
    if (!(groupKey in groups)) {
      groups[groupKey] = {
        id: `group-id-${groupId++}`,
        filters: Object.fromEntries(intervalFilters.map((f) => [f, interval[f]])) as Record<string, any>, // cast to any for Record<string, any>
        intervals: [],
      };
    }
    groups[groupKey].intervals.push(interval);
  }
  setGroupId(groupId);
  return Object.values(groups);
}

function generateGroupKey(interval: ObservationDefinitionQualifiedInterval): string {
  const results = [
    `gender=${interval.gender}`,
    `age=${formatRange(interval.age)}`,
    `gestationalAge=${formatRange(interval.gestationalAge)}`,
    `context=${interval.context?.text}`,
    `appliesTo=${interval.appliesTo?.map((c) => c.text).join('+')}`,
    `category=${interval.category}`,
  ];

  return results.join(':');
}

function getUnitString(unit: CodeableConcept | undefined): string | undefined {
  return unit && (getCodeBySystem(unit, 'http://unitsofmeasure.org') || unit.text);
}

function isEmptyInterval(interval: ObservationDefinitionQualifiedInterval): boolean {
  return interval.range?.low?.value === undefined && interval.range?.high?.value === undefined;
}
