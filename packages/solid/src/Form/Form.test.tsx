// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import { Form, useFormContext } from './Form';
import type { JSX } from 'solid-js';

function SubmitButton(): JSX.Element {
  const { submitting } = useFormContext();
  return <button type="submit" disabled={submitting()}>{submitting() ? 'Submitting...' : 'Submit'}</button>;
}

describe('Form', () => {
  test('Renders children', () => {
    render(() => (
      <Form>
        <input name="test" data-testid="input" />
      </Form>
    ));
    expect(screen.getByTestId('input')).toBeTruthy();
  });

  test('Calls onSubmit with form data', async () => {
    const handleSubmit = vi.fn();
    render(() => (
      <Form onSubmit={handleSubmit} testid="form">
        <input name="email" value="test@example.com" />
        <button type="submit">Submit</button>
      </Form>
    ));
    
    fireEvent.submit(screen.getByTestId('form'));
    
    expect(handleSubmit).toHaveBeenCalledWith({ email: 'test@example.com' });
  });

  test('Provides submitting context', async () => {
    const handleSubmit = vi.fn((): Promise<void> => new Promise((resolve) => setTimeout(resolve, 100)));
    render(() => (
      <Form onSubmit={handleSubmit} testid="form">
        <SubmitButton />
      </Form>
    ));
    
    expect(screen.getByText('Submit')).toBeTruthy();
    
    fireEvent.submit(screen.getByTestId('form'));
    
    await waitFor(() => {
      expect(screen.getByText('Submitting...')).toBeTruthy();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Submit')).toBeTruthy();
    }, { timeout: 200 });
  });

  test('Sets submitting to false after sync submit', () => {
    const handleSubmit = vi.fn();
    render(() => (
      <Form onSubmit={handleSubmit} testid="form">
        <SubmitButton />
      </Form>
    ));
    
    fireEvent.submit(screen.getByTestId('form'));
    
    // Should be back to not submitting immediately for sync handlers
    expect(screen.getByText('Submit')).toBeTruthy();
  });

  test('Applies testid', () => {
    render(() => <Form testid="my-form">Content</Form>);
    expect(screen.getByTestId('my-form')).toBeTruthy();
  });
});
