// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { getReferenceString } from '@medplum/core';
import type {
  ActivityDefinition,
  PlanDefinition,
  PlanDefinitionAction,
  Questionnaire,
  Reference,
} from '@medplum/fhirtypes';
import { useMedplum, useResource } from '@medplum/solid-hooks';
import { X } from 'lucide-solid';
import type { JSX } from 'solid-js';
import { createEffect, createSignal, For, Show, onCleanup } from 'solid-js';
import { Form } from '../Form/Form';
import { ResourceInput } from '../ResourceInput/ResourceInput';
import { TextInput } from '../TextInput/TextInput';
import { killEvent } from '../utils/dom';

export interface PlanDefinitionBuilderProps {
  /** PlanDefinition resource or reference */
  readonly value: Partial<PlanDefinition> | Reference<PlanDefinition>;
  /** Callback when form is submitted */
  readonly onSubmit: (result: PlanDefinition) => void;
}

/**
 * PlanDefinitionBuilder is a visual editor for building PlanDefinition resources.
 * Supports adding/editing actions with Questionnaire or ActivityDefinition references.
 * @param props
 */
export function PlanDefinitionBuilder(props: PlanDefinitionBuilderProps): JSX.Element | null {
  const medplum = useMedplum();
  const defaultValue = useResource(props.value as Reference<PlanDefinition>);
  const [schemaLoaded, setSchemaLoaded] = createSignal(false);
  const [selectedKey, setSelectedKey] = createSignal<string | undefined>();
  const [hoverKey, setHoverKey] = createSignal<string | undefined>();
  const [value, setValue] = createSignal<PlanDefinition | undefined>();

  function handleDocumentMouseOver(): void {
    setHoverKey(undefined);
  }

  function handleDocumentClick(): void {
    setSelectedKey(undefined);
  }

  createEffect(() => {
    medplum
      .requestSchema('PlanDefinition')
      .then(() => setSchemaLoaded(true))
      .catch(console.log);
  });

  createEffect(() => {
    const def = defaultValue();
    setValue(ensurePlanDefinitionKeys(def ?? { resourceType: 'PlanDefinition', status: 'active' }));
    document.addEventListener('mouseover', handleDocumentMouseOver);
    document.addEventListener('click', handleDocumentClick);
    onCleanup(() => {
      document.removeEventListener('mouseover', handleDocumentMouseOver);
      document.removeEventListener('click', handleDocumentClick);
    });
  });

  function changeProperty(property: string, newValue: unknown): void {
    const current = value();
    if (current) {
      setValue({
        ...current,
        [property]: newValue,
      } as PlanDefinition);
    }
  }

  return (
    <Show when={schemaLoaded() && value()} fallback={<div class="loading loading-spinner loading-lg" />}>
      {(val) => (
        <Form testid="questionnaire-form" onSubmit={() => props.onSubmit(val())}>
          <div class="py-4">
            <TextInput
              label="Plan Title"
              defaultValue={val().title}
              onChange={(value) => changeProperty('title', value)}
            />
          </div>
          <ActionArrayBuilder
            actions={val().action || []}
            selectedKey={selectedKey()}
            setSelectedKey={setSelectedKey}
            hoverKey={hoverKey()}
            setHoverKey={setHoverKey}
            onChange={(x) => changeProperty('action', x)}
          />
          <button type="submit" class="btn btn-primary mt-4">
            Save
          </button>
        </Form>
      )}
    </Show>
  );
}

interface ActionArrayBuilderProps {
  readonly actions: PlanDefinitionAction[];
  readonly selectedKey: string | undefined;
  readonly setSelectedKey: (key: string | undefined) => void;
  readonly hoverKey: string | undefined;
  readonly setHoverKey: (key: string | undefined) => void;
  readonly onChange: (actions: PlanDefinitionAction[]) => void;
}

