// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { ContentType, normalizeErrorString, resolveId } from '@medplum/core';
import type { Patient, Reference } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/solid-hooks';
import type { JSX } from 'solid-js';
import { createSignal } from 'solid-js';
import { DateTimeInput } from '../DateTimeInput/DateTimeInput';
import { convertLocalToIso } from '../DateTimeInput/DateTimeInput.utils';
import { Form } from '../Form/Form';
import { FormSection } from '../FormSection/FormSection';
import { ReferenceInput } from '../ReferenceInput/ReferenceInput';

export interface PatientExportFormProps {
  readonly patient: Patient | Reference<Patient>;
}

interface FormatDefinition {
  operation: string;
  type?: string;
  extension: string;
  contentType: string;
}

const formats: Record<string, FormatDefinition> = {
  everything: {
    operation: '$everything',
    extension: 'json',
    contentType: ContentType.FHIR_JSON,
  },
  summary: {
    operation: '$summary',
    extension: 'json',
    contentType: ContentType.FHIR_JSON,
  },
  ccda: {
    operation: '$ccda-export',
    extension: 'xml',
    contentType: ContentType.CDA_XML,
  },
  ccdaReferral: {
    operation: '$ccda-export',
    type: 'referral',
    extension: 'xml',
    contentType: ContentType.CDA_XML,
  },
};

/**
 * PatientExportForm provides a form to export patient data in various formats.
 * Supports FHIR Everything, Patient Summary, C-CDA, and C-CDA Referral formats.
 * @param props
 */
export function PatientExportForm(props: PatientExportFormProps): JSX.Element {
  const medplum = useMedplum();
  const [loading, setLoading] = createSignal(false);
  const [status, setStatus] = createSignal<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = createSignal('');

  const handleSubmit = async (formData: Record<string, string>) => {
    const patientId = resolveId(props.patient) as string;
    const format = formData.format as keyof typeof formats;
    const { operation, type, contentType, extension } = formats[format];
    const url = medplum.fhirUrl('Patient', patientId, operation);
    const params: Record<string, unknown> = {};

    if (type) {
      params.type = type;
    }

    if (formData.author) {
      params.author = { reference: formData.author };
    }

    if (formData.authoredOn) {
      params.authoredOn = convertLocalToIso(formData.authoredOn);
    }

    if (formData.startDate) {
      params.start = formData.startDate;
    }

    if (formData.endDate) {
      params.end = formData.endDate;
    }

    setLoading(true);
    setStatus('loading');
    setMessage('Exporting...');

    try {
      const response = await medplum.post(url, params, undefined, {
        cache: 'no-cache',
        headers: { Accept: contentType },
      });

      const fileName = `Patient-export-${patientId}-${new Date().toISOString().replaceAll(':', '-')}.${extension}`;

      saveData(response, fileName, contentType);

      setStatus('success');
      setMessage('Done');
    } catch (err) {
      setStatus('error');
      setMessage(normalizeErrorString(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Form onSubmit={handleSubmit} data-testid="patient-export-form">
        <div class="flex flex-col gap-4">
          <FormSection title="Export Format" description="Required" withAsterisk>
            <div class="flex flex-wrap gap-1">
              <label class="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value="everything"
                  class="hidden peer"
                  checked
                />
                <div class="btn btn-outline w-full peer-checked:btn-primary">
                  FHIR Everything
                </div>
              </label>
              <label class="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value="summary"
                  class="hidden peer"
                />
                <div class="btn btn-outline w-full peer-checked:btn-primary">
                  Patient Summary
                </div>
              </label>
              <label class="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value="ccda"
                  class="hidden peer"
                />
                <div class="btn btn-outline w-full peer-checked:btn-primary">
                  C-CDA
                </div>
              </label>
              <label class="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value="ccdaReferral"
                  class="hidden peer"
                />
                <div class="btn btn-outline w-full peer-checked:btn-primary">
                  C-CDA Referral
                </div>
              </label>
            </div>
          </FormSection>

          <FormSection title="Author" description="Optional author for composition. Default value is current user.">
            <ReferenceInput
              name="author"
              placeholder="Author"
              targetTypes={['Organization', 'Practitioner', 'PractitionerRole']}
            />
          </FormSection>

          <FormSection
            title="Authored On"
            description="Optional date for composition authored on. Default value is current date."
          >
            <DateTimeInput name="authoredOn" placeholder="Authored on" />
          </FormSection>

          <FormSection
            title="Start Date"
            description="The start date of care. If no start date is provided, all records prior to the end date are in scope."
          >
            <DateTimeInput name="startDate" placeholder="Start date" />
          </FormSection>

          <FormSection
            title="End Date"
            description="The end date of care. If no end date is provided, all records subsequent to the start date are in scope."
          >
            <DateTimeInput name="endDate" placeholder="End date" />
          </FormSection>

          <div class="flex justify-end">
            <button type="submit" class="btn btn-primary" disabled={loading()}>
              {loading() ? 'Exporting...' : 'Request Export'}
            </button>
          </div>
        </div>
      </Form>

      {status() !== 'idle' && (
        <div
          class={`alert mt-4 ${
            status() === 'loading' ? 'alert-info' :
            status() === 'success' ? 'alert-success' :
            'alert-error'
          }`}
          data-testid="export-status"
        >
          <span>{status() === 'loading' ? 'Patient Export' : message()}</span>
          {status() === 'loading' && <span class="loading loading-spinner"></span>}
        </div>
      )}
    </div>
  );
}

/**
 * Tricks the browser into downloading a file.
 * @param data - The data to save.
 * @param fileName - The name of the file.
 * @param contentType - The content type of the file.
 */
function saveData(data: unknown, fileName: string, contentType: string): void {
  const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  const blob = new Blob([content], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  document.body.appendChild(a);
  a.style.display = 'none';
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
}
