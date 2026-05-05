import { createContext, useCallback, useContext, useEffect, useState } from 'react';

type CartItem = { title: string; specs: string; image: string; qty: number };

type RfqContext = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (index: number) => void;
  updateQty: (index: number, delta: number) => void;
  open: () => void;
  close: () => void;
  submit: (form: { name: string; email: string; company: string; notes: string }) => Promise<void>;
};

const Ctx = createContext<RfqContext | null>(null);
const STORAGE_KEY = 'pdr_rfq_cart';

function loadInitial(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function RfqCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadInitial);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.title === item.title && p.specs === item.specs);
      if (idx >= 0) {
        const next = prev.slice();
        next[idx] = { ...next[idx], qty: next[idx].qty + item.qty };
        return next;
      }
      return [...prev, item];
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

  const submit = useCallback(async (_form: { name: string; email: string; company: string; notes: string }) => {
    await new Promise((r) => setTimeout(r, 1500));
    alert('Quote Request Submitted Successfully! Our engineers will contact you within 24 hours.');
    setItems([]);
    setIsOpen(false);
  }, []);

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
