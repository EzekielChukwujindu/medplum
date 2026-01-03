


// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
interface Oklch {
  l: number; // 0-1
  c: number;
  h: number;
}

type Palette = Map<string, Oklch>; // shade => Oklch

const tailwindColors: { family: string; shade: string; color: { l: number; c: number; h: number } }[] = [
  // Black and White
  { family: 'black', shade: '', color: { l: 0, c: 0, h: 0 } },
  { family: 'white', shade: '', color: { l: 1, c: 0, h: 0 } },
  // Red
  { family: 'red', shade: '50', color: { l: 0.971, c: 0.013, h: 17.38 } },
  { family: 'red', shade: '100', color: { l: 0.936, c: 0.032, h: 17.717 } },
  { family: 'red', shade: '200', color: { l: 0.885, c: 0.062, h: 18.334 } },
  { family: 'red', shade: '300', color: { l: 0.808, c: 0.114, h: 19.571 } },
  { family: 'red', shade: '400', color: { l: 0.704, c: 0.191, h: 22.216 } },
  { family: 'red', shade: '500', color: { l: 0.637, c: 0.237, h: 25.331 } },
  { family: 'red', shade: '600', color: { l: 0.577, c: 0.245, h: 27.325 } },
  { family: 'red', shade: '700', color: { l: 0.505, c: 0.213, h: 27.518 } },
  { family: 'red', shade: '800', color: { l: 0.444, c: 0.177, h: 26.899 } },
  { family: 'red', shade: '900', color: { l: 0.396, c: 0.141, h: 25.723 } },
  { family: 'red', shade: '950', color: { l: 0.258, c: 0.092, h: 26.042 } },
  // Orange
  { family: 'orange', shade: '50', color: { l: 0.98, c: 0.016, h: 73.684 } },
  { family: 'orange', shade: '100', color: { l: 0.954, c: 0.038, h: 75.164 } },
  { family: 'orange', shade: '200', color: { l: 0.901, c: 0.076, h: 70.697 } },
  { family: 'orange', shade: '300', color: { l: 0.837, c: 0.128, h: 66.29 } },
  { family: 'orange', shade: '400', color: { l: 0.75, c: 0.183, h: 55.934 } },
  { family: 'orange', shade: '500', color: { l: 0.705, c: 0.213, h: 47.604 } },
  { family: 'orange', shade: '600', color: { l: 0.646, c: 0.222, h: 41.116 } },
  { family: 'orange', shade: '700', color: { l: 0.553, c: 0.195, h: 38.402 } },
  { family: 'orange', shade: '800', color: { l: 0.47, c: 0.157, h: 37.304 } },
  { family: 'orange', shade: '900', color: { l: 0.408, c: 0.123, h: 38.172 } },
  { family: 'orange', shade: '950', color: { l: 0.266, c: 0.079, h: 36.259 } },
  // Amber
  { family: 'amber', shade: '50', color: { l: 0.987, c: 0.022, h: 95.277 } },
  { family: 'amber', shade: '100', color: { l: 0.962, c: 0.059, h: 95.617 } },
  { family: 'amber', shade: '200', color: { l: 0.924, c: 0.12, h: 95.746 } },
  { family: 'amber', shade: '300', color: { l: 0.879, c: 0.169, h: 91.605 } },
  { family: 'amber', shade: '400', color: { l: 0.828, c: 0.189, h: 84.429 } },
  { family: 'amber', shade: '500', color: { l: 0.769, c: 0.188, h: 70.08 } },
  { family: 'amber', shade: '600', color: { l: 0.666, c: 0.179, h: 58.318 } },
  { family: 'amber', shade: '700', color: { l: 0.555, c: 0.163, h: 48.998 } },
  { family: 'amber', shade: '800', color: { l: 0.473, c: 0.137, h: 46.201 } },
  { family: 'amber', shade: '900', color: { l: 0.414, c: 0.112, h: 45.904 } },
  { family: 'amber', shade: '950', color: { l: 0.279, c: 0.077, h: 45.635 } },
  // Yellow
  { family: 'yellow', shade: '50', color: { l: 0.987, c: 0.026, h: 102.212 } },
  { family: 'yellow', shade: '100', color: { l: 0.973, c: 0.071, h: 103.193 } },
  { family: 'yellow', shade: '200', color: { l: 0.945, c: 0.129, h: 101.54 } },
  { family: 'yellow', shade: '300', color: { l: 0.905, c: 0.182, h: 98.111 } },
  { family: 'yellow', shade: '400', color: { l: 0.852, c: 0.199, h: 91.936 } },
  { family: 'yellow', shade: '500', color: { l: 0.795, c: 0.184, h: 86.047 } },
  { family: 'yellow', shade: '600', color: { l: 0.681, c: 0.162, h: 75.834 } },
  { family: 'yellow', shade: '700', color: { l: 0.554, c: 0.135, h: 66.442 } },
  { family: 'yellow', shade: '800', color: { l: 0.476, c: 0.114, h: 61.907 } },
  { family: 'yellow', shade: '900', color: { l: 0.421, c: 0.095, h: 57.708 } },
  { family: 'yellow', shade: '950', color: { l: 0.286, c: 0.066, h: 53.813 } },
  // Lime
  { family: 'lime', shade: '50', color: { l: 0.986, c: 0.031, h: 120.757 } },
  { family: 'lime', shade: '100', color: { l: 0.967, c: 0.067, h: 122.328 } },
  { family: 'lime', shade: '200', color: { l: 0.938, c: 0.127, h: 124.321 } },
  { family: 'lime', shade: '300', color: { l: 0.897, c: 0.196, h: 126.665 } },
  { family: 'lime', shade: '400', color: { l: 0.841, c: 0.238, h: 128.85 } },
  { family: 'lime', shade: '500', color: { l: 0.768, c: 0.233, h: 130.85 } },
  { family: 'lime', shade: '600', color: { l: 0.648, c: 0.2, h: 131.684 } },
  { family: 'lime', shade: '700', color: { l: 0.532, c: 0.157, h: 131.589 } },
  { family: 'lime', shade: '800', color: { l: 0.453, c: 0.124, h: 130.933 } },
  { family: 'lime', shade: '900', color: { l: 0.405, c: 0.101, h: 131.063 } },
  { family: 'lime', shade: '950', color: { l: 0.274, c: 0.072, h: 132.109 } },
  // Green
  { family: 'green', shade: '50', color: { l: 0.982, c: 0.018, h: 155.826 } },
  { family: 'green', shade: '100', color: { l: 0.962, c: 0.044, h: 156.743 } },
  { family: 'green', shade: '200', color: { l: 0.925, c: 0.084, h: 155.995 } },
  { family: 'green', shade: '300', color: { l: 0.871, c: 0.15, h: 154.449 } },
  { family: 'green', shade: '400', color: { l: 0.792, c: 0.209, h: 151.711 } },
  { family: 'green', shade: '500', color: { l: 0.723, c: 0.219, h: 149.579 } },
  { family: 'green', shade: '600', color: { l: 0.627, c: 0.194, h: 149.214 } },
  { family: 'green', shade: '700', color: { l: 0.527, c: 0.154, h: 150.069 } },
  { family: 'green', shade: '800', color: { l: 0.448, c: 0.119, h: 151.328 } },
  { family: 'green', shade: '900', color: { l: 0.393, c: 0.095, h: 152.535 } },
  { family: 'green', shade: '950', color: { l: 0.266, c: 0.065, h: 152.934 } },
  // Emerald
  { family: 'emerald', shade: '50', color: { l: 0.979, c: 0.021, h: 166.113 } },
  { family: 'emerald', shade: '100', color: { l: 0.95, c: 0.052, h: 163.051 } },
  { family: 'emerald', shade: '200', color: { l: 0.905, c: 0.093, h: 164.15 } },
  { family: 'emerald', shade: '300', color: { l: 0.845, c: 0.143, h: 164.978 } },
  { family: 'emerald', shade: '400', color: { l: 0.765, c: 0.177, h: 163.223 } },
  { family: 'emerald', shade: '500', color: { l: 0.696, c: 0.17, h: 162.48 } },
  { family: 'emerald', shade: '600', color: { l: 0.596, c: 0.145, h: 163.225 } },
  { family: 'emerald', shade: '700', color: { l: 0.508, c: 0.118, h: 165.612 } },
  { family: 'emerald', shade: '800', color: { l: 0.432, c: 0.095, h: 166.913 } },
  { family: 'emerald', shade: '900', color: { l: 0.378, c: 0.077, h: 168.94 } },
  { family: 'emerald', shade: '950', color: { l: 0.262, c: 0.051, h: 172.552 } },
  // Teal
  { family: 'teal', shade: '50', color: { l: 0.984, c: 0.014, h: 180.72 } },
  { family: 'teal', shade: '100', color: { l: 0.953, c: 0.051, h: 180.801 } },
  { family: 'teal', shade: '200', color: { l: 0.91, c: 0.096, h: 180.426 } },
  { family: 'teal', shade: '300', color: { l: 0.855, c: 0.138, h: 181.071 } },
  { family: 'teal', shade: '400', color: { l: 0.777, c: 0.152, h: 181.912 } },
  { family: 'teal', shade: '500', color: { l: 0.704, c: 0.14, h: 182.503 } },
  { family: 'teal', shade: '600', color: { l: 0.6, c: 0.118, h: 184.704 } },
  { family: 'teal', shade: '700', color: { l: 0.511, c: 0.096, h: 186.391 } },
  { family: 'teal', shade: '800', color: { l: 0.437, c: 0.078, h: 188.216 } },
  { family: 'teal', shade: '900', color: { l: 0.386, c: 0.063, h: 188.416 } },
  { family: 'teal', shade: '950', color: { l: 0.277, c: 0.046, h: 192.524 } },
  // Cyan
  { family: 'cyan', shade: '50', color: { l: 0.984, c: 0.019, h: 200.873 } },
  { family: 'cyan', shade: '100', color: { l: 0.956, c: 0.045, h: 203.388 } },
  { family: 'cyan', shade: '200', color: { l: 0.917, c: 0.08, h: 205.041 } },
  { family: 'cyan', shade: '300', color: { l: 0.865, c: 0.127, h: 207.078 } },
  { family: 'cyan', shade: '400', color: { l: 0.789, c: 0.154, h: 211.53 } },
  { family: 'cyan', shade: '500', color: { l: 0.715, c: 0.143, h: 215.221 } },
  { family: 'cyan', shade: '600', color: { l: 0.609, c: 0.126, h: 221.723 } },
  { family: 'cyan', shade: '700', color: { l: 0.52, c: 0.105, h: 223.128 } },
  { family: 'cyan', shade: '800', color: { l: 0.45, c: 0.085, h: 224.283 } },
  { family: 'cyan', shade: '900', color: { l: 0.398, c: 0.07, h: 227.392 } },
  { family: 'cyan', shade: '950', color: { l: 0.302, c: 0.056, h: 229.695 } },
  // Sky
  { family: 'sky', shade: '50', color: { l: 0.977, c: 0.013, h: 236.62 } },
  { family: 'sky', shade: '100', color: { l: 0.951, c: 0.026, h: 236.824 } },
  { family: 'sky', shade: '200', color: { l: 0.901, c: 0.058, h: 230.902 } },
  { family: 'sky', shade: '300', color: { l: 0.828, c: 0.111, h: 230.318 } },
  { family: 'sky', shade: '400', color: { l: 0.746, c: 0.16, h: 232.661 } },
  { family: 'sky', shade: '500', color: { l: 0.685, c: 0.169, h: 237.323 } },
  { family: 'sky', shade: '600', color: { l: 0.588, c: 0.158, h: 241.966 } },
  { family: 'sky', shade: '700', color: { l: 0.5, c: 0.134, h: 242.749 } },
  { family: 'sky', shade: '800', color: { l: 0.443, c: 0.11, h: 240.79 } },
  { family: 'sky', shade: '900', color: { l: 0.391, c: 0.09, h: 240.876 } },
  { family: 'sky', shade: '950', color: { l: 0.293, c: 0.066, h: 243.157 } },
  // Blue
  { family: 'blue', shade: '50', color: { l: 0.97, c: 0.014, h: 254.604 } },
  { family: 'blue', shade: '100', color: { l: 0.932, c: 0.032, h: 255.585 } },
  { family: 'blue', shade: '200', color: { l: 0.882, c: 0.059, h: 254.128 } },
  { family: 'blue', shade: '300', color: { l: 0.809, c: 0.105, h: 251.813 } },
  { family: 'blue', shade: '400', color: { l: 0.707, c: 0.165, h: 254.624 } },
  { family: 'blue', shade: '500', color: { l: 0.623, c: 0.214, h: 259.815 } },
  { family: 'blue', shade: '600', color: { l: 0.546, c: 0.245, h: 262.881 } },
  { family: 'blue', shade: '700', color: { l: 0.488, c: 0.243, h: 264.376 } },
  { family: 'blue', shade: '800', color: { l: 0.424, c: 0.199, h: 265.638 } },
  { family: 'blue', shade: '900', color: { l: 0.379, c: 0.146, h: 265.522 } },
  { family: 'blue', shade: '950', color: { l: 0.282, c: 0.091, h: 267.935 } },
  // Indigo
  { family: 'indigo', shade: '50', color: { l: 0.962, c: 0.018, h: 272.314 } },
  { family: 'indigo', shade: '100', color: { l: 0.93, c: 0.034, h: 272.788 } },
  { family: 'indigo', shade: '200', color: { l: 0.87, c: 0.065, h: 274.039 } },
  { family: 'indigo', shade: '300', color: { l: 0.785, c: 0.115, h: 274.713 } },
  { family: 'indigo', shade: '400', color: { l: 0.673, c: 0.182, h: 276.935 } },
  { family: 'indigo', shade: '500', color: { l: 0.585, c: 0.233, h: 277.117 } },
  { family: 'indigo', shade: '600', color: { l: 0.511, c: 0.262, h: 276.966 } },
  { family: 'indigo', shade: '700', color: { l: 0.457, c: 0.24, h: 277.023 } },
  { family: 'indigo', shade: '800', color: { l: 0.398, c: 0.195, h: 277.366 } },
  { family: 'indigo', shade: '900', color: { l: 0.359, c: 0.144, h: 278.697 } },
  { family: 'indigo', shade: '950', color: { l: 0.257, c: 0.09, h: 281.288 } },
  // Violet
  { family: 'violet', shade: '50', color: { l: 0.969, c: 0.016, h: 293.756 } },
  { family: 'violet', shade: '100', color: { l: 0.943, c: 0.029, h: 294.588 } },
  { family: 'violet', shade: '200', color: { l: 0.894, c: 0.057, h: 293.283 } },
  { family: 'violet', shade: '300', color: { l: 0.811, c: 0.111, h: 293.571 } },
  { family: 'violet', shade: '400', color: { l: 0.702, c: 0.183, h: 293.541 } },
  { family: 'violet', shade: '500', color: { l: 0.606, c: 0.25, h: 292.717 } },
  { family: 'violet', shade: '600', color: { l: 0.541, c: 0.281, h: 293.009 } },
  { family: 'violet', shade: '700', color: { l: 0.491, c: 0.27, h: 292.581 } },
  { family: 'violet', shade: '800', color: { l: 0.432, c: 0.232, h: 292.759 } },
  { family: 'violet', shade: '900', color: { l: 0.38, c: 0.189, h: 293.745 } },
  { family: 'violet', shade: '950', color: { l: 0.283, c: 0.141, h: 291.089 } },
  // Purple
  { family: 'purple', shade: '50', color: { l: 0.977, c: 0.014, h: 308.299 } },
  { family: 'purple', shade: '100', color: { l: 0.946, c: 0.033, h: 307.174 } },
  { family: 'purple', shade: '200', color: { l: 0.902, c: 0.063, h: 306.703 } },
  { family: 'purple', shade: '300', color: { l: 0.827, c: 0.119, h: 306.383 } },
  { family: 'purple', shade: '400', color: { l: 0.714, c: 0.203, h: 305.504 } },
  { family: 'purple', shade: '500', color: { l: 0.627, c: 0.265, h: 303.9 } },
  { family: 'purple', shade: '600', color: { l: 0.558, c: 0.288, h: 302.321 } },
  { family: 'purple', shade: '700', color: { l: 0.496, c: 0.265, h: 301.924 } },
  { family: 'purple', shade: '800', color: { l: 0.438, c: 0.218, h: 303.724 } },
  { family: 'purple', shade: '900', color: { l: 0.381, c: 0.176, h: 304.987 } },
  { family: 'purple', shade: '950', color: { l: 0.291, c: 0.149, h: 302.717 } },
  // Fuchsia
  { family: 'fuchsia', shade: '50', color: { l: 0.977, c: 0.017, h: 320.058 } },
  { family: 'fuchsia', shade: '100', color: { l: 0.952, c: 0.037, h: 318.852 } },
  { family: 'fuchsia', shade: '200', color: { l: 0.903, c: 0.076, h: 319.62 } },
  { family: 'fuchsia', shade: '300', color: { l: 0.833, c: 0.145, h: 321.434 } },
  { family: 'fuchsia', shade: '400', color: { l: 0.74, c: 0.238, h: 322.16 } },
  { family: 'fuchsia', shade: '500', color: { l: 0.667, c: 0.295, h: 322.15 } },
  { family: 'fuchsia', shade: '600', color: { l: 0.591, c: 0.293, h: 322.896 } },
  { family: 'fuchsia', shade: '700', color: { l: 0.518, c: 0.253, h: 323.949 } },
  { family: 'fuchsia', shade: '800', color: { l: 0.452, c: 0.211, h: 324.591 } },
  { family: 'fuchsia', shade: '900', color: { l: 0.401, c: 0.17, h: 325.612 } },
  { family: 'fuchsia', shade: '950', color: { l: 0.293, c: 0.136, h: 325.661 } },
  // Pink
  { family: 'pink', shade: '50', color: { l: 0.971, c: 0.014, h: 343.198 } },
  { family: 'pink', shade: '100', color: { l: 0.948, c: 0.028, h: 342.258 } },
  { family: 'pink', shade: '200', color: { l: 0.899, c: 0.061, h: 343.231 } },
  { family: 'pink', shade: '300', color: { l: 0.823, c: 0.12, h: 346.018 } },
  { family: 'pink', shade: '400', color: { l: 0.718, c: 0.202, h: 349.761 } },
  { family: 'pink', shade: '500', color: { l: 0.656, c: 0.241, h: 354.308 } },
  { family: 'pink', shade: '600', color: { l: 0.592, c: 0.249, h: 0.584 } },
  { family: 'pink', shade: '700', color: { l: 0.525, c: 0.223, h: 3.958 } },
  { family: 'pink', shade: '800', color: { l: 0.459, c: 0.187, h: 3.815 } },
  { family: 'pink', shade: '900', color: { l: 0.408, c: 0.153, h: 2.432 } },
  { family: 'pink', shade: '950', color: { l: 0.284, c: 0.109, h: 3.907 } },
  // Rose
  { family: 'rose', shade: '50', color: { l: 0.969, c: 0.015, h: 12.422 } },
  { family: 'rose', shade: '100', color: { l: 0.941, c: 0.03, h: 12.58 } },
  { family: 'rose', shade: '200', color: { l: 0.892, c: 0.058, h: 10.001 } },
  { family: 'rose', shade: '300', color: { l: 0.81, c: 0.117, h: 11.638 } },
  { family: 'rose', shade: '400', color: { l: 0.712, c: 0.194, h: 13.428 } },
  { family: 'rose', shade: '500', color: { l: 0.645, c: 0.246, h: 16.439 } },
  { family: 'rose', shade: '600', color: { l: 0.586, c: 0.253, h: 17.585 } },
  { family: 'rose', shade: '700', color: { l: 0.514, c: 0.222, h: 16.935 } },
  { family: 'rose', shade: '800', color: { l: 0.455, c: 0.188, h: 13.697 } },
  { family: 'rose', shade: '900', color: { l: 0.41, c: 0.159, h: 10.272 } },
  { family: 'rose', shade: '950', color: { l: 0.271, c: 0.105, h: 12.094 } },
  // Slate
  { family: 'slate', shade: '50', color: { l: 0.984, c: 0.003, h: 247.858 } },
  { family: 'slate', shade: '100', color: { l: 0.968, c: 0.007, h: 247.896 } },
  { family: 'slate', shade: '200', color: { l: 0.929, c: 0.013, h: 255.508 } },
  { family: 'slate', shade: '300', color: { l: 0.869, c: 0.022, h: 252.894 } },
  { family: 'slate', shade: '400', color: { l: 0.704, c: 0.04, h: 256.788 } },
  { family: 'slate', shade: '500', color: { l: 0.554, c: 0.046, h: 257.417 } },
  { family: 'slate', shade: '600', color: { l: 0.446, c: 0.043, h: 257.281 } },
  { family: 'slate', shade: '700', color: { l: 0.372, c: 0.044, h: 257.287 } },
  { family: 'slate', shade: '800', color: { l: 0.279, c: 0.041, h: 260.031 } },
  { family: 'slate', shade: '900', color: { l: 0.208, c: 0.042, h: 265.755 } },
  { family: 'slate', shade: '950', color: { l: 0.129, c: 0.042, h: 264.695 } },
  // Gray
  { family: 'gray', shade: '50', color: { l: 0.985, c: 0.002, h: 247.839 } },
  { family: 'gray', shade: '100', color: { l: 0.967, c: 0.003, h: 264.542 } },
  { family: 'gray', shade: '200', color: { l: 0.928, c: 0.006, h: 264.531 } },
  { family: 'gray', shade: '300', color: { l: 0.872, c: 0.01, h: 258.338 } },
  { family: 'gray', shade: '400', color: { l: 0.707, c: 0.022, h: 261.325 } },
  { family: 'gray', shade: '500', color: { l: 0.551, c: 0.027, h: 264.364 } },
  { family: 'gray', shade: '600', color: { l: 0.446, c: 0.03, h: 256.802 } },
  { family: 'gray', shade: '700', color: { l: 0.373, c: 0.034, h: 259.733 } },
  { family: 'gray', shade: '800', color: { l: 0.278, c: 0.033, h: 256.848 } },
  { family: 'gray', shade: '900', color: { l: 0.21, c: 0.034, h: 264.665 } },
  { family: 'gray', shade: '950', color: { l: 0.13, c: 0.028, h: 261.692 } },
  // Zinc
  { family: 'zinc', shade: '50', color: { l: 0.985, c: 0, h: 0 } },
  { family: 'zinc', shade: '100', color: { l: 0.967, c: 0.001, h: 286.375 } },
  { family: 'zinc', shade: '200', color: { l: 0.92, c: 0.004, h: 286.32 } },
  { family: 'zinc', shade: '300', color: { l: 0.871, c: 0.006, h: 286.286 } },
  { family: 'zinc', shade: '400', color: { l: 0.705, c: 0.015, h: 286.067 } },
  { family: 'zinc', shade: '500', color: { l: 0.552, c: 0.016, h: 285.938 } },
  { family: 'zinc', shade: '600', color: { l: 0.442, c: 0.017, h: 285.786 } },
  { family: 'zinc', shade: '700', color: { l: 0.37, c: 0.013, h: 285.805 } },
  { family: 'zinc', shade: '800', color: { l: 0.274, c: 0.006, h: 286.033 } },
  { family: 'zinc', shade: '900', color: { l: 0.21, c: 0.006, h: 285.885 } },
  { family: 'zinc', shade: '950', color: { l: 0.141, c: 0.005, h: 285.823 } },
  // Neutral
  { family: 'neutral', shade: '50', color: { l: 0.985, c: 0, h: 0 } },
  { family: 'neutral', shade: '100', color: { l: 0.97, c: 0, h: 0 } },
  { family: 'neutral', shade: '200', color: { l: 0.922, c: 0, h: 0 } },
  { family: 'neutral', shade: '300', color: { l: 0.87, c: 0, h: 0 } },
  { family: 'neutral', shade: '400', color: { l: 0.708, c: 0, h: 0 } },
  { family: 'neutral', shade: '500', color: { l: 0.556, c: 0, h: 0 } },
  { family: 'neutral', shade: '600', color: { l: 0.439, c: 0, h: 0 } },
  { family: 'neutral', shade: '700', color: { l: 0.371, c: 0, h: 0 } },
  { family: 'neutral', shade: '800', color: { l: 0.269, c: 0, h: 0 } },
  { family: 'neutral', shade: '900', color: { l: 0.205, c: 0, h: 0 } },
  { family: 'neutral', shade: '950', color: { l: 0.145, c: 0, h: 0 } },
  // Stone
  { family: 'stone', shade: '50', color: { l: 0.985, c: 0.001, h: 106.423 } },
  { family: 'stone', shade: '100', color: { l: 0.97, c: 0.001, h: 106.424 } },
  { family: 'stone', shade: '200', color: { l: 0.923, c: 0.003, h: 48.717 } },
  { family: 'stone', shade: '300', color: { l: 0.869, c: 0.005, h: 56.366 } },
  { family: 'stone', shade: '400', color: { l: 0.709, c: 0.01, h: 56.259 } },
  { family: 'stone', shade: '500', color: { l: 0.553, c: 0.013, h: 58.071 } },
  { family: 'stone', shade: '600', color: { l: 0.444, c: 0.011, h: 73.639 } },
  { family: 'stone', shade: '700', color: { l: 0.374, c: 0.01, h: 67.558 } },
  { family: 'stone', shade: '800', color: { l: 0.268, c: 0.007, h: 34.298 } },
  { family: 'stone', shade: '900', color: { l: 0.216, c: 0.006, h: 56.043 } },
  { family: 'stone', shade: '950', color: { l: 0.147, c: 0.004, h: 49.25 } },
];

