import Link from "next/link";

export default function NotFound() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center text-center px-6"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      <p
        className="text-[11px] uppercase tracking-[0.32em] font-semibold mb-4"
        style={{ color: "#CBA65C" }}
      >
        404 — Page not found
      </p>
      <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-4" style={{ color: "#E8E8E8" }}>
        This page took a detour.
      </h1>
      <p className="text-sm leading-relaxed mb-8 max-w-sm" style={{ color: "rgba(232,232,232,0.55)" }}>
        The link may be broken or the page may have moved. Let&rsquo;s get you back on the road.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-xl px-6 py-3 text-sm font-semibold tracking-tight transition-transform hover:-translate-y-0.5"
          style={{ backgroundColor: "#CBA65C", color: "#0a0a0a" }}
        >
          Back to home
        </Link>
        <a
          href="tel:0410532042"
          className="rounded-xl px-6 py-3 text-sm font-semibold tracking-tight transition-opacity hover:opacity-80"
          style={{ border: "1px solid rgba(203,166,92,0.3)", color: "#CBA65C" }}
        >
          Call 0410 532 042
        </a>
      </div>
    </main>
  );
}
