// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { Meta, StoryObj } from 'storybook-solidjs-vite';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'accent', 'ghost', 'link', 'outline'],
      description: 'Button variant style',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Button size',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    loading: {
      control: 'boolean',
      description: 'Whether the button shows a loading spinner',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

/** Default primary button */
export const Default: Story = {
  args: {
    children: 'Click me',
  },
};

/** All button variants */
export const AllVariants: Story = {
  render: () => (
    <div class="flex flex-wrap gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="accent">Accent</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="outline">Outline</Button>
    </div>
  ),
};

/** All button sizes */
export const AllSizes: Story = {
  render: () => (
    <div class="flex flex-wrap items-center gap-4">
      <Button size="xs">Extra Small</Button>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

/** Loading state with spinner */
export const Loading: Story = {
  args: {
    children: 'Loading...',
    loading: true,
  },
};

/** Disabled button */
export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};

/** Button with click handler */
export const WithClickHandler: Story = {
  args: {
    children: 'Click me',
    onClick: () => alert('Button clicked!'),
  },
};

/** Outline variants with different colors */
export const OutlineVariants: Story = {
  render: () => (
    <div class="flex flex-wrap gap-4">
      <Button variant="outline">Outline</Button>
      <Button variant="outline" class="btn-info">Info</Button>
      <Button variant="outline" class="btn-success">Success</Button>
      <Button variant="outline" class="btn-warning">Warning</Button>
      <Button variant="outline" class="btn-error">Error</Button>
    </div>
  ),
};
