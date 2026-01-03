// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { getReferenceString } from '@medplum/core';
import { useMedplum, useMedplumProfile } from '@medplum/solid-hooks';
import { User, Settings, LogOut, HelpCircle, Info } from 'lucide-solid';
import type { JSX } from 'solid-js';
import { Show } from 'solid-js';
import { MedplumLink } from '../MedplumLink/MedplumLink';
import { ResourceAvatar } from '../ResourceAvatar/ResourceAvatar';

export interface HeaderDropdownProps {
  /** Version string to display */
  readonly version?: string;
}

/**
 * HeaderDropdown displays the user menu dropdown content.
 * Includes profile link, settings, sign out, and version info.
 * @param props
 */
export function HeaderDropdown(props: HeaderDropdownProps): JSX.Element {
  const medplum = useMedplum();
  const profile = useMedplumProfile();

  const handleSignOut = async () => {
    try {
      await medplum.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const profileReference = (): string | undefined => {
    return profile ? getReferenceString(profile) : undefined;
  };

  return (
    <div class="menu bg-base-100 w-64 rounded-box shadow-xl border border-base-300 p-2">
      {/* User info header */}
      <Show when={profile}>
        <div class="px-3 py-2 mb-2">
          <div class="flex items-center gap-3">
            <ResourceAvatar value={profile} size={40} />
            <div class="flex-1 min-w-0">
              <div class="font-medium truncate">
                {profile?.name?.[0]?.text || 'User'}
              </div>
              <Show when={profileReference()}>
                <div class="text-xs text-base-content/60 truncate">
                  {profileReference()}
                </div>
              </Show>
            </div>
          </div>
        </div>
        <div class="divider my-0" />
      </Show>

      {/* Menu items */}
      <ul>
        <Show when={profile}>
          <li>
            <MedplumLink to={`/${profileReference()}`} class="gap-3">
              <User class="w-4 h-4" />
              <span>Your profile</span>
            </MedplumLink>
          </li>
        </Show>

        <li>
          <MedplumLink to="/admin/project" class="gap-3">
            <Settings class="w-4 h-4" />
            <span>Project settings</span>
          </MedplumLink>
        </li>

        <li>
          <a href="https://www.medplum.com/docs" target="_blank" rel="noopener noreferrer" class="gap-3">
            <HelpCircle class="w-4 h-4" />
            <span>Documentation</span>
          </a>
        </li>

        <div class="divider my-1" />

        <li>
          <button type="button" onClick={handleSignOut} class="gap-3 text-error">
            <LogOut class="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </li>
      </ul>

      {/* Version info */}
      <Show when={props.version}>
        <div class="divider my-1" />
        <div class="px-3 py-2 flex items-center gap-2 text-xs text-base-content/50">
          <Info class="w-3 h-3" />
          <span>Version {props.version}</span>
        </div>
      </Show>
    </div>
  );
}
