// @ts-nocheck - Storybook config types vary across versions
import type { JSX } from 'solid-js';
import { definePreview, createJSXDecorator } from 'storybook-solidjs-vite';
import addonDocs from '@storybook/addon-docs';
import addonA11y from '@storybook/addon-a11y';
import { MedplumProvider } from '@medplum/solid-hooks';
import { MockClient } from '@medplum/mock';
import { ThemeProvider } from '../src/providers/ThemeProvider';
import '../src/styles/index.css';

// Create a shared mock client for all stories
const mockMedplum = new MockClient();

// Global decorator that wraps all stories with necessary providers
// Using createJSXDecorator prevents double-rendering with Solid's reactivity
const withProviders = createJSXDecorator((Story): JSX.Element => {
  return (
    <MedplumProvider medplum={mockMedplum}>
      <ThemeProvider defaultMode="light">
        <div class="p-4">
          <Story />
        </div>
      </ThemeProvider>
    </MedplumProvider>
  );
});

export default definePreview({
  addons: [addonDocs(), addonA11y()],
  parameters: {
    actions: {
      argTypesRegex: '^on.*',
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1d232a' },
      ],
    },
    a11y: {
      test: 'todo',
    },
  },
  decorators: [withProviders],
});
