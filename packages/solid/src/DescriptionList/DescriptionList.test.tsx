// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { DescriptionList, DescriptionListEntry } from './DescriptionList';

describe('DescriptionList', () => {
  test('Renders children', () => {
    render(() => (
      <DescriptionList>
        <DescriptionListEntry term="Name">John Doe</DescriptionListEntry>
      </DescriptionList>
    ));
    expect(screen.getByText('Name')).toBeTruthy();
    expect(screen.getByText('John Doe')).toBeTruthy();
  });

  test('Renders multiple entries', () => {
    render(() => (
      <DescriptionList>
        <DescriptionListEntry term="First">One</DescriptionListEntry>
        <DescriptionListEntry term="Second">Two</DescriptionListEntry>
      </DescriptionList>
    ));
    expect(screen.getByText('First')).toBeTruthy();
    expect(screen.getByText('One')).toBeTruthy();
    expect(screen.getByText('Second')).toBeTruthy();
    expect(screen.getByText('Two')).toBeTruthy();
  });

  test('Renders compact mode', () => {
    render(() => (
      <DescriptionList compact>
        <DescriptionListEntry term="Term">Value</DescriptionListEntry>
      </DescriptionList>
    ));
    expect(screen.getByTestId('description-list')).toBeTruthy();
  });

  test('Uses dl/dt/dd semantic elements', () => {
    render(() => (
      <DescriptionList>
        <DescriptionListEntry term="Label">Content</DescriptionListEntry>
      </DescriptionList>
    ));
    const dl = screen.getByTestId('description-list');
    expect(dl.tagName).toBe('DL');
    const dt = screen.getByText('Label');
    expect(dt.tagName).toBe('DT');
    const dd = screen.getByText('Content');
    expect(dd.tagName).toBe('DD');
  });
});
