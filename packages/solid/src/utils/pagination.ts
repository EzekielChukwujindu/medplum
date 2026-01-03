// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

export function getPaginationControlProps(controlName: string): Record<string, string> {
  switch (controlName) {
    case 'next':
      return { 'aria-label': 'Next page' };
    case 'previous':
      return { 'aria-label': 'Previous page' };
    case 'first':
      return { 'aria-label': 'First page' };
    case 'last':
      return { 'aria-label': 'Last page' };
    default:
      return {};
  }
}
