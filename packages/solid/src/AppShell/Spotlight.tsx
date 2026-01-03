// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { useNavigate } from '@solidjs/router';
import { createSignal, createEffect, onCleanup, Show, For } from 'solid-js';
import { useMedplum } from '@medplum/solid-hooks';
import { Modal } from '../Modal/Modal';
import { Search } from 'lucide-solid';

export function Spotlight() {
  const medplum = useMedplum();
  const navigate = useNavigate();
  const [opened, setOpened] = createSignal(false);
  const [query, setQuery] = createSignal('');
  const [results, setResults] = createSignal<any[]>([]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setOpened(true);
    }
  };

  createEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    onCleanup(() => window.removeEventListener('keydown', handleKeyDown));
  });

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.length < 2) {
      setResults([]);
      return;
    }
    // Simple search implementation - can be expanded to GraphQL like React
    const searchResults = await medplum.search('Patient', `name=${val}`);
    setResults(searchResults.entry?.map(e => e.resource) || []);
  };

  return (
    <Modal open={opened()} onClose={() => setOpened(false)}>
      <div class="p-4 w-full max-w-lg">
        <div class="relative">
             <Search class="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
            type="text"
            class="input input-lg w-full pl-10"
            placeholder="Search..."
            value={query()}
            onInput={(e) => handleSearch(e.currentTarget.value)}
            />
        </div>
        <div class="mt-4 max-h-96 overflow-y-auto">
            <For each={results()}>
                {(res) => (
                    <button
                        class="btn btn-ghost w-full justify-start"
                        onClick={() => {
                            setOpened(false);
                            navigate(`/${res.resourceType}/${res.id}`);
                        }}
                    >
                        {res.resourceType}/{res.id}
                    </button>
                )}
            </For>
             <Show when={results().length === 0 && query().length > 1}>
                <div class="text-center py-4 text-gray-500">No results found</div>
            </Show>
        </div>
      </div>
    </Modal>
  );
}
