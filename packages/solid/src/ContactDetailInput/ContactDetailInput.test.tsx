// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { ContactDetail } from '@medplum/fhirtypes';
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import { ContactDetailInput } from './ContactDetailInput';

describe('ContactDetailInput', () => {
  test('Renders', async () => {
    render(() => (
      <ContactDetailInput
        name="test"
        path=""
        onChange={vi.fn()}
        defaultValue={{ name: 'Foo', telecom: [{ system: 'email', value: 'abc@example.com' }] }}
      />
    ));

    await waitFor(() => {
      const value = screen.getByPlaceholderText('Value') as HTMLInputElement;
      expect(value).toBeTruthy();
      expect(value.value).toEqual('abc@example.com');
    });
  });

  test('Change events', async () => {
    let lastValue: ContactDetail | undefined = undefined;

    render(() => (
      <ContactDetailInput
        name="test"
        path=""
        defaultValue={{}}
        onChange={(value) => (lastValue = value)}
      />
    ));

    // Use input events since TextInput/ContactPointInput use onInput
    fireEvent.input(screen.getByPlaceholderText('Name'), { target: { value: 'Foo' } });

    await waitFor(() => {
      expect(lastValue).toBeDefined();
      expect(lastValue?.name).toBe('Foo');
    });
  });

  test('Handles empty name', async () => {
    const onChange = vi.fn();

    render(() => (
      <ContactDetailInput
        name="test"
        path=""
        defaultValue={{ name: 'Foo' }}
        onChange={onChange}
      />
    ));

    await waitFor(() => {
      expect(screen.getByDisplayValue('Foo')).toBeTruthy();
    });

    // Clear the name - since no telecom, value becomes undefined
    // ComplexTypeInputProps.onChange only fires for non-undefined values
    fireEvent.input(screen.getByDisplayValue('Foo'), { target: { value: '' } });

    // Wait a bit to ensure no onChange is called
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    // onChange should NOT be called when clearing to undefined
    expect(onChange).not.toHaveBeenCalled();
  });
});
