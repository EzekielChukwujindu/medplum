// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { getElementDefinition, isResource as isResourceType } from '@medplum/core';
import type {
  Extension,
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  Reference,
  ResourceType,
  ElementDefinition,
} from '@medplum/fhirtypes';
import {
  getQuestionnaireItemReferenceTargetTypes,
  isChoiceQuestion,
  QUESTIONNAIRE_ITEM_CONTROL_URL,
  QuestionnaireItemType,
  setQuestionnaireItemReferenceTargetTypes,
  useMedplum,
  useResource,
} from '@medplum/solid-hooks';
import { ArrowDown, ArrowUp } from 'lucide-solid';
import type { JSX } from 'solid-js';
import { createEffect, createSignal, For, onCleanup, Show } from 'solid-js';
import { Form } from '../Form/Form';
import { QuestionnaireFormItem } from '../QuestionnaireForm/QuestionnaireFormItem';
import { getValueAndType } from '../ResourcePropertyDisplay/ResourcePropertyDisplay.utils';
import { ResourcePropertyInput } from '../ResourcePropertyInput/ResourcePropertyInput';
import { killEvent } from '../utils/dom';

export interface QuestionnaireBuilderProps {
  /** Questionnaire to edit */
  readonly questionnaire: Partial<Questionnaire> | Reference<Questionnaire>;
  /** Callback when form is submitted */
  readonly onSubmit: (result: Questionnaire) => void;
  /** Auto-save on changes */
  readonly autoSave?: boolean;
}

/**
 * QuestionnaireBuilder is a visual editor for building Questionnaire resources.
 * Allows adding/editing questions, groups, and pages with various answer types.
 * @param props
 */
export function QuestionnaireBuilder(props: QuestionnaireBuilderProps): JSX.Element | null {
  const medplum = useMedplum();
  const defaultValue = useResource(props.questionnaire as Reference<Questionnaire>);
  const [schemaLoaded, setSchemaLoaded] = createSignal(false);
  const [value, setValue] = createSignal<Questionnaire | undefined>();
  const [selectedKey, setSelectedKey] = createSignal<string | undefined>();
  const [hoverKey, setHoverKey] = createSignal<string | undefined>();

  function handleDocumentMouseOver(): void {
    setHoverKey(undefined);
  }

  function handleDocumentClick(): void {
    setSelectedKey(undefined);
  }

  createEffect(() => {
    medplum
      .requestSchema('Questionnaire')
      .then(() => setSchemaLoaded(true))
      .catch(console.log);
  });

  createEffect(() => {
    const def = defaultValue();
    setValue(ensureQuestionnaireKeys(def ?? { resourceType: 'Questionnaire', status: 'active' }));
    document.addEventListener('mouseover', handleDocumentMouseOver);
    document.addEventListener('click', handleDocumentClick);
    onCleanup(() => {
      document.removeEventListener('mouseover', handleDocumentMouseOver);
      document.removeEventListener('click', handleDocumentClick);
    });
  });

  function handleChange(questionnaire: Questionnaire, disableSubmit?: boolean): void {
    setValue(questionnaire);
    if (props.autoSave && !disableSubmit && props.onSubmit) {
      props.onSubmit(questionnaire);
    }
  }

  return (
    <Show when={schemaLoaded() && value()} fallback={<div class="loading loading-spinner loading-lg" />}>
      {(val) => (
        <Form testid="questionnaire-form" onSubmit={() => props.onSubmit(val())}>
          <ItemBuilder
            item={val()}
            selectedKey={selectedKey()}
            setSelectedKey={setSelectedKey}
            hoverKey={hoverKey()}
            setHoverKey={setHoverKey}
            onChange={handleChange}
          />
          <button type="submit" class="btn btn-primary mt-4">
            Save
          </button>
        </Form>
      )}
    </Show>
  );
}

