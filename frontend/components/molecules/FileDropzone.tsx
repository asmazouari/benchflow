'use client';

import React, { useRef, useState } from 'react';
import { FILE_UPLOAD_CONFIG } from '../../lib/constants';
import { formatFileSize } from '../../lib/utils';
import { UploadCloud, FileText, X, AlertCircle, Paperclip } from 'lucide-react';

/**
 * Molécule FileDropzone — Niveau 2 Atomic Design (BenchFlow)
 * Zone de glisser-déposer standardisée pour le téléversement de documents de cadrage MinIO S3.
 * Inclut la validation automatique de taille max (5 Mo) et la prévisualisation du fichier.
 */
export interface FileDropzoneProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  label?: string;
  hint?: string;
  maxSizeBytes?: number;
  acceptedExtensions?: string;
  className?: string;
}

export function FileDropzone({
  file,
  onFileSelect,
  label = 'Document de Cadrage (Optionnel)',
  hint = 'PDF, Word, Markdown (max 5 Mo)',
  maxSizeBytes = FILE_UPLOAD_CONFIG.MAX_SIZE_BYTES,
  acceptedExtensions = FILE_UPLOAD_CONFIG.ACCEPTED_EXTENSIONS,
  className = '',
}: FileDropzoneProps) {
  const [internalError, setInternalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleValidateAndSelect = (selectedFile: File | undefined | null) => {
    if (!selectedFile) return;

    if (selectedFile.size > maxSizeBytes) {
      setInternalError(`Le fichier dépasse la taille maximale autorisée de ${FILE_UPLOAD_CONFIG.MAX_SIZE_LABEL}.`);
      onFileSelect(null);
      return;
    }

    setInternalError(null);
    onFileSelect(selectedFile);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    setInternalError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Label d'en-tête */}
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
          <Paperclip className="w-3.5 h-3.5 text-slate-400" />
          <span>{label}</span>
        </label>
        <span className="text-[10px] text-slate-400 font-normal">{hint}</span>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleValidateAndSelect(e.target.files?.[0])}
        accept={acceptedExtensions}
        className="hidden"
      />

      {/* Message d'erreur de taille */}
      {internalError && (
        <div className="mb-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{internalError}</span>
        </div>
      )}

      {/* État : Fichier sélectionné */}
      {file ? (
        <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0 text-xs">
              <p className="font-semibold text-indigo-950 truncate">{file.name}</p>
              <p className="text-[10px] text-indigo-500">{formatFileSize(file.size)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Supprimer le fichier"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* État : Zone vide de glisser-déposer */
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleValidateAndSelect(e.dataTransfer.files?.[0]);
          }}
          className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20 rounded-xl p-4 text-center cursor-pointer transition-all group"
        >
          <UploadCloud className="w-6 h-6 mx-auto text-slate-400 group-hover:text-indigo-600 transition-colors mb-1.5" />
          <p className="text-xs font-semibold text-slate-700 group-hover:text-indigo-900">
            Glissez votre document de cadrage ou <span className="text-indigo-600 underline">parcourez</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Stockage sécurisé sur MinIO S3
          </p>
        </div>
      )}
    </div>
  );
}
