// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/* global process */
/* global console */

import dotenv from 'dotenv';
import esbuild from 'esbuild';
import { writeFileSync } from 'fs';
import { solidPlugin } from 'esbuild-plugin-solid';

dotenv.config({ quiet: true });

const options = {
  entryPoints: ['./src/index.ts'],
  bundle: true,
  platform: 'browser',
  plugins: [solidPlugin()],
  loader: { '.ts': 'ts', '.tsx': 'tsx', '.css': 'css' },
  resolveExtensions: ['.js', '.ts', '.tsx'],
  target: 'es2021',
  tsconfig: 'tsconfig.json',
  minify: true,
  sourcemap: true,
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  external: [
    'solid-js',
    'solid-js/web',
    'solid-js/store',
    '@medplum/core',
    '@medplum/fhirtypes',
    '@medplum/solid-hooks',
    '@tanstack/solid-query',
    '@kobalte/core',
    '@ark-ui/solid',
    'lucide-solid',
  ],
};

esbuild
  .build({
    ...options,
    format: 'cjs',
    outfile: './dist/cjs/index.cjs',
  })
  .then(() => writeFileSync('./dist/cjs/package.json', '{"type": "commonjs"}'))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

esbuild
  .build({
    ...options,
    format: 'esm',
    outfile: './dist/esm/index.mjs',
  })
  .then(() => writeFileSync('./dist/esm/package.json', '{"type": "module"}'))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
