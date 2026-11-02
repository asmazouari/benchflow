'use client';

import React from 'react';
import { api } from '@/lib/api';
import { formatFileSize } from '@/lib/utils';
import { FileText, Download } from 'lucide-react';

/**
 * Molécule DocumentBadge — Niveau 2 Atomic Design (BenchFlow)
 * Affiche le document de cadrage attaché à une initiative (stocké sur MinIO S3)
 * avec icône, nom du fichier tronqué, taille formatée et lien direct de téléchargement.
 * 
 * Remplace les 4 blocs JSX identiques dupliqués dans CatalogTab et ValidationTab.
 */
export interface DocumentBadgeProps {
  initiativeId: number;
  documentNom?: string;
  documentTaille?: number;
  className?: string;
  variant?: 'default' | 'compact';
}

export function DocumentBadge({
  initiativeId,
  documentNom,
  documentTaille,
  className = '',
  variant = 'default',
}: DocumentBadgeProps) {
  if (!documentNom) return null;

  const downloadUrl = api.getInitiativeDocumentDownloadUrl(initiativeId);

  if (variant === 'compact') {
    return (
      <a
        href={downloadUrl}
        download={documentNom}
        target="_blank"
        rel="noreferrer"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer shadow-2xs group ${className}`}
        title={`Télécharger le cadrage : ${documentNom}`}
      >
        <FileText className="w-3 h-3 text-slate-500 group-hover:text-indigo-600 transition-colors" />
        <span className="truncate max-w-[140px]">{documentNom}</span>
        <Download className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" />
      </a>
    );
  }

  return (
    <a
      href={downloadUrl}
      download={documentNom}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 transition-all shadow-2xs group cursor-pointer ${className}`}
      title={`Télécharger le document de cadrage : ${documentNom}`}
    >
      <FileText className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform shrink-0" />
      <span className="truncate max-w-[170px]">{documentNom}</span>
      {documentTaille && (
        <span className="text-[10px] text-indigo-400 font-normal">
          ({formatFileSize(documentTaille)})
        </span>
      )}
      <Download className="w-3 h-3 text-indigo-500 group-hover:translate-y-0.5 transition-transform shrink-0" />
    </a>
  );
}
