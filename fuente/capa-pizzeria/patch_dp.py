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
for a,b in [('p11-pizza.js','p11-pizza.js'),('diparma-logo.webp','assets/diparma-logo.webp')]:
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
      "parts=[p for p in parts if os.path.exists(p)]\nif PROFILE=='pizza': parts.insert(parts.index('p5c-menusec.js'),'p11-pizza.js')",1)
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
dst=os.path.join(D,'capa-pizzeria')
if os.path.abspath(dst)!=os.path.abspath(here):
    os.makedirs(dst,exist_ok=True)
    for f in os.listdir(here):
        if os.path.isfile(os.path.join(here,f)):shutil.copy(os.path.join(here,f),os.path.join(dst,f))
print('capa Di Parma aplicada en',D)
