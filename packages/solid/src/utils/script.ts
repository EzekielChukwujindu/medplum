// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

export function createScriptTag(src: string, onload?: () => void): void {
  const head = document.getElementsByTagName('head')[0];
  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  script.onload = onload ?? null;
  head.appendChild(script);
}
