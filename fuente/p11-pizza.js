/* ===== V27.5 · Capa GASTRONÓMICA Di Parma Pizzería de masa madre (perfil `pizza` = DIPARMAPizzeriaDemo) =====
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
 d.users=[{id:'u1',name:'ADMIN',role:'admin',pin:'1234'},{id:'u2',name:'Supervisor',role:'supervisor',pin:'1111'},{id:'u3',name:'Caja · Camila',role:'mostrador',pin:'0000',empId:'e6'},
  {id:'u4',name:'Mozo · Martín',role:'mozo',pin:'2222',empId:'e3'},{id:'u5',name:'Moza · Sofía',role:'mozo',pin:'3333',empId:'e4'},{id:'u6',name:'Barra · Joaquín',role:'mozo',pin:'4444',empId:'e5'},
  {id:'u7',name:'Cocina · Franco',role:'cocina',pin:'5555',empId:'e7'},{id:'u8',name:'Cocina · Lucía',role:'cocina',pin:'6666',empId:'e8'},{id:'u-emp',name:'Portal del empleado',role:'empleado',pin:'7777',empId:'e12'}];
 d.roles=d.roles||{};const add=(r,L)=>{d.roles[r]=Array.from(new Set((d.roles[r]||[]).concat(L)));};
 add('admin',['dp_salon','dp_mozo','dp_caja','dp_cocina','dp_ferm','dp_fichas']);add('supervisor',['dp_salon','dp_mozo','dp_caja','dp_cocina','dp_ferm','dp_fichas']);
 add('mostrador',['dp_salon','dp_caja']);
 d.roles.mozo=['dp_salon','dp_mozo','tasks','customers'];d.roles.cocina=['dp_salon','dp_cocina','dp_ferm','tasks'];
 d.branches=[];d.registers=[];d.sessions=[];
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

/* ---------- estado de la capa (S.dp): mesas, comandas, carritos, cadetes, PedidosYa, fermentación ---------- */
const DP_ST={pend_mozo:{l:'Esperando al mozo',s:'Mozo',step:1,c:'#7c3aed'},pend_caja:{l:'En caja',s:'Caja',step:2,c:'#2563eb'},pend_cocina:{l:'Recibido en cocina',s:'Cocina',step:3,c:'#b45309'},
 preparando:{l:'En el horno',s:'Horno',step:4,c:'#c2410c'},listo:{l:'Listo',s:'Listo',step:5,c:'#15803d'},en_camino:{l:'En camino',s:'Reparto',step:5,c:'#0e7490'},
 entregado:{l:'Entregado',s:'Entregado',step:6,c:'#57534e'},cancelado:{l:'Cancelado',s:'Cancelado',step:0,c:'#b91c1c'}};
const DP_CH={qr:'QR / NFC',mozo:'Mozo',voz:'Asistente',pedidosya:'PedidosYa',delivery:'Delivery propio',web:'Carta web',mostrador:'Mostrador'};
const DP_ACTIVE=['pend_mozo','pend_caja','pend_cocina','preparando','listo','en_camino'];
function dpSeed(){const T=now();const D={v:1,seedAt:T,rev:T,tables:[],orders:[],carts:{},seq:{order:0,py:48210},notifs:[],nseq:0,
 cadetes:{e9:{estado:'disponible',ent:3,efectivo:0},e10:{estado:'disponible',ent:2,efectivo:980000}},py:{connected:true,autoAccept:true,demoFeed:false,lastSync:T-40000,comision:25},
 ferm:{bolloPeso:260,hidr:70,madre:{lastFeed:T-9*DPH,every:12,ratio:'1:2:2',hidr:100,temp:24,rise:2.3,feeds:[]},
  lotes:[{id:'L1021',start:T-80*DPH,hours:48,bollos:40,peso:260,hidr:70,temps:[4,4,4.5,4,4,4.2],note:'',ing:true},{id:'L1022',start:T-52*DPH,hours:48,bollos:60,peso:260,hidr:70,temps:[4,4.2,4,4.1,4,3.9,4],note:'Muy buen alveolado',ing:true},
   {id:'L1023',start:T-30*DPH,hours:48,bollos:36,peso:260,hidr:72,temps:[22,4,4.1,4,4.3],note:''},{id:'L1024',start:T-2*DPH,hours:72,bollos:48,peso:260,hidr:70,temps:[23,23.5],note:'Bloque a temperatura ambiente'}]}};
 const seats=[2,4,4,4,6,2,4,4,6,8];
 for(let i=1;i<=10;i++)D.tables.push({id:'I'+i,num:i,sector:'interior',label:'Mesa '+i,seats:seats[i-1],mozo:i<=5?'e3':'e4',session:null});
 for(let i=1;i<=3;i++)D.tables.push({id:'E'+i,num:i,sector:'exterior',label:'Exterior '+i,seats:4,mozo:'e4',session:null});
 for(let i=1;i<=5;i++)D.tables.push({id:'B'+i,num:i,sector:'barra',label:'Barra '+i,seats:1,mozo:'e5',session:null});
 S.dp=D;const tb=id=>D.tables.find(t=>t.id===id);
 const sess=(tid,mAgo,g)=>{const t=tb(tid);t.session={id:uid(),openedAt:T-mAgo*DPM,guests:g,call:false,bill:false};return t.session.id;};
 const Ln=(pid,qty,ex,note)=>({id:uid(),pid,qty,ex:ex||[],note:note||''});
 const O=o=>{D.seq.order++;const r=Object.assign({id:uid(),n:D.seq.order,channel:'mozo',tableId:null,sessionId:null,customer:null,items:[],status:'pend_caja',eta:null,etaAt:null,readyAt:null,log:[],mozo:null,cadete:null,paid:false,saleId:''},o);
  r.createdAt=T-(o.mAgo||0)*DPM;delete r.mAgo;r.log=(o._log||[]).map(([s,m,by])=>({s,t:T-m*DPM,by}));delete r._log;D.orders.push(r);return r;};
 let se=sess('I7',58,4);O({tableId:'I7',sessionId:se,mozo:'e4',channel:'qr',items:[Ln('p_dip',1),Ln('p_fug',1,['x_muz']),Ln('e_fai',2),Ln('b_cer',3)],status:'entregado',mAgo:52,eta:18,readyAt:T-30*DPM,_log:[['pend_mozo',52,'QR mesa 7'],['pend_caja',50,'Sofía'],['pend_cocina',49,'Camila'],['preparando',48,'Franco'],['listo',30,'Franco'],['entregado',29,'Sofía']]});tb('I7').session.bill=true;
 se=sess('I2',41,4);O({tableId:'I2',sessionId:se,mozo:'e3',items:[Ln('e_foc',1),Ln('e_bur',1),Ln('b_vin',2)],status:'entregado',mAgo:38,eta:10,readyAt:T-26*DPM,_log:[['pend_caja',38,'Martín'],['pend_cocina',37,'Camila'],['preparando',36,'Franco'],['listo',26,'Franco'],['entregado',25,'Martín']]});
 O({tableId:'I2',sessionId:se,mozo:'e3',items:[Ln('p_dip',1,[],'bien cocida'),Ln('p_marg',1,['x_bur'])],status:'pend_cocina',mAgo:2,_log:[['pend_caja',3,'Martín'],['pend_cocina',1,'Camila']]});
 se=sess('B2',24,1);O({tableId:'B2',sessionId:se,mozo:'e5',channel:'qr',items:[Ln('p_marg_i',1),Ln('b_cer',1)],status:'listo',mAgo:20,eta:14,etaAt:T-DPM,readyAt:T-DPM,_log:[['pend_mozo',20,'QR barra 2'],['pend_caja',18,'Joaquín'],['pend_cocina',17,'Camila'],['preparando',16,'Franco'],['listo',1,'Franco']]});
 se=sess('E1',22,3);O({tableId:'E1',sessionId:se,mozo:'e4',items:[Ln('p_cal',1),Ln('p_4q',1,['x_cru']),Ln('b_lim',3)],status:'preparando',mAgo:15,eta:20,etaAt:T+12*DPM,_log:[['pend_caja',15,'Sofía'],['pend_cocina',13,'Camila'],['preparando',8,'Franco']]});
 se=sess('I3',9,2);O({tableId:'I3',sessionId:se,mozo:'e3',items:[Ln('p_hon',1),Ln('p_nap_i',1),Ln('b_agu',2)],status:'pend_caja',mAgo:3,_log:[['pend_caja',3,'Martín']]});
 O({channel:'pedidosya',customer:{name:'Federico R.',addr:'Av. Belgrano 1580, dpto 3B',py:'PY-'+(++D.seq.py)},items:[Ln('p_dia',1),Ln('p_sal',1),Ln('b_gas',1)],status:'preparando',mAgo:9,eta:25,etaAt:T+19*DPM,paid:true,_log:[['pend_cocina',9,'PedidosYa (auto)'],['preparando',6,'Lucía']]});
 se=sess('I4',7,2);O({tableId:'I4',sessionId:se,mozo:'e3',channel:'qr',items:[Ln('p_dip',1),Ln('e_fai',1),Ln('b_cer',2,[],'una rubia y una roja')],status:'pend_mozo',mAgo:1,_log:[['pend_mozo',1,'QR mesa 4']]});
 O({channel:'delivery',customer:{name:'Paula G.',tel:'387 611-4455',addr:'Leguizamón 920',pago:'Efectivo (paga con $ 40.000)'},items:[Ln('p_fug',1),Ln('p_marg',1),Ln('d_nut',1)],status:'listo',mAgo:24,eta:20,etaAt:T-2*DPM,readyAt:T-2*DPM,_log:[['pend_caja',24,'WhatsApp'],['pend_cocina',23,'Camila'],['preparando',22,'Lucía'],['listo',2,'Lucía']]});
 O({channel:'pedidosya',customer:{name:'Mariana S.',addr:'Caseros 2010',py:'PY-'+(++D.seq.py)},items:[Ln('p_ort',1),Ln('p_4q_i',1),Ln('b_agu',2)],status:'preparando',mAgo:6,eta:22,etaAt:T+17*DPM,paid:true,_log:[['pend_cocina',6,'PedidosYa (auto)'],['preparando',5,'Franco']]});
 D.carts.I5=[Ln('p_sal',1),Ln('p_marg_i',1,[],'sin albahaca')];sess('I5',4,2);
 D.notifs.push({id:++D.nseq,t:T-DPM,to:['mozo','admin'],tableId:'I4',txt:'Mesa 4 hizo un pedido desde el QR (4 ítems). Esperando validación.'});}
function G(){if(!S.dp||!S.dp.tables||now()-(S.dp.seedAt||0)>14*DPH){dpSeed();try{dpBollosSync();}catch(e){}save();}return S.dp;}
const dpT=id=>G().tables.find(t=>t.id===id);
const dpO=id=>G().orders.find(o=>o.id===id);
const dpOn=n=>G().orders.find(o=>o.n===n);
const dpP=id=>prod(id);
const dpLineUnit=l=>{const p=dpP(l.pid);return (p?p.price:0)+(l.ex||[]).reduce((a,e)=>a+((dpP(e)||{}).price||0),0);};
const dpLineTot=l=>dpLineUnit(l)*l.qty;
const dpOrderTot=o=>o.items.reduce((a,l)=>a+dpLineTot(l),0);
const dpItems=o=>o.items.reduce((a,l)=>a+l.qty,0);
const dpLineName=l=>{const p=dpP(l.pid);if(!p)return '(plato eliminado)';return p.name+(p.dp&&p.dp.ind?' (individual)':'');};
const dpLineDesc=l=>(l.ex||[]).length?'+ '+l.ex.map(e=>(dpP(e)||{name:'?'}).name).join(', '):'';
function dpOrigin(o){if(o.tableId){const t=dpT(o.tableId);return t?t.label:o.tableId;}if(o.channel==='pedidosya')return 'PedidosYa '+((o.customer||{}).py||'');if(o.channel==='delivery')return 'Delivery · '+((o.customer||{}).name||'');if(o.channel==='web')return 'Retiro · '+((o.customer||{}).name||'');return 'Mostrador';}
const dpIsDel=o=>o.channel==='pedidosya'||o.channel==='delivery';
const dpSessOrders=t=>t&&t.session?G().orders.filter(o=>o.tableId===t.id&&o.sessionId===t.session.id&&o.status!=='cancelado'):[];
const dpTableTot=t=>dpSessOrders(t).reduce((a,o)=>a+dpOrderTot(o),0);
function dpTableState(t){const os=dpSessOrders(t),cart=(G().carts[t.id]||[]).length;
 if(t.session&&t.session.bill)return{k:'cuenta',l:'Pidió la cuenta',c:'#7c3aed'};if(t.session&&t.session.call)return{k:'llama',l:'Llama al mozo',c:'#b91c1c'};
 if(os.some(o=>o.status==='listo'))return{k:'listo',l:'Listo para servir',c:'#15803d'};if(os.some(o=>o.status==='pend_mozo'))return{k:'pend',l:'Pedido QR sin validar',c:'#b91c1c'};
 if(os.some(o=>['pend_caja','pend_cocina','preparando'].includes(o.status)))return{k:'curso',l:'Pedido en curso',c:'#c2410c'};
 if(cart)return{k:'qr',l:'Cliente armando pedido',c:'#2563eb'};if(t.session)return{k:'ocupada',l:'Ocupada',c:'#a16207'};return{k:'libre',l:'Libre',c:'#6b7280'};}
/* sincronización entre pestañas del mismo equipo (la carta de una mesa en una pestaña, el panel en otra) */
let DP_BC=null;try{if(isPizzaBuild()&&typeof BroadcastChannel!=='undefined'){DP_BC=new BroadcastChannel('svb-diparma-'+((window.RAVE_BUILD||{}).db||'demo'));
 DP_BC.onmessage=e=>{const m=e.data||{};if(!m.dp||!S||(S.dp&&(S.dp.rev||0)>=m.dp.rev))return;S.dp=m.dp;if(m.club&&Array.isArray(m.club))m.club.forEach(c=>{if(!S.customers.some(x=>x.id===c.id))S.customers.push(c);});save();dpLive(true);};}}catch(e){}
function dpCommit(noRender){const D=G();D.rev=Math.max(now(),(D.rev||0)+1);save();try{if(DP_BC)DP_BC.postMessage({dp:JSON.parse(JSON.stringify(D))});}catch(e){}if(!noRender)dpLive(true);}
function dpNotify(txt,to,extra){const D=G();const n=Object.assign({id:++D.nseq,t:now(),to,txt},extra||{});D.notifs.unshift(n);if(D.notifs.length>80)D.notifs.length=80;
 if(user&&(to.includes(dpRol())||dpRol()==='admin'))toast(txt,n.k==='bad');}
