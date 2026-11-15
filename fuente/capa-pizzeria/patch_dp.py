#!/usr/bin/env python3
"""Aplica la capa de pizzería Di Parma (perfil `pizza`) a una copia de AlmacenRAVE/fuente.
Uso: python3 patch_dp.py <dir fuente>   (idempotente: si ya está aplicado, no cambia nada)
Sigue el mismo método que la capa de gimnasios: el núcleo del Sistema VB no se reescribe; sólo se agregan
ganchos de una línea (detrás de isPizzaBuild) y el módulo p11-pizza.js."""
import sys,os,shutil
D=sys.argv[1]
def rd(f):return open(os.path.join(D,f),encoding='utf8').read()
def wr(f,s):open(os.path.join(D,f),'w',encoding='utf8').write(s)
def rep(f,old,new,marker):
    s=rd(f)
    if marker in s:return
    assert s.count(old)==1,(f,old[:80],s.count(old))
    wr(f,s.replace(old,new))
here=os.path.dirname(os.path.abspath(__file__))
MODS=['p11a-pizza-datos.js','p11b-pizza-circuito.js','p11c-pizza-pantallas.js']  # V27.9: p11d (Configuración) se retira: el núcleo V26.66 ya trae la suya  # módulo por dominio: datos → circuito → pantallas
for a,b in [(m,m) for m in MODS]+[('diparma-logo.webp','assets/diparma-logo.webp')]:
    shutil.copy(os.path.join(here,a),os.path.join(D,b))
# 1 · datos iniciales: después de la base de un solo dueño, la base de la pizzería
rep('p2-core.js',"if(typeof isSoloBuild==='function'&&isSoloBuild())soloBase(r);",
    "if(typeof isSoloBuild==='function'&&isSoloBuild())soloBase(r);if(typeof isPizzaBuild==='function'&&isPizzaBuild())pizzaBase(r);",'pizzaBase(r)')
# 2 · la pizzería usa la base de un solo dueño (sin rubros por persona ni mayorista)
rep('p3o-solo.js',"function isSoloBuild(){return!!(typeof window!=='undefined'&&window.RAVE_BUILD&&(window.RAVE_BUILD.profile==='solo'||window.RAVE_BUILD.profile==='v3'));}",
    "function isSoloBuild(){return!!(typeof window!=='undefined'&&window.RAVE_BUILD&&['solo','v3','pizza'].includes(window.RAVE_BUILD.profile));} /* V27.5: la pizzería Di Parma (pizza) usa la base de un solo dueño */",'\'pizza\']')
rep('p3o-solo.js'," S.sales=S.sales.filter(s=>s.wch!=='mayorista');}"," S.sales=S.sales.filter(s=>s.wch!=='mayorista');if(typeof pizzaExtras==='function')pizzaExtras();}",'pizzaExtras()')
# 3 · RR. HH.: áreas, horario de la noche y día de cierre de una pizzería
rep('p4f-rrhh.js',"const deps=V3?['Comercial','Finanzas','Operaciones','Soporte técnico','Recursos Humanos']:['Ventas','Depósito','Administración'];",
    "const deps=V3?['Comercial','Finanzas','Operaciones','Soporte técnico','Recursos Humanos']:(typeof isPizzaBuild==='function'&&isPizzaBuild())?['Salón','Cocina','Caja y administración','Reparto']:['Ventas','Depósito','Administración'];",'\'Salón\',\'Cocina\'')
rep('p4f-rrhh.js',"if(w===0||w===6)continue;E.forEach((e,j)=>d.hrShifts.push({id:e.id+':'+day,empId:e.id,day,from:j%2?'13:00':'08:00',to:j%2?'21:00':'16:00'}));",
    "const PZ=typeof isPizzaBuild==='function'&&isPizzaBuild();if(PZ?w===1:(w===0||w===6))continue;E.forEach((e,j)=>{if(PZ&&e.dpOff===w)return;d.hrShifts.push({id:e.id+':'+day,empId:e.id,day,from:PZ?(e.dpFrom||'18:30'):(j%2?'13:00':'08:00'),to:PZ?(e.dpTo||'23:45'):(j%2?'21:00':'16:00')});});",'e.dpOff===w')
