import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, Camera, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { compressImageFile } from '../services/imageCompressor';
import { parsePantryImage } from '../services/api';
import confetti from 'canvas-confetti';

export default function VisualIngestionModal({ isOpen, onClose, onImportItems }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelect = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setErrorMsg(null);
    setExtractedData(null);
    setFile(selected);

    try {
      // Step 1: Compress Image Client-Side (PRD 3.0 Step 1)
      const compressed = await compressImageFile(selected);
      setPreviewUrl(compressed.dataUrl);

      // Step 2: Trigger AI Vision Extraction
      setIsProcessing(true);
      const res = await parsePantryImage(compressed.base64Data, compressed.mimeType);

      if (res.success && res.items) {
        setExtractedData(res.items);
      } else {
        throw new Error(res.error || 'No edible items detected.');
      }
    } catch (err) {
      console.error('Scan error:', err);
      setErrorMsg('Could not extract items from photo. Please try a clearer shot or check your API key.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = () => {
    if (!extractedData || extractedData.length === 0) return;
    
    // Confetti celebration
    confetti({
      particleCount: 60,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#10b981', '#f59e0b']
    });

    onImportItems(extractedData);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setIsProcessing(false);
    setExtractedData(null);
    setErrorMsg(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 dark:bg-slate-950/75 backdrop-blur-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl liquid-glass-modal p-6 sm:p-7 shadow-2xl max-h-[90vh] flex flex-col"
        >
          {/* Top Specular Rim */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 dark:via-white/30 to-transparent pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Multimodal Visual Scanner
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/15 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 font-semibold">
                    Visual AI
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Scan receipts or fridge shelves to auto-import grocery items</p>
              </div>
            </div>
            <button
              onClick={() => { handleReset(); onClose(); }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-5 space-y-5">
            {!previewUrl ? (
              /* Dropzone Upload Box */
              <motion.div
                whileHover={{ scale: 1.008 }}
                onClick={() => fileInputRef.current?.click()}
                className="relative cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/15 hover:border-indigo-500 dark:hover:border-indigo-400/50 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] p-8 sm:p-10 text-center transition-all group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <div className="mx-auto w-14 h-14 rounded-2xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform shadow-inner">
                  <UploadCloud className="w-7 h-7" />
                </div>

                <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">Upload Receipt or Fridge Photo</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Drag & drop your grocery receipt or snap a photo of your shelves.
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold liquid-btn-indigo text-white shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" /> Choose Image
                </div>
              </motion.div>
            ) : (
              /* Image Preview & Scanline Overlay */
              <div className="space-y-5">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 max-h-60 flex items-center justify-center bg-slate-950/80">
                  <img
                    src={previewUrl}
                    alt="Pantry scan target"
                    className="w-full h-full object-cover max-h-60 opacity-85"
                  />

                  {/* Laser Scanline traversal animation */}
                  {isProcessing && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-laser" />
                      <div className="absolute inset-0 bg-emerald-500/[0.06] backdrop-blur-[1px]" />
                    </div>
                  )}

                  <button
                    onClick={handleReset}
                    className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-xs text-slate-300 hover:text-white border border-white/15 shadow-md"
                  >
                    Change
                  </button>
                </div>

                {isProcessing && (
                  <div className="flex items-center justify-center gap-2 py-3 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing food items & shelf-life timelines...</span>
                  </div>
                )}

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Extracted Items List */}
                {extractedData && extractedData.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Identified Items ({extractedData.length})
                      </h4>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">100% Extracted</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                      {extractedData.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.07] flex items-center justify-between text-xs"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">{item.category} • {item.storage_location}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-lg text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 font-semibold flex-shrink-0">
                            +{item.estimated_shelf_life_days || item.shelf_life_days}d
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-end gap-2.5">
            <button
              onClick={() => { handleReset(); onClose(); }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
            >
              Cancel
            </button>

            {extractedData && (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleConfirmImport}
                className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs font-bold liquid-btn-primary text-white"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Import {extractedData.length} Items
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
