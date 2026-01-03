// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { createSignal   } from 'solid-js';
import type {JSX, ParentProps} from 'solid-js';
import { FormContext } from './Form.context';
import { parseForm } from './FormUtils';

export interface FormProps extends ParentProps {
  /** Handler called when form is submitted */
  onSubmit?: (formData: Record<string, string>) => Promise<void> | void;
  /** Inline styles */
  style?: JSX.CSSProperties;
  /** Test ID for testing */
  testid?: string;
  /** Additional CSS classes */
  class?: string;
}

/**
 * Form component that provides form context and handles submission.
 * Automatically sets submitting state and parses form data.
 * 
 * @param props
 * @example
 * ```tsx
 * <Form onSubmit={(data) => console.log(data)}>
 *   <input name="email" type="email" />
 *   <Button type="submit">Submit</Button>
 * </Form>
 * ```
 */
export function Form(props: FormProps): JSX.Element {
  const [submitting, setSubmitting] = createSignal(false);

  const handleSubmit = (e: SubmitEvent): void => {
    e.preventDefault();
    const formData = parseForm(e.target as HTMLFormElement);
    
    if (props.onSubmit) {
      setSubmitting(true);
      const result = props.onSubmit(formData);
      
      if (result && typeof result.then === 'function') {
        result
          .catch(console.error)
          .finally(() => setSubmitting(false));
      } else {
        setSubmitting(false);
      }
    }
  };

  return (
    <FormContext.Provider value={{ submitting }}>
      <form
        style={props.style}
        class={props.class}
        data-testid={props.testid}
        onSubmit={handleSubmit}
      >
        {props.children}
      </form>
    </FormContext.Provider>
  );
}

export { useFormContext } from './Form.context';
