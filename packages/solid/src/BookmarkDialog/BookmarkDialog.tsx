// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { WithId } from '@medplum/core';
import { deepClone, normalizeErrorString } from '@medplum/core';
import type { UserConfiguration } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/solid-hooks';
import type { JSX } from 'solid-js';
import { createMemo } from 'solid-js';
import { Button } from '../Button/Button';
import { Form } from '../Form/Form';
import { TextInput } from '../TextInput/TextInput';
import { Modal } from '../Modal/Modal';
import { NativeSelect } from '../NativeSelect/NativeSelect';

interface BookmarkDialogProps {
  readonly pathname: string;
  readonly searchParams: URLSearchParams;
  readonly visible: boolean;
  readonly onOk: () => void;
  readonly onCancel: () => void;
}

export function BookmarkDialog(props: BookmarkDialogProps): JSX.Element | null {
  const medplum = useMedplum();
  // We can access user config directly from medplum.
  // Note: medplum.getUserConfiguration() returns cached object.
  // We generally don't want to rely on internal cache mutation without refetch/invalidation,
  // but React version does it.
  
  const config = () => medplum.getUserConfiguration() as WithId<UserConfiguration>;

  function submitHandler(formData: Record<string, string>): void {
    const { menuname, bookmarkname: name } = formData;
    const target = `${props.pathname}?${props.searchParams.toString()}`;
    const currentConfig = config();
    
    if (!currentConfig) {
      return;
    }

    const newConfig = deepClone(currentConfig);
    const menu = newConfig.menu?.find(({ title }) => title === menuname);

    // If menu doesn't exist? React version assumes it exists or optional chaining works.
    if (menu) {
      if (!menu.link) {
        menu.link = [];
      }
      menu.link.push({ name, target });
    }

    medplum
      .updateResource(newConfig)
      .then((res) => {
        // Refresh logic: Medplum client cache might be updated automatically by updateResource?
        // React version manually updates `config.menu = res.menu` which mutates the cached object.
        // And dispatches 'change'.
        if (currentConfig) {
             currentConfig.menu = res.menu;
        }
        medplum.dispatchEvent({ type: 'change' });
        // showNotification({ color: 'green', message: 'Success' }); // TODO: Notifications
        props.onOk();
      })
      .catch((err: any) => {
        // showNotification({ color: 'red', message: normalizeErrorString(err) });
        console.error(normalizeErrorString(err));
      });
  }

  return (
    <Modal title="Add Bookmark" open={props.visible} onClose={props.onCancel}>
      <Form onSubmit={submitHandler}>
        <div class="flex flex-col gap-4">
          <SelectMenu config={config()} />
          <TextInput label="Bookmark Name" name="bookmarkname" placeholder="Bookmark Name" required />
          <div class="flex justify-end mt-2">
            <Button type="submit">OK</Button>
          </div>
        </div>
      </Form>
    </Modal>
  );
}

interface SelectMenuProps {
  readonly config: UserConfiguration | undefined;
}

function SelectMenu(props: SelectMenuProps): JSX.Element {
  const menus = createMemo(() => {
    return props.config?.menu?.map((menu) => menu.title) || [];
  });

  return (
    <NativeSelect
      name="menuname"
      defaultValue={menus()[0]}
      label="Select Menu Option"
      data={menus()}
      required
    />
  );
}
