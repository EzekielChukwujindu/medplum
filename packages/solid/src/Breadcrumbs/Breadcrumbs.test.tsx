// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { Breadcrumbs  } from './Breadcrumbs';
import type {BreadcrumbItem} from './Breadcrumbs';
import { MemoryRouter, Route } from '@solidjs/router';
import { MedplumProvider } from '@medplum/solid-hooks';
import { MockClient } from '@medplum/mock';
import type { JSX, ParentProps } from 'solid-js';

function TestWrapper(props: ParentProps): JSX.Element {
  const medplum = new MockClient();
  return (
    <MedplumProvider medplum={medplum}>
      <MemoryRouter>
        <Route path="*" component={() => props.children} />
      </MemoryRouter>
    </MedplumProvider>
  );
}

describe('Breadcrumbs', () => {
  test('Renders all items', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Details' },
    ];
    render(() => (
      <TestWrapper>
        <Breadcrumbs items={items} testId="breadcrumbs" />
      </TestWrapper>
    ));
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Products')).toBeTruthy();
    expect(screen.getByText('Details')).toBeTruthy();
  });

  test('Renders links for items with href', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Current' },
    ];
    render(() => (
      <TestWrapper>
        <Breadcrumbs items={items} testId="breadcrumbs" />
      </TestWrapper>
    ));
    const homeLink = screen.getByText('Home');
    expect(homeLink.tagName).toBe('A');
    const current = screen.getByText('Current');
    expect(current.tagName).toBe('SPAN');
  });

  test('Applies custom class', () => {
    const items: BreadcrumbItem[] = [{ label: 'Home' }];
    render(() => (
      <TestWrapper>
        <Breadcrumbs items={items} class="custom-class" testId="breadcrumbs" />
      </TestWrapper>
    ));
    const breadcrumbs = screen.getByTestId('breadcrumbs');
    expect(breadcrumbs.classList.contains('custom-class')).toBe(true);
  });
});