interface ItemBuilderProps<T extends Questionnaire | QuestionnaireItem> {
  readonly item: T;
  readonly selectedKey: string | undefined;
  readonly setSelectedKey: (key: string | undefined) => void;
  readonly hoverKey: string | undefined;
  readonly isFirst?: boolean;
  readonly isLast?: boolean;
  readonly setHoverKey: (key: string | undefined) => void;
  readonly onChange: (item: T, disableSubmit?: boolean) => void;
  readonly onRemove?: () => void;
  readonly onRepeatable?: (item: QuestionnaireItem) => void;
  readonly onMoveUp?: () => void;
  readonly onMoveDown?: () => void;
}

function ItemBuilder<T extends Questionnaire | QuestionnaireItem>(props: ItemBuilderProps<T>): JSX.Element {
  const resource = props.item as Questionnaire;
  const item = props.item as QuestionnaireItem;
  const isResource = isResourceType(props.item);
  const isContainer = isResource || item.type === QuestionnaireItemType.group;
  const linkId = () => item.linkId ?? '[untitled]';
  const editing = () => props.selectedKey === props.item.id;
  const hovering = () => props.hoverKey === props.item.id;

  function onClick(e: Event): void {
    killEvent(e);
    props.setSelectedKey(props.item.id);
  }

  function onHover(e: Event): void {
    killEvent(e);
    props.setHoverKey(props.item.id);
  }

  function changeItem(changedItem: QuestionnaireItem): void {
    props.onChange({
      ...props.item,
      item: props.item.item?.map((i) => (i.id === changedItem.id ? changedItem : i)),
    } as T);
  }

  function addItem(addedItem: QuestionnaireItem, disableSubmit?: boolean): void {
    props.onChange(
      {
        ...props.item,
        item: [...(props.item.item ?? []), addedItem],
      } as T,
      disableSubmit
    );
  }

  function removeItem(removedItem: QuestionnaireItem): void {
    props.onChange({
      ...props.item,
      item: props.item.item?.filter((i) => i !== removedItem),
    } as T);
  }

  function changeProperty(property: string, value: unknown): void {
    props.onChange({
      ...props.item,
      [property]: value,
    } as T);
  }

  function updateItem(updatedItem: QuestionnaireItem): void {
    props.onChange({
      ...props.item,
      ...updatedItem,
    } as T);
  }

  function toggleRepeatable(toggledItem: QuestionnaireItem): void {
    props.onChange({
      ...props.item,
      item: props.item.item?.map((i) => (i === toggledItem ? { ...i, repeats: !i.repeats } : i)),
    } as T);
  }

  function moveItem(itemIndex: number, delta: number): void {
    const updatedItems = reorderItems(props.item.item, itemIndex, delta);
    props.onChange({
      ...props.item,
      item: updatedItems,
    } as T);
  }

  return (
    <div
      data-testid={item.linkId}
      class={`border rounded-lg p-4 mb-4 ${editing() ? 'border-primary bg-primary/5' : hovering() ? 'border-secondary' : 'border-base-300'}`}
      onClick={onClick}
      onMouseOver={onHover}
      onFocus={onHover}
    >
      {/* Main content */}
      <div class="mb-4">
        <Show when={editing()} fallback={
          <>
            <Show when={resource.title}>
              <h2 class="text-2xl font-bold">{resource.title}</h2>
            </Show>
            <Show when={item.text}>
              <div class="whitespace-pre-wrap">{item.text}</div>
            </Show>
            <Show when={!isContainer}>
              <QuestionnaireFormItem item={item} index={0} required={false} responseItem={{ linkId: item.linkId }} />
            </Show>
          </>
        }>
          {/* Editing mode */}
          <Show when={isResource}>
            <input
              type="text"
              class="input input-lg input-bordered w-full"
              value={resource.title ?? ''}
              onBlur={(e) => changeProperty('title', e.currentTarget.value)}
            />
          </Show>
          <Show when={!isResource}>
            <textarea
              class="textarea textarea-bordered w-full"
              rows={2}
              value={item.text ?? ''}
              onBlur={(e) => changeProperty('text', e.currentTarget.value)}
            />
          </Show>
          <Show when={item.type === 'reference'}>
            <ReferenceProfiles item={item} onChange={updateItem} />
          </Show>
          <Show when={isChoiceQuestion(item)}>
            <AnswerBuilder item={item} onChange={updateItem} />
          </Show>
        </Show>
      </div>

      {/* Child items */}
      <For each={props.item.item}>
        {(childItem, i) => (
          <ItemBuilder
            item={childItem}
            selectedKey={props.selectedKey}
            setSelectedKey={props.setSelectedKey}
            hoverKey={props.hoverKey}
            isFirst={i() === 0}
            isLast={i() === (props.item.item ?? []).length - 1}
            setHoverKey={props.setHoverKey}
            onChange={changeItem}
            onRemove={() => removeItem(childItem)}
            onRepeatable={toggleRepeatable}
            onMoveUp={() => moveItem(i(), -1)}
            onMoveDown={() => moveItem(i(), 1)}
          />
        )}
      </For>

      {/* Top actions (link ID and type) */}
      <Show when={!isContainer}>
        <div class="flex gap-2 mb-2">
          <Show when={editing()} fallback={<div class="text-sm text-base-content/70">{linkId()}</div>}>
            <input
              type="text"
              class="input input-xs input-bordered"
              value={item.linkId ?? ''}
              onBlur={(e) => changeProperty('linkId', e.currentTarget.value)}
            />
            <select
              class="select select-xs select-bordered"
              value={item.type ?? 'string'}
              onChange={(e) => changeProperty('type', e.currentTarget.value)}
            >
              <option value="display">Display</option>
              <option value="boolean">Boolean</option>
              <option value="decimal">Decimal</option>
              <option value="integer">Integer</option>
              <option value="date">Date</option>
              <option value="dateTime">Date/Time</option>
              <option value="time">Time</option>
              <option value="string">String</option>
              <option value="text">Text</option>
              <option value="url">URL</option>
              <option value="choice">Choice</option>
              <option value="open-choice">Open Choice</option>
              <option value="attachment">Attachment</option>
              <option value="reference">Reference</option>
              <option value="quantity">Quantity</option>
            </select>
          </Show>
        </div>
      </Show>

      {/* Movement buttons */}
      <Show when={!isResource}>
        <div class="flex gap-1">
          <Show when={!props.isFirst}>
            <button
              type="button"
              class="btn btn-ghost btn-xs"
              onClick={(e) => {
                e.preventDefault();
                props.onMoveUp?.();
              }}
            >
              <ArrowUp class="w-3 h-3" data-testid="up-button" />
            </button>
          </Show>
          <Show when={!props.isLast}>
            <button
              type="button"
              class="btn btn-ghost btn-xs"
              onClick={(e) => {
                e.preventDefault();
                props.onMoveDown?.();
              }}
            >
              <ArrowDown class="w-3 h-3" data-testid="down-button" />
            </button>
          </Show>
        </div>
      </Show>

      {/* Bottom actions */}
      <div class="flex gap-4 mt-4 text-sm">
        <Show when={isContainer}>
          <a
            href="#"
            class="link"
            onClick={(e) => {
              e.preventDefault();
              addItem({
                id: generateId(),
                linkId: generateLinkId('q'),
                type: 'string',
                text: 'Question',
              } as QuestionnaireItem);
            }}
          >
            Add item
          </a>
          <a
            href="#"
            class="link"
            onClick={(e) => {
              e.preventDefault();
              addItem(
                {
                  id: generateId(),
                  linkId: generateLinkId('g'),
                  type: 'group',
                  text: 'Group',
                } as QuestionnaireItem,
                true
              );
            }}
          >
            Add group
          </a>
        </Show>
        <Show when={isResource}>
          <a
            href="#"
            class="link"
            onClick={(e) => {
              e.preventDefault();
              addItem(createPage(), true);
            }}
          >
            Add Page
          </a>
        </Show>
        <Show when={editing() && !isResource}>
          <a
            href="#"
            class="link"
            onClick={(e) => {
              e.preventDefault();
              props.onRepeatable?.(item);
            }}
          >
            {item.repeats ? 'Remove Repeatable' : 'Make Repeatable'}
          </a>
          <a
            href="#"
            class="link link-error"
            onClick={(e) => {
              e.preventDefault();
              props.onRemove?.();
            }}
          >
            Remove
          </a>
        </Show>
      </div>
    </div>
  );
}

