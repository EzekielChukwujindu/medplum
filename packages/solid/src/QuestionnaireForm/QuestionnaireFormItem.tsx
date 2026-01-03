// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import {
  capitalize,
  deepEquals,
  formatCoding,
  getExtension,
  HTTP_HL7_ORG,
  typedValueToString,
} from '@medplum/core';
import type { TypedValue } from '@medplum/core';
import type {
  Coding,
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  QuestionnaireItemInitial,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
  ValueSet,
  ValueSetExpansionContains,
} from '@medplum/fhirtypes';
import {
  getItemAnswerOptionValue,
  getItemInitialValue,
  getNewMultiSelectValues,
  getQuestionnaireItemReferenceFilter,
  getQuestionnaireItemReferenceTargetTypes,
  QUESTIONNAIRE_ITEM_CONTROL_URL,
  QuestionnaireItemType,
  useMedplum
  
} from '@medplum/solid-hooks';
import type {QuestionnaireFormLoadedState} from '@medplum/solid-hooks';
import type { JSX } from 'solid-js';
import { For, Show, createEffect, createSignal } from 'solid-js';
import { AttachmentInput } from '../AttachmentInput/AttachmentInput';
import { Checkbox, Radio } from '../Checkbox/Checkbox';
import { CheckboxFormSection } from '../CheckboxFormSection/CheckboxFormSection';
import { DateTimeInput } from '../DateTimeInput/DateTimeInput';
import { QuantityInput } from '../QuantityInput/QuantityInput';
import { ReferenceInput } from '../ReferenceInput/ReferenceInput';
import { ValueSetAutocomplete } from '../ValueSetAutocomplete/ValueSetAutocomplete';

const MAX_DISPLAYED_CHECKBOX_RADIO_VALUE_SET_OPTIONS = 30;
const MAX_DISPLAYED_CHECKBOX_RADIO_EXPLICITOPTION_OPTIONS = 50;

export interface QuestionnaireFormItemProps {
  readonly formState?: QuestionnaireFormLoadedState;
  readonly context?: QuestionnaireResponseItem[];
  readonly item: QuestionnaireItem;
  readonly index: number;
  readonly required?: boolean;
  readonly responseItem: QuestionnaireResponseItem;
}

