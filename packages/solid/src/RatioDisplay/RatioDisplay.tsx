// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { Ratio } from '@medplum/fhirtypes';
import type { JSX } from 'solid-js';
import { QuantityDisplay } from '../QuantityDisplay/QuantityDisplay';

export interface RatioDisplayProps {
  readonly value?: Ratio;
}

export function RatioDisplay(props: RatioDisplayProps): JSX.Element | null {
  const value = props.value;
  if (!value) {
    return null;
  }

  return (
    <>
      <QuantityDisplay value={value.numerator} />
      {' / '}
      <QuantityDisplay value={value.denominator} />
    </>
  );
}