function dpLog(o,s,by){o.status=s;o.log.push({s,t:now(),by:by||dpActor()});}
/* ---------- circuito de la comanda ---------- */
const DP_FLOW={
 create(o){const D=G();D.seq.order++;const r=Object.assign({id:uid(),n:D.seq.order,channel:'mozo',tableId:null,sessionId:null,customer:null,items:[],status:'pend_caja',eta:null,etaAt:null,createdAt:now(),readyAt:null,log:[],mozo:null,cadete:null,paid:false,saleId:''},o);delete r.by;delete r.guests;
  if(r.tableId){const t=dpT(r.tableId);if(!t.session)dpOpenSess(t,o.guests||2,true);r.sessionId=t.session.id;r.mozo=r.mozo||t.mozo;}
  const st=r.status;r.status='';dpLog(r,st,o.by);D.orders.push(r);const w=dpOrigin(r);
  if(st==='pend_mozo')dpNotify(w+' hizo un pedido desde el QR ('+dpItems(r)+' ítems). Validalo en la mesa.',['mozo','admin'],{tableId:r.tableId});
  else if(st==='pend_caja')dpNotify('Pedido #'+r.n+' · '+w+' llegó a caja para confirmar.',['caja','admin']);
  else if(st==='pend_cocina')dpNotify('Pedido #'+r.n+' · '+w+' entró a cocina. Asigná el tiempo de entrega.',['cocina','admin']);
  audit('COMANDA_NUEVA','#'+r.n+' · '+w+' · '+(DP_CH[r.channel]||r.channel)+' · '+money(dpOrderTot(r)));return r;},
 validate(o,by){if(o.status!=='pend_mozo')return 'El pedido #'+o.n+' no está esperando al mozo.';dpLog(o,'pend_caja',by);
  dpNotify('Pedido #'+o.n+' · '+dpOrigin(o)+' validado por el mozo. Confirmalo en caja.',['caja','admin']);audit('COMANDA_VALIDADA_MOZO','#'+o.n);return null;},
 confirm(o,by){if(o.status!=='pend_caja')return 'El pedido #'+o.n+' no está pendiente en caja.';dpLog(o,'pend_cocina',by);
  dpNotify('Comanda #'+o.n+' · '+dpOrigin(o)+' en cocina. Falta asignar el tiempo.',['cocina','admin']);audit('COMANDA_CONFIRMADA_CAJA','#'+o.n);return null;},
 accept(o,eta,by){if(o.status!=='pend_cocina'&&o.status!=='preparando')return 'El pedido #'+o.n+' no está en cocina.';eta=Math.max(1,Math.min(120,Math.round(+eta||20)));
  const was=o.status;if(was==='pend_cocina'){const need=dpBollosNeed(o);if(need>0&&stockOf(dpP('dp-bollo'))<need)dpNotify('Atención: quedan '+stockOf(dpP('dp-bollo'))+' bollos listos y el pedido #'+o.n+' usa '+need+'. Revisá Fermentación.',['cocina','admin'],{k:'bad'});dpLog(o,'preparando',by);}
  o.eta=eta;o.etaAt=now()+eta*DPM;dpNotify((was==='pend_cocina'?'Cocina aceptó':'Nuevo tiempo para')+' el pedido #'+o.n+' · '+dpOrigin(o)+': '+eta+' min.',['mozo','caja','admin'],{tableId:o.tableId});
  audit(was==='pend_cocina'?'COMANDA_ACEPTADA_COCINA':'COMANDA_TIEMPO','#'+o.n+' · '+eta+' min');return null;},
 ready(o,by){if(!['pend_cocina','preparando'].includes(o.status))return 'El pedido #'+o.n+' no está en preparación.';dpLog(o,'listo',by);o.readyAt=now();
  dpNotify('¡Listo! Pedido #'+o.n+' · '+dpOrigin(o)+(dpIsDel(o)?(o.channel==='pedidosya'?' · avisado al rider de PedidosYa':' · asigná un cadete'):' · para servir'),['mozo','caja','admin'],{tableId:o.tableId,k:'ok'});audit('COMANDA_LISTA','#'+o.n);return null;},
 dispatch(o,cad,by){if(o.status!=='listo')return 'El pedido #'+o.n+' todavía no está listo.';
  if(o.channel==='delivery'){if(!cad)return 'Elegí un cadete.';o.cadete=cad;const c=G().cadetes[cad]||(G().cadetes[cad]={estado:'disponible',ent:0,efectivo:0});c.estado='en_reparto';}
  dpLog(o,'en_camino',by);dpNotify('Pedido #'+o.n+' salió '+(cad?'con '+dpFirst(dpEmpN(cad)):'con el rider de PedidosYa')+'.',['caja','admin']);audit('COMANDA_DESPACHO','#'+o.n+(cad?' · cadete '+dpEmpN(cad):' · PedidosYa'));return null;},
 deliver(o,by){if(!['listo','en_camino'].includes(o.status))return 'El pedido #'+o.n+' no está listo para entregar.';
  if(o.cadete&&G().cadetes[o.cadete]){const c=G().cadetes[o.cadete];c.estado='disponible';c.ent++;if(!o.paid){c.efectivo+=dpOrderTot(o);o.cadCash=true;dpSaleOf(o,'efectivo','local');}}
  dpLog(o,'entregado',by);audit('COMANDA_ENTREGADA','#'+o.n+' · '+dpOrigin(o));if(o.channel==='pedidosya')dpSaleOf(o,'pedidosya','pedidosya');return null;},
 cancel(o,why,by){if(['entregado','cancelado'].includes(o.status))return 'El pedido #'+o.n+' ya está cerrado.';dpLog(o,'cancelado',by);o.cancelWhy=why||'';
  dpNotify('Pedido #'+o.n+' cancelado'+(why?': '+why:'')+'.',['mozo','caja','cocina','admin'],{k:'bad'});audit('COMANDA_CANCELADA','#'+o.n+' · '+(why||'sin motivo'));return null;}};
const DP_NEED={validate:'dp_mozo',confirm:'dp_caja',accept:'dp_cocina',ready:'dp_cocina',dispatch:'dp_caja',deliver:'dp_salon',cancel:'dp_caja'};
const DP_WHO={validate:'el mozo',confirm:'caja',accept:'cocina',ready:'cocina',dispatch:'caja',deliver:'el mozo o caja',cancel:'caja'};
function dpDo(act,o,...a){if(!dpCan(DP_NEED[act]))return 'Eso lo hace '+DP_WHO[act]+'. Ingresá con ese perfil (o como administración).';return DP_FLOW[act](o,...a);}
function dpOpenSess(t,g,silent){t.session={id:uid(),openedAt:now(),guests:g||2,call:false,bill:false};if(!silent)audit('MESA_ABIERTA',t.label+' · '+(g||2)+' personas');}
function dpBollosNeed(o){let n=0;o.items.forEach(l=>{const p=dpP(l.pid);if(p&&isKit(p))p.kit.forEach(k=>{if(k.pid==='dp-bollo')n+=k.qty*l.qty;});});return Math.round(n*10)/10;}
/* PedidosYa entregado: venta del canal PedidosYa (pagado online), con descuento de insumos por ficha */
function dpSaleOf(o,met,ch){if(o.saleId)return;if(!openSess()){dpNotify('Pedido #'+o.n+' entregado sin caja abierta: registrá la venta en Vender cuando abras la caja.',['caja','admin'],{k:'bad'});return;}const lines=dpLines([o]);
 try{const r=commitSale(met,false,ch,lines,met==='efectivo'?{recv:dpOrderTot(o),noAdj:true}:{noAdj:true});if(r&&!r.err){o.saleId=r.sale.id;o.paid=true;r.sale.dpRef=dpOrigin(o);audit(ch==='pedidosya'?'PEDIDOSYA_VENTA':'DELIVERY_VENTA',dpOrigin(o)+' → '+r.sale.n);}else if(r&&r.err)dpNotify('Pedido #'+o.n+': '+r.err,['caja','admin'],{k:'bad'});}catch(e){console.warn(e);}}
/* comanda(s) → líneas de Vender (el adicional va como línea propia para que descuente sus insumos) */
function dpLines(os){const M=new Map();const add=(pid,q,src)=>{const p=dpP(pid);if(!p)return;const k=pid;const x=M.get(k);if(x){x.qty+=q;}else M.set(k,{pid:p.id,name:pfull(p),rubro:p.rubro,qty:q,price:p.price,cost:isKit(p)?kitCost(p):p.cost,unit:p.unit,list:p.price});};
 os.forEach(o=>o.items.forEach(l=>{add(l.pid,l.qty);(l.ex||[]).forEach(e=>add(e,l.qty));}));return [...M.values()];}
/* cobrar en Vender: carga la cuenta en el POS y al cobrar cierra la mesa (o marca pagado el pedido) */
A.dpCobrar=el=>{if(!dpCan('sell'))return toast('Cobrar lo hace caja (o administración).',1);const t=el.dataset.t?dpT(el.dataset.t):null;const o=el.dataset.o?dpO(el.dataset.o):null;
 const os=t?dpSessOrders(t).filter(x=>!x.paid):o?[o]:[];if(!os.length)return toast('No hay nada para cobrar.',1);
 if(os.some(x=>['pend_mozo','pend_caja'].includes(x.status))&&t)return toast('Hay comandas sin confirmar en '+t.label+': confirmalas o cancelalas antes de cobrar.',1);
 if(pos.lines.length&&!pos.dpSrc)return toast('Hay una venta en curso en Vender: terminala o borrala primero.',1);
 pos.lines=dpLines(os);pos.sel=pos.lines.length-1;pos.dpSrc={t:t?t.id:'',sess:t&&t.session?t.session.id:'',orders:os.map(x=>x.id),label:t?t.label:dpOrigin(o)};
 audit('MESA_A_COBRO',pos.dpSrc.label+' · '+money(os.reduce((a,x)=>a+dpOrderTot(x),0)));go('vender');setTimeout(()=>{try{if(typeof posCart==='function')posCart();A.cobrar();}catch(e){}},180);};
if(isPizzaBuild()){const _cs=commitSale;commitSale=function(method,arca,channel,lines,opts){const src=pos.dpSrc&&lines===pos.lines?pos.dpSrc:null;const r=_cs.apply(this,arguments);
 if(src&&r&&!r.err){const D=G();src.orders.forEach(id=>{const o=dpO(id);if(o){o.paid=true;o.saleId=r.sale.id;if(o.status!=='cancelado'&&o.status!=='entregado'&&!o.tableId)dpLog(o,'entregado','Caja');}});
  if(src.t){const t=dpT(src.t);if(t&&t.session&&t.session.id===src.sess){audit('MESA_CERRADA',t.label+' · venta '+r.sale.n);t.session=null;delete D.carts[t.id];}}
  r.sale.dpRef=src.label;pos.dpSrc=null;dpCommit(true);}
 return r;};}
/* bollos: un lote listo entra al stock de «Bollo de masa madre»; el consumo sale por la ficha de cada plato */
function dpLotePhase(l){const el=now()-l.start,tgt=l.hours*DPH;if(l.desc)return{k:'desc',l:'Descartado',c:'bad'};if(el<3*DPH)return{k:'bloque',l:'Bloque a temperatura ambiente',c:'info'};
 if(el<tgt)return{k:'frio',l:'Maduración en frío',c:'warn'};if(el<tgt+24*DPH)return{k:'listo',l:'Listo para estirar',c:'ok'};return{k:'pasado',l:'Sobremadurado · usar ya',c:'bad'};}
function dpBollosSync(){const D=S.dp;if(!D)return false;const b=dpP('dp-bollo');if(!b)return false;let ch=false;
 D.ferm.lotes.forEach(l=>{if(l.ing||l.desc)return;const k=dpLotePhase(l).k;if(k==='listo'||k==='pasado'){l.ing=true;b.stock=Math.round((b.stock+l.bollos)*10)/10;audit('BOLLOS_AL_STOCK','Lote '+l.id+' · '+l.bollos+' bollos listos');ch=true;}});return ch;}
function dpLoteLeft(){const D=G();const b=dpP('dp-bollo');let st=Math.max(0,b?stockOf(b):0);const L=D.ferm.lotes.filter(l=>l.ing&&!l.desc).sort((a,c)=>c.start-a.start);const out={};
 L.forEach(l=>{const t=Math.min(l.bollos,st);out[l.id]=t;st-=t;});return out;} /* FEFO: lo que queda está en los lotes más nuevos */

/* ---------- ilustraciones (SVG propias: pizzas de masa madre con borde leopardo) ---------- */
const DP_ART={};
function dpRnd(seed){let a=seed;return()=>{a=(a*9301+49297)%233280;return a/233280;};}
function dpScatter(n,seed,rMax,draw){const R=dpRnd(seed);let s='';for(let i=0;i<n;i++){const ang=R()*6.283,d=Math.sqrt(R())*rMax;s+=draw(100+Math.cos(ang)*d,100+Math.sin(ang)*d,R(),i);}return s;}
const DP_TOP={basil:(x,y,r)=>`<path d="M${x} ${y} q8 -10 16 0 q-8 9 -16 0z" fill="#3f8a2e" transform="rotate(${r*360} ${x+8} ${y})"/>`,tomato:(x,y)=>`<circle cx="${x}" cy="${y}" r="11" fill="#d8311f"/><circle cx="${x}" cy="${y}" r="6" fill="#f0614b"/>`,
 olive:(x,y)=>`<circle cx="${x}" cy="${y}" r="5" fill="#1d1a17"/><circle cx="${x}" cy="${y}" r="2" fill="#5a4a3c"/>`,ham:(x,y,r)=>`<path d="M${x-12} ${y} q6 -10 12 -2 q6 -9 13 1 q-6 9 -12 3 q-7 7 -13 -2z" fill="#e88a8a" stroke="#c96060" stroke-width="1.2" transform="rotate(${r*360} ${x} ${y})"/>`,
 pep:(x,y)=>`<circle cx="${x}" cy="${y}" r="10" fill="#b8321f"/><circle cx="${x-3}" cy="${y-2}" r="1.6" fill="#f2a08e"/>`,onion:(x,y,r)=>`<path d="M${x-9} ${y} a9 6 0 0 1 18 0" fill="none" stroke="#f3e9f5" stroke-width="2.4" transform="rotate(${r*360} ${x} ${y})"/>`,
 mush:(x,y,r)=>`<g transform="rotate(${r*360} ${x} ${y})"><path d="M${x-9} ${y} a9 8 0 0 1 18 0z" fill="#b08c6a"/><rect x="${x-3}" y="${y}" width="6" height="7" rx="2" fill="#d9c2a2"/></g>`,
 rucula:(x,y,r)=>`<path d="M${x} ${y} l6 -3 l-2 5 l7 -2 l-3 5 l6 0 l-14 4z" fill="#4c9a32" transform="rotate(${r*360} ${x} ${y})"/>`,parm:(x,y,r)=>`<rect x="${x}" y="${y}" width="8" height="3" fill="#fff4cc" transform="rotate(${r*360} ${x} ${y})"/>`,
 blue:(x,y)=>`<circle cx="${x}" cy="${y}" r="6" fill="#e8ecef"/><circle cx="${x+1}" cy="${y}" r="2" fill="#6f8aa0"/>`,pepper:(x,y,r)=>`<path d="M${x-10} ${y} q10 -6 20 0" stroke="#e23b2a" stroke-width="5" fill="none" stroke-linecap="round" transform="rotate(${r*360} ${x} ${y})"/>`,
 meat:(x,y)=>`<circle cx="${x}" cy="${y}" r="5" fill="#6b3b22"/><circle cx="${x+5}" cy="${y+3}" r="4" fill="#7d4a2c"/>`,egg:(x,y)=>`<circle cx="${x}" cy="${y}" r="17" fill="#fffdf6"/><circle cx="${x}" cy="${y}" r="7" fill="#f7a41b"/>`,
 burrata:(x,y)=>`<circle cx="${x}" cy="${y}" r="20" fill="#fffef8"/><path d="M${x-8} ${y-6} q8 -6 16 0" stroke="#eee6d6" stroke-width="3" fill="none"/>`};
function dpPizzaArt(sp){const sauce=sp.sauce===false?'#f3dfb0':'#c8381f';let s=`<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="200" height="200" fill="#120f0d"/><circle cx="100" cy="104" r="86" fill="#000" opacity=".45"/><circle cx="100" cy="100" r="86" fill="#d79a52"/><circle cx="100" cy="100" r="86" fill="none" stroke="#b9732f" stroke-width="5"/>`;
 s+=dpScatter(26,sp.seed||3,84,(x,y,r)=>{const dx=x-100,dy=y-100,d=Math.hypot(dx,dy)||1;const k=(78+r*6)/d;return `<ellipse cx="${100+dx*k}" cy="${100+dy*k}" rx="${3+r*4}" ry="${2+r*2.5}" fill="#2a1609" opacity="${.55+r*.4}"/>`;});
 s+=`<circle cx="100" cy="100" r="68" fill="${sauce}"/>`;if(sp.cheese!==false)s+=dpScatter(14,(sp.seed||3)+7,52,(x,y,r)=>`<ellipse cx="${x}" cy="${y}" rx="${12+r*8}" ry="${9+r*6}" fill="#fff3d6" opacity=".95"/>`);
 (sp.tops||[]).forEach((t,i)=>{const [k,n]=t;s+=dpScatter(n,(sp.seed||3)*11+i*17,56,(x,y,r)=>DP_TOP[k](x,y,r));});return s+'</svg>';}
