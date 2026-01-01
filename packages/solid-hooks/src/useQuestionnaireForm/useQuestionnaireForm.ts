// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { getExtension } from '@medplum/core';
import type {
  Encounter,
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
  Reference,
  Signature,
} from '@medplum/fhirtypes';
import { batch, createEffect } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import { useResource } from '../useResource/useResource';
import {
  buildInitialResponse,
  buildInitialResponseItem,
  evaluateCalculatedExpressionsInQuestionnaire,
  QUESTIONNAIRE_ITEM_CONTROL_URL,
  QUESTIONNAIRE_SIGNATURE_RESPONSE_URL,
} from './utils';

export interface UseQuestionnaireFormProps {
  readonly questionnaire: Questionnaire | Reference<Questionnaire>;
  readonly defaultValue?: QuestionnaireResponse | Reference<QuestionnaireResponse>;
  readonly subject?: Reference;
  readonly encounter?: Reference<Encounter>;
  readonly source?: QuestionnaireResponse['source'];
  readonly disablePagination?: boolean;
  readonly onChange?: (response: QuestionnaireResponse) => void;
}

export interface QuestionnaireFormPage {
  readonly linkId: string;
  readonly title: string;
  readonly group: QuestionnaireItem & { type: 'group' };
}

export interface QuestionnaireFormLoadingState {
  readonly loading: true;
}

export interface QuestionnaireFormLoadedState {
  readonly loading: false;
  readonly questionnaire: Questionnaire;
  readonly questionnaireResponse: QuestionnaireResponse;
  readonly subject?: Reference;
  readonly encounter?: Reference<Encounter>;
  readonly items: QuestionnaireItem[];
  readonly responseItems: QuestionnaireResponseItem[];
  readonly onAddGroup: (context: QuestionnaireResponseItem[], item: QuestionnaireItem) => void;
  readonly onAddAnswer: (context: QuestionnaireResponseItem[], item: QuestionnaireItem) => void;
  readonly onChangeAnswer: (
    context: QuestionnaireResponseItem[],
    item: QuestionnaireItem,
    answer: QuestionnaireResponseItemAnswer[]
  ) => void;
  readonly onChangeSignature: (signature: Signature | undefined) => void;
}

export interface QuestionnaireFormSinglePageState extends QuestionnaireFormLoadedState {
  readonly pagination: false;
}

export interface QuestionnaireFormPaginationState extends QuestionnaireFormLoadedState {
  readonly pagination: true;
  readonly pages: QuestionnaireFormPage[];
  readonly activePage: number;
  readonly onNextPage: () => void;
  readonly onPrevPage: () => void;
}

export type QuestionnaireFormState =
  | QuestionnaireFormLoadingState
  | QuestionnaireFormSinglePageState
  | QuestionnaireFormPaginationState;

