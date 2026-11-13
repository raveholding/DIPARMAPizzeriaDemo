/* ===== p11a · DATOS · Capa GASTRONÓMICA Di Parma Pizzería de masa madre (perfil `pizza` = DIPARMAPizzeriaDemo) =====
   Rubro sobre la base genérica de un solo dueño del Sistema VB (raveV2). Todo lo general (Vender, Gestión de caja con
   tablero del turno, Club completo, Recursos Humanos, Atención al cliente, Compras, ARCA, Ctrl + K, tema claro/oscuro) es
   el del núcleo, sin copias. Esta capa suma sólo lo propio de una pizzería:
   · Salón y barra (mesas con QR/NFC y estado en vivo) · Mozo · Comandas (circuito Mesa → Mozo → Caja → Cocina → Listo → Servido)
   · Cocina (tiempos con cuenta regresiva) · Delivery y PedidosYa (cadetes propios; PedidosYa simulado) · Fermentación de masa madre
   · Fichas técnicas: cada plato es un COMBO del núcleo (p.kit) armado con los insumos de cocina, así que al cobrar se descuentan
     solos los insumos y los bollos (el mismo motor de stock del sistema). · Asistente de comandas por texto o voz (sólo personal).
   La cuenta de una mesa se cobra en Vender: pagos mixtos, vuelto, cupón, sellos, nivel, monedero, factura ARCA y caja de siempre.
   Reglas Sistema VB: datos rotulados «ejemplo»; PedidosYa y ARCA son demostración (nada simula un cobro o un CAE reales);
   auditoría encadenada en cada paso de la comanda. */
