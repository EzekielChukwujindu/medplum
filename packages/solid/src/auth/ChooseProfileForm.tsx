// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { LoginAuthenticationResponse } from '@medplum/core';
import { normalizeErrorString, getReferenceString } from '@medplum/core';
import type { ProjectMembership } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/solid-hooks';
import { ChevronRight } from 'lucide-solid';
import type { JSX } from 'solid-js';
import { createSignal, For, Show } from 'solid-js';
import { Alert } from '../Alert/Alert';
import { ResourceAvatar } from '../ResourceAvatar/ResourceAvatar';

export interface ChooseProfileFormProps {
  /** Login identifier from previous step */
  readonly login: string;
  /** Available project memberships */
  readonly memberships: ProjectMembership[];
  /** Handler for auth response */
  readonly handleAuthResponse: (response: LoginAuthenticationResponse) => void;
}

/**
 * ChooseProfileForm allows users to select from multiple project memberships.
 * @param props
 */
export function ChooseProfileForm(props: ChooseProfileFormProps): JSX.Element {
  const medplum = useMedplum();
  const [loading, setLoading] = createSignal<string | undefined>();
  const [error, setError] = createSignal<string | undefined>();

  const handleSelect = async (membership: ProjectMembership) => {
    setError(undefined);
    setLoading(membership.id);

    try {
      const profileRef = membership.profile;
      if (!profileRef) {
        throw new Error('No profile reference');
      }
      const response = await medplum.post('auth/profile', {
        login: props.login,
        profile: getReferenceString(profileRef),
      });
      props.handleAuthResponse(response);
    } catch (err) {
      setError(normalizeErrorString(err));
    } finally {
      setLoading(undefined);
    }
  };

  const getProfileName = (membership: ProjectMembership): string => {
    const profile = membership.profile;
    if (!profile) {return 'Unknown';}
    
    // Try to get display name from reference
    if (profile.display) {return profile.display;}
    
    // Fallback to reference string
    return getReferenceString(profile) || 'Unknown';
  };

  const getProjectName = (membership: ProjectMembership): string => {
    return membership.project?.display || 'Unknown Project';
  };

  const [filter, setFilter] = createSignal('');

  const filteredMemberships = () => {
    const f = filter().toLowerCase();
    if (!f) {
      return props.memberships;
    }
    return props.memberships.filter((m) => {
      const projectName = getProjectName(m).toLowerCase();
      const profileName = getProfileName(m).toLowerCase();
      return projectName.includes(f) || profileName.includes(f);
    });
  };

  return (
    <div class="space-y-6">
      <div class="text-center">
        <h1 class="text-2xl font-bold">Choose a Project</h1>
        <p class="text-base-content/60 mt-1">
          Select which profile you want to use
        </p>
      </div>

      <Show when={error()}>
        <Alert type="error">
          {error()}
        </Alert>
      </Show>

      <div>
        <input
          type="search"
          class="input input-bordered w-full"
          placeholder="Search"
          onInput={(e) => setFilter(e.currentTarget.value)}
        />
      </div>

      <div class="space-y-2">
        <For each={filteredMemberships()}>
          {(membership) => (
            <button
              type="button"
              class={`w-full flex items-center gap-4 p-4 rounded-lg border border-base-300 hover:bg-base-200 transition-colors ${
                loading() === membership.id ? 'opacity-50 pointer-events-none' : ''
              }`}
              onClick={() => handleSelect(membership)}
              disabled={!!loading()}
            >
              <ResourceAvatar value={membership.profile} size={40} />
              <div class="flex-1 text-left">
                <div class="font-medium">
                   {getProfileName(membership)}
                   <Show when={membership.identifier}>
                      <span class="ml-2 text-sm text-base-content/60">
                        {membership.identifier?.map((i) => i.value).join(', ')}
                      </span>
                   </Show>
                </div>
                <div class="text-sm text-base-content/60">{getProjectName(membership)}</div>
              </div>
              <Show when={loading() === membership.id}>
                <span class="loading loading-spinner loading-sm" />
              </Show>
              <Show when={loading() !== membership.id}>
                <ChevronRight class="w-5 h-5 text-base-content/40" />
              </Show>
            </button>
          )}
        </For>
        <Show when={filteredMemberships().length === 0}>
           <div class="text-center text-base-content/60 py-8">
             Nothing found...
           </div>
        </Show>
      </div>
    </div>
  );
}
