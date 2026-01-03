// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { ExampleWorkflowPlanDefinition, MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import type { PlanDefinitionBuilderProps } from './PlanDefinitionBuilder';
import { PlanDefinitionBuilder } from './PlanDefinitionBuilder';

const medplum = new MockClient();

async function setup(args: PlanDefinitionBuilderProps): Promise<void> {
  render(() => (
    <MedplumProvider medplum={medplum}>
      <PlanDefinitionBuilder {...args} />
    </MedplumProvider>
  ));
}

describe('PlanDefinitionBuilder', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(async () => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  test('Renders empty', async () => {
    await setup({
      value: {
        resourceType: 'PlanDefinition',
      },
      onSubmit: vi.fn(),
    });
    await waitFor(() => {
      expect(screen.getByTestId('questionnaire-form')).toBeTruthy();
    });
  });

  test('Render existing', async () => {
    await setup({
      value: ExampleWorkflowPlanDefinition,
      onSubmit: vi.fn(),
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Example Plan Definition')).toBeTruthy();
    });
  });

  test('Handles submit', async () => {
    const onSubmit = vi.fn();

    await setup({
      value: ExampleWorkflowPlanDefinition,
      onSubmit,
    });

    await waitFor(() => {
      expect(screen.getByText('Save')).toBeTruthy();
    });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  test('Change plan title', async () => {
    const onSubmit = vi.fn();

    await setup({
      value: {
        resourceType: 'PlanDefinition',
        title: 'Example Plan Definition',
      },
      onSubmit,
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Example Plan Definition')).toBeTruthy();
    });

    // Change the title using input event
    fireEvent.input(screen.getByDisplayValue('Example Plan Definition'), {
      target: { value: 'Renamed Plan Definition' },
    });

    expect(screen.getByText('Save')).toBeTruthy();

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  test('Change action title', async () => {
    const onSubmit = vi.fn();

    await setup({
      value: {
        resourceType: 'PlanDefinition',
        title: 'Example Plan Definition',
        action: [
          {
            title: 'Example Action',
          },
        ],
      },
      onSubmit,
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Example Action')).toBeTruthy();
    });

    // Click on the action to select it
    fireEvent.click(screen.getByDisplayValue('Example Action'));

    // Change the action title using input event
    fireEvent.input(screen.getByDisplayValue('Example Action'), {
      target: { value: 'Renamed Action' },
    });

    expect(screen.getByText('Save')).toBeTruthy();

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  test('Add action', async () => {
    const onSubmit = vi.fn();
    await setup({
      value: {
        resourceType: 'PlanDefinition',
        title: 'Example Plan Definition',
      },
      onSubmit,
    });

    await waitFor(() => {
      expect(screen.getByText('Add action')).toBeTruthy();
    });

    fireEvent.click(screen.getByText('Add action'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Title')).toBeTruthy();
    });

    expect(screen.getByText('Save')).toBeTruthy();

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  test('Remove action', async () => {
    const onSubmit = vi.fn();

    await setup({
      value: {
        resourceType: 'PlanDefinition',
        title: 'Example Plan Definition',
        action: [
          {
            id: 'id-1',
            title: 'Patient Registration',
          },
        ],
      },
      onSubmit,
    });

    await waitFor(() => {
      expect(screen.getByTestId('close-button')).toBeTruthy();
    });

    fireEvent.click(screen.getByTestId('close-button'));

    expect(screen.getByText('Save')).toBeTruthy();

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  test('Renders title input', async () => {
    await setup({
      value: { resourceType: 'PlanDefinition', status: 'active' },
      onSubmit: vi.fn(),
    });
    await waitFor(() => {
      expect(screen.getByText('Plan Title')).toBeTruthy();
    });
  });

  test('Renders add action button', async () => {
    await setup({
      value: { resourceType: 'PlanDefinition', status: 'active' },
      onSubmit: vi.fn(),
    });
    await waitFor(() => {
      expect(screen.getByText('Add action')).toBeTruthy();
    });
  });

  test('Renders save button', async () => {
    await setup({
      value: { resourceType: 'PlanDefinition', status: 'active' },
      onSubmit: vi.fn(),
    });
    await waitFor(() => {
      expect(screen.getByText('Save')).toBeTruthy();
    });
  });
});
