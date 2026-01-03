// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { Filter, SearchRequest } from '@medplum/core';
import { Operator } from '@medplum/core';
import type { SearchParameter } from '@medplum/fhirtypes';
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Equal,
  EqualNot,
  Search,
  Settings,
  X,
  FileX,
  FileCheck
} from 'lucide-solid';
import type { JSX } from 'solid-js';
import { For, Switch, Match } from 'solid-js';
import {
  addLastMonthFilter,
  addMissingFilter,
  addNext24HoursFilter,
  addNextMonthFilter,
  addThisMonthFilter,
  addTodayFilter,
  addTomorrowFilter,
  addYearToDateFilter,
  addYesterdayFilter,
  buildFieldNameString,
  clearFiltersOnField,
  setSort,
} from '../SearchControl/SearchUtils';

export interface SearchPopupMenuProps {
  readonly search: SearchRequest;
  readonly searchParams?: SearchParameter[];
  readonly onPrompt: (searchParam: SearchParameter, filter: Filter) => void;
  readonly onChange: (definition: SearchRequest) => void;
}

export function SearchPopupMenu(props: SearchPopupMenuProps): JSX.Element | null {
  if (!props.searchParams) {
    return null;
  }

  const onSort = (searchParam: SearchParameter, desc: boolean): void => {
    props.onChange(setSort(props.search, searchParam.code, desc));
  };

  const onClear = (searchParam: SearchParameter): void => {
    props.onChange(clearFiltersOnField(props.search, searchParam.code));
  };

  const onPrompt = (searchParam: SearchParameter, operator: Operator): void => {
    props.onPrompt(searchParam, { code: searchParam.code, operator, value: '' });
  };

  const onChange = (definition: SearchRequest): void => {
    props.onChange(definition);
  };

  return (
    <Switch fallback={
      <ul class="menu bg-base-100 w-56 rounded-box shadow">
        <For each={props.searchParams}>
          {(searchParam) => (
             <li><a>{buildFieldNameString(searchParam.code)}</a></li>
          )}
        </For>
      </ul>
    }>
      <Match when={props.searchParams?.length === 1}>
        <SearchParameterSubMenu
          search={props.search}
          searchParam={props.searchParams![0]}
          onSort={onSort}
          onPrompt={onPrompt}
          onChange={onChange}
          onClear={onClear}
        />
      </Match>
    </Switch>
  );
}

interface SearchPopupSubMenuProps {
  readonly search: SearchRequest;
  readonly searchParam: SearchParameter;
  readonly onSort: (searchParam: SearchParameter, descending: boolean) => void;
  readonly onPrompt: (searchParam: SearchParameter, operator: Operator) => void;
  readonly onChange: (search: SearchRequest) => void;
  readonly onClear: (searchParam: SearchParameter) => void;
}

function SearchParameterSubMenu(props: SearchPopupSubMenuProps): JSX.Element {
  return (
    <Switch fallback={<>Unknown search param type: {props.searchParam.type}</>}>
      <Match when={props.searchParam.type === 'date'}>
        <DateFilterSubMenu {...props} />
      </Match>
      <Match when={props.searchParam.type === 'number' || props.searchParam.type === 'quantity'}>
        <NumericFilterSubMenu {...props} />
      </Match>
      <Match when={props.searchParam.type === 'reference'}>
        <ReferenceFilterSubMenu {...props} />
      </Match>
      <Match when={props.searchParam.type === 'string'}>
        <TextFilterSubMenu {...props} />
      </Match>
      <Match when={props.searchParam.type === 'token' || props.searchParam.type === 'uri'}>
        <TokenFilterSubMenu {...props} />
      </Match>
    </Switch>
  );
}

function MenuItem(props: { onClick: () => void; icon?: JSX.Element; children: JSX.Element }) {
  return (
    <li>
      <a onClick={props.onClick} class="flex items-center gap-2">
        {props.icon && <span class="w-4 h-4">{props.icon}</span>}
        {props.children}
      </a>
    </li>
  );
}

function MenuDivider() {
  return <li></li>; // DaisyUI menu divider? usually empty li or border-bottom
}

