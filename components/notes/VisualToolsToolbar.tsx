'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Network, 
  Circle, 
  PenTool, 
  FileText
} from 'lucide-react';
import DiagramEditor from './DiagramEditor';
import MindMapEditor from './MindMapEditor';
import DrawingEditor from './DrawingEditor';
import { Diagram, MindMap, Drawing } from '@/types/filesystem';

interface VisualToolsToolbarProps {
  onAddDiagram: (diagram: Diagram) => void;
  onAddMindMap: (mindMap: MindMap) => void;
  onAddDrawing: (drawing: Drawing) => void;
  onExportText: () => void;
}

export default function VisualToolsToolbar({
  onAddDiagram,
  onAddMindMap,
  onAddDrawing,
  onExportText,
}: VisualToolsToolbarProps) {
  const [showDiagramDialog, setShowDiagramDialog] = useState(false);
  const [showMindMapDialog, setShowMindMapDialog] = useState(false);
  const [showDrawingDialog, setShowDrawingDialog] = useState(false);

  const handleAddDiagram = () => {
    const newDiagram: Diagram = {
      id: `diagram-${Date.now()}`,
      type: 'flowchart',
      data: {},
      position: { x: 0, y: 0 },
      size: { width: 400, height: 300 },
    };
    onAddDiagram(newDiagram);
    setShowDiagramDialog(false);
  };

  const handleAddMindMap = () => {
    const newMindMap: MindMap = {
      id: `mindmap-${Date.now()}`,
      nodes: [],
      connections: [],
      centralNodeId: '',
    };
    onAddMindMap(newMindMap);
    setShowMindMapDialog(false);
  };

  const handleAddDrawing = () => {
    const newDrawing: Drawing = {
      id: `drawing-${Date.now()}`,
      type: 'freehand',
      strokes: [],
    };
    onAddDrawing(newDrawing);
    setShowDrawingDialog(false);
  };



  return (
    <>
      <div className="flex items-center gap-2 border-b border-border bg-background px-4 py-2">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDiagramDialog(true)}
            className="flex items-center gap-2"
          >
            <Network className="h-4 w-4" />
            Diagram
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMindMapDialog(true)}
            className="flex items-center gap-2"
          >
            <Circle className="h-4 w-4" />
            Mind Map
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDrawingDialog(true)}
            className="flex items-center gap-2"
          >
            <PenTool className="h-4 w-4" />
            Drawing
          </Button>
        </div>

        <div className="h-6 w-px bg-border mx-2" />

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onExportText}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            TXT
          </Button>
        </div>
      </div>

      {/* Diagram Dialog */}
      {showDiagramDialog && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-4xl rounded-xl border border-border bg-background p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold">Create Diagram</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowDiagramDialog(false)}>
                Close
              </Button>
            </div>
            <DiagramEditor
              diagram={{
                id: 'temp',
                type: 'flowchart',
                data: {},
                position: { x: 0, y: 0 },
                size: { width: 400, height: 300 },
              }}
              onUpdate={() => {}}
              onDelete={() => {}}
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowDiagramDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddDiagram}>Add to Note</Button>
            </div>
          </div>
        </div>
      )}

      {/* Mind Map Dialog */}
      {showMindMapDialog && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-4xl rounded-xl border border-border bg-background p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold">Create Mind Map</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowMindMapDialog(false)}>
                Close
              </Button>
            </div>
            <MindMapEditor
              mindMap={{
                id: 'temp',
                nodes: [],
                connections: [],
                centralNodeId: '',
              }}
              onUpdate={() => {}}
              onDelete={() => {}}
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowMindMapDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMindMap}>Add to Note</Button>
            </div>
          </div>
        </div>
      )}

      {/* Drawing Dialog */}
      {showDrawingDialog && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-4xl rounded-xl border border-border bg-background p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold">Create Drawing</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowDrawingDialog(false)}>
                Close
              </Button>
            </div>
            <DrawingEditor
              drawing={{
                id: 'temp',
                type: 'freehand',
                strokes: [],
              }}
              onUpdate={() => {}}
              onDelete={() => {}}
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowDrawingDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddDrawing}>Add to Note</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}