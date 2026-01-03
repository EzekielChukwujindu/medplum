// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { MedplumClient, ProfileResource } from '@medplum/core';
import { createReference, normalizeErrorString } from '@medplum/core';
import type {
  Attachment,
  AuditEvent,
  Bundle,
  Communication,
  DiagnosticReport,
  Media,
  OperationOutcome,
  Reference,
  Resource,
  ResourceType,
} from '@medplum/fhirtypes';
import { useMedplum, useResource } from '@medplum/solid-hooks';
import { MessageCircle, Upload, Check, AlertCircle } from 'lucide-solid';
import type { JSX } from 'solid-js';
import { createEffect, createSignal, For, Show } from 'solid-js';
import { AttachmentButton } from '../AttachmentButton/AttachmentButton';
import { AttachmentDisplay } from '../AttachmentDisplay/AttachmentDisplay';
import { DiagnosticReportDisplay } from '../DiagnosticReportDisplay/DiagnosticReportDisplay';
import { Form } from '../Form/Form';
import { Panel } from '../Panel/Panel';
import { ResourceAvatar } from '../ResourceAvatar/ResourceAvatar';
import { ResourceDiffTable } from '../ResourceDiffTable/ResourceDiffTable';
import { ResourceTable } from '../ResourceTable/ResourceTable';
import type { TimelineItemProps } from '../Timeline/Timeline';
import { Timeline, TimelineItem } from '../Timeline/Timeline';
import { sortByDateAndPriority } from '../utils/date';

export interface ResourceTimelineMenuItemContext {
  readonly primaryResource: Resource;
  readonly currentResource: Resource;
  readonly reloadTimeline: () => void;
}

export interface ResourceTimelineProps<T extends Resource> {
  /** Primary resource value or reference */
  readonly value: T | Reference<T>;
  /** Function to load timeline resources */
  readonly loadTimelineResources: (
    medplum: MedplumClient,
    resourceType: ResourceType,
    id: string
  ) => Promise<PromiseSettledResult<Bundle>[]>;
  /** Function to create a Communication from text */
  readonly createCommunication?: (resource: T, sender: ProfileResource, text: string) => Communication;
  /** Function to create a Media from attachment */
  readonly createMedia?: (resource: T, operator: ProfileResource, attachment: Attachment) => Media;
  /** Function to get menu items for a timeline item */
  readonly getMenu?: (context: ResourceTimelineMenuItemContext) => JSX.Element;
}

/**
 * ResourceTimeline displays a timeline of activity for a resource.
 * Includes comments, media uploads, audit events, and version history.
 * @param props
 */
