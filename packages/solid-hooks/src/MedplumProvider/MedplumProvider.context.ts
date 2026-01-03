// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { MedplumClient, ProfileResource } from '@medplum/core';
import { createContext, useContext } from 'solid-js';

export interface MedplumNavigateFunction {
  (path: string): void;
}

export interface MedplumContext {
  medplum: MedplumClient;
  navigate: MedplumNavigateFunction;
  profile?: ProfileResource;
  loading: boolean;
}

export const MedplumContext = createContext<MedplumContext>();

/**
 * Returns the MedplumContext instance.
 * @returns The MedplumContext instance.
 */
export function useMedplumContext(): MedplumContext {
  const context = useContext(MedplumContext);
  if (!context) {
    throw new Error('useMedplumContext must be used within a MedplumProvider');
  }
  return context;
}

/**
 * Returns the MedplumClient instance.
 * This is a shortcut for useMedplumContext().medplum.
 * @returns The MedplumClient instance.
 */
export function useMedplum(): MedplumClient {
  return useMedplumContext().medplum;
}

/**
 * Returns the Medplum navigate function.
 * @returns The Medplum navigate function.
 */
export function useMedplumNavigate(): MedplumNavigateFunction {
  return useMedplumContext().navigate;
}

import type { Accessor } from 'solid-js';

/**
 * Returns the current Medplum user profile (if signed in).
 * This is a shortcut for useMedplumContext().profile.
 * @returns Accessor for the current user profile.
 */
export function useMedplumProfile(): Accessor<ProfileResource | undefined> {
  const context = useMedplumContext();
  return () => context.profile;
}