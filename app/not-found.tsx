import Link from 'next/link';

export default function NotFound() {
  return <main className="grid min-h-screen place-items-center bg-[#f8f7f4] p-6 text-center text-[#171b2b]"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6b7280]">Aether · 404</p><h1 className="mt-3 font-display text-4xl">Deze pagina bestaat niet</h1><p className="mt-3 text-[#4b5563]">Misschien is de link verouderd of verkeerd gekopieerd.</p><Link href="/" className="mt-6 inline-block rounded-xl bg-[#171b2b] px-5 py-3 text-sm font-semibold text-white">Naar je overzicht</Link></div></main>;
}
