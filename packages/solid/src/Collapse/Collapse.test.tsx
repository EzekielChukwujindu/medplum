// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import { Collapse, Accordion  } from './Collapse';
import type {AccordionItem} from './Collapse';

describe('Collapse', () => {
  test('Renders title', () => {
    render(() => (
      <Collapse title="Section Title" testId="collapse">
        Content here
      </Collapse>
    ));
    expect(screen.getByText('Section Title')).toBeTruthy();
  });

  test('Renders content when opened', async () => {
    render(() => (
      <Collapse title="Title" testId="collapse" defaultOpen>
        Hidden content
      </Collapse>
    ));
    await waitFor(() => {
      expect(screen.getByText('Hidden content')).toBeTruthy();
    });
  });

  test('Starts closed by default', () => {
    render(() => (
      <Collapse title="Title" testId="collapse">
        Content
      </Collapse>
    ));
    // Kobalte uses button with aria-expanded instead of checkbox
    const button = screen.getByRole('button', { name: 'Title' });
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  test('Starts open when defaultOpen is true', async () => {
    render(() => (
      <Collapse title="Title" testId="collapse" defaultOpen>
        Content
      </Collapse>
    ));
    const button = screen.getByRole('button', { name: 'Title' });
    expect(button.getAttribute('aria-expanded')).toBe('true');
    await waitFor(() => {
      expect(screen.getByText('Content')).toBeTruthy();
    });
  });

  test('Calls onToggle when clicked', async () => {
    const handleToggle = vi.fn();
    render(() => (
      <Collapse title="Title" testId="collapse" onToggle={handleToggle}>
        Content
      </Collapse>
    ));
    const button = screen.getByRole('button', { name: 'Title' });
    fireEvent.click(button);
    await waitFor(() => {
      expect(handleToggle).toHaveBeenCalledWith(true);
    });
  });
});

describe('Accordion', () => {
  const items: AccordionItem[] = [
    { key: 'a', title: 'Item A', content: <div>Content A</div> },
    { key: 'b', title: 'Item B', content: <div>Content B</div> },
    { key: 'c', title: 'Item C', content: <div>Content C</div> },
  ];

  test('Renders all items', () => {
    render(() => <Accordion items={items} testId="accordion" />);
    expect(screen.getByText('Item A')).toBeTruthy();
    expect(screen.getByText('Item B')).toBeTruthy();
    expect(screen.getByText('Item C')).toBeTruthy();
  });

  test('Content rendered when item is opened', async () => {
    render(() => <Accordion items={items} defaultOpen={['a']} testId="accordion" />);
    await waitFor(() => {
      expect(screen.getByText('Content A')).toBeTruthy();
    });
  });

  test('Respects defaultOpen', async () => {
    render(() => <Accordion items={items} defaultOpen={['b']} testId="accordion" />);
    // Kobalte uses buttons with aria-expanded instead of radios
    const buttons = screen.getAllByRole('button');
    expect(buttons[0].getAttribute('aria-expanded')).toBe('false');
    expect(buttons[1].getAttribute('aria-expanded')).toBe('true');
    expect(buttons[2].getAttribute('aria-expanded')).toBe('false');
    await waitFor(() => {
      expect(screen.getByText('Content B')).toBeTruthy();
    });
  });
});
