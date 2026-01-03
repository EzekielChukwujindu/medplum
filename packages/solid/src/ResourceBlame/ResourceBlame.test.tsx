// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { render, screen } from '@solidjs/testing-library';
import { describe, expect, test, vi } from 'vitest';
import type { ResourceBlameProps } from './ResourceBlame';
import { ResourceBlame } from './ResourceBlame';
import { getTimeString } from './ResourceBlame.utils';

const medplum = new MockClient();

describe('ResourceBlame', () => {
    function setup(args: ResourceBlameProps) {
        return render(() => (
            <MedplumProvider medplum={medplum}>
                <ResourceBlame {...args} />
            </MedplumProvider>
        ));
    }

    test('ResourceBlame renders preloaded history', async () => {
        const history = await medplum.readHistory('Patient', '123');
        setup({
            history,
        });

        const el = await screen.findAllByText('1');
        expect(el).toBeDefined();
        expect(el.length).not.toBe(0);
    });

    test('ResourceBlame renders after loading the resource', async () => {
        setup({
            resourceType: 'Patient',
            id: '123',
        });

        const el = await screen.findAllByText('1');
        expect(el).toBeDefined();
        expect(el.length).not.toBe(0);
    });

    test('getTimeString', () => {
        vi.useFakeTimers();
        // Set system time to a specific point so subtraction works consistently
        // Actually getTimeString uses Date.now(), so we just mock Date.now() effectively via fake timers
        // But to test specific "ago" values, we need consistent math.
        // Assuming test runs instantly, but diffs are large enough.

        const now = Date.now();
        expect(getTimeString(new Date(now - 1e3).toISOString())).toEqual('1 second ago');
        expect(getTimeString(new Date(now - 2e3).toISOString())).toEqual('2 seconds ago');
        expect(getTimeString(new Date(now - 60e3).toISOString())).toEqual('1 minute ago');
        expect(getTimeString(new Date(now - 120e3).toISOString())).toEqual('2 minutes ago');
        expect(getTimeString(new Date(now - 3600e3).toISOString())).toEqual('1 hour ago');
        expect(getTimeString(new Date(now - 7200e3).toISOString())).toEqual('2 hours ago');
        expect(getTimeString(new Date(now - 86400e3).toISOString())).toEqual('1 day ago');
        expect(getTimeString(new Date(now - 172800e3).toISOString())).toEqual('2 days ago');
        expect(getTimeString(new Date(now - 2592000e3).toISOString())).toEqual('1 month ago');
        expect(getTimeString(new Date(now - 5184000e3).toISOString())).toEqual('2 months ago');
        expect(getTimeString(new Date(now - 31536000e3).toISOString())).toEqual('1 year ago');
        expect(getTimeString(new Date(now - 63072000e3).toISOString())).toEqual('2 years ago');
        vi.useRealTimers();
    });
});
