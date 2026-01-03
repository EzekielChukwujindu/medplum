// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, waitFor } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { ContactDetailDisplay } from './ContactDetailDisplay';

describe('ContactDetailDisplay', () => {
  test('Handles undefined value', () => {
    const { container } = render(() => <ContactDetailDisplay />);
    expect(container).toBeTruthy();
  });

  test('Handles empty value', () => {
    const { container } = render(() => <ContactDetailDisplay value={{}} />);
    expect(container).toBeTruthy();
  });

  test('Renders named value', async () => {
    render(() => <ContactDetailDisplay value={{ name: 'Foo', telecom: [{ value: 'homer@example.com' }] }} />);
    
    await waitFor(() => {
      expect(screen.getByText('Foo', { exact: false })).toBeTruthy();
      expect(screen.getByText('homer@example.com', { exact: false })).toBeTruthy();
    });
  });
});
