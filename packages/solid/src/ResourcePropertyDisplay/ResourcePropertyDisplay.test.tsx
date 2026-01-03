// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { ResourcePropertyDisplay } from './ResourcePropertyDisplay';
import { PropertyType } from '@medplum/core';

describe('ResourcePropertyDisplay', () => {
  test('Renders string value', () => {
    render(() => (
      <ResourcePropertyDisplay propertyType={PropertyType.string} value="Hello World" />
    ));
    expect(screen.getByText('Hello World')).toBeTruthy();
  });

  test('Renders boolean true', () => {
    render(() => (
      <ResourcePropertyDisplay propertyType={PropertyType.boolean} value={true} />
    ));
    expect(screen.getByText('true')).toBeTruthy();
  });

  test('Renders boolean false', () => {
    render(() => (
      <ResourcePropertyDisplay propertyType={PropertyType.boolean} value={false} />
    ));
    expect(screen.getByText('false')).toBeTruthy();
  });

  test('Renders code value', () => {
    render(() => (
      <ResourcePropertyDisplay propertyType={PropertyType.code} value="active" />
    ));
    expect(screen.getByText('active')).toBeTruthy();
  });

  test('Renders integer value', () => {
    render(() => (
      <ResourcePropertyDisplay propertyType={PropertyType.integer} value={42} />
    ));
    expect(screen.getByText('42')).toBeTruthy();
  });

  test('Renders dateTime value', () => {
    render(() => (
      <ResourcePropertyDisplay propertyType={PropertyType.dateTime} value="2024-01-15T10:30:00Z" />
    ));
    // formatDateTime will format the date
    expect(screen.getByText(/2024/)).toBeTruthy();
  });

  test('Renders Address', () => {
    render(() => (
      <ResourcePropertyDisplay
        propertyType={PropertyType.Address}
        value={{
          city: 'Boston',
          state: 'MA',
        }}
      />
    ));
    expect(screen.getByText(/Boston/)).toBeTruthy();
  });

  test('Renders HumanName', () => {
    render(() => (
      <ResourcePropertyDisplay
        propertyType={PropertyType.HumanName}
        value={{
          given: ['John'],
          family: 'Doe',
        }}
      />
    ));
    expect(screen.getByText(/John/)).toBeTruthy();
    expect(screen.getByText(/Doe/)).toBeTruthy();
  });

  test('Renders Quantity', () => {
    render(() => (
      <ResourcePropertyDisplay
        propertyType={PropertyType.Quantity}
        value={{
          value: 100,
          unit: 'mg',
        }}
      />
    ));
    expect(screen.getByText(/100/)).toBeTruthy();
    expect(screen.getByText(/mg/)).toBeTruthy();
  });

  test('Renders undefined gracefully', () => {
    render(() => (
      <ResourcePropertyDisplay propertyType={PropertyType.string} value={undefined} />
    ));
    // Should not throw
    expect(true).toBe(true);
  });

  test('Renders markdown as pre', () => {
    render(() => (
      <ResourcePropertyDisplay propertyType={PropertyType.markdown} value="# Header" />
    ));
    expect(screen.getByText('# Header').tagName).toBe('PRE');
  });
});
