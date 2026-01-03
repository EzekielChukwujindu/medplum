// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { Container } from './Container';

describe('Container', () => {
  test('Renders children', () => {
    render(() => <Container><span data-testid="child">Content</span></Container>);
    expect(screen.getByTestId('child')).toBeTruthy();
  });

  test('Applies default max width (lg)', () => {
    render(() => <Container data-testid="container">Content</Container>);
    const container = document.querySelector('.max-w-screen-lg');
    expect(container).toBeTruthy();
  });

  test('Applies custom max width', () => {
    render(() => <Container maxWidth="xl">Content</Container>);
    const container = document.querySelector('.max-w-screen-xl');
    expect(container).toBeTruthy();
  });

  test('Applies custom class', () => {
    render(() => <Container class="custom-class">Content</Container>);
    const container = document.querySelector('.custom-class');
    expect(container).toBeTruthy();
  });
});
