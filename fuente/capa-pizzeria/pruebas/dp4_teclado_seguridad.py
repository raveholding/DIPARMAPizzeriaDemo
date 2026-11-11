# Teclado (Enter/Esc), validación del canal entre pestañas y límites de la carta pública.
from playwright.sync_api import sync_playwright
B='http://127.0.0.1:8765/'
with sync_playwright() as p:
    b=p.chromium.launch(args=['--no-proxy-server']);pg=b.new_page(viewport={'width':1280,'height':900})
    pg.goto(B+'#acceso');pg.wait_for_selector('#lu');pg.select_option('#lu','u1');pg.fill('#lp','1234');pg.click('[data-act=login]');pg.wait_for_timeout(1000)
    pg.evaluate("location.hash='#panel/dpsalon'");pg.wait_for_timeout(500)
    pg.focus('.dp-fs[data-id=dpmozo]');pg.keyboard.press('Enter');pg.wait_for_timeout(500);print('enter en paso del circuito →',pg.evaluate('location.hash'))
    pg.evaluate("location.hash='#panel/dpsalon'");pg.wait_for_timeout(500)
    pg.focus('[data-act=dpSec][data-v=barra]');pg.keyboard.press('Enter');pg.wait_for_timeout(400);print('enter en pestaña barra →',pg.evaluate('DPU.salon'))
    pg.focus('.dp-kpi[data-act]') if pg.locator('.dp-kpi[data-act]').count() else None
    pg.evaluate("location.hash='#panel/dpsalon'");pg.wait_for_timeout(500);print(pg.locator('[data-act=dpMesa]').count());pg.focus('[data-act=dpMesa]');pg.keyboard.press('Enter');pg.wait_for_timeout(400);print('modal mesa abierto:',pg.locator('#modal-root .ov').count(),'foco en:',pg.evaluate("document.activeElement.outerHTML.slice(0,80)"))
    pg.keyboard.press('Escape');pg.wait_for_timeout(300);print('esc cierra:',pg.locator('#modal-root .ov').count()==0)
    # BroadcastChannel con datos basura
    pg.evaluate("new BroadcastChannel('svb-diparma-'+(RAVE_BUILD.db)).postMessage({dp:{rev:Date.now()+99999,tables:'x'}})");pg.wait_for_timeout(600)
    print('tras mensaje basura, tables es array:',pg.evaluate("Array.isArray(S.dp.tables)"))
    # carga masiva desde la carta
    r=pg.evaluate("(()=>{let n=0;for(let i=0;i<30;i++){if(DP_API.send({mesa:'I9',lines:[{pid:'p_marg',qty:1}]}).ok)n++;}return n})()");print('pedidos aceptados en ráfaga desde una mesa:',r)
    r=pg.evaluate("DP_API.send({mesa:'I9',lines:[{pid:'in-harina',qty:5},{pid:'p_marg',qty:9999,note:'<img src=x onerror=alert(1)>'}]})");print(r, pg.evaluate("(S.dp.orders.at(-1).items||[]).map(i=>[i.pid,i.qty,i.note])"))
    b.close()
