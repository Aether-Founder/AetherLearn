import type { Metadata } from 'next';
import BinasViewer from '@/components/binas/BinasViewer';
import { getServerT } from '@/lib/i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return {
    title: t('subject_binas_title'),
    description: t('subject_binas_desc'),
  };
}

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
