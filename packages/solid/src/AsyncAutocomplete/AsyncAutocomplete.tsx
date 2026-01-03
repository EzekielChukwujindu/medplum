// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX } from 'solid-js';
import { createSignal, For, Show, onCleanup, createMemo } from 'solid-js';

export interface AsyncAutocompleteOption<T> {
  /** Unique value identifier */
  value: string;
  /** Display label */
  label: string;
  /** Original resource */
  resource: T;
  /** Whether item is currently active/selected */
  active?: boolean;
}

export interface AsyncAutocompleteProps<T> {
  /** Input name */
  readonly name?: string;
  /** Label text */
  readonly label?: string;
  /** Description text */
  readonly description?: string;
  /** Placeholder text */
  readonly placeholder?: string;
  /** Default selected value(s) */
  readonly defaultValue?: T | T[];
  /** Convert item to option */
  readonly toOption: (item: T) => AsyncAutocompleteOption<T>;
  /** Load options based on search input */
  readonly loadOptions: (input: string, signal: AbortSignal) => Promise<T[]>;
  /** Callback when selection changes */
  readonly onChange: (items: T[]) => void;
  /** Create new item from input */
  readonly onCreate?: (input: string) => T;
  /** Custom item renderer component */
  readonly itemComponent?: (props: AsyncAutocompleteOption<T>) => JSX.Element;
  /** Custom pill/badge renderer component */
  readonly pillComponent?: (props: {
    item: AsyncAutocompleteOption<T>;
    disabled?: boolean;
    onRemove: () => void;
  }) => JSX.Element;
  /** Custom empty state component */
  readonly emptyComponent?: (props: { search: string }) => JSX.Element;
  /** Whether creating new items is allowed */
  readonly creatable?: boolean;
  /** Whether selection can be cleared */
  readonly clearable?: boolean;
  /** Whether input is required */
  readonly required?: boolean;
  /** Whether input is disabled */
  readonly disabled?: boolean;
  /** Max number of selections (1 for single select) */
  readonly maxValues?: number;
  /** Error message */
  readonly error?: string;
  /** Left section element (icon) */
  readonly leftSection?: JSX.Element;
  /** Maximum dropdown height */
  readonly maxDropdownHeight?: number;
  /** Minimum input length before loading options */
  readonly minInputLength?: number;
  /** CSS class name */
  readonly class?: string;
  /** Test ID */
  readonly testId?: string;
}

/**
 * AsyncAutocomplete provides type-ahead search with async data loading.
 * Supports keyboard navigation, custom renderers, and multi-select.
 * @param props
 */
