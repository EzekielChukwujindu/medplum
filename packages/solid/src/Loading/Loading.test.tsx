// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { Loading } from './Loading';

describe('Loading', () => {
  test('Renders loading spinner', () => {
    render(() => <Loading />);
    const spinner = document.querySelector('.loading-spinner');
    expect(spinner).toBeTruthy();
  });

  test('Renders with default size (md)', () => {
    render(() => <Loading />);
    const spinner = document.querySelector('.loading-md');
    expect(spinner).toBeTruthy();
  });

  test('Renders with small size', () => {
    render(() => <Loading size="sm" />);
    const spinner = document.querySelector('.loading-sm');
    expect(spinner).toBeTruthy();
  });

  test('Renders with large size', () => {
    render(() => <Loading size="lg" />);
    const spinner = document.querySelector('.loading-lg');
    expect(spinner).toBeTruthy();
  });

  test('Applies custom class', () => {
    render(() => <Loading class="custom-class" />);
    const container = document.querySelector('.custom-class');
    expect(container).toBeTruthy();
  });
});
