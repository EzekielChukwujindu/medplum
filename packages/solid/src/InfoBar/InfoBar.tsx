// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX, ParentProps } from 'solid-js';

export interface InfoBarProps extends ParentProps {}

/**
 * InfoBar displays key information in a horizontal scrollable bar.
 * Commonly used for patient/resource headers.
 * @param props
 */
export function InfoBar(props: InfoBarProps): JSX.Element {
  return (
    <div class="overflow-x-auto">
      <div class="flex items-center gap-4 p-4 bg-base-200 rounded-lg min-w-max">
        {props.children}
      </div>
    </div>
  );
}

export interface InfoBarEntryProps extends ParentProps {}

function InfoBarEntry(props: InfoBarEntryProps): JSX.Element {
  return <div class="flex flex-col">{props.children}</div>;
}

export interface InfoBarKeyProps extends ParentProps {}

function InfoBarKey(props: InfoBarKeyProps): JSX.Element {
  return <div class="text-xs text-base-content/60 uppercase font-medium">{props.children}</div>;
}

export interface InfoBarValueProps extends ParentProps {}

function InfoBarValue(props: InfoBarValueProps): JSX.Element {
  return <div class="text-sm font-medium">{props.children}</div>;
}

// Attach subcomponents
InfoBar.Entry = InfoBarEntry;
InfoBar.Key = InfoBarKey;
InfoBar.Value = InfoBarValue;
