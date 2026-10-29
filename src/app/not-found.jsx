import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="p-8 rounded-2xl bg-[#080E1E] border border-[#152342] max-w-md w-full space-y-4">
        <span className="font-mono text-xs uppercase tracking-wider text-[#00D47E] px-2.5 py-1 rounded bg-[#00D47E]/10 border border-[#00D47E]/20">
          Error 404
        </span>
        <h1 className="text-2xl font-bold text-white">Page Not Found</h1>
        <p className="text-sm text-slate-400">
          The requested route does not exist or has been relocated.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00D47E] text-slate-950 font-semibold text-sm hover:bg-[#00D47E]/90 transition"
          >
            Return to Overview
          </Link>
        </div>
      </div>
    </div>
  );
}

