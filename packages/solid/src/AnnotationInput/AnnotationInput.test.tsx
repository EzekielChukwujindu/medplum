// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import type { AnnotationInputProps } from './AnnotationInput';
import { AnnotationInput } from './AnnotationInput';

const medplum = new MockClient();

function setup(args: AnnotationInputProps): void {
  render(() => (
    <MedplumProvider medplum={medplum}>
      <AnnotationInput {...args} />
    </MedplumProvider>
  ));
}

describe('AnnotationInput', () => {
  test('Renders undefined value', async () => {
    setup({
      name: 'a',
    });
    await waitFor(() => {
      expect(screen.queryByDisplayValue('Hello world')).toBeNull();
    });
  });

  test('Renders default value', async () => {
    setup({
      name: 'a',
      defaultValue: {
        text: 'Hello world',
      },
    });
    await waitFor(() => {
      expect(screen.getByDisplayValue('Hello world')).toBeTruthy();
    });
  });

  test('Set value', async () => {
    const onChange = vi.fn();

    setup({
      name: 'a',
      onChange,
    });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Annotation text')).toBeTruthy();
    });

    // TextInput uses onInput, so we need fireEvent.input
    const input = screen.getByPlaceholderText('Annotation text');
    fireEvent.input(input, { target: { value: 'TEST' } });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
      const call = onChange.mock.calls[0][0];
      expect(call.text).toBe('TEST');
      expect(call.authorReference).toBeDefined();
      expect(call.time).toBeDefined();
    });
  });

  test('Set value without change listener', async () => {
    setup({
      name: 'a',
    });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Annotation text')).toBeTruthy();
    });

    const input = screen.getByPlaceholderText('Annotation text');
    fireEvent.input(input, { target: { value: 'TEST' } });

    await waitFor(() => {
      expect(screen.getByDisplayValue('TEST')).toBeTruthy();
    });
  });

  test('Clear value', async () => {
    const onChange = vi.fn();

    setup({
      name: 'a',
      defaultValue: {
        text: 'Hello world',
        time: '2020-01-01T00:00:00Z',
      },
      onChange,
    });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Annotation text')).toBeTruthy();
    });

    const input = screen.getByPlaceholderText('Annotation text');
    fireEvent.input(input, { target: { value: '' } });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(undefined);
    });
  });
});
