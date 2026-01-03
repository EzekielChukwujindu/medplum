// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { useMedplum, useMedplumProfile } from '@medplum/solid-hooks';
import type { JSX, ParentComponent } from 'solid-js';
import { createSignal, createEffect, Show, Suspense, ErrorBoundary as SolidErrorBoundary } from 'solid-js';
import { Loading } from '../Loading/Loading';
import { Header } from './Header';
import { Navbar  } from './Navbar';
import type {NavbarMenu} from './Navbar';

const OPEN_WIDTH = 250;
const CLOSED_WIDTH = 70;

export interface AppShellProps {
  /** Logo element displayed in header/navbar */
  readonly logo: JSX.Element;
  /** Current pathname for active link detection */
  readonly pathname?: string;
  /** Current search params for active link detection */
  readonly searchParams?: URLSearchParams;
  /** Disable the header search input */
  readonly headerSearchDisabled?: boolean;
  /** Version string displayed in user menu */
  readonly version?: string;
  /** Navigation menu configuration */
  readonly menus?: NavbarMenu[];
  /** Children rendered in main content area */
  readonly children: JSX.Element;
  /** Show bookmark add button */
  readonly displayAddBookmark?: boolean;
  /** Disable resource type search in navbar */
  readonly resourceTypeSearchDisabled?: boolean;
  /** Custom notifications element */
  readonly notifications?: JSX.Element;
  /** Layout version: v1 (header + sidebar) or v2 (sidebar only) */
  readonly layoutVersion?: 'v1' | 'v2';
}

/**
 * AppShell provides the main application layout structure.
 * 
 * Layer 1 (Shell/Background): Uses custom-palette for branding
 * Layer 2 (Content Container): DaisyUI with opacity for "shine through"
 * Layer 3 (Medical Data): Fully opaque DaisyUI content
 * 
 * @param props
 * @example
 * ```tsx
 * <AppShell logo={<Logo />} menus={navigationMenus}>
 *   <PatientDashboard />
 * </AppShell>
 * ```
 */
export const AppShell: ParentComponent<AppShellProps> = (props) => {
  const medplum = useMedplum();
  const profile = useMedplumProfile();
  
  // Initialize state from localStorage
  const getStoredNavbarOpen = (): boolean => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('navbarOpen') !== 'false';
    }
    return true;
  };
  
  const getStoredLayoutVersion = (): 'v1' | 'v2' => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('appShellLayoutVersion');
      if (stored === 'v2') {return 'v2';}
    }
    return props.layoutVersion ?? 'v1';
  };
  
  const [navbarOpen, setNavbarOpen] = createSignal(getStoredNavbarOpen());
  const [layoutVersion] = createSignal<'v1' | 'v2'>(getStoredLayoutVersion());

  // Persist navbar state to localStorage
  createEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('navbarOpen', String(navbarOpen()));
    }
  });

  const toggleNavbar = () => setNavbarOpen(!navbarOpen());
  const closeNavbar = () => setNavbarOpen(false);

  // Show loading while Medplum is initializing
  if (medplum.isLoading()) {
    return <Loading />;
  }

  const isV2 = () => layoutVersion() === 'v2';
  const hasProfile = () => !!profile;
  const navWidth = () => navbarOpen() ? OPEN_WIDTH : CLOSED_WIDTH;

  return (
    <div class="flex h-screen w-full overflow-hidden bg-base-200">
      {/* Sidebar / Navbar - Layer 2 with opacity */}
      <Show when={hasProfile()}>
        <aside
          class="flex-shrink-0 transition-all duration-300 ease-in-out"
          style={{ width: isV2() ? `${navWidth()}px` : navbarOpen() ? `${OPEN_WIDTH}px` : '0px' }}
        >
          <Navbar
            logo={isV2() ? props.logo : undefined}
            pathname={props.pathname}
            searchParams={props.searchParams}
            menus={props.menus}
            navbarToggle={toggleNavbar}
            closeNavbar={closeNavbar}
            displayAddBookmark={props.displayAddBookmark}
            resourceTypeSearchDisabled={isV2() || props.resourceTypeSearchDisabled}
            opened={navbarOpen()}
            spotlightEnabled={isV2()}
            userMenuEnabled={isV2()}
            version={props.version}
          />
        </aside>
      </Show>

      {/* Main content area */}
      <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header - only in v1 layout */}
        <Show when={!isV2() && hasProfile()}>
          <Header
            pathname={props.pathname}
            searchParams={props.searchParams}
            headerSearchDisabled={props.headerSearchDisabled}
            logo={props.logo}
            version={props.version}
            navbarOpen={navbarOpen()}
            navbarToggle={toggleNavbar}
            notifications={props.notifications}
          />
        </Show>

        {/* Main content - Layer 3 fully opaque */}
        <main class="flex-1 overflow-auto bg-base-100 p-4">
          <SolidErrorBoundary fallback={(err) => (
            <div class="alert alert-error">
              <span>Error: {err.message}</span>
            </div>
          )}>
            <Suspense fallback={<Loading />}>
              {props.children}
            </Suspense>
          </SolidErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default AppShell;
