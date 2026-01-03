// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX } from 'solid-js';

/**
 * Status to DaisyUI badge color mapping.
 * Covers FHIR status codes from multiple value sets:
 * - Request status, Publication status, Observation status
 * - DiagnosticReport status, Task status, Appointment status
 * - Immunization status
 */
const statusToColor: Record<string, string> = {
  // Success states (green)
  completed: 'badge-success',
  final: 'badge-success',
  fulfilled: 'badge-success',
  connected: 'badge-success',
  finished: 'badge-success',

  // Active/In Progress states (blue/primary)
  draft: 'badge-primary',
  active: 'badge-primary',
  registered: 'badge-primary',
  preliminary: 'badge-primary',
  requested: 'badge-primary',
  received: 'badge-primary',
  accepted: 'badge-primary',
  ready: 'badge-primary',
  'in-progress': 'badge-primary',
  proposed: 'badge-primary',
  pending: 'badge-primary',
  booked: 'badge-primary',
  arrived: 'badge-primary',
  'checked-in': 'badge-primary',

  // Warning states (yellow/warning)
  'on-hold': 'badge-warning',
  amended: 'badge-warning',
  corrected: 'badge-warning',

  // Error states (red)
  revoked: 'badge-error',
  'entered-in-error': 'badge-error',
  cancelled: 'badge-error',
  rejected: 'badge-error',
  failed: 'badge-error',
  noshow: 'badge-error',
  urgent: 'badge-error',
  asap: 'badge-error',
  stat: 'badge-error',
  'not-done': 'badge-error',
  disconnected: 'badge-error',

  // Neutral states (gray)
  unknown: 'badge-ghost',
  retired: 'badge-ghost',
  waitlist: 'badge-ghost',
  routine: 'badge-ghost',
  planned: 'badge-ghost',
};

export type StatusBadgeSize = 'xs' | 'sm' | 'md' | 'lg';

export interface StatusBadgeProps {
  /** The status value to display */
  readonly status: string;
  /** Badge size */
  readonly size?: StatusBadgeSize;
  /** Override color class */
  readonly color?: string;
  /** Additional CSS class */
  readonly class?: string;
  /** Test ID */
  readonly testId?: string;
}

/**
 * StatusBadge displays a FHIR status code with appropriate coloring.
 * Automatically maps status values to semantic colors.
 * @param props
 */
export function StatusBadge(props: StatusBadgeProps): JSX.Element {
  const sizeClass = (): string => {
    switch (props.size) {
      case 'xs': return 'badge-xs';
      case 'sm': return 'badge-sm';
      case 'lg': return 'badge-lg';
      default: return '';
    }
  };

  const colorClass = (): string => {
    if (props.color) {return props.color;}
    return statusToColor[props.status] ?? 'badge-ghost';
  };

  const displayText = props.status.replaceAll('-', ' ');

  return (
    <span
      class={`badge ${colorClass()} ${sizeClass()} ${props.class ?? ''}`}
      data-testid={props.testId}
    >
      {displayText}
    </span>
  );
}
