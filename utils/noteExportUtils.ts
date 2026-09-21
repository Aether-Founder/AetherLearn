/**
 * Export utilities for notes with diagrams, mind maps, and drawings
 */

import { Drawing, Diagram, MindMap } from '@/types/filesystem';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface NoteExportOptions {
  format: 'txt' | 'pdf' | 'png' | 'jpg';
  includeDiagrams: boolean;
  includeMindMaps: boolean;
  includeDrawings: boolean;
}

/**
 * Export note as text
 */
export function exportNoteAsText(
  content: any,
  diagrams: Diagram[],
  mindMaps: MindMap[],
  drawings: Drawing[],
  filename: string
): void {
  let text = '';

  // Add text content
  if (content) {
    text += extractTextFromContent(content);
  }

  // Add diagrams
  if (diagrams.length > 0) {
    text += '\n\n=== DIAGRAMS ===\n';
    diagrams.forEach((diagram, index) => {
      text += `\n[Diagram ${index + 1}: ${diagram.type}]\n`;
    });
  }

  // Add mind maps
  if (mindMaps.length > 0) {
    text += '\n\n=== MIND MAPS ===\n';
    mindMaps.forEach((mindMap, index) => {
      text += `\n[Mind Map ${index + 1}]\n`;
      mindMap.nodes.forEach((node) => {
        text += `- ${node.text}\n`;
      });
    });
  }

  // Add drawings
  if (drawings.length > 0) {
    text += '\n\n=== DRAWINGS ===\n';
    drawings.forEach((drawing, index) => {
      text += `\n[Drawing ${index + 1}: ${drawing.type}]\n`;
    });
  }

  downloadFile(text, `${filename}.txt`, 'text/plain;charset=utf-8;');
}

/**
 * Export note as PDF
 */
export async function exportNoteAsPDF(
  element: HTMLElement,
  filename: string
): Promise<void> {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Failed to export PDF:', error);
    throw new Error('PDF export failed');
  }
}

/**
 * Export note as image
 */
export async function exportNoteAsImage(
  element: HTMLElement,
  filename: string,
  format: 'png' | 'jpg'
): Promise<void> {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const link = document.createElement('a');
    link.download = `${filename}.${format}`;
    link.href = canvas.toDataURL(`image/${format}`, 0.9);
    link.click();
  } catch (error) {
    console.error('Failed to export image:', error);
    throw new Error('Image export failed');
  }
}

/**
 * Extract text from BlockNote content
 */
function extractTextFromContent(content: any): string {
  if (!content) return '';

  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content.map(extractTextFromContent).join('\n');
  }

  if (content.type === 'text') {
    return content.content || '';
  }

  if (content.content) {
    return extractTextFromContent(content.content);
  }

  return '';
}

/**
 * Download file helper
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}