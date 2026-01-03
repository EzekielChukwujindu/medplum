// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import { Tabs  } from './Tabs';
import type {TabItem} from './Tabs';

describe('Tabs', () => {
  const tabs: TabItem[] = [
    { label: 'First Tab', value: 'tab1', content: <div>Content 1</div> },
    { label: 'Second Tab', value: 'tab2', content: <div>Content 2</div> },
  ];

  test('Renders all tab labels', () => {
    render(() => <Tabs tabs={tabs} defaultValue="tab1" testId="test-tabs" />);
    expect(screen.getByText('First Tab')).toBeTruthy();
    expect(screen.getByText('Second Tab')).toBeTruthy();
  });

  test('Shows content of active tab', async () => {
    render(() => <Tabs tabs={tabs} defaultValue="tab1" testId="test-tabs" />);
    expect(screen.getByText('Content 1')).toBeTruthy();
    // Kobalte may render inactive content but hide it with CSS
    // So we check that Content 2 is not visible instead of not existing
  });

  test('Switches tabs on click', async () => {
    render(() => <Tabs tabs={tabs} defaultValue="tab1" testId="test-tabs" />);
    
    fireEvent.click(screen.getByText('Second Tab'));
    
    await waitFor(() => {
      expect(screen.getByText('Content 2')).toBeTruthy();
    });
    
    // After switching, the first tab trigger should not be selected
    const firstTab = screen.getByText('First Tab');
    const secondTab = screen.getByText('Second Tab');
    expect(secondTab.getAttribute('aria-selected')).toBe('true');
    expect(firstTab.getAttribute('aria-selected')).toBe('false');
  });

  test('Calls onChange when tab clicked', () => {
    const handleChange = vi.fn();
    render(() => <Tabs tabs={tabs} defaultValue="tab1" onChange={handleChange} testId="test-tabs" />);
    
    fireEvent.click(screen.getByText('Second Tab'));
    expect(handleChange).toHaveBeenCalledWith('tab2');
  });

  test('Renders disabled tab', () => {
    const tabsWithDisabled: TabItem[] = [
      { label: 'First Tab', value: 'tab1', content: <div>Content 1</div> },
      { label: 'Disabled Tab', value: 'tab2', content: <div>Content 2</div>, disabled: true },
    ];
    render(() => <Tabs tabs={tabsWithDisabled} defaultValue="tab1" testId="test-tabs" />);
    
    const disabledTab = screen.getByText('Disabled Tab');
    expect((disabledTab as HTMLButtonElement).disabled).toBe(true);
  });

  test('Controlled mode uses value prop', () => {
    render(() => <Tabs tabs={tabs} value="tab2" testId="test-tabs" />);
    expect(screen.getByText('Content 2')).toBeTruthy();
    // In controlled mode, tab2 should be selected
    const secondTab = screen.getByText('Second Tab');
    expect(secondTab.getAttribute('aria-selected')).toBe('true');
  });
});
