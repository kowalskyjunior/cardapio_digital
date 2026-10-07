(function(){
document.addEventListener("DOMContentLoaded",function(){
 const {Data,Utils}=window.CardapioDigital;
 const root=document.createElement("div");root.id="mobileReferenceApp";document.querySelector(".menu-app")?.append(root);
 const defaults={couponEnabled:true,couponText:"Você tem cupons! Aproveite!",deliveryLabel:"Calcular taxa e tempo de entrega",cashbackEnabled:true,cashbackTitle:"Programa de cashback",cashbackText:"Receba 1% de cashback em cada pedido e use o saldo como desconto nas próximas compras.",cashbackButton:"Crie ou acesse sua conta",moreInfoText:"Mais informações",homeLabel:"Início",promosLabel:"Promoções",ordersLabel:"Pedidos",profileLabel:"Perfil"};
 let state=Data.getState();
 const settings=()=>({...defaults,...(state.settings||{})});
 const safe=s=>Utils.safeImage(s,"assets/icon.svg");
 function openExistingProduct(p){
   const cards=[...document.querySelectorAll(".product-card")];
   const match=cards.find(c=>c.querySelector("h3")?.textContent===p.name);
   if(match) match.click(); else Utils.toast("Abra o item pelo cardápio.","toast");
 }
 function render(){
   state=Data.sync?Data.sync():Data.getState();
   const s=settings(),cats=state.categories.slice().sort((a,b)=>a.sort-b.sort),featured=state.products.filter(p=>p.active&&p.featured).slice(0,5);
   const initial=(s.restaurantName||"C").slice(0,1).toUpperCase(),accent=s.mobileAccentColor||s.primaryColor||"#18b84b";
   root.style.setProperty("--mobile-bg",s.mobileBackgroundColor||"#f2f2f2");root.style.setProperty("--mobile-accent",accent);root.innerHTML="";
   const wrap=document.createElement("div");
   if(s.mobileCouponEnabled!==false){
     const bar=document.createElement("div");bar.className="mobile-ref-coupon";
     const text=document.createElement("strong");text.textContent=s.mobileCouponText||defaults.couponText;
     const close=document.createElement("button");close.type="button";close.textContent="×";close.onclick=()=>bar.remove();bar.append(text,close);wrap.append(bar);
   }
   const hero=document.createElement("section");hero.className="mobile-ref-hero";
   const cover=document.createElement("div");cover.className="mobile-ref-cover";
   cover.style.backgroundImage=s.banner?"url("+JSON.stringify(safe(s.banner))+")":"linear-gradient(135deg,"+accent+",#888)";
   const identity=document.createElement("div");identity.className="mobile-ref-identity";
   if(s.logo){
     const logo=document.createElement("img");logo.className="mobile-ref-logo";logo.src=safe(s.logo);logo.alt="";logo.onerror=()=>{logo.remove();const mark=document.createElement("div");mark.className="mobile-ref-logo mobile-ref-logo-text";mark.textContent=initial;identity.prepend(mark)};identity.append(logo);
   }else{const mark=document.createElement("div");mark.className="mobile-ref-logo mobile-ref-logo-text";mark.textContent=initial;identity.append(mark)}
   const name=document.createElement("h1");name.textContent=s.restaurantName||"Cardápio";
   const loc=document.createElement("p");loc.className="mobile-ref-location";loc.textContent=s.address||"Endereço não informado";
   const more=document.createElement("button");more.type="button";more.className="mobile-ref-more";more.textContent=s.mobileMoreInfoText||defaults.moreInfoText;
   more.onclick=()=>document.querySelector(".visit-section")?.scrollIntoView({behavior:"smooth",block:"start"});
   const status=document.createElement("p");status.className="mobile-ref-status"+(s.isOpen?"":" closed");status.textContent=s.isOpen?"Aberto agora":("Fechado • "+(s.hours||"ver horário"));
   identity.append(name,loc,more,status);hero.append(cover,identity);wrap.append(hero);
   const actions=document.createElement("section");actions.className="mobile-ref-actions";
   const delivery=document.createElement("button");delivery.className="mobile-ref-action";delivery.type="button";delivery.innerHTML='<span class="icon">⌖</span><span></span><span class="arrow">›</span>';delivery.children[1].textContent=s.mobileDeliveryLabel||defaults.deliveryLabel;
   delivery.onclick=()=>{document.getElementById("cartBar")?.click();setTimeout(()=>{const radio=document.querySelector('input[name="orderType"][value="delivery"]');if(radio){radio.checked=true;radio.dispatchEvent(new Event("change",{bubbles:true}))}},80)};
   actions.append(delivery);
   if(s.mobileCashbackEnabled!==false){
     const cash=document.createElement("article");cash.className="mobile-ref-cashback";const head=document.createElement("div");head.className="mobile-ref-cashback-head";head.innerHTML='<span class="icon">↻</span><strong></strong>';head.querySelector("strong").textContent=s.mobileCashbackTitle||defaults.cashbackTitle;
     const p=document.createElement("p");p.textContent=s.mobileCashbackText||defaults.cashbackText;const btn=document.createElement("button");btn.type="button";btn.textContent=s.mobileCashbackButton||defaults.cashbackButton;btn.onclick=()=>Utils.toast("O cashback fica disponível para clientes cadastrados.","toast");cash.append(head,p,btn);actions.append(cash);
   }
   wrap.append(actions);
   const nav=document.createElement("section");nav.className="mobile-ref-nav";
   const sw=document.createElement("label");sw.className="mobile-ref-select";const sel=document.createElement("select");sel.setAttribute("aria-label","Categorias");cats.forEach(c=>{const o=document.createElement("option");o.value=c.id;o.textContent=c.name;sel.append(o)});sel.onchange=()=>document.getElementById("mref-"+sel.value)?.scrollIntoView({behavior:"smooth",block:"start"});const chev=document.createElement("span");chev.className="chev";chev.textContent="⌄";sw.append(sel,chev);
   const searchBtn=document.createElement("button");searchBtn.className="mobile-ref-search-btn";searchBtn.type="button";searchBtn.innerHTML='<span class="mobile-ref-search-icon"></span>';nav.append(sw,searchBtn);wrap.append(nav);
   const search=document.createElement("label");search.className="mobile-ref-search";search.hidden=true;const input=document.createElement("input");input.type="search";input.placeholder="Buscar no cardápio";search.append(input);wrap.append(search);
   searchBtn.onclick=()=>{search.hidden=!search.hidden;if(!search.hidden)input.focus()};
   const promoTitle=document.createElement("h2");promoTitle.className="mobile-ref-promo-title";promoTitle.textContent="PROMOÇÕES DO RESTAURANTE";promoTitle.hidden=!featured.length;wrap.append(promoTitle);
   const promos=document.createElement("section");promos.className="mobile-ref-promos";featured.forEach(p=>promos.append(promoCard(p)));promos.hidden=!featured.length;wrap.append(promos);
   const menu=document.createElement("section");menu.className="mobile-ref-menu";wrap.append(menu);
   function promoCard(p){const b=document.createElement("button");b.type="button";b.className="mobile-ref-promo";b.onclick=()=>openExistingProduct(p);const copy=document.createElement("span");copy.className="mobile-ref-promo-copy";const badge=document.createElement("span");badge.className="badge";badge.textContent="OFERTA";const h=document.createElement("h3");h.textContent=p.name;const d=document.createElement("p");d.textContent=p.description||"";const m=document.createElement("small");m.textContent="Disponível agora";const price=document.createElement("strong");price.textContent=Utils.money(p.price,state.settings.currency);copy.append(badge,h,d,m,price);const img=document.createElement("img");img.src=safe(p.image);img.alt=p.name;img.loading="lazy";b.append(copy,img);return b}
   function renderMenu(term){
     menu.replaceChildren();const q=term||"";
     cats.forEach(cat=>{const ps=state.products.filter(p=>p.active&&p.categoryId===cat.id).filter(p=>!q||[p.name,p.description,...(p.tags||[])].join(" ").toLowerCase().includes(q));if(!ps.length)return;
       const sec=document.createElement("article");sec.id="mref-"+cat.id;const h=document.createElement("h2");h.className="mobile-ref-category-title";h.textContent=cat.name;const d=document.createElement("p");d.className="mobile-ref-category-description";d.textContent=cat.name+" • "+ps.length+" opções disponíveis";const grid=document.createElement("div");grid.className="mobile-ref-products";
       ps.forEach(p=>{const b=document.createElement("button");b.type="button";b.className="mobile-ref-product";b.onclick=()=>openExistingProduct(p);const copy=document.createElement("span");copy.className="mobile-ref-product-copy";const h3=document.createElement("h3");h3.textContent=p.name;const desc=document.createElement("p");desc.textContent=p.description||"";const price=document.createElement("div");price.className="mobile-ref-product-bottom";price.textContent=Utils.money(p.price,state.settings.currency);copy.append(h3,desc,price);const img=document.createElement("img");img.src=safe(p.image);img.alt=p.name;img.loading="lazy";b.append(copy,img);grid.append(b)});
       sec.append(h,d,grid);menu.append(sec);
     });
   }
   input.oninput=()=>renderMenu(input.value.trim().toLowerCase());renderMenu();
   const bottom=document.createElement("nav");bottom.className="mobile-ref-bottom";
   function navBtn(icon,label,fn,active){const b=document.createElement("button");b.type="button";if(active)b.className="active";b.innerHTML="<span>"+icon+"</span><small></small>";b.querySelector("small").textContent=label;b.onclick=fn;return b}
   bottom.append(navBtn("⌂",s.mobileHomeLabel||defaults.homeLabel,()=>window.scrollTo({top:0,behavior:"smooth"}),true),navBtn("☆",s.mobilePromosLabel||defaults.promosLabel,()=>promoTitle.hidden?null:promoTitle.scrollIntoView({behavior:"smooth",block:"start"})),navBtn("▱",s.mobileOrdersLabel||defaults.ordersLabel,()=>document.getElementById("cartBar")?.click()),navBtn("○",s.mobileProfileLabel||defaults.profileLabel,()=>document.getElementById("changeTableButton")?.click()));
   wrap.append(bottom);root.append(wrap);
 }
 render();addEventListener("cardapio:data-changed",render);addEventListener("storage",render);
});
})();