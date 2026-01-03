// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX } from 'solid-js';
import { createSignal, Show } from 'solid-js';

export interface CopyButtonProps {
  /** Text to copy */
  readonly text: string;
  /** Button label */
  readonly label?: string;
  /** Success message duration (ms) */
  readonly successDuration?: number;
  /** Button size */
  readonly size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Button variant */
  readonly variant?: 'ghost' | 'outline' | 'primary';
  /** Additional CSS class */
  readonly class?: string;
  /** Test ID */
  readonly testId?: string;
}

/**
 * CopyButton - copies text to clipboard on click.
 * @param props
 */
export function CopyButton(props: CopyButtonProps): JSX.Element {
  const [copied, setCopied] = createSignal(false);

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(props.text);
      setCopied(true);
      setTimeout(() => setCopied(false), props.successDuration ?? 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const sizeClass = (): string => {
    switch (props.size) {
      case 'xs': return 'btn-xs';
      case 'sm': return 'btn-sm';
      case 'lg': return 'btn-lg';
      default: return '';
    }
  };

  const variantClass = (): string => {
    switch (props.variant) {
      case 'ghost': return 'btn-ghost';
      case 'outline': return 'btn-outline';
      case 'primary': return 'btn-primary';
      default: return 'btn-ghost';
    }
  };

  return (
    <button
      type="button"
      class={`btn ${sizeClass()} ${variantClass()} ${props.class ?? ''}`}
      onClick={handleCopy}
      data-testid={props.testId}
    >
      <Show when={copied()} fallback={props.label ?? '📋'}>
        ✓
      </Show>
    </button>
  );
}
