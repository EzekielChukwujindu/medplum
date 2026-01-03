// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { fireEvent, render, screen } from '@solidjs/testing-library';
import { describe, expect, test, vi } from 'vitest';
import { SensitiveTextarea } from './SensitiveTextarea';

describe('SensitiveTextarea', () => {
  test('Renders', async () => {
    const onChange = vi.fn();

    render(() => <SensitiveTextarea placeholder="secret" defaultValue="foo" onChange={onChange} />);

    const input = screen.getByPlaceholderText('secret') as HTMLTextAreaElement;
    expect(input).toBeDefined();

    fireEvent.focus(input);

    fireEvent.input(input, { target: { value: 'bar' } });

    expect(onChange).toHaveBeenCalledWith('bar');
    expect(input.value).toBe('bar');

    const copyButton = screen.getByTitle('Copy secret');
    expect(copyButton).toBeDefined();

    // Mock clipboard API
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    fireEvent.click(copyButton);
  });

  test('Masked when not focused', () => {
    render(() => <SensitiveTextarea defaultValue="secret-value" />);

    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea).toBeDefined();
    // Check inline style contains masking
    expect(textarea.style.cssText).toContain('disc');
  });

  test('Revealed when focused', () => {
    render(() => <SensitiveTextarea defaultValue="secret-value" />);

    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.focus(textarea);
    
    // After focus, masking should be removed
    expect(textarea.style.cssText).toContain('none');
  });

  test('Hidden again on blur', () => {
    render(() => <SensitiveTextarea defaultValue="secret-value" />);

    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.focus(textarea);
    fireEvent.blur(textarea);
    
    // After blur, masking should be applied
    expect(textarea.style.cssText).toContain('disc');
  });
});
