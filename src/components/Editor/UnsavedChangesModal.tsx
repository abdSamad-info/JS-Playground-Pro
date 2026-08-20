import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn-ui/dialog";
import { Button } from "@/components/shadcn-ui/button";
import { AlertCircle, Save, Trash2, X } from 'lucide-react';
import { File } from '@/types/index';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  file: File | null;
  onSaveAndClose: () => void;
  onDiscardAndClose: () => void;
  onCancel: () => void;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  file,
  onSaveAndClose,
  onDiscardAndClose,
  onCancel,
}) => {
  if (!file) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent className="sm:max-w-[425px] bg-[#252526] border-[#454545] text-[#cccccc] shadow-2xl">
        <DialogHeader className="gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <AlertCircle size={20} />
            </div>
            <div>
              <DialogTitle className="text-white text-base font-semibold">
                Save Changes to {file.name}?
              </DialogTitle>
              <DialogDescription className="text-[#999999] text-xs mt-1">
                Your recent changes to this file have not been saved yet.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-3 text-xs text-[#bbbbbb] leading-relaxed bg-[#1e1e1e] rounded-md p-3 border border-[#333333]">
          If you close without saving, any modifications made in this session will be permanently discarded.
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end mt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="h-8 text-xs text-[#888888] hover:text-white hover:bg-[#333333]"
          >
            <X size={14} className="mr-1.5" />
            Cancel
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onDiscardAndClose}
            className="h-8 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <Trash2 size={14} className="mr-1.5" />
            Don't Save
          </Button>

          <Button
            type="button"
            onClick={onSaveAndClose}
            className="h-8 text-xs bg-[#007acc] hover:bg-[#007acc]/90 text-white font-medium shadow-sm"
          >
            <Save size={14} className="mr-1.5" />
            Save & Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