interface AnswerBuilderProps {
  readonly item: QuestionnaireItem;
  readonly onChange: (item: QuestionnaireItem) => void;
}

function AnswerBuilder(props: AnswerBuilderProps): JSX.Element {
  const property = () => getElementDefinition('QuestionnaireItemAnswerOption', 'value[x]');
  const options = () => props.item.answerOption ?? [];

  return (
    <div class="mt-4">
      <Show
        when={props.item.answerValueSet === undefined}
        fallback={
          <input
            type="text"
            class="input input-bordered w-full"
            placeholder="Enter Value Set"
            value={props.item.answerValueSet ?? ''}
            onChange={(e) => props.onChange({ ...props.item, answerValueSet: e.target.value })}
          />
        }
      >
        <AnswerOptionsInput
          options={options()}
          property={property()}
          item={props.item}
          onChange={props.onChange}
        />
      </Show>
      <div class="flex gap-4 mt-2">
        <a
          href="#"
          class="link"
          onClick={(e) => {
            killEvent(e);
            props.onChange({
              ...props.item,
              answerValueSet: undefined,
              answerOption: [...options(), { id: generateId() }],
            });
          }}
        >
          Add choice
        </a>
        <a
          href="#"
          class="link"
          onClick={(e) => {
            killEvent(e);
            props.onChange({
              ...props.item,
              answerOption: [],
              answerValueSet: '',
            });
          }}
        >
          Add value set
        </a>
      </div>
    </div>
  );
}

