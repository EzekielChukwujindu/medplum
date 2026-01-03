// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import { NativeSelect } from './NativeSelect';

describe('NativeSelect', () => {
  test('Renders options', () => {
    render(() => <NativeSelect data={['option1', 'option2']} testId="select" />);
    const select = screen.getByTestId('select') as HTMLSelectElement;
    expect(select.options.length).toBe(2);
  });

  test('Renders with object options', () => {
    const data = [
      { label: 'Option A', value: 'a' },
      { label: 'Option B', value: 'b' },
    ];
    render(() => <NativeSelect data={data} testId="select" />);
    expect(screen.getByText('Option A')).toBeTruthy();
    expect(screen.getByText('Option B')).toBeTruthy();
  });

  test('Calls onChange', () => {
    const handleChange = vi.fn();
    render(() => <NativeSelect data={['', 'home', 'work']} onChange={handleChange} testId="select" />);
    const select = screen.getByTestId('select');
    fireEvent.change(select, { target: { value: 'home' } });
    expect(handleChange).toHaveBeenCalledWith('home');
  });

  test('Renders disabled', () => {
    render(() => <NativeSelect data={['option1']} disabled testId="select" />);
    const select = screen.getByTestId('select') as HTMLSelectElement;
    expect(select.disabled).toBe(true);
  });

  test('Shows error', () => {
    render(() => <NativeSelect data={['option1']} error="Required" testId="select" />);
    expect(screen.getByText('Required')).toBeTruthy();
  });
});
