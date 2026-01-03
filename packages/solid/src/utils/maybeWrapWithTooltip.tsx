// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Tooltip } from '../Tooltip/Tooltip';
import type { JSX } from 'solid-js';

export const READ_ONLY_TOOLTIP_TEXT = 'Read Only';

export function maybeWrapWithTooltip(tooltipText: string | undefined, children: JSX.Element): JSX.Element {
  if (tooltipText) {
    return <Tooltip label={tooltipText}>{children}</Tooltip>;
  }
  return children;
}
