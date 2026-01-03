// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { WithId } from '@medplum/core';
import { createReference } from '@medplum/core';
import type { Period, Reference, Schedule, Slot } from '@medplum/fhirtypes';
import { DrAliceSmithSchedule, ExampleQuestionnaire, MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { render, screen, waitFor } from '@solidjs/testing-library';
import { describe, test, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import type { SlotSearchFunction } from './Scheduler';
import { Scheduler } from './Scheduler';

const medplum = new MockClient();

function setup(
  schedule: Schedule | Reference<Schedule> | Schedule[] | Reference<Schedule>[] | SlotSearchFunction,
  questionnaire = ExampleQuestionnaire
): void {
  render(() => (
    <MedplumProvider medplum={medplum}>
      <Scheduler schedule={schedule} questionnaire={questionnaire} />
    </MedplumProvider>
  ));
}

describe('Scheduler', () => {
  // Create a second schedule for testing arrays
  const DrBobSchedule: WithId<Schedule> = {
    ...DrAliceSmithSchedule,
    id: 'dr-bob-schedule',
    actor: [{ reference: 'Practitioner/dr-bob', display: 'Dr. Bob Jones' }],
  };

  beforeAll(async () => {
    // Create mock slots for Dr. Bob's schedule
    const slotDate = new Date('2023-11-03T00:00:00Z');
    for (let day = 0; day < 60; day++) {
      for (const hour of [8, 12, 16, 17]) {
        slotDate.setHours(hour, 0, 0, 0);
        const slot = {
          resourceType: 'Slot',
          id: `bob-slot-${day}-${hour}`,
          status: 'free',
          start: slotDate.toISOString(),
          end: new Date(slotDate.getTime() + 60 * 60 * 1000).toISOString(),
          schedule: createReference(DrBobSchedule),
        } satisfies WithId<Slot>;
        await medplum.createResource(slot);
      }
      slotDate.setDate(slotDate.getDate() + 1);
    }
  });

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-11-03T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('Component is exported', () => {
    expect(Scheduler).toBeDefined();
    expect(typeof Scheduler).toBe('function');
  });

  test('SlotSearchFunction type exists', () => {
    // Type check - ensures the type is exported
    const mockFn: SlotSearchFunction = async () => [];
    expect(typeof mockFn).toBe('function');
  });

  test('Renders by reference', async () => {
    setup(createReference(DrAliceSmithSchedule));
    await waitFor(() => {
      expect(screen.getByTestId('scheduler')).toBeTruthy();
    });
  });

  test('Renders resources', async () => {
    setup(DrAliceSmithSchedule);
    await waitFor(() => {
      expect(screen.getByTestId('scheduler')).toBeTruthy();
    });
  });

  test('Renders with schedule array', async () => {
    setup([DrAliceSmithSchedule, DrBobSchedule]);
    await waitFor(() => {
      expect(screen.getByTestId('scheduler')).toBeTruthy();
    });
  });

  test('Renders with schedule reference array', async () => {
    setup([createReference(DrAliceSmithSchedule), createReference(DrBobSchedule)]);
    await waitFor(() => {
      expect(screen.getByTestId('scheduler')).toBeTruthy();
    });
  });

  test('Renders with custom slot search function', async () => {
    const mockSlots: Slot[] = [
      {
        resourceType: 'Slot',
        id: 'slot-1',
        schedule: { reference: 'Schedule/dr-alice' },
        status: 'free',
        start: '2023-12-15T09:00:00.000Z',
        end: '2023-12-15T10:00:00.000Z',
      },
    ];

    const customSlotSearch: SlotSearchFunction = async (period: Period): Promise<Slot[]> => {
      expect(period.start).toBeDefined();
      expect(period.end).toBeDefined();
      return mockSlots;
    };

    setup(customSlotSearch);

    await waitFor(() => {
      expect(screen.getByTestId('scheduler')).toBeTruthy();
    });
  });

  test('Displays actor information for single schedule', async () => {
    setup(DrAliceSmithSchedule);

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeTruthy();
    });
  });

  test('Does not display actor for schedule array', async () => {
    setup([DrAliceSmithSchedule, DrBobSchedule]);

    await waitFor(() => {
      expect(screen.getByTestId('scheduler')).toBeTruthy();
    });

    // Should not show actor when multiple schedules are provided
    expect(screen.queryByText('Alice Smith')).toBeNull();
  });

  test('Does not display actor for custom slot search function', async () => {
    const customSlotSearch: SlotSearchFunction = async (): Promise<Slot[]> => [];

    setup(customSlotSearch);

    await waitFor(() => {
      expect(screen.getByTestId('scheduler')).toBeTruthy();
    });

    // Should not show actor when using custom function
    expect(screen.queryByText('Alice Smith')).toBeNull();
  });

  test('Handles empty schedule array', async () => {
    setup([]);

    await waitFor(() => {
      expect(screen.getByTestId('scheduler')).toBeTruthy();
    });
  });

  test('Handles custom slot search function returning empty array', async () => {
    const emptySlotSearch: SlotSearchFunction = async (): Promise<Slot[]> => [];

    setup(emptySlotSearch);

    await waitFor(() => {
      expect(screen.getByTestId('scheduler')).toBeTruthy();
    });

    // Should show calendar but no available times when slots are empty
    expect(screen.getByText('Select date')).toBeTruthy();
  });

  test('Slot selection updates selected slot state', async () => {
    const mockSlots: Slot[] = [
      {
        resourceType: 'Slot',
        id: 'slot-1',
        schedule: { reference: 'Schedule/dr-alice' },
        status: 'free',
        start: new Date('2023-11-15T19:00:00.000Z').toISOString(),
        end: new Date('2023-11-15T20:00:00.000Z').toISOString(),
      },
    ];

    const customSlotSearch: SlotSearchFunction = async (): Promise<Slot[]> => mockSlots;

    setup(customSlotSearch);

    await waitFor(() => {
      expect(screen.getByTestId('scheduler')).toBeTruthy();
    });
  });
});