interface AnswerOptionsInputProps {
  readonly options: QuestionnaireItemAnswerOption[];
  readonly property: unknown;
  readonly item: QuestionnaireItem;
  readonly onChange: (item: QuestionnaireItem) => void;
}

function AnswerOptionsInput(props: AnswerOptionsInputProps): JSX.Element {
  return (
    <div class="space-y-2">
      <For each={props.options}>
        {(option) => {
          const [propertyValue, propertyType] = getValueAndType(
            { type: 'QuestionnaireItemAnswerOption', value: option },
            'value'
          );
          return (
            <div class="flex items-center gap-4">
              <div class="flex-1">
                <ResourcePropertyInput
                  name="value[x]"
                  path="Questionnaire.answerOption.value[x]"
                  property={props.property as ElementDefinition}
                  defaultPropertyType={propertyType as string}
                  defaultValue={propertyValue}
                  onChange={(newValue: unknown, propName?: string) => {
                    const newOptions = [...props.options];
                    const index = newOptions.findIndex((o) => o.id === option.id);
                    newOptions[index] = { id: option.id, [propName as string]: newValue };
                    props.onChange({
                      ...props.item,
                      answerOption: newOptions,
                    });
                  }}
                  outcome={undefined}
                />
              </div>
              <a
                href="#"
                class="link link-error text-sm"
                onClick={(e) => {
                  killEvent(e);
                  props.onChange({
                    ...props.item,
                    answerOption: props.options.filter((o) => o.id !== option.id),
                  });
                }}
              >
                Remove
              </a>
            </div>
          );
        }}
      </For>
    </div>
  );
}

interface ReferenceProfilesProps {
  readonly item: QuestionnaireItem;
  readonly onChange: (updatedItem: QuestionnaireItem) => void;
}

