// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import type { QuestionnaireBuilderProps } from './QuestionnaireBuilder';
import { QuestionnaireBuilder } from './QuestionnaireBuilder';

const medplum = new MockClient();

async function setup(props: QuestionnaireBuilderProps): Promise<void> {
  render(() => (
    <MedplumProvider medplum={medplum}>
      <QuestionnaireBuilder {...props} />
    </MedplumProvider>
  ));
}

describe('QuestionnaireBuilder', () => {
  test('Renders empty', async () => {
    await setup({
      questionnaire: {
        resourceType: 'Questionnaire',
        status: 'active',
      },
      onSubmit: vi.fn(),
    });
    await waitFor(() => {
      expect(screen.getByTestId('questionnaire-form')).toBeTruthy();
    });
  });

  test('Renders groups', async () => {
    await setup({
      questionnaire: {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'group1',
            text: 'Group 1',
            type: 'group',
            item: [
              { linkId: 'q1', text: 'Question 1', type: 'string' },
              { linkId: 'q2', text: 'Question 2', type: 'string' },
            ],
          },
          {
            linkId: 'group2',
            text: 'Group 2',
            type: 'group',
            item: [
              { linkId: 'q3', text: 'Question 3', type: 'string' },
            ],
          },
        ],
      },
      onSubmit: vi.fn(),
    });

    await waitFor(() => {
      expect(screen.getByTestId('questionnaire-form')).toBeTruthy();
      expect(screen.getByText('Group 1')).toBeTruthy();
      expect(screen.getByText('Group 2')).toBeTruthy();
    });
  });

  test('Handles submit', async () => {
    const onSubmit = vi.fn();

    await setup({
      questionnaire: {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          { linkId: 'q1', type: 'string', text: 'Question 1' },
          { linkId: 'q2', type: 'integer', text: 'Question 2' },
          { linkId: 'q3', type: 'date', text: 'Question 3' },
        ],
      },
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

  test('Handles submit with required items', async () => {
    const onSubmit = vi.fn();

    await setup({
      questionnaire: {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          { linkId: 'q1', type: 'string', text: 'Q1', required: true },
          { linkId: 'q2', type: 'integer', text: 'Q2', required: true },
        ],
      },
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

  test('Renders add item link', async () => {
    await setup({
      questionnaire: { resourceType: 'Questionnaire', status: 'active' },
      onSubmit: vi.fn(),
    });
    await waitFor(() => {
      expect(screen.getByText('Add item')).toBeTruthy();
    });
  });

  test('Renders add group link', async () => {
    await setup({
      questionnaire: { resourceType: 'Questionnaire', status: 'active' },
      onSubmit: vi.fn(),
    });
    await waitFor(() => {
      expect(screen.getByText('Add group')).toBeTruthy();
    });
  });

  test('Renders add page link', async () => {
    await setup({
      questionnaire: { resourceType: 'Questionnaire', status: 'active' },
      onSubmit: vi.fn(),
    });
    await waitFor(() => {
      expect(screen.getByText('Add Page')).toBeTruthy();
    });
  });

  test('Renders save button', async () => {
    await setup({
      questionnaire: { resourceType: 'Questionnaire', status: 'active' },
      onSubmit: vi.fn(),
    });
    await waitFor(() => {
      expect(screen.getByText('Save')).toBeTruthy();
    });
  });

  test('Adds item on click', async () => {
    await setup({
      questionnaire: { resourceType: 'Questionnaire', status: 'active' },
      onSubmit: vi.fn(),
    });

    await waitFor(() => {
      expect(screen.getByText('Add item')).toBeTruthy();
    });

    fireEvent.click(screen.getByText('Add item'));

    await waitFor(() => {
      expect(screen.getByText('Question')).toBeTruthy();
    });
  });

  test('Adds group on click', async () => {
    await setup({
      questionnaire: { resourceType: 'Questionnaire', status: 'active' },
      onSubmit: vi.fn(),
    });

    await waitFor(() => {
      expect(screen.getByText('Add group')).toBeTruthy();
    });

    fireEvent.click(screen.getByText('Add group'));

    await waitFor(() => {
      expect(screen.getByText('Group')).toBeTruthy();
    });
  });

  test('Adds page on click', async () => {
    await setup({
      questionnaire: { resourceType: 'Questionnaire', status: 'active' },
      onSubmit: vi.fn(),
    });

    await waitFor(() => {
      expect(screen.getByText('Add Page')).toBeTruthy();
    });

    fireEvent.click(screen.getByText('Add Page'));

    await waitFor(() => {
      expect(screen.getByText('New Page')).toBeTruthy();
    });
  });

  test('Calls onSubmit when form is submitted', async () => {
    const onSubmit = vi.fn();

    await setup({
      questionnaire: { resourceType: 'Questionnaire', status: 'active' },
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

  test('Renders with title', async () => {
    await setup({
      questionnaire: {
        resourceType: 'Questionnaire',
        status: 'active',
        title: 'My Questionnaire',
      },
      onSubmit: vi.fn(),
    });

    await waitFor(() => {
      expect(screen.getByText('My Questionnaire')).toBeTruthy();
    });
  });

  test('Renders question types', async () => {
    await setup({
      questionnaire: {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          { linkId: 'q1', type: 'string', text: 'String Question' },
          { linkId: 'q2', type: 'boolean', text: 'Boolean Question' },
          { linkId: 'q3', type: 'date', text: 'Date Question' },
        ],
      },
      onSubmit: vi.fn(),
    });

    await waitFor(() => {
      expect(screen.getByText('String Question')).toBeTruthy();
      // Boolean questions render text multiple times (title + label), use getAllByText
      expect(screen.getAllByText('Boolean Question').length).toBeGreaterThan(0);
      expect(screen.getByText('Date Question')).toBeTruthy();
    });
  });

  test('Renders choice question with options', async () => {
    await setup({
      questionnaire: {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'q1',
            type: 'choice',
            text: 'Choice Question',
            answerOption: [
              { valueString: 'Option A' },
              { valueString: 'Option B' },
            ],
          },
        ],
      },
      onSubmit: vi.fn(),
    });

    await waitFor(() => {
      expect(screen.getByText('Choice Question')).toBeTruthy();
    });
  });

  test('AutoSave flag triggers onSubmit when adding item', async () => {
    const onSubmit = vi.fn();

    await setup({
      questionnaire: {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [{ linkId: 'q1', type: 'string', text: 'Question 1' }],
      },
      onSubmit,
      autoSave: true,
    });

    await waitFor(() => {
      expect(screen.getByText('Add item')).toBeTruthy();
    });

    fireEvent.click(screen.getByText('Add item'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  test('Renders nested groups', async () => {
    await setup({
      questionnaire: {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'outer',
            text: 'Outer Group',
            type: 'group',
            item: [
              {
                linkId: 'inner',
                text: 'Inner Group',
                type: 'group',
                item: [
                  { linkId: 'q1', text: 'Nested Question', type: 'string' },
                ],
              },
            ],
          },
        ],
      },
      onSubmit: vi.fn(),
    });

    await waitFor(() => {
      expect(screen.getByText('Outer Group')).toBeTruthy();
      expect(screen.getByText('Inner Group')).toBeTruthy();
      expect(screen.getByText('Nested Question')).toBeTruthy();
    });
  });

  test('Renders with repeating items', async () => {
    await setup({
      questionnaire: {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'q1',
            text: 'Repeating Question',
            type: 'string',
            repeats: true,
          },
        ],
      },
      onSubmit: vi.fn(),
    });

    await waitFor(() => {
      expect(screen.getByText('Repeating Question')).toBeTruthy();
    });
  });

  test('Handles questionnaire with no items', async () => {
    const onSubmit = vi.fn();

    await setup({
      questionnaire: {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [],
      },
      onSubmit,
    });

    await waitFor(() => {
      expect(screen.getByTestId('questionnaire-form')).toBeTruthy();
    });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });
});
