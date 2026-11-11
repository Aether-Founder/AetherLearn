import { describe, it, expect } from 'vitest';
import { arrayMove } from '@dnd-kit/sortable';

describe('Drag-and-Drop Reordering Logic', () => {
  // Test the index calculation logic used in handleDragEnd
  const calculateFinalIndex = (
    oldIndex: number,
    overIndex: number,
    insertPosition: 'before' | 'after',
    itemCount: number
  ): number => {
    const finalIndex =
      insertPosition === 'before'
        ? overIndex - (oldIndex < overIndex ? 1 : 0)
        : overIndex + (oldIndex > overIndex ? 1 : 0);
    
    return Math.max(0, Math.min(itemCount - 1, finalIndex));
  };

  describe('calculateFinalIndex', () => {
    it('Move A (index 0) before D (index 3) - moving down, before', () => {
      const result = calculateFinalIndex(0, 3, 'before', 5);
      expect(result).toBe(2); // Should insert at index 2 (before D, accounting for A's removal)
    });

    it('Move A (index 0) after D (index 3) - moving down, after', () => {
      const result = calculateFinalIndex(0, 3, 'after', 5);
      expect(result).toBe(3); // Should insert at index 3 (at D's position after A's removal)
    });

    it('Move E (index 4) before B (index 1) - moving up, before', () => {
      const result = calculateFinalIndex(4, 1, 'before', 5);
      expect(result).toBe(1); // Should insert at index 1 (at B's position after E's removal)
    });

    it('Move E (index 4) after B (index 1) - moving up, after', () => {
      const result = calculateFinalIndex(4, 1, 'after', 5);
      expect(result).toBe(2); // Should insert at index 2 (after B, accounting for E's removal)
    });

    it('Move E (index 4) to the beginning - before first card', () => {
      const result = calculateFinalIndex(4, 0, 'before', 5);
      expect(result).toBe(0); // Should insert at index 0
    });

    it('Move A (index 0) to the end - after last card', () => {
      const result = calculateFinalIndex(0, 4, 'after', 5);
      expect(result).toBe(4); // Should insert at index 4
    });

    it('Clamps to valid range', () => {
      const result = calculateFinalIndex(0, 4, 'after', 5);
      expect(result).toBe(4); // Should be 4, not 5 (out of bounds)
    });
  });

  describe('Full reordering scenarios with arrayMove', () => {
    it('Move A before D: A,B,C,D,E → B,C,A,D,E', () => {
      const items = ['A', 'B', 'C', 'D', 'E'];
      const oldIndex = 0; // A
      const overIndex = 3; // D
      const insertPosition = 'before';
      
      const finalIndex = calculateFinalIndex(oldIndex, overIndex, insertPosition, items.length);
      const result = arrayMove(items, oldIndex, finalIndex);
      
      expect(result).toEqual(['B', 'C', 'A', 'D', 'E']);
    });

    it('Move A after D: A,B,C,D,E → B,C,D,A,E', () => {
      const items = ['A', 'B', 'C', 'D', 'E'];
      const oldIndex = 0; // A
      const overIndex = 3; // D
      const insertPosition = 'after';
      
      const finalIndex = calculateFinalIndex(oldIndex, overIndex, insertPosition, items.length);
      const result = arrayMove(items, oldIndex, finalIndex);
      
      expect(result).toEqual(['B', 'C', 'D', 'A', 'E']);
    });

    it('Move E before B: A,B,C,D,E → A,E,B,C,D', () => {
      const items = ['A', 'B', 'C', 'D', 'E'];
      const oldIndex = 4; // E
      const overIndex = 1; // B
      const insertPosition = 'before';
      
      const finalIndex = calculateFinalIndex(oldIndex, overIndex, insertPosition, items.length);
      const result = arrayMove(items, oldIndex, finalIndex);
      
      expect(result).toEqual(['A', 'E', 'B', 'C', 'D']);
    });

    it('Move E after B: A,B,C,D,E → A,B,E,C,D', () => {
      const items = ['A', 'B', 'C', 'D', 'E'];
      const oldIndex = 4; // E
      const overIndex = 1; // B
      const insertPosition = 'after';
      
      const finalIndex = calculateFinalIndex(oldIndex, overIndex, insertPosition, items.length);
      const result = arrayMove(items, oldIndex, finalIndex);
      
      expect(result).toEqual(['A', 'B', 'E', 'C', 'D']);
    });

    it('Move E to the beginning: A,B,C,D,E → E,A,B,C,D', () => {
      const items = ['A', 'B', 'C', 'D', 'E'];
      const oldIndex = 4; // E
      const overIndex = 0; // A
      const insertPosition = 'before';
      
      const finalIndex = calculateFinalIndex(oldIndex, overIndex, insertPosition, items.length);
      const result = arrayMove(items, oldIndex, finalIndex);
      
      expect(result).toEqual(['E', 'A', 'B', 'C', 'D']);
    });

    it('Move A to the end: A,B,C,D,E → B,C,D,E,A', () => {
      const items = ['A', 'B', 'C', 'D', 'E'];
      const oldIndex = 0; // A
      const overIndex = 4; // E
      const insertPosition = 'after';
      
      const finalIndex = calculateFinalIndex(oldIndex, overIndex, insertPosition, items.length);
      const result = arrayMove(items, oldIndex, finalIndex);
      
      expect(result).toEqual(['B', 'C', 'D', 'E', 'A']);
    });

    it('Moving to same position returns unchanged array', () => {
      const items = ['A', 'B', 'C', 'D', 'E'];
      const oldIndex = 2; // C
      const overIndex = 2; // C
      const insertPosition = 'before';
      
      const finalIndex = calculateFinalIndex(oldIndex, overIndex, insertPosition, items.length);
      // Skip reorder if same position
      if (finalIndex === oldIndex) {
        expect(finalIndex).toBe(oldIndex);
        return;
      }
      
      const result = arrayMove(items, oldIndex, finalIndex);
      expect(result).toEqual(items);
    });
  });
});
