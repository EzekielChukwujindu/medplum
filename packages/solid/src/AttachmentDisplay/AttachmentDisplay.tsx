// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { Attachment } from '@medplum/fhirtypes';
import { useCachedBinaryUrl } from '@medplum/solid-hooks';
import type { JSX } from 'solid-js';

export interface AttachmentDisplayProps {
  readonly value?: Attachment;
  readonly maxWidth?: number;
}

/**
 * AttachmentDisplay renders an attachment based on its content type.
 * Supports images, videos, PDFs, and text files.
 * @param props
 */
export function AttachmentDisplay(props: AttachmentDisplayProps): JSX.Element | null {
  const contentType = props.value?.contentType;
  const uncachedUrl = props.value?.url;
  const title = props.value?.title;
  
  const url = useCachedBinaryUrl(() => uncachedUrl);

  if (!url()) {
    return null;
  }

  const maxWidthStyle = (): Record<string, string> => 
    props.maxWidth ? { 'max-width': `${props.maxWidth}px` } : {};

  return (
    <div data-testid="attachment-display">
      {contentType?.startsWith('image/') && (
        <img 
          data-testid="attachment-image" 
          style={maxWidthStyle()} 
          src={url()} 
          alt={title} 
        />
      )}
      {contentType?.startsWith('video/') && (
        <video 
          data-testid="attachment-video" 
          style={maxWidthStyle()} 
          controls
        >
          <source type={contentType} src={url()} />
        </video>
      )}
      {(contentType?.startsWith('text/') ||
        contentType === 'application/json' ||
        contentType === 'application/pdf') && (
        <div 
          data-testid="attachment-iframe" 
          style={{ ...maxWidthStyle(), 'min-height': '400px' }}
        >
          <iframe
            title="Attachment"
            width="100%"
            height="400"
            src={url() + '#navpanes=0'}
            allowfullscreen
          />
        </div>
      )}
      <div data-testid="download-link" class="p-4">
        <a
          href={uncachedUrl}
          data-testid="attachment-details"
          target="_blank"
          rel="noopener noreferrer"
          download={getDownloadName(title)}
          class="link link-primary"
        >
          {title || 'Download'}
        </a>
      </div>
    </div>
  );
}

function getDownloadName(title: string | undefined): string | undefined {
  return title?.includes('.') ? title : undefined;
}
