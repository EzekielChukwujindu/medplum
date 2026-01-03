// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { HTTP_HL7_ORG, createReference } from '@medplum/core';
import type { Reference, Signature, Resource } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/solid-hooks';
import type { JSX } from 'solid-js';
import { createEffect, onCleanup } from 'solid-js';
import { Trash } from 'lucide-solid';
import SignaturePad from 'signature_pad';

export interface SignatureInputProps {
  readonly width?: number;
  readonly height?: number;
  readonly defaultValue?: Signature;
  readonly who?: Reference<any>;
  readonly onChange?: (value: Signature | undefined) => void;
  readonly class?: string;
}

export function SignatureInput(props: SignatureInputProps): JSX.Element {
  const medplum = useMedplum();
  let canvasRef: HTMLCanvasElement | undefined;
  let signaturePadRef: SignaturePad | undefined;

  createEffect(() => {
    if (!canvasRef) {return;}

    const signaturePad = new SignaturePad(canvasRef);
    if (props.defaultValue?.data) {
      signaturePad.fromDataURL(props.defaultValue.data);
    }

    const handleEndStroke = (): void => {
      props.onChange?.({
        type: [
          {
            system: HTTP_HL7_ORG + '/fhir/signature-type',
            code: 'ProofOfOrigin',
            display: 'Proof of Origin',
          },
        ],
        when: new Date().toISOString(),
        who: props.who ?? (createReference(medplum.getProfile() as Resource) as Reference<any>),
        data: signaturePad.toDataURL().split(',')[1],
      });
    };

    signaturePad.addEventListener('endStroke', handleEndStroke);
    signaturePadRef = signaturePad;

    onCleanup(() => {
        signaturePad.removeEventListener('endStroke', handleEndStroke);
        signaturePad.off();
    });
  });

  const clearSignature = (): void => {
    if (signaturePadRef) {
      signaturePadRef.clear();
    }
    props.onChange?.(undefined);
  };

  return (
    <div
      class={`relative border border-base-300 rounded-md inline-block ${props.class ?? ''}`}
      style={{ width: `${props.width ?? 500}px`, height: `${props.height ?? 200}px` }}
    >
      <canvas
        ref={canvasRef}
        width={props.width ?? 500}
        height={props.height ?? 200}
        aria-label="Signature input area"
        class="block"
      />
      <button
        type="button"
        onClick={clearSignature}
        aria-label="Clear signature"
        class="absolute top-2 right-2 btn btn-xs btn-ghost text-base-content/50 hover:text-base-content"
      >
        <Trash class="w-4 h-4 mr-1" />
        Clear
      </button>
    </div>
  );
}
