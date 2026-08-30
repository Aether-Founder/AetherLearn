export default function Loading() {
  return <main className="min-h-screen bg-[#f8f7f4] p-6"><div className="mx-auto max-w-6xl animate-pulse space-y-6"><div className="h-10 w-40 rounded-xl bg-[#e7e5df]" /><div className="grid gap-4 md:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-44 rounded-3xl bg-[#e7e5df]" />)}</div></div></main>;
}
