/* ===== p11d · CONFIGURACIÓN DINÁMICA (V27.7) =====
   La pantalla de Configuración del núcleo era una sola columna de ~6.500 px con 12 tarjetas. Esta capa NO cambia ni duplica
   ningún ajuste: toma las tarjetas que dibuja el núcleo (con sus campos y botones de siempre) y las ordena en:
   · un buscador («¿Qué querés cambiar?») que filtra por título, etiquetas y textos de ayuda, tolerando tildes;
   · un índice por secciones (Negocio · Caja y cobros · Ventas · Asistente e IA · Datos y sistema) con cantidad de ajustes;
   · tarjetas plegables con un resumen de una línea (la primera de cada sección abierta);
   · aviso de «cambios sin guardar» por tarjeta y en el índice, y atajos a los otros ajustes del sistema que viven en su pantalla.
   Todo es genérico (no conoce rubros): se puede pasar tal cual al núcleo para que lo hereden todas las demos. */
const CFG_SECS=[
 {k:'negocio',t:'Negocio',d:'Datos del comercio, tipo de negocio y categorías',ic:'home',m:/tipo de negocio|comercio|categor|rubro/i},
 {k:'caja',t:'Caja y cobros',d:'Cajas, cuentas de cobro, recargos por medio, fiado y cobros digitales',ic:'cash',m:/caja|sucursal|cuentas de cobro|recargo|medio de pago|fiado|cuenta corriente|cobros digitales|cobro/i},
 {k:'ventas',t:'Ventas',d:'Mayorista y minorista, listas y condiciones de venta',ic:'cart',m:/mayorista|minorista|venta/i},
 {k:'ia',t:'Asistente e IA',d:'Asistente por texto y voz, lectura de facturas',ic:'voz',m:/asistente|\bia\b|inteligen/i},
 {k:'datos',t:'Datos y sistema',d:'Datos de la demo, respaldo y restablecer',ic:'gear',m:/datos|respaldo|demo|sistema/i}];
const CFG_LINKS=[['usuarios','Usuarios y permisos','Quién entra y qué puede hacer'],['devices','Periféricos y ticket','Impresora, balanza, lector y ticket'],['menuadmin','Menú público','Carta, textos, promos y legales'],
 ['nube','Nube y sincronización','Respaldo y varios equipos'],['integr','Integraciones','PedidosYa, Mercado Pago, ARCA'],['fidplus','Club','Niveles, cumpleaños y beneficios'],['rrhh','Recursos Humanos','Plan, fichaje y aprobaciones'],['audit','Auditoría','Historial encadenado de cambios']];
let CFGU={sec:'negocio',q:'',open:{},dirty:{}};
const cfgNorm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
function cfgTitle(c){const h=c.querySelector('h2,h3,h4');return h?h.textContent.trim():'Ajustes';}
function cfgSecOf(t){const x=CFG_SECS.find(s=>s.m.test(t));return x?x.k:'datos';}
function cfgSummary(c){const ins=[...c.querySelectorAll('input,select,textarea')].filter(i=>i.type!=='hidden');const chk=ins.filter(i=>i.type==='checkbox');const on=chk.filter(i=>i.checked).length;
 const p=c.querySelector('p.sm,p.mut,.sm.mut');const help=p?p.textContent.trim().replace(/\s+/g,' '):'';const bits=[];if(ins.length)bits.push(ins.length+' campo'+(ins.length>1?'s':''));if(chk.length)bits.push(on+' de '+chk.length+' opciones activas');
 return (help?help.slice(0,110)+(help.length>110?'…':''):'')+(bits.length?(help?' · ':'')+bits.join(' · '):'');}
