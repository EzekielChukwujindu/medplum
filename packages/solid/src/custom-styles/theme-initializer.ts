// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { generateSemanticPalettes } from './custom-palette';

const THEME_STORAGE_KEY = 'emr-theme-config';

// Apply custom theme from saved configuration
const applyCustomTheme = (themeConfig: Partial<{ primary: number; secondary: number; accent: number; neutral: number; }>) => {
  try {
    const palettes = generateSemanticPalettes(themeConfig);
    const root = document.documentElement;
    
    const semantics = ['primary', 'secondary', 'accent', 'neutral'] as const;

    semantics.forEach(semantic => {
      const palette = palettes[semantic]; // ✅ semantic is now a keyof SemanticPalettes
      palette.forEach((color, shade) => {
        root.style.setProperty(
          `--color-${semantic}-${shade}`,
          `oklch(${color.l} ${color.c} ${color.h})`
        );
      });
    });
    console.log('Applied saved custom theme:', themeConfig);
    return true;
  } catch (error) {
    console.error('Error applying custom theme:', error);
    return false;
  }
};

// Main theme initialization function - call this at app startup
export const initializeTheme = () => {
  try {
    // Try to load saved theme c
    // onfiguration
    const savedTheme = undefined;
  
    // const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    
    if (savedTheme) {
      console.log('Found saved theme configuration:', savedTheme);
      const themeConfig = JSON.parse(savedTheme);
      
      // Only apply if we have a primary hue (minimum requirement)
      if (themeConfig.primary !== undefined) {
        const success = applyCustomTheme(themeConfig);
        if (success) {
          return; // Successfully applied custom theme
        }
      }
    }
    
    // If no saved theme or failed to apply, CSS defaults will be used
    console.log('Using default Tailwind theme from CSS');
    
  } catch (error) {
    console.error('Error during theme initialization:', error);
    console.log('Falling back to default Tailwind theme from CSS');
  }
};

// Export for use in theme switcher
export { THEME_STORAGE_KEY };





// Apply a given theme using the Kobalte + .dark/.light style
function _applyTheme(theme: string) {
  const root = document.documentElement;

  // Update Kobalte's attribute
  root.dataset.kbTheme = theme;

  // Update CSS color-scheme for native form controls, scrollbars, etc.
  root.style.colorScheme = theme;

  // Update your own .dark/.light class system
  root.classList.remove("dark", "light");
  root.classList.add(theme);
}

// // Subscribe to theme updates from the backend
// export async function registerThemeListener() {
//   await listen("appctx:field_changed", (event) => {
//     const payload = event.payload as {
//       key: string;
//       value: any;
//       version: number;
//       updated_at: string;
//     };

//     if (payload.key === "UiPrefs") {
//       const prefs = payload.value?.UiPrefs;
//       const theme = prefs?.["omni-ui-theme"];
//       if (theme) {
//         applyTheme(theme);
//       }
//     }
//   });
// }
