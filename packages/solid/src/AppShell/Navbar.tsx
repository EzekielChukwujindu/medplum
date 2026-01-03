// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { formatHumanName } from '@medplum/core';
import type { HumanName } from '@medplum/fhirtypes';
import { useMedplumNavigate, useMedplumProfile } from '@medplum/solid-hooks';
import { Search, PanelLeftClose, PanelLeft, Plus } from 'lucide-solid';
import type { JSX } from 'solid-js';
import { For, Show } from 'solid-js';
import { MedplumLink } from '../MedplumLink/MedplumLink';
import { ResourceAvatar } from '../ResourceAvatar/ResourceAvatar';
import { Tooltip } from '../Tooltip/Tooltip';
import { Popover } from '../Popover/Popover';
import { HeaderDropdown } from './HeaderDropdown';

export interface NavbarLink {
  /** Icon element for the link */
  readonly icon?: JSX.Element;
  /** Label text */
  readonly label?: string;
  /** Link href */
  readonly href: string;
}

export interface NavbarMenu {
  /** Menu section title */
  readonly title?: string;
  /** Links in this section */
  readonly links?: NavbarLink[];
}

export interface NavbarProps {
  /** Current pathname for active link detection */
  readonly pathname?: string;
  /** Current search params */
  readonly searchParams?: URLSearchParams;
  /** Logo element (v2 layout) */
  readonly logo?: JSX.Element;
  /** Navigation menus */
  readonly menus?: NavbarMenu[];
  /** Toggle navbar callback */
  readonly navbarToggle: () => void;
  /** Close navbar callback */
  readonly closeNavbar: () => void;
  /** Enable spotlight search */
  readonly spotlightEnabled?: boolean;
  /** Enable user menu in navbar */
  readonly userMenuEnabled?: boolean;
  /** Show add bookmark button */
  readonly displayAddBookmark?: boolean;
  /** Disable resource type search */
  readonly resourceTypeSearchDisabled?: boolean;
  /** Whether navbar is open/expanded */
  readonly opened?: boolean;
  /** Version string for user menu */
  readonly version?: string;
}

/**
 * Navbar component for AppShell.
 * Displays navigation links, optional spotlight search, and user menu (v2).
 * @param props
 */
export function Navbar(props: NavbarProps): JSX.Element {
  const navigate = useMedplumNavigate();
  const profile = useMedplumProfile();

  const opened = () => props.opened ?? true;

  const handleLinkClick = (e: MouseEvent, to: string) => {
    e.stopPropagation();
    e.preventDefault();
    navigate(to);
    // Close navbar on mobile
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      props.closeNavbar();
    }
  };

  const activeLink = () => getActiveLink(props.pathname, props.searchParams, props.menus);

  const userName = (): string => {
    const name = profile?.name?.[0] as HumanName | undefined;
    return name ? formatHumanName(name) : '';
  };

  return (
    <nav
      id="navbar"
      class="h-full flex flex-col bg-base-100/95 border-r border-base-300 overflow-hidden"
    >
      {/* Logo section (v2 layout) */}
      <Show when={props.logo}>
        <div class="p-3">
          <button
            type="button"
            class="btn btn-ghost w-full justify-start"
            onClick={props.navbarToggle}
            aria-expanded={opened()}
            aria-controls="navbar"
          >
            {props.logo}
          </button>
        </div>
      </Show>

      {/* Scrollable menu area */}
      <div class="flex-1 overflow-y-auto px-3 py-2">
        {/* Spotlight search trigger (v2 layout) */}
        <Show when={props.spotlightEnabled}>
          <NavbarLinkItem
            to="#"
            active={false}
            onClick={() => {/* TODO: Open spotlight */}}
            icon={<Search class="w-5 h-5" />}
            label="Search"
            opened={opened()}
          />
        </Show>

        {/* Navigation menus */}
        <For each={props.menus}>
          {(menu) => (
            <div class="mb-4">
              <Show when={menu.title && opened()}>
                <div class="text-xs font-semibold text-base-content/60 uppercase tracking-wider px-3 py-2">
                  {menu.title}
                </div>
              </Show>
              <Show when={menu.title && !opened()}>
                <div class="h-10" />
              </Show>
              <For each={menu.links}>
                {(link) => (
                  <NavbarLinkItem
                    to={link.href}
                    active={link.href === activeLink()?.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    icon={link.icon}
                    label={link.label ?? ''}
                    opened={opened()}
                  />
                )}
              </For>
            </div>
          )}
        </For>

        {/* Add bookmark button - simplified, bookmark dialog not implemented yet */}
        <Show when={props.displayAddBookmark}>
          <button
            type="button"
            class="btn btn-ghost btn-sm w-full justify-start mt-4"
            onClick={() => {/* TODO: Open bookmark dialog */}}
          >
            <Plus class="w-4 h-4" />
            <Show when={opened()}>
              <span>Add Bookmark</span>
            </Show>
          </button>
        </Show>
      </div>

      {/* Bottom section - Toggle and User menu (v2 layout) */}
      <Show when={props.userMenuEnabled}>
        <div class="border-t border-base-300 p-3">
          {/* Toggle button */}
          <Tooltip label="Toggle sidebar" position="right" disabled={opened()}>
            <button
              type="button"
              class="btn btn-ghost btn-sm w-full justify-start mb-2"
              onClick={props.navbarToggle}
              aria-label="Toggle navbar"
              aria-expanded={opened()}
              aria-controls="navbar"
            >
              <Show when={opened()} fallback={<PanelLeft class="w-5 h-5" />}>
                <PanelLeftClose class="w-5 h-5" />
              </Show>
            </button>
          </Tooltip>

          {/* User menu */}
          <Popover
            trigger={
              <button
                type="button"
                class="btn btn-ghost w-full justify-start gap-2"
                aria-label="User menu"
              >
                <ResourceAvatar value={profile} size={24} />
                <Show when={opened()}>
                  <span class="text-sm truncate">{userName()}</span>
                </Show>
              </button>
            }
            placement="top"
          >
            <HeaderDropdown version={props.version} />
          </Popover>
        </div>
      </Show>
    </nav>
  );
}