function cfgEnhance(){const view=$('#view');if(!view||view.querySelector('.cfg-wrap'))return;CFGU.dirty={}; /* cada vez que el núcleo redibuja, lo no guardado ya se descartó */
 const cards=[...view.querySelectorAll('.card')].filter(c=>!c.parentElement.closest('#view .card'));if(cards.length<3)return;
 const items=cards.map((c,i)=>{const t=cfgTitle(c);const id='cfg'+i+'-'+cfgNorm(t).replace(/[^a-z0-9]+/g,'-').slice(0,30);return{c,t,id,sec:cfgSecOf(t)};});
 /* tarjetas → acordeones (los campos y botones del núcleo quedan intactos adentro) */
 items.forEach(it=>{const c=it.c;c.classList.add('cfg-card');c.dataset.cfgSec=it.sec;c.id=it.id;const h=c.querySelector('h2,h3,h4');const body=document.createElement('div');body.className='cfg-body';
  [...c.childNodes].forEach(n=>{if(n!==h)body.appendChild(n);});const sum=cfgSummary(body);if(h)h.remove();
  const head=document.createElement('button');head.type='button';head.className='cfg-head';head.setAttribute('aria-expanded','false');head.setAttribute('aria-controls',it.id+'-b');body.id=it.id+'-b';
  head.innerHTML=`<span class="cfg-ht"><b>${esc(it.t)}</b><small>${esc(sum)}</small></span><span class="cfg-dirty" hidden>Sin guardar</span><span class="cfg-chev" aria-hidden="true">›</span>`;
  c.prepend(head);c.appendChild(body);head.addEventListener('click',()=>{CFGU.open[it.t]=!c.classList.contains('open');cfgPaint();});
  c.addEventListener('input',()=>{CFGU.dirty[it.t]=1;cfgPaint();});c.addEventListener('change',()=>{CFGU.dirty[it.t]=1;cfgPaint();});
  /* al tocar un botón de la tarjeta (Guardar, Agregar…) se limpia la marca: el núcleo vuelve a dibujar la pantalla */
  body.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(b&&/save|guardar/i.test((b.dataset.act||'')+' '+b.textContent))delete CFGU.dirty[it.t];});});
 /* contenedor nuevo: índice + tarjetas; el resto del encabezado del núcleo (título, versión) queda arriba */
 const wrap=document.createElement('div');wrap.className='cfg-wrap';
 const secs=CFG_SECS.filter(s=>items.some(i=>i.sec===s.k));if(!secs.some(s=>s.k===CFGU.sec))CFGU.sec=secs[0].k;
 const links=CFG_LINKS.filter(([k])=>SCREENS[k]&&scrOk(k));
 wrap.innerHTML=`<div class="cfg-top"><div class="cfg-search"><span aria-hidden="true">🔍</span><input id="cfg-q" type="search" placeholder="¿Qué querés cambiar? Ej.: recargo, caja, fiado, nombre…" aria-label="Buscar un ajuste" autocomplete="off" value="${esc(CFGU.q)}"><kbd>/</kbd></div></div>
 <div class="cfg-grid"><nav class="cfg-nav" aria-label="Secciones de configuración">${secs.map(s=>`<button type="button" class="cfg-sec" data-cfgsec="${s.k}" aria-current="false"><span class="cfg-sic">${ico(s.ic)}</span><span><b>${esc(s.t)}</b><small>${esc(s.d)}</small></span><span class="cfg-n" data-cfgn="${s.k}">${items.filter(i=>i.sec===s.k).length}</span></button>`).join('')}
  ${links.length?`<div class="cfg-more"><span class="sm mut">Otros ajustes del sistema</span>${links.map(([k,t,d])=>`<button type="button" class="cfg-link" data-act="nav" data-id="${k}"><b>${esc(t)}</b><small>${esc(d)}</small></button>`).join('')}</div>`:''}</nav>
 <section class="cfg-main" aria-live="polite"><div class="cfg-mhead"><h2 id="cfg-st"></h2><p class="sm mut" id="cfg-sd"></p><div class="row" style="gap:.4rem"><button type="button" class="btn sm" data-cfgall="1">Abrir todo</button><button type="button" class="btn sm" data-cfgall="0">Cerrar todo</button></div></div><div class="cfg-list"></div><p class="cfg-empty mut" hidden>No hay ajustes con ese texto. Probá con otra palabra o mirá «Otros ajustes del sistema».</p></section></div>`;
 let anchor=cards[0];while(anchor.parentElement&&anchor.parentElement!==view)anchor=anchor.parentElement;view.insertBefore(wrap,anchor);
 const list=wrap.querySelector('.cfg-list');items.forEach(it=>list.appendChild(it.c));
 [...view.children].forEach(el=>{if(el!==wrap&&el.tagName==='DIV'&&!el.querySelector('input,button,select,a,img,table')&&!el.textContent.trim())el.remove();});
 /* la primera tarjeta con campos de cada sección se abre la primera vez */
 secs.forEach(s=>{const f=items.find(i=>i.sec===s.k&&i.c.querySelector('.cfg-body input,.cfg-body select,.cfg-body textarea'))||items.find(i=>i.sec===s.k);if(f&&CFGU.open[f.t]===undefined)CFGU.open[f.t]=true;});
 wrap.addEventListener('click',e=>{const b=e.target.closest('[data-cfgsec]');if(b){CFGU.sec=b.dataset.cfgsec;CFGU.q='';$('#cfg-q').value='';cfgPaint();try{sessionStorage.setItem('svb.cfgsec',CFGU.sec);}catch(x){}wrap.querySelector('.cfg-main').scrollIntoView({block:'nearest'});return;}
  const a=e.target.closest('[data-cfgall]');if(a){const v=a.dataset.cfgall==='1';items.forEach(i=>{if(cfgVisible(i))CFGU.open[i.t]=v;});cfgPaint();}});
 const q=$('#cfg-q');q.addEventListener('input',()=>{CFGU.q=q.value;cfgPaint();});q.addEventListener('keydown',e=>{if(e.key==='Escape'){q.value='';CFGU.q='';cfgPaint();}});
 cfgItems=items;cfgPaint();}
