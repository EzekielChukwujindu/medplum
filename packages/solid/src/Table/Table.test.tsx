// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { Table  } from './Table';
import type {TableColumn} from './Table';

interface Person {
  id: string;
  name: string;
  age: number;
}

const columns: TableColumn<Person>[] = [
  { key: 'name', label: 'Name' },
  { key: 'age', label: 'Age' },
];

const data: Person[] = [
  { id: '1', name: 'Alice', age: 30 },
  { id: '2', name: 'Bob', age: 25 },
];

describe('Table', () => {
  test('Renders column headers', () => {
    render(() => <Table data={data} columns={columns} testId="table" />);
    expect(screen.getByText('Name')).toBeTruthy();
    expect(screen.getByText('Age')).toBeTruthy();
  });

  test('Renders data rows', () => {
    render(() => <Table data={data} columns={columns} testId="table" />);
    expect(screen.getByText('Alice')).toBeTruthy();
    expect(screen.getByText('30')).toBeTruthy();
    expect(screen.getByText('Bob')).toBeTruthy();
    expect(screen.getByText('25')).toBeTruthy();
  });

  test('Shows empty message when no data', () => {
    render(() => <Table data={[]} columns={columns} emptyMessage="No results" testId="table" />);
    expect(screen.getByText('No results')).toBeTruthy();
  });

  test('Shows loading spinner', () => {
    render(() => <Table data={[]} columns={columns} loading testId="table" />);
    const spinner = screen.getByTestId('table').querySelector('.loading');
    expect(spinner).toBeTruthy();
  });

  test('Uses custom renderer', () => {
    const customColumns: TableColumn<Person>[] = [
      { key: 'name', label: 'Name', render: (item) => <strong>{item.name}</strong> },
      { key: 'age', label: 'Age' },
    ];
    render(() => <Table data={data} columns={customColumns} testId="table" />);
    const strong = screen.getByText('Alice');
    expect(strong.tagName).toBe('STRONG');
  });

  test('Applies zebra class', () => {
    render(() => <Table data={data} columns={columns} zebra testId="table" />);
    const table = screen.getByTestId('table').querySelector('table');
    expect(table?.classList.contains('table-zebra')).toBe(true);
  });
});