# 4 · los insumos de cocina no se ofrecen en la grilla de Vender (se descuentan por ficha técnica)
rep('p3b-pos.js',".filter(p=>!pos.rub||p.rubro===pos.rub);\n const nores=",".filter(p=>(!pos.rub||p.rubro===pos.rub)&&(q||!p.posHide));\n const nores=",'q||!p.posHide')
# 5 · perfil de compilación
b=rd('build.py')
if "'pizza'" not in b:
    b=b.replace("assert V in('demo','cliente','kini','solo','v3')","assert V in('demo','cliente','kini','solo','v3','pizza')",1)
    b=b.replace("PROFILE=V if V in('kini','solo','v3') else ''","PROFILE=V if V in('kini','solo','v3','pizza') else ''",1)
    b=b.replace("if PROFILE=='v3': pub=os.environ.get('PUBLIC_URL','https://raveholding.github.io/raveV3/')",
      "if PROFILE=='v3': pub=os.environ.get('PUBLIC_URL','https://raveholding.github.io/raveV3/')\n"
      "# V27.5 · pizza = Di Parma Pizzería de masa madre (DIPARMAPizzeriaDemo)\n"
      "if PROFILE=='pizza': pub=os.environ.get('PUBLIC_URL','https://raveholding.github.io/DIPARMAPizzeriaDemo/')",1)
    b=b.replace("'v3':'rave-v3-demo-v2'}","'v3':'rave-v3-demo-v2','pizza':'rave-diparma-demo-v1'}",1)
    b=b.replace("parts=[p for p in parts if os.path.exists(p)]",
      "parts=[p for p in parts if os.path.exists(p)]\nif PROFILE=='pizza':\n    i=parts.index('p5c-menusec.js')\n    parts[i:i]=['p11a-pizza-datos.js','p11b-pizza-circuito.js','p11c-pizza-pantallas.js']",1)
    b=b.replace("if (V in ('demo','cliente') and PROFILE not in('kini','solo'))","if (V in ('demo','cliente') and PROFILE not in('kini','solo','pizza'))",1)
    b=b.replace("if PROFILE in('solo','v3'): html=solo_brand(html,PROFILE=='v3')",
      "if PROFILE in('solo','v3'): html=solo_brand(html,PROFILE=='v3')\n"
      "if PROFILE=='pizza':\n"
      "    sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'capa-pizzeria'))\n"
      "    import dp_brand\n"
      "    html=dp_brand.brand(html)",1)
    assert b.count("'pizza'")>=4 and 'dp_brand.brand' in b
    wr('build.py',b)
# la capa queda también dentro de la fuente (para recompilar desde el repositorio de la demo)
if os.path.exists(os.path.join(D,'p11-pizza.js')):os.remove(os.path.join(D,'p11-pizza.js'))  # versión monolítica anterior
b=rd('build.py')
if "'p11-pizza.js'" in b:
    b=b.replace("if PROFILE=='pizza': parts.insert(parts.index('p5c-menusec.js'),'p11-pizza.js')","if PROFILE=='pizza':\n    i=parts.index('p5c-menusec.js')\n    parts[i:i]=['p11a-pizza-datos.js','p11b-pizza-circuito.js','p11c-pizza-pantallas.js']",1);wr('build.py',b)
dst=os.path.join(D,'capa-pizzeria')
if os.path.abspath(dst)!=os.path.abspath(here):
    os.makedirs(dst,exist_ok=True)
    for f in os.listdir(here):
        if os.path.isfile(os.path.join(here,f)):shutil.copy(os.path.join(here,f),os.path.join(dst,f))
