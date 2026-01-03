// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { Meta, StoryObj } from 'storybook-solidjs-vite';
import { createSignal } from 'solid-js';
import { Alert } from './Alert';
import { Button } from '../Button/Button';

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error'],
      description: 'Alert type/severity',
    },
    title: {
      control: 'text',
      description: 'Alert title',
    },
    dismissible: {
      control: 'boolean',
      description: 'Whether the alert can be dismissed',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

/** Default info alert */
export const Default: Story = {
  args: {
    children: 'This is an informational message.',
  },
};

/** All alert types */
export const AllTypes: Story = {
  render: () => (
    <div class="flex flex-col gap-4">
      <Alert type="info">Info: This is an informational message.</Alert>
      <Alert type="success">Success: Operation completed successfully!</Alert>
      <Alert type="warning">Warning: Please review this before proceeding.</Alert>
      <Alert type="error">Error: Something went wrong. Please try again.</Alert>
    </div>
  ),
};

/** Alert with title */
export const WithTitle: Story = {
  args: {
    type: 'warning',
    title: 'Attention Required',
    children: 'Please verify your email address before continuing.',
  },
};

/** Dismissible alert */
export const Dismissible: Story = {
  render: () => {
    const [visible, setVisible] = createSignal(true);
    
    return (
      <div class="flex flex-col gap-4">
        {visible() ? (
          <Alert
            type="success"
            title="Success!"
            dismissible
            onDismiss={() => setVisible(false)}
          >
            This alert can be dismissed. Click the X button to close it.
          </Alert>
        ) : (
          <div class="flex items-center gap-4">
            <span class="text-gray-500">Alert dismissed.</span>
            <Button size="sm" onClick={() => setVisible(true)}>
              Show Again
            </Button>
          </div>
        )}
      </div>
    );
  },
};

/** Medical context alerts */
export const MedicalContext: Story = {
  render: () => (
    <div class="flex flex-col gap-4">
      <Alert type="error" title="Critical Lab Result">
        Patient has abnormal potassium level: 6.2 mEq/L (Critical High)
      </Alert>
      <Alert type="warning" title="Drug Interaction Alert">
        Potential moderate interaction between Warfarin and Aspirin.
      </Alert>
      <Alert type="info" title="Patient Note">
        Patient prefers morning appointments due to work schedule.
      </Alert>
      <Alert type="success" title="Order Completed">
        Lab order for CBC has been successfully submitted.
      </Alert>
    </div>
  ),
};
