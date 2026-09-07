import type { AppSettings, HistoryItem, SavedAnswer } from '@/types/consensus';

export const DEFAULT_SETTINGS: AppSettings = {
  providers: {},
  verificationDepth: 'balanced',
  defaultMode: 'balanced',
  responseStyle: 'standard',
  citationStyle: 'links',
  saveHistory: true,
  demoModeOnly: false,
};

export function getHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('consensus_history');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addToHistory(item: HistoryItem): void {
  if (typeof window === 'undefined') return;
  try {
    const history = getHistory();
    const updated = [item, ...history.filter(i => i.id !== item.id)].slice(0, 100);
    localStorage.setItem('consensus_history', JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save history', e);
  }
}

export function removeFromHistory(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const history = getHistory().filter(i => i.id !== id);
    localStorage.setItem('consensus_history', JSON.stringify(history));
  } catch (e) {
    console.error('Failed to remove from history', e);
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('consensus_history');
}

export function getSavedAnswers(): SavedAnswer[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('consensus_saved');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveAnswer(answer: SavedAnswer): void {
  if (typeof window === 'undefined') return;
  try {
    const saved = getSavedAnswers();
    const updated = [answer, ...saved.filter(a => a.id !== answer.id)];
    localStorage.setItem('consensus_saved', JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save answer', e);
  }
}

export function removeSavedAnswer(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const saved = getSavedAnswers().filter(a => a.id !== id);
    localStorage.setItem('consensus_saved', JSON.stringify(saved));
  } catch (e) {
    console.error('Failed to remove saved answer', e);
  }
}

export function getSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const data = localStorage.getItem('consensus_settings');
    if (!data) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(data);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('consensus_settings', JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}
