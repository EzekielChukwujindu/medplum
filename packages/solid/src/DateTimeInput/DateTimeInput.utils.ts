// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { isValidDate } from '@medplum/core';

/**
 * Converts an ISO-8601 date/time string to a local date/time string.
 * @param isoString - The ISO-8601 date/time string to convert.
 * @returns The local date/time string.
 */
export function convertIsoToLocal(isoString: string | undefined): string {
  if (!isoString) {
    return '';
  }

  const date = new Date(isoString);
  if (!isValidDate(date)) {
    return '';
  }

  return date.toLocaleDateString('sv') + 'T' + date.toLocaleTimeString('sv');
}

/**
 * Converts a local date/time string to an ISO-8601 date/time string.
 * @param localString - The local date/time string to convert.
 * @returns The ISO-8601 date/time string.
 */
export function convertLocalToIso(localString: string | undefined): string {
  if (!localString) {
    return '';
  }

  const date = new Date(localString);
  if (!isValidDate(date)) {
    return '';
  }

  return date.toISOString();
}
