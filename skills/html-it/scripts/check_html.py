#!/usr/bin/env python3
"""Check an html-it page against the skill's hard rules.

Usage:
  python check_html.py PAGE.html [PAGE.html ...] [--allow ID,ID] [--max-mb 20]

Fails (exit 1) on: anything that would load from the network when the page is
opened (including inside iframe srcdoc sketches and src/href set from script), a missing doctype/lang/title/charset/viewport, an <img> without alt,
an opaque ID (F001, ABC-123, ...) with no References entry (id="ref-<ID>").
Warns on: unresolved ref chips, bare mentions of resolved IDs, large files.
Standard library only.
"""
from __future__ import annotations

import argparse
import os
import re
import sys
from dataclasses import dataclass, field
from html.parser import HTMLParser

REMOTE = r"(?:https?:|wss?:)?//"
IS_REMOTE = re.compile(r"^\s*" + REMOTE, re.I)
CSS_URL = re.compile(r"url\(\s*['\"]?\s*(" + REMOTE + r"[^'\")\s]+)", re.I)
CSS_IMPORT = re.compile(r"@import\s+(?:url\(\s*)?['\"]?\s*(" + REMOTE + r"[^'\")\s;]+)", re.I)
JS_NET = re.compile(
    r"\b(?:fetch|import|importScripts|EventSource|WebSocket|sendBeacon)\s*\(\s*"
    r"['\"`](" + REMOTE + r"[^'\"`]+)",
    re.I,
)
# XMLHttpRequest.open("GET", url). window.open(url) is navigation and is allowed.
XHR_OPEN = re.compile(
    r"\.open\s*\(\s*['\"](?:GET|POST|PUT|PATCH|DELETE|HEAD)['\"]\s*,\s*['\"`](" + REMOTE + r"[^'\"`]+)",
    re.I,
)
# Runtime loads: el.src = "https://...", el.href = "https://..." (location.href is navigation),
# el.setAttribute("src", "https://...").
JS_ASSIGN = re.compile(
    r"(?<!location)\.(?:src|srcset|href)\s*=\s*['\"`](" + REMOTE + r"[^'\"`]+)"
    r"|setAttribute\(\s*['\"]src['\"]\s*,\s*['\"`](" + REMOTE + r"[^'\"`]+)",
    re.I,
)
# Whole compound IDs: F001, ABC-123, BK-2026-0042, R26.11
ID_PATTERN = re.compile(r"\b[A-Z]{1,6}-?\d{2,6}(?:[-.]\d{1,6})*\b")

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link",
        "meta", "source", "track", "wbr", "param"}
SKIP_TEXT = {"script", "style", "code", "pre", "kbd", "samp", "head", "svg", "math"}
# tag -> attributes that make the browser fetch something
LOADING_ATTRS = {
    "script": ("src",), "link": ("href",), "img": ("src", "srcset"),
    "source": ("src", "srcset"), "video": ("src", "poster"), "audio": ("src",),
    "iframe": ("src",), "embed": ("src",), "object": ("data",), "track": ("src",),
    "input": ("src",), "image": ("href", "xlink:href"), "use": ("href", "xlink:href"),
    "feimage": ("href", "xlink:href"),
}


@dataclass
class Result:
    failures: list = field(default_factory=list)
    warnings: list = field(default_factory=list)


