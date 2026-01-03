// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { CodeableConceptDisplay } from './CodeableConceptDisplay';
import type { CodeableConcept } from '@medplum/fhirtypes';

describe('CodeableConceptDisplay', () => {
  test('Renders empty when value is undefined', () => {
    render(() => <CodeableConceptDisplay />);
    expect(document.body.textContent).toBe('');
  });

  test('Renders codeable concept text', () => {
    const cc: CodeableConcept = {
      text: 'Hypertension',
    };
    render(() => <CodeableConceptDisplay value={cc} />);
    expect(screen.getByText('Hypertension')).toBeTruthy();
  });

  test('Renders from coding display', () => {
    const cc: CodeableConcept = {
      coding: [
        {
          system: 'http://snomed.info/sct',
          code: '38341003',
          display: 'Hypertensive disorder',
        },
      ],
    };
    render(() => <CodeableConceptDisplay value={cc} />);
    expect(screen.getByText('Hypertensive disorder')).toBeTruthy();
  });
});
