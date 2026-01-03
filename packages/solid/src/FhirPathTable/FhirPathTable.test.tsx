// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { PropertyType } from '@medplum/core';
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { fireEvent, render, screen, waitFor } from '@solidjs/testing-library';
import { describe, expect, test, vi } from 'vitest';
import type { FhirPathTableField, FhirPathTableProps } from './FhirPathTable';
import { FhirPathTable } from './FhirPathTable';

const query = `{
  ResourceList: ServiceRequestList {
    id,
    subject {
      display,
      reference
    },
    code {
      coding {
        code
      }
    },
    ObservationList(_reference: based_on) {
      id,
      code {
        coding {
          code
        }
      },
      valueString,
      valueQuantity {
        value,
        unit
      }
      interpretation {
        coding {
          system,
          code,
          display
        }
      },
      referenceRange {
        low {
          value,
          unit
        },
        high {
          value,
          unit
        }
      }
    }
  }
  }`;

const fields: FhirPathTableField[] = [
  {
    name: 'ID',
    fhirPath: 'id',
    propertyType: PropertyType.string,
  },
  {
    name: 'Code',
    fhirPath: 'code.coding.code',
    propertyType: PropertyType.string,
  },
  {
    name: 'Patient',
    fhirPath: 'subject.display',
    propertyType: PropertyType.string,
  },
  {
    name: 'Val',
    fhirPath: 'ObservationList[0].valueQuantity',
    propertyType: PropertyType.Quantity,
  },
  {
    name: 'Int',
    fhirPath: 'ObservationList[0].interpretation.coding.display',
    propertyType: PropertyType.string,
  },
  {
    name: 'Low',
    fhirPath: 'ObservationList[0].referenceRange.low',
    propertyType: PropertyType.Quantity,
  },
  {
    name: 'High',
    fhirPath: 'ObservationList[0].referenceRange.high',
    propertyType: PropertyType.Quantity,
  },
];

const medplum = new MockClient();

describe('FhirPathTable', () => {
  async function setup(args: FhirPathTableProps): Promise<void> {
    render(() => (
      <MedplumProvider medplum={medplum}>
        <FhirPathTable {...args} />
      </MedplumProvider>
    ));
  }

  test('Renders results', async () => {
    const props = {
      resourceType: 'ServiceRequest',
      query,
      fields,
    };

    await setup(props);
    await waitFor(() => expect(screen.getByTestId('search-control')).toBeDefined());
    await waitFor(() => expect(screen.getByText('Homer Simpson')).toBeDefined());
  });

  test('Renders with checkboxes', async () => {
    const props = {
      resourceType: 'ServiceRequest',
      query,
      fields,
      checkboxesEnabled: true,
    };

    await setup(props);
    await waitFor(() => expect(screen.getByTestId('search-control')).toBeDefined());
  });

  test('Bulk button', async () => {
    const onBulk = vi.fn();

    await setup({
      resourceType: 'ServiceRequest',
      query,
      fields,
      onBulk,
    });

    await waitFor(() => expect(screen.getByText('Bulk...')).toBeDefined());

    fireEvent.click(screen.getByText('Bulk...'));

    expect(onBulk).toHaveBeenCalled();
  });

  test('Click on row', async () => {
    const onClick = vi.fn();
    const onAuxClick = vi.fn();
    const props = {
      resourceType: 'ServiceRequest',
      query,
      fields,
      onClick,
      onAuxClick,
    };

    await setup(props);
    // Wait for rows to load
    await waitFor(() => expect(screen.queryAllByTestId('search-control-row').length).toBeGreaterThan(0));

    const rows = screen.getAllByTestId('search-control-row');
    fireEvent.click(rows[0]);

    expect(onClick).toHaveBeenCalled();
    expect(onAuxClick).not.toHaveBeenCalled();
  });

  test('Aux click on row', async () => {
    const onClick = vi.fn();
    const onAuxClick = vi.fn();
    const props = {
      resourceType: 'ServiceRequest',
      query,
      fields,
      onClick,
      onAuxClick,
    };

    await setup(props);
    // Wait for rows to load
    await waitFor(() => expect(screen.queryAllByTestId('search-control-row').length).toBeGreaterThan(0));

    const rows = screen.getAllByTestId('search-control-row');
    fireEvent.click(rows[0], { button: 1 });

    expect(onClick).not.toHaveBeenCalled();
    expect(onAuxClick).toHaveBeenCalled();
  });

  test('Click all checkbox', async () => {
    const props = {
      resourceType: 'ServiceRequest',
      query,
      fields,
      checkboxesEnabled: true,
    };

    await setup(props);
    // Wait for rows to load
    await waitFor(() => expect(screen.queryAllByTestId('row-checkbox').length).toBeGreaterThan(0));

    fireEvent.click(screen.getByTestId('all-checkbox'));

    const allCheckbox = screen.getByTestId('all-checkbox') as HTMLInputElement;
    expect(allCheckbox.checked).toEqual(true);

    const rowCheckboxes = screen.queryAllByTestId('row-checkbox');
    expect(rowCheckboxes).toBeDefined();
    expect(rowCheckboxes.length).toEqual(1);
    expect((rowCheckboxes[0] as HTMLInputElement).checked).toEqual(true);
  });

  test('Click row checkbox', async () => {
    const props = {
      resourceType: 'ServiceRequest',
      query,
      fields,
      checkboxesEnabled: true,
    };

    await setup(props);
    // Wait for rows to load
    await waitFor(() => expect(screen.queryAllByTestId('row-checkbox').length).toBeGreaterThan(0));

    const allCheckbox = screen.getByTestId('all-checkbox') as HTMLInputElement;
    const rowCheckbox = screen.getByTestId('row-checkbox') as HTMLInputElement;

    fireEvent.click(rowCheckbox);

    expect(allCheckbox.checked).toEqual(true);
    expect(rowCheckbox.checked).toEqual(true);

    fireEvent.click(rowCheckbox);

    expect(allCheckbox.checked).toEqual(false);
    expect(rowCheckbox.checked).toEqual(false);
  });
});
