// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { Panel } from './Panel';

describe('Panel', () => {
  test('Renders children', () => {
    render(() => <Panel><span data-testid="child">Content</span></Panel>);
    expect(screen.getByTestId('child')).toBeTruthy();
  });

  test('Applies card class', () => {
    render(() => <Panel>Content</Panel>);
    const panel = document.querySelector('.card');
    expect(panel).toBeTruthy();
  });

  test('Applies max-width style when width prop provided', () => {
    render(() => <Panel width={500}>Content</Panel>);
    const panel = document.querySelector('.card') as HTMLElement;
    expect(panel?.style.maxWidth).toBe('500px');
  });

  test('Applies fill class when fill prop is true', () => {
    render(() => <Panel fill>Content</Panel>);
    const panel = document.querySelector('.flex-1');
    expect(panel).toBeTruthy();
  });

  test('Applies custom class', () => {
    render(() => <Panel class="custom-class">Content</Panel>);
    const panel = document.querySelector('.custom-class');
    expect(panel).toBeTruthy();
  });
});
