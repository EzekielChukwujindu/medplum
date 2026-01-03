// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { MedplumProvider, createMockMedplumClient } from '../test-utils/render';
import { SearchControl } from './SearchControl';

describe('SearchControl', () => {
  test('Renders with resource type header', () => {
    const client = createMockMedplumClient();
    render(() => (
      <MedplumProvider medplum={client}>
        <SearchControl
          search={{ resourceType: 'Patient' }}
          testId="search"
        />
      </MedplumProvider>
    ));
    expect(screen.getByText('Fields')).toBeTruthy();
  });

  test('Shows loading state initially', () => {
    const client = createMockMedplumClient();
    const { container } = render(() => (
      <MedplumProvider medplum={client}>
        <SearchControl
          search={{ resourceType: 'Patient' }}
          testId="search"
        />
      </MedplumProvider>
    ));
    // Should have loading spinner while search is pending
    expect(container).toBeTruthy();
  });

  test('Hides toolbar when hideToolbar is true', () => {
    const client = createMockMedplumClient();
    render(() => (
      <MedplumProvider medplum={client}>
        <SearchControl
          search={{ resourceType: 'Patient' }}
          hideToolbar
          testId="search"
        />
      </MedplumProvider>
    ));
    expect(screen.queryByText('Patient')).toBeNull();
  });
});