function ActionArrayBuilder(props: ActionArrayBuilderProps): JSX.Element {
  function changeAction(changedAction: PlanDefinitionAction): void {
    props.onChange(
      props.actions.map((i) => (i.id === changedAction.id ? changedAction : i))
    );
  }

  function addAction(addedAction: PlanDefinitionAction): void {
    props.onChange([...props.actions, addedAction]);
    props.setSelectedKey(addedAction.id);
  }

  function removeAction(removedAction: PlanDefinitionAction): void {
    props.onChange(props.actions.filter((i) => i !== removedAction));
  }

  return (
    <div class="flex flex-col gap-4 p-4 border rounded-lg">
      <For each={props.actions}>
        {(action) => (
          <ActionBuilder
            action={action}
            selectedKey={props.selectedKey}
            setSelectedKey={props.setSelectedKey}
            hoverKey={props.hoverKey}
            setHoverKey={props.setHoverKey}
            onChange={changeAction}
            onRemove={() => removeAction(action)}
          />
        )}
      </For>
      <div>
        <button
          type="button"
          class="btn btn-outline"
          onClick={(e) => {
            killEvent(e);
            addAction({ id: generateId() });
          }}
        >
          Add action
        </button>
      </div>
    </div>
  );
}

interface ActionBuilderProps {
  readonly action: PlanDefinitionAction;
  readonly selectedKey: string | undefined;
  readonly setSelectedKey: (key: string | undefined) => void;
  readonly hoverKey: string | undefined;
  readonly setHoverKey: (key: string | undefined) => void;
  readonly onChange: (action: PlanDefinitionAction) => void;
  readonly onRemove: () => void;
}

function ActionBuilder(props: ActionBuilderProps): JSX.Element {
  function onClick(e: Event): void {
    e.stopPropagation();
    props.setSelectedKey(props.action.id);
  }

  function onHover(e: Event): void {
    killEvent(e);
    props.setHoverKey(props.action.id);
  }

  return (
    <div onClick={onClick} onMouseOver={onHover} onFocus={onHover}>
      <ActionEditor
        action={props.action}
        onChange={props.onChange}
        selectedKey={props.selectedKey}
        hoverKey={props.hoverKey}
        onRemove={props.onRemove}
      />
    </div>
  );
}

interface ActionEditorProps {
  readonly action: PlanDefinitionAction;
  readonly selectedKey: string | undefined;
  readonly hoverKey: string | undefined;
  readonly onChange: (action: PlanDefinitionAction) => void;
  readonly onRemove: () => void;
}

