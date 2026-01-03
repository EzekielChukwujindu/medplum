// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { createScriptTag } from './script';

// reCAPTCHA type definitions do not work with Vite project aliasing.
declare let grecaptcha: any;

/**
 * Dynamically loads the recaptcha script.
 * @param siteKey - The reCAPTCHA site key.
 */
export function initRecaptcha(siteKey: string): void {
  if (typeof grecaptcha === 'undefined') {
    createScriptTag('https://www.google.com/recaptcha/api.js?render=' + siteKey);
  }
}

/**
 * Starts a request to generate a recapcha token.
 * @param siteKey - The reCAPTCHA site key.
 * @returns Promise to a recaptcha token for the current user.
 */
export function getRecaptcha(siteKey: string): Promise<string> {
  return new Promise((resolve, reject) => {
    grecaptcha.ready(async () => {
      try {
        resolve(await grecaptcha.execute(siteKey, { action: 'submit' }));
      } catch (err) {
        reject(err);
      }
    });
  });
}
