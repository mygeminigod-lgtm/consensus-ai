'use client';

import { useState, useEffect, useCallback } from 'react';
import type { HistoryItem } from '@/types/consensus';
import { getHistory, addToHistory, removeFromHistory, clearHistory } from '@/utils/storage';

export function useHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  
  useEffect(() => {
    setItems(getHistory());
  }, []);
  
  const addItem = useCallback((item: HistoryItem) => {
    addToHistory(item);
    setItems(getHistory());
  }, []);
  
  const removeItem = useCallback((id: string) => {
    removeFromHistory(id);
    setItems(getHistory());
  }, []);
  
  const clearAll = useCallback(() => {
    clearHistory();
    setItems([]);
  }, []);
  
  return { items, addItem, removeItem, clearAll };
}
