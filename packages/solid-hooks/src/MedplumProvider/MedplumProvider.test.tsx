// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { ProfileResource } from '@medplum/core';
import { ClientStorage, MemoryStorage, MockAsyncClientStorage, getDisplayString, sleep } from '@medplum/core';
import { FhirRouter, MemoryRepository } from '@medplum/fhir-router';
import { MockClient, MockFetchClient, createFakeJwt } from '@medplum/mock';
import { render, screen } from '@solidjs/testing-library';
import { createEffect, createSignal, onMount, type JSX } from 'solid-js';
import { describe, expect, test, vi } from 'vitest';
import { MedplumProvider } from './MedplumProvider';
import { useMedplum, useMedplumContext, useMedplumNavigate, useMedplumProfile } from './MedplumProvider.context';

describe('MedplumProvider', () => {
  test('Renders component', () => {
    function MyComponent(): JSX.Element {
      const medplum = useMedplum();
      const context = useMedplumContext();
      const navigate = useMedplumNavigate();
      const profile = useMedplumProfile();

      return (
        <div>
          <div>MyComponent</div>
          <div>{getDisplayString(medplum.getProfile() as ProfileResource)}</div>
          <div>Context: {Boolean(context).toString()}</div>
          <div>Navigate: {Boolean(navigate).toString()}</div>
          <div>Profile: {Boolean(profile).toString()}</div>
        </div>
      );
    }

    render(() => (
      <MedplumProvider medplum={new MockClient()}>
        <MyComponent />
      </MedplumProvider>
    ));

    expect(screen.getByText('MyComponent')).toBeInTheDocument();
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Context: true')).toBeInTheDocument();
    expect(screen.getByText('Navigate: true')).toBeInTheDocument();
    expect(screen.getByText('Profile: true')).toBeInTheDocument();
  });

  describe('Loading is always in sync with MedplumClient#isLoading()', () => {
    function MyComponent(): JSX.Element {
      const context = useMedplumContext();
      return <div>{context.loading ? 'Loading...' : 'Loaded!'}</div>;
    }

    test('No active login & AsyncClientStorage', async () => {
      const storage = new MockAsyncClientStorage();
      const medplum = new MockClient({ storage });

      expect(medplum.isLoading()).toEqual(true);

      render(() => (
        <MedplumProvider medplum={medplum}>
          <MyComponent />
        </MedplumProvider>
      ));

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      await sleep(250);
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      storage.setInitialized();
      expect(await screen.findByText('Loaded!')).toBeInTheDocument();
      expect(medplum.isLoading()).toEqual(false);
    });

    test('Active login & AsyncClientStorage', async () => {
      const storage = new MockAsyncClientStorage();
      storage.setObject('activeLogin', {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyLCJsb2dpbl9pZCI6InRlc3RpbmcxMjMifQ.lJGCbp2taTarRbamxaKFsTR_VRVgzvttKMmI5uFQSM0',
        refreshToken: '456',
        profile: { reference: 'Practitioner/123' },
        project: { reference: 'Project/123' },
      });
      const medplum = new MockClient({ storage });
      const getSpy = vi.spyOn(medplum, 'get');

      render(() => (
        <MedplumProvider medplum={medplum}>
          <MyComponent />
        </MedplumProvider>
      ));

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      storage.setInitialized();
      
      expect(await screen.findByText('Loaded!')).toBeInTheDocument();
      expect(medplum.isLoading()).toEqual(false);
      expect(getSpy).toHaveBeenCalledWith('auth/me', expect.any(Object));
    });

    test('Refreshing profile re-triggers loading when no profile present', async () => {
      const baseUrl = 'https://example.com/';
      const storage = new ClientStorage(new MemoryStorage());
      storage.setObject('activeLogin', {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyLCJsb2dpbl9pZCI6InRlc3RpbmcxMjMifQ.lJGCbp2taTarRbamxaKFsTR_VRVgzvttKMmI5uFQSM0',
        refreshToken: '456',
        profile: { reference: 'Practitioner/123' },
        project: { reference: 'Project/123' },
      });

      const router = new FhirRouter();
      const repo = new MemoryRepository();
      const client = new MockFetchClient(router, repo, baseUrl);
      const medplum = new MockClient({ storage, mockFetchOverride: { router, repo, client } });
      const mockFetchSpy = vi.spyOn(client, 'mockFetch');
      const dispatchEventSpy = vi.spyOn(medplum, 'dispatchEvent');

      render(() => (
        <MedplumProvider medplum={medplum}>
          <MyComponent />
        </MedplumProvider>
      ));

      expect(await screen.findByText('Loaded!')).toBeInTheDocument();
      
      medplum.clearActiveLogin();
      medplum.setAccessToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
      
      const loginPromise = medplum.setActiveLogin({
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: '456',
        profile: { reference: 'Practitioner/123' },
        project: { reference: 'Project/123' },
      });

      expect(await screen.findByText('Loading...')).toBeInTheDocument();
      await loginPromise;
      expect(await screen.findByText('Loaded!')).toBeInTheDocument();
      expect(dispatchEventSpy).toHaveBeenCalledWith({ type: 'profileRefreshed' });
    });
  });
});