export function QuestionnaireFormItem(props: QuestionnaireFormItemProps): JSX.Element | null {
  const { formState, context, item, responseItem } = props;

  function onChangeAnswer(newResponseAnswer: QuestionnaireResponseItemAnswer[]): void {
    if (formState && context) {
      formState.onChangeAnswer(context, item, newResponseAnswer);
    }
  }

  const type = item.type;
  if (!type) {return null;}

  const name = item.linkId;
  if (!name) {return null;}

  let initial: QuestionnaireItemInitial | undefined = undefined;
  if (item.initial && item.initial.length > 0) {
    initial = item.initial[0];
  } else if (item.answerOption && item.answerOption.length > 0) {
    initial = item.answerOption.find((option) => option.initialSelected);
  }

  const defaultValue = () => getCurrentAnswer(responseItem, props.index) ?? getItemInitialValue(initial);
  const validationError = () => getExtension(
    responseItem,
    `${HTTP_HL7_ORG}/fhir/StructureDefinition/questionnaire-validationError`
  );

  return (
    <>
      <Show when={type === QuestionnaireItemType.display}>
        <p>{item.text}</p>
      </Show>

      <Show when={type === QuestionnaireItemType.boolean}>
        <CheckboxFormSection title={item.text} htmlFor={item.linkId}>
          <Checkbox
            name={item.linkId}
            label={item.text} // CheckboxFormSection handles title, but Checkbox needs label for layout?
            checked={defaultValue()?.value === true}
            onChange={(checked) => onChangeAnswer([{ valueBoolean: checked }])}
          />
        </CheckboxFormSection>
      </Show>

      <Show when={type === QuestionnaireItemType.decimal}>
        <input
          type="number"
          step="any"
          id={name}
          name={name}
          required={props.required ?? item.required}
          value={defaultValue()?.value ?? ''}
          class="input input-bordered w-full"
          onInput={(e) =>
            onChangeAnswer(e.currentTarget.value === '' ? [] : [{ valueDecimal: e.currentTarget.valueAsNumber }])
          }
        />
      </Show>

      <Show when={type === QuestionnaireItemType.integer}>
        <input
          type="number"
          step={1}
          id={name}
          name={name}
          required={props.required ?? item.required}
          value={defaultValue()?.value ?? ''}
          class="input input-bordered w-full"
          onInput={(e) =>
            onChangeAnswer(e.currentTarget.value === '' ? [] : [{ valueInteger: e.currentTarget.valueAsNumber }])
          }
        />
      </Show>

      <Show when={type === QuestionnaireItemType.date}>
        <input
          type="date"
          id={name}
          name={name}
          required={props.required ?? item.required}
          value={defaultValue()?.value ?? ''}
          class="input input-bordered w-full"
          onInput={(e) => onChangeAnswer([{ valueDate: e.currentTarget.value }])}
        />
      </Show>

      <Show when={type === QuestionnaireItemType.dateTime}>
        <DateTimeInput
          name={name}
          required={props.required ?? item.required}
          defaultValue={defaultValue()?.value}
          onChange={(newValue) => onChangeAnswer([{ valueDateTime: newValue }])}
        />
      </Show>

      <Show when={type === QuestionnaireItemType.time}>
        <input
          type="time"
          id={name}
          name={name}
          required={props.required ?? item.required}
          value={defaultValue()?.value ?? ''}
          class="input input-bordered w-full"
          onInput={(e) => onChangeAnswer([{ valueTime: e.currentTarget.value }])}
        />
      </Show>

      <Show when={type === QuestionnaireItemType.string || type === QuestionnaireItemType.url}>
        <input
          type="text"
          id={name}
          name={name}
          required={props.required ?? item.required}
          value={defaultValue()?.value ?? ''}
          class="input input-bordered w-full"
          onInput={(e) => {
            const value = e.currentTarget.value;
            onChangeAnswer(value === '' ? [] : [{ valueString: value }]);
          }}
        />
      </Show>

      <Show when={type === QuestionnaireItemType.text}>
        <textarea
          id={name}
          name={name}
          required={props.required ?? item.required}
          value={defaultValue()?.value ?? ''}
          class="textarea textarea-bordered w-full"
          onInput={(e) => {
             const value = e.currentTarget.value;
             onChangeAnswer(value === '' ? [] : [{ valueString: value }]);
          }}
        />
      </Show>

      <Show when={type === QuestionnaireItemType.attachment}>
        <div class="py-1">
          <AttachmentInput
            name={name}
            defaultValue={defaultValue()?.value}
            onChange={(newValue) => onChangeAnswer([{ valueAttachment: newValue }])}
          />
        </div>
      </Show>

      <Show when={type === QuestionnaireItemType.reference}>
        <ReferenceInput
          name={name}
          required={props.required ?? item.required}
          targetTypes={getQuestionnaireItemReferenceTargetTypes(item)}
          searchCriteria={getQuestionnaireItemReferenceFilter(item, formState?.subject, formState?.encounter)}
          defaultValue={defaultValue()?.value}
          onChange={(newValue) => onChangeAnswer([{ valueReference: newValue }])}
        />
      </Show>

      <Show when={type === QuestionnaireItemType.quantity}>
        <QuantityInput
          name={name}
          path={name}
          required={props.required ?? item.required}
          defaultValue={defaultValue()?.value}
          onChange={(newValue) => onChangeAnswer([{ valueQuantity: newValue }])}
          disableWheel
        />
      </Show>

      <Show when={type === QuestionnaireItemType.choice || type === QuestionnaireItemType.openChoice}>
        {(() => {
           if (isCheckboxChoice(item)) {
             return (
               <QuestionnaireCheckboxInput
                 name={name}
                 item={item}
                 required={props.required ?? item.required}
                 initial={initial}
                 response={responseItem}
                 onChangeAnswer={onChangeAnswer}
               />
             );
           } else if (isDropdownChoice(item) || (item.answerValueSet && !isRadiobuttonChoice(item))) {
             return (
               <QuestionnaireDropdownInput
                 name={name}
                 item={item}
                 required={props.required ?? item.required}
                 initial={initial}
                 response={responseItem}
                 onChangeAnswer={onChangeAnswer}
               />
             );
           } else {
             return (
               <QuestionnaireRadioButtonInput
                 name={name}
                 item={item}
                 required={props.required ?? item.required}
                 initial={initial}
                 response={responseItem}
                 onChangeAnswer={onChangeAnswer}
               />
             );
           }
        })()}
      </Show>

      <Show when={validationError()?.valueString}>
        <div class="text-error text-lg mt-1">
          {validationError()?.valueString}
        </div>
      </Show>
    </>
  );
}

