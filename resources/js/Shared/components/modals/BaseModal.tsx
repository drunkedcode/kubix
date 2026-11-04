// resources/js/Shared/components/modals/BaseModal.tsx
import React from 'react';
import { X } from 'lucide-react';

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'md',
}: BaseModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div 
        className={`bg-navy-900 border border-gray-800 rounded-2xl w-full ${maxWidthClasses[maxWidth]} p-6 shadow-2xl text-white animate-in fade-in zoom-in duration-200`}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
          <h3 className="font-display font-bold text-base">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white bg-navy-950 rounded-lg border border-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido — AQUÍ VAN TUS PARTIALS */}
        <div className="flex flex-col gap-4 text-xs">
          {children}
        </div>

        {/* Pie / Botones opcional */}
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-gray-800 pt-4 mt-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default BaseModal;