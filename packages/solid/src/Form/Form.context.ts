// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { createContext, useContext  } from 'solid-js';
import type {Accessor} from 'solid-js';

export interface FormContextValue {
  readonly submitting: Accessor<boolean>;
}

export const FormContext = createContext<FormContextValue>();

/**
 * Hook to access form context.
 * Must be used within a Form component.
 */
export function useFormContext(): FormContextValue {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a Form component');
  }
  return context;
}
