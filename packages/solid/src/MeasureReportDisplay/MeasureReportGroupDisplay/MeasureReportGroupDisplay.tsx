// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { formatCodeableConcept } from '@medplum/core';
import type { Measure, MeasureReportGroup } from '@medplum/fhirtypes';
import type { JSX } from 'solid-js';
import { Show } from 'solid-js';
import { QuantityDisplay } from '../../QuantityDisplay/QuantityDisplay';

interface MeasureReportGroupDisplayProps {
  readonly group: MeasureReportGroup;
}

interface MeasureProps {
  readonly measure: Measure;
}

export function MeasureReportGroupDisplay(props: MeasureReportGroupDisplayProps): JSX.Element {
  return (
    <div class="border border-base-300 rounded-md p-2 flex items-center justify-center">
      <div class="flex flex-row items-center gap-2">
        <Show when={props.group.measureScore} fallback={<MeasureReportPopulation group={props.group} />}>
          <MeasureScore group={props.group} />
        </Show>
      </div>
    </div>
  );
}

export function MeasureTitle(props: MeasureProps): JSX.Element {
  return (
    <>
      <div class="text-base font-medium mb-2">{props.measure.title}</div>
      <div class="text-xs text-base-content/60 mb-2">{props.measure.subtitle}</div>
    </>
  );
}

function MeasureReportPopulation(props: MeasureReportGroupDisplayProps): JSX.Element {
  const populations = props.group.population;
  const numerator = populations?.find((p) => formatCodeableConcept(p.code) === 'numerator');
  const denominator = populations?.find((p) => formatCodeableConcept(p.code) === 'denominator');

  const numeratorCount = numerator?.count;
  const denominatorCount = denominator?.count;

  if (denominatorCount === 0) {
    return (
      <div class="text-center">
        <h3 class="text-lg font-bold">Not Applicable</h3>
        <p>{`Denominator: ${denominatorCount}`}</p>
      </div>
    );
  }

  if (numeratorCount === undefined || denominatorCount === undefined) {
    return (
      <div class="text-center">
        <h3 class="text-lg font-bold">Insufficient Data</h3>
        <p>{`Numerator: ${numeratorCount}`}</p>
        <p>{`Denominator: ${denominatorCount}`}</p>
      </div>
    );
  }

  const value = (numeratorCount / denominatorCount) * 100;
  return (
    <div
      class={`radial-progress ${groupColor(value)}`}
      style={{
        '--value': value,
        '--size': '120px',
        '--thickness': '12px',
      } as any}
      role="progressbar"
    >
      <div class="flex justify-center text-lg font-bold text-base-content">
        {numeratorCount} / {denominatorCount}
      </div>
    </div>
  );
}

function MeasureScore(props: MeasureReportGroupDisplayProps): JSX.Element {
  const unit = props.group.measureScore?.unit ?? props.group.measureScore?.code;
  const score = () => props.group.measureScore?.value ?? 0;
  const value = () => groupValue(props.group);

  return (
    <Show
      when={unit === '%'}
      fallback={
        <div class="h-[120px] flex items-center">
          <h3 class="text-lg font-bold">
            <QuantityDisplay value={props.group.measureScore} />
          </h3>
        </div>
      }
    >
      <div
        class={`radial-progress ${groupColor(score())}`}
        style={{
          '--value': value(),
          '--size': '120px',
          '--thickness': '12px',
        } as any}
        role="progressbar"
      >
        <div class="flex justify-center text-lg font-bold text-base-content">
          <QuantityDisplay value={props.group.measureScore} />
        </div>
      </div>
    </Show>
  );
}

function groupValue(group: MeasureReportGroup): number {
  const score = group.measureScore?.value;
  const unit = group.measureScore?.unit;
  if (!score) {
    return 0;
  }
  if (score <= 1 && unit === '%') {
    return score * 100;
  }
  return score;
}

function groupColor(score: number): string {
  if (score <= 33) {
    return 'text-error';
  }
  if (score <= 67) {
    return 'text-warning';
  }
  return 'text-success';
}
