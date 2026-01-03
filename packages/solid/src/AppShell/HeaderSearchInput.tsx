// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { useMedplumNavigate } from '@medplum/solid-hooks';
import { Search } from 'lucide-solid';
import type { JSX } from 'solid-js';
import { createSignal, Show } from 'solid-js';

export interface HeaderSearchInputProps {
  /** Current pathname */
  readonly pathname?: string;
  /** Current search params */
  readonly searchParams?: URLSearchParams;
}

/**
 * HeaderSearchInput provides a search input in the header.
 * Supports searching within the current resource type context.
 * @param props
 */
export function HeaderSearchInput(props: HeaderSearchInputProps): JSX.Element {
  const navigate = useMedplumNavigate();
  const [searchValue, setSearchValue] = createSignal('');
  const [focused, setFocused] = createSignal(false);

  const resourceType = () => {
    const pathname = props.pathname;
    if (!pathname) {return undefined;}
    
    // Check if we're on a resource type page
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length > 0) {
      const firstPart = parts[0];
      // Check if it's a valid resource type
      if (firstPart && /^[A-Z][a-zA-Z]+$/.test(firstPart)) {
        return firstPart;
      }
    }
    return undefined;
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const value = searchValue().trim();
    if (!value) {return;}

    const rt = resourceType();
    if (rt) {
      // Search within the current resource type
      navigate(`/${rt}?_filter=${encodeURIComponent(value)}`);
    } else {
      // Global search
      navigate(`/search?q=${encodeURIComponent(value)}`);
    }
    setSearchValue('');
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchValue('');
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <form onSubmit={handleSubmit} class="relative">
      <div class={`flex items-center gap-2 bg-base-200 rounded-lg transition-all ${focused() ? 'ring-2 ring-primary' : ''}`}>
        <div class="pl-3 text-base-content/50">
          <Search class="w-4 h-4" />
        </div>
        <input
          type="search"
          placeholder={resourceType() ? `Search ${resourceType()}...` : 'Search...'}
          value={searchValue()}
          onInput={(e) => setSearchValue(e.currentTarget.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          class="input input-sm bg-transparent border-none focus:outline-none w-48 lg:w-64"
          aria-label="Search"
        />
        <Show when={searchValue()}>
          <kbd class="kbd kbd-sm mr-2">↵</kbd>
        </Show>
      </div>
    </form>
  );
}
