import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface Props {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
}

const ConfirmDialog = ({
  open,
  onConfirm,
  onCancel,
  title,
  description,
  confirmLabel = 'Delete',
  loading = false,
}: Props) => {
  return (
    <AlertDialog.Root open={open}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        />
        <AlertDialog.Content
          className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            bg-white rounded-2xl shadow-xl w-[calc(100%-2rem)] max-w-sm p-5 sm:p-6"
        >
          {/* Icon */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-red-50 rounded-full
            flex items-center justify-center mb-3 sm:mb-4">
            <AlertTriangle size={18} className="text-red-500" />
          </div>

          <AlertDialog.Title className="text-base font-semibold text-slate-800">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-1.5 text-sm text-slate-500 leading-relaxed">
            {description}
          </AlertDialog.Description>

          <div className="flex gap-3 mt-5 sm:mt-6">
            <AlertDialog.Cancel asChild>
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 px-3 border border-slate-300
                  hover:bg-slate-50 text-slate-700 text-sm font-medium
                  rounded-lg transition-colors"
              >
                Cancel
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 py-2.5 px-3 bg-red-500 hover:bg-red-600
                  disabled:bg-red-400 text-white text-sm font-semibold
                  rounded-lg transition-colors flex items-center
                  justify-center gap-2"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {loading ? 'Deleting...' : confirmLabel}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

export default ConfirmDialog;