function ActionEditor(props: ActionEditorProps): JSX.Element {
  const medplum = useMedplum();
  const [actionType, setActionType] = createSignal<string | undefined>();
  const [loading, setLoading] = createSignal(false);
  const [resource, setResource] = createSignal<Questionnaire | ActivityDefinition | undefined>();
  
  const editing = () => props.selectedKey === props.action.id;
  const hovering = () => props.hoverKey === props.action.id;

  function changeProperty(property: string, value: unknown): void {
    props.onChange({
      ...props.action,
      [property]: value,
    } as PlanDefinitionAction);
  }

  createEffect(() => {
    async function readResource(): Promise<void> {
      if (!props.action.definitionCanonical) {
        return;
      }
      setLoading(true);
      try {
        const res = await medplum.readCanonical(['Questionnaire', 'ActivityDefinition'], props.action.definitionCanonical);
        setActionType(getInitialActionType(res));
        setResource(res);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    readResource();
  });

  const _actionTypeOptions = [
    { value: 'standard', label: 'Standard task' },
    { value: 'questionnaire', label: 'Task with Questionnaire' },
    { value: 'activitydefinition', label: 'Task with Activity Definition' },
  ];

  return (
    <Show when={!loading()} fallback={<div class="loading loading-spinner loading-sm" />}>
      <div
        data-testid={props.action.id}
        class={`border rounded-lg ${hovering() && !editing() ? 'border-primary' : 'border-base-300'}`}
      >
        {/* Header */}
        <div class="flex items-center gap-4 p-2 bg-base-200">
          <input
            type="text"
            class="input input-sm flex-1"
            name={`actionTitle-${props.action.id}`}
            value={props.action.title ?? ''}
            placeholder="Title"
            onChange={(e) => changeProperty('title', e.currentTarget.value)}
          />
          <button
            type="button"
            class="btn btn-ghost btn-sm btn-circle"
            data-testid="close-button"
            onClick={props.onRemove}
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        {/* Editing form */}
        <Show when={editing()}>
          <div class="flex flex-col gap-4 p-4">
            <div>
              <TextInput
                label="Task Description"
                placeholder="Enter task description"
                name={`actionDescription-${props.action.id}`}
                defaultValue={props.action.description}
                onChange={(value) => changeProperty('description', value)}
              />
            </div>

            <div>
              <div class="form-control">
              <label class="label"><span class="label-text">Type of Action</span></label>
              <select
                class="select select-bordered"
                value={actionType() ?? 'standard'}
                onChange={(e) => {
                  const newValue = e.currentTarget.value;
                  const value = newValue === 'standard' ? undefined : newValue;
                  setActionType(value);
                  props.onChange({
                    ...props.action,
                    definitionCanonical: value === 'standard' ? undefined : props.action.definitionCanonical,
                  });
                }}
              >
                <option value="standard">Standard task</option>
                <option value="questionnaire">Task with Questionnaire</option>
                <option value="activitydefinition">Task with Activity Definition</option>
              </select>
            </div>
            </div>

            <Show when={actionType() === 'questionnaire'}>
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-1">
                  <span class="font-semibold">Select questionnaire</span>
                  <span class="text-error">*</span>
                </div>
                <p class="text-sm text-base-content/70">
                  Questionnaire to be shown in the task in Encounter view. You can create new one from{' '}
                  <a href="/Questionnaire" target="_blank" class="link link-primary">
                    questionnaires list
                  </a>
                </p>
                <ActionResourceTypeBuilder
                  resource={resource()}
                  resourceType="Questionnaire"
                  action={props.action}
                  onChange={props.onChange}
                  placeholder="Search for questionnaire"
                />
              </div>
            </Show>

            <Show when={actionType() === 'activitydefinition'}>
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-1">
                  <span class="font-semibold">Select activity definition</span>
                  <span class="text-error">*</span>
                </div>
                <p class="text-sm text-base-content/70">
                  ActivityDefinition.kind resource to be shown in the task. You can create new one from{' '}
                  <a href="/ActivityDefinition" target="_blank" class="link link-primary">
                    activity definitions list
                  </a>
                </p>
                <ActionResourceTypeBuilder
                  resource={resource()}
                  resourceType="ActivityDefinition"
                  action={props.action}
                  onChange={props.onChange}
                  placeholder="Search for activity definition"
                />
              </div>
            </Show>
          </div>
        </Show>
      </div>
    </Show>
  );
}

interface ActionResourceTypeBuilderProps {
  readonly action: PlanDefinitionAction;
  readonly resource: Questionnaire | ActivityDefinition | undefined;
  readonly resourceType: 'Questionnaire' | 'ActivityDefinition';
  readonly placeholder?: string;
  readonly onChange: (action: PlanDefinitionAction) => void;
}

function ActionResourceTypeBuilder(props: ActionResourceTypeBuilderProps): JSX.Element {
  return (
    <ResourceInput
      name={props.action.id as string}
      placeholder={props.placeholder}
      resourceType={props.resourceType}
      defaultValue={props.resource}
      onChange={(newValue: Questionnaire | ActivityDefinition | undefined) => {
        if (newValue) {
          props.onChange({
            ...props.action,
            definitionCanonical: 'url' in newValue ? newValue.url : undefined,
            definitionUri: !('url' in newValue) ? getReferenceString(newValue) : undefined,
          });
        } else {
          props.onChange({ ...props.action, definitionCanonical: undefined });
        }
      }}
    />
  );
}

function getInitialActionType(resource: Questionnaire | ActivityDefinition | undefined): string | undefined {
  return resource === undefined ? 'standard' : resource.resourceType.toLowerCase();
}

let nextId = 1;

function generateId(existing?: string): string {
  if (existing) {
    if (existing.startsWith('id-')) {
      const existingNum = Number.parseInt(existing.substring(3), 10);
      if (!Number.isNaN(existingNum)) {
        nextId = Math.max(nextId, existingNum + 1);
      }
    }
    return existing;
  }
  return 'id-' + nextId++;
}

function ensurePlanDefinitionKeys(planDefinition: PlanDefinition): PlanDefinition {
  return {
    ...planDefinition,
    action: ensurePlanDefinitionActionKeys(planDefinition.action),
  } as PlanDefinition;
}

function ensurePlanDefinitionActionKeys(
  actions: PlanDefinitionAction[] | undefined
): PlanDefinitionAction[] | undefined {
  if (!actions) {
    return undefined;
  }
  return actions.map((action) => ({
    ...action,
    id: generateId(action.id),
    action: ensurePlanDefinitionActionKeys(action.action),
  }));
}
