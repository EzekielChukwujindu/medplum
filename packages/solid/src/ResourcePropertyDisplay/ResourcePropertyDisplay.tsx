// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { InternalSchemaElement } from '@medplum/core';
import { PropertyType, formatDateTime, formatPeriod, formatTiming, isEmpty } from '@medplum/core';
import type { ElementDefinitionType } from '@medplum/fhirtypes';
import type { JSX } from 'solid-js';
import { createSignal, Match, Show, Switch } from 'solid-js';
import { AddressDisplay } from '../AddressDisplay/AddressDisplay';
import { AttachmentDisplay } from '../AttachmentDisplay/AttachmentDisplay';
import { BackboneElementDisplay } from '../BackboneElementDisplay/BackboneElementDisplay';
import { CodeableConceptDisplay } from '../CodeableConceptDisplay/CodeableConceptDisplay';
import { CodingDisplay } from '../CodingDisplay/CodingDisplay';
import { ContactPointDisplay } from '../ContactPointDisplay/ContactPointDisplay';
import { HumanNameDisplay } from '../HumanNameDisplay/HumanNameDisplay';
import { IdentifierDisplay } from '../IdentifierDisplay/IdentifierDisplay';
import { MoneyDisplay } from '../MoneyDisplay/MoneyDisplay';
import { QuantityDisplay } from '../QuantityDisplay/QuantityDisplay';
import { RangeDisplay } from '../RangeDisplay/RangeDisplay';
import { RatioDisplay } from '../RatioDisplay/RatioDisplay';
import { ReferenceDisplay } from '../ReferenceDisplay/ReferenceDisplay';

export interface ResourcePropertyDisplayProps {
  /** Schema element definition */
  readonly property?: InternalSchemaElement;
  /** The path identifies the element */
  readonly path?: string;
  /** Property type (e.g., 'string', 'Coding', 'Reference') */
  readonly propertyType: string;
  /** The value to display */
  readonly value: unknown;
  /** Whether this is an array element */
  readonly arrayElement?: boolean;
  /** Max width for images/attachments */
  readonly maxWidth?: number;
  /** Ignore missing/empty values */
  readonly ignoreMissingValues?: boolean;
  /** Whether references should be links */
  readonly link?: boolean;
  /** Element definition type for extensions */
  readonly elementDefinitionType?: ElementDefinitionType;
}

/**
 * Low-level component that renders a property from a given resource.
 * Dispatches to appropriate display component based on property type.
 * @param props
 */
