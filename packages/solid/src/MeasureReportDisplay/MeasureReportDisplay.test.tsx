// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { render, screen, waitFor } from '@solidjs/testing-library';
import { describe, expect, test, beforeAll } from 'vitest';
import { MeasureReportDisplay  } from './MeasureReportDisplay';
import type {MeasureReportDisplayProps} from './MeasureReportDisplay';

const medplum = new MockClient();

describe('MeasureReportDisplay', () => {
  beforeAll(async () => {
    await medplum.createResource({
      resourceType: 'Measure',
      id: 'measure-1',
      title: 'Test Measure',
      subtitle: 'Test Subtitle',
      url: 'http://example.com',
      status: 'active',
    });
  });

  function setup(args: MeasureReportDisplayProps): void {
    render(() => (
      <MedplumProvider medplum={medplum}>
        <MeasureReportDisplay {...args} />
      </MedplumProvider>
    ));
  }

  test('MeasureReport with 1 group', async () => {
    setup({
      measureReport: {
        resourceType: 'MeasureReport',
        measure: 'http://example.com',
        status: 'complete',
        type: 'individual',
        period: { start: '2021-01-01', end: '2021-12-31' },
        group: [
          {
            id: 'group-1',
            measureScore: {
              value: 67,
              unit: '%',
            },
          },
        ],
      },
    });

    await waitFor(() => expect(screen.getByText('67%')).toBeInTheDocument());
  });

  test('MeasureReport Multiple Groups', async () => {
    setup({
      measureReport: {
        resourceType: 'MeasureReport',
        measure: 'http://example.com',
        status: 'complete',
        type: 'individual',
        period: { start: '2021-01-01', end: '2021-12-31' },
        group: [
          {
            id: 'group-1',
            measureScore: {
              value: 67,
              unit: '%',
            },
          },
          {
            id: 'group-2',
            measureScore: {
              value: 24,
              unit: 'ml',
            },
          },
        ],
      },
    });

    await waitFor(() => {
      expect(screen.getByText('67%')).toBeInTheDocument();
      expect(screen.getByText('24 ml')).toBeInTheDocument();
    });
  });

  test('Render Measure Title', async () => {
    setup({
      measureReport: {
        resourceType: 'MeasureReport',
        measure: 'http://example.com',
        status: 'complete',
        type: 'individual',
        period: { start: '2021-01-01', end: '2021-12-31' },
        group: [
          {
            id: 'group-1',
            measureScore: {
              value: 75,
              unit: '%',
            },
          },
        ],
      },
    });

    await waitFor(() => {
      expect(screen.getByText('75%')).toBeInTheDocument();
      // Measure title might take time to load via search
      expect(screen.getByText('Test Measure')).toBeInTheDocument();
      expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    });
  });

  test('MeasureReport With Population', async () => {
    setup({
      measureReport: {
        resourceType: 'MeasureReport',
        id: 'basic-example',
        measure: 'http://example.com',
        status: 'complete',
        type: 'individual',
        period: { start: '2021-01-01', end: '2021-12-31' },
        group: [
          {
            id: 'group-1',
            population: [
              {
                code: {
                  coding: [
                    {
                      code: 'numerator',
                    },
                  ],
                },
                count: 10,
              },
              {
                code: {
                  coding: [
                    {
                      code: 'denominator',
                    },
                  ],
                },
                count: 100,
              },
            ],
          },
          {
            id: 'group-2',
            measureScore: {
              value: 50,
              unit: 'ml',
            },
          },
        ],
      },
    });

    await waitFor(() => {
      expect(screen.getByText('10 / 100')).toBeInTheDocument();
      expect(screen.getByText('50 ml')).toBeInTheDocument();
    });
  });

  test('MeasureReport With Insufficient Population Data', async () => {
    setup({
      measureReport: {
        resourceType: 'MeasureReport',
        id: 'insufficient-example',
        measure: 'http://example.com',
        status: 'complete',
        type: 'individual',
        period: { start: '2021-01-01', end: '2021-12-31' },
        group: [
          {
            id: 'group-1',
            population: [
              {
                code: {
                  coding: [
                    {
                      code: 'denominator',
                    },
                  ],
                },
                count: 100,
              },
            ],
          },
        ],
      },
    });

    await waitFor(() => expect(screen.getByText('Insufficient Data')).toBeInTheDocument());
  });

  test('MeasureReport With 0 in denominator', async () => {
    setup({
      measureReport: {
        resourceType: 'MeasureReport',
        id: 'insufficient-example',
        measure: 'http://example.com',
        status: 'complete',
        type: 'individual',
        period: { start: '2021-01-01', end: '2021-12-31' },
        group: [
          {
            id: 'group-1',
            population: [
              {
                code: {
                  coding: [
                    {
                      code: 'denominator',
                    },
                  ],
                },
                count: 0,
              },
            ],
          },
        ],
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Not Applicable')).toBeInTheDocument();
      expect(screen.getByText('Denominator: 0')).toBeInTheDocument();
    });
  });
});
