// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, test } from 'vitest';
import * as solidExports from './index';

describe('Solid package exports', () => {
  test('Re-exports solid-hooks', () => {
    // Verify core hooks are re-exported
    expect(solidExports.useResource).toBeDefined();
    expect(solidExports.useSearch).toBeDefined();
    expect(solidExports.useMedplum).toBeDefined();
  });
});
