import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ExamDeleteModalProps {
  exam: { id: string; title: string } | null;
  isOpen: boolean;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ExamDeleteModal: React.FC<ExamDeleteModalProps> = ({
  exam,
  isOpen,
  isDeleting,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !exam) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-lg flex items-center justify-center p-4 animate-fade-in"
      role="alertdialog"
      aria-modal="true"
    >
      <div
        className="studio-card max-w-sm sm:max-w-md w-full p-6 text-center animate-apple-spring border border-[var(--border-strong)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center mx-auto mb-3.5">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-[var(--text-primary)] mb-1.5">
          Delete Examination?
        </h3>
        <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
          Are you sure you want to permanently delete{' '}
          <strong className="text-[var(--text-primary)]">&ldquo;{exam.title}&rdquo;</strong>? All
          questions and associated student attempts will be removed.
        </p>

        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-700 dark:text-amber-300 mb-5 text-left flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>This action cannot be undone. All completed score records will be deleted.</span>
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="btn-ghost-surface px-4 py-2 text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 transition-colors"
          >
            {isDeleting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Exam</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
