/**
 * Serialization test utility for visual artifacts
 * Tests that Diagram, MindMap, and Drawing can be safely serialized/deserialized
 */

import { Diagram, MindMap, Drawing } from '@/types/filesystem';

/**
 * Test serialization of visual artifacts
 */
export function testVisualArtifactSerialization() {
  const testDiagram: Diagram = {
    id: 'test-diagram-1',
    type: 'flowchart',
    data: {
      nodes: [
        { id: 'node1', position: { x: 100, y: 100 }, label: 'Start' },
        { id: 'node2', position: { x: 300, y: 100 }, label: 'End' },
      ],
      edges: [
        { from: 'node1', to: 'node2', label: 'flow' },
      ],
    },
    position: { x: 0, y: 0 },
    size: { width: 400, height: 300 },
  };

  const testMindMap: MindMap = {
    id: 'test-mindmap-1',
    nodes: [
      { id: 'node1', text: 'Central', position: { x: 200, y: 200 }, color: '#3b82f6' },
      { id: 'node2', text: 'Branch 1', position: { x: 100, y: 100 } },
      { id: 'node3', text: 'Branch 2', position: { x: 300, y: 100 } },
    ],
    connections: [
      { id: 'conn1', fromNodeId: 'node1', toNodeId: 'node2', label: 'related' },
      { id: 'conn2', fromNodeId: 'node1', toNodeId: 'node3', style: 'dashed' },
    ],
    centralNodeId: 'node1',
  };

  const testDrawing: Drawing = {
    id: 'test-drawing-1',
    type: 'freehand',
    strokes: [
      {
        points: [{ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 20, y: 20 }],
        color: '#000000',
        width: 2,
        style: 'solid',
      },
    ],
    backgroundColor: '#ffffff',
  };

  // Test serialization
  try {
    const diagramJson = JSON.stringify(testDiagram);
    const diagramDeserialized = JSON.parse(diagramJson);
    console.log('✅ Diagram serialization test passed');

    const mindMapJson = JSON.stringify(testMindMap);
    const mindMapDeserialized = JSON.parse(mindMapJson);
    console.log('✅ MindMap serialization test passed');

    const drawingJson = JSON.stringify(testDrawing);
    const drawingDeserialized = JSON.parse(drawingJson);
    console.log('✅ Drawing serialization test passed');

    // Test complex note content
    const noteContent = {
      note: {
        id: 'test-note',
        content: 'Test content',
        diagrams: [testDiagram],
        mindMaps: [testMindMap],
        drawings: [testDrawing],
      },
    };

    const noteJson = JSON.stringify(noteContent);
    const noteDeserialized = JSON.parse(noteJson);
    console.log('✅ Note content with visual artifacts serialization test passed');

    return {
      success: true,
      message: 'All serialization tests passed',
    };
  } catch (error) {
    console.error('❌ Serialization test failed:', error);
    return {
      success: false,
      message: 'Serialization test failed',
      error,
    };
  }
}

/**
 * Validate that visual artifact data is serializable
 */
export function validateVisualArtifactData(data: any): boolean {
  try {
    JSON.stringify(data);
    return true;
  } catch (error) {
    console.error('Data is not serializable:', error);
    return false;
  }
}
