// Shopify checkout on thehok.com. Set DISCOUNT_CODE to the 50% bundle code once it exists in Shopify admin.
const SHOP='https://thehok.com',DISCOUNT_CODE='';
let products=[],cart=[];try{cart=JSON.parse(localStorage.getItem('doctor-bundle')||'[]')}catch{}const $=s=>document.querySelector(s),money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n/100);const modal=$('#builder');
fetch('products.json').then(r=>r.json()).then(p=>{products=p;cart=cart.filter(x=>p.some(y=>y.id===x.id&&y.variants[x.variant])&&Number.isInteger(x.qty)&&x.qty>0);renderGrid();renderCart()}).catch(()=>{$('#grid').innerHTML='<p>Unable to load the scent directory. Please refresh.</p>'});
function renderGrid(){
 const q=$('#search').value.toLowerCase();
 const list=products.filter(p=>(p.name+' '+p.inspiration).toLowerCase().includes(q));
 $('#results').textContent=`${list.length} scent inspirations · HOK fragrances`;
 $('#grid').innerHTML=list.map(p=>`<article class="card"><div class="photo">${p.comparisonStyle.map((frame,i)=>`<span class="bottle-crop"><img src="${p.comparison}" alt="${i===0?p.inspiration:'HOK '+p.name}" width="1000" height="1000" style="width:${frame.width}%;left:${frame.left}%;top:${frame.top}%" loading="${p.id<3?'eager':'lazy'}" decoding="async"></span>`).join('')}</div><div class="card-content"><span class="eyebrow">I WANNA SMELL LIKE</span><h2>${p.inspiration}</h2><p class="match">Meet your match: ${p.name}</p><div class="card-bottom"><strong>From ${money(p.variants[0].price)}</strong><span>50% off with 2+ bottles</span></div><button class="primary" data-pick="${p.id}">Build my bundle &nbsp; →</button></div></article>`).join('')||'<p class="empty">No matches yet. Try another scent or designer.</p>';
}
function add(id){const item=cart.find(x=>x.id===id&&x.variant===0);if(item)item.qty++;else cart.push({id,variant:0,qty:1});renderCart()}
function renderSuggestions(){
 const q=$('#bundle-search').value.toLowerCase();
 const list=products.filter(p=>(p.name+' '+p.inspiration).toLowerCase().includes(q));
 $('#suggestions').innerHTML=list.map(p=>`<article class="suggestion"><img src="${p.image}&width=220" alt="HOK ${p.name}" loading="lazy"><div class="suggestion-copy"><strong>${p.name}</strong><p>${p.inspiration}</p><span>From ${money(p.variants[0].price)}</span></div><button data-add="${p.id}" aria-label="Add ${p.name}">+ Add</button></article>`).join('')||'<p class="empty">No matching scents. Try another name.</p>';
}
function variantParts(v){const parts=v.name.split(' / ');return {concentration:parts[0].trim(),size:parts[1]?.trim()||null}}
function variantControls(p,x,i){
 const current=variantParts(p.variants[x.variant]);const concentrations=[...new Set(p.variants.map(v=>variantParts(v).concentration))];
 const sizes=[...new Set(p.variants.filter(v=>variantParts(v).concentration===current.concentration).map(v=>variantParts(v).size).filter(Boolean))];
 return `<div class="variant-categories"><div class="variant-category"><span class="variant-label">Concentration</span><div class="variant-buttons" role="group" aria-label="Concentration for ${p.name}">${concentrations.map(name=>`<button data-item="${i}" data-concentration="${name}" aria-pressed="${name===current.concentration}">${name}</button>`).join('')}</div></div>${sizes.length?`<div class="variant-category"><span class="variant-label">Bottle size</span><div class="variant-buttons" role="group" aria-label="Bottle size for ${p.name}">${sizes.map(size=>{const v=p.variants.find(v=>{const parts=variantParts(v);return parts.concentration===current.concentration&&parts.size===size});return `<button data-item="${i}" data-size="${size}" aria-pressed="${size===current.size}"><span>${size.replace('ML',' mL')}</span><strong>${money(v.price)}</strong></button>`}).join('')}</div></div>`:''}<p class="selected-variant-price">Selected: ${current.concentration}${current.size?' · '+current.size.replace('ML',' mL'):''} <strong>${money(p.variants[x.variant].price)} / bottle</strong></p></div>`;
}
function renderCart(){
 localStorage.setItem('doctor-bundle',JSON.stringify(cart));
 const count=cart.reduce((s,x)=>s+x.qty,0),subtotal=cart.reduce((s,x)=>s+products.find(p=>p.id===x.id).variants[x.variant].price*x.qty,0),discount=count>=2?Math.round(subtotal/2):0;
 const linePrices=cart.map(x=>{const value=products.find(p=>p.id===x.id).variants[x.variant].price*x.qty;return count>=2?Math.floor(value/2):value});let cents=subtotal-discount-linePrices.reduce((a,b)=>a+b,0);for(let i=0;cents>0;i++,cents--)linePrices[i%linePrices.length]++;$('#mobile-total').textContent=money(subtotal-discount);$('#count').textContent=count;$('#selected-count').textContent=count;
 $('#offer').innerHTML=count>=2?'<strong>50% OFF UNLOCKED</strong><span>Every bottle is now half price. Keep building your bundle.</span>':count===1?'<strong>ADD 1 MORE. UNLOCK 50% OFF.</strong><span>Your discount applies to every bottle in the bundle.</span>':'<strong>PICK 2+. SAVE 50%.</strong><span>Mix your favorites and build your scent wardrobe.</span>';
 $('#items').innerHTML=cart.map((x,i)=>{const p=products.find(p=>p.id===x.id);return `<article class="item"><img src="${p.image}&width=260" alt="HOK ${p.name}"><div class="item-details"><strong>${p.name}</strong><p>Inspired by ${p.inspiration}</p>${variantControls(p,x,i)}<div class="item-bottom"><div class="quantity"><button data-minus="${i}" aria-label="Remove one ${p.name}">−</button><span>${x.qty}</span><button data-plus="${i}" aria-label="Add one ${p.name}">+</button></div><strong class="line-price">${count>=2?`<del>${money(p.variants[x.variant].price*x.qty)}</del>`:''}${money(linePrices[i])}</strong><button class="remove" data-remove="${i}" aria-label="Remove ${p.name}">Remove</button></div></div></article>`}).join('')||'<p class="empty">Choose your first scent below.</p>';
 $('#summary').innerHTML=`<div class="sum-row"><span>${count} bottle${count===1?'':'s'} · regular price</span><span>${money(subtotal)}</span></div><div class="sum-row saving"><span>Your savings ${count>=2?'(50%)':''}</span><strong>−${money(discount)}</strong></div><div class="sum-row total"><span>Bundle total</span><strong>${money(subtotal-discount)}</strong></div>${count>=2?`<p class="savings-callout">You keep ${money(discount)} in your pocket.</p>`:'<p class="savings-callout">Add '+(2-count)+' more to unlock half-price bottles.</p>'}<p class="tax-note">Shipping and taxes calculated at checkout.</p>`;
 const btn=$('#checkout'),live=DISCOUNT_CODE||count<2,due=live?subtotal-discount:subtotal;btn.disabled=count===0;btn.textContent=count?`Checkout · ${money(due)} →`:'Add a scent to check out';
 $('#checkout-note').textContent=live?'Secure checkout on HOK (thehok.com). Shipping and taxes calculated at checkout.':'Secure checkout on HOK (thehok.com). The 50% bundle discount is not active at checkout yet, so regular prices apply.';
 renderSuggestions();
}
function checkoutUrl(){
 const qty={};cart.forEach(x=>{const id=products.find(p=>p.id===x.id).variants[x.variant].id;qty[id]=(qty[id]||0)+x.qty});
 const count=cart.reduce((s,x)=>s+x.qty,0),q=new URLSearchParams({utm_source:'theperfumedoctor',utm_medium:'referral'});
 if(DISCOUNT_CODE&&count>=2)q.set('discount',DISCOUNT_CODE);
 return `${SHOP}/cart/${Object.entries(qty).map(([id,n])=>id+':'+n).join(',')}?${q}`;
}
$('#checkout').onclick=()=>{if(cart.length)location.href=checkoutUrl()};
$('#search').addEventListener('input',renderGrid);
$('#bundle-search').addEventListener('input',renderSuggestions);
$('#bag').onclick=()=>modal.showModal();$('#close').onclick=()=>modal.close();$('#continue').onclick=()=>modal.close();
$('#more').onclick=()=>{$('#bundle-search').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});$('#bundle-search').focus({preventScroll:true})};
$('#mobile-add').onclick=$('#more').onclick;
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(d.pick!==undefined){add(+d.pick);modal.showModal()}
 if(d.add!==undefined)add(+d.add);
 if(d.concentration!==undefined||d.size!==undefined){const item=cart[+d.item],p=products.find(p=>p.id===item.id),current=variantParts(p.variants[item.variant]);const concentration=d.concentration||current.concentration,size=d.size||current.size;let next=p.variants.findIndex(v=>{const parts=variantParts(v);return parts.concentration===concentration&&parts.size===size});if(next<0)next=p.variants.findIndex(v=>variantParts(v).concentration===concentration);if(next>=0)item.variant=next;renderCart();const selector=d.concentration!==undefined?`[data-item="${d.item}"][data-concentration="${d.concentration}"]`:`[data-item="${d.item}"][data-size="${d.size}"]`;document.querySelector(selector)?.focus({preventScroll:true})}
 if(d.plus!==undefined){cart[+d.plus].qty++;renderCart()}
 if(d.minus!==undefined){const i=+d.minus;if(--cart[i].qty===0)cart.splice(i,1);renderCart()}
 if(d.remove!==undefined){cart.splice(+d.remove,1);renderCart()}
});
modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)modal.close()}});
