import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn-ui/dialog";
import { Command, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: 'Ctrl + Enter / ⌘ + Enter', action: 'Run JavaScript Code in active file' },
  { key: 'Ctrl + S / ⌘ + S', action: 'Save active file changes' },
  { key: 'Ctrl + ` / ⌘ + `', action: 'Toggle Console & Terminal drawer' },
  { key: 'Ctrl + B / ⌘ + B', action: 'Toggle File Explorer sidebar' },
  { key: 'Shift + Alt + F', action: 'Format code with Prettier' },
  { key: 'Ctrl + E / ⌘ + E', action: 'Explain selected code with AI' },
  { key: 'Ctrl + / / ⌘ + /', action: 'Toggle line comment' },
  { key: 'Ctrl + F / ⌘ + F', action: 'Find in active file' },
];

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[480px] bg-[#252526] border-[#454545] text-[#cccccc] shadow-2xl">
        <DialogHeader className="gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#007acc]/10 border border-[#007acc]/30 flex items-center justify-center text-[#007acc]">
              <Keyboard size={18} />
            </div>
            <DialogTitle className="text-white text-base font-semibold">
              Keyboard Shortcuts
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-2 mt-2 max-h-[360px] overflow-y-auto pr-1">
          {SHORTCUTS.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded bg-[#1e1e1e] border border-[#333333] hover:border-[#454545] transition-colors"
            >
              <span className="text-xs text-[#cccccc]">{item.action}</span>
              <kbd className="px-2 py-1 text-[11px] font-mono font-medium text-white bg-[#2d2d2d] border border-[#454545] rounded shadow-inner">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-2 text-center text-[11px] text-[#777777]">
          Tip: You can use these shortcuts directly inside the editor or anywhere in the playground.
        </div>
      </DialogContent>
    </Dialog>
  );
};
