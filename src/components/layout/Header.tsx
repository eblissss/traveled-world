import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, RotateCw, Download, Upload, Check } from 'lucide-react';
import { ViewSwitcher } from './ViewSwitcher';
import { StyleSelector } from './StyleSelector';
import { ActivitySummaryModal } from './ActivitySummaryModal';
import { useTravelStore } from '../../store/travelStore';
import { Button } from '../ui/Button';
import { ProgressIndicator } from '../ui/ProgressIndicator';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useToast } from '../ui/Toast';
import { exportToJson, downloadBlob, generateFilename, readFileAsText, importFromJson, type ProgressCallback } from '../../lib/dataExportImport';

interface HeaderProps {
  onUndo?: () => void;
  onRedo?: () => void;
}

export function Header({ onUndo, onRedo }: HeaderProps) {
  const { cities, trips, preferences, undo, redo, canUndo, canRedo, importData } = useTravelStore();
  const { showToast } = useToast();
  const [showImportSuccess, setShowImportSuccess] = useState(false);
  const [showKeyboardHints, setShowKeyboardHints] = useState(false);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number; isExporting?: boolean } | null>(null);
  const [exportProgress, setExportProgress] = useState<{ current: number; total: number } | null>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUndo = () => {
    onUndo?.() || (undo(), showToast({ message: 'Action undone', type: 'info', duration: 2000 }));
  };

  const handleRedo = () => {
    onRedo?.() || (redo(), showToast({ message: 'Action redone', type: 'info', duration: 2000 }));
  };


  const handleExport = async () => {
    const progressCallback: ProgressCallback = (current, total) => {
      setExportProgress({ current, total });
    };

    try {
      const content = await exportToJson(cities, trips, preferences, progressCallback);
      const blob = new Blob([content], { type: 'application/json' });
      downloadBlob(blob, generateFilename('traveled-world-export', 'json'));
      setTimeout(() => setExportProgress(null), 500);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Export failed:', error);
      setExportProgress(null);
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const progressCallback: ProgressCallback = (current, total) => {
      setImportProgress({ current, total });
    };

    try {
      const fileContent = await readFileAsText(file);
      importData(await importFromJson(fileContent, progressCallback));
      setShowImportSuccess(true);
      setTimeout(() => {
        setShowImportSuccess(false);
        setImportProgress(null);
      }, 3000);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Import failed:', error);
      setImportProgress(null);
      showToast({ message: 'Import failed', type: 'error' });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useKeyboardShortcuts({
    onExport: handleExport,
    onImport: handleImport,
    onUndo: handleUndo,
    onRedo: handleRedo,
    onShowKeyboardHints: () => setShowKeyboardHints(true),
    onHideKeyboardHints: () => setShowKeyboardHints(false)
  });

  useEffect(() => {
    if (showKeyboardHints) {
      const timer = setTimeout(() => setShowKeyboardHints(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showKeyboardHints]);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-[100] px-6 py-4"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-bg-secondary/90 via-bg-secondary/95 to-bg-secondary/90 backdrop-blur-xl border-b border-white/20 shadow-sm" />

      <div className="relative flex items-center justify-between gap-4 md:gap-6">
        {/* Brand Logo */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-baseline gap-0 group cursor-default">
            <span className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary">
              traveled
            </span>
            <span className="text-xl md:text-2xl font-light text-text-primary/60 ml-1">
              .world
            </span>
          </div>
          <motion.div 
            className="h-0.5 bg-gradient-to-r from-accent-primary via-accent-primary to-transparent rounded-full mt-1 origin-left"
            initial={{ width: '36px' }}
            animate={{ 
              width: ['36px', '72px', '36px'],
              opacity: [1, 0.8, 1]
            }}
            transition={{ 
              duration: 5, 
              repeat: Infinity, 
              ease: 'easeInOut'
            }}
            whileHover={{ 
              width: '64px',
              opacity: 1
            }}
          />
        </div>

        {/* Action Groups */}
        <div className="flex items-center gap-1 md:gap-3">

          {/* History Controls - Hidden on mobile */}
          <motion.div
            className="hidden md:flex items-center gap-1 p-1.5 bg-bg-primary/50 rounded-xl backdrop-blur-sm border border-white/20"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.2 }}
          >
            <Button
              variant="secondary"
              size="sm"
              onClick={handleUndo}
              disabled={!canUndo()}
              title="Undo last action (Ctrl+Z / Cmd+Z)"
              className="backdrop-blur-sm bg-transparent hover:bg-bg-primary/50 border-0 px-3 py-2 h-8"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRedo}
              disabled={!canRedo()}
              title="Redo (Ctrl+Shift+Z / Cmd+Shift+Z)"
              className="backdrop-blur-sm bg-transparent hover:bg-bg-primary/50 border-0 px-3 py-2 h-8"
            >
              <RotateCw className="w-4 h-4" />
            </Button>
          </motion.div>

          {/* Data Management - Compact on mobile */}
          <motion.div
            className="flex items-center gap-1 p-1 bg-bg-primary/50 rounded-xl backdrop-blur-sm border border-white/20 md:p-1.5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.4 }}
          >
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExport}
              title="Export your data (Ctrl+E / Cmd+E)"
              className="backdrop-blur-sm bg-transparent hover:bg-white/10 border-0 px-2 md:px-3 py-2 h-8"
            >
              <Download className="w-4 h-4" />
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleImport}
              title="Import data from JSON file (Ctrl+I / Cmd+I)"
              className="backdrop-blur-sm bg-transparent hover:bg-white/10 border-0 px-2 md:px-3 py-2 h-8"
            >
              <Upload className="w-4 h-4" />
            </Button>
          </motion.div>

          {/* Separator */}
          <div className="w-px h-6 bg-white/20 hidden md:block" />

          {/* View Controls */}
          <motion.div
            className="flex items-center gap-1 md:gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <StyleSelector />
            <ViewSwitcher />
          </motion.div>
        </div>
      </div>

      {/* Progress Indicators */}
      <ProgressIndicator
        progress={exportProgress}
        type="export"
        onComplete={() => setExportProgress(null)}
      />
      <ProgressIndicator
        progress={importProgress}
        type="import"
        onComplete={() => setImportProgress(null)}
      />

      {/* Enhanced Import Success Message */}
      <AnimatePresence>
        {showImportSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="mt-4 p-4 bg-gradient-to-r from-accent-visited/10 to-accent-visited/5 backdrop-blur-xl border border-accent-visited/20 rounded-xl shadow-lg"
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  rotate: { duration: 0.5 },
                  scale: { duration: 1, repeat: Infinity, repeatDelay: 2 }
                }}
                className="w-6 h-6 text-accent-visited"
              >
                <Check className="w-6 h-6" />
              </motion.div>
              <div className="flex-1">
                <div className="text-accent-visited font-semibold">Import Complete!</div>
                <div className="text-accent-visited/80 text-sm">Your data has been successfully imported</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Import JSON file"
      />

      {/* Activity Summary Modal */}
      <ActivitySummaryModal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        cities={cities}
        trips={trips}
      />
    </motion.header>
  );
}


