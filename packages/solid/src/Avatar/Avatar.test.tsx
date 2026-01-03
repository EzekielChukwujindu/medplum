// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { Avatar, AvatarGroup } from './Avatar';

describe('Avatar', () => {
  test('Renders with image', () => {
    render(() => (
      <Avatar src="https://example.com/avatar.jpg" alt="User" testId="avatar" />
    ));
    const img = screen.getByAltText('User');
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe('https://example.com/avatar.jpg');
  });

  test('Renders fallback when no image', () => {
    render(() => <Avatar fallback="JD" testId="avatar" />);
    expect(screen.getByText('JD')).toBeTruthy();
  });

  test('Renders question mark when no fallback', () => {
    render(() => <Avatar testId="avatar" />);
    expect(screen.getByText('?')).toBeTruthy();
  });

  test('Applies size class', () => {
    render(() => <Avatar size="lg" testId="avatar" />);
    const avatar = screen.getByTestId('avatar');
    const inner = avatar.querySelector('div');
    expect(inner?.classList.contains('w-16')).toBe(true);
  });

  test('Applies online status', () => {
    render(() => <Avatar status="online" testId="avatar" />);
    const avatar = screen.getByTestId('avatar');
    expect(avatar.classList.contains('online')).toBe(true);
  });

  test('Applies offline status', () => {
    render(() => <Avatar status="offline" testId="avatar" />);
    const avatar = screen.getByTestId('avatar');
    expect(avatar.classList.contains('offline')).toBe(true);
  });
});

describe('AvatarGroup', () => {
  test('Renders children', () => {
    render(() => (
      <AvatarGroup testId="group">
        <Avatar fallback="A" testId="a" />
        <Avatar fallback="B" testId="b" />
      </AvatarGroup>
    ));
    expect(screen.getByText('A')).toBeTruthy();
    expect(screen.getByText('B')).toBeTruthy();
  });

  test('Has avatar-group class', () => {
    render(() => (
      <AvatarGroup testId="group">
        <Avatar fallback="A" />
      </AvatarGroup>
    ));
    const group = screen.getByTestId('group');
    expect(group.classList.contains('avatar-group')).toBe(true);
  });
});
