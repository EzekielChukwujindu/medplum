// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { globalSchema, Operator } from '@medplum/core';
import type { SearchParameter } from '@medplum/fhirtypes';
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { fireEvent, render, screen } from '@solidjs/testing-library';
import { describe, expect, test, vi } from 'vitest';
import { SearchFilterValueDialog  } from './SearchFilterValueDialog';
import type {SearchFilterValueDialogProps} from './SearchFilterValueDialog';

const medplum = new MockClient();

describe('SearchFilterValueDialog', () => {
  function setup(props: Partial<SearchFilterValueDialogProps>): void {
    const searchParam = globalSchema.types['Patient'].searchParams?.['name'] as SearchParameter;
    const defaultProps: SearchFilterValueDialogProps = {
      title: 'Filter by Name',
      visible: true,
      resourceType: 'Patient',
      searchParam,
      filter: { code: 'name', operator: Operator.EQUALS, value: '' },
      onOk: vi.fn(),
      onCancel: vi.fn(),
      ...props,
    };

    render(() => (
      <MedplumProvider medplum={medplum}>
        <SearchFilterValueDialog {...defaultProps} />
      </MedplumProvider>
    ));
  }

  test('Renders and submits value', () => {
    const onOk = vi.fn();
    setup({ onOk });

    const input = screen.getByPlaceholderText('Search value');
    fireEvent.input(input, { target: { value: 'Alice' } });
    
    // Find Submit/OK button. Button defaults to type submit in Form
    const button = screen.getByText('OK');
    fireEvent.click(button);

    expect(onOk).toHaveBeenCalledWith(expect.objectContaining({
       code: 'name',
       value: 'Alice'
    }));
  });

  test('Updates with default value', () => {
    setup({ defaultValue: 'Bob' });
    expect(screen.getByDisplayValue('Bob')).toBeInTheDocument();
  });
});
