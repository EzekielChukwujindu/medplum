// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { Filter, InternalSchemaElement, SearchRequest } from '@medplum/core';
import { capitalize, DEFAULT_SEARCH_COUNT, evalFhirPathTyped, formatDateTime, Operator } from '@medplum/core';
import type { Resource, SearchParameter } from '@medplum/fhirtypes';
import type { JSX } from 'solid-js';
import { For } from 'solid-js';
import { MedplumLink } from '../MedplumLink/MedplumLink';
import { ResourcePropertyDisplay } from '../ResourcePropertyDisplay/ResourcePropertyDisplay';
import { getValueAndType } from '../ResourcePropertyDisplay/ResourcePropertyDisplay.utils';
import type { SearchControlField } from './SearchControlField';

const searchParamToOperators: Record<string, Operator[]> = {
  string: [Operator.EQUALS, Operator.NOT, Operator.CONTAINS, Operator.EXACT],
  fulltext: [Operator.EQUALS, Operator.NOT, Operator.CONTAINS, Operator.EXACT],
  token: [Operator.EQUALS, Operator.NOT],
  reference: [Operator.EQUALS, Operator.NOT],
  numeric: [
    Operator.EQUALS,
    Operator.NOT_EQUALS,
    Operator.GREATER_THAN,
    Operator.LESS_THAN,
    Operator.GREATER_THAN_OR_EQUALS,
    Operator.LESS_THAN_OR_EQUALS,
  ],
  quantity: [
    Operator.EQUALS,
    Operator.NOT_EQUALS,
    Operator.GREATER_THAN,
    Operator.LESS_THAN,
    Operator.GREATER_THAN_OR_EQUALS,
    Operator.LESS_THAN_OR_EQUALS,
  ],
  date: [
    Operator.EQUALS,
    Operator.NOT_EQUALS,
    Operator.GREATER_THAN,
    Operator.LESS_THAN,
    Operator.GREATER_THAN_OR_EQUALS,
    Operator.LESS_THAN_OR_EQUALS,
    Operator.STARTS_AFTER,
    Operator.ENDS_BEFORE,
    Operator.APPROXIMATELY,
  ],
  datetime: [
    Operator.EQUALS,
    Operator.NOT_EQUALS,
    Operator.GREATER_THAN,
    Operator.LESS_THAN,
    Operator.GREATER_THAN_OR_EQUALS,
    Operator.LESS_THAN_OR_EQUALS,
    Operator.STARTS_AFTER,
    Operator.ENDS_BEFORE,
    Operator.APPROXIMATELY,
  ],
  uri: [Operator.EQUALS, Operator.NOT, Operator.ABOVE, Operator.BELOW],
};

const operatorNames: Record<Operator, string> = {
  eq: 'equals',
  ne: 'not equals',
  gt: 'greater than',
  lt: 'less than',
  ge: 'greater than or equals',
  le: 'less than or equals',
  sa: 'starts after',
  eb: 'ends before',
  ap: 'approximately',
  sw: 'starts with',
  contains: 'contains',
  exact: 'exact',
  text: 'text',
  not: 'not',
  above: 'above',
  below: 'below',
  in: 'in',
  'not-in': 'not in',
  'of-type': 'of type',
  missing: 'missing',
  present: 'present',
  identifier: 'identifier',
  iterate: 'iterate',
};

export function setFilters(definition: SearchRequest, filters: Filter[]): SearchRequest {
  return {
    ...definition,
    filters: filters,
    offset: 0,
    name: undefined,
  };
}

export function clearFilters(definition: SearchRequest): SearchRequest {
  return setFilters(definition, []);
}

export function clearFiltersOnField(definition: SearchRequest, code: string): SearchRequest {
  return setFilters(
    definition,
    (definition.filters ?? []).filter((f) => f.code !== code)
  );
}

export function addFilter(
  definition: SearchRequest,
  field: string,
  op: Operator,
  value?: string,
  opt_clear?: boolean
): SearchRequest {
  if (opt_clear) {
    definition = clearFiltersOnField(definition, field);
  }

  const nextFilters: Filter[] = [];
  if (definition.filters) {
    nextFilters.push(...definition.filters);
  }
  nextFilters.push({ code: field, operator: op, value: value ?? '' });

  return setFilters(definition, nextFilters);
}