// Build familyPalettes
const familyPalettes = new Map<string, Palette>();
for (const tc of tailwindColors) {
  if (tc.shade) { // Skip white/black if no shade
    if (!familyPalettes.has(tc.family)) {
      familyPalettes.set(tc.family, new Map());
    }
    familyPalettes.get(tc.family)!.set(tc.shade, tc.color);
  }
}

const coloredFamilies = ['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'];

// Pre-sort colored families by -500 hue
const sortedColored = [...coloredFamilies].sort((a, b) => {
  const ha = familyPalettes.get(a)?.get('500')?.h ?? 0;
  const hb = familyPalettes.get(b)?.get('500')?.h ?? 0;
  return ha - hb;
});

function normalizeHue(h: number): number {
  return ((h % 360) + 360) % 360;
}

// Generate palette for target hue by interpolating between nearest families
function getPaletteForHue(targetHue: number): Palette {
  targetHue = normalizeHue(targetHue);

  // Check for exact family match (tolerance for floating point)
  for (const family of coloredFamilies) {
    const repH = familyPalettes.get(family)?.get('500')?.h ?? 0;
    if (Math.abs(repH - targetHue) < 1e-3) {
      return new Map(familyPalettes.get(family)!);
    }
  }

  // Binary search for bracket
  const n = sortedColored.length;
  let low = 0, high = n - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midH = familyPalettes.get(sortedColored[mid])?.get('500')?.h ?? 0;
    if (midH <= targetHue) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  const i = high;

  let familyA: string, familyB: string, hA: number, hB: number, adjustedTarget = targetHue;
  if (i < 0 || i === n - 1) {
    // Wrap around
    familyA = sortedColored[n - 1];
    familyB = sortedColored[0];
    hA = familyPalettes.get(familyA)?.get('500')?.h ?? 0;
    hB = (familyPalettes.get(familyB)?.get('500')?.h ?? 0) + 360;
    if (targetHue < hA) { // Adjust if target is before first
      adjustedTarget += 360;
    }
  } else {
    familyA = sortedColored[i];
    familyB = sortedColored[i + 1];
    hA = familyPalettes.get(familyA)?.get('500')?.h ?? 0;
    hB = familyPalettes.get(familyB)?.get('500')?.h ?? 0;
  }

  const ratio = (adjustedTarget - hA) / (hB - hA);

  const paletteA = familyPalettes.get(familyA)!;
  const paletteB = familyPalettes.get(familyB)!;
  const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
  const result: Palette = new Map();

  for (const shade of shades) {
    const a = paletteA.get(shade)!;
    const b = paletteB.get(shade)!;
    const l = a.l + ratio * (b.l - a.l);
    const c = a.c + ratio * (b.c - a.c);
    let h = a.h + ratio * (b.h - a.h);
    h = normalizeHue(h);
    result.set(shade, { l, c, h });
  }

  return result;
}

