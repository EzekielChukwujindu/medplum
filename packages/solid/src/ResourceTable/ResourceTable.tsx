// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { AccessPolicyInteraction, satisfiedAccessPolicy, tryGetProfile } from '@medplum/core';
import type { Reference, Resource } from '@medplum/fhirtypes';
import { useMedplum, useResource } from '@medplum/solid-hooks';
import type { JSX } from 'solid-js';
import { createEffect, createMemo, createSignal } from 'solid-js';
import { BackboneElementDisplay } from '../BackboneElementDisplay/BackboneElementDisplay';

export interface ResourceTableProps {
  /** The input value either as a resource or a reference. */
  readonly value: Resource | Reference;
  /** Optional flag to ignore missing values. */
  readonly ignoreMissingValues?: boolean;
  /** Optional flag to force use the input value. */
  readonly forceUseInput?: boolean;
  /** (optional) URL of the resource profile used to display the form. */
  readonly profileUrl?: string;
}

/**
 * ResourceTable displays a FHIR resource as a property table.
 * Loads schema and renders using BackboneElementDisplay.
 * @param props
 */
export function ResourceTable(props: ResourceTableProps): JSX.Element | null {
  const { profileUrl } = props;
  const medplum = useMedplum();
  const accessPolicy = () => medplum.getAccessPolicy();
  const value = useResource(props.value);
  const [schemaLoaded, setSchemaLoaded] = createSignal(false);

  // Load schema when value or profileUrl changes
  createEffect(() => {
    const resource = value();
    if (!resource) {return;}

    if (profileUrl) {
      medplum
        .requestProfileSchema(profileUrl, { expandProfile: true })
        .then(() => {
          const profile = tryGetProfile(profileUrl);
          if (profile) {
            setSchemaLoaded(true);
          } else {
            console.error(`Schema not found for ${profileUrl}`);
          }
        })
        .catch((reason) => {
          console.error('Error in requestProfileSchema', reason);
        });
    } else {
      const schemaName = resource.resourceType;
      medplum
        .requestSchema(schemaName)
        .then(() => {
          setSchemaLoaded(true);
        })
        .catch(console.error);
    }
  });

  const accessPolicyResource = createMemo(() => {
    const resource = value();
    return resource && satisfiedAccessPolicy(resource, AccessPolicyInteraction.READ, accessPolicy());
  });

  // Return null if schema not loaded or no value
  const resource = value();
  if (!schemaLoaded() || !resource) {
    return null;
  }

  return (
    <BackboneElementDisplay
      path={resource.resourceType}
      value={{
        type: resource.resourceType,
        value: props.forceUseInput ? props.value : resource,
      }}
      profileUrl={profileUrl}
      ignoreMissingValues={props.ignoreMissingValues}
      accessPolicyResource={accessPolicyResource()}
    />
  );
}
