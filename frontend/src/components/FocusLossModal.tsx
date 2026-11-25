import React from 'react';
import { ShieldAlert, Maximize2, AlertTriangle } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface FocusLossModalProps {
  open: boolean;
  focusLossCount: number;
  threshold: number;
  eventDetails: string;
  onAcknowledge: () => void;
}

export const FocusLossModal: React.FC<FocusLossModalProps> = ({
  open,
  focusLossCount,
  threshold,
  eventDetails,
  onAcknowledge,
}) => {
  const remaining = Math.max(0, threshold - focusLossCount);

  return (
    <Modal
      open={open}
      onClose={onAcknowledge}
      titleId="focus-loss-modal-title"
      dismissible={true}
      headerBadge={
        <Badge variant="danger" icon={<ShieldAlert className="w-3.5 h-3.5" />}>
          Proctoring Violation Recorded
        </Badge>
      }
      title="Exam Window Focus Interrupted"
      subtitle="Navigation away from the examination viewport is restricted and logged to your assessment audit trail."
      footer={
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={onAcknowledge}
          leftIcon={<Maximize2 className="w-4 h-4" />}
        >
          Return to Examination
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="p-4 rounded-[12px] bg-rose-50 border border-rose-200 text-rose-900 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-100 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[var(--accent-danger)] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-sm space-y-1">
            <p className="font-bold">Event Detected: {eventDetails}</p>
            <p>
              Strike {focusLossCount} of {threshold} recorded.{' '}
              {remaining > 0
                ? `${remaining} remaining before automatic submission.`
                : 'Maximum limit reached — finalizing attempt.'}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