function dpDishArt(kind){const bg='<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="200" height="200" fill="#120f0d"/>';
 const plate='<circle cx="100" cy="106" r="78" fill="#000" opacity=".4"/><circle cx="100" cy="100" r="78" fill="#f4eee4"/><circle cx="100" cy="100" r="62" fill="none" stroke="#e1d8ca" stroke-width="2"/>';
 const X={faina:plate+'<path d="M100 100 L170 92 A70 70 0 0 1 120 167z" fill="#f2c45a" stroke="#c9922a" stroke-width="3"/><path d="M100 100 L40 60 A70 70 0 0 1 90 32z" fill="#efbf55" stroke="#c9922a" stroke-width="3"/>',
  focaccia:plate+'<rect x="40" y="52" width="120" height="96" rx="16" fill="#e2a65a" stroke="#b9732f" stroke-width="3"/>'+dpScatter(16,9,40,(x,y)=>`<circle cx="${x}" cy="${y}" r="4" fill="#b9732f" opacity=".7"/>`)+dpScatter(10,5,40,(x,y,r)=>DP_TOP.basil(x,y,r)),
  burrata:plate+dpScatter(6,2,48,(x,y)=>DP_TOP.tomato(x,y))+DP_TOP.burrata(100,100)+dpScatter(5,8,40,(x,y,r)=>DP_TOP.basil(x,y,r)),
  calzone:plate+'<path d="M32 118 A68 68 0 0 1 168 118 Q100 132 32 118z" fill="#d99a52" stroke="#b9732f" stroke-width="4"/>',
  tiramisu:plate+'<rect x="55" y="62" width="90" height="76" rx="6" fill="#f5ead8"/><rect x="55" y="62" width="90" height="16" rx="6" fill="#6b3f25"/><rect x="55" y="92" width="90" height="10" fill="#a5714b"/><rect x="55" y="118" width="90" height="10" fill="#a5714b"/>',
  nutella:plate+'<circle cx="100" cy="100" r="60" fill="#d79a52"/><circle cx="100" cy="100" r="46" fill="#4a2615"/>'+dpScatter(14,3,40,(x,y)=>`<circle cx="${x}" cy="${y}" r="3" fill="#fff" opacity=".8"/>`),
  cerveza:'<path d="M66 50 h68 l-8 120 h-52z" fill="#fff" opacity=".25"/><path d="M70 70 h60 l-7 96 h-46z" fill="#e8a320"/><path d="M62 52 c10 -18 66 -18 76 0 c4 16 -80 18 -76 0z" fill="#fff8ea"/>',
  gaseosa:'<path d="M70 60 h60 l-6 110 h-48z" fill="#fff" opacity=".25"/><path d="M73 80 h54 l-5 88 h-44z" fill="#3a1a10"/><path d="M118 40 l-8 70" stroke="#fff" stroke-width="5"/>',
  agua:'<rect x="80" y="30" width="40" height="140" rx="14" fill="#a9d2ea" opacity=".85"/><rect x="86" y="20" width="28" height="16" rx="4" fill="#2a6fb0"/><rect x="80" y="86" width="40" height="34" fill="#fff"/>',
  vino:'<path d="M70 40 h60 c0 60 -14 76 -30 76 c-16 0 -30 -16 -30 -76z" fill="#fff" opacity=".3"/><path d="M73 70 h54 c-2 36 -12 44 -27 44 c-15 0 -25 -8 -27 -44z" fill="#7a1325"/><rect x="97" y="116" width="6" height="50" fill="#fff" opacity=".6"/><ellipse cx="100" cy="168" rx="28" ry="6" fill="#fff" opacity=".6"/>',
  limonada:'<path d="M66 50 h68 l-8 120 h-52z" fill="#fff" opacity=".25"/><path d="M70 70 h60 l-7 96 h-46z" fill="#f1e27a"/><circle cx="130" cy="58" r="18" fill="#f5d33b" stroke="#c9a20f" stroke-width="3"/>'};
 return bg+(X[kind]||X.faina)+'</svg>';}
function dpArt(p){if(!p)return '';const a=p.dp&&p.dp.art;if(!a)return dpDishArt('faina');const k=p.dp.of||p.id;if(DP_ART[k])return DP_ART[k];return DP_ART[k]=a.pizza?dpPizzaArt(a.pizza):dpDishArt(a.dish);}

/* ---------- piezas de pantalla ---------- */
const dpStp=s=>`<span class="dp-st" style="--c:${DP_ST[s].c}">${DP_ST[s].l}</span>`;
const dpChip=o=>o.channel==='pedidosya'?'<span class="dp-chip py">PedidosYa</span>':`<span class="dp-chip">${esc(DP_CH[o.channel]||o.channel)}</span>`;
function dpEta(o){if(o.status==='preparando'&&o.etaAt)return `<span class="dp-eta${o.etaAt<now()?' late':''}" data-dpcd="${o.etaAt}">${dpMMSS(o.etaAt-now())}</span>`;if(o.status==='pend_cocina')return '<span class="dp-eta">sin tiempo</span>';if(o.status==='listo')return '<span class="dp-eta ok">listo</span>';return '';}
function dpLinesHTML(o,big){return `<ul class="dp-ln${big?' big':''}">${o.items.map(l=>`<li><b>${l.qty}×</b> <span>${esc(dpLineName(l))}${dpLineDesc(l)?`<small>${esc(dpLineDesc(l))}</small>`:''}${l.note?`<small class="dp-note">“${esc(l.note)}”</small>`:''}</span></li>`).join('')}</ul>`;}
function dpActs(o){const b=[];const st=o.status;
 if(st==='pend_mozo'&&dpCan('dp_mozo'))b.push(`<button class="btn sm gold" data-act="dpGo" data-a="validate" data-id="${o.id}">Validar en la mesa</button>`);
 if(st==='pend_caja'&&dpCan('dp_caja'))b.push(`<button class="btn sm gold" data-act="dpGo" data-a="confirm" data-id="${o.id}">Confirmar en caja</button>`);
 if(st==='pend_cocina'&&dpCan('dp_cocina'))b.push(`<button class="btn sm gold" data-act="dpEtaM" data-id="${o.id}">Aceptar y dar tiempo</button>`);
 if(st==='preparando'&&dpCan('dp_cocina'))b.push(`<button class="btn sm gold" data-act="dpGo" data-a="ready" data-id="${o.id}">Listo</button><button class="btn sm" data-act="dpEtaM" data-id="${o.id}">Cambiar tiempo</button>`);
 if(st==='listo'&&o.channel==='delivery'&&dpCan('dp_caja'))b.push(`<button class="btn sm gold" data-act="dpDisp" data-id="${o.id}">Asignar cadete</button>`);
 if(st==='listo'&&o.channel==='pedidosya'&&dpCan('dp_caja'))b.push(`<button class="btn sm gold" data-act="dpGo" data-a="dispatch" data-id="${o.id}">Entregar al rider</button>`);
 if(st==='listo'&&!dpIsDel(o)&&dpCan('dp_salon'))b.push(`<button class="btn sm gold" data-act="dpGo" data-a="deliver" data-id="${o.id}">${o.tableId?'Servido':'Entregado'}</button>`);
 if(st==='en_camino'&&dpCan('dp_salon'))b.push(`<button class="btn sm gold" data-act="dpGo" data-a="deliver" data-id="${o.id}">Entregado</button>`);
 if(!o.tableId&&!o.paid&&!dpIsDel(o)&&['listo','en_camino','entregado'].includes(st)&&dpCan('sell'))b.push(`<button class="btn sm" data-act="dpCobrar" data-o="${o.id}">Cobrar en Vender</button>`);
 if(DP_ACTIVE.includes(st)&&st!=='en_camino'&&dpCan('dp_caja'))b.push(`<button class="btn sm ghost" data-act="dpCancel" data-id="${o.id}" aria-label="Cancelar pedido ${o.n}">Cancelar</button>`);
 return b.join('');}
function dpCard(o,opt){opt=opt||{};const late=o.status==='preparando'&&o.etaAt<now();
 return `<article class="card dp-ord${late?' late':''}" style="--c:${DP_ST[o.status].c}"><header class="row"><b class="sp">#${o.n} · ${esc(dpOrigin(o))}</b>${dpChip(o)}</header>
 <div class="row sm mut" style="gap:.4rem;margin:.2rem 0 .4rem">${dpStp(o.status)} ${dpEta(o)} <span class="sp"></span><span>${dpAgo(o.createdAt)}${o.mozo?' · '+esc(dpFirst(dpEmpN(o.mozo))):''}</span></div>
 ${dpLinesHTML(o,opt.big)}${o.customer&&o.customer.addr?`<p class="sm mut" style="margin:.3rem 0">${esc(o.customer.addr)}${o.customer.pago?' · '+esc(o.customer.pago):''}</p>`:''}
 <div class="row" style="margin-top:.4rem;gap:.4rem;flex-wrap:wrap"><b class="sp">${money(dpOrderTot(o))}${o.paid?' <span class="tag ok">pagado</span>':''}</b>${dpActs(o)}</div></article>`;}
function dpHead(title,desc,btns){return `<div class="row" style="flex-wrap:wrap;gap:.5rem"><h1 class="sp">${esc(title)}</h1>${btns||''}</div>${desc?`<p class="ux-desc dp-desc">${desc}</p>`:''}`;}
function dpKpi(l,v,d,c,act){return `<div class="card kpi dp-kpi${c?' '+c:''}"${act?` data-act="nav" data-id="${act}" role="button" tabindex="0"`:''}><span>${esc(l)}</span><b>${v}</b>${d?`<small>${d}</small>`:''}</div>`;}
function dpFlowStrip(){const os=G().orders;const n=s=>os.filter(o=>o.status===s).length;const pre=Object.values(G().carts).filter(c=>c.length).length;
 const S2=[['Precarga QR',pre,'#2563eb','dpsalon'],['Mozo',n('pend_mozo'),'#7c3aed','dpmozo'],['Caja',n('pend_caja'),'#2563eb','dpcomandas'],['Cocina',n('pend_cocina')+n('preparando'),'#c2410c','dpcocina'],['Para entregar',n('listo')+n('en_camino'),'#15803d','dpcomandas']];
 return `<div class="dp-flow" role="list" aria-label="Circuito de la comanda">${S2.map(([l,v,c,id],i)=>`<a class="dp-fs" role="listitem" data-act="nav" data-id="${id}" tabindex="0" style="--c:${c}"><i>${i+1}</i><b>${v}</b><span>${l}</span></a>`).join('<span class="dp-fa" aria-hidden="true">→</span>')}</div>`;}

/* ---------- pantallas ---------- */
let DPU={salon:'todo',cmd:'activos',del:'todo',ficha:'p_dip',calcN:40};
reg('dpsalon','Salón y barra','salon','dp_salon',()=>{const D=G();const T=D.tables;const sec=DPU.salon;const occ=T.filter(t=>t.session).length;const cu=T.filter(t=>t.session&&t.session.bill).length;
 const L=T.filter(t=>sec==='todo'||t.sector===sec);
 return dpHead('Salón y barra','Cada mesa, el exterior y cada banqueta de barra tienen su <b>QR</b> y su <b>tag NFC</b>. Tocá una mesa para ver su consumo, cargar un pedido o cobrarla en Vender.',
  `<button class="btn" data-act="dpCarta" data-t="I5">${ico('globe')} Ver la carta de una mesa</button><button class="btn gold" data-act="dpAuto">${ico('flow')} Ver el circuito en vivo</button>`)
 +`<div class="grid g4">${dpKpi('Mesas ocupadas',occ+' / '+T.length,Math.round(occ/T.length*100)+' % del salón')}${dpKpi('Pidieron la cuenta',cu,'listas para cobrar',cu?'warn':'')}${dpKpi('Comandas en curso',D.orders.filter(o=>DP_ACTIVE.includes(o.status)&&o.tableId).length,'en el salón','', 'dpcomandas')}${dpKpi('Consumo abierto',money(T.reduce((a,t)=>a+dpTableTot(t),0)),'mesas sin cobrar')}</div>
 ${dpFlowStrip()}
 <div class="ux-tabs" role="tablist" aria-label="Sector">${[['todo','Todo'],['interior','Interior'],['exterior','Exterior'],['barra','Barra']].map(([k,l])=>`<a role="tab" tabindex="0" aria-selected="${sec===k}" class="${sec===k?'on':''}" data-act="dpSec" data-v="${k}">${l}</a>`).join('')}</div>
 <div class="dp-tables">${L.map(t=>{const s=dpTableState(t);const tot=dpTableTot(t);const os=dpSessOrders(t);const live=os.find(o=>o.status==='preparando');
  return `<button class="dp-table ${t.sector}" data-act="dpMesa" data-id="${t.id}" style="--c:${s.c}" aria-label="${esc(t.label)}: ${esc(s.l)}"><span class="dp-tn">${t.sector==='barra'?'B':t.sector==='exterior'?'E':''}${t.num}</span><b>${esc(t.label)}</b><span class="dp-ts">${esc(s.l)}</span>
   <span class="sm mut">${t.session?t.session.guests+' pers. · '+dpAgo(t.session.openedAt):t.seats+' lugares'}</span>${tot?`<span class="dp-tt">${money(tot)}</span>`:''}${live?`<span class="dp-eta" data-dpcd="${live.etaAt}">${dpMMSS(live.etaAt-now())}</span>`:''}<span class="sm mut">${esc(dpFirst(dpEmpN(t.mozo)))}</span></button>`;}).join('')}</div>
 <p class="sm mut">Colores: gris libre · ámbar ocupada · azul el cliente arma su pedido desde el QR · rojo pedido sin validar o llama al mozo · naranja en cocina · verde listo para servir · violeta pidió la cuenta.</p>`;},null,'Salón y cocina');
reg('dpmozo','Mozo','mozo','dp_salon',()=>{const D=G();const me=user&&user.empId;const mine=t=>!me||dpRol()!=='mozo'||t.mozo===me;const T=D.tables.filter(mine);
 const val=D.orders.filter(o=>o.status==='pend_mozo'&&o.tableId&&mine(dpT(o.tableId)));const rdy=D.orders.filter(o=>o.status==='listo'&&o.tableId&&mine(dpT(o.tableId)));
 const calls=T.filter(t=>t.session&&(t.session.call||t.session.bill));const pre=T.filter(t=>(D.carts[t.id]||[]).length);
 return dpHead('Mozo'+(me&&dpRol()==='mozo'?' · '+dpFirst(dpEmpN(me)):''),'Lo urgente primero: pedidos del QR para validar en la mesa, platos listos para servir y mesas que te llaman. Cargá un pedido nuevo en tres toques.',
  `<button class="btn gold" data-act="dpNew" data-ch="mozo">${ico('cart')} Cargar pedido</button><button class="btn" data-act="nav" data-id="dpvoz">${ico('voz')} Asistente</button>`)
 +`<div class="grid g4">${dpKpi('Para validar',val.length,'pedidos del QR',val.length?'red':'')}${dpKpi('Para servir',rdy.length,'listos en cocina',rdy.length?'ok':'')}${dpKpi('Te llaman',calls.length,'cuenta o mozo',calls.length?'warn':'')}${dpKpi('Armando desde el QR',pre.length,'precarga en vivo')}</div>
 <div class="grid g2" style="align-items:start"><section><h3>Validar en la mesa</h3>${val.map(o=>dpCard(o)).join('')||'<div class="card mut sm">No hay pedidos del QR esperando.</div>'}
  <h3>Listos para servir</h3>${rdy.map(o=>dpCard(o)).join('')||'<div class="card mut sm">Nada listo por ahora.</div>'}</section>
 <section><h3>Te llaman</h3>${calls.map(t=>`<div class="card row" style="gap:.5rem;flex-wrap:wrap"><b class="sp">${esc(t.label)} · ${t.session.bill?'pidió la cuenta':'llama al mozo'}</b><span>${money(dpTableTot(t))}</span>${t.session.call?`<button class="btn sm" data-act="dpCallOk" data-id="${t.id}">Atendido</button>`:''}${t.session.bill&&dpCan('sell')?`<button class="btn sm gold" data-act="dpCobrar" data-t="${t.id}">Cobrar</button>`:t.session.bill?'<span class="sm mut">avisado a caja</span>':''}</div>`).join('')||'<div class="card mut sm">Nadie te llama.</div>'}
  <h3>Precarga desde el QR</h3>${pre.map(t=>{const c=D.carts[t.id];return `<div class="card"><b>${esc(t.label)}</b> <span class="sm mut">está armando: ${c.map(l=>l.qty+'× '+esc(dpLineName(l))).join(', ')}</span></div>`;}).join('')||'<div class="card mut sm">Ninguna mesa está armando un pedido.</div>'}
  <h3>Mis mesas</h3><div class="dp-tables sm">${T.map(t=>{const s=dpTableState(t);return `<button class="dp-table" data-act="dpMesa" data-id="${t.id}" style="--c:${s.c}"><b>${esc(t.label)}</b><span class="dp-ts">${esc(s.l)}</span>${dpTableTot(t)?`<span class="dp-tt">${money(dpTableTot(t))}</span>`:''}</button>`;}).join('')}</div></section></div>`;},null,'Salón y cocina');
