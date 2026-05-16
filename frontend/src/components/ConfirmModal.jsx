import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete", cancelText = "Cancel" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* HEADER & ICON */}
        <div className="p-6 pb-0 flex justify-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600">
            <AlertTriangle size={32} />
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 text-center">
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {title || "Are you sure?"}
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            {message || "This action cannot be undone. All data associated with this item will be permanently removed."}
          </p>
        </div>

        {/* ACTIONS */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 font-semibold rounded-2xl hover:bg-slate-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-2xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95"
          >
            {confirmText}
          </button>
        </div>

        {/* CLOSE BUTTON */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>

      </div>
    </div>
  );
}