function ReferenceProfiles(props: ReferenceProfilesProps): JSX.Element {
  const targetTypes = () => getQuestionnaireItemReferenceTargetTypes(props.item) ?? [];

  return (
    <div class="mt-4 space-y-2">
      <For each={targetTypes()}>
        {(targetType, index) => (
          <div class="flex items-center gap-2">
            <input
              type="text"
              class="input input-sm input-bordered flex-1"
              placeholder="Resource Type"
              value={targetType}
              onChange={(e) => {
                props.onChange(
                  setQuestionnaireItemReferenceTargetTypes(
                    props.item,
                    targetTypes().map((t) => (t === targetType ? (e.currentTarget.value as ResourceType) : t))
                  )
                );
              }}
            />
            <a
              href="#"
              class="link link-error text-sm"
              onClick={(e) => {
                killEvent(e);
                props.onChange(
                  setQuestionnaireItemReferenceTargetTypes(
                    props.item,
                    targetTypes().filter((t) => t !== targetType)
                  )
                );
              }}
            >
              Remove
            </a>
          </div>
        )}
      </For>
      <a
        href="#"
        class="link text-sm"
        onClick={(e) => {
          killEvent(e);
          props.onChange(
            setQuestionnaireItemReferenceTargetTypes(props.item, [...targetTypes(), '' as ResourceType])
          );
        }}
      >
        Add Resource Type
      </a>
    </div>
  );
}

// ID generation utilities
let nextLinkId = 1;
let nextId = 1;

function generateLinkId(prefix: string): string {
  return prefix + nextLinkId++;
}

function generateId(): string {
  return 'id-' + nextId++;
}

function ensureQuestionnaireKeys(questionnaire: Questionnaire): Questionnaire {
  return {
    ...questionnaire,
    id: questionnaire.id || generateId(),
    item: ensureQuestionnaireItemKeys(questionnaire.item),
  } as Questionnaire;
}

function ensureQuestionnaireItemKeys(items: QuestionnaireItem[] | undefined): QuestionnaireItem[] | undefined {
  if (!items) {
    return undefined;
  }
  items.forEach((item) => {
    if (item.id?.match(/^id-\d+$/)) {
      nextId = Math.max(nextId, Number.parseInt(item.id.substring(3), 10) + 1);
    }
    if (item.linkId?.match(/^q\d+$/)) {
      nextLinkId = Math.max(nextLinkId, Number.parseInt(item.linkId.substring(1), 10) + 1);
    }
  });
  return items.map((item) => ({
    ...item,
    id: item.id || generateId(),
    item: ensureQuestionnaireItemKeys(item.item),
    answerOption: ensureQuestionnaireOptionKeys(item.answerOption),
  }));
}

function ensureQuestionnaireOptionKeys(
  options: QuestionnaireItemAnswerOption[] | undefined
): QuestionnaireItemAnswerOption[] | undefined {
  if (!options) {
    return undefined;
  }
  return options.map((option) => ({
    ...option,
    id: option.id || generateId(),
  }));
}

function createPage(): QuestionnaireItem {
  return {
    id: generateId(),
    linkId: generateLinkId('s'),
    type: 'group',
    text: 'New Page',
    extension: [
      {
        url: QUESTIONNAIRE_ITEM_CONTROL_URL,
        valueCodeableConcept: {
          coding: [
            {
              system: 'http://hl7.org/fhir/questionnaire-item-control',
              code: 'page',
            },
          ],
        },
      } as Extension,
    ],
  } as QuestionnaireItem;
}

function reorderItems(items: QuestionnaireItem[] | undefined, itemIndex: number, delta: number): QuestionnaireItem[] {
  const currentItems = items ?? [];
  const newIndex = itemIndex + delta;
  if (newIndex < 0 || newIndex >= currentItems.length) {
    return currentItems;
  }

  const updatedItems = [...currentItems];
  [updatedItems[itemIndex], updatedItems[newIndex]] = [updatedItems[newIndex], updatedItems[itemIndex]];

  return updatedItems;
}