export function AsyncAutocomplete<T>(props: AsyncAutocompleteProps<T>): JSX.Element {
  const [inputValue, setInputValue] = createSignal('');
  const [options, setOptions] = createSignal<AsyncAutocompleteOption<T>[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [open, setOpen] = createSignal(false);
  const [highlightedIndex, setHighlightedIndex] = createSignal(-1);
  const [selected, setSelected] = createSignal<AsyncAutocompleteOption<T>[]>((() => {
    const defaultValue = props.defaultValue;
    if (!defaultValue) {return [];}
    if (Array.isArray(defaultValue)) {
      return defaultValue.map(props.toOption);
    }
    return [props.toOption(defaultValue)];
  })());

  let abortController: AbortController | undefined;
  let debounceTimer: number | undefined;
  let inputRef: HTMLInputElement | undefined;

  const loadOptionsDebounced = (search: string): void => {
    const minLength = props.minInputLength ?? 0;
    if (search.length < minLength) {
      setOptions([]);
      return;
    }

    if (debounceTimer) {
      window.clearTimeout(debounceTimer);
    }
    if (abortController) {
      abortController.abort();
    }

    debounceTimer = window.setTimeout(() => {
      abortController = new AbortController();
      setLoading(true);

      props.loadOptions(search, abortController.signal)
        .then((items) => {
          if (!abortController?.signal.aborted) {
            const mapped = items.map(props.toOption);
            setOptions(mapped);
            setHighlightedIndex(mapped.length > 0 ? 0 : -1);
            if (items.length > 0) {
              setOpen(true);
            }
          }
        })
        .catch((err) => {
          if (!err.message?.includes('aborted')) {
            console.error('AsyncAutocomplete load error:', err);
          }
        })
        .finally(() => {
          if (!abortController?.signal.aborted) {
            setLoading(false);
          }
        });
    }, 150);
  };

  onCleanup(() => {
    if (abortController) {
      abortController.abort();
    }
    if (debounceTimer) {
      window.clearTimeout(debounceTimer);
    }
  });

  const handleInputChange = (value: string): void => {
    setInputValue(value);
    if (value.length > 0) {
      loadOptionsDebounced(value);
    } else {
      setOptions([]);
      setOpen(false);
    }
  };

  const handleSelect = (option: AsyncAutocompleteOption<T> | null): void => {
    if (!option) {return;}

    const currentSelected = selected();
    const alreadySelected = currentSelected.some((s) => s.value === option.value);

    if (alreadySelected) {
      // Deselect
      const newSelected = currentSelected.filter((s) => s.value !== option.value);
      setSelected(newSelected);
      props.onChange(newSelected.map((s) => s.resource));
    } else {
      // Select
      let newSelected = [...currentSelected, option];
      if (props.maxValues !== undefined && newSelected.length > props.maxValues) {
        newSelected = newSelected.slice(-props.maxValues);
      }
      setSelected(newSelected);
      props.onChange(newSelected.map((s) => s.resource));

      if (props.maxValues === 1) {
        setInputValue('');
        setOpen(false);
      }
    }
    setHighlightedIndex(-1);
  };

  const handleCreate = (): void => {
    if (props.onCreate && inputValue().trim()) {
      const newItem = props.onCreate(inputValue());
      handleSelect(props.toOption(newItem));
      setInputValue('');
    }
  };

  const removeSelected = (option: AsyncAutocompleteOption<T>): void => {
    const newSelected = selected().filter((s) => s.value !== option.value);
    setSelected(newSelected);
    props.onChange(newSelected.map((s) => s.resource));
  };

  const clearAll = (): void => {
    setSelected([]);
    setInputValue('');
    props.onChange([]);
    inputRef?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent): void => {
    const currentOptions = options();
    const currentIndex = highlightedIndex();
    const showCreate = props.creatable && inputValue().trim() && 
      !currentOptions.some((o) => o.label === inputValue());
    const totalItems = currentOptions.length + (showCreate ? 1 : 0);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!open() && currentOptions.length > 0) {
          setOpen(true);
        }
        setHighlightedIndex((currentIndex + 1) % totalItems);
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!open() && currentOptions.length > 0) {
          setOpen(true);
        }
        setHighlightedIndex(currentIndex <= 0 ? totalItems - 1 : currentIndex - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (open() && currentIndex >= 0) {
          if (currentIndex < currentOptions.length) {
            handleSelect(currentOptions[currentIndex]);
          } else if (showCreate) {
            handleCreate();
          }
        }
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        setHighlightedIndex(-1);
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  };

  const isSingleSelect = props.maxValues === 1;
  const displayValue = createMemo(() => {
    if (isSingleSelect && selected().length > 0) {
      return selected()[0].label;
    }
    return inputValue();
  });

  const inputClass = (): string => {
    let base = 'input input-bordered w-full';
    if (props.leftSection) {base += ' pl-10';}
    if (props.clearable && selected().length > 0) {base += ' pr-10';}
    return props.error ? `${base} input-error` : base;
  };

  const dropdownStyle = (): Record<string, string> => {
    if (props.maxDropdownHeight) {
      return { 'max-height': `${props.maxDropdownHeight}px` };
    }
    return { 'max-height': '240px' };
  };

  // Default item component
  const DefaultItemComponent = (option: AsyncAutocompleteOption<T>) => (
    <span>{option.label}</span>
  );

  // Default pill component
  const DefaultPillComponent = (pillProps: {
    item: AsyncAutocompleteOption<T>;
    disabled?: boolean;
    onRemove: () => void;
  }) => (
    <span class="badge badge-primary gap-1">
      {pillProps.item.label}
      <button
        type="button"
        class="btn btn-ghost btn-xs p-0"
        onClick={pillProps.onRemove}
        disabled={pillProps.disabled}
      >
        ×
      </button>
    </span>
  );

  // Default empty component
  const DefaultEmptyComponent = (emptyProps: { search: string }) => (
    <li class="text-base-content/50 px-4 py-2">
      No results for "{emptyProps.search}"
    </li>
  );

  const ItemComponent = props.itemComponent ?? DefaultItemComponent;
  const PillComponent = props.pillComponent ?? DefaultPillComponent;
  const EmptyComponent = props.emptyComponent ?? DefaultEmptyComponent;

  const showEmpty = open() && options().length === 0 && inputValue().length > 0 && !loading();
  const showCreate = props.creatable && inputValue().trim() && 
    !options().some((o) => o.label === inputValue());

  return (
    <div class={`form-control ${props.class ?? ''}`} data-testid={props.testId}>
      <Show when={props.label}>
        <label class="label">
          <span class="label-text">
            {props.label}
            {props.required && <span class="text-error ml-1">*</span>}
          </span>
        </label>
      </Show>

      <Show when={props.description}>
        <p class="text-sm text-base-content/60 mb-1">{props.description}</p>
      </Show>

      {/* Selected items (multi-select) */}
      <Show when={!isSingleSelect && selected().length > 0}>
        <div class="flex flex-wrap gap-1 mb-2">
          <For each={selected()}>
            {(item) => (
              <PillComponent
                item={item}
                disabled={props.disabled}
                onRemove={() => removeSelected(item)}
              />
            )}
          </For>
        </div>
      </Show>

      <div class="relative">
        {/* Left section */}
        <Show when={props.leftSection}>
          <div class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {props.leftSection}
          </div>
        </Show>

        <input
          ref={inputRef}
          type="text"
          name={props.name}
          placeholder={props.placeholder}
          value={displayValue()}
          disabled={props.disabled}
          class={inputClass()}
          data-testid={(props.testId ?? 'autocomplete') + '-input'}
          onInput={(e) => handleInputChange(e.currentTarget.value)}
          onFocus={() => inputValue().length > 0 && options().length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          onKeyDown={handleKeyDown}
          aria-expanded={open()}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          role="combobox"
        />

        {/* Loading spinner */}
        <Show when={loading()}>
          <span class="loading loading-spinner loading-xs absolute right-3 top-1/2 -translate-y-1/2" />
        </Show>

        {/* Clear button */}
        <Show when={props.clearable && selected().length > 0 && !loading()}>
          <button
            type="button"
            class="btn btn-ghost btn-xs absolute right-2 top-1/2 -translate-y-1/2"
            onClick={clearAll}
            disabled={props.disabled}
            aria-label="Clear selection"
          >
            ×
          </button>
        </Show>

        {/* Dropdown */}
        <Show when={open() && (options().length > 0 || showEmpty || showCreate)}>
          <ul 
            class="menu bg-base-100 shadow-lg rounded-box absolute z-50 w-full mt-1 overflow-auto"
            style={dropdownStyle()}
            role="listbox"
          >
            <Show when={showEmpty && !showCreate}>
              <EmptyComponent search={inputValue()} />
            </Show>

            <For each={options()}>
              {(option, index) => {
                const isActive = selected().some((s) => s.value === option.value);
                const isHighlighted = index() === highlightedIndex();
                return (
                  <li role="option" aria-selected={isActive}>
                    <button
                      type="button"
                      class={`${isActive ? 'active' : ''} ${isHighlighted ? 'focus' : ''}`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelect(option);
                      }}
                      onMouseEnter={() => setHighlightedIndex(index())}
                    >
                      <Show when={isActive}>
                        <span class="text-success">✓</span>
                      </Show>
                      <ItemComponent {...option} />
                    </button>
                  </li>
                );
              }}
            </For>

            <Show when={showCreate}>
              <li role="option">
                <button
                  type="button"
                  class={highlightedIndex() === options().length ? 'focus' : ''}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleCreate();
                  }}
                  onMouseEnter={() => setHighlightedIndex(options().length)}
                >
                  + Create "{inputValue()}"
                </button>
              </li>
            </Show>
          </ul>
        </Show>
      </div>

      <Show when={props.error}>
        <label class="label">
          <span class="label-text-alt text-error">{props.error}</span>
        </label>
      </Show>
    </div>
  );
}
