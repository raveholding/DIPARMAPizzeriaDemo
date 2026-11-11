"""Marca de la demo Di Parma Pizzería (perfil `pizza`): logo, negro horno y naranja del logo, carta propia y estilos de la capa.
Los créditos de Vincular Business no se tocan (se cambia la presentación, nunca se eliminan)."""
import os,re,json,base64,io
HERE=os.path.dirname(os.path.abspath(__file__))
def _logo():
    from PIL import Image
    src=os.path.join(HERE,'diparma-logo.webp')
    raw=open(src,'rb').read()
    menu='data:image/webp;base64,'+base64.b64encode(raw).decode()
    g=Image.open(src).convert('L');W=384;H=round(g.height*W/g.width);g=g.resize((W,H),Image.LANCZOS)
    bw=g.point(lambda v:0 if v>100 else 255).convert('1');b=io.BytesIO();bw.save(b,'PNG',optimize=True)
    ticket='data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
    im=Image.open(src).convert('RGB').resize((180,180),Image.LANCZOS);b2=io.BytesIO();im.save(b2,'PNG',optimize=True)
    icon='data:image/png;base64,'+base64.b64encode(b2.getvalue()).decode()
    return menu,ticket,icon
DP_CSS='''
/* ===== Capa Di Parma (perfil pizza) ===== */
html{--gold:#ff7f00;--gold2:#b84f00}html[data-theme=dark]{--gold2:#ff9a3d;--selbg:#3a2412}
#side,html[data-theme=dark] #side{background:#0b0a0a!important}
#side a.on,#side a.on:hover{background:var(--gold)!important;color:#000!important}
.ux-pos-btn{box-shadow:0 6px 18px rgba(255,127,0,.28)!important}
.btn.gold,.fk.gold,.fk.gold small,.cmp .btn.gold{color:#000!important}
.dp-desc{margin:.2rem 0 .8rem}
.dp-kpi{display:flex;flex-direction:column;gap:.15rem;border-left:4px solid var(--line)}.dp-kpi b{font-size:1.6rem;line-height:1.1}.dp-kpi small{color:var(--mut)}
.dp-kpi.red{border-left-color:var(--red)}.dp-kpi.warn{border-left-color:#d97706}.dp-kpi.ok{border-left-color:var(--ok)}.dp-kpi[data-act]{cursor:pointer}
.dp-st{display:inline-flex;align-items:center;gap:.3rem;font-size:.78rem;font-weight:700;border-radius:99px;padding:.2rem .6rem;background:color-mix(in srgb,var(--c) 14%,transparent);color:var(--c);border:1px solid color-mix(in srgb,var(--c) 35%,transparent)}
html[data-theme=dark] .dp-st{color:color-mix(in srgb,var(--c) 55%,#fff)}
.dp-st::before{content:"";width:.5rem;height:.5rem;border-radius:50%;background:var(--c)}
.dp-chip{display:inline-block;font-size:.72rem;font-weight:700;border-radius:99px;padding:.15rem .5rem;border:1px solid var(--line);color:var(--mut)}.dp-chip.py{background:#e2002b;color:#fff;border-color:#e2002b}
.dp-eta{display:inline-block;font-variant-numeric:tabular-nums;font-weight:800;border-radius:8px;padding:.15rem .5rem;background:#0b0a0a;color:#ff9a3d;font-size:.85rem}.dp-eta.late{background:var(--red);color:#fff}.dp-eta.ok{background:var(--ok);color:#fff}
.dp-ln{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.25rem}.dp-ln li{display:flex;gap:.4rem;align-items:flex-start}.dp-ln small{display:block;color:var(--mut);font-size:.78rem}.dp-ln .dp-note{color:var(--gold2)}
.dp-ln.big li{font-size:1.05rem}.dp-ln .sp{flex:1}
.dp-ord{border-left:5px solid var(--c);margin-bottom:.6rem}.dp-ord .sp b,.dp-ord b.sp{white-space:nowrap}.dp-ord.late{box-shadow:0 0 0 2px var(--red) inset}
.dp-flow{display:flex;align-items:stretch;gap:.3rem;margin:.8rem 0;flex-wrap:wrap}.dp-fs{flex:1;min-width:110px;display:flex;flex-direction:column;align-items:center;gap:.1rem;border:1px solid var(--line);border-top:4px solid var(--c);background:var(--card);border-radius:14px;padding:.5rem;cursor:pointer;color:inherit;text-decoration:none;min-height:44px}
.dp-fs i{font-style:normal;font-size:.72rem;color:var(--mut)}.dp-fs b{font-size:1.5rem;line-height:1}.dp-fs span{font-size:.8rem;color:var(--mut)}.dp-fa{align-self:center;color:var(--mut)}
@media (max-width:640px){.dp-fa{display:none}}
.dp-tables{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:.7rem;margin:.8rem 0}.dp-tables.sm{grid-template-columns:repeat(auto-fill,minmax(120px,1fr))}
.dp-table{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:.15rem;text-align:left;border:2px solid color-mix(in srgb,var(--c) 55%,var(--line));background:color-mix(in srgb,var(--c) 9%,var(--card));border-radius:18px;padding:.7rem .8rem;cursor:pointer;color:inherit;font:inherit;min-height:110px}
.dp-table.barra{border-radius:40px 40px 18px 18px}.dp-table:hover{transform:translateY(-1px)}
.dp-tn{position:absolute;right:.6rem;top:.5rem;font:800 1.4rem/1 Georgia,serif;color:color-mix(in srgb,var(--c) 70%,#000)}html[data-theme=dark] .dp-tn{color:color-mix(in srgb,var(--c) 45%,#fff)}.dp-ts{font-weight:700;color:var(--c);font-size:.85rem}html[data-theme=dark] .dp-ts{color:color-mix(in srgb,var(--c) 55%,#fff)}.dp-tt{font-weight:800}
.dp-board{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.7rem;align-items:start}@media (max-width:1100px){.dp-board{grid-template-columns:repeat(2,minmax(0,1fr))}}@media (max-width:640px){.dp-board{grid-template-columns:1fr}}
.dp-col h3{border-bottom:3px solid var(--c);padding-bottom:.3rem;margin:.2rem 0 .6rem}
.dp-cad{border-top:1px solid var(--line);padding:.5rem 0;display:flex;flex-direction:column;gap:.2rem}
.dp-lots{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:.7rem}.dp-lote{display:flex;flex-direction:column;gap:.35rem}
.dp-bar{position:relative;height:10px;border-radius:99px;background:rgba(127,127,127,.2);overflow:visible;margin:.3rem 0}.dp-bar i{display:block;height:100%;border-radius:99px;background:var(--gold)}.dp-bar em{position:absolute;top:-3px;width:2px;height:16px;background:var(--ink)}
.dp-spark{width:100%;height:40px;display:block}
.dp-click{cursor:pointer}.dp-click.on{background:var(--selbg,#fff4dc)}.dp-art{width:130px;flex:none;border-radius:14px;overflow:hidden}.dp-art svg{display:block;width:100%;height:auto}
.dp-qin{width:80px;text-align:right}.dp-low{color:var(--red);font-weight:700}
.dp-vlog{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.4rem}.dp-vlog li{border-left:4px solid var(--line);padding:.3rem .6rem}.dp-vlog li.ok{border-color:var(--ok)}.dp-vlog li.bad{border-color:var(--red)}
.dp-mo{border:1px solid var(--line);border-radius:12px;padding:.6rem;margin:.4rem 0}
.dp-qr{background:#fff;border-radius:12px;padding:.4rem}.dp-qr svg{width:100%;height:auto;display:block}
.dp-phone{width:min(400px,100%);height:min(720px,70vh);margin:0 auto;border-radius:38px;border:10px solid #1d1b1a;overflow:hidden;background:#0b0a0a;box-shadow:0 20px 50px rgba(0,0,0,.4)}.dp-phone iframe{width:100%;height:100%;border:0;display:block}
.dp-pick{display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:.5rem;margin:.4rem 0}.dp-pk{display:flex;flex-direction:column;gap:.2rem;align-items:center;border:1px solid var(--line);background:var(--card);border-radius:14px;padding:.4rem;cursor:pointer;color:inherit;font:inherit;text-align:center;min-height:44px}
.dp-pka{width:64px;height:64px;border-radius:10px;overflow:hidden}.dp-pka svg{width:100%;height:100%;display:block}.dp-pk b{font-size:.85rem}.dp-pk span{font-size:.8rem;color:var(--mut)}
.dp-nt{display:block;width:100%;margin-top:.2rem;min-height:36px!important;font-size:.85rem}
.dp-ap{position:fixed;right:1rem;bottom:1rem;z-index:80;width:min(360px,calc(100% - 2rem));background:#0b0a0a;color:#fff;border-radius:16px;padding:.9rem 1rem;box-shadow:0 14px 40px rgba(0,0,0,.45);display:flex;flex-direction:column;gap:.4rem;border:1px solid #ff7f00}
.dp-ap span{font-size:.92rem}.dp-apb{height:6px;border-radius:99px;background:#333}.dp-apb i{display:block;height:100%;background:#ff7f00;border-radius:99px;transition:width .4s}
.dp-hoy{margin:1rem 0;border-top:4px solid var(--gold)}
/* auditoría V27.6: contraste AA de los estados, objetivos táctiles de 44 px, grillas que no desbordan, movimiento sutil */
html:not([data-theme=dark]) .dp-st,html:not([data-theme=dark]) .dp-ts{color:color-mix(in srgb,var(--c) 68%,#000)}
html:not([data-theme=dark]) .dp-table .sm.mut{color:#4b5563}
.btn.sm{min-height:44px}html[data-theme=dark] .dp-eta.ok{color:#0b0a0a}#view label.chk{min-height:44px;display:flex;align-items:center;gap:.5rem}.dp-click td{height:44px}@media (max-width:640px){.dp-rt thead{display:none}.dp-rt,.dp-rt tbody{display:block}.dp-rt tr{display:grid;grid-template-columns:auto 1fr;gap:.35rem .6rem;padding:.7rem 0;border-bottom:1px solid var(--line)}.dp-rt td{border:0!important;padding:0!important;text-align:left!important}.dp-rt td:nth-child(n+3){grid-column:2}.dp-rt td:first-child{font-weight:800}}.ux-tabs a,.ux-tabs button{min-height:44px;display:inline-flex;align-items:center}
.dp-h{font-size:1.05rem;margin:.9rem 0 .5rem}.dp-col .dp-h{margin-top:.2rem}
.dp-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.dp-21,.dp-12{display:grid;gap:.8rem;align-items:start;grid-template-columns:minmax(0,2fr) minmax(0,1fr)}.dp-12{grid-template-columns:minmax(0,1fr) minmax(0,2fr)}
@media (max-width:900px){.dp-21,.dp-12{grid-template-columns:minmax(0,1fr)}}
.dp-lots{grid-template-columns:repeat(auto-fill,minmax(min(260px,100%),1fr))}
[data-act][tabindex]:focus-visible,.dp-table:focus-visible,.dp-fs:focus-visible{outline:3px solid var(--gold);outline-offset:2px}
@media (prefers-reduced-motion:no-preference){.dp-ord,.dp-table,.dp-fs,.dp-lote{animation:dpIn .28s ease both}.dp-table,.dp-fs,.dp-pk{transition:transform .15s ease,box-shadow .15s ease}.dp-fs:hover,.dp-pk:hover{transform:translateY(-2px)}
 .dp-ap{animation:dpUp .3s ease both}}
.cfg-top{position:sticky;top:0;z-index:5;background:var(--bg);padding:.5rem 0 .6rem;margin-bottom:.4rem}
.cfg-search{display:flex;align-items:center;gap:.5rem;border:1px solid var(--line);background:var(--card);border-radius:14px;padding:0 .8rem;min-height:52px;box-shadow:0 4px 14px rgba(0,0,0,.05)}
.cfg-search input{border:0!important;background:transparent!important;flex:1;min-height:48px;font-size:1rem;box-shadow:none!important;outline:0}.cfg-search:focus-within{outline:3px solid var(--gold);outline-offset:1px}
.cfg-search kbd{font-size:.75rem;border:1px solid var(--line);border-radius:6px;padding:.1rem .4rem;color:var(--mut)}
.cfg-grid{display:grid;grid-template-columns:minmax(220px,280px) minmax(0,1fr);gap:1rem;align-items:start}
.cfg-nav{position:sticky;top:72px;display:flex;flex-direction:column;gap:.35rem}
.cfg-sec,.cfg-link{display:flex;align-items:center;gap:.6rem;width:100%;text-align:left;border:1px solid var(--line);background:var(--card);border-radius:14px;padding:.6rem .7rem;cursor:pointer;color:inherit;font:inherit;min-height:56px}
.cfg-sec small,.cfg-link small{display:block;color:var(--mut);font-size:.76rem;line-height:1.25}.cfg-sec>span:nth-child(2){flex:1}
.cfg-sec.on{border-color:var(--gold);box-shadow:inset 4px 0 0 var(--gold);background:color-mix(in srgb,var(--gold) 8%,var(--card))}
.cfg-sic svg{width:20px;height:20px}.cfg-n{font-size:.75rem;font-weight:700;border-radius:99px;padding:.15rem .5rem;background:rgba(127,127,127,.15)}.cfg-n.warn{background:#fde68a;color:#78350f}
.cfg-more{display:flex;flex-direction:column;gap:.35rem;margin-top:.7rem}.cfg-link{min-height:48px;flex-direction:column;align-items:flex-start;gap:0}
.cfg-mhead{display:flex;flex-wrap:wrap;align-items:baseline;gap:.2rem 1rem;margin-bottom:.6rem}.cfg-mhead h2{margin:0;flex:0 0 auto}.cfg-mhead p{margin:0;flex:1}
.cfg-card{padding:0!important;overflow:hidden;margin-bottom:.7rem}.cfg-card.dirty{border-color:#d97706;box-shadow:0 0 0 1px #d97706}
.cfg-head{display:flex;align-items:center;gap:.7rem;width:100%;border:0;background:transparent;color:inherit;font:inherit;text-align:left;padding:.85rem 1rem;cursor:pointer;min-height:56px}
.cfg-ht{flex:1;display:flex;flex-direction:column;gap:.15rem}.cfg-ht b{font-size:1.02rem}.cfg-ht small{color:var(--mut);font-size:.8rem;line-height:1.3}
.cfg-ht small[data-sec]:not([data-sec=""])::before{content:attr(data-sec) " · ";font-weight:700;color:var(--gold2)}
.cfg-dirty{font-size:.72rem;font-weight:800;border-radius:99px;padding:.2rem .55rem;background:#fde68a;color:#78350f}
.cfg-chev{font-size:1.5rem;line-height:1;color:var(--mut)}.cfg-card.open .cfg-chev{transform:rotate(90deg)}
.cfg-body{display:none;padding:0 1rem 1rem;border-top:1px solid var(--line)}.cfg-card.open .cfg-body{display:block}.cfg-body>:first-child{margin-top:.8rem}
.cfg-hit{background:color-mix(in srgb,var(--gold) 22%,transparent);border-radius:6px;box-shadow:0 0 0 3px color-mix(in srgb,var(--gold) 22%,transparent)}
@media (prefers-reduced-motion:no-preference){.cfg-chev{transition:transform .18s ease}.cfg-card.open .cfg-body{animation:dpIn .22s ease both}}
@media (max-width:900px){.cfg-grid{grid-template-columns:minmax(0,1fr)}.cfg-nav{position:static;flex-direction:row;overflow-x:auto;padding-bottom:.3rem}.cfg-sec{flex:0 0 auto;width:auto}.cfg-sec small{display:none}.cfg-more{display:none}}
@keyframes dpIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}@keyframes dpUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.dp-table:hover{transform:none}.dp-apb i{transition:none}}
'''
def brand(h):
    menu,ticket,icon=_logo()
    h=re.sub(r'const LOGO_MENU="[^"]*"','const LOGO_MENU="%s"'%menu,h,count=1)
    h=re.sub(r'const LOGO_TICKET="[^"]*"','const LOGO_TICKET="%s"'%ticket,h,count=1)
    h=h.replace('--ink:#242220;','--ink:#1b1715;',1).replace('--gold:#c9963e;','--gold:#ff7f00;',1).replace('--gold2:#a87a28;','--gold2:#b84f00;',1)
    h=h.replace('name="theme-color" content="#242220"','name="theme-color" content="#0b0a0a"',1)
    h=re.sub(r'<link rel="icon" href="[^"]*"','<link rel="icon" href="%s"'%icon,h,count=1)
    h=h.replace('style="width:48px;height:27px;object-fit:cover;border-radius:6px"','style="width:40px;height:40px;object-fit:cover;border-radius:50%"')
    h=h.replace('<span>Sistema RAVE</span></a>','<span>Di Parma</span></a>',1)
    h=h.replace('Sistema RAVE','Sistema VB').replace('alt="RAVE"','alt="Di Parma Pizzería"')
    h=re.sub(r'<title>[^<]*</title>','<title>Di Parma Pizzería de masa madre · Sistema VB · demo</title>',h,count=1)
    h=h.replace("club:{t:()=>IS_CLIENT?'Club RAVE':'Club de clientes'","club:{t:()=>'Club Di Parma'",1)
    for o,n in [('Club RAVE','Club Di Parma'),('RAVE Club','Di Parma Club'),('que RAVE guarde','que Di Parma guarde'),
                ('Almacén y Licorería RAVE, Urquiza 1052, Salta, Argentina. Contacto: WhatsApp 387 4574892.','Di Parma Pizzería de masa madre (demo de evaluación, datos de ejemplo).'),
                ('Almacén y Licorería RAVE','Di Parma Pizzería'),('Almacén y Licorería · Salta','Pizzería de masa madre · Salta')]:
        h=h.replace(o,n)
    h=h.replace('<span>Pedidos delivery (PedidosYa)</span>','<span>Pedidos delivery</span>',1)
    # usuarios de prueba de la pizzería
    old='Usuarios de prueba: ADMIN · 1234 / Supervisor · 1111 / Mostrador · 0000${S.users.some(u=>u.role===\'empleado\'&&u.pin===\'2222\')?\' / Empleado (portal) · 2222\':\'\'}'
    assert old in h,'texto de usuarios de prueba no encontrado'
    h=h.replace(old,'Usuarios de prueba: ADMIN 1234 · Supervisor 1111 · Caja 0000 · Mozo Martín 2222 · Moza Sofía 3333 · Barra Joaquín 4444 · Cocina Franco 5555 · Cocina Lucía 6666 · Portal del empleado 7777',1)
    # tema propio de este sitio (los repositorios comparten el origen raveholding.github.io)
    h=h.replace("localStorage.getItem('rave.theme')","localStorage.getItem('rave.theme.diparma')",1).replace("localStorage.setItem('rave.theme',n)","localStorage.setItem('rave.theme.diparma',n)",1)
    assert "rave.theme.diparma" in h
    h=h.replace('</style>',DP_CSS+'\n</style>',1)
    # carta pública propia (QR / NFC por mesa, retiro y delivery, Club)
    i=h.find('const PUB_DOC="');assert i>=0
    k=i+len('const PUB_DOC=');e=k+1
    while h[e]!='"':
        e+=2 if h[e]=='\\' else 1
    e+=1
    doc=open(os.path.join(HERE,'p11-pub-pizza.html'),encoding='utf8').read().replace('__LOGO__',menu)
    h=h[:k]+json.dumps(doc,ensure_ascii=False).replace('</','<\\/')+h[e:]
    return h
