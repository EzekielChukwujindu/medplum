// @ts-nocheck - Storybook config types vary across versions
import { defineMain } from 'storybook-solidjs-vite';

export default defineMain({
  framework: {
    name: 'storybook-solidjs-vite',
    options: {},
  },
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
  ],
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
});
