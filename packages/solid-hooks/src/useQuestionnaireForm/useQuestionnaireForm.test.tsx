// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
} from '@medplum/fhirtypes';
import { MockClient } from '@medplum/mock';
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { MedplumProvider } from '../MedplumProvider/MedplumProvider';
import type { QuestionnaireFormLoadedState, QuestionnaireFormPaginationState } from './useQuestionnaireForm';
import { useQuestionnaireForm } from './useQuestionnaireForm';

describe('useQuestionnaireForm', () => {
  const medplum = new MockClient();
  const wrapper = ({ children }) => <MedplumProvider medplum={medplum}>{children}</MedplumProvider>;

  test('Pass by value', async () => {
    const questionnaire = {
      resourceType: 'Questionnaire',
      id: 'test',
      status: 'active',
      item: [
        {
          type: 'string',
          linkId: 'test-item',
          text: 'Test Item',
        },
      ],
    } as const;
    const onChange = jest.fn();
    const { container } = render(() => {
      const result = useQuestionnaireForm({ questionnaire, onChange });
      if (result.loading) return <div data-testid="loading">true</div>;
      const state = result as QuestionnaireFormLoadedState;
      return (
        <div>
          <div data-testid="loading">false</div>
          <div data-testid="questionnaire-id">{state.questionnaire.id}</div>
          <div data-testid="response-status">{state.questionnaireResponse.status}</div>
          <div data-testid="response-item-linkId">{state.questionnaireResponse.item?.[0]?.linkId}</div>
          <div data-testid="response-item-text">{state.questionnaireResponse.item?.[0]?.text}</div>
          <button
            data-testid="change-answer"
            onClick={() => state.onChangeAnswer([], questionnaire.item[0], [{ valueString: 'Test Answer' }])}
          >
            Change Answer
          </button>
        </div>
      );
    });

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('questionnaire-id')).toHaveTextContent('test');
    expect(screen.getByTestId('response-status')).toHaveTextContent('in-progress');
    expect(screen.getByTestId('response-item-linkId')).toHaveTextContent('test-item');
    expect(screen.getByTestId('response-item-text')).toHaveTextContent('Test Item');
    onChange.mockClear();

    fireEvent.click(screen.getByTestId('change-answer'));
    await waitFor(() => {
      // In Solid, reactivity might need waitFor to propagate
      // Assuming onChange is called synchronously, but wait for any re-render
    });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test('Start with existing response', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'test',
      status: 'active',
      item: [
        {
          type: 'string',
          linkId: 'test-item',
          text: 'Test Item',
        },
      ],
    };
    const defaultValue: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress',
      questionnaire: 'Questionnaire/test',
      item: [
        {
          linkId: 'test-item',
          text: 'Test Item',
          answer: [{ valueString: 'Existing Answer' }],
        },
      ],
    };
    const { container } = render(() => {
      const result = useQuestionnaireForm({ questionnaire, defaultValue });
      if (result.loading) return <div data-testid="loading">true</div>;
      const state = result as QuestionnaireFormLoadedState;
      return (
        <div>
          <div data-testid="loading">false</div>
          <div data-testid="questionnaire-id">{state.questionnaire.id}</div>
          <div data-testid="response-status">{state.questionnaireResponse.status}</div>
          <div data-testid="response-item-answer">{state.questionnaireResponse.item?.[0]?.answer?.[0]?.valueString}</div>
        </div>
      );
    });

    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('questionnaire-id')).toHaveTextContent('test');
    expect(screen.getByTestId('response-status')).toHaveTextContent('in-progress');
    expect(screen.getByTestId('response-item-answer')).toHaveTextContent('Existing Answer');
  });

  test('Pagination', async () => {
    const questionnaire = {
      resourceType: 'Questionnaire',
      id: 'pages-example',
      title: 'Pages Example',
      item: [
        {
          linkId: 'group1',
          text: 'Group 1',
          type: 'group',
          item: [
            {
              linkId: 'question1',
              text: 'Question 1',
              type: 'string',
            },
          ],
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/questionnaire-item-control',
                    code: 'page',
                  },
                ],
              },
            },
          ],
        },
        {
          linkId: 'group2',
          text: 'Group 2',
          type: 'group',
          item: [
            {
              linkId: 'question2',
              text: 'Question 2',
              type: 'reference',
            },
          ],
        },
      ],
    } as const;

    const { container } = render(() => {
      const result = useQuestionnaireForm({ questionnaire });
      if (result.loading) return <div data-testid="loading">true</div>;
      const state = result as QuestionnaireFormPaginationState;
      return (
        <div>
          <div data-testid="loading">false</div>
          <div data-testid="pagination">{state.pagination ? 'true' : 'false'}</div>
          <div data-testid="items-linkId">{state.items[0]?.linkId}</div>
          <button data-testid="next-page" onClick={state.onNextPage}>Next</button>
          <button data-testid="prev-page" onClick={state.onPrevPage}>Prev</button>
        </div>
      );
    });

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('pagination')).toHaveTextContent('true');
    expect(screen.getByTestId('items-linkId')).toHaveTextContent('group1');

    fireEvent.click(screen.getByTestId('next-page'));
    await waitFor(() => expect(screen.getByTestId('items-linkId')).toHaveTextContent('group2'));

    fireEvent.click(screen.getByTestId('prev-page'));
    await waitFor(() => expect(screen.getByTestId('items-linkId')).toHaveTextContent('group1'));
  });

  test('Repeatable group', async () => {
    const questionnaire = {
      resourceType: 'Questionnaire',
      id: 'test',
      status: 'active',
      item: [
        {
          type: 'group',
          linkId: 'test-group',
          text: 'Test Group',
          repeats: true,
          item: [
            {
              type: 'string',
              linkId: 'test-item',
              text: 'Test Item',
            },
          ],
        },
      ],
    };

    const { container } = render(() => {
      const result = useQuestionnaireForm({ questionnaire });
      if (result.loading) return <div data-testid="loading">true</div>;
      const state = result as QuestionnaireFormLoadedState;
      return (
        <div>
          <div data-testid="loading">false</div>
          <div data-testid="items-length">{state.items.length}</div>
          <div data-testid="response-items-length">{state.questionnaireResponse.item?.length}</div>
          <button
            data-testid="add-group"
            onClick={() => state.onAddGroup([], questionnaire.item[0] as QuestionnaireItem)}
          >
            Add Group
          </button>
        </div>
      );
    });

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('items-length')).toHaveTextContent('1');
    expect(screen.getByTestId('response-items-length')).toHaveTextContent('1');

    fireEvent.click(screen.getByTestId('add-group'));
    await waitFor(() => expect(screen.getByTestId('response-items-length')).toHaveTextContent('2'));
  });

  test('Repeatable groups should maintain separate answers for each group instance', async () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'test',
      status: 'active',
      item: [
        {
          linkId: 'group1',
          text: 'Group 1',
          type: 'group',
          repeats: true,
          item: [
            {
              linkId: 'question1',
              text: 'Question 1',
              type: 'string',
            },
          ],
        },
      ],
    };

    const { container } = render(() => {
      const result = useQuestionnaireForm({ questionnaire });
      if (result.loading) return <div data-testid="loading">true</div>;
      const state = result as QuestionnaireFormLoadedState;
      return (
        <div>
          <div data-testid="loading">false</div>
          <div data-testid="items-length">{state.items.length}</div>
          <div data-testid="response-items-length">{state.questionnaireResponse.item?.length}</div>
          <div data-testid="group1-answer">{state.questionnaireResponse.item?.[0]?.item?.[0]?.answer?.[0]?.valueString}</div>
          <div data-testid="group2-answer">{state.questionnaireResponse.item?.[1]?.item?.[0]?.answer?.[0]?.valueString}</div>
          <button
            data-testid="add-group"
            onClick={() => state.onAddGroup([], questionnaire.item?.[0] as QuestionnaireItem)}
          >
            Add Group
          </button>
          <button
            data-testid="change-group1"
            onClick={() => {
              const group1 = state.questionnaireResponse.item?.[0] as QuestionnaireResponseItem;
              const questionItem = questionnaire.item?.[0]?.item?.[0] as QuestionnaireItem;
              state.onChangeAnswer([group1], questionItem, [{ valueString: 'Answer 1' }]);
            }}
          >
            Change Group1
          </button>
          <button
            data-testid="change-group2"
            onClick={() => {
              const group2 = state.questionnaireResponse.item?.[1] as QuestionnaireResponseItem;
              const questionItem = questionnaire.item?.[0]?.item?.[0] as QuestionnaireItem;
              state.onChangeAnswer([group2], questionItem, [{ valueString: 'Answer 2' }]);
            }}
          >
            Change Group2
          </button>
        </div>
      );
    });

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('items-length')).toHaveTextContent('1');
    expect(screen.getByTestId('response-items-length')).toHaveTextContent('1');

    fireEvent.click(screen.getByTestId('add-group'));
    await waitFor(() => expect(screen.getByTestId('response-items-length')).toHaveTextContent('2'));

    fireEvent.click(screen.getByTestId('change-group1'));
    fireEvent.click(screen.getByTestId('change-group2'));
    await waitFor(() => {
      expect(screen.getByTestId('group1-answer')).toHaveTextContent('Answer 1');
      expect(screen.getByTestId('group2-answer')).toHaveTextContent('Answer 2');
    });
  });

  test('Repeatable answer', async () => {
    const questionnaire = {
      resourceType: 'Questionnaire',
      id: 'test',
      status: 'active',
      item: [
        {
          type: 'string',
          linkId: 'test-item',
          text: 'Test Item',
          repeats: true,
        },
      ],
    } as const;

    const { container } = render(() => {
      const result = useQuestionnaireForm({ questionnaire });
      if (result.loading) return <div data-testid="loading">true</div>;
      const state = result as QuestionnaireFormLoadedState;
      return (
        <div>
          <div data-testid="loading">false</div>
          <div data-testid="items-length">{state.items.length}</div>
          <div data-testid="response-items-length">{state.questionnaireResponse.item?.length}</div>
          <div data-testid="response-answer-length">{state.questionnaireResponse.item?.[0]?.answer?.length}</div>
          <button
            data-testid="change-answer"
            onClick={() => state.onChangeAnswer([], questionnaire.item[0], [{ valueString: 'Test Answer' }])}
          >
            Change Answer
          </button>
          <button
            data-testid="add-answer"
            onClick={() => state.onAddAnswer([], questionnaire.item[0] as QuestionnaireItem)}
          >
            Add Answer
          </button>
        </div>
      );
    });

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('items-length')).toHaveTextContent('1');
    expect(screen.getByTestId('response-items-length')).toHaveTextContent('1');
    expect(screen.getByTestId('response-answer-length')).toHaveTextContent('0');

    fireEvent.click(screen.getByTestId('change-answer'));
    await waitFor(() => expect(screen.getByTestId('response-answer-length')).toHaveTextContent('1'));

    fireEvent.click(screen.getByTestId('add-answer'));
    await waitFor(() => expect(screen.getByTestId('response-answer-length')).toHaveTextContent('2'));
  });

  test('Signature functionality', async () => {
    const questionnaire = {
      resourceType: 'Questionnaire',
      id: 'test',
      status: 'active',
      item: [
        {
          type: 'string',
          linkId: 'test-item',
          text: 'Test Item',
        },
      ],
    } as const;

    const { container } = render(() => {
      const result = useQuestionnaireForm({ questionnaire });
      if (result.loading) return <div data-testid="loading">true</div>;
      const state = result as QuestionnaireFormLoadedState;
      const signature = {
        type: [
          {
            system: 'urn:iso-astm:E1762-95:2013',
            code: '1.2.840.10065.1.12.1.1',
            display: "Author's Signature",
          },
        ],
        when: '2023-01-01T00:00:00Z',
        who: { reference: 'Practitioner/test' },
        data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      };
      return (
        <div>
          <div data-testid="loading">false</div>
          <div data-testid="extension-length">{state.questionnaireResponse.extension?.length ?? '0'}</div>
          <button data-testid="add-signature" onClick={() => state.onChangeSignature(signature)}>
            Add Signature
          </button>
          <button data-testid="remove-signature" onClick={() => state.onChangeSignature(undefined)}>
            Remove Signature
          </button>
        </div>
      );
    });

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('extension-length')).toHaveTextContent('0');

    fireEvent.click(screen.getByTestId('add-signature'));
    await waitFor(() => expect(screen.getByTestId('extension-length')).toHaveTextContent('1'));

    fireEvent.click(screen.getByTestId('remove-signature'));
    await waitFor(() => expect(screen.getByTestId('extension-length')).toHaveTextContent('0'));
  });
});