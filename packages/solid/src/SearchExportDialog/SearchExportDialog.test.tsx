// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { fireEvent, render, screen, cleanup } from '@solidjs/testing-library';
import { describe, expect, test, vi, afterEach } from 'vitest';
import { ExportButton, SearchExportDialog } from './SearchExportDialog';
import { MedplumProvider } from '@medplum/solid-hooks';
import { MockClient } from '@medplum/mock';

const medplum = new MockClient();

// Mock Modal since we are testing Dialog content logic
vi.mock('../Modal/Modal', () => ({
  Modal: (props: any) => (
    <div data-testid="mock-modal" style={{ display: props.open ? 'block' : 'none' }}>
      <h1>{props.title}</h1>
      {props.children}
    </div>
  ),
}));

describe('SearchExportDialog', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  test('Render not visible', () => {
    render(() => (
      <MedplumProvider medplum={medplum}>
        <SearchExportDialog visible={false} onCancel={vi.fn()} />
      </MedplumProvider>
    ));

    expect(screen.queryByText('Export as CSV')).toBeNull();
  });

  test('Export as CSV and Export as Bundle rendered', () => {
    render(() => (
      <MedplumProvider medplum={medplum}>
        <SearchExportDialog
          exportCsv={() => console.log('export')}
          exportTransactionBundle={() => console.log('export')}
          visible={true}
          onCancel={vi.fn()}
        />
      </MedplumProvider>
    ));

    expect(screen.queryByText('Export as CSV')).not.toBeNull();
    expect(screen.queryByText('Export as Transaction Bundle')).not.toBeNull();
  });

  test('Export as CSV not rendered', () => {
    render(() => (
      <MedplumProvider medplum={medplum}>
        <SearchExportDialog
          exportTransactionBundle={() => console.log('export')}
          visible={true}
          onCancel={vi.fn()}
        />
      </MedplumProvider>
    ));

    expect(screen.queryByText('Export as CSV')).toBeNull();
    expect(screen.queryByText('Export as Transaction Bundle')).not.toBeNull();
  });

  test('Export as Transaction Bundle not rendered', () => {
    render(() => (
      <MedplumProvider medplum={medplum}>
        <SearchExportDialog exportCsv={() => console.log('export')} visible={true} onCancel={vi.fn()} />
      </MedplumProvider>
    ));

    expect(screen.queryByText('Export as CSV')).not.toBeNull();
    expect(screen.queryByText('Export as Transaction Bundle')).toBeNull();
  });
});

describe('ExportButton', () => {
  test('Render Export Button', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    render(() => (
      <ExportButton text="CSV" exportLogic={() => console.log('export')} onCancel={() => console.log('cancel')} />
    ));

    expect(screen.queryByText('Export as CSV')).not.toBeNull();

    fireEvent.click(screen.getByText('Export as CSV'));
    expect(logSpy).toHaveBeenCalledWith('export');
    expect(logSpy).toHaveBeenCalledWith('cancel');
  });
});
