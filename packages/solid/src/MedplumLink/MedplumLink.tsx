// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { isReference, isResource } from '@medplum/core';
import type { Reference, Resource } from '@medplum/fhirtypes';
import { useMedplumNavigate } from '@medplum/solid-hooks';
import type { JSX, ParentProps } from 'solid-js';
import { splitProps } from 'solid-js';

export interface MedplumLinkProps extends ParentProps {
  readonly to?: Resource | Reference | string;
  readonly suffix?: string;
  readonly label?: string;
  readonly onClick?: (e: MouseEvent) => void;
  readonly class?: string;
}

/**
 * MedplumLink is a navigation component that handles Resources, References, and strings.
 * Uses useMedplumNavigate for SPA navigation.
 * @param props
 */
export function MedplumLink(props: MedplumLinkProps): JSX.Element {
  const navigate = useMedplumNavigate();
  const [local, others] = splitProps(props, ['to', 'suffix', 'label', 'onClick', 'children', 'class']);

  const href = (): string => {
    let h = getHref(local.to);
    if (local.suffix) {
      h += '/' + local.suffix;
    }
    return h;
  };

  const handleClick = (e: MouseEvent): void => {
    e.stopPropagation();
    if (local.onClick) {
      e.preventDefault();
      local.onClick(e);
    } else if (local.to) {
      // Allow default browser behavior for auxiliary clicks (ctrl+click, middle click, etc.)
      if (!isAuxClick(e)) {
        e.preventDefault();
        navigate(href());
      }
    }
  };

  return (
    <a
      href={href()}
      aria-label={local.label}
      class={`link link-primary ${local.class ?? ''}`}
      onClick={handleClick}
      {...others}
    >
      {local.children}
    </a>
  );
}

function getHref(to: Resource | Reference | string | undefined): string {
  if (to) {
    if (typeof to === 'string') {
      return getStringHref(to);
    } else if (isResource(to)) {
      return getResourceHref(to);
    } else if (isReference(to)) {
      return getReferenceHref(to);
    }
  }
  return '#';
}

function getStringHref(to: string): string {
  if (to.startsWith('http://') || to.startsWith('https://') || to.startsWith('/')) {
    return to;
  }
  return '/' + to;
}

function getResourceHref(to: Resource): string {
  return `/${to.resourceType}/${to.id}`;
}

function getReferenceHref(to: Reference): string {
  return `/${to.reference}`;
}

function isAuxClick(e: MouseEvent): boolean {
  return e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0;
}
