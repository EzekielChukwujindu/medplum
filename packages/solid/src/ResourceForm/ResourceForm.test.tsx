// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { indexStructureDefinitionBundle } from '@medplum/core';
import { readJson } from '@medplum/definitions';
import type { Bundle } from '@medplum/fhirtypes';
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { fireEvent, render, screen, waitFor } from '@solidjs/testing-library';
import { beforeAll, describe, expect, test, vi } from 'vitest';
import { ResourceForm  } from './ResourceForm';
import type {ResourceFormProps} from './ResourceForm';

const medplum = new MockClient();

describe('ResourceForm', () => {
  beforeAll(() => {
    indexStructureDefinitionBundle(readJson('fhir/r4/profiles-types.json') as Bundle);
    indexStructureDefinitionBundle(readJson('fhir/r4/profiles-resources.json') as Bundle);
  });

  function setup(props: ResourceFormProps): void {
    render(() => (
      <MedplumProvider medplum={medplum}>
        <ResourceForm {...props} />
      </MedplumProvider>
    ));
  }

  test('Renders empty Practitioner form', async () => {
    const onSubmit = vi.fn();

    setup({
      defaultValue: {
        resourceType: 'Practitioner',
      },
      onSubmit,
    });

    await waitFor(() => {
      expect(screen.getByText('Resource Type')).toBeTruthy();
    });

    const control = screen.getByText('Resource Type');
    expect(control).toBeTruthy();
    expect((screen.getByDisplayValue('Practitioner') as HTMLInputElement).value).toBe('Practitioner');
  });

  test('Submit Practitioner', async () => {
    const onSubmit = vi.fn();

    setup({
      defaultValue: {
        resourceType: 'Practitioner',
      },
      onSubmit,
    });

    await waitFor(() => {
      expect(screen.getByText('Resource Type')).toBeTruthy();
      expect(screen.getByText('Create')).toBeTruthy();
    });

    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  test('Patch', async () => {
    const onSubmit = vi.fn();
    const onPatch = vi.fn();

    setup({
      defaultValue: {
        resourceType: 'Practitioner',
        id: 'xyz',
      },
      onSubmit,
      onPatch,
    });

    await waitFor(() => {
      expect(screen.getByText('Resource Type')).toBeTruthy();
      expect(screen.getByText('Update')).toBeTruthy();
    });

    // Validates Dropdown menu presence
    const moreActions = screen.getByLabelText('More actions');
    expect(moreActions).toBeTruthy();
    fireEvent.click(moreActions);

    const patchButton = await screen.findByText('Patch');
    expect(patchButton).toBeTruthy();
    
    // Check usage of onPatch
    fireEvent.click(patchButton);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onPatch).toHaveBeenCalled();
  });

  test('Delete', async () => {
    const onSubmit = vi.fn();
    const onDelete = vi.fn();

    setup({
      defaultValue: {
        resourceType: 'Practitioner',
        id: 'xyz',
      },
      onSubmit,
      onDelete,
    });

    await waitFor(() => {
      expect(screen.getByText('Resource Type')).toBeTruthy();
    });

    const moreActions = screen.getByLabelText('More actions');
    fireEvent.click(moreActions);

    const deleteButton = await screen.findByText('Delete');
    expect(deleteButton).toBeTruthy();
    
    fireEvent.click(deleteButton);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalled();
  });
});