# V27.9 · app instalable con la marca Di Parma (nombre, ícono con el logo sobre negro, color)
b=rd('build.py')
if "'pizza':('Di Parma'" not in b:
    b=b.replace("'solo':('Sistema VB','VB','Club VB')}","'solo':('Sistema VB','VB','Club VB'),'pizza':('Di Parma Pizzería','Di Parma','Club Di Parma')}",1)
    b=b.replace("    def icon(n,mask=False):\n        bg='#242220'","    def icon(n,mask=False):\n        if PROFILE=='pizza':\n            im=Image.new('RGB',(n,n),'#0b0a0a');lg=Image.open(os.path.join('capa-pizzeria','diparma-logo.webp')).convert('RGBA');w=int(n*(.74 if mask else .96));lg=lg.resize((w,w),Image.LANCZOS);im.paste(lg,((n-w)//2,(n-w)//2),lg);return im\n        bg='#242220'",1)
    b=b.replace("open(out,'w',encoding='utf8').write(html)\npwa_files(","if PROFILE=='pizza': html=html.replace('content=\"#242220\"','content=\"#0b0a0a\"')\nopen(out,'w',encoding='utf8').write(html)\npwa_files(",1)
    b=b.replace("    base={'lang':'es-AR'","    _bg='#0b0a0a' if PROFILE=='pizza' else '#242220'\n    base={'lang':'es-AR'",1).replace("'background_color':'#242220','theme_color':'#242220'","'background_color':_bg,'theme_color':_bg",1)
    assert "'pizza':('Di Parma" in b and "PROFILE=='pizza':\n            im=" in b and "_bg='#0b0a0a'" in b and 'content=\"#0b0a0a\"' in b
    wr('build.py',b)
# V27.10 · VENTA FRACCIONADA (media pizza, media docena, docena) · módulo genérico del núcleo p3s-fraccion.js
shutil.copy(os.path.join(here,'p3s-fraccion.js'),os.path.join(D,'p3s-fraccion.js'))
b=rd('build.py')
if "'p3s-fraccion.js'" not in b:
    b=b.replace("parts=[p for p in parts if os.path.exists(p)]","parts=[p for p in parts if os.path.exists(p)]\nif os.path.exists('p3s-fraccion.js') and 'p3s-fraccion.js' not in parts: parts.insert(parts.index('p3j-combos.js')+1,'p3s-fraccion.js')  # V27.10 venta fraccionada",1)
    assert "'p3s-fraccion.js'" in b;wr('build.py',b)
# en Vender, tocar el entero no se suma a una línea de «Media»
rep('p3b-pos.js',"const L=pos.lines.find(l=>l.pid===p.id);if(L){L.qty+=step;","const L=pos.lines.find(l=>l.pid===p.id&&!l.frac);if(L){L.qty+=step;",'l.pid===p.id&&!l.frac')
# stock / ficha técnica: la fracción descuenta qty × f
rep('p3j-combos.js',"if(isKit(p))p.kit.forEach(k=>{need[k.pid]=(need[k.pid]||0)+l.qty*k.qty;});else need[l.pid]=(need[l.pid]||0)+l.qty;});",
    "const fq=l.qty*(l.frac||1);if(isKit(p))p.kit.forEach(k=>{need[k.pid]=(need[k.pid]||0)+fq*k.qty;});else need[l.pid]=(need[l.pid]||0)+fq;});",'const fq=l.qty*(l.frac||1)')
rep('p3b-pos.js',"cost:isKit(prod(l.pid))?kitCost(prod(l.pid)):l.cost,list:l.list,disc:alloc[i]||0,",
    "cost:isKit(prod(l.pid))?Math.round(kitCost(prod(l.pid))*(l.frac||1)):l.cost,list:l.list,disc:alloc[i]||0,...(l.frac?{frac:l.frac,fl:l.fl||''}:{}),",'frac:l.frac,fl:l.fl')
rep('p3-ops.js',"if(c)c.stock=Math.round((c.stock+it.qty*k.qty)*1000)/1000;});return;}\n const p=S.products.find(x=>x.id===it.pid);if(p)p.stock=Math.round((p.stock+it.qty)*1000)/1000;});}",
    "if(c)c.stock=Math.round((c.stock+it.qty*(it.frac||1)*k.qty)*1000)/1000;});return;}\n const p=S.products.find(x=>x.id===it.pid);if(p)p.stock=Math.round((p.stock+it.qty*(it.frac||1))*1000)/1000;});}",'it.qty*(it.frac||1)*k.qty')
rep('p3r-oper.js',"if(c)c.stock=Math.round((c.stock+o.qty*k.qty)*1000)/1000;});else{const p=prod(o.pid);if(p)p.stock=Math.round((p.stock+o.qty)*1000)/1000;}",
    "if(c)c.stock=Math.round((c.stock+o.qty*(it.frac||1)*k.qty)*1000)/1000;});else{const p=prod(o.pid);if(p)p.stock=Math.round((p.stock+o.qty*(it.frac||1))*1000)/1000;}",'o.qty*(it.frac||1)*k.qty')
