// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { MockClient } from '@medplum/mock';
import { render, screen } from '@solidjs/testing-library';
import { createSignal, JSX } from 'solid-js';
import { describe, test, expect, beforeAll } from 'vitest';
import { MedplumProvider } from '../MedplumProvider/MedplumProvider';
import { usePrevious } from './usePrevious';

interface TestComponentProps {
  value: boolean;
}

function TestComponent(props: TestComponentProps): JSX.Element {
  const prevVal = usePrevious(() => props.value);
  return <div data-testid="test-component">{prevVal()?.toString() ?? 'no value'}</div>;
}

describe('usePrevious', () => {
  let medplum: MockClient;

  beforeAll(() => {
    medplum = new MockClient();
  });

  function setup(initialValue: boolean) {
    const [val, setVal] = createSignal(initialValue);
    const result = render(() => (
      <MedplumProvider medplum={medplum}>
        <TestComponent value={val()} />
      </MedplumProvider>
    ));
    return { result, setVal };
  }

  test('Returns the value from the previous render', () => {
    const { setVal } = setup(false);
    
    let el = screen.getByTestId('test-component');
    expect(el).toBeInTheDocument();
    expect(el.innerHTML).toBe('no value');

    setVal(true);
    
    el = screen.getByTestId('test-component');
    expect(el.innerHTML).toBe('false');
  });
});