import { useEffect, useRef } from 'react';
import { useTravelStore } from '../store/travelStore';

interface KeyboardShortcutCallbacks {
  onNewTrip?: () => void;
  onFocusSearch?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onCloseModal?: () => void;
  onShowKeyboardHints?: () => void;
  onHideKeyboardHints?: () => void;
}

export function useKeyboardShortcuts(callbacks: KeyboardShortcutCallbacks) {
  const { canUndo, canRedo } = useTravelStore();
  const callbacksRef = useRef(callbacks as KeyboardShortcutCallbacks);

  // Keep callbacks ref updated
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs, textareas, or contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Still allow Esc to close modals and Ctrl+F to focus search
        if (e.key === 'Escape') {
          callbacksRef.current.onCloseModal?.();
          return;
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
          e.preventDefault();
          callbacksRef.current.onFocusSearch?.();
          return;
        }
        return;
      }

      const cmdOrCtrl = e.ctrlKey || e.metaKey;

      // Undo
      if (cmdOrCtrl && e.key === 'z' && !e.shiftKey && canUndo()) {
        e.preventDefault();
        callbacksRef.current.onUndo?.();
        return;
      }

      // Redo
      if (
        ((cmdOrCtrl && e.key === 'y') || (cmdOrCtrl && e.shiftKey && e.key === 'z')) &&
        canRedo()
      ) {
        e.preventDefault();
        callbacksRef.current.onRedo?.();
        return;
      }

      // Focus search
      if (cmdOrCtrl && e.key === 'f') {
        e.preventDefault();
        callbacksRef.current.onFocusSearch?.();
        return;
      }

      // New trip
      if (cmdOrCtrl && e.key === 'n') {
        e.preventDefault();
        callbacksRef.current.onNewTrip?.();
        return;
      }

      // Export
      if (cmdOrCtrl && e.key === 'e') {
        e.preventDefault();
        callbacksRef.current.onExport?.();
        return;
      }

      // Import
      if (cmdOrCtrl && e.key === 'i') {
        e.preventDefault();
        callbacksRef.current.onImport?.();
        return;
      }

      // Close modal
      if (e.key === 'Escape') {
        callbacksRef.current.onCloseModal?.();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo]);
}