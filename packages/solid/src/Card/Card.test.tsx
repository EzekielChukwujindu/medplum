// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { Card, CardActions } from './Card';

describe('Card', () => {
  test('Renders children', () => {
    render(() => (
      <Card testId="card">
        <p>Card content</p>
      </Card>
    ));
    expect(screen.getByText('Card content')).toBeTruthy();
  });

  test('Renders title', () => {
    render(() => (
      <Card title="Card Title" testId="card">
        Content
      </Card>
    ));
    expect(screen.getByText('Card Title')).toBeTruthy();
  });

  test('Renders subtitle', () => {
    render(() => (
      <Card subtitle="Subtitle text" testId="card">
        Content
      </Card>
    ));
    expect(screen.getByText('Subtitle text')).toBeTruthy();
  });

  test('Renders image', () => {
    render(() => (
      <Card image="https://example.com/image.jpg" imageAlt="Test image" testId="card">
        Content
      </Card>
    ));
    const img = screen.getByAltText('Test image');
    expect(img).toBeTruthy();
  });

  test('Applies bordered class', () => {
    render(() => (
      <Card bordered testId="card">
        Content
      </Card>
    ));
    const card = screen.getByTestId('card');
    expect(card.classList.contains('border')).toBe(true);
  });

  test('Applies shadow class', () => {
    render(() => (
      <Card shadow="lg" testId="card">
        Content
      </Card>
    ));
    const card = screen.getByTestId('card');
    expect(card.classList.contains('shadow-lg')).toBe(true);
  });
});

describe('CardActions', () => {
  test('Renders children', () => {
    render(() => (
      <CardActions>
        <button>Action</button>
      </CardActions>
    ));
    expect(screen.getByText('Action')).toBeTruthy();
  });

  test('Applies justify class', () => {
    render(() => (
      <Card testId="card">
        <CardActions justify="center">
          <button data-testid="btn">Click</button>
        </CardActions>
      </Card>
    ));
    const btn = screen.getByTestId('btn');
    expect(btn.parentElement?.classList.contains('justify-center')).toBe(true);
  });
});
