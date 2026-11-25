import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface ExamDeleteModalProps {
  open: boolean;
  examTitle: string;
  deleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ExamDeleteModal: React.FC<ExamDeleteModalProps> = ({
  open,
  examTitle,
  deleting,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      open={open}
      onClose={() => !deleting && onCancel()}
      dismissible={!deleting}
      titleId="delete-exam-modal-title"
      headerBadge={
        <Badge variant="danger" icon={<AlertTriangle className="w-3.5 h-3.5" />}>
          Destructive Action
        </Badge>
      }
      title="Delete Examination?"
      subtitle="This action permanently removes the exam, all authored questions, student attempts, and associated proctoring logs."
      footer={
        <>
          <Button variant="secondary" size="md" disabled={deleting} onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="md"
            loading={deleting}
            onClick={onConfirm}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Delete Permanently
          </Button>
        </>
      }
    >
      <div className="p-4 rounded-[12px] bg-rose-50 border border-rose-200 text-rose-900 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-100 text-sm">
        Target assessment: <span className="font-bold">{examTitle}</span>
      </div>
    </Modal>
  );
};