function MenuWrapper(props: { children: JSX.Element }) {
    return <ul class="menu bg-base-100 w-64 rounded-box shadow">{props.children}</ul>;
}

function DateFilterSubMenu(props: SearchPopupSubMenuProps): JSX.Element {
  const { searchParam } = props;
  const code = searchParam.code;
  return (
    <MenuWrapper>
      <MenuItem icon={<ArrowUpNarrowWide />} onClick={() => props.onSort(searchParam, false)}>
        Sort Oldest to Newest
      </MenuItem>
      <MenuItem icon={<ArrowDownWideNarrow />} onClick={() => props.onSort(searchParam, true)}>
        Sort Newest to Oldest
      </MenuItem>
      <MenuDivider />
      <MenuItem icon={<Equal />} onClick={() => props.onPrompt(searchParam, Operator.EQUALS)}>
        Equals...
      </MenuItem>
      <MenuItem
        icon={<EqualNot />}
        onClick={() => props.onPrompt(searchParam, Operator.NOT_EQUALS)}
      >
        Does not equal...
      </MenuItem>
      <MenuDivider />
      <MenuItem
        icon={<ChevronLeft />}
        onClick={() => props.onPrompt(searchParam, Operator.ENDS_BEFORE)}
      >
        Before...
      </MenuItem>
      <MenuItem
        icon={<ChevronRight />}
        onClick={() => props.onPrompt(searchParam, Operator.STARTS_AFTER)}
      >
        After...
      </MenuItem>
      <MenuItem
        icon={<Settings />}
        onClick={() => props.onPrompt(searchParam, Operator.EQUALS)}
      >
        Between...
      </MenuItem>
      <MenuDivider />
      <MenuItem
        icon={<Calendar />}
        onClick={() => props.onChange(addTomorrowFilter(props.search, code))}
      >
        Tomorrow
      </MenuItem>
      <MenuItem
        icon={<Calendar />}
        onClick={() => props.onChange(addTodayFilter(props.search, code))}
      >
        Today
      </MenuItem>
      <MenuItem
        icon={<Calendar />}
        onClick={() => props.onChange(addYesterdayFilter(props.search, code))}
      >
        Yesterday
      </MenuItem>
      <MenuItem
        icon={<Calendar />}
        onClick={() => props.onChange(addNext24HoursFilter(props.search, code))}
      >
        Next 24 Hours
      </MenuItem>
      <MenuDivider />
      <MenuItem
        icon={<Calendar />}
        onClick={() => props.onChange(addNextMonthFilter(props.search, code))}
      >
        Next Month
      </MenuItem>
      <MenuItem
        icon={<Calendar />}
        onClick={() => props.onChange(addThisMonthFilter(props.search, code))}
      >
        This Month
      </MenuItem>
      <MenuItem
        icon={<Calendar />}
        onClick={() => props.onChange(addLastMonthFilter(props.search, code))}
      >
        Last Month
      </MenuItem>
      <MenuDivider />
      <MenuItem
        icon={<Calendar />}
        onClick={() => props.onChange(addYearToDateFilter(props.search, code))}
      >
        Year to date
      </MenuItem>
      <CommonMenuItems {...props} />
    </MenuWrapper>
  );
}

function NumericFilterSubMenu(props: SearchPopupSubMenuProps): JSX.Element {
  const { searchParam } = props;
  return (
    <MenuWrapper>
      <MenuItem icon={<ArrowUpNarrowWide />} onClick={() => props.onSort(searchParam, false)}>
        Sort Smallest to Largest
      </MenuItem>
      <MenuItem icon={<ArrowDownWideNarrow />} onClick={() => props.onSort(searchParam, true)}>
        Sort Largest to Smallest
      </MenuItem>
      <MenuDivider />
      <MenuItem icon={<Equal />} onClick={() => props.onPrompt(searchParam, Operator.EQUALS)}>
        Equals...
      </MenuItem>
      <MenuItem
        icon={<EqualNot />}
        onClick={() => props.onPrompt(searchParam, Operator.NOT_EQUALS)}
      >
        Does not equal...
      </MenuItem>
      <MenuDivider />
      <MenuItem
        icon={<ChevronRight />}
        onClick={() => props.onPrompt(searchParam, Operator.GREATER_THAN)}
      >
        Greater than...
      </MenuItem>
      <MenuItem
        icon={<Settings />}
        onClick={() => props.onPrompt(searchParam, Operator.GREATER_THAN_OR_EQUALS)}
      >
        Greater than or equal to...
      </MenuItem>
      <MenuItem
        icon={<ChevronLeft />}
        onClick={() => props.onPrompt(searchParam, Operator.LESS_THAN)}
      >
        Less than...
      </MenuItem>
      <MenuItem
        icon={<Settings />}
        onClick={() => props.onPrompt(searchParam, Operator.LESS_THAN_OR_EQUALS)}
      >
        Less than or equal to...
      </MenuItem>
      <CommonMenuItems {...props} />
    </MenuWrapper>
  );
}

