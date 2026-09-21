'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
  cardCount: number;
}

export interface ExportOptions {
  format: 'csv' | 'txt' | 'json' | 'anki';
  termSeparator: string;
  pairSeparator: string;
  includeHeaders: boolean;
}

const PRESET_SEPARATORS = {
  comma: ',',
  tab: '\t',
  pipe: '|',
  semicolon: ';',
  colon: ':',
  dash: '-',
  equals: '=',
  space: ' ',
};

const PRESET_PAIR_SEPARATORS = {
  newline: '\n',
  semicolon_newline: ';\n',
  comma_newline: ',\n',
  tab_newline: '\t\n',
};

export default function ExportDialog({ open, onClose, onExport, cardCount }: ExportDialogProps) {
  const [format, setFormat] = useState<'csv' | 'txt' | 'json' | 'anki'>('csv');
  const [termSeparator, setTermSeparator] = useState(',');
  const [pairSeparator, setPairSeparator] = useState('\n');
  const [customTermSeparator, setCustomTermSeparator] = useState('');
  const [customPairSeparator, setCustomPairSeparator] = useState('');
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [useCustomTerm, setUseCustomTerm] = useState(false);
  const [useCustomPair, setUseCustomPair] = useState(false);

  const handleExport = () => {
    const finalTermSeparator = useCustomTerm ? customTermSeparator : termSeparator;
    const finalPairSeparator = useCustomPair ? customPairSeparator : pairSeparator;

    onExport({
      format,
      termSeparator: finalTermSeparator,
      pairSeparator: finalPairSeparator,
      includeHeaders,
    });
    onClose();
  };

  const handleTermSeparatorChange = (value: string) => {
    if (value === 'custom') {
      setUseCustomTerm(true);
    } else {
      setUseCustomTerm(false);
      setTermSeparator(PRESET_SEPARATORS[value as keyof typeof PRESET_SEPARATORS]);
    }
  };

  const handlePairSeparatorChange = (value: string) => {
    if (value === 'custom') {
      setUseCustomPair(true);
    } else {
      setUseCustomPair(false);
      setPairSeparator(PRESET_PAIR_SEPARATORS[value as keyof typeof PRESET_PAIR_SEPARATORS]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export {cardCount} Cards</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="format">Export Format</Label>
            <Select value={format} onValueChange={(value: 'csv' | 'txt' | 'json') => setFormat(value)}>
              <SelectTrigger id="format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (Comma Separated)</SelectItem>
                <SelectItem value="txt">TXT (Plain Text)</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {format !== 'json' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="term-separator">Term-Definition Separator</Label>
                <Select
                  value={useCustomTerm ? 'custom' : Object.keys(PRESET_SEPARATORS).find(key => PRESET_SEPARATORS[key as keyof typeof PRESET_SEPARATORS] === termSeparator) || 'comma'}
                  onValueChange={handleTermSeparatorChange}
                >
                  <SelectTrigger id="term-separator">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comma">Comma (,)</SelectItem>
                    <SelectItem value="tab">Tab (→)</SelectItem>
                    <SelectItem value="pipe">Pipe (|)</SelectItem>
                    <SelectItem value="semicolon">Semicolon (;)</SelectItem>
                    <SelectItem value="colon">Colon (:)</SelectItem>
                    <SelectItem value="dash">Dash (-)</SelectItem>
                    <SelectItem value="equals">Equals (=)</SelectItem>
                    <SelectItem value="space">Space ( )</SelectItem>
                    <SelectItem value="custom">Custom...</SelectItem>
                  </SelectContent>
                </Select>
                {useCustomTerm && (
                  <Input
                    placeholder="Enter custom separator"
                    value={customTermSeparator}
                    onChange={(e) => setCustomTermSeparator(e.target.value)}
                    className="mt-2"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pair-separator">Card Pair Separator (New Line)</Label>
                <Select
                  value={useCustomPair ? 'custom' : Object.keys(PRESET_PAIR_SEPARATORS).find(key => PRESET_PAIR_SEPARATORS[key as keyof typeof PRESET_PAIR_SEPARATORS] === pairSeparator) || 'newline'}
                  onValueChange={handlePairSeparatorChange}
                >
                  <SelectTrigger id="pair-separator">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newline">New Line (\\n)</SelectItem>
                    <SelectItem value="semicolon_newline">Semicolon + New Line (;\\n)</SelectItem>
                    <SelectItem value="comma_newline">Comma + New Line (,\\n)</SelectItem>
                    <SelectItem value="tab_newline">Tab + New Line (→\\n)</SelectItem>
                    <SelectItem value="custom">Custom...</SelectItem>
                  </SelectContent>
                </Select>
                {useCustomPair && (
                  <Input
                    placeholder="Enter custom separator"
                    value={customPairSeparator}
                    onChange={(e) => setCustomPairSeparator(e.target.value)}
                    className="mt-2"
                  />
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="include-headers"
                  checked={includeHeaders}
                  onChange={(e) => setIncludeHeaders(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="include-headers" className="cursor-pointer">
                  Include Headers (Question, Answer)
                </Label>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}