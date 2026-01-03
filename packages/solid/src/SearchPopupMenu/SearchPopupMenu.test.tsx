// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { SearchRequest } from '@medplum/core';
import { Operator, globalSchema } from '@medplum/core';
import type { ResourceType, SearchParameter } from '@medplum/fhirtypes';
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { fireEvent, render, screen } from '@solidjs/testing-library';
import { beforeAll, describe, expect, test, vi } from 'vitest';
import type { SearchPopupMenuProps } from './SearchPopupMenu';
import { SearchPopupMenu } from './SearchPopupMenu';

const medplum = new MockClient();

describe('SearchPopupMenu', () => {
  beforeAll(() => {
    // Ensure globalSchema is initialized? It usually is.
    // In Solid environment test, verify if schemas are loaded.
    // MockClient loads some?
  });

  function setup(partialProps: Partial<SearchPopupMenuProps>): void {
    const props = {
      search: { resourceType: 'Patient' as ResourceType },
      onPrompt: vi.fn(),
      onChange: vi.fn(),
      ...partialProps,
    } as SearchPopupMenuProps;

    render(() => (
      <MedplumProvider medplum={medplum}>
        <SearchPopupMenu {...props} />
      </MedplumProvider>
    ));
  }

  test('Invalid resource', () => {
    // Should safely handle unknown type if passed? 
    // Typescript should prevent but runtime...
    // The component depends on globalSchema for getting params via setup in tests,
    // but the component itself takes passed searchParams.
    // If searchParams is undefined, returns null.
    setup({
      search: { resourceType: 'xyz' as ResourceType },
      searchParams: undefined
    });
    // Should render nothing
  });

  test('Date sort', () => {
    let currSearch: SearchRequest = {
      resourceType: 'Patient',
    };

    const searchParam = globalSchema.types['Patient'].searchParams?.['birthdate'] as SearchParameter;
    const onChange = vi.fn((e) => (currSearch = e));

    setup({
       search: currSearch,
       searchParams: [searchParam],
       onChange
    });

    const sortOldest = screen.getByText('Sort Oldest to Newest');
    fireEvent.click(sortOldest);

    expect(onChange).toHaveBeenCalled();
    expect(currSearch.sortRules).toBeDefined();
    expect(currSearch.sortRules?.[0].code).toEqual('birthdate');
    expect(currSearch.sortRules?.[0].descending).toEqual(false);
    
    // reset mock or just check effects
    const sortNewest = screen.getByText('Sort Newest to Oldest');
    fireEvent.click(sortNewest);
    
    expect(currSearch.sortRules?.[0].descending).toEqual(true);
  });

  test('Date submenu prompt', () => {
     const searchParam = globalSchema.types['Patient'].searchParams?.['birthdate'] as SearchParameter;
     const onPrompt = vi.fn();

     setup({
        search: { resourceType: 'Patient' },
        searchParams: [searchParam],
        onPrompt
     });

     const options = [
      { text: 'Equals...', operator: Operator.EQUALS },
      { text: 'Does not equal...', operator: Operator.NOT_EQUALS },
      { text: 'Before...', operator: Operator.ENDS_BEFORE },
      { text: 'After...', operator: Operator.STARTS_AFTER },
      { text: 'Between...', operator: Operator.EQUALS },
    ];

    for (const option of options) {
       onPrompt.mockClear();
       fireEvent.click(screen.getByText(option.text));
       expect(onPrompt).toHaveBeenCalledWith(searchParam, {
          code: 'birthdate',
          operator: option.operator,
          value: ''
       });
    }
  });

  // Just spot check shortcuts
  test('Tomorrow shortcut', () => {
    let currSearch: SearchRequest = { resourceType: 'Patient' };
    const searchParam = globalSchema.types['Patient'].searchParams?.['birthdate'] as SearchParameter;
    const onChange = vi.fn((e) => currSearch = e);

    setup({ search: currSearch, searchParams: [searchParam], onChange });

    fireEvent.click(screen.getByText('Tomorrow'));
    
    expect(currSearch.filters).toBeDefined();
    // Verify filters added (Start/End for Tomorrow)
    expect(currSearch.filters?.some(f => f.code === 'birthdate')).toBe(true);
  });

  test('Reference filter', () => {
     const searchParam = globalSchema.types['Patient'].searchParams?.['organization'] as SearchParameter;
     const onPrompt = vi.fn();

     setup({ 
        search: { resourceType: 'Patient' }, 
        searchParams: [searchParam],
        onPrompt
     });

     fireEvent.click(screen.getByText('Equals...'));
     expect(onPrompt).toHaveBeenCalledWith(searchParam, expect.objectContaining({ operator: Operator.EQUALS }));
  });

  test('Only one search parameter renders submenu', () => {
     const searchParam = globalSchema.types['Patient'].searchParams?.['name'] as SearchParameter;
     setup({ 
        search: { resourceType: 'Patient' }, 
        searchParams: [searchParam], 
     });
     
     expect(screen.getByText('Sort A to Z')).toBeInTheDocument();
  });

  test('Multiple search parameters renders list', () => {
      const p1 = globalSchema.types['Patient'].searchParams?.['name'] as SearchParameter;
      const p2 = globalSchema.types['Patient'].searchParams?.['birthdate'] as SearchParameter;

      setup({ 
        search: { resourceType: 'Patient' }, 
        searchParams: [p1, p2], 
     });

     // Should see both names
     expect(screen.getByText('Name')).toBeInTheDocument();
     expect(screen.getByText('Birthdate')).toBeInTheDocument();
     
     // Should NOT see submenu items like 'Sort A to Z' directly
     expect(screen.queryByText('Sort A to Z')).toBeNull();
  });
});
