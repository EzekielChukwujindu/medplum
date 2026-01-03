// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { MockClient } from '@medplum/mock';
import { render } from '@solidjs/testing-library';
import { describe, test } from 'vitest';
import { MockMedplumProvider } from '../test-utils/MockMedplumProvider';
import type { NewUserFormProps } from './NewUserForm';
import { NewUserForm } from './NewUserForm';

const medplum = new MockClient();

function setup(props: Partial<NewUserFormProps> = {}): void {
  render(() => (
    <MockMedplumProvider medplum={medplum}>
      <NewUserForm
        projectId="123"
        googleClientId="123"
        recaptchaSiteKey="123"
        handleAuthResponse={() => {}}
        {...props}
      />
    </MockMedplumProvider>
  ));
}

describe('NewUserForm', () => {
  test('Renders', () => {
    setup();
  });
});