// Find closest colored family to target hue (min angular distance)
function findClosestFamily(targetHue: number): string {
  targetHue = normalizeHue(targetHue);
  let closest = '';
  let minDist = Infinity;
  for (const family of coloredFamilies) {
    const repH = familyPalettes.get(family)?.get('500')?.h ?? 0;
    let dist = Math.abs(targetHue - repH);
    dist = Math.min(dist, 360 - dist);
    if (dist < minDist) {
      minDist = dist;
      closest = family;
    }
  }
  return closest;
}

interface SemanticPalettes {
  primary: Palette;
  secondary: Palette;
  accent: Palette;
  neutral: Palette;
}

// Main function to generate semantics
export function generateSemanticPalettes(chosenHues: Partial<{ primary: number; secondary: number; accent: number; neutral: number }>): SemanticPalettes {
  if (chosenHues.primary === undefined) {
    throw new Error('At least primary hue is required.');
  }

  const primaryHue = chosenHues.primary;
  const primaryPalette = getPaletteForHue(primaryHue);

  // For unchosen, use harmony to pick existing families
  const secondaryHue = chosenHues.secondary ?? normalizeHue(primaryHue + 180);
  const secondaryPalette = chosenHues.secondary !== undefined ? getPaletteForHue(secondaryHue) : familyPalettes.get(findClosestFamily(secondaryHue))!;

  const accentHue = chosenHues.accent ?? normalizeHue(primaryHue + 30);
  const accentPalette = chosenHues.accent !== undefined ? getPaletteForHue(accentHue) : familyPalettes.get(findClosestFamily(accentHue))!;

  const neutralHue = chosenHues.neutral ?? 0; // Default irrelevant for neutral
  const neutralPalette = chosenHues.neutral !== undefined ? getPaletteForHue(neutralHue) : familyPalettes.get('neutral')!;

  return {
    primary: primaryPalette,
    secondary: secondaryPalette,
    accent: accentPalette,
    neutral: neutralPalette,
  };
}

// Example usage:
// const palettes = generateSemanticPalettes({ primary: 17.38 });
// console.log(palettes.primary.get('50')); // Interpolated or exact red-50-ish









