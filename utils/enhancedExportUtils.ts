interface Card {
  question: string;
  answer: string;
}

interface ExportOptions {
  format: 'csv' | 'txt' | 'json' | 'anki';
  termSeparator: string;
  pairSeparator: string;
  includeHeaders: boolean;
}

/**
 * Export cards with customizable separators
 */
export function exportCards(cards: Card[], options: ExportOptions, filename: string): void {
  let content: string;
  let mimeType: string;
  let extension: string;

  switch (options.format) {
    case 'csv':
      content = formatCSV(cards, options);
      mimeType = 'text/csv;charset=utf-8;';
      extension = 'csv';
      break;
    case 'txt':
      content = formatTXT(cards, options);
      mimeType = 'text/plain;charset=utf-8;';
      extension = 'txt';
      break;
    case 'json':
      content = formatJSON(cards);
      mimeType = 'application/json;charset=utf-8;';
      extension = 'json';
      break;
    case 'anki':
      content = formatAnki(cards);
      mimeType = 'text/plain;charset=utf-8;';
      extension = 'txt';
      break;
    default:
      throw new Error(`Unsupported format: ${options.format}`);
  }

  downloadFile(content, `${filename}.${extension}`, mimeType);
}

/**
 * Format cards as CSV with customizable separators
 */
function formatCSV(cards: Card[], options: ExportOptions): string {
  const { termSeparator, pairSeparator, includeHeaders } = options;

  // For CSV, we need to handle escaping properly
  const escapeField = (field: string): string => {
    if (field.includes(termSeparator) || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  };

  const lines: string[] = [];

  if (includeHeaders) {
    lines.push(`Question${termSeparator}Answer`);
  }

  cards.forEach((card) => {
    const escapedQuestion = escapeField(card.question);
    const escapedAnswer = escapeField(card.answer);
    lines.push(`${escapedQuestion}${termSeparator}${escapedAnswer}`);
  });

  return lines.join(pairSeparator);
}

/**
 * Format cards as plain text with customizable separators
 */
function formatTXT(cards: Card[], options: ExportOptions): string {
  const { termSeparator, pairSeparator, includeHeaders } = options;

  const lines: string[] = [];

  if (includeHeaders) {
    lines.push(`Question${termSeparator}Answer`);
  }

  cards.forEach((card) => {
    lines.push(`${card.question}${termSeparator}${card.answer}`);
  });

  return lines.join(pairSeparator);
}

/**
 * Format cards as JSON
 */
function formatJSON(cards: Card[]): string {
  return JSON.stringify(
    cards.map((card) => ({
      question: card.question,
      answer: card.answer,
    })),
    null,
    2
  );
}

/**
 * Format cards as Anki-compatible text (tab-separated with HTML line breaks)
 */
function formatAnki(cards: Card[]): string {
  return cards
    .map(
      (card) => `${card.question.replace(/\n/g, '<br>')}\t${card.answer.replace(/\n/g, '<br>')}`
    )
    .join('\n');
}

/**
 * Download file with given content
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

/**
 * Import cards from CSV with customizable separators
 */
export function importCardsCSV(content: string, options: ExportOptions): Card[] {
  const { termSeparator, pairSeparator, includeHeaders } = options;

  const lines = content.split(pairSeparator).filter((line) => line.trim());
  const cards: Card[] = [];

  const startIndex = includeHeaders ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(termSeparator);

    if (parts.length >= 2) {
      let question = parts[0].trim();
      let answer = parts[1].trim();

      // Remove quotes if present
      if (question.startsWith('"') && question.endsWith('"')) {
        question = question.slice(1, -1).replace(/""/g, '"');
      }
      if (answer.startsWith('"') && answer.endsWith('"')) {
        answer = answer.slice(1, -1).replace(/""/g, '"');
      }

      cards.push({ question, answer });
    }
  }

  return cards;
}

/**
 * Import cards from JSON
 */
export function importCardsJSON(content: string): Card[] {
  try {
    const data = JSON.parse(content);
    if (Array.isArray(data)) {
      return data.map((item) => ({
        question: item.question || item.term || '',
        answer: item.answer || item.definition || '',
      }));
    }
    return [];
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return [];
  }
}