interface QuestionnaireChoiceInputProps {
  readonly name: string;
  readonly item: QuestionnaireItem;
  readonly initial: QuestionnaireItemInitial | undefined;
  readonly required: boolean | undefined;
  readonly response?: QuestionnaireResponseItem;
  readonly onChangeAnswer: (newResponseAnswer: QuestionnaireResponseItemAnswer[]) => void;
}

function QuestionnaireDropdownInput(props: QuestionnaireChoiceInputProps): JSX.Element {
  const { name, item, required, initial, onChangeAnswer, response } = props;

  if (!item.answerOption?.length && !item.answerValueSet) {
    return <NoAnswerDisplay />;
  }

  const initialValue = getItemInitialValue(initial);
  const defaultValue = () => getCurrentAnswer(response) ?? initialValue;
  const currentAnswer = () => getCurrentMultiSelectAnswer(response);
  const isMultiSelect = item.repeats || isMultiSelectChoice(item);

  if (item.answerValueSet) {
    return (
      <ValueSetAutocomplete
        name={name}
        placeholder="Select items"
        binding={item.answerValueSet}
        maxValues={isMultiSelect ? undefined : 1}
        required={required}
        onChange={(values) => {
          if (isMultiSelect) {
            // ValueSetAutocomplete returns Coding[]
            if (values.length === 0) {
              onChangeAnswer([{}]);
            } else {
              onChangeAnswer(values.map((coding) => ({ valueCoding: coding })));
            }
          } else {
             const val = values[0];
             onChangeAnswer(val ? [{ valueCoding: val }] : [{}]);
          }
        }}
        defaultValue={defaultValue()?.value}
      />
    );
  }

  if (isMultiSelect) {
     // Fallback for AnswerOption multiselect - use multiple select
     // Or ideally ValueSetAutocomplete logic if we can mock it? No, binding needs URL.
     // We construct options.
     const options = (item.answerOption ?? []).map((answerOption) => {
        const val = getItemAnswerOptionValue(answerOption);
        const str = typedValueToString(val) || '';
        return { value: str, label: str };
     });
     
     return (
        <select
             multiple
             class="select select-bordered w-full h-auto min-h-[100px]"
             value={currentAnswer() || [typedValueToString(initialValue)]}
             required={required}
             onChange={(e) => {
                 const selectedOptions = Array.from(e.currentTarget.options)
                    .filter(opt => opt.selected)
                    .map(opt => opt.value);
                 
                 if (selectedOptions.length === 0) {
                    onChangeAnswer([{}]);
                    return;
                 }
                 const propName = formatSelectData(item).propertyName;
                 const values = getNewMultiSelectValues(selectedOptions, propName, item);
                 onChangeAnswer(values);
             }}
        >
            <For each={options}>
                {(opt) => <option value={opt.value}>{opt.label}</option>}
            </For>
        </select>
     );
  } else {
     // Native Select
    const options = (item.answerOption ?? []).map((option) => {
        const val = getItemAnswerOptionValue(option);
        return { value: typedValueToString(val) || '', label: typedValueToString(val) || '' };
    });

    return (
      <select
        id={name}
        name={name}
        required={required}
        class="select select-bordered w-full"
        value={formatCoding(defaultValue()?.value) || typedValueToString(defaultValue()?.value) || ''}
        onChange={(e) => {
            const index = e.currentTarget.selectedIndex;
            if (index === 0) {
               onChangeAnswer([{}]);
               return;
            }
            const option = (item.answerOption as QuestionnaireItemAnswerOption[])[index - 1];
            const optionValue = getItemAnswerOptionValue(option);
            const propertyName = 'value' + capitalize(optionValue.type);
            onChangeAnswer([{ [propertyName]: optionValue.value }]);
        }}
      >
        <option value=""></option>
        <For each={options}>
            {(opt) => <option value={opt.value}>{opt.label}</option>}
        </For>
      </select>
    );
  }
}

