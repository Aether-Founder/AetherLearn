'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Pencil, Square, Circle, Type, Eraser } from 'lucide-react';
import { Drawing, Stroke } from '@/types/filesystem';

interface DrawingEditorProps {
  drawing: Drawing;
  onUpdate: (drawing: Drawing) => void;
  onDelete: () => void;
}

type DrawingTool = 'freehand' | 'line' | 'rectangle' | 'circle' | 'text' | 'eraser';

export default function DrawingEditor({ drawing, onUpdate, onDelete }: DrawingEditorProps) {
  const [tool, setTool] = useState<DrawingTool>('freehand');
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStrokes, setCurrentStrokes] = useState<Stroke[]>(drawing.strokes || []);
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = containerRef.current?.offsetWidth || 800;
    canvas.height = 400;

    // Redraw existing strokes
    redrawCanvas(ctx);

    return () => {
      // Cleanup
    };
  }, [currentStrokes]);

  const redrawCanvas = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    currentStrokes.forEach((stroke) => {
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.style === 'dashed') {
        ctx.setLineDash([5, 5]);
      } else {
        ctx.setLineDash([]);
      }

      if (stroke.points.length > 0) {
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
      }

      ctx.stroke();
    });
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const coords = getCoordinates(e);
    setCurrentStroke([coords]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const coords = getCoordinates(e);
    setCurrentStroke((prev) => [...prev, coords]);

    // Draw current stroke
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    redrawCanvas(ctx);

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (currentStroke.length > 0) {
      ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
      for (let i = 1; i < currentStroke.length; i++) {
        ctx.lineTo(currentStroke[i].x, currentStroke[i].y);
      }
      ctx.lineTo(coords.x, coords.y);
    }

    ctx.stroke();
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;

    setIsDrawing(false);

    if (currentStroke.length > 0) {
      const newStroke: Stroke = {
        points: [...currentStroke, ...currentStroke],
        color: tool === 'eraser' ? '#FFFFFF' : color,
        width: tool === 'eraser' ? strokeWidth * 3 : strokeWidth,
        style: 'solid',
      };

      const updatedStrokes = [...currentStrokes, newStroke];
      setCurrentStrokes(updatedStrokes);

      onUpdate({
        ...drawing,
        strokes: updatedStrokes,
      });
    }

    setCurrentStroke([]);
  };

  const handleClear = () => {
    setCurrentStrokes([]);
    onUpdate({
      ...drawing,
      strokes: [],
    });

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleUndo = () => {
    if (currentStrokes.length === 0) return;

    const updatedStrokes = currentStrokes.slice(0, -1);
    setCurrentStrokes(updatedStrokes);

    onUpdate({
      ...drawing,
      strokes: updatedStrokes,
    });

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    redrawCanvas(ctx);
  };

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Select value={tool} onValueChange={(value: DrawingTool) => setTool(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="freehand">
                <div className="flex items-center gap-2">
                  <Pencil className="h-4 w-4" />
                  Freehand
                </div>
              </SelectItem>
              <SelectItem value="line">Line</SelectItem>
              <SelectItem value="rectangle">
                <div className="flex items-center gap-2">
                  <Square className="h-4 w-4" />
                  Rectangle
                </div>
              </SelectItem>
              <SelectItem value="circle">
                <div className="flex items-center gap-2">
                  <Circle className="h-4 w-4" />
                  Circle
                </div>
              </SelectItem>
              <SelectItem value="text">
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Text
                </div>
              </SelectItem>
              <SelectItem value="eraser">
                <div className="flex items-center gap-2">
                  <Eraser className="h-4 w-4" />
                  Eraser
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer"
            disabled={tool === 'eraser'}
          />

          <Select
            value={strokeWidth.toString()}
            onValueChange={(value) => setStrokeWidth(parseInt(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1px</SelectItem>
              <SelectItem value="2">2px</SelectItem>
              <SelectItem value="4">4px</SelectItem>
              <SelectItem value="8">8px</SelectItem>
              <SelectItem value="16">16px</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleUndo} disabled={currentStrokes.length === 0}>
            Undo
          </Button>
          <Button variant="outline" size="sm" onClick={handleClear}>
            Clear
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div ref={containerRef} className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="cursor-crosshair"
        />
      </div>
    </div>
  );
}