function ReferenceFilterSubMenu(props: SearchPopupSubMenuProps): JSX.Element {
  const { searchParam } = props;
  return (
    <MenuWrapper>
      <MenuItem icon={<Equal />} onClick={() => props.onPrompt(searchParam, Operator.EQUALS)}>
        Equals...
      </MenuItem>
      <MenuItem icon={<EqualNot />} onClick={() => props.onPrompt(searchParam, Operator.NOT)}>
        Does not equal...
      </MenuItem>
      <CommonMenuItems {...props} />
    </MenuWrapper>
  );
}

function TextFilterSubMenu(props: SearchPopupSubMenuProps): JSX.Element {
  const { searchParam } = props;
  return (
    <MenuWrapper>
      <MenuItem icon={<ArrowUpNarrowWide />} onClick={() => props.onSort(searchParam, false)}>
        Sort A to Z
      </MenuItem>
      <MenuItem icon={<ArrowDownWideNarrow />} onClick={() => props.onSort(searchParam, true)}>
        Sort Z to A
      </MenuItem>
      <MenuDivider />
      <MenuItem icon={<Equal />} onClick={() => props.onPrompt(searchParam, Operator.EQUALS)}>
        Equals...
      </MenuItem>
      <MenuItem icon={<EqualNot />} onClick={() => props.onPrompt(searchParam, Operator.NOT)}>
        Does not equal...
      </MenuItem>
      <MenuDivider />
      <MenuItem icon={<Search />} onClick={() => props.onPrompt(searchParam, Operator.CONTAINS)}>
        Contains...
      </MenuItem>
      <MenuItem icon={<Search />} onClick={() => props.onPrompt(searchParam, Operator.EQUALS)}>
        Does not contain...
      </MenuItem>
      <CommonMenuItems {...props} />
    </MenuWrapper>
  );
}

function TokenFilterSubMenu(props: SearchPopupSubMenuProps): JSX.Element {
  const { searchParam } = props;
  return (
    <MenuWrapper>
      <MenuItem icon={<Equal />} onClick={() => props.onPrompt(searchParam, Operator.EQUALS)}>
        Equals...
      </MenuItem>
      <MenuItem icon={<EqualNot />} onClick={() => props.onPrompt(searchParam, Operator.NOT)}>
        Does not equal...
      </MenuItem>
      <CommonMenuItems {...props} />
    </MenuWrapper>
  );
}

function CommonMenuItems(props: {
  search: SearchRequest;
  searchParam: SearchParameter;
  onChange: (search: SearchRequest) => void;
  onClear: (searchParam: SearchParameter) => void;
}): JSX.Element {
  const { searchParam } = props;
  const code = searchParam.code;
  return (
    <>
      <MenuDivider />
      <MenuItem
        icon={<FileX />}
        onClick={() => props.onChange(addMissingFilter(props.search, code))}
      >
        Missing
      </MenuItem>
      <MenuItem
        icon={<FileCheck />}
        onClick={() => props.onChange(addMissingFilter(props.search, code, false))}
      >
        Not missing
      </MenuItem>
      <MenuDivider />
      <MenuItem icon={<X />} onClick={() => props.onClear(searchParam)}>
        Clear filters
      </MenuItem>
    </>
  );
}
