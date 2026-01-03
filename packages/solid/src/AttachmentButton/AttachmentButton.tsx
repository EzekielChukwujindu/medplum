// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { normalizeOperationOutcome } from '@medplum/core';
import type { Attachment, OperationOutcome, Reference } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/solid-hooks';
import type { JSX, ParentProps } from 'solid-js';

export interface AttachmentButtonProps extends ParentProps {
  /** Security context for the uploaded file */
  readonly securityContext?: Reference;
  /** Callback when upload completes */
  readonly onUpload: (attachment: Attachment) => void;
  /** Callback when upload starts */
  readonly onUploadStart?: () => void;
  /** Callback for upload progress */
  readonly onUploadProgress?: (e: ProgressEvent) => void;
  /** Callback when upload errors */
  readonly onUploadError?: (outcome: OperationOutcome) => void;
  /** Whether button is disabled */
  readonly disabled?: boolean;
}

/**
 * AttachmentButton handles file upload through hidden file input.
 * Renders children as the clickable trigger.
 * @param props
 */
export function AttachmentButton(props: AttachmentButtonProps): JSX.Element {
  const medplum = useMedplum();
  let fileInputRef: HTMLInputElement | undefined;

  function handleClick(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef?.click();
  }

  function handleFileChange(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    const files = (e.target as HTMLInputElement).files;
    if (files) {
      Array.from(files).forEach(processFile);
    }
    // Reset the input so the same file can be selected again
    if (fileInputRef) {
      fileInputRef.value = '';
    }
  }

  async function processFile(file: File): Promise<void> {
    if (!file?.name) {
      return;
    }

    if (props.onUploadStart) {
      props.onUploadStart();
    }

    try {
      const attachment = await medplum.createAttachment({
        data: file,
        contentType: file.type || 'application/octet-stream',
        filename: file.name,
        securityContext: props.securityContext,
        onProgress: props.onUploadProgress,
      });
      props.onUpload(attachment);
    } catch (err) {
      if (props.onUploadError) {
        props.onUploadError(normalizeOperationOutcome(err));
      }
    }
  }

  return (
    <>
      <input
        disabled={props.disabled}
        type="file"
        data-testid="upload-file-input"
        style={{ display: 'none' }}
        ref={(el) => (fileInputRef = el)}
        onChange={handleFileChange}
      />
      <button
        type="button"
        class="btn btn-primary"
        disabled={props.disabled}
        onClick={handleClick}
        data-testid="upload-button"
      >
        {props.children ?? 'Upload...'}
      </button>
    </>
  );
}
