'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus, Trash2, Zap } from 'lucide-react';
import { MindMap, MindMapNode, MindMapConnection } from '@/types/filesystem';

interface MindMapEditorProps {
  mindMap: MindMap;
  onUpdate: (mindMap: MindMap) => void;
  onDelete: () => void;
}

export default function MindMapEditor({ mindMap, onUpdate, onDelete }: MindMapEditorProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [newNodeText, setNewNodeText] = useState('');
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleAddNode = () => {
    if (!newNodeText.trim()) return;

    const newNode: MindMapNode = {
      id: `node-${Date.now()}`,
      text: newNodeText,
      position: {
        x: Math.random() * 400 + 50,
        y: Math.random() * 300 + 50,
      },
      color: getRandomColor(),
    };

    const updatedMindMap = {
      ...mindMap,
      nodes: [...mindMap.nodes, newNode],
    };

    // If we have a selected node, create a connection
    if (selectedNode) {
      const newConnection: MindMapConnection = {
        id: `conn-${Date.now()}`,
        fromNodeId: selectedNode,
        toNodeId: newNode.id,
        style: 'solid',
      };
      updatedMindMap.connections = [...mindMap.connections, newConnection];
    } else if (mindMap.nodes.length === 0) {
      // First node becomes central
      updatedMindMap.centralNodeId = newNode.id;
    }

    onUpdate(updatedMindMap);
    setNewNodeText('');
    setIsAddingNode(false);
    setSelectedNode(null);
  };

  const handleDeleteNode = (nodeId: string) => {
    const updatedMindMap = {
      ...mindMap,
      nodes: mindMap.nodes.filter((n) => n.id !== nodeId),
      connections: mindMap.connections.filter(
        (c) => c.fromNodeId !== nodeId && c.toNodeId !== nodeId
      ),
    };

    if (mindMap.centralNodeId === nodeId) {
      updatedMindMap.centralNodeId = updatedMindMap.nodes[0]?.id || '';
    }

    onUpdate(updatedMindMap);
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId);
  };



  const getRandomColor = () => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const renderMindMap = () => {
    if (mindMap.nodes.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <Zap className="h-12 w-12 mx-auto mb-2" />
            <p>Click "Add Node" to start your mind map</p>
          </div>
        </div>
      );
    }

    return (
      <div className="relative w-full h-full" style={{ minHeight: '400px' }}>
        {/* Render connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {mindMap.connections.map((connection) => {
            const fromNode = mindMap.nodes.find((n) => n.id === connection.fromNodeId);
            const toNode = mindMap.nodes.find((n) => n.id === connection.toNodeId);
            if (!fromNode || !toNode) return null;

            return (
              <line
                key={connection.id}
                x1={fromNode.position.x + 60}
                y1={fromNode.position.y + 20}
                x2={toNode.position.x + 60}
                y2={toNode.position.y + 20}
                stroke="#6B7280"
                strokeWidth="2"
                strokeDasharray={connection.style === 'dashed' ? '5,5' : undefined}
              />
            );
          })}
        </svg>

        {/* Render nodes */}
        {mindMap.nodes.map((node) => (
          <div
            key={node.id}
            className={`absolute cursor-pointer transition-all ${
              selectedNode === node.id ? 'ring-2 ring-blue-500' : ''
            } ${mindMap.centralNodeId === node.id ? 'z-10' : 'z-0'}`}
            style={{
              left: node.position.x,
              top: node.position.y,
              backgroundColor: node.color || '#3B82F6',
              padding: '12px 16px',
              borderRadius: '8px',
              color: 'white',
              fontWeight: mindMap.centralNodeId === node.id ? 'bold' : 'normal',
              fontSize: mindMap.centralNodeId === node.id ? '16px' : '14px',
              minWidth: '120px',
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
            onClick={() => handleNodeClick(node.id)}
            onDoubleClick={() => handleDeleteNode(node.id)}
          >
            {node.text}
            {selectedNode === node.id && (
              <Button
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteNode(node.id);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Mind Map</h3>
        <div className="flex gap-2">
          {!isAddingNode ? (
            <Button variant="outline" size="sm" onClick={() => setIsAddingNode(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Node
            </Button>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Node text..."
                value={newNodeText}
                onChange={(e) => setNewNodeText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNode()}
                className="w-40"
              />
              <Button size="sm" onClick={handleAddNode}>
                Add
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsAddingNode(false)}>
                Cancel
              </Button>
            </div>
          )}
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={canvasRef}
        className="min-h-[400px] border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 overflow-hidden"
      >
        {renderMindMap()}
      </div>

      {selectedNode && (
        <div className="mt-2 text-sm text-gray-600">
          Selected: {mindMap.nodes.find((n) => n.id === selectedNode)?.text}
          <Button
            variant="link"
            size="sm"
            onClick={() => {
              setIsAddingNode(true);
              setSelectedNode(selectedNode);
            }}
          >
            Connect to new node
          </Button>
        </div>
      )}
    </div>
  );
}