export function ResourcePropertyDisplay(props: ResourcePropertyDisplayProps): JSX.Element | null {
  const { propertyType, value, property, link, maxWidth } = props;

  // Handle ID with copy button
  const isIdProperty = property?.path?.endsWith('.id');
  if (isIdProperty) {
    return <IdDisplay value={value as string} />;
  }

  // Handle secret fields
  if (property?.path?.toLowerCase().includes('secret') && propertyType === PropertyType.string) {
    return <SecretFieldDisplay value={value as string} />;
  }

  // Main switch for property types
  return (
    <Switch fallback={<span>{String(value ?? '')}</span>}>
      {/* Primitive types */}
      <Match when={propertyType === PropertyType.boolean}>
        <span>{value === undefined ? '' : Boolean(value).toString()}</span>
      </Match>

      <Match when={propertyType === PropertyType.string || propertyType === PropertyType.SystemString}>
        <div style={{ "white-space": 'pre-wrap' }}>{value as string}</div>
      </Match>

      <Match when={([PropertyType.code, PropertyType.date, PropertyType.decimal, PropertyType.id,
        PropertyType.integer, PropertyType.positiveInt, PropertyType.unsignedInt,
        PropertyType.uri, PropertyType.url, PropertyType.xhtml] as string[]).includes(propertyType)}>
        <span>{String(value ?? '')}</span>
      </Match>

      <Match when={propertyType === PropertyType.dateTime || propertyType === PropertyType.instant}>
        <span>{formatDateTime(value as string)}</span>
      </Match>

      <Match when={propertyType === PropertyType.markdown}>
        <pre>{value as string}</pre>
      </Match>

      {/* Complex types */}
      <Match when={propertyType === PropertyType.Address}>
        <AddressDisplay value={value as any} />
      </Match>

      <Match when={propertyType === PropertyType.Annotation}>
        <span>{(value as any)?.text}</span>
      </Match>

      <Match when={propertyType === PropertyType.Attachment}>
        <AttachmentDisplay value={value as any} maxWidth={maxWidth} />
      </Match>

      <Match when={propertyType === PropertyType.BackboneElement}>
        <BackboneElementDisplay value={value as any} path={props.property?.path ?? ''} />
      </Match>

      <Match when={propertyType === PropertyType.CodeableConcept}>
        <CodeableConceptDisplay value={value as any} />
      </Match>

      <Match when={propertyType === PropertyType.Coding}>
        <CodingDisplay value={value as any} />
      </Match>

      <Match when={propertyType === PropertyType.ContactPoint}>
        <ContactPointDisplay value={value as any} />
      </Match>

      <Match when={propertyType === PropertyType.HumanName}>
        <HumanNameDisplay value={value as any} />
      </Match>

      <Match when={propertyType === PropertyType.Identifier}>
        <IdentifierDisplay value={value as any} />
      </Match>

      <Match when={propertyType === PropertyType.Money}>
        <MoneyDisplay value={value as any} />
      </Match>

      <Match when={propertyType === PropertyType.Period}>
        <span>{formatPeriod(value as any)}</span>
      </Match>

      <Match when={propertyType === PropertyType.Quantity || propertyType === PropertyType.Duration}>
        <QuantityDisplay value={value as any} />
      </Match>

      <Match when={propertyType === PropertyType.Range}>
        <RangeDisplay value={value as any} />
      </Match>

      <Match when={propertyType === PropertyType.Ratio}>
        <RatioDisplay value={value as any} />
      </Match>

      <Match when={propertyType === PropertyType.Reference || propertyType === PropertyType.canonical}>
        <ReferenceDisplay
          value={propertyType === PropertyType.canonical ? { reference: value as string } : value as any}
          link={link}
        />
      </Match>

      <Match when={propertyType === PropertyType.Timing}>
        <span>{formatTiming(value as any)}</span>
      </Match>
    </Switch>
  );
}

interface IdDisplayProps {
  readonly value: string;
}

function IdDisplay(props: IdDisplayProps): JSX.Element {
  const [copied, setCopied] = createSignal(false);

  const copyToClipboard = async (): Promise<void> => {
    if (props.value) {
      await navigator.clipboard.writeText(props.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div class="flex items-center gap-1">
      <span>{props.value}</span>
      <Show when={!isEmpty(props.value)}>
        <button
          type="button"
          class="btn btn-ghost btn-xs"
          onClick={copyToClipboard}
          title={copied() ? 'Copied' : 'Copy'}
        >
          {copied() ? '✓' : '📋'}
        </button>
      </Show>
    </div>
  );
}

interface SecretFieldDisplayProps {
  readonly value: string;
}

function SecretFieldDisplay(props: SecretFieldDisplayProps): JSX.Element {
  const [isVisible, setIsVisible] = createSignal(false);
  const [copied, setCopied] = createSignal(false);
  const MASK = '••••••••';

  const hasValue = !isEmpty(props.value);

  const copyToClipboard = async (): Promise<void> => {
    if (props.value) {
      await navigator.clipboard.writeText(props.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div class="flex items-center gap-1">
      <Show when={isVisible()} fallback={<span aria-hidden="true">{hasValue ? MASK : ''}</span>}>
        <div style={{ "white-space": 'pre-wrap' }}>{props.value}</div>
      </Show>
      <Show when={hasValue}>
        <button
          type="button"
          class="btn btn-ghost btn-xs"
          onClick={copyToClipboard}
          title={copied() ? 'Copied' : 'Copy secret'}
        >
          {copied() ? '✓' : '📋'}
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs"
          onClick={() => setIsVisible(!isVisible())}
          title={isVisible() ? 'Hide secret' : 'Show secret'}
        >
          {isVisible() ? '👁️' : '👁️‍🗨️'}
        </button>
      </Show>
    </div>
  );
}
