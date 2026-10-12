#!/usr/bin/env python3
"""Generate resume.html and assets/Omar-Sharaf-Resume.pdf from resume.json.

Usage: python3 scripts/build_resume.py [--no-pdf]
PDF export uses headless Chromium (CHROME env var overrides the binary path).
"""
import json, os, shutil, subprocess, sys
from html import escape as e
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
d = json.loads((ROOT / "resume.json").read_text())

def dates(x): return f'{e(x["start"])} – {e(x["end"])}'

skills = "\n".join(
    f'<li><span class="k">{e(s["label"])}:</span> {e(", ".join(s["items"]))}</li>' for s in d["skills"])
jobs = "\n".join(f'''<article class="job">
  <div class="row"><h3>{e(j["title"])}</h3><span class="date">{dates(j)}</span></div>
  <div class="row sub"><span>{e(j["company"])}</span><span>{e(j["location"])}</span></div>
  <ul>{"".join(f"<li>{e(b)}</li>" for b in j["bullets"])}</ul>
</article>''' for j in d["experience"])
edu = "\n".join(f'''<div class="row"><span><strong>{e(x["degree"])}</strong>, {e(x["school"])}</span><span class="date">{dates(x)}</span></div>''' for x in d["education"])
certs = "\n".join(f'''<div class="row"><span><strong>{e(c["name"])}</strong>, {e(c["issuer"])}</span><span class="date">{e(c["date"])}</span></div>''' for c in d["certifications"])

ld = {"@context": "https://schema.org", "@type": "Person", "name": d["name"], "jobTitle": d["headline"],
      "email": "mailto:" + d["email"], "url": d["website"], "sameAs": [d["linkedin"]],
      "address": {"@type": "PostalAddress", "addressLocality": "Hartford", "addressRegion": "CT", "addressCountry": "US"},
      "worksFor": {"@type": "Organization", "name": d["experience"][0]["company"]}}

html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{e(d["name"])} — Resume | {e(d["headline"])}</title>
<meta name="description" content="Resume of {e(d["name"])}, {e(d["headline"])}.">
<link rel="canonical" href="https://omarsharaf.com/resume.html">
<script type="application/ld+json">{json.dumps(ld)}</script>
<style>
@page {{ size: Letter; margin: 0.42in 0.55in; }}
:root {{ --ink:#111827; --muted:#4b5563; --accent:#1d4ed8; --rule:#d1d5db; }}
* {{ box-sizing:border-box; }}
body {{ margin:0; background:#f3f4f6; color:var(--ink); font:10.3pt/1.35 -apple-system,"Segoe UI",Helvetica,Arial,sans-serif; }}
.sheet {{ max-width:8.5in; margin:1rem auto; padding:0.5in 0.55in; background:#fff; }}
header {{ border-bottom:2px solid var(--accent); padding-bottom:.5rem; margin-bottom:.6rem; }}
h1 {{ font-size:22pt; margin:0; letter-spacing:.2px; }}
.headline {{ font-size:11.5pt; color:var(--accent); font-weight:600; margin:.1rem 0 .3rem; }}
.contact {{ color:var(--muted); font-size:9.5pt; }}
.contact a {{ color:inherit; text-decoration:none; }}
h2 {{ font-size:10.5pt; text-transform:uppercase; letter-spacing:1px; color:var(--accent); border-bottom:1px solid var(--rule); padding-bottom:2px; margin:.8rem 0 .4rem; }}
h3 {{ font-size:10.5pt; margin:0; }}
p {{ margin:0; }}
ul {{ margin:.2rem 0 0; padding-left:1.1rem; }}
li {{ margin:.1rem 0; }}
.skills {{ list-style:none; padding:0; }} .k {{ font-weight:600; }}
.row {{ display:flex; justify-content:space-between; gap:1rem; }}
.date {{ white-space:nowrap; color:var(--muted); }}
.sub {{ color:var(--muted); font-size:9.5pt; }}
.job {{ margin-bottom:.55rem; break-inside:avoid; }}
@media print {{ body {{ background:#fff; }} .sheet {{ margin:0; padding:0; max-width:none; }} a {{ color:inherit; }} }}
@media (max-width:600px) {{ .row {{ flex-direction:column; gap:0; }} .sheet {{ padding:1rem; }} }}
</style>
</head>
<body>
<main class="sheet">
<header>
  <h1>{e(d["name"])}</h1>
  <div class="headline">{e(d["headline"])}</div>
  <div class="contact">{e(d["location"])} · {e(d["availability"])} · <a href="mailto:{e(d["email"])}">{e(d["email"])}</a> · <a href="{e(d["linkedin"])}">{e(d["linkedin"].replace("https://www.", ""))}</a> · <a href="{e(d["website"])}">{e(d["website"].replace("https://", ""))}</a></div>
</header>
<section><h2>Summary</h2><p>{e(d["summary"])}</p></section>
<section><h2>Core Skills</h2><ul class="skills">
{skills}
</ul></section>
<section><h2>Experience</h2>
{jobs}
</section>
<section><h2>Education</h2>
{edu}
</section>
<section><h2>Certifications</h2>
{certs}
</section>
</main>
</body>
</html>
'''
(ROOT / "resume.html").write_text(html)
print("wrote resume.html")

if "--no-pdf" in sys.argv: sys.exit()
chrome = os.environ.get("CHROME") or shutil.which("chromium") or shutil.which("google-chrome") \
    or "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
out = ROOT / "assets" / "Omar-Sharaf-Resume.pdf"
subprocess.run([chrome, "--headless", "--no-sandbox", "--disable-gpu", "--no-pdf-header-footer",
                f"--print-to-pdf={out}", (ROOT / "resume.html").as_uri()], check=True,
               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
print("wrote", out.relative_to(ROOT))
