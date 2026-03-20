import { atom } from 'jotai';

// ─── Modal ───────────────────────────────────────────────────────────────────

export type ModalType = 'confirm' | 'alert' | 'custom' | null;

export interface ModalState {
  isOpen: boolean;
  type: ModalType;
  title?: string;
  description?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const initialModalState: ModalState = {
  isOpen: false,
  type: null,
};

export const modalAtom = atom<ModalState>(initialModalState);

/** 모달 열기 */
export const openModalAtom = atom(
  null,
  (_get, set, payload: Omit<ModalState, 'isOpen'>) => {
    set(modalAtom, { ...payload, isOpen: true });
  }
);

/** 모달 닫기 */
export const closeModalAtom = atom(null, (_get, set) => {
  set(modalAtom, initialModalState);
});

// ─── Toast ───────────────────────────────────────────────────────────────────

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number; // ms, 기본값 3000
}

export const toastsAtom = atom<Toast[]>([]);

/** 토스트 추가 */
export const addToastAtom = atom(
  null,
  (_get, set, payload: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID();
    set(toastsAtom, (prev) => [...prev, { ...payload, id }]);
  }
);

/** 토스트 제거 */
export const removeToastAtom = atom(null, (_get, set, id: string) => {
  set(toastsAtom, (prev) => prev.filter((t) => t.id !== id));
});
