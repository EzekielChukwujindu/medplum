// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { ContentType } from '@medplum/core';


/**
 * Checks if the element is a checkbox cell.
 * @param element - The element to check.
 * @returns True if the element is a checkbox cell.
 */
export function isCheckboxCell(element: Element): boolean {
  if (element instanceof HTMLInputElement && element.type === 'checkbox') {
    return true;
  }
  if (element instanceof HTMLTableCellElement) {
    const children = element.children;
    if (children.length === 1 && children[0] instanceof HTMLInputElement && children[0].type === 'checkbox') {
      return true;
    }
  }
  return false;
}

/**
 * Kills an event by preventing default and stopping propagation.
 * @param event - The event to kill
 */
export function killEvent(event: Event): void {
  event.preventDefault();
  event.stopPropagation();
}

/**
 * Checks if an element should be focusable.
 * @param element - The element to check
 * @returns True if the element is focusable
 */
export function isFocusable(element: Element): boolean {
  const tagName = element.tagName.toLowerCase();
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    tagName === 'button' ||
    (element as HTMLElement).tabIndex >= 0
  );
}

/**
 * Gets the first focusable child element.
 * @param parent - The parent element
 * @returns The first focusable child or undefined
 */
export function getFirstFocusableChild(parent: Element): HTMLElement | undefined {
  const focusable = parent.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  return focusable[0] as HTMLElement | undefined;
}

export type Command<T = string> = {
  command: string;
  value?: T;
};

/**
 * Sends a structured command to the iframe using postMessage.
 *
 * Normally postMessage implies global event listeners. This method uses
 * MessageChannel to create a message channel between the iframe and the parent.
 * @param frame - The receiving IFrame.
 * @param command - The command to send.
 * @returns Promise to the response from the IFrame.
 * @see https://advancedweb.hu/how-to-use-async-await-with-postmessage/
 */
export async function sendCommand<T = string, R = unknown>(frame: HTMLIFrameElement, command: Command<T>): Promise<R> {
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();

    channel.port1.onmessage = ({ data }) => {
      channel.port1.close();
      if (data.error) {
        reject(data.error);
      } else {
        resolve(data.result);
      }
    };

    frame.contentWindow?.postMessage(command, new URL(frame.src).origin, [channel.port2]);
  });
}

/**
 * Creates a Blob object from the JSON object given and downloads the object.
 * @param jsonString - The JSON string.
 * @param fileName - Optional file name. Default is based on current timestamp.
 */
export function exportJsonFile(jsonString: string, fileName?: string): void {
  const blobForExport = new Blob([jsonString], { type: ContentType.JSON });
  const url = URL.createObjectURL(blobForExport);

  const link = document.createElement('a');
  link.href = url;

  const linkName = fileName ?? new Date().toISOString().replaceAll(/\D/g, '');
  link.download = `${linkName}.json`;

  document.body.appendChild(link);
  link.click();

  // Clean up the URL object
  URL.revokeObjectURL(url);
}
