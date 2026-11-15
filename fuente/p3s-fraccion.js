/* ===== V26.71 · VENTA FRACCIONADA CON PRECIO PROPIO (media pizza, media docena, docena…) =====
   Un producto puede venderse entero (su precio de siempre) y además en fracciones con precio propio:
     · Pizzería:   Mozzarella entera $ 18.000 · Media $ 9.500   (la media NO es la mitad exacta del precio)
     · Empanadas:  Empanada $ 1.500 la unidad · Media docena (6) $ 8.000 · Docena (12) $ 15.000
   · p.fr = [{l:'Media', f:0.5, price}]  →  l = nombre que se ve, f = cuánto del producto es (0,5 = media; 6 = seis unidades), price = precio en centavos.
   · En Vender, al tocar el producto se elige «Entero» o la fracción. La línea queda con qty = cantidad de fracciones, price = precio de la fracción
     y frac = f: el total es qty × price (lo que cobra el comercio) y el stock / la ficha técnica se descuenta qty × f.
   · Los combos (fichas técnicas) también: media pizza descuenta la mitad de cada insumo. Anular, nota de crédito y devoluciones devuelven lo mismo.
   · Nada cambia en el servidor: la venta guarda en cada línea frac y fl (nombre de la fracción) junto con qty y price. */
const FR_PRESETS=[['Media',0.5],['Media docena',6],['Docena',12]];
const frList=p=>(p&&Array.isArray(p.fr)?p.fr.filter(x=>x&&x.l&&x.f>0&&x.price>0):[]);
const frLbl=f=>f===0.5?'½':f===0.25?'¼':numAR(f,3);
/* ---------- editor del producto ---------- */
function frRowHTML(x){x=x||{};return`<div class="row fr-row" style="flex-wrap:wrap;gap:.4rem;margin:.3rem 0;align-items:flex-end">
 <div style="flex:1 1 150px"><label class="sm">Se vende como</label><input class="fr-l" maxlength="24" placeholder="Media" value="${esc(x.l||'')}"></div>
 <div style="flex:0 1 120px"><label class="sm">Equivale a</label><input class="fr-f" inputmode="decimal" placeholder="0,5" value="${x.f?esc(String(x.f).replace('.',',')):''}" aria-describedby="fr-help"></div>
 <div style="flex:0 1 140px"><label class="sm">Precio ($)</label><input class="fr-p" inputmode="decimal" placeholder="0" value="${x.price?esc(pesosStr(x.price)):''}"></div>
 <button type="button" class="btn sm red fr-rm" aria-label="Quitar fracción" style="min-height:44px">✕</button></div>`;}
function fracBlock(p){const L=frList(p);const on=L.length>0;
 return`<fieldset class="card" id="fr-box" style="margin:.6rem 0;padding:.7rem"><legend class="sm"><b>Venta fraccionada</b></legend>
 <label class="chk"><input type="checkbox" id="fr-on" ${on?'checked':''}> También se vende por fracción con precio propio (media pizza, media docena, docena…)</label>
 <div id="fr-body" ${on?'':'hidden'}><p class="sm mut" id="fr-help">«Equivale a» es cuánto del producto se descuenta del stock o de la ficha: <b>0,5</b> = media; <b>6</b> = seis unidades. El precio de la fracción lo ponés vos (no tiene que ser la mitad exacta).</p>
 <div id="fr-rows">${L.map(frRowHTML).join('')}</div>
 <div class="row" style="flex-wrap:wrap;gap:.4rem">${FR_PRESETS.map(([l,f])=>`<button type="button" class="btn sm" data-frp="${f}" data-frl="${esc(l)}">+ ${esc(l)}${f!==0.5?' ('+f+')':' (½)'}</button>`).join('')}<button type="button" class="btn sm" data-frp="" data-frl="">+ Otra</button></div>
 <p class="sm" id="fr-sum" role="status"></p></div></fieldset>`;}
function fracBind(w){const box=w.querySelector('#fr-box');if(!box)return;
 const sum=()=>{const el=w.querySelector('#fr-sum');if(!el)return;const r=fracRead(w,true);const pr=cents(val('pm-f'));
  if(r.err){el.innerHTML='<span class="errtxt">'+esc(r.err)+'</span>';return;}
  el.innerHTML=(r.fr||[]).map(x=>{const prop=pr>0?Math.round(pr*x.f):0;return '<b>'+esc(x.l)+'</b> '+money(x.price)+(prop?' <span class="mut">(proporcional al entero: '+money(prop)+')</span>':'');}).join(' · ');};
 box.addEventListener('change',e=>{if(e.target.id==='fr-on'){const on=e.target.checked;w.querySelector('#fr-body').hidden=!on;if(on&&!w.querySelectorAll('.fr-row').length)w.querySelector('#fr-rows').insertAdjacentHTML('beforeend',frRowHTML({l:'Media',f:0.5}));}sum();});
 box.addEventListener('input',sum);w.addEventListener('input',e=>{if(e.target.id==='pm-f')sum();});
 box.addEventListener('click',e=>{const b=e.target.closest('[data-frp]');if(b){const f=b.dataset.frp?+b.dataset.frp:0;w.querySelector('#fr-rows').insertAdjacentHTML('beforeend',frRowHTML({l:b.dataset.frl,f}));const r=[...w.querySelectorAll('.fr-row')].pop();const i=r&&r.querySelector(b.dataset.frl?'.fr-p':'.fr-l');if(i)i.focus();sum();}
  const rm=e.target.closest('.fr-rm');if(rm){rm.closest('.fr-row').remove();sum();}});sum();}
