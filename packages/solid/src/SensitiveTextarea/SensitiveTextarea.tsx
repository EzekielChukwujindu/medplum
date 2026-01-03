// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Copy } from 'lucide-solid';
import type { JSX } from 'solid-js';
import { createSignal } from 'solid-js';

export interface SensitiveTextareaProps {
  /** Placeholder text */
  readonly placeholder?: string;
  /** Default value */
  readonly defaultValue?: string;
  /** Value (controlled) */
  readonly value?: string;
  /** Change handler */
  readonly onChange?: (value: string) => void;
  /** Whether the textarea is disabled */
  readonly disabled?: boolean;
  /** Whether the textarea is read-only */
  readonly readOnly?: boolean;
  /** Rows for textarea */
  readonly rows?: number;
  /** CSS class */
  readonly class?: string;
  /** Test ID */
  readonly testId?: string;
}

/**
 * SensitiveTextarea is a textarea that masks its content until focused.
 * It also provides a copy button to copy the value to clipboard.
 * @param props
 */
export function SensitiveTextarea(props: SensitiveTextareaProps): JSX.Element {
  const [revealed, setRevealed] = createSignal(false);
  let textareaRef: HTMLTextAreaElement | undefined;

  const handleCopy = async () => {
    if (textareaRef?.value) {
      try {
        await navigator.clipboard.writeText(textareaRef.value);
        // Optionally show notification - for now we skip since we don't have a toast system
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleChange = (e: Event) => {
    const target = e.target as HTMLTextAreaElement;
    props.onChange?.(target.value);
  };

  return (
    <div class="flex gap-2">
      <textarea
        ref={textareaRef}
        class={`textarea textarea-bordered flex-grow ${props.class || ''}`}
        placeholder={props.placeholder}
        value={props.value ?? props.defaultValue ?? ''}
        onInput={handleChange}
        onFocus={() => setRevealed(true)}
        onBlur={() => setRevealed(false)}
        disabled={props.disabled}
        readOnly={props.readOnly}
        rows={props.rows ?? 1}
        style={{
          '-webkit-text-security': revealed() ? 'none' : 'disc',
        } as any}
        data-testid={props.testId}
      />
      <button
        type="button"
        class="btn btn-ghost btn-square"
        title="Copy secret"
        onClick={handleCopy}
      >
        <Copy class="h-5 w-5" />
      </button>
    </div>
  );
}