# editor del producto: bloque «Venta fraccionada»
rep('p3-ops.js'," ${comboBlock(p)}\n"," ${comboBlock(p)}\n ${typeof fracBlock==='function'?fracBlock(p):''}\n",'fracBlock(p)')
rep('p3-ops.js',"  const MP=menuProdRead(w);if(MP.err)return w._err(MP.err),false;",
    "  const MP=menuProdRead(w);if(MP.err)return w._err(MP.err),false;\n  const FR=typeof fracRead==='function'?fracRead(w):{fr:null};if(FR.err)return w._err(FR.err),false;",'const FR=typeof fracRead')
rep('p3-ops.js',"  d.msec=MP.msec;","  if(FR.fr){if(JSON.stringify(FR.fr)!==JSON.stringify((p&&p.fr)||[]))audit('VENTA_FRACCIONADA',name+' · '+(FR.fr.map(x=>x.l+' ('+x.f+') '+money(x.price)).join(' · ')||'sin fracciones'));d.fr=FR.fr;}\n  d.msec=MP.msec;",'VENTA_FRACCIONADA')
rep('p3-ops.js',"wsProdBind(w,cv);comboBind(w,p);","wsProdBind(w,cv);comboBind(w,p);if(typeof fracBind==='function')fracBind(w);",'fracBind(w)')

# V27.10 · QUITAR LO QUE NO ES DE UNA PIZZERÍA (perfil pizza)
PZ="(typeof isPizzaBuild==='function'&&isPizzaBuild())"
# editor del producto: sin «Grupo / bodega» ni «PLU de balanza»; ejemplo de presentación de pizzería
rep('p3-ops.js',' <div class="grid g3"><div><label for="pm-sub">Presentación (ej. 750 ml)</label>',
    ' <div class="grid ${'+PZ+'?\'g2\':\'g3\'}"><div><label for="pm-sub">Presentación (ej. ${'+PZ+'?\'Grande · 8 porciones\':\'750 ml\'})</label>','Grande · 8 porciones')
rep('p3-ops.js','<div><label for="pm-gr">Grupo / bodega (menú)</label>','<div ${'+PZ+'?\'hidden\':\'\'}><label for="pm-gr">Grupo / bodega (menú)</label>',"'hidden':''}><label for=\"pm-gr\">")
rep('p3-ops.js','<div><label for="pm-plu">PLU de balanza (si es por peso)</label>','<div ${'+PZ+'?\'hidden\':\'\'}><label for="pm-plu">PLU de balanza (si es por peso)</label>',"'hidden':''}><label for=\"pm-plu\">")
# sin canal mayorista activo no se muestran «Minorista / Mayorista» (caja, arqueo, clientes)
W="(typeof wsOn==='function'&&wsOn())"
rep('p3e-saledetail.js',' <div class="card kpi"><b>${money(T.ch.Minorista.t)}</b><span>Minorista (${T.ch.Minorista.n})</span></div><div class="card kpi"><b>${money(T.ch.Mayorista.t)}</b><span>Mayorista (${T.ch.Mayorista.n})</span></div>',
    ' ${'+W+'?`<div class="card kpi"><b>${money(T.ch.Minorista.t)}</b><span>Minorista (${T.ch.Minorista.n})</span></div><div class="card kpi"><b>${money(T.ch.Mayorista.t)}</b><span>Mayorista (${T.ch.Mayorista.n})</span></div>`:\'\'}','?`<div class="card kpi"><b>${money(T.ch.Minorista')
