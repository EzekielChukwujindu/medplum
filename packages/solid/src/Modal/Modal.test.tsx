// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import { Modal, ModalActions } from './Modal';

describe('Modal', () => {
  test('Renders when open', () => {
    render(() => (
      <Modal open testId="test-modal" title="Test Modal">
        Modal content
      </Modal>
    ));
    expect(screen.getByText('Test Modal')).toBeTruthy();
    expect(screen.getByText('Modal content')).toBeTruthy();
  });

  test('Does not render when closed', () => {
    render(() => (
      <Modal open={false} testId="test-modal" title="Test Modal">
        Modal content
      </Modal>
    ));
    expect(screen.queryByText('Test Modal')).toBeNull();
    expect(screen.queryByText('Modal content')).toBeNull();
  });

  test('Shows close button when onClose provided', () => {
    const handleClose = vi.fn();
    render(() => (
      <Modal open onClose={handleClose} testId="test-modal">
        Content
      </Modal>
    ));
    expect(screen.getByTestId('test-modal-close')).toBeTruthy();
  });

  test('Calls onClose when close button clicked', () => {
    const handleClose = vi.fn();
    render(() => (
      <Modal open onClose={handleClose} testId="test-modal">
        Content
      </Modal>
    ));
    fireEvent.click(screen.getByTestId('test-modal-close'));
    expect(handleClose).toHaveBeenCalled();
  });

  test('Renders with title', () => {
    render(() => (
      <Modal open title="My Title" testId="test-modal">
        Content
      </Modal>
    ));
    expect(screen.getByText('My Title')).toBeTruthy();
  });
});

describe('ModalActions', () => {
  test('Renders children', () => {
    render(() => (
      <ModalActions>
        <button>Save</button>
        <button>Cancel</button>
      </ModalActions>
    ));
    expect(screen.getByText('Save')).toBeTruthy();
    expect(screen.getByText('Cancel')).toBeTruthy();
  });
});
