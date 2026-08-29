/**
 * Theme system for MIMO Code WebUI.
 * Maps theme IDs to CSS variable overrides.
 * Inherits the 40+ themes from MIMO Code's design system.
 */

export interface ThemeDefinition {
  id: string
  name: string
  type: 'light' | 'dark' | 'both'
  description?: string
}

// ---- MIMO Code 40+ themes ----
// A curated subset covering the full range of popular themes.
// The complete set can be extended by reading MIMO Code's theme JSON files.

export const THEMES: ThemeDefinition[] = [
  // Dark themes
  { id: 'oc-2', name: 'OC-2', type: 'dark', description: 'Default MIMO Code dark theme' },
  { id: 'amoled', name: 'AMOLED', type: 'dark', description: 'Pure black background' },
  { id: 'aura', name: 'Aura', type: 'dark', description: 'Purple-toned dark theme' },
  { id: 'ayu', name: 'Ayu', type: 'dark', description: 'Warm dark theme' },
  { id: 'carbonfox', name: 'Carbonfox', type: 'dark', description: 'Cool blue-gray dark' },
  { id: 'catppuccin', name: 'Catppuccin', type: 'dark', description: 'Muted pastel dark' },
  { id: 'catppuccin-frappe', name: 'Catppuccin Frappé', type: 'dark', description: 'Catppuccin frappé variant' },
  { id: 'catppuccin-macchiato', name: 'Catppuccin Macchiato', type: 'dark', description: 'Catppuccin macchiato variant' },
  { id: 'cobalt2', name: 'Cobalt2', type: 'dark', description: 'High-contrast blue dark' },
  { id: 'cursor', name: 'Cursor', type: 'dark', description: 'Cursor editor dark' },
  { id: 'dracula', name: 'Dracula', type: 'dark', description: 'Iconic purple-pink dark' },
  { id: 'everforest', name: 'Everforest', type: 'dark', description: 'Earthy green dark' },
  { id: 'flexoki', name: 'Flexoki', type: 'both', description: 'Warm ink-based theme' },
  { id: 'github', name: 'GitHub', type: 'both', description: 'GitHub colors' },
  { id: 'gruvbox', name: 'Gruvbox', type: 'dark', description: 'Retro earthtone dark' },
  { id: 'kanagawa', name: 'Kanagawa', type: 'dark', description: 'Japanese ink wash dark' },
  { id: 'lucent-orng', name: 'Lucent Orng', type: 'dark', description: 'Orange-accented dark' },
  { id: 'material', name: 'Material', type: 'dark', description: 'Material design dark' },
  { id: 'matrix', name: 'Matrix', type: 'dark', description: 'Matrix green-on-black' },
  { id: 'mercury', name: 'Mercury', type: 'dark', description: 'Clean gray dark' },
  { id: 'monokai', name: 'Monokai', type: 'dark', description: 'Classic monokai' },
  { id: 'nightowl', name: 'Night Owl', type: 'dark', description: 'Blue-tinted dark' },
  { id: 'nord', name: 'Nord', type: 'dark', description: 'Arctic bluish dark' },
  { id: 'one-dark', name: 'One Dark', type: 'dark', description: 'Atom One Dark' },
  { id: 'onedarkpro', name: 'One Dark Pro', type: 'dark', description: 'VSCode One Dark Pro' },
  { id: 'opencode', name: 'OpenCode', type: 'dark', description: 'OpenCode default' },
  { id: 'orng', name: 'ORNG', type: 'dark', description: 'Orange-accented' },
  { id: 'osaka-jade', name: 'Osaka Jade', type: 'dark', description: 'Jade green dark' },
  { id: 'palenight', name: 'Palenight', type: 'dark', description: 'Material Palenight' },
  { id: 'rosepine', name: 'Rosé Pine', type: 'dark', description: 'Soft pine dark' },
  { id: 'shadesofpurple', name: 'Shades of Purple', type: 'dark', description: 'Purple theme' },
  { id: 'solarized', name: 'Solarized', type: 'both', description: 'Precise contrast colors' },
  { id: 'synthwave84', name: 'Synthwave 84', type: 'dark', description: 'Retro synthwave' },
  { id: 'tokyonight', name: 'Tokyo Night', type: 'dark', description: 'Deep blue night' },
  { id: 'vercel', name: 'Vercel', type: 'both', description: 'Vercel-inspired theme' },
  { id: 'vesper', name: 'Vesper', type: 'dark', description: 'Warm sunset dark' },
  { id: 'zenburn', name: 'Zenburn', type: 'dark', description: 'Low-contrast warm dark' },
]

export function getTheme(id: string): ThemeDefinition | undefined {
  return THEMES.find((t) => t.id === id)
}

export function applyTheme(themeId: string, colorScheme?: 'light' | 'dark') {
  document.documentElement.dataset.theme = themeId

  if (colorScheme) {
    document.documentElement.dataset.colorScheme = colorScheme
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(colorScheme)
    localStorage.setItem('mimocode-color-scheme', colorScheme)
  }

  localStorage.setItem('mimocode-theme-id', themeId)
}

export function getCurrentTheme(): string {
  return localStorage.getItem('mimocode-theme-id') || 'oc-2'
}

export function getCurrentColorScheme(): 'light' | 'dark' | 'system' {
  return (localStorage.getItem('mimocode-color-scheme') as 'light' | 'dark' | 'system') || 'dark'
}
