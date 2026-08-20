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
import { Settings, Check, Palette, Code, Sliders, Sun, Moon } from 'lucide-react';
import { THEME_PRESETS, ACCENT_COLORS, FONT_FAMILIES } from '@/lib/themeDefinitions';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    theme,
    setTheme,
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
    tabSize,
    setTabSize,
    autoFormat,
    setAutoFormat,
  } = useStore();

  const selectedThemeObj = THEME_PRESETS.find(t => t.id === themePreset) || THEME_PRESETS[0];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[560px] bg-[#1e1e1e] border-[#3e3e42] text-[#cccccc] shadow-2xl max-h-[88vh] overflow-y-auto">
        <DialogHeader className="gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#007acc]/20 border border-[#007acc]/30 flex items-center justify-center text-[#58a6ff]">
              <Settings size={18} />
            </div>
            <div>
              <DialogTitle className="text-white text-sm font-semibold">
                Playground Preferences & Themes
              </DialogTitle>
              <p className="text-[11px] text-zinc-400">Customize editor styling, typography, and developer workflows</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Appearance & Themes Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-white uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <Palette size={14} className="text-[#58a6ff]" />
                <span>Theme & Color Palette</span>
              </div>
              <span className="text-[11px] font-normal text-zinc-400 capitalize">
                {selectedThemeObj.category} mode
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-[#aaaaaa]">Syntax & Editor Theme</Label>
                <Select value={themePreset} onValueChange={(val: any) => setThemePreset(val)}>
                  <SelectTrigger className="bg-[#141416] border-[#3e3e42] text-xs text-white h-8.5">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#252526] border-[#3e3e42] text-white max-h-60">
                    <div className="px-2 py-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Dark Themes</div>
                    {THEME_PRESETS.filter(t => t.category === 'dark').map((t) => (
                      <SelectItem key={t.id} value={t.id} className="text-xs hover:bg-[#333333] cursor-pointer">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.accent }} />
                          <span>{t.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                    <div className="px-2 py-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-1 border-t border-[#333]">Light Themes</div>
                    {THEME_PRESETS.filter(t => t.category === 'light').map((t) => (
                      <SelectItem key={t.id} value={t.id} className="text-xs hover:bg-[#333333] cursor-pointer">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.accent }} />
                          <span>{t.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-[#aaaaaa]">Accent Tint</Label>
                <div className="flex items-center gap-1.5 h-8.5 overflow-x-auto py-1">
                  {ACCENT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      title={c.name}
                      onClick={() => setAccentColor(c.value)}
                      className="w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 border border-white/10 shrink-0 cursor-pointer"
                      style={{ backgroundColor: c.value }}
                    >
                      {accentColor === c.value && <Check size={12} className="text-white drop-shadow" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Typography & Formatting */}
          <div className="space-y-3 pt-2 border-t border-[#333338]">
            <div className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider">
              <Code size={14} className="text-[#58a6ff]" />
              <span>Typography & Indentation</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-[#aaaaaa]">Font Family</Label>
                <Select value={fontFamily} onValueChange={setFontFamily}>
                  <SelectTrigger className="bg-[#141416] border-[#3e3e42] text-xs text-white h-8.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#252526] border-[#3e3e42] text-white">
                    {FONT_FAMILIES.map(f => (
                      <SelectItem key={f.id} value={f.id} className="text-xs font-mono">
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-[#aaaaaa]">Font Size ({fontSize}px)</Label>
                <Input
                  type="number"
                  min={11}
                  max={24}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value) || 14)}
                  className="bg-[#141416] border-[#3e3e42] text-xs text-white h-8.5"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-[#aaaaaa]">Tab Size</Label>
                <Select value={String(tabSize || 2)} onValueChange={(v) => setTabSize(Number(v) || 2)}>
                  <SelectTrigger className="bg-[#141416] border-[#3e3e42] text-xs text-white h-8.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#252526] border-[#3e3e42] text-white">
                    <SelectItem value="2" className="text-xs">2 Spaces</SelectItem>
                    <SelectItem value="4" className="text-xs">4 Spaces</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Display & Behaviors */}
          <div className="space-y-3 pt-2 border-t border-[#333338]">
            <div className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider">
              <Sliders size={14} className="text-[#58a6ff]" />
              <span>Editor Behavior & Tools</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-[#aaaaaa]">Line Numbers</Label>
                <Select value={lineNumbers} onValueChange={(val: any) => setLineNumbers(val)}>
                  <SelectTrigger className="bg-[#141416] border-[#3e3e42] text-xs text-white h-8.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#252526] border-[#3e3e42] text-white">
                    <SelectItem value="on" className="text-xs">On</SelectItem>
                    <SelectItem value="off" className="text-xs">Off</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-[#aaaaaa]">Word Wrap</Label>
                <Select value={wordWrap} onValueChange={(val: any) => setWordWrap(val)}>
                  <SelectTrigger className="bg-[#141416] border-[#3e3e42] text-xs text-white h-8.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#252526] border-[#3e3e42] text-white">
                    <SelectItem value="on" className="text-xs">On</SelectItem>
                    <SelectItem value="off" className="text-xs">Off</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-[#aaaaaa]">Code Minimap</Label>
                <Select value={minimap ? 'yes' : 'no'} onValueChange={(val) => setMinimap(val === 'yes')}>
                  <SelectTrigger className="bg-[#141416] border-[#3e3e42] text-xs text-white h-8.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#252526] border-[#3e3e42] text-white">
                    <SelectItem value="yes" className="text-xs">Show</SelectItem>
                    <SelectItem value="no" className="text-xs">Hide</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-[#aaaaaa]">Auto-Format</Label>
                <Select value={autoFormat ? 'yes' : 'no'} onValueChange={(val) => setAutoFormat(val === 'yes')}>
                  <SelectTrigger className="bg-[#141416] border-[#3e3e42] text-xs text-white h-8.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#252526] border-[#3e3e42] text-white">
                    <SelectItem value="yes" className="text-xs">Enabled</SelectItem>
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
            className="h-8.5 px-4 text-xs bg-[#007acc] hover:bg-[#007acc]/90 text-white cursor-pointer"
          >
            Save Preferences
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