function isPizzaBuild(){return !!(typeof window!=='undefined'&&window.RAVE_BUILD&&window.RAVE_BUILD.profile==='pizza');}
const DPM=60000,DPH=3600000,DPD=864e5;
const dpPad=n=>String(n).padStart(2,'0');
const dpMMSS=ms=>{const neg=ms<0;ms=Math.abs(ms);const s=Math.floor(ms/1000),m=Math.floor(s/60);return (neg?'+':'')+(m>=60?Math.floor(m/60)+':'+dpPad(m%60):m)+':'+dpPad(s%60);};
const dpHrs=ms=>{const h=ms/DPH;return h<1?Math.round(ms/DPM)+' min':(h<10?Math.round(h*10)/10:Math.round(h))+' h';};
const dpAgo=t=>{const m=Math.floor((now()-t)/DPM);if(m<1)return 'recién';if(m<60)return 'hace '+m+' min';const h=Math.floor(m/60);return 'hace '+h+' h'+(m%60?' '+dpPad(m%60):'');};
const dpNorm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
const dpFirst=n=>String(n||'').split(/[ ·(]/)[0];
const dpQ=(q,u)=>{q=+q||0;if(u==='kg')return q<1?Math.round(q*1000)+' g':(Math.round(q*100)/100).toLocaleString('es-AR')+' kg';if(u==='l')return q<1?Math.round(q*1000)+' ml':(Math.round(q*100)/100).toLocaleString('es-AR')+' l';return (q%1?Math.round(q*10)/10:q)+' u';};
Object.assign(IC,{salon:'M4 9c0-2 3.6-3.5 8-3.5s8 1.5 8 3.5-3.6 3.5-8 3.5S4 11 4 9zM12 12.5V20M8 20h8M4 9v3M20 9v3',
 mozo:'M12 3.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6M6 21v-5a6 6 0 0 1 12 0v5M9 14l3 3 3-3',
 cocina:'M3 18h18M5 18a7 7 0 0 1 14 0M12 8V5M10 5h4M8 14h.01M12 12h.01M15 14h.01',
 ferm:'M8 3h8M9 3v4.5L5 18a2 2 0 0 0 1.9 3h10.2A2 2 0 0 0 19 18l-4-10.5V3M7 14h10',
 ficha:'M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h7',
 voz:'M9 3h6v11H9zM5 11a7 7 0 0 0 14 0M12 18v3M9 21h6',
 flow:'M4 6h5v5H4zM15 6h5v5h-5zM9.5 13h5v5h-5zM9 8.5h6M17.5 11l-3 3M6.5 11l3 3'});

/* ---------- permisos y roles propios ---------- */
if(isPizzaBuild()){Object.assign(PERMS,{dp_salon:'Salón: ver mesas y comandas, abrir mesas y cargar pedidos',dp_mozo:'Mozo: validar en la mesa los pedidos del QR y servir',
 dp_caja:'Caja de la pizzería: confirmar comandas, despachar delivery y cancelar',dp_cocina:'Cocina: aceptar comandas, asignar el tiempo de entrega y marcar listo',
 dp_ferm:'Fermentación de masa madre (lotes, madre, temperaturas)',dp_fichas:'Fichas técnicas y escandallos (costos y recetas)'});}
const DP_ROLE_LBL={admin:'Administración',supervisor:'Supervisor',mostrador:'Caja',mozo:'Mozo',cocina:'Cocina',empleado:'Empleado'};
function dpRol(){const r=user&&user.role||'';return r==='admin'||r==='supervisor'?'admin':r==='mostrador'?'caja':r;}
const dpCan=p=>!!user&&can(p);
const dpActor=()=>user?dpFirst(user.name)==='ADMIN'?'Administración':user.name:'Sistema';

/* ---------- catálogo de ejemplo (insumos, platos con su ficha, adicionales, bebidas) ---------- */
const DP_CATS=[['dp-piz','Pizzas de masa madre','#c2410c','Pizzas','grid'],['dp-ent','Entradas','#a16207','Entradas','grid'],['dp-czn','Calzones','#b45309','Calzones','grid'],
 ['dp-pos','Postres','#9d174d','Postres','grid'],['dp-beb','Bebidas','#1d4ed8','Bebidas','grid'],['dp-adi','Adicionales','#4d7c0f','Adicionales','rows'],
 ['dp-mas','Masa madre','#7c2d12','Masa madre','rows'],['dp-ins','Insumos de cocina','#57534e','Insumos','rows']];
/* [id, nombre, unidad (kg|l|u), costo por unidad ($), proveedor, stock, mínimo] — costos y stock INVENTADOS para la demo */
const DP_INS=[['harina','Harina 00 italiana','kg',1600,'pv1',38,15],['sal','Sal marina fina','kg',600,'pv6',4,0.8],['salsa','Salsa San Marzano','kg',4200,'pv4',9,4],
 ['muzza','Muzzarella fior di latte','kg',9800,'pv2',14,6],['crudo','Jamón crudo estacionado','kg',29000,'pv3',2.6,1.2],['rucula','Rúcula fresca','kg',12000,'pv4',0.9,0.4],
 ['parm','Parmesano reggiano','kg',31000,'pv2',1.4,0.6],['cebolla','Cebolla blanca','kg',1100,'pv4',6,2.5],['calab','Longaniza calabresa','kg',16000,'pv3',2.4,1],
 ['aceit','Aceitunas negras','kg',10000,'pv5',1.5,0.5],['tomate','Tomate perita','kg',2400,'pv4',5,2],['albahaca','Albahaca fresca','kg',26000,'pv4',0.26,0.15],
 ['hongos','Hongos portobello','kg',14000,'pv4',1.8,0.8],['oliva','Aceite de oliva extra virgen','l',14000,'pv5',4.2,1.5],['roque','Roquefort','kg',22000,'pv2',0.9,0.5],
 ['provo','Provolone','kg',18000,'pv2',1.1,0.5],['peppe','Salame picante (pepperoni)','kg',21000,'pv3',0.7,0.8],['morron','Morrón asado','kg',6000,'pv4',1.6,0.6],
 ['huevo','Huevo de campo','u',280,'pv4',60,30],['burrata','Burrata 125 g','u',4600,'pv2',9,6],['garban','Harina de garbanzo','kg',3000,'pv5',4,1.5],
 ['mascar','Mascarpone','kg',14000,'pv2',1.2,0.6],['cafe','Café espresso','l',3000,'pv5',3,1],['carne','Carne cortada a cuchillo','kg',14000,'pv3',3.2,1.5],
 ['aji','Ají molido salteño','kg',8000,'pv5',0.5,0.15],['choco','Crema de avellanas','kg',18000,'pv5',1.8,0.8],['limon','Limón','u',260,'pv4',40,20],['vino','Malbec de Cafayate (botella 750 ml)','u',6000,'pv7',12,6]];
/* platos: [id, categoría, nombre, descripción, precio grande ($), ficha en gramos/ml/unidades, bollos, arte, opciones] */
const DP_DISH=[
 ['p_dip','dp-piz','Di Parma','La de la casa: San Marzano, fior di latte, jamón crudo, rúcula y lascas de parmesano.',22900,{salsa:110,muzza:130,crudo:70,rucula:20,parm:15,oliva:8},1,{pizza:{seed:5,tops:[['ham',7],['rucula',12],['parm',14]]}},{sizes:1,star:1}],
 ['p_marg','dp-piz','Margherita','Salsa de tomate San Marzano, fior di latte, albahaca fresca y oliva.',15500,{salsa:120,muzza:140,albahaca:4,oliva:8},1,{pizza:{seed:2,tops:[['basil',7]]}},{sizes:1}],
 ['p_nap','dp-piz','Napolitana','Fior di latte, rodajas de tomate perita, ajo y albahaca.',17200,{salsa:100,muzza:130,tomate:120,albahaca:3,oliva:6},1,{pizza:{seed:7,tops:[['tomato',8],['basil',5]]}},{sizes:1}],
 ['p_fug','dp-piz','Fugazzeta','Doble muzzarella con cebolla blanca y orégano, sin salsa.',16900,{muzza:180,cebolla:150,oliva:10},1,{pizza:{seed:9,sauce:false,tops:[['onion',20]]}},{sizes:1}],
 ['p_cal','dp-piz','Calabresa','Longaniza calabresa, morrón asado y fior di latte.',18400,{salsa:110,muzza:130,calab:80,morron:40},1,{pizza:{seed:4,tops:[['pep',9],['pepper',6]]}},{sizes:1}],
 ['p_4q','dp-piz','Cuatro quesos','Fior di latte, roquefort, provolone y parmesano.',19800,{salsa:80,muzza:100,roque:40,provo:40,parm:20},1,{pizza:{seed:11,tops:[['blue',9],['parm',14]]}},{sizes:1}],
 ['p_dia','dp-piz','Diavola','Salame picante, ají molido salteño y miel de caña.',18900,{salsa:110,muzza:130,peppe:70,aji:2},1,{pizza:{seed:13,tops:[['pep',13]]}},{sizes:1}],
 ['p_hon','dp-piz','Funghi','Portobellos salteados, fior di latte y aceite de oliva.',18600,{salsa:100,muzza:130,hongos:110,oliva:8},1,{pizza:{seed:15,tops:[['mush',10]]}},{sizes:1}],
 ['p_sal','dp-piz','Salteña','Carne cortada a cuchillo, cebolla de verdeo, huevo, aceitunas y ají molido.',19500,{salsa:100,muzza:120,carne:110,cebolla:40,huevo:1,aceit:20,aji:2},1,{pizza:{seed:17,tops:[['meat',14],['olive',6],['egg',1]]}},{sizes:1}],
 ['p_ort','dp-piz','Ortolana','Morrón, hongos, cebolla y tomate asados. Vegetariana.',17800,{salsa:100,muzza:120,morron:50,hongos:50,cebolla:40,tomate:60},1,{pizza:{seed:19,tops:[['pepper',5],['mush',5],['tomato',4],['onion',6]]}},{sizes:1}],
 ['e_foc','dp-ent','Focaccia de masa madre','Con romero, sal en escamas y oliva. Para compartir.',7500,{oliva:20,sal:3},1,{dish:'focaccia'},{}],
 ['e_fai','dp-ent','Fainá','Porción de fainá crocante, ideal arriba de la pizza.',4200,{garban:90,oliva:15},0,{dish:'faina'},{}],
 ['e_bur','dp-ent','Burrata con tomates','Burrata entera, tomates perita, albahaca y oliva.',14500,{burrata:1,tomate:120,albahaca:3,oliva:10},0,{dish:'burrata'},{}],
 ['c_nap','dp-czn','Calzone napolitano','Cerrado al horno: fior di latte, tomate, crudo y albahaca.',17500,{salsa:60,muzza:140,crudo:40,tomate:60},1,{dish:'calzone'},{}],
 ['d_tir','dp-pos','Tiramisú','Mascarpone, espresso y cacao amargo.',7900,{mascar:90,cafe:40,huevo:1},0,{dish:'tiramisu'},{}],
 ['d_nut','dp-pos','Pizza de avellanas','Masa madre con crema de avellanas y azúcar impalpable.',11500,{choco:80},0.5,{dish:'nutella'},{}],
 ['b_vin','dp-beb','Copa de Malbec','Malbec de Cafayate.',6000,{vino:0.2},0,{dish:'vino'},{alc:1}],
 ['b_lim','dp-beb','Limonada con jengibre','Jarra individual.',4500,{limon:1},0,{dish:'limonada'},{}]];
/* bebidas que se compran hechas: artículo con stock propio (no llevan ficha) — [id, nombre, precio, costo, stock, arte, alcohol] */
const DP_DRINK=[['b_cer','Cerveza artesanal 473 ml',5200,2300,46,'cerveza',1],['b_gas','Gaseosa 500 ml',3200,950,60,'gaseosa',0],['b_agu','Agua 500 ml',2500,560,52,'agua',0]];
const DP_EXTRA=[['x_muz','Extra muzzarella',2500,{muzza:60}],['x_cru','Jamón crudo',4200,{crudo:40}],['x_hue','Huevo frito',1500,{huevo:1}],['x_ruc','Rúcula',1200,{rucula:20}],
 ['x_ace','Aceitunas',1200,{aceit:25}],['x_bur','Burrata entera',6500,{burrata:1}],['x_aji','Ají picante',500,{aji:2}],['x_sal','Doble salsa',900,{salsa:60}]];
const DP_PROV=[['pv1','Molinos del Valle de Lerma','Harinas','387 421-1100','ventas@molinosvalle.example',0],['pv2','Lácteos La Quebrada','Quesos y lácteos','387 431-2200','pedidos@laquebrada.example',18450000],
 ['pv3','Fiambres de Cafayate','Fiambres y carnes','3868 42-1300','fiambres@cafayate.example',0],['pv4','Mercado San Miguel · Puesto 14','Verdulería','387 415-3300','puesto14@mercado.example',3120000],
 ['pv5','Almacén Gourmet del Norte','Secos, aceites y café','387 422-4400','hola@gourmetnorte.example',0],['pv6','Salinas Grandes SRL','Sal','388 449-5500','ventas@salinas.example',0],
 ['pv7','Cervecería Lerma & Bodega Cafayate','Cervezas y vinos','387 433-6600','distribucion@lerma.example',9600000],['pv8','Distribuidora Norte Bebidas','Gaseosas y aguas','387 424-7700','pedidos@nortebebidas.example',0]];
const DP_IND=0.55,DP_INDB=0.5; /* la individual usa el 55 % de los ingredientes y medio bollo */
const dpIndPrice=p=>Math.round(p*.62/100)*100;
function dpCuit(i){const b='3071'+String(1000000+i*7919).slice(-6);const w=[5,4,3,2,7,6,5,4,3,2];for(let x=0;x<20;x++){const s=b.slice(0,9)+x%10;let t=0;for(let k=0;k<10;k++)t+=w[k]*(+s[k]);let d=11-(t%11);if(d===11)d=0;if(d<10)return s+d;}return '30712345671';}
/* ficha (g, ml o u) → componentes del combo (kg, l o u) */
function dpKit(f,k,bollo){const L=[];Object.entries(f).forEach(([i,q])=>{const it=DP_INS.find(x=>x[0]===i);if(!it)return;const qq=it[2]==='u'?q*k:q*k/1000;L.push({pid:'in-'+i,qty:Math.round(qq*10000)/10000});});
 if(bollo)L.unshift({pid:'dp-bollo',qty:bollo});return L;}
function dpCatalog(){const P=[];const ean=i=>typeof soloEan==='function'?soloEan(300+i):'';let n=0;
 DP_DISH.forEach(([id,cat,nm,desc,price,f,bol,art,o])=>{
  P.push({id,name:nm,sub:o.sizes?'Grande · 8 porciones':'',grupo:'',rubro:cat,price:price*100,cost:0,stock:0,unit:'u',barcode:ean(n++),plu:'',menu:true,active:true,desc,featured:!!o.star,demo:true,kit:dpKit(f,1,bol),dp:{art,sizes:!!o.sizes,alc:!!o.alc,star:!!o.star}});
  if(o.sizes)P.push({id:id+'_i',name:nm,sub:'Individual · 4 porciones',grupo:'',rubro:cat,price:dpIndPrice(price)*100,cost:0,stock:0,unit:'u',barcode:ean(n++),plu:'',menu:false,active:true,desc,demo:true,kit:dpKit(f,DP_IND,bol*DP_INDB),dp:{art,of:id,ind:1}});});
 DP_DRINK.forEach(([id,nm,price,cost,st,art,alc])=>P.push({id,name:nm,sub:'',grupo:'',rubro:'dp-beb',price:price*100,cost:cost*100,stock:st,unit:'u',barcode:ean(n++),plu:'',menu:true,active:true,desc:'',demo:true,dp:{art:{dish:art},alc:!!alc}}));
 DP_EXTRA.forEach(([id,nm,price,f])=>P.push({id,name:nm,sub:'adicional',grupo:'',rubro:'dp-adi',price:price*100,cost:0,stock:0,unit:'u',barcode:'',plu:'',menu:false,active:true,desc:'',demo:true,kit:dpKit(f,1,0),dp:{extra:1}}));
 /* masa madre e insumos: no se venden en la grilla de Vender (se descuentan por la ficha) */
 P.push({id:'dp-bollo',name:'Bollo de masa madre',sub:'260 g · 70 % hidratación',grupo:'',rubro:'dp-mas',price:120000,cost:Math.round(dpBolloCost()/100)*100,stock:64,unit:'u',barcode:'',plu:'',menu:false,active:true,desc:'',demo:true,posHide:true,dp:{bollo:1}});
 DP_INS.forEach(([id,nm,u,c,pv,st,min])=>P.push({id:'in-'+id,name:nm,sub:'insumo',grupo:'',rubro:'dp-ins',price:Math.round(c*1.35)*100,cost:c*100,stock:st,unit:u,barcode:'',plu:'',menu:false,active:true,desc:'',demo:true,posHide:true,min,dp:{ins:id,pv}}));
 return P;}
function dpBolloCost(){const fl=0.26/(1+0.70+0.028+0.2);return (fl*1600+fl*0.028*600)*100;} /* harina + sal por bollo (centavos) */

/* ---------- personal de ejemplo (legajos del núcleo con su rol en el salón) ---------- */
const DP_STAFF=[['e1','Valentina Ríos','admin','pu_soc','Dueña · administración','12:00','20:00',1],['e2','Gabriel Toro','admin','pu_sup','Supervisor de turno','18:30','23:15',2],
 ['e3','Martín Guzmán','mozo','pu_sal','Mozo · salón 1-5','19:00','23:15',1],['e4','Sofía Cardozo','mozo','pu_sal','Moza · salón 6-10 y exterior','19:00','23:15',3],['e5','Joaquín Aráoz','mozo','pu_sal','Barra','19:00','23:15',4],
 ['e6','Camila Ortiz','caja','pu_caj','Caja','19:00','23:15',1],['e7','Franco Medina','cocina','pu_coc','Pizzaiolo','18:00','23:00',1],['e8','Lucía Vera','cocina','pu_coc','Cocina · masas','11:00','19:00',2],
 ['e9','Lucas Mamaní','cadete','pu_rep','Cadete · moto','19:30','23:15',1],['e10','Ramiro Sosa','cadete','pu_rep','Cadete · moto','19:30','23:15',3],
 ['e11','Brenda Quispe','cocina','pu_coc','Ayudante de cocina','18:00','23:00',4],['e12','Diego Flores','mozo','pu_sal','Bachero y apoyo de salón','19:00','23:15',2]];
const dpEmp=id=>S.employees.find(e=>e.id===id);
const dpEmpN=id=>{const e=dpEmp(id);return e?String(e.name).replace(/ \(ejemplo\)$/,''):'—';};
const dpStaffOf=r=>S.employees.filter(e=>e.active&&e.dpRol===r);

/* ---------- base de la demo (después de soloBase; antes de RR. HH.) ---------- */
function pizzaBase(d){if(typeof window==='undefined'||!window.__dpReady)return d;
 const NM='Di Parma';
 d.tenant=Object.assign({},d.tenant,{name:NM,legal:'Di Parma Pizzería (demo de ejemplo)',slogan:'Pizzería de masa madre · Salta',address:'Balcarce 850, Salta Capital (dato de ejemplo)',wa:'',phone:'',caja:1,ig:'',fb:''});
 d.menu=Object.assign({},d.menu,{title:'DI PARMA',sub:{es:'Pizzería de masa madre',en:'Sourdough pizzeria'},footer:{es:'Di Parma Pizzería · demo de evaluación',en:'Di Parma Pizzeria · evaluation demo'},
  pitch:{es:'Masa madre de **48 a 72 h** de maduración en frío y horno a 450 °C.',en:'Sourdough fermented **48 to 72 h** and a 450 °C oven.'},promo:{on:true,es:'**10 % off** en tu primera visita como socio con **BIENVENIDA10**',en:'**10 % off** your first visit as a member with **BIENVENIDA10**'},mapQuery:'Balcarce 850, Salta',mapUrl:'',reviewUrl:'',social:[],wifi:{on:false,ssid:'',pass:'',example:false}});
 const keep=d.rubros.filter(r=>r.kind==='cobr'||r.kind==='shared'||r.kind==='sysgen');
 d.rubros=DP_CATS.map(([id,name,color,mNom,layout])=>({id,name,color,mNom,mTitle:name,layout,owner:'',reparte:false,kind:'rubro',mHint:'',alcohol:id==='dp-beb',active:true})).concat(keep);
 d.products=dpCatalog();
 d.cfg.comboSeeded=1;d.cfg.negStock=true;d.cfg.ticket=Object.assign({},d.cfg.ticket||{},{msg:'¡Gracias por elegir Di Parma! Masa madre de 48 a 72 h.'});
 d.coupons=[{id:'cp1',code:'BIENVENIDA10',type:'pct',value:10,min:0,from:'',to:'',maxUses:0,perCust:1,aud:'todos',active:true,public:true,note:'10 % en la primera visita como socio',uses:[]},
  {id:'cp2',code:'MARTESMADRE',type:'pct',value:15,min:2000000,from:'',to:'',maxUses:0,perCust:0,aud:'todos',active:true,public:true,note:'15 % los martes en pizzas grandes (compra mínima $ 20.000)',uses:[]},
  {id:'cp3',code:'CUMPLE',type:'fixed',value:600000,min:1500000,from:'',to:'',maxUses:0,perCust:1,aud:'todos',active:true,public:false,note:'$ 6.000 de regalo en tu cumpleaños',uses:[]}];
 d.plans=[{id:'pl1',name:'Socio Di Parma Plus',price:450000,period:'mes',pct:5,desc:'5 % en todas las visitas y una fainá de regalo por mes (ejemplo)',active:true}];
 d.loyalty=Object.assign({},d.loyalty,{goal:8,reward:'Una pizza Margherita grande de regalo',ledger:[],usedOtp:{}});
 d.puestos=[{id:'pu_soc',name:'Dueña',parent:'',holders:''},{id:'pu_sup',name:'Supervisión de turno',parent:'pu_soc',holders:''},{id:'pu_sal',name:'Salón y barra',parent:'pu_sup',holders:''},
  {id:'pu_caj',name:'Caja',parent:'pu_sup',holders:''},{id:'pu_coc',name:'Cocina y masas',parent:'pu_sup',holders:''},{id:'pu_rep',name:'Reparto',parent:'pu_sup',holders:''}];
 const depOf={admin:'Caja y administración',caja:'Caja y administración',mozo:'Salón',cocina:'Cocina',cadete:'Reparto'};
 d.employees=DP_STAFF.map(([id,name,rol,pu,cargo,f,t,off],i)=>({id,name:name+' (ejemplo)',puestoId:pu,rate:[0,420000,330000,330000,330000,340000,380000,350000,300000,300000,290000,280000][i],pin:String(4100+i*13),active:true,dpRol:rol,cargo,dept:depOf[rol],dpFrom:f,dpTo:t,dpOff:off}));
 d.tasks=[{id:'t1',title:'Refrescar la madre (Mamma) y anotar la temperatura',puestoId:'pu_coc',freq:'daily',active:true},{id:'t2',title:'Controlar la temperatura de la cámara de bollos',puestoId:'pu_coc',freq:'daily',active:true},
  {id:'t3',title:'Abrir caja y controlar el cambio',puestoId:'pu_caj',freq:'daily',active:true},{id:'t4',title:'Armar mesas, QR y tags NFC de cada mesa',puestoId:'pu_sal',freq:'daily',active:true},
  {id:'t5',title:'Pedido de quesos a Lácteos La Quebrada',puestoId:'pu_sup',freq:'weekly',dow:2,active:true},{id:'t6',title:'Limpieza profunda del horno',puestoId:'pu_coc',freq:'weekly',dow:1,active:true}];
 d.users=[{id:'u1',name:'ADMIN',role:'admin',pin:'1234',email:'valentina.rios@diparma.example'},{id:'u2',name:'Supervisor',role:'supervisor',pin:'1111',email:'gabriel.toro@diparma.example'},{id:'u3',name:'Caja · Camila',role:'mostrador',pin:'0000',empId:'e6',email:'camila.ortiz@diparma.example'},
  {id:'u4',name:'Mozo · Martín',role:'mozo',pin:'2222',empId:'e3',email:'martin.guzman@diparma.example'},{id:'u5',name:'Moza · Sofía',role:'mozo',pin:'3333',empId:'e4'},{id:'u6',name:'Barra · Joaquín',role:'mozo',pin:'4444',empId:'e5'},
  {id:'u7',name:'Cocina · Franco',role:'cocina',pin:'5555',empId:'e7',email:'franco.medina@diparma.example'},{id:'u8',name:'Cocina · Lucía',role:'cocina',pin:'6666',empId:'e8'},{id:'u-emp',name:'Portal del empleado',role:'empleado',pin:'7777',empId:'e12'},
  {id:'u9',name:'Cadete · Lucas',role:'repartidor',pin:'8888',empId:'e9',email:'lucas.mamani@diparma.example'},{id:'u10',name:'Cadete · Ramiro',role:'repartidor',pin:'9999',empId:'e10'}];
 d.roles=d.roles||{};const add=(r,L)=>{d.roles[r]=Array.from(new Set((d.roles[r]||[]).concat(L)));};
 add('admin',['dp_salon','dp_mozo','dp_caja','dp_cocina','dp_ferm','dp_fichas']);add('supervisor',['dp_salon','dp_mozo','dp_caja','dp_cocina','dp_ferm','dp_fichas']);
 add('mostrador',['dp_salon','dp_caja']);
 d.roles.mozo=['dp_salon','dp_mozo','tasks','customers'];d.roles.cocina=['dp_salon','dp_cocina','dp_ferm','tasks'];
 d.branches=[];d.registers=[];d.sessions=[];
 /* V27.9 · reparto del núcleo (V26.69: bandeja, hoja de ruta, copiloto del cadete, rendición ciega) con los datos de la pizzería */
 d.cfg.rep={on:true,menu:true,origen:{dir:'Balcarce 850, Salta (ejemplo)',lat:-24.7795,lng:-65.4112},
  zonas:[{id:'zc',nombre:'Centro y Balcarce',tarifa:120000,minimo:0,eta:'25-35 min',radio:2,activo:true},{id:'zn',nombre:'Barrios cercanos',tarifa:200000,minimo:1500000,eta:'35-45 min',radio:4,activo:true},{id:'zl',nombre:'Tres Cerritos y Grand Bourg',tarifa:320000,minimo:2500000,eta:'45-60 min',radio:7,activo:true}],
  reps:[{id:'rp1',nombre:'Lucas Mamaní',tel:'3874000001',veh:'Moto',cap:4,fijo:90000,pct:0,login:'u9',activo:true},{id:'rp2',nombre:'Ramiro Sosa',tel:'3874000002',veh:'Moto',cap:4,fijo:90000,pct:0,login:'u10',activo:true}],
  cap:4,ausenteMin:5,pin:true,foto:false,cobro:{alias:'diparma.pizza.mp (demo)',titular:'Di Parma Pizzería (demo)',qrImg:''},con:{mapas:'free',cobro:'free',wa:'free',nav:'gmaps',test:{}},ausentePaga:false,rubro:'gastronomia',
  pick:'cerveza, gaseosa, agua, vino, limonada, postre, tiramisú, fainá, ají, salsa, servilleta, caja de pizza'};
 d.envios=[];d.rutas=[];d.rendRep=[];
 /* proveedores reales del módulo de compras (con CUIT válido de ejemplo) */
 d.suppliers=DP_PROV.map(([id,n,rubro,tel,mail,saldo],i)=>({id,razon:n,cuit:dpCuit(i+1),iva:i%3?'Responsable Inscripto':'Monotributista',email:mail,tel,dir:'Salta (ejemplo) · '+rubro,saldo,activo:true,ts:now()-90*DPD}));
 d.supLedger=d.suppliers.filter(s=>s.saldo>0).map((s,i)=>({id:'sl'+i,seq:i+1,provId:s.id,tipo:'Factura',monto:s.saldo,saldo:s.saldo,ts:now()-(3+i*4)*DPD,ref:'FC A 0004-000'+(1210+i)+' (ejemplo)'}));
 d.dp=null;
 return d;}
/* después de los ejemplos generales: clientes del Club, ventas de los últimos días y caja abierta del turno */
function pizzaExtras(){if(!isPizzaBuild())return;const t0=now();let seed=29;const R=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};
 const SO=[['Agustina','Paz','1992-05-12','6001001',true,23],['Nicolás','Lamas','1988-10-24','6001002',true,8],['Familia','Arias','1979-02-03','6001003',true,30],['Belén','Toledo','2000-11-18','6001004',false,3],
  ['Gonzalo','Ibáñez','1985-07-30','6001005',true,12],['Carolina','Méndez','1995-03-09','6001006',true,6],['Federico','Rojas','1990-12-01','6001007',false,4],['Paula','Giménez','1983-08-21','6001008',true,10],
  ['Marcos','Villalba','1997-01-15','6001009',true,2],['Julieta','Sarmiento','1999-06-27','6001010',true,5]];
 const ago=180*DPD;S.customers=SO.map(([n,l,b,w,c,v],i)=>({id:'dpc'+(i+1),num:i+1,name:n,last:l+' (ejemplo)',birth:b,wa:'+549387'+w,dni:String(30111000+i*7351),cards:[],cardSecrets:{},origin:'ejemplo',
  consent:{club:true,comm:c,analytics:false,version:'v1-2026-demo',ts:t0-ago},ts:t0-ago+i*9*DPD,status:'activo',limit:i===2?8000000:0,secret:'dp-'+i+'-tarjeta-ejemplo-0000',notes:i===0?'Le gusta la Di Parma bien cocida (ejemplo)':'',channel:'minorista'}));
 /* cumpleaños de hoy para probar el beneficio */
 {const td=dkey(t0);S.customers[3].birth='2000'+td.slice(4);}
 S.members=[{id:'mdp1',cust:'dpc1',plan:'pl1',from:t0-12*DPD,to:t0+18*DPD,status:'activa',method:'efectivo',price:450000,terms:'ejemplo'}];
 const L=[];SO.forEach((x,i)=>{const k=Math.min(7,Math.round(x[5]/4));for(let j=0;j<k;j++)L.push({id:uid(),cust:'dpc'+(i+1),ts:t0-(30-j*3)*DPD,kind:'stamp',n:1,ref:'ejemplo',user:'sistema'});});S.loyalty.ledger=L;
 /* ventas de ejemplo de los últimos 10 días (no tocan stock ni caja) */
 S.sales=S.sales.filter(s=>!s.demo);S.seq[S.tenant.caja]=0;
 const pool=S.products.filter(p=>p.menu&&p.active&&!p.posHide&&p.price>0);const ind=S.products.filter(p=>p.dp&&p.dp.ind);
 if(!S.sessions.some(s=>s.id==='hist-demo'))S.sessions.push({id:'hist-demo',caja:S.tenant.caja,openedBy:'ADMIN',openedAt:t0-12*DPD,opening:0,closedAt:t0-DPD,demo:true});
 const met=['efectivo','efectivo','qr','debito','credito','transferencia','qr','efectivo'];
 for(let dd=10;dd>=1;dd--){const dow=new Date(t0-dd*DPD).getDay();if(dow===1)continue;const nS=(dow===5||dow===6?14:8)+Math.floor(R()*6);
  for(let k=0;k<nS;k++){const items=[];const nl=1+Math.floor(R()*3);for(let j=0;j<nl;j++){const p=R()<.18?ind[Math.floor(R()*ind.length)]:pool[Math.floor(R()*pool.length)];if(!p||items.some(i=>i.pid===p.id))continue;
    items.push({pid:p.id,name:pfull(p),rubro:p.rubro,qty:1+Math.floor(R()*2),price:p.price,cost:isKit(p)?kitCost(p):p.cost,list:p.price,disc:0});}
   if(!items.length)continue;const total=items.reduce((a,i)=>a+Math.round(i.qty*i.price),0);S.seq[S.tenant.caja]++;
   const ts=new Date(t0-dd*DPD).setHours(19+Math.floor(R()*5),Math.floor(R()*60),0,0);const cu=R()<.45?S.customers[Math.floor(R()*S.customers.length)]:null;
   S.sales.push({id:'hs'+dd+'_'+k,n:S.tenant.caja+'-'+S.seq[S.tenant.caja],ts,user:'Caja · Camila',caja:S.tenant.caja,sessId:'hist-demo',items,total,method:met[Math.floor(R()*met.length)],doc:'ticket_interno',status:'ok',fee:0,channel:R()<.12?'pedidosya':'local',
    cust:cu?cu.id:'',custName:cu?custFull(cu):'',coupon:'',benefit:null,recv:0,fiado:false,demo:true,pays:null,paid:total,balance:0,pstate:'pagada'});}}
 /* Agustina: socia frecuente (nivel Oro por consumo) */
 for(let j=0;j<6;j++){const p=S.products.find(x=>x.id==='p_dip');const ts=t0-(4+j*11)*DPD;S.seq[S.tenant.caja]++;
  S.sales.push({id:'hsag'+j,n:S.tenant.caja+'-'+S.seq[S.tenant.caja],ts,user:'Caja · Camila',caja:S.tenant.caja,sessId:'hist-demo',items:[{pid:p.id,name:pfull(p),rubro:p.rubro,qty:2,price:p.price,cost:kitCost(p),list:p.price,disc:0}],total:p.price*2,method:'qr',doc:'ticket_interno',status:'ok',fee:0,channel:'local',cust:'dpc1',custName:custFull(S.customers[0]),coupon:'',benefit:null,recv:0,fiado:false,demo:true,paid:p.price*2,balance:0,pstate:'pagada'});}
 S.sales.sort((a,b)=>a.ts-b.ts);
 /* caja del turno de hoy abierta por Camila (para cobrar mesas en el recorrido) */
 if(!S.sessions.some(s=>!s.closedAt&&!s.demo))S.sessions.push({id:'dp-turno',caja:S.tenant.caja,openedBy:'Caja · Camila',openedAt:t0-150*DPM,opening:3000000,closedAt:0});
 /* fichadas de hoy: el personal con turno ya empezado marcó la entrada (con una llegada tarde de ejemplo) */
 try{const td=dkey(t0);(S.hrShifts||[]).filter(sh=>sh.day===td).forEach((sh,i)=>{const a=new Date(td+'T'+sh.from+':00').getTime()+(i===2?17:i%3)*DPM;if(a>t0||S.punches.some(p=>p.empId===sh.empId&&dkey(p.ts)===td))return;
  S.punches.push({id:'hpt'+i,empId:sh.empId,ts:a,kind:'in',method:'pin kiosco',device:'ejemplo',by:'terminal'});});}catch(e){}
 dpSeed();}

