// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Operator } from '@medplum/core';
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library';
import { afterEach, describe, expect, test, vi } from 'vitest';
import type { JSX } from 'solid-js';
import { SearchFilterEditor } from './SearchFilterEditor';
import type { SearchRequest } from '@medplum/core';

const medplum = new MockClient();

vi.mock('../Modal/Modal', () => ({
  Modal: (props: any) => (
    <div data-testid="mock-modal" style={{ display: props.open ? 'block' : 'none' }}>
      <h1>{props.title}</h1>
      {props.children}
    </div>
  ),
}));

function setup(ui: JSX.Element): void {
  render(() => <MedplumProvider medplum={medplum}>{ui}</MedplumProvider>);
}

describe('SearchFilterEditor', () => {
  afterEach(() => {
    cleanup();
  });

  test('Renders', () => {
    const search: SearchRequest = { resourceType: 'Patient' };
    const onOk = vi.fn();
    const onCancel = vi.fn();

    setup(
      <SearchFilterEditor
        visible={true}
        search={search}
        onOk={onOk}
        onCancel={onCancel}
      />
    );

    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  test('Add filter', async () => {
    const search: SearchRequest = { resourceType: 'Patient' };
    const onOk = vi.fn();
    const onCancel = vi.fn();

    setup(
      <SearchFilterEditor
        visible={true}
        search={search}
        onOk={onOk}
        onCancel={onCancel}
      />
    );

    // Click "Add Filter"
    fireEvent.click(screen.getByText('Add Filter'));

    // Select field "name"
    // Note: NativeSelect renders a select element.
    const select = screen.getAllByRole('combobox')[0] as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'name' } });

    // Select operator "equals" (default or selected)
    // Wait for operators to appear?
    
    // Select value
    // ...
  });

  test('Submit', async () => {
    const search: SearchRequest = { 
      resourceType: 'Patient',
      filters: [{ code: 'name', operator: Operator.EQUALS, value: 'Homer' }]
    };
    const onOk = vi.fn();
    const onCancel = vi.fn();

    setup(
      <SearchFilterEditor
        visible={true}
        search={search}
        onOk={onOk}
        onCancel={onCancel}
      />
    );

    fireEvent.click(screen.getByText('OK'));
    expect(onOk).toHaveBeenCalled();
    expect(onOk.mock.calls[0][0]).toMatchObject({
      resourceType: 'Patient',
      filters: [{ code: 'name', operator: "eq", value: 'Homer' }]
    });
  });

});
