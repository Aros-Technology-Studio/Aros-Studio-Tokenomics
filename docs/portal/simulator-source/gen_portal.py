import sys
src, out = sys.argv[1], sys.argv[2]
s=open(src,encoding='utf-8').read()
a='<div class="eyebrow">Aros Technologic · AFC &amp; AST</div>'
assert s.count(a)==1
s=s.replace(a,'<div class="eyebrow"><a href="/technologic">Aros Technologic</a> · AFC &amp; AST</div>')
assert s.count('.eyebrow{')==1
s=s.replace('.eyebrow{','.eyebrow a{color:inherit;text-decoration:none;border-bottom:1px solid var(--line)}\n.eyebrow a:hover{color:var(--ink)}\n.eyebrow{',1)
head_extra='''<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="Settlement Simulator: the same institutional process today and with AFC / AST, side by side. Illustrative model.">
<link rel="icon" href="/favicon.png">
<style>html{-webkit-text-size-adjust:100%}body{margin:0}img{max-width:100%}[hidden]{display:none!important}:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}</style>
<script>if(/[?&]embed=1(&|$)/.test(location.search)){document.documentElement.classList.add('embed');var l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap';document.head.appendChild(l)}</script>
'''
te=s.index('</title>')+len('</title>'); title=s[:te]; rest=s[te:]
se=rest.index('</style>')+len('</style>'); head_rest=rest[:se]; body=rest[se:]
doc=('<!doctype html>\n<!-- Settlement Simulator — spec: docs/portal/SETTLEMENT-SIMULATOR.md. Embedded by the portal page /simulator (app/simulator/page.tsx) via ?embed=1; also opens full screen. Presentation only: no API calls, no mint. -->\n'
     '<html lang="en">\n<head>\n'+head_extra+title+'\n'+head_rest.lstrip('\n')+'\n</head>\n<body>\n'+body.strip('\n')+'\n</body>\n</html>\n')
open(out,'w',encoding='utf-8').write(doc)
print(len(doc)//1024,'KB')
