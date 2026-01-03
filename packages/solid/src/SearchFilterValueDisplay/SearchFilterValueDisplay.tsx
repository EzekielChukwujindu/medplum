// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { Filter } from '@medplum/core';
import { formatDateTime, getSearchParameterDetails, globalSchema, Operator, SearchParameterType } from '@medplum/core';
import type { JSX } from 'solid-js';
import { ResourceName } from '../ResourceName/ResourceName';

export interface SearchFilterValueDisplayProps {
  readonly resourceType: string;
  readonly filter: Filter;
}

export function SearchFilterValueDisplay(props: SearchFilterValueDisplayProps): JSX.Element {
  // Use createMemo if extensive calc, but here it's mostly render logic. 
  // Accessing globalSchema is direct.

  const searchParam = globalSchema.types[props.resourceType]?.searchParams?.[props.filter.code];

  if (searchParam) {
     if (
      searchParam.type === 'reference' &&
      (props.filter.operator === Operator.EQUALS || props.filter.operator === Operator.NOT_EQUALS)
    ) {
      return <ResourceName value={{ reference: props.filter.value }} link={false} />;
    }

    const searchParamDetails = getSearchParameterDetails(props.resourceType, searchParam);
    if (props.filter.code === '_lastUpdated' || searchParamDetails.type === SearchParameterType.DATETIME) {
      return <>{formatDateTime(props.filter.value)}</>;
    }
  }

  return <>{props.filter.value}</>;
}
