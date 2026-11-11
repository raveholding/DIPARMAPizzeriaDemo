# Auditoría de accesibilidad y diseño (axe-core WCAG 2 A/AA + objetivos táctiles + desbordes 360 px) en claro y oscuro.
# Requiere: npm i axe-core@4 en /tmp/axe y el index.html servido en http://127.0.0.1:8765/
from playwright.sync_api import sync_playwright
import json,sys,collections
B='http://127.0.0.1:8765/'
AXE=open('/tmp/axe/node_modules/axe-core/axe.min.js').read()
SC=['inicio','dpsalon','dpmozo','dpcomandas','dpcocina','dpdelivery','dpferm','dpfichas','dpvoz']
out=collections.defaultdict(list);errs=[]
def axe(pg,tag,ctx='#view'):
    pg.evaluate(AXE) if not pg.evaluate("!!window.axe") else None
    r=pg.evaluate("async c=>{const r=await axe.run(c,{runOnly:['wcag2a','wcag2aa','best-practice'],resultTypes:['violations']});return r.violations.map(v=>({id:v.id,imp:v.impact,n:v.nodes.length,ex:v.nodes.slice(0,3).map(x=>x.target.join(' ')+' :: '+(x.failureSummary||'').slice(0,160).replace(/\\n/g,' '))}))}",ctx)
    for v in r:out[v['id']].append((tag,v['n'],v['ex']))
def small(pg,tag):
    r=pg.evaluate("""()=>[...document.querySelectorAll('#view button,#view a[href],#view [role=tab],#view [data-act],#view input,#view select')].filter(e=>e.offsetParent&&!e.closest('label.chk')).map(e=>{const b=e.getBoundingClientRect();return [Math.round(b.width),Math.round(b.height),(e.className||'')+'|'+(e.textContent||e.value||'').trim().slice(0,24)]}).filter(x=>x[1]<44||x[0]<44)""")
    if r:out['tactil<44'].append((tag,len(r),r[:6]))
def over(pg,tag):
    r=pg.evaluate("document.documentElement.scrollWidth-document.documentElement.clientWidth")
    if r>1:out['desborde'].append((tag,r,[]))
with sync_playwright() as p:
    b=p.chromium.launch(args=['--no-proxy-server'])
    for theme in ['light','dark']:
        for w in [1280,360]:
            pg=b.new_page(viewport={'width':w,'height':900})
            pg.on('pageerror',lambda e:errs.append(str(e)[:200]));pg.on('console',lambda m:errs.append(m.text[:200]) if m.type=='error' else None)
            pg.add_init_script(f"try{{localStorage.setItem('rave.theme.diparma','{theme}')}}catch(e){{}}")
            pg.goto(B+'#acceso');pg.wait_for_selector('#lu');pg.select_option('#lu','u1');pg.fill('#lp','1234');pg.click('[data-act=login]');pg.wait_for_timeout(1200)
            for s in SC:
                pg.evaluate(f"location.hash='#panel/{s}'");pg.wait_for_timeout(500);tag=f'{theme}/{w}/{s}'
                if w==1280:axe(pg,tag)
                else:small(pg,tag);over(pg,tag)
            pg.close()
        # carta
        for mesa in ['','?mesa=I4']:
            pg=b.new_page(viewport={'width':360,'height':800});pg.goto(B+mesa);pg.wait_for_timeout(2500)
            fr=pg.frames[1] if len(pg.frames)>1 else None
            if fr:
                fr.evaluate(AXE);r=fr.evaluate("async()=>{const r=await axe.run(document,{runOnly:['wcag2a','wcag2aa','best-practice'],resultTypes:['violations']});return r.violations.map(v=>({id:v.id,n:v.nodes.length,ex:v.nodes.slice(0,3).map(x=>x.target.join(' ')+' :: '+(x.failureSummary||'').slice(0,160).replace(/\\n/g,' '))}))}")
                for v in r:out['carta:'+v['id']].append((theme+mesa,v['n'],v['ex']))
                r=fr.evaluate("()=>[...document.querySelectorAll('button,a,input')].filter(e=>e.offsetParent&&!e.closest('label.chk')).map(e=>{const b=e.getBoundingClientRect();return [Math.round(b.width),Math.round(b.height),(e.className||'')+'|'+(e.textContent||'').trim().slice(0,20)]}).filter(x=>x[1]<44)")
                if r:out['carta:tactil<44'].append((mesa,len(r),r[:6]))
            pg.close()
    b.close()
for k,v in out.items():
    print('==',k,sum(x[1] for x in v))
    for t,n,ex in v[:4]:print('   ',t,n,str(ex)[:400])
print('ERRORES',set(errs))