export function addField(definition: SearchRequest, field: string): SearchRequest {
  if (definition.fields?.includes(field)) {
    return definition;
  }
  const newFields = [];
  if (definition.fields) {
    newFields.push(...definition.fields);
  }
  newFields.push(field);
  return {
    ...definition,
    fields: newFields,
    name: undefined,
  };
}

export function deleteFilter(definition: SearchRequest, index: number): SearchRequest {
  if (!definition.filters) {
    return definition;
  }
  const newFilters = [...definition.filters];
  newFilters.splice(index, 1);
  return {
    ...definition,
    filters: newFilters,
    name: undefined,
  };
}

export function addDayFilter(definition: SearchRequest, field: string, delta: number): SearchRequest {
  const startTime = new Date();
  startTime.setDate(startTime.getDate() + delta);
  startTime.setHours(0, 0, 0, 0);

  const endTime = new Date(startTime.getTime());
  endTime.setDate(endTime.getDate() + 1);
  endTime.setTime(endTime.getTime() - 1);

  return addDateFilterBetween(definition, field, startTime, endTime);
}

export function addYesterdayFilter(definition: SearchRequest, field: string): SearchRequest {
  return addDayFilter(definition, field, -1);
}

export function addTodayFilter(definition: SearchRequest, field: string): SearchRequest {
  return addDayFilter(definition, field, 0);
}

export function addTomorrowFilter(definition: SearchRequest, field: string): SearchRequest {
  return addDayFilter(definition, field, 1);
}

export function addNext24HoursFilter(definition: SearchRequest, field: string): SearchRequest {
  const now = new Date();
  const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return addDateFilterBetween(definition, field, now, endTime);
}

export function addMonthFilter(definition: SearchRequest, field: string, delta: number): SearchRequest {
  const startTime = new Date();
  startTime.setMonth(startTime.getMonth() + delta);
  startTime.setDate(1);
  startTime.setHours(0, 0, 0, 0);

  const endTime = new Date(startTime.getTime());
  endTime.setMonth(endTime.getMonth() + 1);
  endTime.setDate(1);
  endTime.setHours(0, 0, 0, 0);
  endTime.setTime(endTime.getTime() - 1);

  return addDateFilterBetween(definition, field, startTime, endTime);
}

export function addLastMonthFilter(definition: SearchRequest, field: string): SearchRequest {
  return addMonthFilter(definition, field, -1);
}

export function addThisMonthFilter(definition: SearchRequest, field: string): SearchRequest {
  return addMonthFilter(definition, field, 0);
}

export function addNextMonthFilter(definition: SearchRequest, field: string): SearchRequest {
  return addMonthFilter(definition, field, 1);
}

export function addYearToDateFilter(definition: SearchRequest, field: string): SearchRequest {
  const startTime = new Date();
  startTime.setMonth(0);
  startTime.setDate(1);
  startTime.setHours(0, 0, 0, 0);

  const endTime = new Date();

  return addDateFilterBetween(definition, field, startTime, endTime);
}

export function addDateFilterBetween(definition: SearchRequest, field: string, d1: Date, d2: Date): SearchRequest {
  definition = clearFiltersOnField(definition, field);
  definition = addDateFilterImpl(definition, field, Operator.GREATER_THAN_OR_EQUALS, d1);
  definition = addDateFilterImpl(definition, field, Operator.LESS_THAN_OR_EQUALS, d2);
  return definition;
}

function addDateFilterImpl(definition: SearchRequest, field: string, op: Operator, value: Date): SearchRequest {
  return addFilter(definition, field, op, value.toISOString());
}

export function addMissingFilter(definition: SearchRequest, field: string, value = true): SearchRequest {
  return addFilter(definition, field, Operator.MISSING, value.toString());
}

export function setOffset(definition: SearchRequest, offset: number): SearchRequest {
  if (definition.offset === offset) {
    return definition;
  }
  return {
    ...definition,
    offset,
    name: undefined,
  };
}

