// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { QuestionnaireResponse } from '@medplum/fhirtypes';
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { render, screen, waitFor } from '@solidjs/testing-library';
import { describe, expect, test, vi } from 'vitest';
import { QuestionnaireResponseDisplay } from './QuestionnaireResponseDisplay';

const medplum = new MockClient();

function setup(questionnaireResponse: QuestionnaireResponse | { reference: string; display?: string }): void {
  render(() => (
    <MedplumProvider medplum={medplum}>
      <QuestionnaireResponseDisplay questionnaireResponse={questionnaireResponse} />
    </MedplumProvider>
  ));
}

describe('QuestionnaireResponseDisplay', () => {
  test('Renders basic string and integer answers', async () => {
    setup({
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      item: [
        {
          linkId: 'name',
          text: 'What is your name?',
          answer: [{ valueString: 'John Doe' }],
        },
        {
          linkId: 'age',
          text: 'What is your age?',
          answer: [{ valueInteger: 30 }],
        },
      ],
    });

    await waitFor(() => {
      expect(screen.getByText('What is your name?')).toBeTruthy();
      expect(screen.getByText('John Doe')).toBeTruthy();
      expect(screen.getByText('What is your age?')).toBeTruthy();
      expect(screen.getByText('30')).toBeTruthy();
    });
  });

  test('Renders multiple answer types', async () => {
    setup({
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      item: [
        {
          linkId: 'name',
          text: 'Full Name',
          answer: [{ valueString: 'Alice Smith' }],
        },
        {
          linkId: 'height',
          text: 'Height',
          answer: [
            {
              valueQuantity: {
                value: 170,
                unit: 'cm',
                system: 'http://unitsofmeasure.org',
                code: 'cm',
              },
            },
          ],
        },
        {
          linkId: 'married',
          text: 'Are you married?',
          answer: [{ valueBoolean: true }],
        },
        {
          linkId: 'birthdate',
          text: 'Date of Birth',
          answer: [{ valueDateTime: '1998-03-15' }],
        },
      ],
    });

    await waitFor(() => {
      expect(screen.getByText('Full Name')).toBeTruthy();
      expect(screen.getByText('Alice Smith')).toBeTruthy();
      expect(screen.getByText('Height')).toBeTruthy();
      expect(screen.getByText('170 cm')).toBeTruthy();
      expect(screen.getByText('Are you married?')).toBeTruthy();
      expect(screen.getByText('True')).toBeTruthy();
      expect(screen.getByText('Date of Birth')).toBeTruthy();
      expect(screen.getByText('1998-03-15')).toBeTruthy(); // check formatting
    });
  });

  test('Renders coding answers', async () => {
    setup({
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      item: [
        {
          linkId: 'gender',
          text: 'Gender',
          answer: [
            {
              valueCoding: {
                system: 'http://hl7.org/fhir/administrative-gender',
                code: 'female',
                display: 'Female',
              },
            },
          ],
        },
      ],
    });

    await waitFor(() => {
      expect(screen.getByText('Gender')).toBeTruthy();
      expect(screen.getByText('Female')).toBeTruthy();
    });
  });

  test('Renders nested items', async () => {
    setup({
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      item: [
        {
          linkId: 'demographics',
          text: 'Demographics',
          item: [
            {
              linkId: 'name',
              text: 'Full Name',
              answer: [{ valueString: 'Jane Doe' }],
            },
          ],
        },
      ],
    });

    await waitFor(() => {
      expect(screen.getByText('Demographics')).toBeTruthy();
      expect(screen.getByText('Full Name')).toBeTruthy();
      expect(screen.getByText('Jane Doe')).toBeTruthy();
    });
  });

  test('Renders no answers', async () => {
    setup({
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      item: [
        {
          linkId: 'unanswered-1',
          text: 'This question was not answered',
        },
      ],
    });

    await waitFor(() => {
      expect(screen.getByText('This question was not answered')).toBeTruthy();
      expect(screen.getByText('No answer')).toBeTruthy();
    });
  });

  test('Handles reference prop', async () => {
    const mockQuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      id: 'test-response',
      status: 'completed',
      item: [
        {
          linkId: 'test-question',
          text: 'Test Question',
          answer: [{ valueString: 'Test Answer' }],
        },
      ],
    } as QuestionnaireResponse & { id: string };

    vi.spyOn(medplum, 'readResource').mockResolvedValue(mockQuestionnaireResponse);

    setup({
      reference: 'QuestionnaireResponse/test-response',
      display: 'Test Questionnaire Response',
    });

    await waitFor(() => {
      expect(screen.getByText('Test Question')).toBeTruthy();
      expect(screen.getByText('Test Answer')).toBeTruthy();
    });
  });
});