function QuestionnaireRadioButtonInput(props: QuestionnaireChoiceInputProps): JSX.Element {
  const { name, item, onChangeAnswer, response } = props;
  const [valueSetOptions] = useValueSetOptions(item.answerValueSet); // isLoading handled

  const options = () => {
    const opts: [string, TypedValue][] = [];
    if (item.answerValueSet) {
      opts.push(...getOptionsFromValueSet(valueSetOptions(), name));
    } else if (item.answerOption) {
      const mapped = item.answerOption.slice(0, MAX_DISPLAYED_CHECKBOX_RADIO_EXPLICITOPTION_OPTIONS).map((opt, i) => {
         const optVal = getItemAnswerOptionValue(opt);
         if (!optVal?.value) {return null;}
         return [`${name}-option-${i}`, optVal] as [string, TypedValue];
      }).filter((o): o is [string, TypedValue] => o !== null);
      opts.push(...mapped);
    }
    return opts;
  };

  const defaultAnswer = () => getCurrentAnswer(response);
  const answerLinkId = () => getCurrentRadioAnswer(options(), defaultAnswer());

  // Simple Radio Group using primitives
  return (
    <div class="flex flex-col gap-2">
       <For each={options().slice(0, MAX_DISPLAYED_CHECKBOX_RADIO_VALUE_SET_OPTIONS)}>
         {([optName, optVal]) => (
            <Radio
               name={name}
               value={optName}
               label={
                 typedValueToString(optVal) // Simplified label, ResourcePropertyDisplay might be complex inside label prop?
                 // Actually Checkbox/Radio label prop accepts string | JSX.Element if I typed it that way?
                 // Checkbox props says label?: string.
                 // I should check Checkbox implementation. It renders `span class="label-text">{props.label}</span>`.
                 // So passing string is safe. Passing JSX might compile but TS will complain if interface is string.
                 // let's use typedValueToString for safety.
               }
               checked={optName === answerLinkId()}
               onChange={() => {
                   const propertyName = 'value' + capitalize(optVal.type);
                   onChangeAnswer([{ [propertyName]: optVal.value }]);
               }}
            />
         )}
       </For>
       <Show when={(item.answerValueSet && options().length > MAX_DISPLAYED_CHECKBOX_RADIO_VALUE_SET_OPTIONS) || (item.answerOption && options().length > MAX_DISPLAYED_CHECKBOX_RADIO_EXPLICITOPTION_OPTIONS)}>
           <p class="text-sm text-base-content/50">Showing first {MAX_DISPLAYED_CHECKBOX_RADIO_VALUE_SET_OPTIONS} options</p>
       </Show>
    </div>
  );
}

function QuestionnaireCheckboxInput(props: QuestionnaireChoiceInputProps): JSX.Element {
    const { name, item, onChangeAnswer, response } = props;
    const [valueSetOptions] = useValueSetOptions(item.answerValueSet);

    const initialSelectedValues = () => item.answerValueSet
      ? (response?.answer?.map((a) => a.valueCoding) || []).filter((c): c is Coding => c !== undefined)
      : getCurrentMultiSelectAnswer(response);

    const [selectedValues, setSelectedValues] = createSignal<any[]>([]);
    
    // Initialize
    createEffect(() => {
        setSelectedValues(initialSelectedValues());
    });

    const options = () => {
        const opts: [string, TypedValue][] = [];
        if (item.answerValueSet) {
            opts.push(...getOptionsFromValueSet(valueSetOptions(), name));
        } else if (item.answerOption) {
             const mapped = item.answerOption.slice(0, MAX_DISPLAYED_CHECKBOX_RADIO_EXPLICITOPTION_OPTIONS).map((opt, i) => {
                const optVal = getItemAnswerOptionValue(opt);
                if (!optVal?.value) {return null;}
                return [`${name}-option-${i}`, optVal] as [string, TypedValue];
             }).filter((o): o is [string, TypedValue] => o !== null);
             opts.push(...mapped);
        }
        return opts;
    };

    const handleCheckboxChange = (optionValue: TypedValue, selected: boolean) => {
         // Logic same as React but with signals
         if (item.answerValueSet) {
             const current = selectedValues() as Coding[];
             let newCodings: Coding[];
             if (selected) {
                 newCodings = [...current, optionValue.value as Coding];
             } else {
                 newCodings = current.filter(c => !deepEquals(c, optionValue.value));
             }
             setSelectedValues(newCodings);
             if (newCodings.length === 0) {onChangeAnswer([{}]);}
             else {onChangeAnswer(newCodings.map(c => ({ valueCoding: c })));}
         } else {
             const current = selectedValues() as string[];
             const str = typedValueToString(optionValue) || '';
             let newVals: string[];
             if (selected) {newVals = [...current, str];}
             else {newVals = current.filter(v => v !== str);}

             setSelectedValues(newVals);
             if (newVals.length === 0) {onChangeAnswer([{}]);}
             else {
                 const propName = 'value' + capitalize(optionValue.type);
                 onChangeAnswer(getNewMultiSelectValues(newVals, propName, item));
             }
         }
    };

    return (
        <div class="flex flex-col gap-2">
            <For each={options().slice(0, MAX_DISPLAYED_CHECKBOX_RADIO_VALUE_SET_OPTIONS)}>
                {([optName, optVal]) => {
                    const isChecked = () => item.answerValueSet 
                        ? (selectedValues() as Coding[]).some(c => deepEquals(c, optVal.value))
                        : (selectedValues() as string[]).includes(typedValueToString(optVal) || '');
                    
                    return (
                        <Checkbox
                           name={optName}
                           label={typedValueToString(optVal)}
                           checked={isChecked()}
                           onChange={(checked) => handleCheckboxChange(optVal, checked)}
                        />
                    );
                }}
            </For>
        </div>
    );
}

