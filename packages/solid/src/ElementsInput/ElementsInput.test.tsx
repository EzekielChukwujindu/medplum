// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { ElementsContextType } from '@medplum/core';
import { render, screen, waitFor } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import { ElementsInput } from './ElementsInput';
import { ElementsContext } from '../ElementsContext/ElementsContext';

const elementsContext: ElementsContextType = {
  debugMode: false,
  elements: {
    test: {
      description: 'test',
      max: 1,
      min: 0,
      path: 'test',
      type: [{ code: 'testCode', profile: ['testProfile'], targetProfile: ['testTargetProfile'] }],
    },
  },
  elementsByPath: {
    test: {
      description: 'test',
      max: 1,
      min: 0,
      path: 'test',
      type: [{ code: 'testCode', profile: ['testProfile'], targetProfile: ['testTargetProfile'] }],
    },
  },
  path: 'elements',
  profileUrl: 'testProfileUrl',
  getExtendedProps: () => undefined,
};

const onChange = vi.fn();

describe('ElementsInput', () => {
  test('Renders', async () => {
    render(() => (
      <ElementsContext.Provider value={elementsContext}>
        <ElementsInput
          defaultValue={{ test: 'testValue' }}
          onChange={onChange}
          outcome={undefined}
          path="test"
          testId="test"
          type="elementsinput"
        />
      </ElementsContext.Provider>
    ));

    await waitFor(() => {
      expect(screen.getByTestId('test')).toBeTruthy();
    });
  });

  test('Renders with empty value', async () => {
    render(() => (
      <ElementsContext.Provider value={elementsContext}>
        <ElementsInput
          defaultValue={{}}
          onChange={onChange}
          outcome={undefined}
          path="test"
          testId="test-empty"
          type="elementsinput"
        />
      </ElementsContext.Provider>
    ));

    await waitFor(() => {
      expect(screen.getByTestId('test-empty')).toBeTruthy();
    });
  });
});