export function useQuestionnaireForm(props: UseQuestionnaireFormProps): QuestionnaireFormState {
  // Pass props directly, not as accessor - creating a new accessor on each render causes infinite loops
  const questionnaire = useResource(props.questionnaire);
  const defaultResponse = useResource(props.defaultValue);

  const [state, setState] = createStore<{
    questionnaire?: Questionnaire;
    questionnaireResponse?: QuestionnaireResponse;
    pages?: QuestionnaireFormPage[];
    activePage: number;
    loading: boolean;
  }>({
    activePage: 0,
    loading: true,
  });

  // Load Questionnaire
  createEffect(() => {
    const q = questionnaire();
    if (q) {
      batch(() => {
        setState('questionnaire', q);
        setState('pages', props.disablePagination ? undefined : getPages(q));
      });
    }
  });

  // Load or Create Response
  createEffect(() => {
    const q = state.questionnaire;
    const def = defaultResponse();
    const defValProp = props.defaultValue;

    if (!q || state.questionnaireResponse) {
      return;
    }

    if (defValProp) {
        if (def) {
            batch(() => {
                setState('questionnaireResponse', buildInitialResponse(q, def));
                emitChange();
            });
        }
    } else {
         batch(() => {
            setState('questionnaireResponse', buildInitialResponse(q));
            emitChange();
         });
    }
  });


  // Update loading state
  createEffect(() => {
    // It is loading if questionnaire is missing OR if we are waiting for a default response
    const qMissing = !state.questionnaire;
    const respMissing = !state.questionnaireResponse;
    // If defaultValue prop is provided but not loaded yet
    // const waitingForDefault = props.defaultValue && !defaultResponse;
    
    // Actually, simple logic: if we don't have both Q and Resp, we are loading.
    setState('loading', qMissing || respMissing);
  });


  // Note: getResponseItemByContext is replaced by findResponseItemPath for proper store mutations

  function emitChange(): void {
    const currentResponse = state.questionnaireResponse;
    if (!currentResponse || !state.questionnaire) {
      return;
    }
    
    if (state.questionnaire.item) {
       evaluateCalculatedExpressionsInQuestionnaire(state.questionnaire.item, currentResponse);
    }
    
    props.onChange?.(currentResponse);
    // Force reactivity update on the specific path if needed, but setState on store usually handles it.
    // Since we mutate the object inside logic below, we might need to reconcile or set state.
    // Solid's createStore creates a deep proxy. Direct mutation of the proxy works!
    // But `state.questionnaireResponse` is a proxy.
  }

  // --- Actions ---

  const onNextPage = () => setState('activePage', (p) => p + 1);
  const onPrevPage = () => setState('activePage', (p) => p - 1);

  // Helper to find the path to a response item by context
  function findResponseItemPath(context: QuestionnaireResponseItem[], item?: QuestionnaireItem): (string | number)[] | undefined {
    const path: (string | number)[] = ['questionnaireResponse'];
    let current: QuestionnaireResponse | QuestionnaireResponseItem | undefined = state.questionnaireResponse;
    
    for (const contextElement of context) {
      if (!current?.item) return undefined;
      const idx = current.item.findIndex((i) =>
        contextElement.id ? i.id === contextElement.id : i.linkId === contextElement.linkId
      );
      if (idx === -1) return undefined;
      path.push('item', idx);
      current = current.item[idx];
    }
    
    if (item && current) {
      if (!current.item) return undefined;
      const idx = current.item.findIndex((i) => i.linkId === item.linkId);
      if (idx === -1) return undefined;
      path.push('item', idx);
    }
    
    return path;
  }

  const onAddGroup = (context: QuestionnaireResponseItem[], item: QuestionnaireItem) => {
    const path = findResponseItemPath(context);
    if (!path) return;
    
    setState(...path as [any], produce((responseItem: QuestionnaireResponseItem | QuestionnaireResponse) => {
      if (!responseItem.item) {
        responseItem.item = [];
      }
      responseItem.item.push(buildInitialResponseItem(item));
    }));
    emitChange();
  };

  const onAddAnswer = (context: QuestionnaireResponseItem[], item: QuestionnaireItem) => {
    const path = findResponseItemPath(context, item);
    if (!path) return;
    
    setState(...path as [any], produce((currentItem: QuestionnaireResponseItem) => {
      if (!currentItem.answer) {
        currentItem.answer = [];
      }
      currentItem.answer.push({});
    }));
    emitChange();
  };

  const onChangeAnswer = (
    context: QuestionnaireResponseItem[],
    item: QuestionnaireItem,
    answer: QuestionnaireResponseItemAnswer[]
  ) => {
    const path = findResponseItemPath(context, item);
    if (!path) return;
    
    setState(...path as [any], 'answer', answer);
    emitChange();
  };

  const onChangeSignature = (signature: Signature | undefined) => {
    if (!state.questionnaireResponse) return;

    setState('questionnaireResponse', produce((resp) => {
      if (!resp) return;
      if (signature) {
        const ext = (resp.extension || []).filter((e) => e.url !== QUESTIONNAIRE_SIGNATURE_RESPONSE_URL);
        ext.push({ url: QUESTIONNAIRE_SIGNATURE_RESPONSE_URL, valueSignature: signature });
        resp.extension = ext;
      } else {
        resp.extension = (resp.extension || []).filter((e) => e.url !== QUESTIONNAIRE_SIGNATURE_RESPONSE_URL);
      }
    }));
    emitChange();
  };


  // derived accessors
  
  // We return the store directly (masked as the interface).
  // This works because the interface expects properties, and the store has properties (which are getters).
  // We just need to add the methods and calculated properties.
  
  // Actually, we can return a merged object.
  return {
    get loading() { return state.loading; },
    get questionnaire() { return state.questionnaire!; },
    get questionnaireResponse() { return state.questionnaireResponse!; },
    get pages() { return state.pages!; },
    get activePage() { return state.activePage; },
    get pagination() { return !!state.pages; },
    get subject() { return props.subject; },
    get encounter() { return props.encounter; },
    
    get items() {
        return getItemsForPage(state.questionnaire, state.pages, state.activePage);
    },
    get responseItems() {
        return getResponseItemsForPage(state.questionnaireResponse, state.pages, state.activePage);
    },

    onNextPage,
    onPrevPage,
    onAddGroup,
    onAddAnswer,
    onChangeAnswer,
    onChangeSignature,
  } as unknown as QuestionnaireFormState;
}

function getPages(questionnaire: Questionnaire): QuestionnaireFormPage[] | undefined {
  if (!questionnaire?.item) {
    return undefined;
  }
  const extension = getExtension(questionnaire?.item?.[0], QUESTIONNAIRE_ITEM_CONTROL_URL);
  if (extension?.valueCodeableConcept?.coding?.[0]?.code !== 'page') {
    return undefined;
  }

  return questionnaire.item.map((item, index) => {
    return {
      linkId: item.linkId,
      title: item.text ?? `Page ${index + 1}`,
      group: item as QuestionnaireItem & { type: 'group' },
    };
  });
}

function getItemsForPage(
  questionnaire: Questionnaire | undefined,
  pages: QuestionnaireFormPage[] | undefined,
  activePage = 0
): QuestionnaireItem[] {
  if (!questionnaire) return [];
  if (pages && questionnaire.item?.[activePage]) {
    return [questionnaire.item[activePage]];
  }
  return questionnaire.item ?? [];
}

function getResponseItemsForPage(
  questionnaireResponse: QuestionnaireResponse | undefined,
  pages: QuestionnaireFormPage[] | undefined,
  activePage = 0
): QuestionnaireResponseItem[] {
  if (!questionnaireResponse) return [];
  if (pages && questionnaireResponse.item?.[activePage]) {
    return [questionnaireResponse.item[activePage]];
  }
  return questionnaireResponse.item ?? [];
}
