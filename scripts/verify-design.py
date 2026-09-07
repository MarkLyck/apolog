#!/usr/bin/env python3
"""Capture Apolog's public routes and access gates with agent-browser.

Usage: python3 scripts/verify-design.py [http://localhost:3230]
Requires the app's configured backend and the agent-browser CLI.
No accounts, articles, or conversations are created.
"""

import json
from pathlib import Path
import subprocess
import sys
import time

BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3230"
OUTPUT = Path(__file__).resolve().parents[1] / ".context/site-design-review"
OUTPUT.mkdir(parents=True, exist_ok=True)
SESSION = "apolog-design-check"


def browser(*args):
    command = ["agent-browser", "--session", SESSION, *args]
    result = subprocess.run(command, capture_output=True, text=True, timeout=45)
    if result.returncode:
        raise RuntimeError(f"{args[0]} failed: {result.stderr or result.stdout}")
    return result.stdout.strip()


def evaluate(expression):
    result = json.loads(browser("eval", "--json", expression))
    if not result["success"]:
        raise RuntimeError(result["error"])
    return result["data"]["result"]


browser("open", f"{BASE_URL}/contradictions?text=bible")
article = evaluate('document.querySelector(\'a[href^="/articles/"]\')?.getAttribute("href")')
routes = [
    ("home", "/?text=bible"),
    ("contradictions", "/contradictions?text=bible"),
    ("debunked", "/debunked?text=bible"),
    ("immoral", "/immoral?text=bible"),
    ("evidence", "/evidence?text=bible"),
    ("silly", "/silly?text=bible"),
    ("quran", "/contradictions?text=quran"),
    ("empty-search", "/contradictions?text=bible&q=zzzxnonexistentxzzz"),
    ("debate", "/debate?text=bible"),
    ("login", "/login"),
    ("signup", "/signup"),
    ("editor-access", "/admin/articles"),
    ("new-article-access", "/admin/articles/new"),
    ("not-found", "/design-review-page-not-found"),
]
if article:
    routes.append(("article", article))

inspection = '''(() => {
  const headings = [...document.querySelectorAll("h1")];
  const elements = [...document.querySelectorAll("main a, main button, main input, main select, main textarea")];
  return {
    url: location.href,
    heading: headings[0]?.innerText ?? "",
    headingCount: headings.length,
    viewport: innerWidth,
    pageWidth: document.documentElement.scrollWidth,
    overflow: document.documentElement.scrollWidth > innerWidth,
    clippedControls: elements.filter(element => {
      const box = element.getBoundingClientRect();
      return box.width > 0 && (box.left < -1 || box.right > innerWidth + 1);
    }).map(element => element.getAttribute("aria-label") || element.textContent.trim().slice(0, 80)),
    failedImages: [...document.images].filter(image => image.complete && !image.naturalWidth).map(image => image.src),
    font: headings[0] ? getComputedStyle(headings[0]).fontFamily : null,
    background: getComputedStyle(document.body).backgroundColor,
  };
})()'''

results = []
for theme, width, height, suffix in [
    ("light", 1440, 1000, "desktop"),
    ("light", 390, 844, "mobile"),
    ("dark", 390, 844, "dark-mobile"),
    ("light", 768, 1024, "tablet"),
    ("light", 320, 740, "narrow"),
]:
    browser("set", "media", theme, "reduced-motion")
    browser("set", "viewport", str(width), str(height))
    selected = routes if suffix in {"desktop", "mobile"} else [route for route in routes if route[0] in {"contradictions", "article", "debate", "login"}]
    for name, route in selected:
        browser("open", f"{BASE_URL}{route}")
        for attempt in range(30):
            state = evaluate(inspection)
            if state["heading"]:
                break
            time.sleep(0.2)
        browser("screenshot", str(OUTPUT / f"{name}-{suffix}.png"))
        failed = state["overflow"] or state["clippedControls"] or state["failedImages"] or state["headingCount"] != 1 or state["heading"] == "The evidence is still here."
        result = {"name": name, "mode": suffix, "passed": not failed, **state}
        results.append(result)
        (OUTPUT / "results.json").write_text(json.dumps(results, indent=2) + "\n")
        print(f'{"FAIL" if failed else "PASS"} {name:20} {suffix:12} {state["heading"]}', flush=True)

failures = [result for result in results if not result["passed"]]
print(f"\n{len(results) - len(failures)}/{len(results)} page checks passed. Artifacts: {OUTPUT}")
sys.exit(bool(failures))
