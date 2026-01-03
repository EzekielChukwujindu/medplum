// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX } from 'solid-js';
import { createSignal, createEffect, Show } from 'solid-js';
import { exportJsonFile, sendCommand } from '../utils/dom';
import { Button } from '../Button/Button';

const CCDA_VIEWER_URL = 'https://ccda.medplum.com';
const BASE_VALIDATION_URL = 'https://ccda-validator.medplum.com/';

export interface CcdaDisplayProps {
  readonly url?: string;
  readonly maxWidth?: number;
}

interface ValidationResult {
  resultsMetaData: {
    ccdaDocumentType: string;
    ccdaVersion: string;
    objectiveProvided: string;
    serviceError: boolean;
    serviceErrorMessage: string | null;
    ccdaFileName: string;
    ccdaFileContents: string;
    resultMetaData: {
      type: string;
      count: number;
    }[];
    severityLevel: string;
    totalConformanceErrorChecks: number;
  };
}

export function CcdaDisplay(props: CcdaDisplayProps): JSX.Element | null {
  const [shouldSend, setShouldSend] = createSignal(false);
  const [validationResult, setValidationResult] = createSignal<ValidationResult>();
  const [validating, setValidating] = createSignal(false);
  let iframeRef: HTMLIFrameElement | undefined;

  createEffect(() => {
    const url = props.url;
    if (!url) {
      return;
    }
    if (shouldSend() && iframeRef) {
      sendCommand(iframeRef, { command: 'loadCcdaXml', value: url }).catch(console.error);
      setShouldSend(false);
    }
  });

  const validateCcda = async (): Promise<void> => {
    const url = props.url;
    if (!url) {
      return;
    }

    try {
      setValidating(true);

      // Download the CCDA from the URL using plain fetch to avoid CORS issues
      const response = await fetch(url);
      const ccdaContent = await response.text();

      // Prepare form data for submission
      const formData = new FormData();
      formData.append('ccdaFile', new Blob([ccdaContent], { type: 'text/xml' }), 'ccda.xml');

      // Submit to validation API using direct fetch to avoid CORS issues
      const validationUrl = `${BASE_VALIDATION_URL}referenceccdaservice/?validationObjective=C-CDA_IG_Plus_Vocab&referenceFileName=No%20scenario%20File&curesUpdate=true&severityLevel=WARNING`;
      const validationResponse = await fetch(validationUrl, {
        method: 'POST',
        body: formData,
        // Don't send credentials for cross-origin requests
        credentials: 'omit',
        // Don't follow redirects automatically
        redirect: 'manual',
      });

      if (!validationResponse.ok) {
        throw new Error(`Validation failed: ${validationResponse.status} ${validationResponse.statusText}`);
      }

      // Parse the JSON response
      const result = await validationResponse.json();
      setValidationResult(result as ValidationResult);
    } catch (error) {
      setValidationResult(undefined);
      console.error('CCDA validation error:', error);
    } finally {
      setValidating(false);
    }
  };

  const downloadResults = (): void => {
    const result = validationResult();
    if (!result) {
      return;
    }

    const resultsJson = JSON.stringify(result, null, 2);
    exportJsonFile(resultsJson, 'ccda-validation-results');
  };

  const getErrorCount = (): number => {
    const result = validationResult();
    if (!result) {
      return 0;
    }
    return result.resultsMetaData.resultMetaData
      .filter((item) => item?.type.includes('Error'))
      .reduce((sum, item) => sum + (item.count || 0), 0);
  };

  return (
    <Show when={props.url}>
      <div data-testid="ccda-iframe" style={{ 'max-width': props.maxWidth ? `${props.maxWidth}px` : undefined }}>
        <div style={{ 'min-height': '400px' }}>
          <iframe
            title="C-CDA Viewer"
            width="100%"
            height="400"
            ref={iframeRef}
            src={CCDA_VIEWER_URL}
            // allowFullScreen is a valid JSX attribute
            style={{ border: 'none' }}
            onLoad={() => setShouldSend(true)}
          />
        </div>

        <div class="mt-4 mb-4 flex items-center">
          <Button type="button" onClick={validateCcda} disabled={validating()}>
            {validating() ? 'Validating...' : 'Validate'}
          </Button>

          <Show when={validationResult()}>
            <div class="ml-4">
              <strong>Validation Results:</strong> {getErrorCount()} errors found
            </div>

            <Button
              type="button"
              onClick={downloadResults}
              variant="accent"
              class="ml-auto"
            >
              Download Full Results
            </Button>
          </Show>
        </div>
      </div>
    </Show>
  );
}
