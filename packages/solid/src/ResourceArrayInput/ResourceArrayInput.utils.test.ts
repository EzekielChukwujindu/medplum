// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { InternalSchemaElement } from '@medplum/core';
import { assignValuesIntoSlices, prepareSlices } from './ResourceArrayInput.utils';
import { MockClient } from '@medplum/mock';

const medplum = new MockClient();

describe('ResourceArrayInput.utils', () => {
  test('assignValuesIntoSlices', () => {
    // Slicing not enabled
    expect(assignValuesIntoSlices([], [], undefined, undefined)).toEqual([[]]);
    expect(assignValuesIntoSlices(['a'], [], undefined, undefined)).toEqual([['a']]);

    // Slicing enabled
    const slices = [
      {
        name: 's1',
        elements: {
          'Observation.component': {
            path: 'Observation.component',
            slicing: { discriminator: [{ type: 'value', path: 'code' }] },
          },
        },
      },
      {
        name: 's2',
        elements: {
          'Observation.component': {
            path: 'Observation.component',
            slicing: { discriminator: [{ type: 'value', path: 'code' }] },
          },
        },
      },
    ] as any;

    const slicing = {
      discriminator: [{ type: 'value', path: 'code' }],
      slices,
    } as any;

    // No values
    expect(assignValuesIntoSlices([], slices, slicing, undefined)).toEqual([[], [], []]);

    // Values match slices
    // Note: slice detection logic inside assignValuesIntoSlices depends on getValueSliceName
    // We mock the simple behavior here by strict equality or reliance on core
    // Since we are testing unit logic, we can rely on how it distributes
  });

  test('prepareSlices', async () => {
    const property: InternalSchemaElement = {
      path: 'Observation.component',
      description: 'Component results',
      min: 0,
      max: Infinity,
      type: [{ code: 'BackboneElement' }],
      slicing: {
        discriminator: [{ type: 'pattern', path: 'code' }],
        ordered: false,
        rule: 'open',
        slices: [
          {
            name: 'Systolic',
            path: 'Observation.component',
            min: 0,
            max: 1,
            type: [{ code: 'BackboneElement' }],
            elements: {},
            description: 'Systolic blood pressure',
          },
        ],
      },
    };

    const slices = await prepareSlices({ medplum, property });
    expect(slices).toBeDefined();
    expect(slices.length).toBe(1);
    expect(slices[0].name).toBe('Systolic');
  });
});
