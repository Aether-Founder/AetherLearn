'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Move } from 'lucide-react';
import { Diagram } from '@/types/filesystem';

interface DiagramEditorProps {
  diagram: Diagram;
  onUpdate: (diagram: Diagram) => void;
  onDelete: () => void;
}

type DiagramType = 'flowchart' | 'sequence' | 'class' | 'entity';

export default function DiagramEditor({ diagram, onUpdate, onDelete }: DiagramEditorProps) {
  const [selectedType, setSelectedType] = useState<DiagramType>(diagram.type);
  const [isEditing, setIsEditing] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleTypeChange = (type: DiagramType) => {
    setSelectedType(type);
    onUpdate({ ...diagram, type });
  };

  const renderDiagram = () => {
    switch (selectedType) {
      case 'flowchart':
        return renderFlowchart();
      case 'sequence':
        return renderSequence();
      case 'class':
        return renderClass();
      case 'entity':
        return renderEntity();
      default:
        return <div>Select a diagram type</div>;
    }
  };

  const renderFlowchart = () => {
    // Simple flowchart representation
    return (
      <div className="space-y-4">
        <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50 text-center">
          Start
        </div>
        <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50 text-center">
          Process
        </div>
        <div className="border-2 border-red-500 rounded-lg p-4 bg-red-50 text-center">
          Decision
        </div>
        <div className="border-2 border-purple-500 rounded-lg p-4 bg-purple-50 text-center">
          End
        </div>
      </div>
    );
  };

  const renderSequence = () => {
    return (
      <div className="space-y-4">
        <div className="border-l-4 border-blue-500 pl-4">
          <div className="font-semibold">Actor 1</div>
          <div className="text-sm text-gray-600">Action 1</div>
        </div>
        <div className="border-l-4 border-green-500 pl-4">
          <div className="font-semibold">Actor 2</div>
          <div className="text-sm text-gray-600">Action 2</div>
        </div>
        <div className="border-l-4 border-purple-500 pl-4">
          <div className="font-semibold">Actor 1</div>
          <div className="text-sm text-gray-600">Response</div>
        </div>
      </div>
    );
  };

  const renderClass = () => {
    return (
      <div className="grid grid-cols-3 gap-4">
        <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
          <div className="font-semibold text-center mb-2">Class A</div>
          <div className="text-sm border-t pt-2">+ method1()</div>
          <div className="text-sm">+ method2()</div>
        </div>
        <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50">
          <div className="font-semibold text-center mb-2">Class B</div>
          <div className="text-sm border-t pt-2">+ method1()</div>
          <div className="text-sm">+ method3()</div>
        </div>
        <div className="border-2 border-purple-500 rounded-lg p-4 bg-purple-50">
          <div className="font-semibold text-center mb-2">Class C</div>
          <div className="text-sm border-t pt-2">+ method4()</div>
          <div className="text-sm">+ method5()</div>
        </div>
      </div>
    );
  };

  const renderEntity = () => {
    return (
      <div className="space-y-4">
        <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
          <div className="font-semibold">Entity 1</div>
          <div className="text-sm text-gray-600">PK: id</div>
          <div className="text-sm text-gray-600">name: string</div>
        </div>
        <div className="text-center text-gray-400">↔</div>
        <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50">
          <div className="font-semibold">Entity 2</div>
          <div className="text-sm text-gray-600">PK: id</div>
          <div className="text-sm text-gray-600">entity1_id: FK</div>
        </div>
      </div>
    );
  };

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Select value={selectedType} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flowchart">Flowchart</SelectItem>
              <SelectItem value="sequence">Sequence</SelectItem>
              <SelectItem value="class">Class Diagram</SelectItem>
              <SelectItem value="entity">Entity Relation</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Move className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={canvasRef}
        className="min-h-[300px] border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50"
      >
        {renderDiagram()}
      </div>
    </div>
  );
}