export function ResourceTimeline<T extends Resource>(props: ResourceTimelineProps<T>): JSX.Element {
  const medplum = useMedplum();
  const sender = medplum.getProfile() as ProfileResource;
  const resource = useResource(props.value as Reference<T>);
  const [history, setHistory] = createSignal<Bundle>();
  const [items, setItems] = createSignal<Resource[]>([]);
  const [countToShow, setCountToShow] = createSignal(10);
  const [commentText, setCommentText] = createSignal('');
  const [uploadStatus, setUploadStatus] = createSignal<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = createSignal('');

  /**
   * Sorts and sets the items by date.
   * @param newItems
   */
  function sortAndSetItems(newItems: Resource[]): void {
    const res = resource();
    if (res) {
      sortByDateAndPriority(newItems, res);
      newItems.reverse();
    } else {
      newItems.sort((a, b) => {
        const aDate = a.meta?.lastUpdated ?? '';
        const bDate = b.meta?.lastUpdated ?? '';
        return bDate.localeCompare(aDate);
      });
    }
    setItems(newItems);
  }

  /**
   * Handles a batch request response.
   * @param batchResponse
   */
  function handleBatchResponse(batchResponse: PromiseSettledResult<Bundle>[]): void {
    const newItems: Resource[] = [];

    for (const settledResult of batchResponse) {
      if (settledResult.status !== 'fulfilled') {
        continue;
      }

      const bundle = settledResult.value;
      if (bundle.type === 'history') {
        setHistory(bundle);
      }

      if (bundle.entry) {
        for (const entry of bundle.entry) {
          if (entry.resource) {
            newItems.push(entry.resource);
          }
        }
      }
    }

    sortAndSetItems(newItems);
  }

  /**
   * Adds a resource to the timeline.
   * @param newResource
   */
  function addResource(newResource: Resource): void {
    sortAndSetItems([...items(), newResource]);
  }

  /**
   * Loads the timeline.
   */
  function loadTimeline(): void {
    let resourceType: ResourceType;
    let id: string;
    if ('resourceType' in props.value) {
      resourceType = props.value.resourceType;
      id = props.value.id as string;
    } else {
      [resourceType, id] = (props.value.reference?.split('/') ?? []) as [ResourceType, string];
    }
    if (resourceType && id) {
      props.loadTimelineResources(medplum, resourceType, id)
        .then(handleBatchResponse)
        .catch(console.error);
    }
  }

  // Load timeline on mount
  createEffect(() => {
    loadTimeline();
  });

  /**
   * Creates a comment (Communication resource).
   * @param contentString
   */
  function createComment(contentString: string): void {
    const res = resource();
    if (!res || !props.createCommunication) {
      return;
    }
    medplum
      .createResource(props.createCommunication(res, sender, contentString))
      .then((result) => {
        addResource(result);
        setCommentText('');
      })
      .catch(console.error);
  }

  /**
   * Creates a media resource from an attachment.
   * @param attachment
   */
  function createMedia(attachment: Attachment): void {
    const res = resource();
    if (!res || !props.createMedia) {
      return;
    }
    medplum
      .createResource(props.createMedia(res, sender, attachment))
      .then((result) => {
        addResource(result);
        setUploadStatus('success');
        setUploadMessage('Upload complete');
        setTimeout(() => setUploadStatus('idle'), 2000);
      })
      .catch((reason) => {
        setUploadStatus('error');
        setUploadMessage(normalizeErrorString(reason));
        setTimeout(() => setUploadStatus('idle'), 3000);
      });
  }

  function onUploadStart(): void {
    setUploadStatus('uploading');
    setUploadMessage('Initializing upload...');
  }

  function onUploadProgress(e: ProgressEvent): void {
    setUploadMessage(getProgressMessage(e));
  }

  function onUploadError(outcome: OperationOutcome): void {
    setUploadStatus('error');
    setUploadMessage(normalizeErrorString(outcome));
    setTimeout(() => setUploadStatus('idle'), 3000);
  }

  function handleSubmit(formData: Record<string, string>): void {
    if (formData.text?.trim()) {
      createComment(formData.text);
    }
  }

  const itemsToShow = () => items().filter((item) => item).slice(0, countToShow());
  const hasMoreItems = () => countToShow() < items().length;

  return (
    <Show when={resource()} fallback={<div class="flex justify-center p-8"><span class="loading loading-spinner loading-lg" /></div>}>
      {(res) => (
        <Timeline>
          {/* Comment input form */}
          <Show when={props.createCommunication}>
            <Panel>
              <Form testid="timeline-form" onSubmit={handleSubmit}>
                <div class="flex items-center gap-2">
                  <ResourceAvatar value={sender} size="sm" />
                  <input
                    type="text"
                    name="text"
                    placeholder="Add comment"
                    class="input input-bordered flex-1"
                    value={commentText()}
                    onInput={(e) => setCommentText(e.currentTarget.value)}
                  />
                  <button type="submit" class="btn btn-primary btn-circle btn-sm">
                    <MessageCircle class="w-4 h-4" />
                  </button>
                  <Show when={props.createMedia}>
                    <AttachmentButton
                      securityContext={createReference(res())}
                      onUpload={createMedia}
                      onUploadStart={onUploadStart}
                      onUploadProgress={onUploadProgress}
                      onUploadError={onUploadError}
                    >
                      <Upload class="w-4 h-4" />
                    </AttachmentButton>
                  </Show>
                </div>
                
                {/* Upload status toast */}
                <Show when={uploadStatus() !== 'idle'}>
                  <div class={`alert mt-2 ${uploadStatus() === 'error' ? 'alert-error' : uploadStatus() === 'success' ? 'alert-success' : 'alert-info'}`}>
                    <Show when={uploadStatus() === 'uploading'}>
                      <span class="loading loading-spinner loading-sm" />
                    </Show>
                    <Show when={uploadStatus() === 'success'}>
                      <Check class="w-4 h-4" />
                    </Show>
                    <Show when={uploadStatus() === 'error'}>
                      <AlertCircle class="w-4 h-4" />
                    </Show>
                    <span>{uploadMessage()}</span>
                  </div>
                </Show>
              </Form>
            </Panel>
          </Show>

          {/* Timeline items */}
          <For each={itemsToShow()}>
            {(item) => {
              const _key = `${item.resourceType}/${item.id}/${item.meta?.versionId}`;
              const menu = props.getMenu
                ? props.getMenu({
                    primaryResource: res(),
                    currentResource: item,
                    reloadTimeline: loadTimeline,
                  })
                : undefined;
              
              // Check if this is a history item for the primary resource
              if (item.resourceType === res().resourceType && item.id === res().id) {
                return (
                  <HistoryTimelineItem
                    history={history()!}
                    resource={item}
                    popupMenuItems={menu}
                  />
                );
              }
              
              // Handle different resource types
              switch (item.resourceType) {
                case 'AuditEvent':
                  return <AuditEventTimelineItem resource={item as AuditEvent} popupMenuItems={menu} />;
                case 'Communication':
                  return <CommunicationTimelineItem resource={item as Communication} popupMenuItems={menu} />;
                case 'DiagnosticReport':
                  return <DiagnosticReportTimelineItem resource={item as DiagnosticReport} popupMenuItems={menu} />;
                case 'Media':
                  return <MediaTimelineItem resource={item as Media} popupMenuItems={menu} />;
                default:
                  return (
                    <TimelineItem resource={item} padding={true} popupMenuItems={menu}>
                      <ResourceTable value={item} ignoreMissingValues={true} />
                    </TimelineItem>
                  );
              }
            }}
          </For>

          {/* Load more button */}
          <Show when={hasMoreItems()}>
            <div class="flex justify-center py-4">
              <button 
                type="button"
                class="btn btn-ghost"
                onClick={() => setCountToShow((prev) => prev + 10)}
              >
                Show More
              </button>
            </div>
          </Show>
        </Timeline>
      )}
    </Show>
  );
}

