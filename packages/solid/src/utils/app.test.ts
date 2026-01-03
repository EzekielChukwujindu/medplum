// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, test } from 'vitest';
import { getAppName } from './app';

describe('App Utils', () => {
  test('getAppName', () => {
    expect(getAppName()).toEqual('Medplum');
  });
});
