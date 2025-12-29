// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { MedplumClient, MedplumClientEventMap } from '@medplum/core';
import { createEffect, createMemo, onCleanup, type JSX, type ParentProps } from 'solid-js';
import { createStore } from 'solid-js/store';
import { MedplumContext, type MedplumNavigateFunction } from './MedplumProvider.context';

export interface MedplumProviderProps extends ParentProps {
  readonly medplum: MedplumClient;
  readonly navigate?: MedplumNavigateFunction;
}

const EVENTS_TO_TRACK = [
  'change',
  'storageInitialized',
  'storageInitFailed',
  'profileRefreshing',
  'profileRefreshed',
] satisfies (keyof MedplumClientEventMap)[];

/**
 * The MedplumProvider component provides Medplum context state.
 */
export function MedplumProvider(props: MedplumProviderProps): JSX.Element {
  const navigate = props.navigate ?? defaultNavigate;

  const [state, setState] = createStore({
    profile: props.medplum.getProfile(),
    loading: props.medplum.isLoading(),
  });

  createEffect(() => {
    const medplum = props.medplum;

    function eventListener(): void {
      setState({
        profile: medplum.getProfile(),
        loading: medplum.isLoading(),
      });
    }

    for (const event of EVENTS_TO_TRACK) {
      medplum.addEventListener(event, eventListener);
    }

    onCleanup(() => {
      for (const event of EVENTS_TO_TRACK) {
        medplum.removeEventListener(event, eventListener);
      }
    });
  });

  const medplumContext = createMemo(() => ({
    get profile() { return state.profile; },
    get loading() { return state.loading; },
    medplum: props.medplum,
    navigate,
  }));

  return (
    <MedplumContext.Provider value={medplumContext()}>
      {props.children}
    </MedplumContext.Provider>
  );
}

function defaultNavigate(path: string): void {
  window.location.assign(path);
}