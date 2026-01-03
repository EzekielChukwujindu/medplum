// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  test('Renders page buttons', () => {
    render(() => <Pagination page={1} totalPages={5} testId="pagination" />);
    expect(screen.getByTestId('pagination-page-1')).toBeTruthy();
    expect(screen.getByTestId('pagination-page-5')).toBeTruthy();
  });

  test('Highlights current page', () => {
    render(() => <Pagination page={3} totalPages={5} testId="pagination" />);
    const currentPage = screen.getByTestId('pagination-page-3');
    expect(currentPage.classList.contains('btn-active')).toBe(true);
  });

  test('Calls onChange when page clicked', () => {
    const handleChange = vi.fn();
    render(() => <Pagination page={1} totalPages={5} onChange={handleChange} testId="pagination" />);
    fireEvent.click(screen.getByTestId('pagination-page-2'));
    expect(handleChange).toHaveBeenCalledWith(2);
  });

  test('Disables prev button on first page', () => {
    render(() => <Pagination page={1} totalPages={5} testId="pagination" />);
    const prevBtn = screen.getByTestId('pagination-prev') as HTMLButtonElement;
    expect(prevBtn.disabled).toBe(true);
  });

  test('Disables next button on last page', () => {
    render(() => <Pagination page={5} totalPages={5} testId="pagination" />);
    const nextBtn = screen.getByTestId('pagination-next') as HTMLButtonElement;
    expect(nextBtn.disabled).toBe(true);
  });

  test('Navigates with prev button', () => {
    const handleChange = vi.fn();
    render(() => <Pagination page={3} totalPages={5} onChange={handleChange} testId="pagination" />);
    fireEvent.click(screen.getByTestId('pagination-prev'));
    expect(handleChange).toHaveBeenCalledWith(2);
  });

  test('Navigates with next button', () => {
    const handleChange = vi.fn();
    render(() => <Pagination page={3} totalPages={5} onChange={handleChange} testId="pagination" />);
    fireEvent.click(screen.getByTestId('pagination-next'));
    expect(handleChange).toHaveBeenCalledWith(4);
  });
});
