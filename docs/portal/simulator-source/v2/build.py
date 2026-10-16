"""Build the frame UI (v2) from the engine in a source simulator file.
Usage: python3 v2/build.py SRC.html OUT.html [fragment.js ...]
Keeps fonts, engine, Track and all scenario builders untouched; swaps CSS, body markup and the app section."""
import sys, re, os
src, out, frags = sys.argv[1], sys.argv[2], sys.argv[3:]
here = os.path.dirname(os.path.abspath(__file__))
rd = lambda n: open(os.path.join(here, n), encoding='utf-8').read()
s = open(src, encoding='utf-8').read()

# 1 · CSS: from the layout comment to </style>
a = s.index('/* Layout:'); b = s.index('</style>')
s = s[:a] + rd('base.css') + rd('frame.css') + s[b:]

# 2 · body markup: from the wrap div to the script tag
a = s.index('<div class="wrap">'); b = s.index('<script>', a)
s = s[:a] + rd('body.html') + s[b:]

# 3 · app section: from the registry-adjacent state block to the end of the IIFE
a = s.index('/* ---------- app state, loop and controls ---------- */'); b = s.index('})();', a)
s = s[:a] + rd('app.js') + s[b:]

# 4 · government fragments
marker = '/* @@GOV_FRAGMENTS@@ */'
assert s.count(marker) == 1
code = '\n'.join(open(f, encoding='utf-8').read().rstrip() + '\n' for f in sorted(frags))
s = s.replace(marker, marker + '\n' + code)

open(out, 'w', encoding='utf-8').write(s)
js = re.search(r'<script>(.*)</script>', s, re.S).group(1)
open(out + '.js', 'w', encoding='utf-8').write(js)
print('built', out, len(s)//1024, 'KB,', len(frags), 'fragment(s)')
