// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { Document } from './Document';

describe('Document', () => {
  test('Renders children', () => {
    render(() => <Document><span data-testid="child">Content</span></Document>);
    expect(screen.getByTestId('child')).toBeTruthy();
  });

  test('Renders with Container and Panel', () => {
    render(() => <Document>Content</Document>);
    // Should have container class
    expect(document.querySelector('.container')).toBeTruthy();
    // Should have card class from Panel
    expect(document.querySelector('.card')).toBeTruthy();
  });

  test('Passes props to Panel', () => {
    render(() => <Document width={600}>Content</Document>);
    const card = document.querySelector('.card') as HTMLElement;
    expect(card?.style.maxWidth).toBe('600px');
  });
});
