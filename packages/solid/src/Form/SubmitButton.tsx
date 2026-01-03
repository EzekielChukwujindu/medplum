// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Button  } from '../Button/Button';
import type {ButtonProps} from '../Button/Button';

// Solid Button likely already handles loading, but this wrapper maintains API parity
export type SubmitButtonProps = Omit<ButtonProps, 'type' | 'loading'>;

export function SubmitButton(props: ButtonProps) {
    return (
        <Button type="submit" {...props}>
            {props.children}
        </Button>
    );
}
