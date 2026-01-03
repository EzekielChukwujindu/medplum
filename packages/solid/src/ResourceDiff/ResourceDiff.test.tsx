// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, expect, test } from 'vitest';
import { ResourceDiff } from './ResourceDiff';
import type { Patient } from '@medplum/fhirtypes';

describe('ResourceDiff', () => {
  test('Renders', () => {
    const original: Patient = {
      resourceType: 'Patient',
      birthDate: '1990-01-01',
      active: false,
    };

    const revised: Patient = {
      resourceType: 'Patient',
      birthDate: '1990-01-01',
      active: true,
    };

    render(() => <ResourceDiff original={original} revised={revised} />);

    // In Solid implementation, we use Tailwind classes instead of 'removed'/'added'
    // "active": false -> should be removed (error color)
    const removed = screen.getByText(/"active": false/);
    expect(removed).toBeDefined();
    // Check for a class that indicates removal (red/error)
    expect(removed).toHaveClass('text-error');

    // "active": true -> should be added (success color)
    const added = screen.getByText(/"active": true/);
    expect(added).toBeDefined();
    // Check for a class that indicates addition (green/success)
    expect(added).toHaveClass('text-success');
  });

  test('Renders with ignoreMeta', () => {
    const original: Patient = {
        resourceType: 'Patient',
        meta: { versionId: '1' },
        active: false,
    };
    const revised: Patient = {
        resourceType: 'Patient',
        meta: { versionId: '2' },
        active: false,
    };

    // With ignoreMeta, there should be no diff displayed if only meta changed
    // But here active is same.
    // Let's test that meta diff doesn't show up.
    
    render(() => <ResourceDiff original={original} revised={revised} ignoreMeta={true} />);
    
    // Should be no diffs rendered if resources are identical ignoring meta.
    // The implementation of diff() usually returns empty array if no changes.
    // ResourceDiff renders For each delta. If empty, nothing.
    
    expect(screen.queryByText(/"versionId": "1"/)).toBeNull();
    expect(screen.queryByText(/"versionId": "2"/)).toBeNull();
  });
});
