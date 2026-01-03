// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { InternalSchemaElement } from '@medplum/core';
import type { ElementDefinition } from '@medplum/fhirtypes';
import { MedplumProvider } from '@medplum/solid-hooks';
import { fireEvent, render, screen } from '@solidjs/testing-library';
import { describe, expect, test, vi } from 'vitest';
import { MockClient } from '@medplum/mock';
import type { ResourcePropertyInputProps } from './ResourcePropertyInput';
import { ResourcePropertyInput } from './ResourcePropertyInput';

const medplum = new MockClient();

const baseProperty: Omit<InternalSchemaElement, 'type'> = {
  min: 0,
  max: 1,
  description: '',
  isArray: false,
  constraints: [],
  path: '',
};

const defaultProps: ResourcePropertyInputProps = {
  path: 'Resource.path',
  defaultValue: undefined,
  outcome: undefined,
  onChange: undefined,
  name: 'test',
  property: { ...baseProperty, type: [{ code: 'string' }] } as unknown as ElementDefinition,
};

describe('ResourcePropertyInput', () => {
  function setup(props: ResourcePropertyInputProps): void {
    render(() => (
      <MedplumProvider medplum={medplum}>
        <ResourcePropertyInput {...props} />
      </MedplumProvider>
    ));
  }

  test('String property', () => {
    const onChange = vi.fn();
    setup({
      ...defaultProps,
      name: 'name',
      property: { ...baseProperty, type: [{ code: 'string' }] } as unknown as ElementDefinition,
      onChange,
    });

    const input = screen.getByDisplayValue('');
    fireEvent.input(input, { target: { value: 'Homer' } });
    expect(onChange).toHaveBeenCalledWith('Homer');
  });

  test('Boolean property', () => {
    const onChange = vi.fn();
    setup({
      ...defaultProps,
      name: 'active',
      property: { ...baseProperty, type: [{ code: 'boolean' }] } as unknown as ElementDefinition,
      onChange,
    });

    const input = screen.getByRole('checkbox');
    fireEvent.click(input);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  test('Integer property', () => {
    const onChange = vi.fn();
    setup({
      ...defaultProps,
      name: 'age',
      property: { ...baseProperty, type: [{ code: 'integer' }] } as unknown as ElementDefinition,
      onChange,
    });

    // We can't easily query by type="number" with getByRole, so use display value or name
    // But name attribute is 'age'
    // Let's use getByDisplayValue or implicit role
    const input = document.querySelector('input[name="age"]') as HTMLInputElement;
    expect(input).toBeDefined();
    expect(input.type).toBe('number');

    fireEvent.input(input, { target: { value: '42' } });
    expect(onChange).toHaveBeenCalledWith('42');
  });

  test('Renders defaultValue', () => {
    setup({
      ...defaultProps,
      name: 'name',
      defaultValue: 'Marge',
    });

    expect(screen.getByDisplayValue('Marge')).toBeDefined();
  });
});