rep('p3e-saledetail.js','<div class="cjflt noprint"><div><label for="cjf-ch">Canal</label>','<div class="cjflt noprint"><div ${'+W+'?\'\':\'hidden\'}><label for="cjf-ch">Canal</label>',"?'':'hidden'}><label for=\"cjf-ch\">")
rep('p3k-owner.js',"${(typeof wsOnly==='function'&&wsOnly())?'':`<tr><td>Minorista</td>","${(typeof wsOnly==='function'&&wsOnly())||!"+W+"?'':`<tr><td>Minorista</td>","wsOnly())||!(typeof wsOn")
rep('p3k-owner.js'," if(!(typeof wsOnly==='function'&&wsOnly())){P('  Minorista : '"," if(!(typeof wsOnly==='function'&&wsOnly())&&"+W+"){P('  Minorista : '","wsOnly())&&(typeof wsOn")
rep('p6-loyalty.js',"((typeof wsOnly==='function'&&wsOnly())?'Clientes activos':","((typeof wsOnly==='function'&&wsOnly())||!"+W+"?'Clientes activos':","wsOnly())||!(typeof wsOn==='function'&&wsOn())?'Clientes activos'")
# Modelo de negocio: la pizzería vende al consumidor final (sin opciones de mayorista)
rep('p3k-owner.js',' const sec2=`<div class="bm-grid">',' const sec2='+PZ+'?`<p><b>Sólo minorista (consumidor final)</b> <span class="tag">fijo en este sistema</span></p><p class="sm mut">Una pizzería vende al consumidor final: salón, mostrador, delivery y PedidosYa.</p>`:`<div class="bm-grid">','Sólo minorista (consumidor final)</b>')
rep('p2c-ux.js',"'Medios de pago, recargos, fiado y mayorista',","("+PZ+"?'Medios de pago, recargos y fiado':'Medios de pago, recargos, fiado y mayorista'),",'Medios de pago, recargos y fiado')
# Periféricos: ticket de ejemplo con pizzas y sin balanza (una pizzería no vende por peso)
rep('p7-devices.js',"items:[{name:'Gin Beefeater + Cunnington Tónica (2.25 lt)',qty:1,price:3300000,disc:0},{name:'Pachamama',qty:2,price:700000,disc:70000}]",
    "items:"+PZ+"?[{name:'Pizza Di Parma · Grande',qty:1,price:2290000,disc:0},{name:'Mozzarella · Media',qty:2,price:950000,disc:0},{name:'Cerveza artesanal 473 ml',qty:2,price:520000,disc:270000}]:[{name:'Gin Beefeater + Cunnington Tónica (2.25 lt)',qty:1,price:3300000,disc:0},{name:'Pachamama',qty:2,price:700000,disc:70000}]",'Mozzarella · Media')
rep('p7-devices.js','<button class="btn" data-act="devScaleAuto">Balanza (reconoce Systel / Kretz)</button>','${'+PZ+'?\'\':\'<button class="btn" data-act="devScaleAuto">Balanza (reconoce Systel / Kretz)</button>\'}',"?'':'<button class=\"btn\" data-act=\"devScaleAuto\">")
rep('p7-devices.js',"${IS_CLIENT?'':'<button class=\"btn\" data-act=\"devSimScale\">Balanza simulada (demo)</button>'}","${IS_CLIENT||"+PZ+"?'':'<button class=\"btn\" data-act=\"devSimScale\">Balanza simulada (demo)</button>'}","IS_CLIENT||(typeof isPizzaBuild")
rep('p7-devices.js',' Etiquetas EAN-13 de balanza: ver «Balanza y etiquetas».</p>','${'+PZ+'?\'\':\' Etiquetas EAN-13 de balanza: ver «Balanza y etiquetas».\'}</p>',"?'':' Etiquetas EAN-13")
rep('p7-devices.js',' ${scaleCardHtml()}',' ${'+PZ+'?\'\':scaleCardHtml()}',"?'':scaleCardHtml()}")
rep('p2c-ux.js',"dispositivos:'Impresoras, balanzas, lectores y diseño del ticket.',","dispositivos:"+PZ+"?'Impresoras de comandas y tickets, cajón, lectores y diseño del ticket.':'Impresoras, balanzas, lectores y diseño del ticket.',",'Impresoras de comandas y tickets')
rep('p7-devices.js','Cada impresora, balanza y lector se prueba','Cada impresora${'+PZ+'?\'\':\', balanza\'} y lector se prueba',"Cada impresora${")
rep('p3b-pos.js','Combo: descuenta ${esc(kitTxt(q))}','Combo: descuenta ${esc(kitTxt(l.frac?{kit:q.kit.map(k=>({pid:k.pid,qty:Math.round(k.qty*l.frac*1000)/1000}))}:q))}','kitTxt(l.frac?')
if os.path.exists(os.path.join(D,'p11d-config-ux.js')):os.remove(os.path.join(D,'p11d-config-ux.js'))
print('capa Di Parma aplicada en',D)
