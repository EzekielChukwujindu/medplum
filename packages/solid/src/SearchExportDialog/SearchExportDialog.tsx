// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX } from 'solid-js';
import { Show } from 'solid-js';
import { Button } from '../Button/Button';
import { Modal } from '../Modal/Modal';

export interface SearchExportDialogProps {
  readonly visible: boolean;
  readonly exportCsv?: () => void;
  readonly exportTransactionBundle?: () => void;
  readonly onCancel: () => void;
}

export function SearchExportDialog(props: SearchExportDialogProps): JSX.Element {
  return (
    <Modal title="Export" open={props.visible} onClose={props.onCancel}>
      <div class="flex justify-between gap-2">
        <Show when={props.exportCsv}>
          <ExportButton text="CSV" exportLogic={props.exportCsv!} onCancel={props.onCancel} />
        </Show>
        <Show when={props.exportTransactionBundle}>
          <ExportButton
            text="Transaction Bundle"
            exportLogic={props.exportTransactionBundle!}
            onCancel={props.onCancel}
          />
        </Show>
      </div>
      <div class="mt-2 text-base-content/60">Limited to 1000 records</div>
    </Modal>
  );
}

interface ExportButtonProps {
  readonly text: string;
  readonly exportLogic: () => void;
  readonly onCancel: () => void;
}

export function ExportButton(props: ExportButtonProps): JSX.Element {
  return (
    <Button
      onClick={() => {
        props.exportLogic();
        props.onCancel();
      }}
    >
      {`Export as ${props.text}`}
    </Button>
  );
}
