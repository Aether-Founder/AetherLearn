import type { Metadata } from 'next';
import BinasViewer from '@/components/binas/BinasViewer';

export const metadata: Metadata = {
  title: 'Binas — Interactieve inhoud',
  description:
    'De volledige Binas (Zesde editie) met doorzoekbare inhoudsopgave en PDF-lezer.',
};

/**
 * De Binas is een Next.js pagina (geen losse HTML): de lezer draait als
 * client component, zodat lazy rendering, zoom, rotatie en thema
 * onmiddellijk reageren.  De PDF zelf staat als lossless page-chunks in
 * `public/binas/` (zie `scripts/build_binas_chunks.py`), zodat het project
 * binnen de deploylimieten van GitHub en Vercel blijft.
 */
export default function BinasPage() {
  return <BinasViewer />;
}