function NoAnswerDisplay(): JSX.Element {
  return <input type="text" disabled placeholder="No Answers Defined" class="input input-bordered w-full" />;
}

// Helpers
function getCurrentAnswer(response: QuestionnaireResponseItem | undefined, index: number = 0): TypedValue {
  return getItemAnswerOptionValue(response?.answer?.[index] ?? {});
}

function getCurrentMultiSelectAnswer(response: QuestionnaireResponseItem | undefined): string[] {
  const results = response?.answer;
  if (!results) {
    return [];
  }
  const typedValues = results.map((a) => getItemAnswerOptionValue(a));
  return typedValues.map((type) => formatCoding(type?.value) || type?.value).filter(Boolean) as string[];
}

function getCurrentRadioAnswer(options: [string, TypedValue][], defaultAnswer: TypedValue): string | undefined {
  return options.find((option) => deepEquals(option[1].value, defaultAnswer?.value))?.[0];
}

type ChoiceType = 'check-box' | 'drop-down' | 'radio-button' | 'multi-select' | undefined;

function hasChoiceType(item: QuestionnaireItem, type: ChoiceType): boolean {
  return !!item.extension?.some(
    (e) => e.url === QUESTIONNAIRE_ITEM_CONTROL_URL && e.valueCodeableConcept?.coding?.[0]?.code === type
  );
}

function isDropdownChoice(item: QuestionnaireItem): boolean {
  return hasChoiceType(item, 'drop-down');
}

function isCheckboxChoice(item: QuestionnaireItem): boolean {
  return hasChoiceType(item, 'check-box');
}

function isRadiobuttonChoice(item: QuestionnaireItem): boolean {
  return hasChoiceType(item, 'radio-button');
}

function isMultiSelectChoice(item: QuestionnaireItem): boolean {
  return hasChoiceType(item, 'multi-select');
}

interface FormattedData {
  readonly propertyName: string;
}

function formatSelectData(item: QuestionnaireItem): FormattedData {
  if (item.answerOption?.length === 0) {
    return { propertyName: '' };
  }
  const option = (item.answerOption as QuestionnaireItemAnswerOption[])[0];
  const optionValue = getItemAnswerOptionValue(option);
  const propertyName = 'value' + capitalize(optionValue.type);
  return { propertyName };
}

// ValueSet Helpers (simplified from React version to use inline logic or just standard hook usage)
// Note: React version exported getValueSetOptions as well.
function getValueSetOptions(
  valueSetUrl: string | undefined,
  medplum: ReturnType<typeof useMedplum>
): Promise<ValueSetExpansionContains[]> {
  if (!valueSetUrl) {
    return Promise.resolve([]);
  }

  return medplum
    .valueSetExpand({
      url: valueSetUrl,
      count: MAX_DISPLAYED_CHECKBOX_RADIO_VALUE_SET_OPTIONS + 1,
    })
    .then((valueSet: ValueSet) => valueSet.expansion?.contains ?? []);
}

function useValueSetOptions(valueSetUrl: string | undefined): [() => ValueSetExpansionContains[], () => boolean] {
  const medplum = useMedplum();
  const [valueSetOptions, setValueSetOptions] = createSignal<ValueSetExpansionContains[]>([]);
  const [isLoading, setIsLoading] = createSignal(false);

  createEffect(() => {
    async function loadValueSet(): Promise<void> {
      if (!valueSetUrl) {
        return;
      }

      setIsLoading(true);
      try {
        const options = await getValueSetOptions(valueSetUrl, medplum);
        setValueSetOptions(options);
      } catch (err) {
        console.error('Error loading value set:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadValueSet().catch(console.error);
  });

  return [valueSetOptions, isLoading];
}

function getOptionsFromValueSet(valueSetOptions: ValueSetExpansionContains[], name: string): [string, TypedValue][] {
  return valueSetOptions.map((option, i) => {
    const optionName = `${name}-valueset-${i}`;
    const optionValue: TypedValue = {
      type: 'Coding',
      value: {
        system: option.system,
        code: option.code,
        display: option.display,
      },
    };
    return [optionName, optionValue];
  });
}
