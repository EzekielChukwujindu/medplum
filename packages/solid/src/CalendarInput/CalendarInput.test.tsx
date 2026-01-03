// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { Slot } from '@medplum/fhirtypes';
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import { CalendarInput } from './CalendarInput';
import { getMonthString, getStartMonth } from './CalendarInput.utils';

describe('CalendarInput', () => {
  test('Renders', async () => {
    const onClick = vi.fn();
    render(() => <CalendarInput slots={[]} onChangeMonth={vi.fn()} onClick={onClick} />);
    
    await waitFor(() => {
      expect(screen.getByText(getMonthString(new Date()))).toBeTruthy();
      expect(screen.getByText('SUN')).toBeTruthy();
      expect(screen.getByText('1')).toBeTruthy();
    });
  });

  test('Disabled days', async () => {
    const onClick = vi.fn();
    render(() => <CalendarInput slots={[]} onChangeMonth={vi.fn()} onClick={onClick} />);
    
    await waitFor(() => {
      const dayButton = screen.getByRole('button', { name: '4' }) as HTMLButtonElement;
      expect(dayButton.disabled).toBe(true);
    });
  });

  test('Change months', async () => {
    const onChangeMonth = vi.fn();
    const onClick = vi.fn();
    render(() => <CalendarInput slots={[]} onChangeMonth={onChangeMonth} onClick={onClick} />);

    const nextMonth = getStartMonth();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // Move forward one month
    fireEvent.click(screen.getByLabelText('Next month'));

    await waitFor(() => {
      expect(onChangeMonth).toHaveBeenCalled();
      expect(screen.getByText(getMonthString(nextMonth))).toBeTruthy();
    });

    // Go back to the original month
    fireEvent.click(screen.getByLabelText('Previous month'));

    await waitFor(() => {
      expect(screen.getByText(getMonthString(new Date()))).toBeTruthy();
    });
  });

  test('Click day', async () => {
    const nextMonth = getStartMonth();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // Add a slot on the 15th of next month
    const startTime = new Date(nextMonth.getTime());
    startTime.setDate(15);
    startTime.setHours(12, 0, 0, 0);

    const slots: Slot[] = [
      {
        resourceType: 'Slot',
        start: startTime.toISOString(),
      },
    ] as Slot[];

    const onClick = vi.fn();
    render(() => <CalendarInput slots={slots} onChangeMonth={vi.fn()} onClick={onClick} />);

    // Move forward one month
    fireEvent.click(screen.getByLabelText('Next month'));

    await waitFor(() => {
      expect(screen.getByText(getMonthString(nextMonth))).toBeTruthy();
    });

    // Expect the 15th to be available
    const dayButton = screen.getByRole('button', { name: '15' }) as HTMLButtonElement;
    expect(dayButton.disabled).toBe(false);

    fireEvent.click(dayButton);

    await waitFor(() => {
      expect(onClick).toHaveBeenCalled();
      const result = onClick.mock.calls[0][0];
      expect(result.getDate()).toBe(15);
    });
  });
});
