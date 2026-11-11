import { NextResponse } from 'next/server';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET() {
  try {
    const booksDir = join(process.cwd(), 'content', 'books');
    
    // Check if books directory exists
    if (!existsSync(booksDir)) {
      return NextResponse.json({ version: '1.0', lastUpdated: '', books: [] });
    }

    const entries = await readdir(booksDir, { withFileTypes: true });
    const books: any[] = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const bookJsonPath = join(booksDir, entry.name, 'book.json');
        
        if (existsSync(bookJsonPath)) {
          try {
            const bookJson = await readFile(bookJsonPath, 'utf-8');
            const book = JSON.parse(bookJson);
            books.push(book);
          } catch (error) {
            console.error(`Error loading book from ${entry.name}:`, error);
          }
        }
      }
    }

    return NextResponse.json({
      version: '1.0',
      books
    });
  } catch (error) {
    console.error('Error scanning books directory:', error);
    return NextResponse.json({ version: '1.0', books: [] });
  }
}
