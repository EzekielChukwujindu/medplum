// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { render, screen, waitFor } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import { ResourceTypeInput } from './ResourceTypeInput';

const medplum = new MockClient();

describe('ResourceTypeInput', () => {
  function setup(onChange = vi.fn()): void {
    render(() => (
      <MedplumProvider medplum={medplum}>
        <ResourceTypeInput
          name="resourceType"
          placeholder="Select resource type"
          onChange={onChange}
        />
      </MedplumProvider>
    ));
  }

  test('Renders with placeholder', async () => {
    setup();
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Select resource type')).toBeTruthy();
    });
  });

  test('Renders with default value as badge', async () => {
    render(() => (
      <MedplumProvider medplum={medplum}>
        <ResourceTypeInput
          name="resourceType"
          defaultValue="Patient"
        />
      </MedplumProvider>
    ));

    await waitFor(() => {
      // The value appears as a badge, not input value
      expect(screen.getByText('Patient')).toBeTruthy();
    });
  });

  test('Renders disabled input', async () => {
    render(() => (
      <MedplumProvider medplum={medplum}>
        <ResourceTypeInput
          name="resourceType"
          disabled
        />
      </MedplumProvider>
    ));

    await waitFor(() => {
      const input = screen.getByRole('combobox') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });
  });
});