let cfgItems=[];
function cfgVisible(i){const q=cfgNorm(CFGU.q).trim();if(!q)return i.sec===CFGU.sec;return q.split(/\s+/).every(w=>cfgNorm(i.t+' '+i.c.textContent+' '+[...i.c.querySelectorAll('input,textarea')].map(x=>x.placeholder||'').join(' ')).includes(w));}
function cfgPaint(){const q=cfgNorm(CFGU.q).trim();let shown=0;
 cfgItems.forEach(i=>{const v=cfgVisible(i);i.c.hidden=!v;if(v)shown++;const open=q?v:!!CFGU.open[i.t];i.c.classList.toggle('open',open);const h=i.c.querySelector('.cfg-head');h.setAttribute('aria-expanded',String(open));
  const d=i.c.querySelector('.cfg-dirty');d.hidden=!CFGU.dirty[i.t];i.c.classList.toggle('dirty',!!CFGU.dirty[i.t]);
  i.c.querySelectorAll('.cfg-hit').forEach(x=>x.classList.remove('cfg-hit'));
  if(q&&v)i.c.querySelectorAll('label').forEach(l=>{if(q.split(/\s+/).every(w=>cfgNorm(l.textContent).includes(w)))l.classList.add('cfg-hit');});
  const sec=q?CFG_SECS.find(s=>s.k===i.sec):null;h.querySelector('small').dataset.sec=sec?sec.t:'';});
 $$('.cfg-sec').forEach(b=>{const on=!q&&b.dataset.cfgsec===CFGU.sec;b.classList.toggle('on',on);b.setAttribute('aria-current',on?'page':'false');
  const k=b.dataset.cfgsec;const dn=cfgItems.filter(i=>i.sec===k&&CFGU.dirty[i.t]).length;const n=b.querySelector('.cfg-n');n.textContent=dn?dn+' sin guardar':cfgItems.filter(i=>i.sec===k).length;n.classList.toggle('warn',!!dn);});
 const s=CFG_SECS.find(x=>x.k===CFGU.sec);const st=$('#cfg-st'),sd=$('#cfg-sd');if(st)st.textContent=q?'Resultados para «'+CFGU.q.trim()+'»':s.t;if(sd)sd.textContent=q?shown+' ajuste'+(shown===1?'':'s')+' encontrado'+(shown===1?'':'s'):s.d;
 const em=$('.cfg-empty');if(em)em.hidden=!!shown;}
if(typeof SCREENS!=='undefined'&&SCREENS.config){try{const v=sessionStorage.getItem('svb.cfgsec');if(v)CFGU.sec=v;}catch(e){}
 const _ca=SCREENS.config.after;SCREENS.config.after=function(){if(_ca)_ca.apply(this,arguments);try{cfgEnhance();}catch(e){console.warn('cfg-ux',e);}};
 document.addEventListener('keydown',e=>{if(e.key==='/'&&!e.ctrlKey&&!e.metaKey&&typeof curScreen!=='undefined'&&curScreen==='config'&&!/INPUT|TEXTAREA|SELECT/.test((document.activeElement||{}).tagName||'')){const q=$('#cfg-q');if(q){e.preventDefault();q.focus();}}});
 window.addEventListener('beforeunload',e=>{if(typeof curScreen!=='undefined'&&curScreen==='config'&&Object.keys(CFGU.dirty).length){e.preventDefault();e.returnValue='';}});}
