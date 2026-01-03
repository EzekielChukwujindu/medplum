// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { createReference, locationUtils } from '@medplum/core';
import { HomerEncounter, HomerSimpson, MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import { SmartAppLaunchLink } from './SmartAppLaunchLink';

const medplum = new MockClient();

describe('SmartAppLaunchLink', () => {
  test('Happy path', async () => {
    const mockAssign = vi.fn();
    locationUtils.assign = mockAssign;

    render(() => (
      <MedplumProvider medplum={medplum}>
        <SmartAppLaunchLink
          client={{ resourceType: 'ClientApplication', launchUri: 'https://example.com' }}
          patient={createReference(HomerSimpson)}
          encounter={createReference(HomerEncounter)}
        >
          My SmartAppLaunchLink
        </SmartAppLaunchLink>
      </MedplumProvider>
    ));

    await waitFor(() => {
      expect(screen.getByText('My SmartAppLaunchLink')).toBeTruthy();
    });

    fireEvent.click(screen.getByText('My SmartAppLaunchLink'));

    await waitFor(() => {
      expect(mockAssign).toHaveBeenCalled();
    });

    const url = mockAssign.mock.calls[0][0];
    expect(url).toContain('https://example.com');
    expect(url).toContain('launch=');
    expect(url).toContain('iss=');
  });

  test('Renders children', async () => {
    render(() => (
      <MedplumProvider medplum={medplum}>
        <SmartAppLaunchLink
          client={{ resourceType: 'ClientApplication', launchUri: 'https://example.com' }}
        >
          Launch App
        </SmartAppLaunchLink>
      </MedplumProvider>
    ));

    await waitFor(() => {
      expect(screen.getByText('Launch App')).toBeTruthy();
    });
  });
});
