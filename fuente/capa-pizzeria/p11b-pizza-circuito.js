/* ===== p11b · CIRCUITO: estado S.dp, comanda, cobro, bollos, sincronización y API de la carta · capa Di Parma (perfil pizza). Ver p11a-pizza-datos.js para el panorama. ===== */
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
 DP_BC.onmessage=e=>{const m=e.data||{};if(!dpValid(m.dp)||!S||(S.dp&&(S.dp.rev||0)>=m.dp.rev))return;S.dp=m.dp;save();dpLive(true);};}}catch(e){}
/* un estado recibido de otra pestaña se acepta sólo si tiene la forma esperada (nunca se mezcla basura en la base) */
function dpValid(d){if(!d||typeof d!=='object'||!Number.isFinite(d.rev))return false;if(!Array.isArray(d.tables)||!Array.isArray(d.orders)||!d.carts||typeof d.carts!=='object'||!d.ferm||!Array.isArray(d.ferm.lotes)||!d.py||!d.cadetes)return false;
 const st=Object.keys(DP_ST);return d.tables.length<=200&&d.orders.length<=5000&&d.tables.every(t=>t&&typeof t.id==='string'&&/^[A-Z]\d{1,2}$/.test(t.id))&&d.orders.every(o=>o&&typeof o.id==='string'&&st.includes(o.status)&&Array.isArray(o.items)&&o.items.every(l=>l&&typeof l.pid==='string'&&Number.isFinite(l.qty)));}
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

/* ---------- API para la carta pública (mismo equipo; los datos son de la demo) ---------- */
function dpPubProd(p){const i=p.dp&&p.dp.sizes?dpP(p.id+'_i'):null;const agot=isKit(p)?kitStock(p)<=0&&!canOver(p):stockOf(p)<=0&&!canOver(p);
 return{id:p.id,cat:p.rubro,n:p.name,d:p.desc||'',price:p.price/100,ind:i?{id:i.id,price:i.price/100}:null,star:!!(p.dp&&p.dp.star),alc:!!(p.dp&&p.dp.alc),art:dpArt(p),agot};}
