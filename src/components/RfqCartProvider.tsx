import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { hasSupabaseConfig } from '../lib/supabase';
import { submitQuoteRequest, syncQuoteSession } from '../lib/leadCapture';
import type { QuoteItem, QuoteRequestPayload } from '../lib/formTypes';

type RfqContext = {
  items: QuoteItem[];
  isOpen: boolean;
  addItem: (item: QuoteItem) => void;
  removeItem: (index: number) => void;
  updateQty: (index: number, delta: number) => void;
  open: () => void;
  close: () => void;
  submit: (form: QuoteRequestPayload) => Promise<void>;
};

const Ctx = createContext<RfqContext | null>(null);
const STORAGE_KEY = 'pdr_rfq_cart';
const SESSION_KEY = 'pdr_rfq_session_hash';

function loadInitial(): QuoteItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as QuoteItem[]) : [];
  } catch {
    return [];
  }
}

function loadSessionHash() {
  if (typeof window === 'undefined') return 'server-session';
  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const next = globalThis.crypto?.randomUUID?.() ?? `rfq_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  localStorage.setItem(SESSION_KEY, next);
  return next;
}

export function RfqCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<QuoteItem[]>(loadInitial);
  const [sessionHash] = useState(loadSessionHash);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.warn('Failed to save RFQ cart to localStorage (likely quota exceeded):', error);
    }
  }, [items]);

  useEffect(() => {
    if (!hasSupabaseConfig || typeof window === 'undefined') return;
    const timer = window.setTimeout(() => {
      syncQuoteSession(sessionHash, items).catch((error) => {
        console.error('Failed to sync RFQ cart with Supabase', error);
      });
    }, 350);

    return () => window.clearTimeout(timer);
  }, [items, sessionHash]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const addItem = useCallback((item: QuoteItem) => {
    const safeImage = item.image && item.image.startsWith('data:') ? '/placeholder.webp' : item.image;
    const safeItem = { ...item, image: safeImage };
    
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.title === safeItem.title && p.specs === safeItem.specs);
      if (idx >= 0) {
        const next = prev.slice();
        next[idx] = { ...next[idx], qty: next[idx].qty + safeItem.qty };
        return next;
      }
      return [...prev, safeItem];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateQty = useCallback((index: number, delta: number) => {
    setItems((prev) => {
      const next = prev.slice();
      next[index] = { ...next[index], qty: Math.max(1, next[index].qty + delta) };
      return next;
    });
  }, []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const submit = useCallback(
    async (form: QuoteRequestPayload) => {
      if (items.length === 0) {
        alert('Add at least one product before submitting a quote request.');
        return;
      }

      await submitQuoteRequest(sessionHash, form, items);
      alert('Quote Request Submitted Successfully! Our engineers will contact you within 24 hours.');
      setItems([]);
      setIsOpen(false);
    },
    [items, sessionHash],
  );

  return (
    <Ctx.Provider value={{ items, isOpen, addItem, removeItem, updateQty, open, close, submit }}>
      {children}
    </Ctx.Provider>
  );
}

export function useRfqCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useRfqCart must be used inside RfqCartProvider');
  return ctx;
}
