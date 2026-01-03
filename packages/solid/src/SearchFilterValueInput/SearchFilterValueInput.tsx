// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { getSearchParameterDetails, SearchParameterType } from '@medplum/core';
import type { Quantity, Reference, SearchParameter } from '@medplum/fhirtypes';
import type { JSX } from 'solid-js';
import { Checkbox } from '../Checkbox/Checkbox';
import { DateTimeInput } from '../DateTimeInput/DateTimeInput';
import { QuantityInput } from '../QuantityInput/QuantityInput';
import { ReferenceInput } from '../ReferenceInput/ReferenceInput';
import { TextInput } from '../TextInput/TextInput';

export interface SearchFilterValueInputProps {
  readonly resourceType: string;
  readonly searchParam: SearchParameter;
  readonly name?: string;
  readonly defaultValue?: string;
  readonly autoFocus?: boolean;
  readonly onChange: (value: string) => void;
}

export function SearchFilterValueInput(props: SearchFilterValueInputProps): JSX.Element | null {
  const details = () => getSearchParameterDetails(props.resourceType, props.searchParam);
  const name = () => props.name ?? 'filter-value';

  return (
    <>
      {(() => {
        const type = details().type;
        switch (type) {
          case SearchParameterType.REFERENCE:
            return (
              <ReferenceInput
                name={name()}
                defaultValue={props.defaultValue ? { reference: props.defaultValue } : undefined}
                targetTypes={props.searchParam.target}
                autoFocus={props.autoFocus}
                onChange={(newReference: Reference | undefined) => {
                  if (newReference) {
                    props.onChange(newReference.reference as string);
                  } else {
                    props.onChange('');
                  }
                }}
              />
            );

          case SearchParameterType.BOOLEAN:
            return (
              <Checkbox
                name={name()}
                testId={name()}
                defaultChecked={props.defaultValue === 'true'}
                onChange={(checked) => props.onChange(checked.toString())}
              />
            );

          case SearchParameterType.DATE:
            return (
              <TextInput
                type="date"
                name={name()}
                testId={name()}
                defaultValue={props.defaultValue}
                autoFocus={props.autoFocus}
                onChange={props.onChange}
              />
            );

          case SearchParameterType.DATETIME:
            return (
              <DateTimeInput
                name={name()}
                defaultValue={props.defaultValue}
                onChange={props.onChange}
              />
            );

          case SearchParameterType.NUMBER:
            return (
              <TextInput
                type="number"
                name={name()}
                testId={name()}
                defaultValue={props.defaultValue}
                autoFocus={props.autoFocus}
                onChange={props.onChange}
              />
            );

          case SearchParameterType.QUANTITY:
            return (
              <QuantityInput
                name={name()}
                path=""
                defaultValue={tryParseQuantity(props.defaultValue)}
                autoFocus={props.autoFocus}
                onChange={(newQuantity: Quantity) => {
                  if (newQuantity) {
                    props.onChange(`${newQuantity.value}${newQuantity.comparator ? ' ' + newQuantity.comparator : ''}`);
                  } else {
                    props.onChange('');
                  }
                }}
              />
            );

          default:
            return (
              <TextInput
                name={name()}
                testId={name()}
                defaultValue={props.defaultValue}
                autoFocus={props.autoFocus}
                onChange={props.onChange}
                placeholder="Search value"
              />
            );
        }
      })()}
    </>
  );
}

function tryParseQuantity(value: string | undefined): Quantity | undefined {
  if (value) {
    const [valueString, systemString, unitString] = value.split('|');
    if (valueString) {
      return {
        value: Number.parseFloat(valueString),
        system: systemString,
        unit: unitString,
      };
    }
  }
  return undefined;
}
