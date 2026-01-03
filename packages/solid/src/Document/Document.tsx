// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX } from 'solid-js';
import { Container } from '../Container/Container';
import { Panel  } from '../Panel/Panel';
import type {PanelProps} from '../Panel/Panel';

export interface DocumentProps extends PanelProps {}

/**
 * Document component combines Container and Panel for a centered document layout.
 * Commonly used as the main content wrapper for resource views.
 * @param props
 */
export function Document(props: DocumentProps): JSX.Element {
  const { children, ...panelProps } = props;
  return (
    <Container>
      <Panel {...panelProps}>{children}</Panel>
    </Container>
  );
}
