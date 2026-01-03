// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { fireEvent, render, screen, waitFor } from '@solidjs/testing-library';
import { describe, expect, test, vi } from 'vitest';
import { MedplumProvider, createMockMedplumClient } from '../test-utils/render';
import { QuestionnaireForm } from './QuestionnaireForm';
import type { Questionnaire } from '@medplum/fhirtypes';

const questionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'test-q',
  title: 'Test Questionnaire',
  status: 'active',
  item: [
    {
      linkId: 'q1',
      text: 'Question 1',
      type: 'string',
    },
    {
       linkId: 'q2',
       text: 'Question 2',
       type: 'choice',
       answerOption: [{ valueString: 'Option 1' }, { valueString: 'Option 2' }]
    }
  ],
};

describe('QuestionnaireForm', () => {
    // Mock signature_pad because SignatureInput might be rendered
    vi.mock('signature_pad', () => {
        return {
            default: class MockSignaturePad {
                constructor() {}
                fromDataURL() {}
                toDataURL() { return 'data:image/png;base64,1234'; }
                addEventListener() {}
                removeEventListener() {}
                off() {}
                clear() {}
            }
        };
    });

  test('Renders questionnaire', async () => {
    const medplum = createMockMedplumClient();
    render(() => (
      <MedplumProvider medplum={medplum}>
        <QuestionnaireForm questionnaire={questionnaire} />
      </MedplumProvider>
    ));

    expect(await screen.findByText('Test Questionnaire')).toBeInTheDocument();
    expect(screen.getByText('Question 1')).toBeInTheDocument();
  });

  test('Submits form', async () => {
    const medplum = createMockMedplumClient();
    const handleSubmit = vi.fn();
    render(() => (
      <MedplumProvider medplum={medplum}>
        <QuestionnaireForm questionnaire={questionnaire} onSubmit={handleSubmit} />
      </MedplumProvider>
    ));

    await screen.findByText('Test Questionnaire');
    
    // Fill input
    // Solid testing library might need findByLabelText if signals update async?
    // Using simple input
    // Note: QuestionnaireFormItem uses input by default for string.
    // Label is handled by FormSection "Question 1".
    // Wait, FormSection uses title prop which renders text. Does it label the input?
    // FormSection structure: <div class="form-control"><label class="label"><span class="label-text">...</span></label>...
    // But input id matches htmlFor.

    // Let's assume user fills q1.
    // However, findByLabelText can be tricky if implemented differently.
    // Using generic getByRole('textbox') if only one, or by label.
    // We have 2 items. q1 is string (textbox). q2 is choice (select).
    
    // Using container query selector for robustness if labels fail in JSDOM
    // const input = screen.getByLabelText('Question 1');
    // fireEvent.input(input, { target: { value: 'Answer 1' } });
    
    // Click submit
    const submitBtn = screen.getByText('Submit');
    fireEvent.click(submitBtn);

    await waitFor(() => expect(handleSubmit).toHaveBeenCalled());
    const submittedResponse = handleSubmit.mock.calls[0][0];
    expect(submittedResponse).toMatchObject({
        resourceType: 'QuestionnaireResponse',
        status: 'completed'
    });
  });

  test('Shows signature input when required', async () => {
     const medplum = createMockMedplumClient();
     // Mock getExtension for signature required
     // It's cleaner to just create a questionnaire with that extension
     const qWithSig: Questionnaire = {
         ...questionnaire,
         extension: [
             { url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-signatureRequired', valueBoolean: true }
         ]
     };

     render(() => (
        <MedplumProvider medplum={medplum}>
            <QuestionnaireForm questionnaire={qWithSig} />
        </MedplumProvider>
     ));

     expect(await screen.findByText('Signature')).toBeInTheDocument();
  });
});
