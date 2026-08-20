import React from 'react';
import { useStore } from '@/store/useStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn-ui/dialog";
import { Label } from "@/components/shadcn-ui/label";
import { Input } from "@/components/shadcn-ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn-ui/select";
import { Button } from "@/components/shadcn-ui/button";
import { Settings, Check, Sparkles, Sliders, Palette, Code } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const THEME_PRESETS = [
  { id: 'vs-code', name: 'VS Code Dark' },
  { id: 'monokai', name: 'Monokai' },
  { id: 'dracula', name: 'Dracula' },
  { id: 'material', name: 'Material Ocean' },
  { id: 'cobalt', name: 'Cobalt 2' },
  { id: 'github-light', name: 'GitHub Light' },
  { id: 'solarized-dark', name: 'Solarized Dark' },
];

const ACCENT_COLORS = [
  { name: 'VS Blue', value: '#007acc' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Cyan', value: '#06b6d4' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    accentColor,
    setAccentColor,
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
    lineNumbers,
    setLineNumbers,
    wordWrap,
    setWordWrap,
    minimap,
    setMinimap,
    themePreset,
    setThemePreset,
    autoFormat,
    setAutoFormat,
  } = useStore();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[500px] bg-[#252526] border-[#454545] text-[#cccccc] shadow-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#007acc]/10 border border-[#007acc]/30 flex items-center justify-center text-[#007acc]">
              <Settings size={18} />
            </div>
            <DialogTitle className="text-white text-base font-semibold">
              Editor & Playground Preferences
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Appearance & Themes */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider">
              <Palette size={14} className="text-[#007acc]" />
              <span>Appearance & Themes</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-[#aaaaaa]">Editor Theme</Label>
                <Select value={themePreset} onValueChange={(val: any) => setThemePreset(val)}>
                  <SelectTrigger className="bg-[#1e1e1e] border-[#454545] text-xs text-white h-8">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#252526] border-[#454545] text-white">
                    {THEME_PRESETS.map((t) => (
                      <SelectItem key={t.id} value={t.id} className="text-xs hover:bg-[#333333]">
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-[#aaaaaa]">Accent Theme</Label>
                <div className="flex items-center gap-1.5 h-8">
                  {ACCENT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      title={c.name}
                      onClick={() => setAccentColor(c.value)}
                      className="w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 border border-white/10"
                      style={{ backgroundColor: c.value }}
                    >
                      {accentColor === c.value && <Check size={12} className="text-white drop-shadow" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Typography & Code */}
          <div className="space-y-3 pt-2 border-t border-[#383838]">
            <div className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider">
              <Code size={14} className="text-[#007acc]" />
              <span>Typography & Formatting</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-[#aaaaaa]">Font Size ({fontSize}px)</Label>
                <Input
                  type="number"
                  min={10}
                  max={24}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value) || 14)}
                  className="bg-[#1e1e1e] border-[#454545] text-xs text-white h-8"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-[#aaaaaa]">Font Family</Label>
                <Select value={fontFamily} onValueChange={setFontFamily}>
                  <SelectTrigger className="bg-[#1e1e1e] border-[#454545] text-xs text-white h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#252526] border-[#454545] text-white">
                    <SelectItem value="JetBrains Mono" className="text-xs font-mono">JetBrains Mono</SelectItem>
                    <SelectItem value="Fira Code" className="text-xs font-mono">Fira Code</SelectItem>
                    <SelectItem value="Source Code Pro" className="text-xs font-mono">Source Code Pro</SelectItem>
                    <SelectItem value="Courier New" className="text-xs font-mono">Courier New</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Display & Behaviors */}
          <div className="space-y-3 pt-2 border-t border-[#383838]">
            <div className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider">
              <Sliders size={14} className="text-[#007acc]" />
              <span>Editor Features</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-[#aaaaaa]">Line Numbers</Label>
                <Select value={lineNumbers} onValueChange={(val: any) => setLineNumbers(val)}>
                  <SelectTrigger className="bg-[#1e1e1e] border-[#454545] text-xs text-white h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#252526] border-[#454545] text-white">
                    <SelectItem value="on" className="text-xs">Enabled</SelectItem>
                    <SelectItem value="off" className="text-xs">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-[#aaaaaa]">Word Wrap</Label>
                <Select value={wordWrap} onValueChange={(val: any) => setWordWrap(val)}>
                  <SelectTrigger className="bg-[#1e1e1e] border-[#454545] text-xs text-white h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#252526] border-[#454545] text-white">
                    <SelectItem value="on" className="text-xs">Enabled</SelectItem>
                    <SelectItem value="off" className="text-xs">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-[#aaaaaa]">Code Minimap</Label>
                <Select value={minimap ? 'yes' : 'no'} onValueChange={(val) => setMinimap(val === 'yes')}>
                  <SelectTrigger className="bg-[#1e1e1e] border-[#454545] text-xs text-white h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#252526] border-[#454545] text-white">
                    <SelectItem value="yes" className="text-xs">Shown</SelectItem>
                    <SelectItem value="no" className="text-xs">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-[#aaaaaa]">Auto-Format on Blur</Label>
                <Select value={autoFormat ? 'yes' : 'no'} onValueChange={(val) => setAutoFormat(val === 'yes')}>
                  <SelectTrigger className="bg-[#1e1e1e] border-[#454545] text-xs text-white h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#252526] border-[#454545] text-white">
                    <SelectItem value="yes" className="text-xs">Enabled (Prettier)</SelectItem>
                    <SelectItem value="no" className="text-xs">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            onClick={onClose}
            className="h-8 text-xs bg-[#007acc] hover:bg-[#007acc]/90 text-white"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
