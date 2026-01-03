// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { formatHumanName } from '@medplum/core';
import type { HumanName } from '@medplum/fhirtypes';
import { useMedplumProfile } from '@medplum/solid-hooks';
import { ChevronDown, Menu } from 'lucide-solid';
import type { JSX } from 'solid-js';
import { Show } from 'solid-js';
import { ResourceAvatar } from '../ResourceAvatar/ResourceAvatar';
import { Popover } from '../Popover/Popover';
import { HeaderDropdown } from './HeaderDropdown';
import { HeaderSearchInput } from './HeaderSearchInput';

export interface HeaderProps {
  /** Current pathname for search context */
  readonly pathname?: string;
  /** Current search params */
  readonly searchParams?: URLSearchParams;
  /** Disable header search input */
  readonly headerSearchDisabled?: boolean;
  /** Logo element */
  readonly logo: JSX.Element;
  /** Version string for user menu */
  readonly version?: string;
  /** Whether navbar is open */
  readonly navbarOpen?: boolean;
  /** Toggle navbar callback */
  readonly navbarToggle: () => void;
  /** Custom notifications element */
  readonly notifications?: JSX.Element;
}

/**
 * Header component for AppShell v1 layout.
 * Contains logo button, search input, notifications, and user menu.
 * @param props
 */
export function Header(props: HeaderProps): JSX.Element {
  const profile = useMedplumProfile();

  const userName = (): string => {
    const name = profile?.name?.[0] as HumanName | undefined;
    return name ? formatHumanName(name) : '';
  };

  return (
    <header class="h-16 bg-base-100 border-b border-base-300 px-4 flex items-center justify-between z-50">
      {/* Left side - Logo and Search */}
      <div class="flex items-center gap-4">
        <button
          type="button"
          class="btn btn-ghost btn-square"
          aria-expanded={props.navbarOpen}
          aria-controls="navbar"
          onClick={props.navbarToggle}
          aria-label="Toggle navigation"
        >
          <Menu class="w-5 h-5" />
        </button>
        
        <div class="hidden sm:block">
          {props.logo}
        </div>

        <Show when={!props.headerSearchDisabled}>
          <HeaderSearchInput
            pathname={props.pathname}
            searchParams={props.searchParams}
          />
        </Show>
      </div>

      {/* Right side - Notifications and User Menu */}
      <div class="flex items-center gap-4">
        {props.notifications}

        <Popover
          trigger={
            <button
              type="button"
              class="btn btn-ghost gap-2 normal-case"
              aria-label="User menu"
              aria-haspopup="true"
            >
              <ResourceAvatar value={profile} size={24} />
              <span class="hidden md:inline text-sm font-normal">
                {userName()}
              </span>
              <ChevronDown class="w-4 h-4" />
            </button>
          }
          placement="bottom"
        >
          <HeaderDropdown version={props.version} />
        </Popover>
      </div>
    </header>
  );
}
