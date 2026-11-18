import { Button } from './Button';
import { Dialog } from './Dialog';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  confirming?: boolean;
}

export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  confirming = false,
}: ConfirmDialogProps) => {
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      showCloseButton={false}
      footer={
        <>
          <Button variant="ghost" onClick={handleCancel} disabled={confirming}>
            {cancelLabel}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              void onConfirm();
            }}
            loading={confirming}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-body text-text-secondary">{description}</p>
    </Dialog>
  );
};
