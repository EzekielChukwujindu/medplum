// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { render, screen, waitFor } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import type { ResourceHistoryTableProps } from './ResourceHistoryTable';
import { ResourceHistoryTable } from './ResourceHistoryTable';

const medplum = new MockClient();

describe('ResourceHistoryTable', () => {
  async function setup(args: ResourceHistoryTableProps): Promise<void> {
    render(() => (
      <MedplumProvider medplum={medplum}>
        <ResourceHistoryTable {...args} />
      </MedplumProvider>
    ));
  }

  test('Renders preloaded history', async () => {
    const history = await medplum.readHistory('Patient', '123');
    await setup({
      history,
    });

    await waitFor(() => {
      const el = screen.getByText('1');
      expect(el).toBeTruthy();
    });
  });

  test('Renders after loading the resource', async () => {
    await setup({
      resourceType: 'Patient',
      id: '123',
    });

    await waitFor(() => {
      const el = screen.getByText('1');
      expect(el).toBeTruthy();
    });
  });
});
