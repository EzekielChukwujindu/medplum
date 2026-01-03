// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { Skeleton, SkeletonText } from './Skeleton';

describe('Skeleton', () => {
  test('Renders skeleton', () => {
    const { container } = render(() => <Skeleton />);
    expect(container.querySelector('.skeleton')).toBeTruthy();
  });

  test('Applies width and height', () => {
    const { container } = render(() => <Skeleton width="100px" height="50px" />);
    const skeleton = container.querySelector('.skeleton') as HTMLElement;
    expect(skeleton.style.width).toBe('100px');
    expect(skeleton.style.height).toBe('50px');
  });

  test('Applies circle class', () => {
    const { container } = render(() => <Skeleton circle width="40px" />);
    const skeleton = container.querySelector('.skeleton');
    expect(skeleton?.classList.contains('rounded-full')).toBe(true);
  });
});

describe('SkeletonText', () => {
  test('Renders default 3 lines', () => {
    const { container } = render(() => <SkeletonText />);
    const skeletons = container.querySelectorAll('.skeleton');
    expect(skeletons.length).toBe(3);
  });

  test('Renders specified number of lines', () => {
    const { container } = render(() => <SkeletonText lines={5} />);
    const skeletons = container.querySelectorAll('.skeleton');
    expect(skeletons.length).toBe(5);
  });
});