function dpPubOrder(o){return{id:o.id,n:o.n,status:o.status,stl:DP_ST[o.status].l,step:DP_ST[o.status].step,eta:o.eta,etaAt:o.etaAt,total:dpOrderTot(o)/100,items:dpItems(o),channel:o.channel,tableId:o.tableId,log:o.log.map(l=>({s:l.s,t:l.t}))};}
const DP_RL={};
window.DP_API={
 ctx:mesa=>{const D=G();const t=mesa?dpT(String(mesa).toUpperCase()):null;return{biz:{name:'Di Parma Pizzería',sub:'Pizzería de masa madre',dir:S.tenant.address,hours:'Mar a dom · 19:30 a 00:30'},
  table:t?{id:t.id,label:t.label,sector:t.sector,mozo:dpFirst(dpEmpN(t.mozo)),open:!!t.session,bill:!!(t.session&&t.session.bill),total:dpTableTot(t)/100}:null,
  cats:DP_CATS.filter(c=>['dp-piz','dp-ent','dp-czn','dp-pos','dp-beb'].includes(c[0])).map(c=>({id:c[0],n:c[1],s:c[3]})),
  prods:S.products.filter(p=>p.active&&p.menu&&p.dp&&!p.dp.ind).map(dpPubProd),extras:S.products.filter(p=>p.active&&p.dp&&p.dp.extra).map(p=>({id:p.id,n:p.name,price:p.price/100})),
  cart:t?(D.carts[t.id]||[]).map(l=>({pid:l.pid,qty:l.qty,ex:l.ex,note:l.note})):null,orders:t&&t.session?dpSessOrders(t).map(dpPubOrder):[],
  promo:'10 % off en tu primera visita como socio con BIENVENIDA10',club:{goal:+S.loyalty.goal||8,reward:String(S.loyalty.reward||'')}};},
 orders:ids=>{const D=G();return (ids||[]).map(id=>D.orders.find(o=>o.id===id)).filter(Boolean).map(dpPubOrder);},
 cart:(mesa,lines)=>{const t=dpT(String(mesa||'').toUpperCase());if(!t)return false;const L=dpCleanLines(lines);if(L.length)G().carts[t.id]=L;else delete G().carts[t.id];dpCommit(false);return true;},
 send:o=>{o=o||{};const t=o.mesa?dpT(String(o.mesa).toUpperCase()):null;const L=dpCleanLines(o.lines);if(!L.length)return{ok:false,msg:'El pedido está vacío.'};
  /* límites anti-abuso de la carta pública (en la nube los repite el servidor por IP, mesa y comercio) */
  const key=t?t.id:'web',last=DP_RL[key]||0;if(now()-last<15000)return{ok:false,msg:'Esperá unos segundos antes de enviar otro pedido.'};
  if(t&&G().orders.filter(x=>x.tableId===t.id&&x.status==='pend_mozo').length>=3)return{ok:false,msg:'Tenés pedidos esperando al mozo: '+dpFirst(dpEmpN(t.mozo))+' ya viene.'};
  if(!t&&G().orders.filter(x=>x.channel!=='qr'&&x.status==='pend_caja'&&now()-x.createdAt<10*DPM).length>=12)return{ok:false,msg:'Estamos con muchos pedidos: probá en unos minutos o llamanos.'};
  DP_RL[key]=now();
  if(!t){const nm=String(o.name||'').trim().slice(0,40),tel=String(o.tel||'').replace(/[^\d+ -]/g,'').slice(0,20),addr=String(o.addr||'').trim().slice(0,80);if(nm.length<2)return{ok:false,msg:'Falta tu nombre.'};if(tel.replace(/\D/g,'').length<8)return{ok:false,msg:'Revisá tu celular.'};if(o.modo==='delivery'&&addr.length<4)return{ok:false,msg:'Falta la dirección de entrega.'};
   const r=DP_FLOW.create({channel:o.modo==='delivery'?'delivery':'web',customer:{name:nm,tel,addr:o.modo==='delivery'?addr:'',pago:o.modo==='delivery'?'Paga al recibir':'Paga al retirar'},items:L,status:'pend_caja',by:'Carta web'});dpCommit(false);return{ok:true,id:r.id,n:r.n};}
  const r=DP_FLOW.create({channel:'qr',tableId:t.id,items:L,status:'pend_mozo',by:'QR '+t.label.toLowerCase()});delete G().carts[t.id];dpCommit(false);return{ok:true,id:r.id,n:r.n};},
 call:mesa=>{const t=dpT(String(mesa||'').toUpperCase());if(!t)return false;if(!t.session)dpOpenSess(t,2,true);t.session.call=true;dpNotify(t.label+' llama al mozo.',['mozo','admin'],{tableId:t.id});audit('MESA_LLAMA_MOZO',t.label);dpCommit(false);return true;},
 bill:mesa=>{const t=dpT(String(mesa||'').toUpperCase());if(!t||!t.session)return false;t.session.bill=true;dpNotify(t.label+' pidió la cuenta: '+money(dpTableTot(t))+'.',['mozo','caja','admin'],{tableId:t.id});audit('MESA_PIDE_CUENTA',t.label);dpCommit(false);return true;},
 rev:()=>(S.dp&&S.dp.rev)||0};
function dpCleanLines(lines){return (Array.isArray(lines)?lines:[]).slice(0,30).map(l=>{const p=dpP(l&&l.pid);if(!p||!p.active||!p.dp||p.dp.extra||p.dp.ins||p.dp.bollo)return null;const q=Math.max(1,Math.min(20,parseInt(l.qty,10)||1));
 const ex=(Array.isArray(l.ex)?l.ex:[]).filter(e=>{const x=dpP(e);return x&&x.dp&&x.dp.extra&&x.active;}).slice(0,8);return{id:uid(),pid:p.id,qty:q,ex,note:String(l.note||'').replace(/[<>]/g,'').slice(0,60)};}).filter(Boolean);}
