// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { evalFhirPath } from '@medplum/core';
import type { Resource } from '@medplum/fhirtypes';
import type { JSX } from 'solid-js';
import { ResourcePropertyDisplay } from '../ResourcePropertyDisplay/ResourcePropertyDisplay';

export interface FhirPathDisplayProps {
  /** Resource to evaluate FHIRPath against */
  readonly resource: Resource;
  /** FHIRPath expression to evaluate */
  readonly path: string;
  /** Type of the property for display purposes */
  readonly propertyType: string;
}

/**
 * FhirPathDisplay evaluates a FHIRPath expression and displays the result
 * using ResourcePropertyDisplay.
 * @param props
 */
export function FhirPathDisplay(props: FhirPathDisplayProps): JSX.Element | null {
  let value: unknown[];

  try {
    value = evalFhirPath(props.path, props.resource);
  } catch (err) {
    console.warn('FhirPathDisplay:', err);
    return null;
  }

  if (value.length > 1) {
    throw new Error(
      `Component "path" for "FhirPathDisplay" must resolve to a single element. \
       Received ${value.length} elements \
       [${JSON.stringify(value, null, 2)}]`
    );
  }
  
  return <ResourcePropertyDisplay value={value[0] || ''} propertyType={props.propertyType} />;
}
