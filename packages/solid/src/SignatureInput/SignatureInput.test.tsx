// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import { MedplumProvider, createMockMedplumClient } from '../test-utils/render';
import { SignatureInput } from './SignatureInput';

// Mock signature_pad
vi.mock('signature_pad', () => {
  return {
    default: class MockSignaturePad {
      constructor() {}
      fromDataURL() {}
      toDataURL() { return 'data:image/png;base64,1234'; }
      addEventListener() {}
      removeEventListener() {}
      off() {}
      clear() {}
    }
  };
});

describe('SignatureInput', () => {
  test('Renders canvas and clear button', () => {
    const client = createMockMedplumClient();
    render(() => (
      <MedplumProvider medplum={client}>
        <SignatureInput onChange={() => {}} />
      </MedplumProvider>
    ));
    expect(screen.getByLabelText('Signature input area')).toBeTruthy();
    expect(screen.getByLabelText('Clear signature')).toBeTruthy();
  });

  test('Calls onChange on clear', () => {
    const client = createMockMedplumClient();
    const handleChange = vi.fn();
    render(() => (
      <MedplumProvider medplum={client}>
        <SignatureInput onChange={handleChange} />
      </MedplumProvider>
    ));
    const clearButton = screen.getByLabelText('Clear signature');
    fireEvent.click(clearButton);
    expect(handleChange).toHaveBeenCalledWith(undefined);
  });
});