export function setPage(definition: SearchRequest, page: number): SearchRequest {
  const count = definition.count ?? DEFAULT_SEARCH_COUNT;
  const newOffset = (page - 1) * count;
  return setOffset(definition, newOffset);
}

export function setSort(definition: SearchRequest, sort: string, desc?: boolean): SearchRequest {
  if (sort === getSortField(definition) && desc !== undefined && desc === isSortDescending(definition)) {
    return definition;
  }
  return {
    ...definition,
    sortRules: [
      {
        code: sort,
        descending: !!desc,
      },
    ],
    name: undefined,
  };
}

export function toggleSort(definition: SearchRequest, key: string): SearchRequest {
  let desc = false;
  if (getSortField(definition) === key) {
    desc = !isSortDescending(definition);
  }
  return setSort(definition, key, desc);
}

export function getSortField(definition: SearchRequest): string | undefined {
  const sortRules = definition.sortRules;
  if (!sortRules || sortRules.length === 0) {
    return undefined;
  }
  const field = sortRules[0].code;
  return field.startsWith('-') ? field.substr(1) : field;
}

export function isSortDescending(definition: SearchRequest): boolean {
  const sortRules = definition.sortRules;
  if (!sortRules || sortRules.length === 0) {
    return false;
  }
  return !!sortRules[0].descending;
}

export function getSearchOperators(searchParam: SearchParameter): Operator[] | undefined {
  return searchParamToOperators[searchParam.type as string];
}

export function getOpString(op: Operator): string {
  return operatorNames[op] ?? '';
}

export function buildFieldNameString(key: string): string {
  let tmp = key;

  if (tmp.includes('.')) {
    tmp = tmp.split('.').pop() as string;
  }

  if (tmp === 'versionId') {
    return 'Version ID';
  }

  tmp = tmp.replace('[x]', '');
  tmp = tmp.replaceAll(/([A-Z])/g, ' $1');
  tmp = tmp.replaceAll(/[-_]/g, ' ');
  tmp = tmp.replaceAll(/\s+/g, ' ');
  tmp = tmp.trim();

  if (tmp.toLowerCase() === 'id') {
    return 'ID';
  }

  return tmp.split(/\s/).map(capitalize).join(' ');
}

export function renderValue(resource: Resource, field: SearchControlField): string | JSX.Element | null | undefined {
  const key = field.name;
  if (key === 'id') {
    return <MedplumLink to={`/${resource.resourceType}/${resource.id}`}>{resource.id}</MedplumLink>;
  }

  if (key === 'meta.versionId') {
    return resource.meta?.versionId;
  }

  if (key === '_lastUpdated') {
    return formatDateTime(resource.meta?.lastUpdated);
  }

  if (`${resource.resourceType}.${field.name}` === field.elementDefinition?.path) {
    return renderPropertyValue(resource, field.elementDefinition);
  }

  if (field.searchParams?.length === 1 && field.name === field.searchParams[0].code) {
    return renderSearchParameterValue(resource, field.searchParams[0]);
  }

  return null;
}

function renderPropertyValue(resource: Resource, elementDefinition: InternalSchemaElement): JSX.Element | null {
  const path = elementDefinition.path?.split('.')?.pop()?.replaceAll('[x]', '') ?? '';
  const [value, propertyType] = getValueAndType({ type: resource.resourceType, value: resource }, path);
  if (!value) {
    return null;
  }

  return (
    <ResourcePropertyDisplay
      path={elementDefinition.path}
      property={elementDefinition}
      propertyType={propertyType}
      value={value}
      maxWidth={200}
      ignoreMissingValues={true}
      link={false}
    />
  );
}

function renderSearchParameterValue(resource: Resource, searchParam: SearchParameter): JSX.Element | null {
  const value = evalFhirPathTyped(searchParam.expression as string, [{ type: resource.resourceType, value: resource }]);
  if (!value || value.length === 0) {
    return null;
  }

  return (
    <For each={value}>
      {(v) => (
        <ResourcePropertyDisplay
          propertyType={v.type}
          value={v.value}
          maxWidth={200}
          ignoreMissingValues={true}
          link={false}
        />
      )}
    </For>
  );
}
