// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { fireEvent, render, screen } from '@solidjs/testing-library';
import { describe, expect, test, vi } from 'vitest';
import { SearchFieldEditor  } from './SearchFieldEditor';
import type {SearchFieldEditorProps} from './SearchFieldEditor';

const medplum = new MockClient();

describe('SearchFieldEditor', () => {
  function setup(props: Partial<SearchFieldEditorProps>): void {
    const defaultProps: SearchFieldEditorProps = {
      visible: true,
      search: { resourceType: 'Patient' },
      onOk: vi.fn(),
      onCancel: vi.fn(),
      ...props,
    };
    render(() => (
      <MedplumProvider medplum={medplum}>
        <SearchFieldEditor {...defaultProps} />
      </MedplumProvider>
    ));
  }

  test('Renders fields', () => {
    setup({});
    expect(screen.getByText('Fields')).toBeInTheDocument();
    // Patient has name, birthDate, gender, etc.
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Gender')).toBeInTheDocument();
  });

  test('Selects and deselects fields', () => {
    setup({});
    const nameCheckbox = screen.getByLabelText('Name') as HTMLInputElement;
    
    // Initially not selected (if search.fields empty)
    expect(nameCheckbox.checked).toBe(false);
    expect(screen.queryByLabelText('Remove name')).toBeNull();

    // Select
    fireEvent.click(nameCheckbox);
    expect(nameCheckbox.checked).toBe(true);
    expect(screen.getByLabelText('Remove name')).toBeInTheDocument();

    // Deselect via checkbox
    fireEvent.click(nameCheckbox);
    expect(nameCheckbox.checked).toBe(false);
    expect(screen.queryByLabelText('Remove name')).toBeNull();
  });

  test('Deselects via chip', () => {
    setup({ search: { resourceType: 'Patient', fields: ['name'] } });
    
    const nameCheckbox = screen.getByLabelText('Name') as HTMLInputElement;
    expect(nameCheckbox.checked).toBe(true);
    expect(screen.getByLabelText('Remove name')).toBeInTheDocument();

    // Remove via chip
    fireEvent.click(screen.getByLabelText('Remove name'));
    expect(nameCheckbox.checked).toBe(false);
    expect(screen.queryByLabelText('Remove name')).toBeNull();
  });

  test('Submits changes', () => {
    const onOk = vi.fn();
    setup({ onOk });
    
    // Select Gender
    fireEvent.click(screen.getByLabelText('Gender'));
    
    // Click OK
    fireEvent.click(screen.getByText('OK'));
    
    expect(onOk).toHaveBeenCalledWith(expect.objectContaining({
      fields: ['gender']
    }));
  });

  test('Filters list', () => {
    setup({});
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    
    const filterInput = screen.getByPlaceholderText('Search fields...');
    fireEvent.input(filterInput, { target: { value: 'gender' } });
    
    expect(screen.queryByLabelText('Name')).toBeNull();
    expect(screen.getByLabelText('Gender')).toBeInTheDocument();
  });
});
