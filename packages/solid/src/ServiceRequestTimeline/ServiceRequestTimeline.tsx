// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { MedplumClient, ProfileResource } from '@medplum/core';
import { createReference } from '@medplum/core';
import type { Attachment, Group, Patient, Reference, ResourceType, ServiceRequest } from '@medplum/fhirtypes';
import type { JSX } from 'solid-js';
import type { ResourceTimelineProps } from '../ResourceTimeline/ResourceTimeline';
import { ResourceTimeline } from '../ResourceTimeline/ResourceTimeline';

export interface ServiceRequestTimelineProps extends Pick<ResourceTimelineProps<ServiceRequest>, 'getMenu'> {
  /** ServiceRequest resource or reference */
  readonly serviceRequest: ServiceRequest | Reference<ServiceRequest>;
}

/**
 * ServiceRequestTimeline displays a timeline for a ServiceRequest resource.
 * Includes communications, diagnostic reports, media, documents, and tasks.
 * @param props
 */
export function ServiceRequestTimeline(props: ServiceRequestTimelineProps): JSX.Element {
  return (
    <ResourceTimeline
      value={props.serviceRequest}
      loadTimelineResources={async (medplum: MedplumClient, resourceType: ResourceType, id: string) => {
        const ref = `${resourceType}/${id}`;
        const _count = 100;
        return Promise.allSettled([
          medplum.readHistory('ServiceRequest', id),
          medplum.search('Communication', { 'based-on': ref, _count }),
          medplum.search('DiagnosticReport', { 'based-on': ref, _count }),
          medplum.search('Media', { 'based-on': ref, _count }),
          medplum.search('DocumentReference', { related: ref, _count }),
          medplum.search('Task', { _filter: `based-on eq ${ref} or focus eq ${ref} or subject eq ${ref}`, _count }),
        ]);
      }}
      createCommunication={(resource: ServiceRequest, sender: ProfileResource, text: string) => ({
        resourceType: 'Communication',
        status: 'completed',
        basedOn: [createReference(resource)],
        subject: resource.subject as Reference<Group | Patient>,
        sender: createReference(sender),
        sent: new Date().toISOString(),
        payload: [{ contentString: text }],
      })}
      createMedia={(resource: ServiceRequest, operator: ProfileResource, content: Attachment) => ({
        resourceType: 'Media',
        status: 'completed',
        basedOn: [createReference(resource)],
        subject: resource.subject,
        operator: createReference(operator),
        issued: new Date().toISOString(),
        content,
      })}
      getMenu={props.getMenu}
    />
  );
}