class _Scanner(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []          # (tag, skips_text)
        self.ids = set()
        self.chips = []          # (ref, status)
        self.bare = []           # IDs seen in visible text outside chips
        self.remote = []         # (where, url)
        self.code_text = []      # script/style bodies for CSS/JS scanning
        self.srcdocs = []        # iframe srcdoc documents, checked recursively for network loads
        self.allow = set()
        self.lang = None
        self.title = ""
        self.has_charset = False
        self.has_viewport = False
        self.img_without_alt = 0
        self._in_title = False
        self._in_raw = None

    def _skipping(self):
        return any(skip for _, skip in self.stack)

    def _attrs(self, tag, attrs):
        a = {k.lower(): (v or "") for k, v in attrs}
        if "id" in a:
            self.ids.add(a["id"])
        if tag == "html":
            self.lang = a.get("lang", "").strip()
        if tag == "meta":
            if "charset" in a or a.get("http-equiv", "").lower() == "content-type":
                self.has_charset = True
            if a.get("name", "").lower() == "viewport":
                self.has_viewport = True
            if a.get("name", "").lower() == "html-it:allow-ids":
                self.allow |= {x.strip() for x in a.get("content", "").split(",") if x.strip()}
        if tag == "img" and "alt" not in a:
            self.img_without_alt += 1
        for attr in LOADING_ATTRS.get(tag, ()):
            value = a.get(attr, "")
            for part in value.split(","):
                if IS_REMOTE.match(part):
                    self.remote.append((f"<{tag} {attr}>", part.strip().split(" ")[0]))
        if "style" in a:
            self.code_text.append(a["style"])
        if tag == "iframe" and a.get("srcdoc"):
            self.srcdocs.append(a["srcdoc"])  # HTMLParser has already unescaped &quot; etc.
        if "data-ref" in a:
            self.chips.append((a["data-ref"].strip(), a.get("data-ref-status", "").strip()))
        return a

    def handle_starttag(self, tag, attrs):
        a = self._attrs(tag, attrs)
        if tag in VOID:
            return
        skips = (tag in SKIP_TEXT or "data-ref" in a or "data-no-ref" in a
                 or a.get("id", "").startswith("ref-"))
        self.stack.append((tag, skips))
        if tag == "title":
            self._in_title = True
        if tag in ("script", "style"):
            self._in_raw = tag

    def handle_startendtag(self, tag, attrs):
        self._attrs(tag, attrs)

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
        if tag in ("script", "style"):
            self._in_raw = None
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break

    def handle_data(self, data):
        if self._in_title:
            self.title += data
        if self._in_raw:
            self.code_text.append(data)
            return
        if not self._skipping():
            self.bare.extend(ID_PATTERN.findall(data))


NET_RULES = ((CSS_URL, "CSS url()"), (CSS_IMPORT, "CSS @import"), (JS_NET, "script request"),
             (XHR_OPEN, "XMLHttpRequest"), (JS_ASSIGN, "script-set src/href"))


def _network_failures(s: _Scanner, prefix: str = "") -> list:
    out = [f"network: {prefix}{where} loads {url} (inline it or draw it; pages must work offline)"
           for where, url in s.remote]
    code = "\n".join(s.code_text)
    for rx, label in NET_RULES:
        for m in rx.findall(code):
            url = next(g for g in m if g) if isinstance(m, tuple) else m
            out.append(f"network: {prefix}{label} loads {url} (pages must work offline; "
                       "a clickable link belongs in the HTML as <a href>)")
    for doc in s.srcdocs:
        sub = _Scanner()
        sub.feed(doc)
        sub.close()
        out += _network_failures(sub, prefix + "inside iframe srcdoc: ")
    return out


def check(html: str, size_bytes: int = 0, allow=(), max_mb: float = 20) -> Result:
    r = Result()
    s = _Scanner()
    s.feed(html)
    s.close()
    allowed = s.allow | {x.strip() for x in allow}

    if not re.match(r"^\s*(?:<!--.*?-->\s*)*<!doctype html", html, re.I | re.S):
        r.failures.append("structure: missing <!doctype html> at the top")
    if not s.lang:
        r.failures.append('structure: <html> has no lang attribute (for example lang="en")')
    if not s.title.strip():
        r.failures.append("structure: missing or empty <title>")
    if not s.has_charset:
        r.failures.append('structure: missing <meta charset="utf-8">')
    if not s.has_viewport:
        r.failures.append("structure: missing viewport <meta>")
    if s.img_without_alt:
        r.failures.append(f"accessibility: {s.img_without_alt} <img> without alt (use alt=\"\" if decorative)")

    r.failures += _network_failures(s)

    for ref, status in s.chips:
        if status == "unresolved":
            r.warnings.append(f"reference: {ref} is marked unresolved; tell the user")
        elif f"ref-{ref}" not in s.ids:
            r.failures.append(f'reference: chip {ref} has no References entry (add id="ref-{ref}")')
    for ref in sorted(set(s.bare) - allowed):
        if f"ref-{ref}" in s.ids:
            r.warnings.append(f"reference: {ref} appears as plain text; consider a ref chip")
        elif ref not in {c for c, _ in s.chips}:
            r.failures.append(
                f'reference: bare {ref} is never explained (wrap it in a ref chip and add id="ref-{ref}" '
                "to the References section, or allow it if it is not a reference)"
            )

    if size_bytes and size_bytes > max_mb * 1024 * 1024:
        r.warnings.append(f"size: {size_bytes / 1048576:.1f} MB exceeds {max_mb} MB; consider multi-part")
    return r


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description="Check html-it pages.")
    p.add_argument("pages", nargs="+")
    p.add_argument("--allow", default="", help="comma-separated tokens that are not references")
    p.add_argument("--max-mb", type=float, default=20)
    args = p.parse_args(argv)
    allow = [x for x in args.allow.split(",") if x.strip()]
    failed = False
    for path in args.pages:
        if not os.path.isfile(path):
            print(f"FAIL {path}: file not found")
            failed = True
            continue
        with open(path, encoding="utf-8") as f:
            html = f.read()
        size = os.path.getsize(path)
        r = check(html, size_bytes=size, allow=allow, max_mb=args.max_mb)
        for msg in r.failures:
            print(f"FAIL {path}: {msg}")
        for msg in r.warnings:
            print(f"WARN {path}: {msg}")
        status = "FAIL" if r.failures else "PASS"
        print(f"{status} {path} ({size / 1024:.0f} KB, {len(r.failures)} failures, {len(r.warnings)} warnings)")
        failed = failed or bool(r.failures)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
