// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

export function getAppName(): string {
  const env = import.meta.env as Record<string, string | undefined>;
  return env.MEDPLUM_APP_NAME || 'Medplum';
}
