// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { getDisplayString, getImageSrc } from '@medplum/core';
import type { Reference, Resource } from '@medplum/fhirtypes';
import { useCachedBinaryUrl, useResource } from '@medplum/solid-hooks';
import type { JSX } from 'solid-js';
import { MedplumLink } from '../MedplumLink/MedplumLink';
import { getInitials } from './ResourceAvatar.utils';

export interface ResourceAvatarProps {
  readonly value?: Reference | Resource;
  readonly link?: boolean;
  readonly size?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  readonly src?: string;
  readonly alt?: string;
  readonly class?: string;
}

/**
 * ResourceAvatar displays an avatar for a resource.
 * Shows the resource's image if available, otherwise shows initials.
 * @param props
 */
export function ResourceAvatar(props: ResourceAvatarProps): JSX.Element {
  const resource = useResource(props.value);
  
  const text = (): string => {
    const res = resource();
    return res ? getDisplayString(res) : (props.alt ?? '');
  };
  
  const initials = (): string => getInitials(text());
  
  const uncachedImageUrl = (): string | undefined => {
    const res = resource();
    return (res && getImageSrc(res)) || props.src || undefined;
  };
  
  const imageUrl = useCachedBinaryUrl(uncachedImageUrl);
  
  const sizeClass = (): string => {
    const size = props.size ?? 'md';
    if (typeof size === 'number') {
      return '';
    }
    switch (size) {
      case 'xs': return 'w-6 h-6 text-xs';
      case 'sm': return 'w-8 h-8 text-sm';
      case 'md': return 'w-10 h-10 text-base';
      case 'lg': return 'w-12 h-12 text-lg';
      case 'xl': return 'w-16 h-16 text-xl';
      default: return 'w-10 h-10 text-base';
    }
  };
  
  const sizeStyle = (): Record<string, string> => {
    const size = props.size;
    if (typeof size === 'number') {
      return { width: `${size}px`, height: `${size}px` };
    }
    return {};
  };

  const Avatar = (): JSX.Element => (
    <div
      class={`avatar placeholder ${props.class ?? ''}`}
      style={sizeStyle()}
    >
      <div class={`bg-neutral text-neutral-content rounded-full ${sizeClass()}`}>
        {imageUrl() ? (
          <img src={imageUrl()} alt={text()} class="rounded-full" />
        ) : (
          <span>{initials()}</span>
        )}
      </div>
    </div>
  );

  if (props.link) {
    return (
      <MedplumLink to={resource()}>
        <Avatar />
      </MedplumLink>
    );
  }

  return <Avatar />;
}