reg('dpcomandas','Comandas','flow','dp_salon',()=>{const D=G();const f=DPU.cmd;const T0=new Date();T0.setHours(0,0,0,0);
 const L=D.orders.filter(o=>f==='activos'?DP_ACTIVE.includes(o.status):o.createdAt>=T0.getTime()).sort((a,b)=>b.createdAt-a.createdAt);
 const col=(t,ss)=>{const X=L.filter(o=>ss.includes(o.status));return `<section class="dp-col" style="--c:${DP_ST[ss[0]].c}"><h3>${t} <span class="tag">${X.length}</span></h3>${X.map(o=>dpCard(o)).join('')||'<p class="sm mut">Vacío.</p>'}</section>`;};
 return dpHead('Comandas','El circuito completo en un tablero: <b>Mozo → Caja → Cocina → Horno → Listo → Servido</b>. Cada perfil ve sus botones; los cambios se ven al instante en la carta del cliente.',
  `<button class="btn" data-act="dpNew" data-ch="mostrador">${ico('cart')} Pedido de mostrador</button><button class="btn gold" data-act="dpAuto">${ico('flow')} Ver el circuito en vivo</button>`)
 +dpFlowStrip()+`<div class="ux-tabs" role="tablist">${[['activos','En curso'],['hoy','Todo el día']].map(([k,l])=>`<a role="tab" tabindex="0" aria-selected="${f===k}" class="${f===k?'on':''}" data-act="dpCmd" data-v="${k}">${l}</a>`).join('')}</div>
 ${f==='activos'?`<div class="dp-board">${col('Esperan al mozo',['pend_mozo'])}${col('En caja',['pend_caja'])}${col('En cocina',['pend_cocina','preparando'])}${col('Para entregar',['listo','en_camino'])}</div>`
 :`<div class="card tw"><table><thead><tr><th>#</th><th>Hora</th><th>Origen</th><th>Canal</th><th>Detalle</th><th>Estado</th><th class="r">Total</th></tr></thead><tbody>${L.map(o=>`<tr><td>${o.n}</td><td>${hm(o.createdAt)}</td><td>${esc(dpOrigin(o))}</td><td>${dpChip(o)}</td><td class="sm">${o.items.map(l=>l.qty+'× '+esc(dpLineName(l))).join(', ')}</td><td>${dpStp(o.status)}</td><td class="r">${money(dpOrderTot(o))}</td></tr>`).join('')||'<tr><td colspan="7" class="mut">Sin comandas.</td></tr>'}</tbody></table></div>`}`;},null,'Salón y cocina');
reg('dpcocina','Cocina','cocina','dp_cocina',()=>{const D=G();const nw=D.orders.filter(o=>o.status==='pend_cocina').sort((a,b)=>a.createdAt-b.createdAt);const pr=D.orders.filter(o=>o.status==='preparando').sort((a,b)=>a.etaAt-b.etaAt);
 const late=pr.filter(o=>o.etaAt<now()).length;const b=dpP('dp-bollo');const bl=b?stockOf(b):0;const lr=D.orders.filter(o=>o.status==='listo');
 return dpHead('Cocina','Las comandas entran en orden de llegada. <b>Aceptá y dale tiempo</b> (el cliente ve la cuenta regresiva) y marcá <b>Listo</b> cuando sale del horno. Los bollos e insumos se descuentan al cobrar, según la ficha técnica.',
  `<button class="btn" data-act="nav" data-id="dpferm">${ico('ferm')} Fermentación</button><button class="btn" data-act="nav" data-id="dpvoz">${ico('voz')} Asistente</button>`)
 +`<div class="grid g4">${dpKpi('Sin tiempo asignado',nw.length,'recién llegadas',nw.length?'red':'')}${dpKpi('En el horno',pr.length,late?late+' demorada(s)':'a tiempo',late?'warn':'')}${dpKpi('Listas para salir',lr.length,'esperan mozo o cadete','ok')}${dpKpi('Bollos listos',Math.floor(bl),bl<15?'¡pocos! armá un lote':'para estirar',bl<15?'red':'','dpferm')}</div>
 <div class="grid g2" style="align-items:start"><section><h3>Nuevas · asignar tiempo</h3>${nw.map(o=>dpCard(o,{big:1})).join('')||'<div class="card mut sm">No hay comandas nuevas.</div>'}</section>
 <section><h3>En el horno</h3>${pr.map(o=>dpCard(o,{big:1})).join('')||'<div class="card mut sm">El horno está libre.</div>'}</section></div>`;},null,'Salón y cocina');
reg('dpdelivery','Delivery y PedidosYa','moto','dp_salon',()=>{const D=G();const T0=new Date();T0.setHours(0,0,0,0);const f=DPU.del;
 const del=D.orders.filter(o=>dpIsDel(o)&&(DP_ACTIVE.includes(o.status)||o.createdAt>=T0.getTime())).sort((a,b)=>(DP_ACTIVE.includes(b.status)-DP_ACTIVE.includes(a.status))||b.createdAt-a.createdAt);
 const L=del.filter(o=>f==='todo'||(f==='py'&&o.channel==='pedidosya')||(f==='propio'&&o.channel==='delivery'));const py=D.orders.filter(o=>o.channel==='pedidosya'&&o.createdAt>=T0.getTime()&&o.status!=='cancelado');
 const cads=dpStaffOf('cadete');const efe=Object.values(D.cadetes).reduce((a,c)=>a+c.efectivo,0);
 return dpHead('Delivery y PedidosYa','Asigná los pedidos listos a tus cadetes y recibí los de PedidosYa (en esta demo la conexión es <b>simulada</b>). Lo que cobra el cadete se rinde en caja.',
  `<button class="btn" data-act="dpNew" data-ch="delivery">${ico('cart')} Pedido delivery propio</button><button class="btn gold" data-act="dpPySim">${ico('moto')} Simular pedido PedidosYa</button>`)
 +`<div class="grid g4">${dpKpi('Repartos activos',del.filter(o=>DP_ACTIVE.includes(o.status)).length,'')}${dpKpi('PedidosYa hoy',py.length,money(py.reduce((a,o)=>a+dpOrderTot(o),0))+' brutos')}${dpKpi('Cadetes disponibles',cads.filter(c=>(D.cadetes[c.id]||{}).estado!=='en_reparto').length+' / '+cads.length,'','ok')}${dpKpi('Efectivo a rendir',money(efe),'lo tienen los cadetes',efe?'warn':'')}</div>
 <div class="grid g2" style="grid-template-columns:minmax(0,2fr) minmax(0,1fr);align-items:start"><div class="card"><div class="ux-tabs" role="tablist">${[['todo','Todos'],['py','PedidosYa'],['propio','Cadete propio']].map(([k,l])=>`<a role="tab" tabindex="0" aria-selected="${f===k}" class="${f===k?'on':''}" data-act="dpDel" data-v="${k}">${l}</a>`).join('')}</div>
  <div class="tw"><table><thead><tr><th>#</th><th>Cliente / dirección</th><th>Estado</th><th>Reparte</th><th class="r">Total</th><th></th></tr></thead><tbody>${L.map(o=>`<tr><td>${o.n}</td><td><b>${esc((o.customer||{}).name||'')}</b> ${dpChip(o)}<div class="sm mut">${esc((o.customer||{}).addr||'')}${(o.customer||{}).py?' · '+esc(o.customer.py):''}${(o.customer||{}).pago?' · '+esc(o.customer.pago):''}</div></td><td>${dpStp(o.status)} ${dpEta(o)}</td><td>${o.channel==='pedidosya'?'<span class="sm mut">Rider PedidosYa</span>':o.cadete?esc(dpFirst(dpEmpN(o.cadete))):'—'}</td><td class="r">${money(dpOrderTot(o))}${o.paid?'<div class="sm mut">pagado</div>':''}</td><td class="r"><span class="row" style="gap:.3rem;justify-content:flex-end;flex-wrap:wrap">${dpActs(o)}</span></td></tr>`).join('')||'<tr><td colspan="6" class="mut">Sin repartos.</td></tr>'}</tbody></table></div></div>
 <aside style="display:flex;flex-direction:column;gap:.8rem"><div class="card"><div class="row"><b class="sp">PedidosYa</b><span class="tag sim">${D.py.connected?'Conectado · simulado':'Desconectado'}</span></div><p class="sm mut">Última sincronización ${dpAgo(D.py.lastSync)} · comisión ${D.py.comision} %. Al entregarse, el pedido se registra como venta del canal PedidosYa y descuenta los insumos.</p>
  <label class="chk"><input type="checkbox" data-dpchk="autoAccept" ${D.py.autoAccept?'checked':''}> Confirmar en caja automáticamente (pasa directo a cocina)</label><label class="chk"><input type="checkbox" data-dpchk="demoFeed" ${D.py.demoFeed?'checked':''}> Demo: un pedido entrante cada 45 s</label>
  <p class="sm mut" style="margin:.4rem 0 0">En producción PedidosYa avisa por webhook a una función del servidor con las credenciales del comercio [D].</p></div>
 <div class="card"><b>Cadetes propios</b>${cads.map(e=>{const c=D.cadetes[e.id]||{estado:'disponible',ent:0,efectivo:0};const cur=D.orders.find(o=>o.cadete===e.id&&o.status==='en_camino');
  return `<div class="dp-cad"><div class="row"><b class="sp">${esc(dpEmpN(e.id))}</b><span class="tag ${c.estado==='disponible'?'ok':'warn'}">${c.estado==='disponible'?'Disponible':'En reparto'}</span></div><span class="sm mut">${c.ent} entregas hoy${cur?' · lleva #'+cur.n+' a '+esc((cur.customer||{}).addr||''):''}</span><div class="row"><span class="sp sm">Efectivo a rendir <b>${money(c.efectivo)}</b></span>${c.efectivo&&dpCan('cash_mov')?`<button class="btn sm" data-act="dpRendir" data-id="${e.id}">Rendir en caja</button>`:''}</div></div>`;}).join('')}</div></aside></div>`;},null,'Salón y cocina');
reg('dpferm','Fermentación','ferm','dp_ferm',()=>{const D=G();if(dpBollosSync())save();const F=D.ferm,m=F.madre,due=m.lastFeed+m.every*DPH;const b=dpP('dp-bollo');const bl=b?stockOf(b):0;const left=dpLoteLeft();
 const lots=F.lotes.slice().sort((a,c)=>c.start-a.start);const n=DPU.calcN||40;const tot=n*F.bolloPeso,fl=tot/(1+F.hidr/100+.028+.2);const h=dpP('in-harina');
 const enC=F.lotes.filter(l=>['bloque','frio'].includes(dpLotePhase(l).k));
 return dpHead('Fermentación de masa madre','Seguimiento de la madre («Mamma») y de cada lote: maduración en frío de 48 a 72 h a 4 °C. Cuando un lote queda listo, sus bollos <b>entran solos al stock</b> y cada pizza los descuenta por su ficha técnica.',`<button class="btn gold" data-act="dpLote">${ico('ferm')} Nuevo lote de masa</button>`)
 +`<div class="grid g4">${dpKpi('Bollos listos para estirar',Math.floor(bl),F.bolloPeso+' g · '+F.hidr+' % hidratación',bl<15?'red':'ok')}${dpKpi('Lotes en maduración',enC.length,enC.reduce((a,l)=>a+l.bollos,0)+' bollos en cámara')}${dpKpi('Próximo refresco de la madre',due<now()?'atrasado':dpHrs(due-now()),'cada '+m.every+' h · '+m.ratio,due<now()?'red':due-now()<2*DPH?'warn':'')}${dpKpi('Actividad de la madre','×'+m.rise,'crecimiento en 4 h a '+m.temp+' °C')}</div>
 <div class="grid g2" style="grid-template-columns:minmax(0,2fr) minmax(0,1fr);align-items:start"><div class="dp-lots">${lots.map(l=>{const p=dpLotePhase(l),el=now()-l.start,tgt=l.hours*DPH,span=tgt+24*DPH,pct=Math.min(100,el/span*100);const rest=l.ing?(left[l.id]||0):l.bollos;const last=l.temps[l.temps.length-1];
  const k=rest<=0&&l.ing&&!l.desc?{l:'Agotado',c:'mut'}:p;
  return `<div class="card dp-lote ${k.c}"><div class="row"><b class="sp">Lote ${esc(l.id)}</b><span class="dp-st" style="--c:${({info:'#2563eb',warn:'#b45309',ok:'#15803d',bad:'#b91c1c',mut:'#78716c'})[k.c]}">${k.l}</span></div><span class="sm mut">${dmy(dkey(l.start))} ${hm(l.start)} · objetivo ${l.hours} h · ${l.hidr} % hidratación</span>
   <div class="dp-bar" role="img" aria-label="${Math.round(pct)} % del tiempo"><i style="width:${pct}%"></i><em style="left:${tgt/span*100}%"></em></div><div class="row sm"><span class="sp">${dpHrs(el)} de fermentación</span><span class="mut">${el<tgt?'lista en '+dpHrs(tgt-el):'lista hace '+dpHrs(el-tgt)}</span></div>
   <div class="row sm"><span class="sp">Bollos: <b>${Math.floor(rest)}</b> de ${l.bollos}${l.ing?' (en stock)':' (madurando)'}</span><span>🌡 ${last!=null?String(last).replace('.',',')+' °C':'—'}</span></div>${dpSpark(l.temps)}${l.note?`<p class="sm mut" style="margin:.2rem 0">“${esc(l.note)}”</p>`:''}
   <div class="row" style="gap:.4rem;flex-wrap:wrap"><button class="btn sm" data-act="dpTemp" data-id="${l.id}">Registrar temperatura</button>${!l.desc&&(rest>0||!l.ing)?`<button class="btn sm ghost" data-act="dpDesc" data-id="${l.id}">Descartar ${l.ing?'sobrante':'lote'}</button>`:''}</div></div>`;}).join('')}</div>
 <aside style="display:flex;flex-direction:column;gap:.8rem"><div class="card"><b>Madre · «Mamma»</b><p class="sm">Último refresco <b>${hm(m.lastFeed)}</b> (${dpAgo(m.lastFeed)}). Proporción ${m.ratio} (madre : harina : agua), ${m.hidr} % hidratación.</p><div class="dp-bar"><i style="width:${Math.min(100,(now()-m.lastFeed)/(m.every*DPH)*100)}%;${due<now()?'background:var(--red)':''}"></i></div>
  <div class="grid g2"><div><label for="dp-mt">Temp. ambiente °C</label><input id="dp-mt" inputmode="decimal" value="${String(m.temp).replace('.',',')}"></div><div><label for="dp-mr">Crecimiento ×</label><input id="dp-mr" inputmode="decimal" value="${String(m.rise).replace('.',',')}"></div></div><button class="btn gold" style="width:100%;margin-top:.5rem" data-act="dpFeed">Registrar refresco</button>${m.feeds.length?`<p class="sm mut">Refrescos de hoy: ${m.feeds.map(x=>hm(x)).join(' · ')}</p>`:''}</div>
 <div class="card"><b>Calculadora de amasado</b><label for="dp-cn">Cantidad de bollos</label><input id="dp-cn" inputmode="numeric" value="${n}" data-dpcalc="1"><table class="sm"><tbody><tr><td>Harina 00</td><td class="r">${dpQ(fl/1000,'kg')}</td></tr><tr><td>Agua (${F.hidr} %)</td><td class="r">${dpQ(fl*F.hidr/100/1000,'l')}</td></tr><tr><td>Masa madre (20 %)</td><td class="r">${dpQ(fl*.2/1000,'kg')}</td></tr><tr><td>Sal (2,8 %)</td><td class="r">${dpQ(fl*.028/1000,'kg')}</td></tr><tr><td><b>Masa total</b></td><td class="r"><b>${dpQ(tot/1000,'kg')}</b></td></tr></tbody></table>
  <p class="sm mut">Costo por bollo ${money(Math.round(dpBolloCost()))} (harina + sal). Stock de harina: ${h?dpQ(h.stock,'kg'):'—'}.</p></div></aside></div>`;},null,'Salón y cocina');
function dpSpark(v){if(!v||!v.length)return '';const W=220,H=40,lo=2,hi=6,mn=Math.min(lo,...v),mx=Math.max(hi,...v);const y=x=>H-4-(x-mn)/(mx-mn||1)*(H-8);const pts=v.map((x,i)=>[(v.length===1?W/2:i/(v.length-1)*W),y(x)]);
 return `<svg class="dp-spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><rect x="0" y="${y(hi)}" width="${W}" height="${y(lo)-y(hi)}" fill="rgba(21,128,61,.12)"/><polyline fill="none" stroke="var(--gold2)" stroke-width="2" points="${pts.map(p=>p.join(',')).join(' ')}"/></svg>`;}
reg('dpfichas','Fichas técnicas','ficha','dp_fichas',()=>{const sel=dpP(DPU.ficha)||dpP('p_dip');const dishes=S.products.filter(p=>p.dp&&!p.dp.ind&&!p.dp.ins&&!p.dp.bollo&&!p.dp.extra&&p.active);
 const show=sel.dp&&sel.dp.sizes&&DPU.fsize==='i'?dpP(sel.id+'_i')||sel:sel;const cost=isKit(show)?kitCost(show):show.cost;const fc=show.price?cost/show.price*100:0;const pc=x=>x>35?'red':x>30?'warn':'ok';
 const PROC={'dp-piz':['Estirar el bollo a mano dejando el cornicione de 2 cm.','Salsear en espiral y distribuir el queso cortado.','Hornear 90 s a 450 °C girando a los 45 s.','Terminar fuera del horno con los ingredientes en crudo y oliva.'],'dp-ent':['Hornear o servir según la preparación.','Emplatar en tabla de madera.'],'dp-czn':['Rellenar media masa, cerrar y pintar.','Hornear 3 min a 400 °C.'],'dp-pos':['Porcionar y emplatar.'],'dp-beb':['Servir frío.']};
 const al=[];const ks=(show.kit||[]).map(k=>k.pid);if(ks.some(k=>/harina|bollo|garban/.test(k))||ks.includes('dp-bollo'))al.push('gluten (trigo)');if(ks.some(k=>/muzza|parm|roque|provo|mascar|burrata/.test(k)))al.push('lácteos');if(ks.includes('in-huevo'))al.push('huevo');
 return dpHead('Fichas técnicas y escandallos','Receta, insumos y costo de cada plato. Cada ficha es un <b>combo</b> del sistema: al cobrar, Vender descuenta solos los insumos y los bollos. Editá las cantidades acá y el costo se actualiza en todo el sistema.')
 +`<div class="grid g2" style="grid-template-columns:minmax(0,1fr) minmax(0,2fr);align-items:start"><div class="card tw"><table><thead><tr><th>Plato</th><th class="r">Costo</th><th class="r">Food cost</th></tr></thead><tbody>${dishes.map(x=>{const c=isKit(x)?kitCost(x):x.cost,f=x.price?c/x.price*100:0;return `<tr class="dp-click${x.id===sel.id?' on':''}" data-act="dpFicha" data-id="${x.id}" tabindex="0"><td>${esc(x.name)}</td><td class="r">${money(c)}</td><td class="r"><span class="tag ${pc(f)==='red'?'bad':pc(f)}">${Math.round(f)} %</span></td></tr>`;}).join('')}</tbody></table></div>
 <div class="card"><div class="row" style="gap:.8rem;align-items:flex-start"><div class="dp-art">${dpArt(sel)}</div><div class="sp"><h2 style="margin:.1rem 0">${esc(sel.name)}</h2><p class="sm mut">${esc(sel.desc||'')}</p>${sel.dp&&sel.dp.sizes?`<div class="ux-tabs" role="tablist">${[['g','Grande'],['i','Individual']].map(([k,l])=>`<a role="tab" tabindex="0" class="${(DPU.fsize||'g')===k?'on':''}" aria-selected="${(DPU.fsize||'g')===k}" data-act="dpFsz" data-v="${k}">${l}</a>`).join('')}</div>`:''}
  <div class="grid g4">${dpKpi('Costo',money(cost),'')}${dpKpi('Precio',money(show.price),'')}${dpKpi('Food cost',Math.round(fc*10)/10+' %','objetivo ≤ 30 %',pc(fc))}${dpKpi('Margen',money(show.price-cost),'por unidad')}</div></div></div>
  ${isKit(show)?`<div class="tw"><table><thead><tr><th>Insumo</th><th class="r">Cantidad</th><th class="r">Costo unitario</th><th class="r">Costo</th><th class="r">Stock</th></tr></thead><tbody>${show.kit.map((k,i)=>{const c=dpP(k.pid);if(!c)return '';const g=c.unit==='u'?k.qty:Math.round(k.qty*1000*10)/10;
   return `<tr><td>${esc(c.name)}</td><td class="r"><input class="dp-qin" inputmode="decimal" aria-label="Cantidad de ${esc(c.name)}" data-dpkit="${i}" value="${String(g).replace('.',',')}"> ${c.unit==='u'?'u':c.unit==='kg'?'g':'ml'}</td><td class="r">${money(c.cost)}/${unitLbl(c.unit)}</td><td class="r">${money(Math.round(c.cost*k.qty))}</td><td class="r ${stockOf(c)<=(c.min||0)?'dp-low':''}">${dpQ(stockOf(c),c.unit)}</td></tr>`;}).join('')}</tbody><tfoot><tr><td colspan="3"><b>Costo total</b></td><td class="r"><b>${money(cost)}</b></td><td></td></tr></tfoot></table></div>
  <div class="row" style="gap:.5rem;flex-wrap:wrap;margin-top:.5rem"><select id="dp-fai" aria-label="Insumo para agregar" style="flex:1;min-width:180px">${S.products.filter(p=>p.dp&&(p.dp.ins||p.dp.bollo)&&!show.kit.some(k=>k.pid===p.id)).map(p=>`<option value="${p.id}">${esc(p.name)} (${p.unit==='u'?'u':p.unit==='kg'?'g':'ml'})</option>`).join('')}</select><input id="dp-faq" inputmode="decimal" placeholder="Cantidad" style="width:110px" aria-label="Cantidad"><button class="btn sm" data-act="dpFAdd">Agregar insumo</button><button class="btn sm gold" data-act="dpFSave">Guardar ficha</button></div>`:'<p class="sm mut">Este artículo se compra hecho: tiene stock propio y no lleva ficha.</p>'}
  <div class="row" style="gap:.6rem;flex-wrap:wrap;margin-top:.8rem;align-items:flex-end"><div><label for="dp-fpr">Precio de venta</label>${numIn('dp-fpr',show.price,'0')}</div><div><span class="sm mut">Precio sugerido (food cost 30 %)</span><br><b style="font-size:1.25rem">${money(Math.round(cost/.3/10000)*10000)}</b> <button class="btn sm" data-act="dpFSug">Aplicar</button></div><button class="btn sm" data-act="dpFPrice">Guardar precio</button></div>
  <h3 style="margin-bottom:.2rem">Procedimiento</h3><ol class="sm">${(PROC[sel.rubro]||[]).map(x=>`<li>${x}</li>`).join('')}</ol><p class="sm mut">Alérgenos: ${al.join(', ')||'sin alérgenos declarados'}. [VERIFICAR con el elaborador]</p></div></div>`;},null,'Salón y cocina');
reg('dpvoz','Asistente de comandas','voz','dp_salon',()=>{const has=typeof window!=='undefined'&&(window.SpeechRecognition||window.webkitSpeechRecognition);
 return dpHead('Asistente de comandas','Sólo para el personal. Escribí o dictá la orden como la dirías en voz alta: el asistente la ejecuta con tu perfil y te muestra qué hizo.')
 +`<div class="card"><div class="row" style="gap:.5rem;flex-wrap:wrap"><input id="dp-vq" class="sp" style="min-width:240px" placeholder="Ej.: confirmar pedido mesa 4" autocomplete="off" aria-label="Orden para el asistente"><button class="btn gold" data-act="dpVRun">Ejecutar</button>${has?`<button class="btn" data-act="dpVMic" id="dp-mic" aria-label="Dictar por voz">🎙 Dictar</button>`:'<span class="sm mut">El dictado funciona en Chrome o Edge.</span>'}</div>
 <div class="ux-chips" style="margin-top:.6rem">${['Confirmar pedido mesa 4','Mesa 2 en preparación 18 minutos','Pedido 12 listo','Mesa 6, una salteña con huevo frito y dos copas de vino','Cuenta mesa 7','Barra 2 servida'].map(x=>`<button class="ux-chip" data-act="dpVEx" data-v="${esc(x)}">${esc(x)}</button>`).join('')}</div></div>
 <div class="card"><h3 style="margin-top:0">Qué hizo</h3><ul class="dp-vlog">${(DPU.vlog||[]).map(x=>`<li class="${x.ok?'ok':'bad'}"><b>${esc(x.q)}</b><br><span class="sm">${esc(x.r)}</span></li>`).join('')||'<li class="mut sm">Todavía no diste ninguna orden.</li>'}</ul></div>
 <p class="sm mut">Entiende: confirmar / validar pedido (mesa o número) · mesa N en preparación X minutos · pedido N listo · mesa N servida · cuenta mesa N · mesa N, cantidad y plato (con adicionales «con …»). Nunca cobra ni cancela solo.</p>`;},()=>{const i=$('#dp-vq');if(i){i.focus();i.addEventListener('keydown',e=>{if(e.key==='Enter')A.dpVRun();});}},'Salón y cocina');

/* ---------- acciones ---------- */
A.dpSec=el=>{DPU.salon=el.dataset.v;rerender();};A.dpCmd=el=>{DPU.cmd=el.dataset.v;rerender();};A.dpDel=el=>{DPU.del=el.dataset.v;rerender();};
A.dpFicha=el=>{DPU.ficha=el.dataset.id;DPU.fsize='g';DPU.kitDraft=null;rerender();};A.dpFsz=el=>{DPU.fsize=el.dataset.v;rerender();};
A.dpGo=el=>{const o=dpO(el.dataset.id);if(!o)return;const e=dpDo(el.dataset.a,o);if(e)return toast(e,1);dpCommit();};
A.dpCancel=el=>{const o=dpO(el.dataset.id);if(!o)return;modal('Cancelar pedido #'+o.n,`<p>${esc(dpOrigin(o))} · ${money(dpOrderTot(o))}</p><label for="dp-cw">Motivo (queda en auditoría)</label><input id="dp-cw" maxlength="80" placeholder="Ej.: el cliente se arrepintió">`,
 {okText:'Cancelar pedido',cancelText:'Volver',onOk:w=>{const e=dpDo('cancel',o,val('dp-cw').trim());if(e){w._err(e);return false;}dpCommit();}});};
A.dpEtaM=el=>{const o=dpO(el.dataset.id);if(!o)return;const w=modal('Tiempo de entrega · pedido #'+o.n,`<p class="sm">${esc(dpOrigin(o))} · ${dpItems(o)} ítems</p>${dpLinesHTML(o)}<div class="ux-chips" style="margin:.5rem 0">${[8,12,15,18,20,25,30,40].map(m=>`<button class="ux-chip" data-eta="${m}">${m}′</button>`).join('')}</div><label for="dp-eta">Minutos</label><input id="dp-eta" inputmode="numeric" value="${o.eta||15}">`,
 {okText:o.status==='pend_cocina'?'Aceptar comanda':'Guardar tiempo',onOk:w=>{const m=parseInt(val('dp-eta'),10);if(!(m>0&&m<=120))return w._err('Entre 1 y 120 minutos.'),false;const e=dpDo('accept',o,m);if(e){w._err(e);return false;}dpCommit();}});
 w.addEventListener('click',e=>{const b=e.target.closest('[data-eta]');if(b){$('#dp-eta').value=b.dataset.eta;$('#dp-eta').focus();}});};
A.dpDisp=el=>{const o=dpO(el.dataset.id);if(!o)return;const cs=dpStaffOf('cadete');modal('Asignar cadete · pedido #'+o.n,`<p class="sm">${esc((o.customer||{}).addr||'')}</p><label for="dp-cad">Cadete</label><select id="dp-cad">${cs.map(e=>{const c=G().cadetes[e.id]||{};return `<option value="${e.id}" ${c.estado==='en_reparto'?'disabled':''}>${esc(dpEmpN(e.id))}${c.estado==='en_reparto'?' (en reparto)':''}</option>`;}).join('')}</select>`,
 {okText:'Despachar',onOk:w=>{const e=dpDo('dispatch',o,val('dp-cad'));if(e){w._err(e);return false;}dpCommit();}});};
A.dpRendir=el=>{const c=G().cadetes[el.dataset.id];if(!c||!c.efectivo)return;const s=openSess();if(!s)return toast('Abrí la caja para recibir la rendición.',1);
 confirmBox('Rendición del cadete',`${esc(dpEmpN(el.dataset.id))} entrega <b>${money(c.efectivo)}</b> en efectivo. Esas ventas ya se registraron en efectivo al entregarse: la plata entra al cajón y el arqueo la espera. Acá sólo se deja constancia de que el cadete rindió.`,()=>{
  audit('DELIVERY_RENDICION',dpEmpN(el.dataset.id)+' · '+money(c.efectivo)+' · caja '+S.tenant.caja);c.efectivo=0;dpCommit();toast('Rendición registrada.');},'Recibí el efectivo');};
A.dpCallOk=el=>{const t=dpT(el.dataset.id);if(t&&t.session){t.session.call=false;audit('MESA_LLAMADO_ATENDIDO',t.label);dpCommit();}};
A.dpPySim=()=>{const o=dpPyNew();toast('PedidosYa: pedido '+o.customer.py+' recibido ('+(G().py.autoAccept?'directo a cocina':'en caja')+').');dpCommit();};
function dpPyNew(){const D=G();const R=dpRnd(now()%9973);const PYN=['Lucía F.','Tomás R.','Valeria C.','Diego A.','Florencia M.','Andrés P.','Julieta B.','Matías L.'];const PYA=['Av. Belgrano 1420','Zuviría 560','Urquiza 980, PB','Av. Sarmiento 220','Lerma 711','Alvarado 1830','Catamarca 455','Santiago del Estero 1290'];
 const ps=S.products.filter(p=>p.menu&&p.active&&p.dp&&(p.rubro==='dp-piz'||p.rubro==='dp-beb'||p.id==='e_fai'));const items=[];const n=1+Math.floor(R()*3);
 for(let i=0;i<n;i++){const p=ps[Math.floor(R()*ps.length)];const ind=p.dp.sizes&&R()<.3&&dpP(p.id+'_i');items.push({id:uid(),pid:ind?p.id+'_i':p.id,qty:1+Math.floor(R()*2),ex:[],note:''});}
 D.seq.py++;D.py.lastSync=now();return DP_FLOW.create({channel:'pedidosya',customer:{name:PYN[Math.floor(R()*PYN.length)],addr:PYA[Math.floor(R()*PYA.length)],py:'PY-'+D.seq.py},items,status:D.py.autoAccept?'pend_cocina':'pend_caja',paid:true,by:'PedidosYa (auto)'});}
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset)return;if(t.dataset.dpchk){G().py[t.dataset.dpchk]=t.checked;audit('PEDIDOSYA_AJUSTE',t.dataset.dpchk+' = '+(t.checked?'sí':'no'));dpCommit();}
 if(t.dataset.dpcalc){const n=parseInt(t.value,10);if(n>0&&n<=400){DPU.calcN=n;rerender();}}});
