# Menú lateral en pantallas angostas: abrir con ☰, cerrar con ✕ / tocando afuera / Esc, y volver a abrir.
from playwright.sync_api import sync_playwright
B='http://127.0.0.1:8765/'
def ok(c,m):print(('OK   ' if c else 'FALLA ')+m)
with sync_playwright() as p:
    b=p.chromium.launch(args=['--no-proxy-server'])
    for w in [390,768]:
        pg=b.new_page(viewport={'width':w,'height':844},has_touch=True,is_mobile=w<500);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto(B+'#acceso');pg.wait_for_selector('#lu');pg.select_option('#lu','u1');pg.fill('#lp','1234');pg.tap('[data-act=login]');pg.wait_for_timeout(1000)
        so=lambda:pg.evaluate("document.querySelector('#side').classList.contains('open')")
        for i in range(3):
            pg.tap('#burger');pg.wait_for_timeout(400);a=so()
            if i==0:pg.tap('#side-x')
            elif i==1:pg.mouse.click(w-20,600)
            else:pg.keyboard.press('Escape')
            pg.wait_for_timeout(400);ok(a and not so(),f'{w}px · abre con ☰ y cierra con '+['✕','tocando afuera','Esc'][i])
        pg.tap('#burger');pg.wait_for_timeout(300);pg.locator('#side [data-act=nav][data-id=dpsalon]').tap();pg.wait_for_timeout(600)
        ok(not so() and pg.evaluate("document.querySelector('#side-scrim').hidden"),f'{w}px · elegir pantalla cierra el menú y el fondo')
        pg.tap('#burger');pg.wait_for_timeout(300);ok(so(),f'{w}px · se vuelve a abrir');
        if w==390:pg.screenshot(path='/tmp/side2.png')
        print(errs or 'sin errores');pg.close()
    pg=b.new_page(viewport={'width':1280,'height':900});pg.goto(B+'#acceso');pg.wait_for_selector('#lu');pg.select_option('#lu','u1');pg.fill('#lp','1234');pg.click('[data-act=login]');pg.wait_for_timeout(800)
    ok(pg.evaluate("document.querySelector('#side-scrim').hidden"),'escritorio sin fondo oscuro')
    b.close()
