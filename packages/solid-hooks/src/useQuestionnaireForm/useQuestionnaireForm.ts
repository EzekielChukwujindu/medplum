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
import { createStore } from 'solid-js/store';
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
  const questionnaire = useResource(() => props.questionnaire);
  const defaultResponse = useResource(() => props.defaultValue);

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


  function getResponseItemByContext(
    context: QuestionnaireResponseItem[],
    item?: QuestionnaireItem
  ): QuestionnaireResponseItem | undefined {
    let currentItem: QuestionnaireResponse | QuestionnaireResponseItem | undefined = state.questionnaireResponse;
    // Navigate down the context
    for (const contextElement of context) {
      currentItem = currentItem?.item?.find((i) =>
        contextElement.id ? i.id === contextElement.id : i.linkId === contextElement.linkId
      );
    }
    // Find the specific item if requested
    if (item && currentItem) {
      currentItem = (currentItem as QuestionnaireResponseItem | QuestionnaireResponse).item?.find((i) => i.linkId === item.linkId);
    }
    return currentItem as QuestionnaireResponseItem | undefined;
  }

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

  const onAddGroup = (context: QuestionnaireResponseItem[], item: QuestionnaireItem) => {
    // context elements are likely proxies if they come from the UI reading the store.
    // We need to match them.
    // Ideally we traverse the store.
    // For simplicity, we can rely on reference or ID matching if structure matches.
    
    // We will use the implementation that traverses the store state
    // To modify the store, we should use setState path syntax or produce, 
    // BUT since 'state' is a mutable proxy, we can just mutate it if we find the node in the proxy graph.
    // However, `getResponseItemByContext` walks the proxy.
    const responseItem = getResponseItemByContext(context);
    if (responseItem) {
        if (!responseItem.item) {
             // responseItem is a proxy, so this assignment triggers reactivity
             responseItem.item = []; 
        }
        responseItem.item.push(buildInitialResponseItem(item));
        emitChange();
    }
  };

  const onAddAnswer = (context: QuestionnaireResponseItem[], item: QuestionnaireItem) => {
    const currentItem = getResponseItemByContext(context, item);
    if (currentItem) {
      if (!currentItem.answer) currentItem.answer = [];
      currentItem.answer.push({});
      emitChange();
    }
  };

  const onChangeAnswer = (
    context: QuestionnaireResponseItem[],
    item: QuestionnaireItem,
    answer: QuestionnaireResponseItemAnswer[]
  ) => {
    const currentItem = getResponseItemByContext(context, item);
    if (currentItem) {
      currentItem.answer = answer;
      emitChange();
    }
  };

  const onChangeSignature = (signature: Signature | undefined) => {
     // We can modify state.questionnaireResponse directly as it is a proxy
     const resp = state.questionnaireResponse;
     if (!resp) return;

     if (signature) {
        const ext = (resp.extension || []).filter((e) => e.url !== QUESTIONNAIRE_SIGNATURE_RESPONSE_URL);
        ext.push({ url: QUESTIONNAIRE_SIGNATURE_RESPONSE_URL, valueSignature: signature });
        resp.extension = ext;
     } else {
        resp.extension = (resp.extension || []).filter((e) => e.url !== QUESTIONNAIRE_SIGNATURE_RESPONSE_URL);
     }
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