/* detalle de una mesa */
A.dpMesa=el=>{const t=dpT(el.dataset.id);if(!t)return;const s=dpTableState(t);const os=dpSessOrders(t);const cart=G().carts[t.id]||[];const url=dpTableURL(t);
 const w=modal(t.label+' · '+s.l,`<div class="row" style="gap:1rem;align-items:flex-start;flex-wrap:wrap"><div class="sp" style="min-width:240px">${t.session?`<p class="sm">Abierta ${dpAgo(t.session.openedAt)} · ${t.session.guests} personas · atiende ${esc(dpEmpN(t.mozo))}</p>`:`<p class="sm">Libre · ${t.seats} lugares · atiende ${esc(dpEmpN(t.mozo))}</p>`}
  ${os.map(o=>`<div class="dp-mo"><div class="row"><b class="sp">#${o.n}</b>${dpStp(o.status)} ${dpEta(o)}</div>${dpLinesHTML(o)}<div class="row"><span class="sp sm mut">${dpChip(o)}</span><b>${money(dpOrderTot(o))}</b></div><div class="row" style="gap:.3rem;flex-wrap:wrap;margin-top:.3rem">${dpActs(o)}</div></div>`).join('')||'<p class="sm mut">Sin comandas en esta visita.</p>'}
  ${cart.length?`<p class="sm"><b>Precarga desde el QR:</b> ${cart.map(l=>l.qty+'× '+esc(dpLineName(l))).join(', ')}</p>`:''}
  ${t.session?`<div class="row" style="margin-top:.5rem"><b class="sp">Consumo de la mesa</b><b style="font-size:1.3rem">${money(dpTableTot(t))}</b></div>`:''}</div>
  <div style="text-align:center;width:180px"><div class="dp-qr">${QR.svg(url,3,2)}</div><p class="sm mut" style="margin:.3rem 0">QR y tag NFC de ${esc(t.label)}</p><a class="btn sm" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Abrir la carta de la mesa</a></div></div>
  <div class="row" style="gap:.4rem;flex-wrap:wrap;margin-top:.8rem">${t.session?'':`<button class="btn" data-mesa="open">Abrir mesa</button>`}<button class="btn gold" data-mesa="new">Cargar pedido</button><button class="btn" data-mesa="carta">Ver la carta como el cliente</button><button class="btn" data-mesa="print">Imprimir QR</button>${t.session&&dpCan('sell')&&os.some(o=>!o.paid)?`<button class="btn gold" data-mesa="cobrar">Cobrar en Vender</button>`:''}${t.session&&!os.length?`<button class="btn ghost" data-mesa="close">Liberar mesa</button>`:''}</div>`,{wide:true,ok:false,cancelText:'Cerrar'});
 w.addEventListener('click',e=>{const b=e.target.closest('[data-mesa]');if(!b)return;const k=b.dataset.mesa;
  if(k==='open'){w.remove();modal('Abrir '+t.label,`<label for="dp-g">Personas</label><input id="dp-g" inputmode="numeric" value="${Math.min(2,t.seats)}">`,{okText:'Abrir mesa',onOk:()=>{const g=Math.max(1,Math.min(20,parseInt(val('dp-g'),10)||2));dpOpenSess(t,g);dpCommit();}});}
  else if(k==='new'){w.remove();dpCompose({ch:'mozo',t:t.id});}else if(k==='carta'){w.remove();A.dpCarta({dataset:{t:t.id}});}else if(k==='print'){dpPrintQR(t);}
  else if(k==='cobrar'){w.remove();A.dpCobrar({dataset:{t:t.id}});}else if(k==='close'){w.remove();audit('MESA_LIBERADA',t.label);t.session=null;delete G().carts[t.id];dpCommit();}});};
function dpTableURL(t){const b=typeof PUBLIC_URL==='function'?PUBLIC_URL():((window.RAVE_BUILD||{}).publicUrl||'');let base=b;try{if(/^https?:/.test(location.protocol))base=location.href.split('#')[0].split('?')[0];}catch(e){}return base+'?mesa='+encodeURIComponent(t.id);}
function dpPrintQR(t){const url=dpTableURL(t);const w=window.open('','_blank','width=420,height=560');if(!w)return toast('El navegador bloqueó la ventana: permití las ventanas emergentes.',1);
 w.document.write(`<!doctype html><meta charset="utf-8"><title>QR ${esc(t.label)}</title><body style="font-family:Georgia,serif;text-align:center;padding:24px"><img src="${LOGO_MENU}" alt="Di Parma" style="width:120px;border-radius:50%"><h1 style="margin:.4rem 0">${esc(t.label)}</h1><div style="width:260px;margin:0 auto">${QR.svg(url,6,2)}</div><p>Escaneá o apoyá el celular en el NFC para ver la carta y pedir.</p><p style="font-size:11px;color:#666">${esc(url)}</p><script>setTimeout(()=>print(),300)<\/script></body>`);w.document.close();audit('MESA_QR_IMPRESO',t.label);}
/* ver la carta tal como la ve el cliente (en un marco dentro del panel) */
A.dpCarta=el=>{const tid=el.dataset.t||'';const ts=G().tables;const w=modal('Carta del cliente',`<div class="row" style="gap:.5rem;flex-wrap:wrap;margin-bottom:.5rem"><label for="dp-cm" class="sm" style="margin:0">Simular escaneo en</label><select id="dp-cm" style="max-width:280px"><option value="">Carta pública · retiro y delivery</option>${ts.map(t=>`<option value="${t.id}" ${t.id===tid?'selected':''}>${esc(t.label)} · ${esc(dpTableState(t).l)}</option>`).join('')}</select></div>
 <div class="dp-phone"><iframe id="dp-cf" title="Carta de Di Parma como la ve el cliente"></iframe></div><p class="sm mut">Lo que pidas acá entra al circuito real de la demo: cambiá de perfil (Mozo → Caja → Cocina) y mirá cómo avanza.</p>`,{wide:true,ok:false,cancelText:'Cerrar'});
 const load=()=>{const f=w.querySelector('#dp-cf');f.srcdoc=dpPubDoc(w.querySelector('#dp-cm').value);};load();w.querySelector('#dp-cm').addEventListener('change',load);};
function dpPubDoc(mesa){const inj=`<script>window.__DPMESA=${JSON.stringify(mesa||'')};window.__DPEMBED=1;<\/script>`;return PUB_DOC.replace('<body>','<body>'+inj);}
if(isPizzaBuild()&&typeof buildPubDoc==='function'){const _bp=buildPubDoc;buildPubDoc=function(){let m='';try{const q=new URLSearchParams(location.search);m=(q.get('mesa')||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,4);}catch(e){}
 return _bp.apply(this,arguments).replace('<body>','<body><script>window.__DPMESA='+JSON.stringify(m)+';<\/script>');};}
/* cargar un pedido (mozo, mostrador, delivery) */
let DPC=null;
A.dpNew=el=>dpCompose({ch:el.dataset.ch||'mozo',t:el.dataset.t||''});
function dpCompose(o){if(!dpCan('dp_salon'))return toast('Sin permiso',1);DPC={ch:o.ch,t:o.t||'',lines:[],cat:'dp-piz',cust:{name:'',tel:'',addr:'',pago:''},sz:'g'};
 const w=modal(o.ch==='delivery'?'Pedido delivery propio':o.ch==='mostrador'?'Pedido de mostrador':'Cargar pedido',`<div id="dp-cmp"></div>`,{wide:true,okText:'Enviar a caja',onOk:w=>{const L=DPC.lines;if(!L.length)return w._err('Agregá al menos un plato.'),false;
  if(DPC.ch==='mozo'&&!DPC.t)return w._err('Elegí la mesa.'),false;if(DPC.ch==='delivery'&&(!DPC.cust.name.trim()||!DPC.cust.addr.trim()))return w._err('Para delivery hacen falta el nombre y la dirección.'),false;
  const r=DP_FLOW.create({channel:DPC.ch,tableId:DPC.ch==='mozo'?DPC.t:null,customer:DPC.ch==='mozo'?null:{name:DPC.cust.name.trim()||'Mostrador',tel:DPC.cust.tel.trim(),addr:DPC.cust.addr.trim(),pago:DPC.cust.pago.trim()},items:L,status:'pend_caja',mozo:dpRol()==='mozo'&&user.empId?user.empId:null});
  if(DPC.ch==='mozo'){const t=dpT(DPC.t);if(t&&G().carts[t.id])delete G().carts[t.id];}toast('Pedido #'+r.n+' enviado a caja.');DPC=null;dpCommit();}});
 const paint=()=>{const box=w.querySelector('#dp-cmp');if(!box)return;const ps=S.products.filter(p=>p.active&&p.menu&&p.rubro===DPC.cat);const tot=DPC.lines.reduce((a,l)=>a+dpLineTot(l),0);
  box.innerHTML=`${DPC.ch==='mozo'?`<label for="dp-ct">Mesa</label><select id="dp-ct" data-cf="t">${G().tables.map(t=>`<option value="${t.id}" ${t.id===DPC.t?'selected':''}>${esc(t.label)} · ${esc(dpTableState(t).l)}</option>`).join('')}</select>`
   :`<div class="grid g2"><div><label for="dp-cn1">Nombre</label><input id="dp-cn1" data-cf="name" value="${esc(DPC.cust.name)}" maxlength="40"></div><div><label for="dp-ct1">Celular</label><input id="dp-ct1" data-cf="tel" inputmode="tel" value="${esc(DPC.cust.tel)}" maxlength="20"></div></div>${DPC.ch==='delivery'?`<div class="grid g2"><div><label for="dp-ca1">Dirección</label><input id="dp-ca1" data-cf="addr" value="${esc(DPC.cust.addr)}" maxlength="80"></div><div><label for="dp-cp1">Pago</label><input id="dp-cp1" data-cf="pago" value="${esc(DPC.cust.pago)}" placeholder="Efectivo, paga con…" maxlength="60"></div></div>`:''}`}
  <div class="ux-tabs" role="tablist" style="margin-top:.6rem">${DP_CATS.filter(c=>['dp-piz','dp-ent','dp-czn','dp-pos','dp-beb'].includes(c[0])).map(c=>`<a role="tab" tabindex="0" class="${DPC.cat===c[0]?'on':''}" aria-selected="${DPC.cat===c[0]}" data-cc="${c[0]}">${c[3]}</a>`).join('')}</div>
  ${DPC.cat==='dp-piz'?`<div class="row sm" style="gap:.4rem;margin:.3rem 0"><span>Tamaño:</span>${[['g','Grande'],['i','Individual']].map(([k,l])=>`<button class="btn sm ${DPC.sz===k?'on':''}" data-csz="${k}">${l}</button>`).join('')}</div>`:''}
  <div class="dp-pick">${ps.map(p=>`<button class="dp-pk" data-cadd="${p.id}"><span class="dp-pka">${dpArt(p)}</span><b>${esc(p.name)}</b><span>${money(DPC.cat==='dp-piz'&&DPC.sz==='i'&&dpP(p.id+'_i')?dpP(p.id+'_i').price:p.price)}</span></button>`).join('')}</div>
  <h4 style="margin:.6rem 0 .2rem">Pedido</h4>${DPC.lines.length?`<ul class="dp-ln">${DPC.lines.map((l,i)=>`<li><b>${l.qty}×</b><span class="sp">${esc(dpLineName(l))}${dpLineDesc(l)?`<small>${esc(dpLineDesc(l))}</small>`:''}<input class="dp-nt" data-cnote="${i}" value="${esc(l.note)}" placeholder="Aclaración (ej.: bien cocida)" maxlength="60" aria-label="Aclaración"></span><span class="row" style="gap:.2rem"><button class="btn sm" data-cq="${i}" data-d="-1" aria-label="Quitar uno">−</button><button class="btn sm" data-cq="${i}" data-d="1" aria-label="Agregar uno">+</button>${dpP(l.pid)&&dpP(l.pid).rubro==='dp-piz'?`<button class="btn sm" data-cex="${i}">+ Adicional</button>`:''}</span><b>${money(dpLineTot(l))}</b></li>`).join('')}</ul><p class="r"><b>Total ${money(tot)}</b></p>`:'<p class="sm mut">Tocá los platos para agregarlos.</p>'}`;};
 w.addEventListener('click',e=>{const b=e.target.closest('[data-cc],[data-csz],[data-cadd],[data-cq],[data-cex]');if(!b)return;
  if(b.dataset.cc){DPC.cat=b.dataset.cc;}else if(b.dataset.csz){DPC.sz=b.dataset.csz;}
  else if(b.dataset.cadd){let pid=b.dataset.cadd;if(DPC.cat==='dp-piz'&&DPC.sz==='i'&&dpP(pid+'_i'))pid+='_i';const x=DPC.lines.find(l=>l.pid===pid&&!l.ex.length&&!l.note);if(x)x.qty++;else DPC.lines.push({id:uid(),pid,qty:1,ex:[],note:''});}
  else if(b.dataset.cq){const l=DPC.lines[+b.dataset.cq];l.qty+=+b.dataset.d;if(l.qty<=0)DPC.lines.splice(+b.dataset.cq,1);}
  else if(b.dataset.cex){const l=DPC.lines[+b.dataset.cex];const ex=S.products.filter(p=>p.active&&p.dp&&p.dp.extra);const m=modal('Adicionales',ex.map(x=>`<label class="chk"><input type="checkbox" value="${x.id}" ${l.ex.includes(x.id)?'checked':''}> ${esc(x.name)} · ${money(x.price)}</label>`).join(''),{okText:'Listo',onOk:mw=>{l.ex=[...mw.querySelectorAll('input:checked')].map(i=>i.value);paint();}});return;}
  paint();});
 w.addEventListener('input',e=>{const t=e.target;if(t.dataset.cf){if(t.dataset.cf==='t')DPC.t=t.value;else DPC.cust[t.dataset.cf]=t.value;}if(t.dataset.cnote!==undefined){const l=DPC.lines[+t.dataset.cnote];if(l)l.note=t.value;}});
 w.addEventListener('change',e=>{const t=e.target;if(t.dataset.cf==='t'){DPC.t=t.value;}});
 if(o.ch==='mozo'&&!DPC.t){const f=G().tables.find(t=>t.session)||G().tables[0];DPC.t=f.id;}paint();}
/* fermentación */
A.dpLote=()=>{if(!dpCan('dp_ferm'))return toast('Sin permiso',1);const F=G().ferm;modal('Nuevo lote de masa',`<p class="sm mut">Se descuentan la harina y la sal del stock de insumos (con su movimiento en auditoría).</p><div class="grid g3"><div><label for="nl-n">Bollos</label><input id="nl-n" inputmode="numeric" value="40"></div><div><label for="nl-p">Peso por bollo (g)</label><input id="nl-p" inputmode="numeric" value="${F.bolloPeso}"></div><div><label for="nl-h">Hidratación %</label><input id="nl-h" inputmode="numeric" value="${F.hidr}"></div></div>
 <div class="grid g2"><div><label for="nl-hr">Maduración objetivo</label><select id="nl-hr"><option value="24">24 h</option><option value="48" selected>48 h</option><option value="72">72 h</option></select></div><div><label for="nl-t">Temp. de la masa °C</label><input id="nl-t" inputmode="decimal" value="24"></div></div><label for="nl-no">Nota</label><input id="nl-no" maxlength="80" placeholder="Ej.: harina lote L2471">`,
 {okText:'Crear lote',onOk:w=>{const n=parseInt(val('nl-n'),10),p=parseInt(val('nl-p'),10),h=parseInt(val('nl-h'),10),t=parseNum(val('nl-t'));if(!(n>0&&n<=300))return w._err('Entre 1 y 300 bollos.'),false;if(!(p>=150&&p<=400))return w._err('El peso va de 150 a 400 g.'),false;if(!(h>=55&&h<=85))return w._err('La hidratación va de 55 a 85 %.'),false;
  const fl=n*p/(1+h/100+.028+.2)/1000;const ha=dpP('in-harina'),sa=dpP('in-sal');if(ha){ha.stock=Math.round((ha.stock-fl)*1000)/1000;}if(sa){sa.stock=Math.round((sa.stock-fl*.028)*1000)/1000;}
  const id='L'+(1000+F.lotes.length+21+Math.floor(now()/1e7)%50);F.lotes.push({id,start:now(),hours:+val('nl-hr'),bollos:n,peso:p,hidr:h,temps:isNaN(t)?[]:[t],note:val('nl-no').trim()});
  audit('LOTE_MASA_NUEVO',id+' · '+n+' bollos de '+p+' g · harina −'+dpQ(fl,'kg'));dpCommit();toast('Lote '+id+' creado. Los bollos entran al stock cuando quede listo.');}});};
A.dpTemp=el=>{const l=G().ferm.lotes.find(x=>x.id===el.dataset.id);if(!l)return;modal('Temperatura · lote '+l.id,`<label for="dp-tp">°C</label><input id="dp-tp" inputmode="decimal" value="4">`,{okText:'Registrar',onOk:w=>{const t=parseNum(val('dp-tp'));if(isNaN(t)||t<-5||t>40)return w._err('Temperatura fuera de rango.'),false;l.temps.push(t);if(l.temps.length>40)l.temps.shift();audit('LOTE_TEMPERATURA',l.id+' · '+t+' °C');dpCommit();}});};
A.dpDesc=el=>{const l=G().ferm.lotes.find(x=>x.id===el.dataset.id);if(!l)return;const rest=l.ing?(dpLoteLeft()[l.id]||0):l.bollos;confirmBox('Descartar '+(l.ing?'sobrante':'lote')+' '+l.id,`Se descartan <b>${Math.floor(rest)}</b> bollos${l.ing?' del stock':''}. Queda en auditoría como merma de masa.`,()=>{
 if(l.ing){const b=dpP('dp-bollo');b.stock=Math.max(0,Math.round((b.stock-rest)*10)/10);}l.desc=true;audit('LOTE_DESCARTE',l.id+' · '+Math.floor(rest)+' bollos');dpCommit();},'Descartar');};
A.dpFeed=()=>{const m=G().ferm.madre;const t=parseNum(val('dp-mt')),r=parseNum(val('dp-mr'));if(!isNaN(t))m.temp=t;if(!isNaN(r))m.rise=r;m.lastFeed=now();m.feeds.push(now());if(m.feeds.length>12)m.feeds.shift();audit('MADRE_REFRESCO',m.ratio+' · '+m.temp+' °C · ×'+m.rise);dpCommit();toast('Refresco registrado.');};
/* fichas técnicas */
const dpShow=()=>{const sel=dpP(DPU.ficha)||dpP('p_dip');return sel.dp&&sel.dp.sizes&&DPU.fsize==='i'?dpP(sel.id+'_i')||sel:sel;};
A.dpFSave=()=>{if(!dpCan('dp_fichas'))return toast('Sin permiso',1);const p=dpShow();if(!isKit(p))return;const bad=[];
 $$('[data-dpkit]').forEach(i=>{const k=p.kit[+i.dataset.dpkit];const c=dpP(k.pid);const v=parseNum(i.value);if(isNaN(v)||v<0){bad.push(c.name);return;}k.qty=c.unit==='u'?v:Math.round(v/1000*10000)/10000;});
 if(bad.length)return toast('Revisá la cantidad de '+bad.join(', '),1);p.kit=p.kit.filter(k=>k.qty>0);audit('FICHA_TECNICA',p.name+(p.dp&&p.dp.ind?' (individual)':'')+' · costo '+money(kitCost(p)));save();rerender();toast('Ficha guardada: costo '+money(kitCost(p))+'.');};
A.dpFAdd=()=>{if(!dpCan('dp_fichas'))return toast('Sin permiso',1);const p=dpShow();if(!isKit(p))return;const id=val('dp-fai'),q=parseNum(val('dp-faq'));const c=dpP(id);if(!c||isNaN(q)||q<=0)return toast('Elegí el insumo y la cantidad.',1);
 p.kit.push({pid:id,qty:c.unit==='u'?q:Math.round(q/1000*10000)/10000});audit('FICHA_TECNICA_INSUMO',p.name+' + '+c.name);save();rerender();};
A.dpFSug=()=>{const p=dpShow();const i=$('#dp-fpr');if(i)i.value=pesosStr(Math.round(kitCost(p)/.3/10000)*10000);};
A.dpFPrice=()=>{if(!dpCan('dp_fichas')||!can('edit_products'))return toast('Sin permiso',1);const p=dpShow();const v=cents(val('dp-fpr'));if(isNaN(v)||v<=0)return toast('Precio inválido.',1);const old=p.price;p.price=v;audit('PRECIO',p.name+' · '+money(old)+' → '+money(v));save();if(typeof pubRefresh==='function')pubRefresh();rerender();toast('Precio actualizado (también en la carta).');};
/* ---------- asistente de comandas (texto o voz; sólo personal) ---------- */
const DP_NUM={un:1,una:1,uno:1,dos:2,tres:3,cuatro:4,cinco:5,seis:6,siete:7,ocho:8,nueve:9,diez:10,once:11,doce:12,quince:15,veinte:20,treinta:30};
const dpNum=w=>{if(w==null)return NaN;w=String(w);return /^\d+$/.test(w)?+w:(DP_NUM[w]||NaN);};
function dpFindTable(q){const m=q.match(/\b(mesa|barra|exterior|banqueta)\s+(\d+|[a-z]+)/);if(!m)return null;const n=dpNum(m[2]);const k=m[1]==='barra'||m[1]==='banqueta'?'B':m[1]==='exterior'?'E':'I';return dpT(k+n)||null;}
function dpFindProd(txt){const ps=S.products.filter(p=>p.active&&p.dp&&(p.menu||p.dp.extra));let best=null,bs=0;const q=dpNorm(txt);
 ps.forEach(p=>{const nm=dpNorm(p.name);const words=nm.split(/\s+/).filter(w=>w.length>2);let sc=0;if(q.includes(nm))sc=10+nm.length;else words.forEach(w=>{if(q.includes(w))sc+=w.length;else if(q.includes(w.replace(/s$/,'')))sc+=w.length-1;});if(sc>bs){bs=sc;best=p;}});return bs>=4?best:null;}
function dpParseItems(txt){const parts=dpNorm(txt).split(/,|\by\b(?=\s+(?:\d+|un|una|uno|dos|tres|cuatro|cinco|seis)\b)/).map(s=>s.trim()).filter(Boolean);const out=[];
 parts.forEach(pt=>{const m=pt.match(/^(\d+|un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s+(.*)$/);const q=m?dpNum(m[1]):1;let rest=m?m[2]:pt;let ex=[];
  const cm=rest.split(/\bcon\b/);rest=cm[0];if(cm[1]){cm[1].split(/\by\b/).forEach(e=>{const x=dpFindProd(e);if(x&&x.dp.extra)ex.push(x.id);else{const xx=S.products.find(p=>p.dp&&p.dp.extra&&dpNorm(e).includes(dpNorm(p.name).split(' ').pop()));if(xx)ex.push(xx.id);}});}
  let p=dpFindProd(rest);if(!p)return;if(p.dp.extra)return;const ind=/individual|chica/.test(rest)&&dpP(p.id+'_i');out.push({id:uid(),pid:ind?p.id+'_i':(p.dp.of||p.id),qty:q||1,ex,note:''});});return out;}
function dpVoice(q0){const q=dpNorm(q0).replace(/[.¿?¡!]/g,' ').replace(/\s+/g,' ').trim();if(!q)return{ok:false,r:'No entendí la orden.'};const D=G();const t=dpFindTable(q);
 const byN=()=>{const m=q.match(/\b(pedido|comanda|numero|#)\s*(\d+)/);return m?dpOn(+m[2]):null;};
 const pick=(sts)=>{const o=byN();if(o)return o;if(t)return dpSessOrders(t).filter(x=>sts.includes(x.status)).sort((a,b)=>a.createdAt-b.createdAt)[0]||null;return null;};
 if(/\b(confirmar|confirma|validar|valida|validame|confirmame)\b/.test(q)){const o=pick(['pend_mozo','pend_caja']);if(!o)return{ok:false,r:'No encontré un pedido para confirmar'+(t?' en '+t.label:'')+'.'};
  const act=o.status==='pend_mozo'?'validate':'confirm';const e=dpDo(act,o);return e?{ok:false,r:e}:{ok:true,r:'Pedido #'+o.n+' · '+dpOrigin(o)+(act==='validate'?' validado: pasa a caja.':' confirmado: pasa a cocina.')};}
 const mm=q.match(/(\d+|[a-z]+)\s*(minutos|minuto|min)\b/);
 if(mm&&/(preparacion|horno|tiempo|minutos|min)\b/.test(q)){const m=dpNum(mm[1]);const o=pick(['pend_cocina','preparando']);if(!o)return{ok:false,r:'No encontré una comanda en cocina'+(t?' de '+t.label:'')+'.'};if(!(m>0))return{ok:false,r:'Decime cuántos minutos.'};
  const e=dpDo('accept',o,m);return e?{ok:false,r:e}:{ok:true,r:'Pedido #'+o.n+' · '+dpOrigin(o)+' en el horno: '+m+' minutos.'};}
 if(/\b(listo|lista|listos|salio|sale)\b/.test(q)){const o=pick(['pend_cocina','preparando']);if(!o)return{ok:false,r:'No encontré una comanda en preparación'+(t?' de '+t.label:'')+'.'};const e=dpDo('ready',o);return e?{ok:false,r:e}:{ok:true,r:'Pedido #'+o.n+' · '+dpOrigin(o)+' listo.'};}
 if(/\b(servida|servido|entregada|entregado|servi)\b/.test(q)){const o=pick(['listo','en_camino']);if(!o)return{ok:false,r:'No encontré un pedido listo'+(t?' en '+t.label:'')+'.'};const e=dpDo('deliver',o);return e?{ok:false,r:e}:{ok:true,r:'Pedido #'+o.n+' · '+dpOrigin(o)+' entregado.'};}
 if(/\b(cuenta|cobrar)\b/.test(q)){if(!t||!t.session)return{ok:false,r:'Esa mesa no está abierta.'};t.session.bill=true;audit('MESA_PIDE_CUENTA',t.label+' (asistente)');dpNotify(t.label+' pidió la cuenta: '+money(dpTableTot(t))+'.',['caja','mozo','admin']);return{ok:true,r:t.label+': cuenta pedida ('+money(dpTableTot(t))+'). Cobrala desde Salón o Mozo.'};}
 if(t){const rest=q.replace(/^.*?\b(mesa|barra|exterior|banqueta)\s+(\d+|[a-z]+)\s*,?\s*/,'');const it=dpParseItems(rest);if(!it.length)return{ok:false,r:'No reconocí ningún plato de la carta en «'+q0+'».'};if(!dpCan('dp_salon'))return{ok:false,r:'Sin permiso para cargar pedidos.'};
  const o=DP_FLOW.create({channel:'voz',tableId:t.id,items:it,status:'pend_caja',mozo:dpRol()==='mozo'&&user.empId?user.empId:null});return{ok:true,r:'Pedido #'+o.n+' para '+t.label+': '+it.map(l=>l.qty+'× '+dpLineName(l)+(l.ex.length?' '+dpLineDesc(l):'')).join(', ')+'. Enviado a caja.'};}
 return{ok:false,r:'No entendí. Probá con «confirmar pedido mesa 4» o «mesa 6, una margherita».'};}
A.dpVRun=()=>{const i=$('#dp-vq');if(!i)return;const q=i.value.trim();if(!q)return;const r=dpVoice(q);DPU.vlog=[Object.assign({q},r)].concat(DPU.vlog||[]).slice(0,12);audit('ASISTENTE_COMANDAS',q.slice(0,100)+' → '+(r.ok?'ok':'no'));if(r.ok)dpCommit(true);toast(r.r,!r.ok);rerender();};
A.dpVEx=el=>{const i=$('#dp-vq');if(i){i.value=el.dataset.v;A.dpVRun();}};
A.dpVMic=()=>{const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)return toast('Tu navegador no tiene dictado: usá Chrome o Edge.',1);const r=new SR();r.lang='es-AR';r.interimResults=false;const b=$('#dp-mic');if(b)b.textContent='🎙 Escuchando…';
 r.onresult=e=>{const t=e.results[0][0].transcript;const i=$('#dp-vq');if(i){i.value=t;A.dpVRun();}};r.onerror=()=>toast('No pude escuchar. Revisá el permiso del micrófono.',1);r.onend=()=>{const b2=$('#dp-mic');if(b2)b2.textContent='🎙 Dictar';};try{r.start();}catch(e){}};
/* ---------- circuito en automático (para la presentación) ---------- */
let DP_AP=null;
A.dpAuto=()=>{if(DP_AP)return toast('El recorrido ya está en marcha.');const t=dpT('I6');if(!t)return;if(!t.session)dpOpenSess(t,2,true);
 const it=[{id:uid(),pid:'p_dip',qty:1,ex:['x_bur'],note:''},{id:uid(),pid:'b_cer',qty:2,ex:[],note:''}];let o=null;
 const steps=[['El cliente de la Mesa 6 escanea el QR y envía su pedido.',()=>{o=DP_FLOW.create({channel:'qr',tableId:'I6',items:it,status:'pend_mozo',by:'QR mesa 6'});}],
  ['Sofía (moza) lo valida en la mesa.',()=>DP_FLOW.validate(o,'Sofía')],['Caja lo confirma.',()=>DP_FLOW.confirm(o,'Camila')],['Cocina lo acepta y le da 15 minutos: el cliente ve la cuenta regresiva.',()=>DP_FLOW.accept(o,15,'Franco')],
  ['Sale del horno: listo para servir.',()=>DP_FLOW.ready(o,'Franco')],['Sofía lo sirve en la mesa.',()=>DP_FLOW.deliver(o,'Sofía')],['La mesa pide la cuenta: se cobra en Vender con todos los medios, cupones y el Club.',()=>{t.session.bill=true;}]];
 let i=0;const card=document.createElement('div');card.className='dp-ap';card.setAttribute('role','status');document.body.appendChild(card);
 const run=()=>{if(i>=steps.length){card.innerHTML=`<b>Recorrido terminado</b><span>La Mesa 6 está lista para cobrar.</span><button class="btn sm gold" data-act="dpCobrar" data-t="I6">Cobrar en Vender</button><button class="btn sm" data-dpx="1">Cerrar</button>`;DP_AP=null;card.querySelector('[data-dpx]').onclick=()=>card.remove();return;}
  const [txt,fn]=steps[i];fn();dpCommit();card.innerHTML=`<b>Paso ${i+1} de ${steps.length}</b><span>${esc(txt)}</span><div class="dp-apb"><i style="width:${(i+1)/steps.length*100}%"></i></div>`;i++;DP_AP=setTimeout(run,2600);};run();};
/* ---------- reloj en vivo: cuentas regresivas, lotes y pedidos de prueba ---------- */
let dpLastRev=0,dpLastFeed=0;
function dpLive(force){if(!isPizzaBuild()||!S||!S.dp)return;if(!$('#panel')||$('#panel').hidden)return;const cur=typeof curScreen!=='undefined'?curScreen:'';
 if(force&&/^dp/.test(cur)&&!$('#modal-root .ov')){const a=document.activeElement;if(!(a&&a.matches&&a.matches('#view input,#view textarea,#view select')))rerender();}}
setInterval(()=>{if(!isPizzaBuild()||!S||!S.dp)return;$$('[data-dpcd]').forEach(el=>{const t=+el.dataset.dpcd;el.textContent=dpMMSS(t-now());el.classList.toggle('late',t<now());});
 try{if(dpBollosSync())dpCommit(false);}catch(e){}
 try{const D=S.dp;if(D.py.demoFeed&&user&&now()-dpLastFeed>45000){dpLastFeed=now();dpPyNew();dpCommit();}}catch(e){}},1000);
/* ---------- API para la carta pública (mismo equipo; los datos son de la demo) ---------- */
function dpPubProd(p){const i=p.dp&&p.dp.sizes?dpP(p.id+'_i'):null;const agot=isKit(p)?kitStock(p)<=0&&!canOver(p):stockOf(p)<=0&&!canOver(p);
 return{id:p.id,cat:p.rubro,n:p.name,d:p.desc||'',price:p.price/100,ind:i?{id:i.id,price:i.price/100}:null,star:!!(p.dp&&p.dp.star),alc:!!(p.dp&&p.dp.alc),art:dpArt(p),agot};}
function dpPubOrder(o){return{id:o.id,n:o.n,status:o.status,stl:DP_ST[o.status].l,step:DP_ST[o.status].step,eta:o.eta,etaAt:o.etaAt,total:dpOrderTot(o)/100,items:dpItems(o),channel:o.channel,tableId:o.tableId,log:o.log.map(l=>({s:l.s,t:l.t}))};}
window.DP_API={
 ctx:mesa=>{const D=G();const t=mesa?dpT(String(mesa).toUpperCase()):null;return{biz:{name:'Di Parma Pizzería',sub:'Pizzería de masa madre',dir:S.tenant.address,hours:'Mar a dom · 19:30 a 00:30'},
  table:t?{id:t.id,label:t.label,sector:t.sector,mozo:dpFirst(dpEmpN(t.mozo)),open:!!t.session,bill:!!(t.session&&t.session.bill),total:dpTableTot(t)/100}:null,
  cats:DP_CATS.filter(c=>['dp-piz','dp-ent','dp-czn','dp-pos','dp-beb'].includes(c[0])).map(c=>({id:c[0],n:c[1],s:c[3]})),
  prods:S.products.filter(p=>p.active&&p.menu&&p.dp&&!p.dp.ind).map(dpPubProd),extras:S.products.filter(p=>p.active&&p.dp&&p.dp.extra).map(p=>({id:p.id,n:p.name,price:p.price/100})),
  cart:t?(D.carts[t.id]||[]).map(l=>({pid:l.pid,qty:l.qty,ex:l.ex,note:l.note})):null,orders:t&&t.session?dpSessOrders(t).map(dpPubOrder):[],
  promo:'10 % off en tu primera visita como socio con BIENVENIDA10',club:{goal:+S.loyalty.goal||8,reward:String(S.loyalty.reward||'')}};},
 orders:ids=>{const D=G();return (ids||[]).map(id=>D.orders.find(o=>o.id===id)).filter(Boolean).map(dpPubOrder);},
 cart:(mesa,lines)=>{const t=dpT(String(mesa||'').toUpperCase());if(!t)return false;const L=dpCleanLines(lines);if(L.length)G().carts[t.id]=L;else delete G().carts[t.id];dpCommit(false);return true;},
 send:o=>{const t=o.mesa?dpT(String(o.mesa).toUpperCase()):null;const L=dpCleanLines(o.lines);if(!L.length)return{ok:false,msg:'El pedido está vacío.'};
  if(!t){const nm=String(o.name||'').trim().slice(0,40),tel=String(o.tel||'').replace(/[^\d+ -]/g,'').slice(0,20),addr=String(o.addr||'').trim().slice(0,80);if(nm.length<2)return{ok:false,msg:'Falta tu nombre.'};if(tel.replace(/\D/g,'').length<8)return{ok:false,msg:'Revisá tu celular.'};if(o.modo==='delivery'&&addr.length<4)return{ok:false,msg:'Falta la dirección de entrega.'};
   const r=DP_FLOW.create({channel:o.modo==='delivery'?'delivery':'web',customer:{name:nm,tel,addr:o.modo==='delivery'?addr:'',pago:o.modo==='delivery'?'Paga al recibir':'Paga al retirar'},items:L,status:'pend_caja',by:'Carta web'});dpCommit(false);return{ok:true,id:r.id,n:r.n};}
  const r=DP_FLOW.create({channel:'qr',tableId:t.id,items:L,status:'pend_mozo',by:'QR '+t.label.toLowerCase()});delete G().carts[t.id];dpCommit(false);return{ok:true,id:r.id,n:r.n};},
 call:mesa=>{const t=dpT(String(mesa||'').toUpperCase());if(!t)return false;if(!t.session)dpOpenSess(t,2,true);t.session.call=true;dpNotify(t.label+' llama al mozo.',['mozo','admin'],{tableId:t.id});audit('MESA_LLAMA_MOZO',t.label);dpCommit(false);return true;},
 bill:mesa=>{const t=dpT(String(mesa||'').toUpperCase());if(!t||!t.session)return false;t.session.bill=true;dpNotify(t.label+' pidió la cuenta: '+money(dpTableTot(t))+'.',['mozo','caja','admin'],{tableId:t.id});audit('MESA_PIDE_CUENTA',t.label);dpCommit(false);return true;},
 rev:()=>(S.dp&&S.dp.rev)||0};
function dpCleanLines(lines){return (Array.isArray(lines)?lines:[]).slice(0,40).map(l=>{const p=dpP(l&&l.pid);if(!p||!p.active||!p.dp||p.dp.extra||p.dp.ins||p.dp.bollo)return null;const q=Math.max(1,Math.min(20,parseInt(l.qty,10)||1));
 const ex=(Array.isArray(l.ex)?l.ex:[]).filter(e=>{const x=dpP(e);return x&&x.dp&&x.dp.extra&&x.active;}).slice(0,8);return{id:uid(),pid:p.id,qty:q,ex,note:String(l.note||'').replace(/[<>]/g,'').slice(0,60)};}).filter(Boolean);}
/* ---------- integración con la navegación, el Resumen, los avisos y la campana ---------- */
if(isPizzaBuild()){
 const sec='Salón y cocina';UX_SEC_ORDER.splice(1,0,sec);
 const items=[['dpsalon','Salón y barra'],['dpmozo','Mozo'],['dpcomandas','Comandas'],['dpcocina','Cocina'],['dpdelivery','Delivery y PedidosYa'],['dpferm','Fermentación'],['dpfichas','Fichas técnicas'],['dpvoz','Asistente']];
 items.forEach(([k])=>{UX_SEC_OF[k]=sec;});NAV.splice(1,0,...items.map(([k])=>[k,sec]));
 ['dpsalon','dpmozo','dpcomandas','dpcocina','dpdelivery','dpferm','dpvoz'].forEach(k=>{if(!UX_COMPACT_OK.includes(k))UX_COMPACT_OK.push(k);});
 delete SCREENS.pedidos; /* PedidosYa vive en «Delivery y PedidosYa», unido a cocina y caja */
 Object.assign(UX_TITLE,{inventario:'Stock e insumos'});

 const _uxB=uxBadges;uxBadges=function(){const b=_uxB();try{const D=S.dp;if(!D)return b;delete b.pedidos;const n=s=>D.orders.filter(o=>o.status===s).length;
  const me=user&&user.empId&&dpRol()==='mozo'?user.empId:null;const mine=o=>!me||(o.tableId&&(dpT(o.tableId)||{}).mozo===me);
  const v=D.orders.filter(o=>o.status==='pend_mozo'&&mine(o)).length,rd=D.orders.filter(o=>o.status==='listo'&&o.tableId&&mine(o)).length,cl=D.tables.filter(t=>t.session&&(t.session.call||t.session.bill)&&(!me||t.mozo===me)).length;
  if(v||rd||cl)b.dpmozo={n:v+rd+cl,c:v||cl?'red':'amber',pulse:v?1:0,t:[v?v+' pedido(s) del QR para validar':'',rd?rd+' plato(s) listos para servir':'',cl?cl+' mesa(s) llaman o piden la cuenta':''].filter(Boolean).join(' · ')};
  if(n('pend_caja'))b.dpcomandas={n:n('pend_caja'),c:'amber',t:n('pend_caja')+' comanda(s) para confirmar en caja'};
  const late=D.orders.filter(o=>o.status==='preparando'&&o.etaAt<now()).length;if(n('pend_cocina')||late)b.dpcocina={n:n('pend_cocina')+late,c:'red',pulse:n('pend_cocina')?1:0,t:[n('pend_cocina')?n('pend_cocina')+' comanda(s) sin tiempo':'',late?late+' demorada(s)':''].filter(Boolean).join(' · ')};
  const py=D.orders.filter(o=>dpIsDel(o)&&o.status==='listo').length;if(py)b.dpdelivery={n:py,c:'amber',t:py+' pedido(s) delivery listos para salir'};
  const bo=dpP('dp-bollo');if(bo&&stockOf(bo)<15)b.dpferm={n:Math.max(0,Math.floor(stockOf(bo))),c:'red',t:'Quedan pocos bollos listos'};
  const bi=D.tables.filter(t=>t.session&&t.session.bill).length;if(bi&&can('sell'))b.dpsalon={n:bi,c:'amber',t:bi+' mesa(s) pidieron la cuenta'};
  if(b.inventario){const L=S.products.filter(p=>p.active&&!p.archived&&!p.noStock&&((p.dp&&p.dp.ins)?stockOf(p)<=(p.min||0):(!isKit(p)&&!(p.dp&&p.dp.bollo)&&stockOf(p)<=5)));if(L.length)b.inventario.n=L.length,b.inventario.t=L.length+' insumo(s) o artículo(s) bajo el mínimo';else delete b.inventario;}}catch(e){}return b;};
 A.uxBell=()=>{const B=uxBadges();const GO={inventario:'inventario',crm:'crm',caja:'caja',presup:'presup',dpmozo:'dpmozo',dpcomandas:'dpcomandas',dpcocina:'dpcocina',dpdelivery:'dpdelivery',dpferm:'dpferm',dpsalon:'dpsalon'};const L=Object.entries(B);
  const N=(S.dp&&S.dp.notifs||[]).filter(n=>dpRol()==='admin'||n.to.includes(dpRol())).slice(0,8);
  const w=modal('Avisos',(L.length?`<ul style="list-style:none;padding:0;margin:0">${L.map(([k,x])=>`<li style="display:flex;gap:.5rem;align-items:center;justify-content:space-between;padding:.4rem 0;border-bottom:1px solid var(--line)"><span>${uxBadgeHTML(x)} ${esc(x.t)}</span>${GO[k]&&uxVis(GO[k])?`<button class="btn sm" data-ux-go="${GO[k]}">Ver</button>`:''}</li>`).join('')}</ul>`:'<p class="mut">No hay avisos nuevos.</p>')
   +(N.length?`<h4 style="margin:.8rem 0 .3rem">Últimos movimientos del salón</h4><ul class="sm" style="padding-left:1.1rem;margin:0">${N.map(n=>`<li>${hm(n.t)} · ${esc(n.txt)}</li>`).join('')}</ul>`:''),{okText:'Cerrar'});
  w.addEventListener('click',e=>{const b=e.target.closest('[data-ux-go]');if(!b)return;w.remove();go(b.dataset.uxGo);});};
 const _ut=uxToday;uxToday=function(){const T=_ut.apply(this,arguments);try{const D=S.dp;if(D){const d=D.orders.filter(o=>dpIsDel(o)&&DP_ACTIVE.includes(o.status)).length;const a=D.orders.filter(o=>DP_ACTIVE.includes(o.status)).length;T.orders=T.orders-T.pya+a;T.pya=d;
  T.low=S.products.filter(p=>p.active&&!p.archived&&p.dp&&p.dp.ins&&stockOf(p)<=(p.min||0)).length;}}catch(e){}return T;};
 const _hs=homeScreen;homeScreen=function(){try{const r=dpRol();if(r==='mozo'&&scrOk('dpmozo'))return 'dpmozo';if(r==='cocina'&&scrOk('dpcocina'))return 'dpcocina';}catch(e){}return _hs.apply(this,arguments);};
 if(typeof A.login==='function'){const _lg=A.login;A.login=function(){const r=_lg.apply(this,arguments);try{if(user){const k=dpRol()==='mozo'?'dpmozo':dpRol()==='cocina'?'dpcocina':'';if(k&&scrOk(k))location.hash='#panel/'+k;}}catch(e){}return r;};}
 const _inR=SCREENS.inicio&&SCREENS.inicio.render;if(_inR)SCREENS.inicio.render=function(){const h=_inR.apply(this,arguments);let card='';try{const D=G();const occ=D.tables.filter(t=>t.session).length;const late=D.orders.filter(o=>o.status==='preparando'&&o.etaAt<now()).length;const b=dpP('dp-bollo');
  card=`<div class="card dp-hoy"><div class="row" style="flex-wrap:wrap;gap:.5rem"><h2 class="sp" style="margin:0">Salón y cocina ahora</h2><button class="btn sm" data-act="nav" data-id="dpsalon">Ver el salón</button><button class="btn sm gold" data-act="dpAuto">Ver el circuito en vivo</button></div>
   <div class="grid g4" style="margin-top:.6rem">${dpKpi('Mesas ocupadas',occ+' / '+D.tables.length,'','', 'dpsalon')}${dpKpi('Comandas en curso',D.orders.filter(o=>DP_ACTIVE.includes(o.status)).length,late?late+' demorada(s)':'todo a tiempo',late?'warn':'','dpcomandas')}${dpKpi('Delivery en curso',D.orders.filter(o=>dpIsDel(o)&&DP_ACTIVE.includes(o.status)).length,'propio y PedidosYa','','dpdelivery')}${dpKpi('Bollos listos',b?Math.floor(stockOf(b)):0,'masa madre','', 'dpferm')}</div>${dpFlowStrip()}</div>`;}catch(e){}
  const i=h.indexOf('</h1>');if(i<0)return card+h;const j=h.indexOf('</div>',i);return j<0?card+h:h.slice(0,j+6)+card+h.slice(j+6);};
 /* vender: muestra de qué mesa es la cuenta que se está cobrando */
 const _vR=SCREENS.vender&&SCREENS.vender.render;if(_vR)SCREENS.vender.render=function(){const h=_vR.apply(this,arguments);if(!pos.dpSrc)return h;return `<div class="okbox" style="margin-bottom:.6rem">Cobrando <b>${esc(pos.dpSrc.label)}</b>: al confirmar el cobro la mesa se cierra sola. <button class="btn sm" data-act="dpSrcX">Soltar la mesa</button></div>`+h;};
 A.dpSrcX=()=>{pos.dpSrc=null;rerender();toast('La venta sigue en Vender, sin cerrar la mesa.');};
}
if(typeof window!=='undefined')window.__dpReady=1;
