// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { Timing } from '@medplum/fhirtypes';
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import type { TimingInputProps } from './TimingInput';
import { TimingInput } from './TimingInput';

describe('TimingInput', () => {
  const defaultProps: Pick<TimingInputProps, 'name'> = { name: 'example' };

  test('Renders', async () => {
    render(() => <TimingInput {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('No repeat')).toBeTruthy();
      expect(screen.getByText('Edit')).toBeTruthy();
    });
  });

  test('Open dialog', async () => {
    render(() => <TimingInput {...defaultProps} />);
    expect(screen.getByText('Edit')).toBeTruthy();

    fireEvent.click(screen.getByText('Edit'));

    await waitFor(() => {
      expect(screen.getByText('Timing')).toBeTruthy();
    });
  });

  test('Cancel', async () => {
    const onChange = vi.fn();

    render(() => <TimingInput {...defaultProps} onChange={onChange} />);
    expect(screen.getByText('Edit')).toBeTruthy();

    fireEvent.click(screen.getByText('Edit'));

    await waitFor(() => {
      const closeButton = screen.getByLabelText('Close');
      expect(closeButton).toBeTruthy();
    });

    fireEvent.click(screen.getByLabelText('Close'));

    await waitFor(() => {
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  test('Add repeat', async () => {
    const onChange = vi.fn();

    render(() => <TimingInput {...defaultProps} defaultValue={{}} onChange={onChange} />);
    expect(screen.getByText('Edit')).toBeTruthy();

    fireEvent.click(screen.getByText('Edit'));

    await waitFor(() => {
      expect(screen.getByText('Timing')).toBeTruthy();
    });

    fireEvent.click(screen.getByLabelText('Repeat'));

    fireEvent.click(screen.getByText('OK'));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
  });

  test('Remove repeat', async () => {
    const onChange = vi.fn();

    render(() => <TimingInput {...defaultProps} defaultValue={{ repeat: { period: 1, periodUnit: 'd' } }} onChange={onChange} />);
    expect(screen.getByText('Edit')).toBeTruthy();

    fireEvent.click(screen.getByText('Edit'));

    await waitFor(() => {
      expect(screen.getByText('Timing')).toBeTruthy();
    });

    fireEvent.click(screen.getByLabelText('Repeat'));

    fireEvent.click(screen.getByText('OK'));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
  });

  test('Change period', async () => {
    const onChange = vi.fn();

    render(() => <TimingInput {...defaultProps} onChange={onChange} defaultModalOpen />);

    await waitFor(() => {
      expect(screen.getByText('Timing')).toBeTruthy();
    });

    // Change the period value
    const periodInput = screen.getByDisplayValue('1');
    fireEvent.change(periodInput, { target: { value: '2' } });

    fireEvent.click(screen.getByText('OK'));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
  });

  test('Loading a complex timing into the editor', async () => {
    const timing: Timing = {
      repeat: {
        period: 1,
        periodUnit: 'wk',
        dayOfWeek: ['mon', 'wed'],
        timeOfDay: ['08:00:00', '14:30:55'],
      },
    };
    render(() => <TimingInput {...defaultProps} defaultValue={timing} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('timinginput-display')).toBeTruthy();
    });

    expect(screen.getByText('Edit')).toBeTruthy();
  });
});
