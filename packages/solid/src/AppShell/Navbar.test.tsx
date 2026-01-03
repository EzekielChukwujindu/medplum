// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { fireEvent, render, screen } from '@solidjs/testing-library';
import { describe, expect, test, vi } from 'vitest';
import { MockMedplumProvider } from '../test-utils/MockMedplumProvider';
import { Navbar } from './Navbar';
import { Logo } from '../Logo/Logo';

describe('Navbar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  const menus = [
    {
      title: 'Menu 1',
      links: [
        { label: 'Link 1', href: '/link1' },
        { label: 'Link 2', href: '/link2' },
      ],
    },
    {
      title: 'Menu 2',
      links: [
        { label: 'Link 3', href: '/link3' },
      ],
    },
  ];

  test('Renders', () => {
    render(() => (
      <MockMedplumProvider>
        <Navbar
          logo={<Logo size={24} />}
          menus={menus}
          navbarToggle={() => {}}
          closeNavbar={() => {}}
        />
      </MockMedplumProvider>
    ));

    expect(screen.getByText('Menu 1')).toBeInTheDocument();
    expect(screen.getByText('Link 1')).toBeInTheDocument();
  });

  test('Highlighed link', () => {
    render(() => (
      <MockMedplumProvider>
        <Navbar
          logo={<Logo size={24} />}
          menus={menus}
          pathname="/link1"
          navbarToggle={() => {}}
          closeNavbar={() => {}}
        />
      </MockMedplumProvider>
    ));

    const link1 = screen.getByText('Link 1').closest('a');
    expect(link1).toHaveClass('btn-active');

    const link2 = screen.getByText('Link 2').closest('a');
    expect(link2).not.toHaveClass('btn-active');
  });

  test('Click link calls closeNavbar on mobile', () => {
    const closeMock = vi.fn();
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 400 });

    render(() => (
      <MockMedplumProvider>
        <Navbar
          logo={<Logo size={24} />}
          menus={menus}
          navbarToggle={() => {}}
          closeNavbar={closeMock}
        />
      </MockMedplumProvider>
    ));

    fireEvent.click(screen.getByText('Link 1'));
    expect(closeMock).toHaveBeenCalled();
  });

  test('Renders User Menu when enabled', () => {
    render(() => (
      <MockMedplumProvider>
        <Navbar
          logo={<Logo size={24} />}
          menus={menus}
          navbarToggle={() => {}}
          closeNavbar={() => {}}
          userMenuEnabled={true}
        />
      </MockMedplumProvider>
    ));

    expect(screen.getByLabelText('User menu')).toBeInTheDocument();
  });
});
