// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { locationUtils } from '@medplum/core';

/**
 * Gets the Google client ID from props or environment.
 * @param clientId - Optional client ID from props
 * @returns The Google client ID if available
 */
export function getGoogleClientId(clientId: string | undefined): string | undefined {
  if (clientId) {
    return clientId;
  }

  const origin = locationUtils.getOrigin();
  if (origin) {
    const env = import.meta.env as Record<string, string | undefined>;
    const authorizedOrigins = env.GOOGLE_AUTH_ORIGINS?.split(',') ?? [];
    if (authorizedOrigins.includes(origin)) {
      return env.GOOGLE_CLIENT_ID;
    }
  }

  return undefined;
}
