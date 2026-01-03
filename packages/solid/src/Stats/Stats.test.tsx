// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { Stats  } from './Stats';
import type {StatItem} from './Stats';

describe('Stats', () => {
  const stats: StatItem[] = [
    { title: 'Total Users', value: 1234 },
    { title: 'Revenue', value: '$5,000', valueColor: 'success' },
    { title: 'Tasks', value: 42, desc: 'Active tasks' },
  ];

  test('Renders all stats', () => {
    render(() => <Stats stats={stats} testId="stats" />);
    expect(screen.getByText('Total Users')).toBeTruthy();
    expect(screen.getByText('1234')).toBeTruthy();
    expect(screen.getByText('Revenue')).toBeTruthy();
    expect(screen.getByText('$5,000')).toBeTruthy();
  });

  test('Renders description', () => {
    render(() => <Stats stats={stats} testId="stats" />);
    expect(screen.getByText('Active tasks')).toBeTruthy();
  });

  test('Applies value color', () => {
    render(() => <Stats stats={stats} testId="stats" />);
    const revenue = screen.getByText('$5,000');
    expect(revenue.classList.contains('text-success')).toBe(true);
  });

  test('Has stats class', () => {
    render(() => <Stats stats={stats} testId="stats" />);
    const container = screen.getByTestId('stats');
    expect(container.classList.contains('stats')).toBe(true);
  });

  test('Applies vertical direction', () => {
    render(() => <Stats stats={stats} direction="vertical" testId="stats" />);
    const container = screen.getByTestId('stats');
    expect(container.classList.contains('stats-vertical')).toBe(true);
  });
});
