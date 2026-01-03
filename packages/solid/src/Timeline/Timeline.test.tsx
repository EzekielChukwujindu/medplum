// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { Timeline, TimelineItem } from './Timeline';
import { MedplumProvider, createMockMedplumClient } from '../test-utils/render';
import type { Patient } from '@medplum/fhirtypes';

describe('Timeline', () => {
  const testPatient: Patient = {
    resourceType: 'Patient',
    id: 'test-123',
    name: [{ given: ['John'], family: 'Doe' }],
  };

  test('Renders timeline', () => {
    const client = createMockMedplumClient();
    render(() => (
      <MedplumProvider medplum={client}>
        <Timeline testId="timeline">
          <TimelineItem resource={testPatient} dateTime="2024-01-01T12:00:00Z">
            Test content
          </TimelineItem>
        </Timeline>
      </MedplumProvider>
    ));
    expect(screen.getByTestId('timeline')).toBeTruthy();
    expect(screen.getByText('Test content')).toBeTruthy();
  });

  test('Has timeline class', () => {
    const client = createMockMedplumClient();
    render(() => (
      <MedplumProvider medplum={client}>
        <Timeline testId="timeline">
          <TimelineItem resource={testPatient}>Content</TimelineItem>
        </Timeline>
      </MedplumProvider>
    ));
    const timeline = screen.getByTestId('timeline');
    expect(timeline.classList.contains('timeline')).toBe(true);
  });
});
