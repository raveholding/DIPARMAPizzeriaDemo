# Prueba de la capa Di Parma: servir el index.html en http://127.0.0.1:8765/ (python3 -m http.server 8765) y correr: python3 dp1.py
from playwright.sync_api import sync_playwright
B='http://127.0.0.1:8765/'
errs=[]
def ok(c,m):print(('OK   ' if c else 'FALLA ')+m)
with sync_playwright() as p:
    b=p.chromium.launch(args=['--no-proxy-server']);pg=b.new_page(viewport={'width':1280,'height':900})
    pg.on('pageerror',lambda e:errs.append(str(e)[:300]));pg.on('console',lambda m:errs.append(m.text[:200]) if m.type=='error' else None)
    pg.goto(B+'#acceso');pg.wait_for_selector('#lu');pg.select_option('#lu','u1');pg.fill('#lp','1234');pg.click('[data-act=login]');pg.wait_for_timeout(1200)
    n=pg.evaluate("S.sales.length");m0=pg.evaluate("prod('in-muzza').stock")
    r=pg.evaluate("(()=>{const o=S.dp.orders.find(o=>o.channel==='delivery');let e=dpDo('dispatch',o,'e9');e=e||dpDo('deliver',o);dpCommit();return [e,o.paid,o.saleId,S.dp.cadetes.e9.efectivo]})()");print(r)
    ok(pg.evaluate("S.sales.length")==n+1 and r[1],'delivery entregado → venta en efectivo')
    ok(pg.evaluate("prod('in-muzza').stock")<m0,'descontó muzzarella')
    r=pg.evaluate("(()=>{const o=S.dp.orders.find(o=>o.channel==='pedidosya'&&o.status==='preparando');dpDo('ready',o);dpDo('dispatch',o);dpDo('deliver',o);dpCommit();return [o.saleId, (S.sales.find(s=>s.id===o.saleId)||{}).method]})()");print(r)
    ok(r[1]=='pedidosya','PedidosYa entregado → venta canal PedidosYa')
    pg.evaluate("location.hash='#panel/dpdelivery'");pg.wait_for_timeout(700);pg.click('[data-act=dpRendir][data-id=e9]');pg.click('#modal-root [data-m=ok]');pg.wait_for_timeout(500)
    ok(pg.evaluate("S.dp.cadetes.e9.efectivo")==0,'rendición')
    pg.evaluate("A.dpAuto()");pg.wait_for_timeout(20000)
    ok(pg.evaluate("dpT('I6').session.bill"),'circuito en vivo terminó con la cuenta pedida')
    pg.evaluate("location.hash='#panel/arqueo'");pg.wait_for_timeout(800);pg.screenshot(path='/tmp/arq.png')
    print('\n'.join(errs) or 'sin errores');b.close()
