// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * Gets initials from a display string.
 * @param input - The display string (e.g., "John Doe")
 * @returns The initials (e.g., "JD")
 */
export function getInitials(input: string): string {
  const words = input.split(' ').filter(Boolean);
  if (words.length > 1) {
    return words[0][0] + words.at(-1)?.at(0);
  }
  if (words.length === 1) {
    return words[0][0];
  }
  return '';
}
