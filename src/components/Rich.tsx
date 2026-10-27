import { memo, useMemo } from "react";
import katex from "katex";

const cache = new Map<string, string>();

export function tex(src: string, display = false): string {
  const key = (display ? "D" : "I") + src;
  const hit = cache.get(key);
  if (hit) return hit;
  let html: string;
  try {
    html = katex.renderToString(src, { displayMode: display, throwOnError: false, strict: "ignore", trust: false, output: "html" });
  } catch {
    html = `<code>${escapeHtml(src)}</code>`;
  }
  cache.set(key, html);
  return html;
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Inline formatting: $math$, **bold**, *italic*, ==highlight==, `code`. Text is escaped first. */
const DOLLAR = "\u0000D\u0000";

function inline(raw: string): string {
  const s = raw.replace(/\\\$/g, DOLLAR); // "\$520" is money, not math
  const parts = s.split(/(\$[^$]+\$)/g);
  return parts
    .map((p) => {
      if (p.length > 2 && p.startsWith("$") && p.endsWith("$")) return tex(p.slice(1, -1));
      return escapeHtml(p)
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>")
        .replace(/==([^=]+)==/g, "<mark>$1</mark>")
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replaceAll(DOLLAR, "$");
    })
    .join("");
}

/** Block formatting: blank-line paragraphs, "- " bullet lists, $$display math$$. */
export function richHtml(raw: string): string {
  const out: string[] = [];
  const src = raw.replace(/\\\$/g, DOLLAR);
  const chunks = src.trim().split(/\n\s*\n/);
  for (const chunk of chunks) {
    const c = chunk.trim();
    if (c.startsWith("$$") && c.endsWith("$$") && c.length > 4) {
      out.push(tex(c.slice(2, -2).trim(), true));
      continue;
    }
    const lines = c.split("\n");
    if (lines.every((l) => /^\s*[-•]\s+/.test(l))) {
      out.push(`<ul>${lines.map((l) => `<li>${inline(l.replace(/^\s*[-•]\s+/, ""))}</li>`).join("")}</ul>`);
      continue;
    }
    // mixed: paragraphs that contain display math in the middle
    const segs = c.split(/(\$\$[^$]+\$\$)/g).filter((x) => x.trim());
    out.push(
      segs
        .map((seg) => (seg.startsWith("$$") ? tex(seg.slice(2, -2).trim(), true) : `<p>${seg.trim().split("\n").map(inline).join("<br/>")}</p>`))
        .join(""),
    );
  }
  return out.join("");
}

export const Rich = memo(function Rich({ text, className = "", as = "div" }: { text: string; className?: string; as?: "div" | "span" }) {
  const html = useMemo(() => (as === "span" ? inline(text) : richHtml(text)), [text, as]);
  const Tag = as;
  return <Tag className={`rich ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
});

export const Tex = memo(function Tex({ src, display = false, className = "" }: { src: string; display?: boolean; className?: string }) {
  const html = useMemo(() => tex(src, display), [src, display]);
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
});