/* lee y valida: {fr:[...]} · {fr:[]} si está apagado · {err} */
function fracRead(w,soft){const on=w.querySelector('#fr-on');if(!on||!on.checked)return{fr:[]};const out=[],seen=new Set();
 for(const r of w.querySelectorAll('.fr-row')){const l=r.querySelector('.fr-l').value.trim().replace(/[<>]/g,'');const fs=r.querySelector('.fr-f').value.trim(),ps=r.querySelector('.fr-p').value.trim();
  if(!l&&!fs&&!ps)continue;const f=parseNum(fs),price=cents(ps);
  if(!l)return{err:'Poné el nombre de cada fracción (por ejemplo «Media»).'};if(seen.has(norm(l)))return{err:'«'+l+'» está repetida.'};seen.add(norm(l));
  if(!(f>0)||f>1000)return{err:'«'+l+'»: «Equivale a» tiene que ser mayor a cero (0,5 = media; 6 = media docena).'};if(f===1)return{err:'«'+l+'» equivale a 1: es el producto entero, no hace falta cargarla.'};
  if(!(price>0)){if(soft)continue;return{err:'«'+l+'»: falta el precio.'};}out.push({l,f:Math.round(f*1000)/1000,price});}
 if(!out.length&&!soft)return{err:'Cargá al menos una fracción o destildá «Venta fraccionada».'};return{fr:out};}
/* ---------- Vender: elegir entero o fracción ---------- */
function frPick(p){const L=frList(p);if(!L.length)return false;
 const opt=(k,l,pr,sub)=>`<button type="button" class="btn ${k<0?'gold':''}" data-frk="${k}" style="min-height:64px;flex:1 1 140px;flex-direction:column;display:flex;align-items:center;justify-content:center;gap:.15rem"><b style="font-size:1.05rem">${esc(l)}</b><span>${money(pr)}</span>${sub?`<span class="sm mut">${esc(sub)}</span>`:''}</button>`;
 const w=modal(pfull(p),`<p class="sm mut" style="margin-top:0">¿Cómo lo vendés? (teclas 1 a ${L.length+1})</p><div class="row" style="flex-wrap:wrap;gap:.5rem">${opt(-1,'Entera',p.price,'')}${L.map((x,i)=>opt(i,x.l,x.price,x.f<1?frLbl(x.f)+' del producto':x.f+' u.')).join('')}</div>`,{ok:false,cancelText:'Cancelar'});
 const go=k=>{w.remove();frAdd(p,k);};
 w.addEventListener('click',e=>{const b=e.target.closest('[data-frk]');if(b)go(+b.dataset.frk);});
 w.addEventListener('keydown',e=>{const n=parseInt(e.key,10);if(n>=1&&n<=L.length+1){e.preventDefault();go(n-2);}else if(e.key==='Escape')w.remove();});
 setTimeout(()=>{const b=w.querySelector('[data-frk]');b&&b.focus();},40);return true;}
function frAdd(p,k){if(k<0){A.padd({dataset:{id:p.id,fr:'1'}});return;}const x=frList(p)[k];if(!x)return;
 const need=qtyIn(p.id)+x.f;if(!isKit(p)&&!canOver(p)&&need>stockOf(p)+1e-9){toast('Sin stock suficiente de '+p.name+' (este producto exige stock)',1);return;}
 const L=pos.lines.find(l=>l.pid===p.id&&l.frac===x.f&&l.price===x.price&&!l.man);
 if(L){L.qty+=1;pos.sel=pos.lines.indexOf(L);}else{const cu=isKit(p)?kitCost(p):(p.cost||0);
  pos.lines.push({pid:p.id,name:p.name+' · '+x.l,rubro:p.rubro,qty:1,price:x.price,cost:Math.round(cu*x.f),unit:'u',list:x.price,frac:x.f,fl:x.l});pos.sel=pos.lines.length-1;}
 posCart();posFocusSearch();}
/* tocar un producto con fracciones abre la elección; el entero sigue el camino de siempre */
{const _padd=A.padd;A.padd=el=>{const p=prod(el.dataset&&el.dataset.id);if(p&&!(el.dataset&&el.dataset.fr)&&frList(p).length&&frPick(p))return;return _padd(el);};}
