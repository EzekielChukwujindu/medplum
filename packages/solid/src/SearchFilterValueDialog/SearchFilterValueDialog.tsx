// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { Filter } from '@medplum/core';
import type { SearchParameter } from '@medplum/fhirtypes';
import { createEffect, createSignal } from 'solid-js';
import type { JSX } from 'solid-js';
import { Button } from '../Button/Button';
import { Form } from '../Form/Form';
import { Modal } from '../Modal/Modal';
import { SearchFilterValueInput } from '../SearchFilterValueInput/SearchFilterValueInput';

export interface SearchFilterValueDialogProps {
  readonly title: string;
  readonly visible: boolean;
  readonly resourceType: string;
  readonly searchParam?: SearchParameter;
  readonly filter?: Filter;
  readonly defaultValue?: string;
  readonly onOk: (filter: Filter) => void;
  readonly onCancel: () => void;
}

export function SearchFilterValueDialog(props: SearchFilterValueDialogProps): JSX.Element | null {
  const [value, setValue] = createSignal(props.defaultValue ?? '');

  createEffect(() => {
    // Sync value when props change or reopen
    if (props.visible) {
        setValue(props.defaultValue ?? '');
    }
  });

  const onOk = () => {
    if (props.filter) {
        props.onOk({ ...props.filter, value: value() });
    }
  };

  return (
    <Modal title={props.title} open={props.visible} onClose={props.onCancel}>
       {props.searchParam && props.filter ? (
           <Form onSubmit={onOk}>
             <div class="flex flex-col gap-4">
                <SearchFilterValueInput
                    resourceType={props.resourceType}
                    searchParam={props.searchParam}
                    defaultValue={value()}
                    autoFocus={true}
                    onChange={setValue}
                />
                <div class="modal-action">
                    <Button type="submit">OK</Button>
                </div>
             </div>
           </Form>
       ) : null}
    </Modal>
  );
}