interface NavbarLinkItemProps {
  readonly to: string;
  readonly active: boolean;
  readonly onClick: (e: MouseEvent) => void;
  readonly icon?: JSX.Element;
  readonly label: string;
  readonly opened?: boolean;
}

function NavbarLinkItem(props: NavbarLinkItemProps): JSX.Element {
  const linkContent = (
    <MedplumLink
      to={props.to}
      onClick={props.onClick}
      class={`btn btn-ghost w-full justify-start gap-3 ${props.active ? 'btn-active' : ''}`}
    >
      {props.icon}
      <Show when={props.opened}>
        <span class="truncate">{props.label}</span>
      </Show>
    </MedplumLink>
  );

  // Show tooltip when navbar is closed
  if (!props.opened) {
    return (
      <Tooltip label={props.label} position="right">
        {linkContent}
      </Tooltip>
    );
  }

  return linkContent;
}

/**
 * Returns the best "active" link for the menu based on pathname and search params.
 * Uses a scoring system to handle pagination parameters.
 * @param currentPathname
 * @param currentSearchParams
 * @param menus
 */
function getActiveLink(
  currentPathname: string | undefined,
  currentSearchParams: URLSearchParams | undefined,
  menus: NavbarMenu[] | undefined
): NavbarLink | undefined {
  if (!currentPathname || !menus) {
    return undefined;
  }

  const params = currentSearchParams ?? new URLSearchParams();
  let bestLink: NavbarLink | undefined;
  let bestScore = 0;

  for (const menu of menus) {
    if (menu.links) {
      for (const link of menu.links) {
        const score = getLinkScore(currentPathname, params, link.href);
        if (score > bestScore) {
          bestScore = score;
          bestLink = link;
        }
      }
    }
  }

  return bestLink;
}

/**
 * Calculates a score for a link based on matching pathname and search params.
 * Ignores pagination parameters.
 * @param currentPathname
 * @param currentSearchParams
 * @param linkHref
 */
function getLinkScore(currentPathname: string, currentSearchParams: URLSearchParams, linkHref: string): number {
  const linkUrl = new URL(linkHref, 'https://example.com');
  if (currentPathname !== linkUrl.pathname) {
    return 0;
  }
  
  const ignoredParams = ['_count', '_offset'];
  for (const [key, value] of linkUrl.searchParams.entries()) {
    if (ignoredParams.includes(key)) {continue;}
    if (currentSearchParams.get(key) !== value) {return 0;}
  }
  
  let count = 1;
  for (const [key, value] of currentSearchParams.entries()) {
    if (ignoredParams.includes(key)) {continue;}
    if (linkUrl.searchParams.get(key) === value) {count++;}
  }
  
  return count;
}
