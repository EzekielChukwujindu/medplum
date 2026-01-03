// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { Progress, RadialProgress } from './Progress';

describe('Progress', () => {
  test('Renders progress bar', () => {
    render(() => <Progress value={50} testId="progress" />);
    const progress = screen.getByTestId('progress').querySelector('progress');
    expect(progress).toBeTruthy();
  });

  test('Sets correct value', () => {
    render(() => <Progress value={75} max={100} testId="progress" />);
    const progress = screen.getByTestId('progress').querySelector('progress') as HTMLProgressElement;
    expect(progress.value).toBe(75);
  });

  test('Shows label when enabled', () => {
    render(() => <Progress value={50} showLabel testId="progress" />);
    expect(screen.getByText('50%')).toBeTruthy();
  });

  test('Does not show label by default', () => {
    render(() => <Progress value={50} testId="progress" />);
    expect(screen.queryByText('50%')).toBeNull();
  });

  test('Applies variant class', () => {
    render(() => <Progress value={50} variant="success" testId="progress" />);
    const progress = screen.getByTestId('progress').querySelector('progress');
    expect(progress?.classList.contains('progress-success')).toBe(true);
  });
});

describe('RadialProgress', () => {
  test('Renders radial progress', () => {
    render(() => <RadialProgress value={70} testId="radial" />);
    expect(screen.getByTestId('radial')).toBeTruthy();
  });

  test('Shows percentage', () => {
    render(() => <RadialProgress value={70} testId="radial" />);
    expect(screen.getByText('70%')).toBeTruthy();
  });

  test('Has progressbar role', () => {
    render(() => <RadialProgress value={70} testId="radial" />);
    expect(screen.getByRole('progressbar')).toBeTruthy();
  });

  test('Applies size class', () => {
    render(() => <RadialProgress value={50} size="lg" testId="radial" />);
    const radial = screen.getByTestId('radial');
    expect(radial.classList.contains('w-24')).toBe(true);
  });
});
