// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, test, beforeEach } from 'vitest';
import { initRecaptcha } from './recaptcha';

describe('reCAPTCHA', () => {
  beforeEach(() => {
    // Reset the DOM
    document.getElementsByTagName('html')[0].innerHTML = '';
  });

  test('initRecaptcha', () => {
    expect(document.getElementsByTagName('script').length).toBe(0);

    // Init Recaptcha
    initRecaptcha('xyz');
    expect(document.getElementsByTagName('script').length).toBe(1);

    // Simulate loading the script
    Object.defineProperty(window, 'grecaptcha', { value: {}, configurable: true });

    // Initializing again should not create more <script> tags
    initRecaptcha('xyz');
    expect(document.getElementsByTagName('script').length).toBe(1);
  });
});