interface HistoryTimelineItemProps extends TimelineItemProps {
  readonly history: Bundle;
}

function HistoryTimelineItem(props: HistoryTimelineItemProps): JSX.Element {
  const previous = getPrevious(props.history, props.resource);
  
  return (
    <Show
      when={previous}
      fallback={
        <TimelineItem resource={props.resource} padding={true} popupMenuItems={props.popupMenuItems}>
          <h3 class="font-semibold">Created</h3>
          <ResourceTable value={props.resource} ignoreMissingValues forceUseInput />
        </TimelineItem>
      }
    >
      {(prev) => (
        <TimelineItem resource={props.resource} padding={true} popupMenuItems={props.popupMenuItems}>
          <ResourceDiffTable original={prev()} revised={props.resource} />
        </TimelineItem>
      )}
    </Show>
  );
}

function getPrevious(history: Bundle | undefined, version: Resource): Resource | undefined {
  if (!history) {
    return undefined;
  }
  const entries = history.entry ?? [];
  const index = entries.findIndex((entry) => entry.resource?.meta?.versionId === version.meta?.versionId);
  if (index >= entries.length - 1) {
    return undefined;
  }
  return entries[index + 1].resource;
}

function CommunicationTimelineItem(props: TimelineItemProps<Communication>): JSX.Element {
  const routine = !props.resource.priority || props.resource.priority === 'routine';
  
  return (
    <TimelineItem
      resource={props.resource}
      profile={props.resource.sender}
      dateTime={props.resource.sent}
      padding={true}
      class={routine ? '' : 'bg-warning/10 border-l-4 border-warning'}
      popupMenuItems={props.popupMenuItems}
    >
      <p>{props.resource.payload?.[0]?.contentString}</p>
    </TimelineItem>
  );
}

function MediaTimelineItem(props: TimelineItemProps<Media>): JSX.Element {
  const contentType = props.resource.content?.contentType;
  const padding =
    contentType &&
    !contentType.startsWith('image/') &&
    !contentType.startsWith('video/') &&
    contentType !== 'application/pdf';
    
  return (
    <TimelineItem resource={props.resource} padding={!!padding} popupMenuItems={props.popupMenuItems}>
      <AttachmentDisplay value={props.resource.content} />
    </TimelineItem>
  );
}

function AuditEventTimelineItem(props: TimelineItemProps<AuditEvent>): JSX.Element {
  return (
    <TimelineItem resource={props.resource} padding={true} popupMenuItems={props.popupMenuItems}>
      <div class="overflow-x-auto">
        <pre class="text-sm bg-base-200 p-2 rounded">{props.resource.outcomeDesc}</pre>
      </div>
    </TimelineItem>
  );
}

function DiagnosticReportTimelineItem(props: TimelineItemProps<DiagnosticReport>): JSX.Element {
  return (
    <TimelineItem resource={props.resource} padding={true} popupMenuItems={props.popupMenuItems}>
      <DiagnosticReportDisplay value={props.resource} />
    </TimelineItem>
  );
}

function getProgressMessage(e: ProgressEvent): string {
  if (e.lengthComputable) {
    const percent = (100 * e.loaded) / e.total;
    return `Uploaded: ${formatFileSize(e.loaded)} / ${formatFileSize(e.total)} ${percent.toFixed(2)}%`;
  }
  return `Uploaded: ${formatFileSize(e.loaded)}`;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return '0.00 B';
  }
  const e = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, e)).toFixed(2) + ' ' + ' KMGTP'.charAt(e) + 'B';
}
