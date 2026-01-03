// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  test('Renders children', () => {
    render(() => <Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeTruthy();
  });

  test('Handles click events', () => {
    const handleClick = vi.fn();
    render(() => <Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('Applies primary variant by default', () => {
    render(() => <Button>Primary</Button>);
    const button = screen.getByRole('button');
    expect(button.classList.contains('btn-primary')).toBe(true);
  });

  test('Applies secondary variant', () => {
    render(() => <Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button');
    expect(button.classList.contains('btn-secondary')).toBe(true);
  });

  test('Applies size classes', () => {
    render(() => <Button size="lg">Large</Button>);
    const button = screen.getByRole('button');
    expect(button.classList.contains('btn-lg')).toBe(true);
  });

  test('Disables button when disabled prop is true', () => {
    render(() => <Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button.hasAttribute('disabled')).toBe(true);
  });

  test('Shows loading spinner when loading', () => {
    render(() => <Button loading>Loading</Button>);
    const spinner = document.querySelector('.loading-spinner');
    expect(spinner).toBeTruthy();
  });

  test('Disables button when loading', () => {
    render(() => <Button loading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button.hasAttribute('disabled')).toBe(true);
  });

  test('Applies custom class', () => {
    render(() => <Button class="custom-class">Custom</Button>);
    const button = screen.getByRole('button');
    expect(button.classList.contains('custom-class')).toBe(true);
  });

  test('Has correct type attribute', () => {
    render(() => <Button type="submit">Submit</Button>);
    const button = screen.getByRole('button');
    expect(button.getAttribute('type')).toBe('submit');
  });
});
