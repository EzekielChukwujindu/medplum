// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import {
  AccessPolicyInteraction,
  applyDefaultValuesToResource,
  canWriteResourceType,
  isPopulated,
  satisfiedAccessPolicy,
  tryGetProfile,
} from '@medplum/core';
import type { OperationOutcome, Reference, Resource, ResourceType } from '@medplum/fhirtypes';
import { useMedplum, useResource } from '@medplum/solid-hooks';
import { ChevronDown, Pencil, Trash2, AlertCircle } from 'lucide-solid';
import type { JSX } from 'solid-js';
import { createEffect, createMemo, createSignal, Show } from 'solid-js';
import { Alert } from '../Alert/Alert';
import { BackboneElementInput } from '../BackboneElementInput/BackboneElementInput';
import { Button } from '../Button/Button';
import { Dropdown } from '../Dropdown/Dropdown';
import { Form } from '../Form/Form';
import { FormSection } from '../FormSection/FormSection';
import { TextInput } from '../TextInput/TextInput';

export interface ResourceFormProps {
  /** Default resource value or reference to load */
  readonly defaultValue: Partial<Resource> | Reference;
  /** Operation outcome for validation errors */
  readonly outcome?: OperationOutcome;
  /** Callback when form is submitted */
  readonly onSubmit: (resource: Resource) => void;
  /** Optional callback for PATCH operation */
  readonly onPatch?: (resource: Resource) => void;
  /** Optional callback for DELETE operation */
  readonly onDelete?: (resource: Resource) => void;
  /** Profile URL for the resource schema */
  readonly profileUrl?: string;
  /** Test ID */
  readonly testId?: string;
}

/**
 * ResourceForm provides a complete form for editing any FHIR resource.
 * Loads the appropriate schema and renders fields dynamically.
 * @param props
 */
export function ResourceForm(props: ResourceFormProps): JSX.Element {
  const medplum = useMedplum();
  const defaultValue = useResource(props.defaultValue as Reference);
  const [schemaLoaded, setSchemaLoaded] = createSignal(false);
  const [value, setValue] = createSignal<Resource | undefined>(undefined);
  const accessPolicy = () => medplum.getAccessPolicy();

  const resourceType = createMemo(() => {
    const dv = defaultValue();
    return dv?.resourceType as ResourceType | undefined;
  });

  createEffect(() => {
    const dv = defaultValue();
    const rt = resourceType();
    if (dv && rt) {
      if (props.profileUrl) {
        const profileUrl = props.profileUrl;
        medplum
          .requestProfileSchema(profileUrl, { expandProfile: true })
          .then(() => {
            const profile = tryGetProfile(profileUrl);
            if (profile) {
              setSchemaLoaded(true);
              const modifiedDefaultValue = applyDefaultValuesToResource(dv, profile);
              setValue(modifiedDefaultValue);
            } else {
              console.error(`Schema not found for ${profileUrl}`);
            }
          })
          .catch((reason) => {
            console.error('Error in requestProfileSchema', reason);
          });
      } else {
        medplum
          .requestSchema(rt)
          .then(() => {
            setValue(dv);
            setSchemaLoaded(true);
          })
          .catch(console.log);
      }
    }
  });

  const accessPolicyResource = createMemo(() => {
    const dv = defaultValue();
    return dv && satisfiedAccessPolicy(dv, AccessPolicyInteraction.READ, accessPolicy());
  });

  const canWrite = createMemo(() => {
    if (medplum.isSuperAdmin()) {
      return true;
    }

    const ap = accessPolicy();
    if (!ap) {
      return true;
    }

    const v = value();
    if (!isPopulated(v?.resourceType)) {
      return true;
    }

    return canWriteResourceType(ap, v?.resourceType);
  });

  const handleSubmit = (): void => {
    const v = value();
    if (v && props.onSubmit) {
      props.onSubmit(v);
    }
  };

  const handlePatch = (): void => {
    const v = value();
    if (v && props.onPatch) {
      props.onPatch(v);
    }
  };

  const handleDelete = (): void => {
    const v = value();
    if (v && props.onDelete) {
      props.onDelete(v);
    }
  };

  return (
    <Show when={schemaLoaded() && value()} fallback={<div>Loading...</div>}>
      <Show
        when={canWrite()}
        fallback={
          <Alert type="error" title="Permission denied">
            <AlertCircle class="inline w-4 h-4 mr-1" />
            Your access level prevents you from editing and creating {value()?.resourceType} resources.
          </Alert>
        }
      >
        <Form onSubmit={handleSubmit} testid={props.testId}>
          <div class="space-y-4 mb-6">
            <FormSection title="Resource Type" htmlFor="resourceType" outcome={props.outcome}>
              <TextInput name="resourceType" value={value()?.resourceType ?? ''} disabled />
            </FormSection>
            <FormSection title="ID" htmlFor="id" outcome={props.outcome}>
              <TextInput name="id" value={value()?.id ?? ''} disabled />
            </FormSection>
          </div>

          <BackboneElementInput
            path={value()?.resourceType ?? ''}
            valuePath={value()?.resourceType}
            typeName={resourceType() ?? ''}
            defaultValue={value() as unknown as Record<string, unknown>}
            outcome={props.outcome}
            onChange={(val) => setValue(val as unknown as Resource)}
            profileUrl={props.profileUrl}
            accessPolicyResource={accessPolicyResource()}
          />

          <div class="flex justify-end mt-6 gap-0">
            <Show
              when={props.onPatch || props.onDelete}
              fallback={
                <Button type="submit">
                  {defaultValue()?.id ? 'Update' : 'Create'}
                </Button>
              }
            >
              <Button type="submit" class="rounded-r-none">
                {defaultValue()?.id ? 'Update' : 'Create'}
              </Button>
              <Dropdown
                trigger={
                  <button
                    type="button"
                    class="btn btn-primary rounded-l-none border-l-0 px-2"
                    aria-label="More actions"
                  >
                    <ChevronDown class="w-4 h-4" />
                  </button>
                }
                items={[
                  ...(props.onPatch
                    ? [{
                        label: 'Patch',
                        icon: <Pencil class="w-4 h-4" />,
                        onClick: handlePatch,
                      }]
                    : []),
                  ...(props.onDelete
                    ? [{
                        label: 'Delete',
                        icon: <Trash2 class="w-4 h-4 text-error" />,
                        onClick: handleDelete,
                        class: 'text-error',
                      }]
                    : []),
                ]}
              />
            </Show>
          </div>
        </Form>
      </Show>
    </Show>
  );
}
