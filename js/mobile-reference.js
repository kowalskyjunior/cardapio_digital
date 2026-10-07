(function(){
document.addEventListener("DOMContentLoaded",function(){
  const {Data,Utils,Cart}=window.CardapioDigital;
  const root=document.getElementById("mobileReferenceApp");
  if(!root)return;
  const defaults={
    mobileCouponText:"Você tem cupons! Aproveite!",
    mobileDeliveryLabel:"Calcular taxa e tempo de entrega",
    mobileCashbackTitle:"Programa de cashback",
    mobileCashbackText:"Receba 1% de cashback em cada pedido e use o saldo como desconto nas próximas compras.",
    mobileCashbackButton:"Crie ou acesse sua conta",
    mobileMoreInfoText:"Mais informações",
    mobileHomeLabel:"Início",
    mobilePromosLabel:"Promoções",
    mobileOrdersLabel:"Pedidos",
    mobileProfileLabel:"Perfil"
  };
  let state=Data.getState();

  function settings(){return Object.assign({},defaults,state.settings||{});}
  function safe(src){return Utils.safeImage(src,"assets/icon.svg");}

  function ensureProductSheet(){
    let sheet=document.getElementById("mobileProductSheet");
    if(sheet)return sheet;
    sheet=document.createElement("div");
    sheet.id="mobileProductSheet";
    sheet.className="mobile-product-sheet";
    sheet.hidden=true;
    sheet.setAttribute("aria-hidden","true");
    sheet.innerHTML='<div class="mobile-product-sheet-backdrop"></div><section class="mobile-product-sheet-panel" role="dialog" aria-modal="true" aria-label="Detalhes do produto"><button type="button" class="mobile-product-sheet-close" aria-label="Fechar">×</button><img class="mobile-product-sheet-image" alt=""><div class="mobile-product-sheet-scroll"><div class="mobile-product-sheet-head"><div><h2 class="mobile-product-sheet-name"></h2><p class="mobile-product-sheet-description"></p></div><strong class="mobile-product-sheet-price"></strong></div><div class="mobile-product-sheet-options"></div><label class="mobile-product-sheet-notes-label"><span>Alguma observação?</span><small>Opcional</small><textarea class="mobile-product-sheet-notes" rows="3" maxlength="240" placeholder="Ex.: sem cebola, ponto da carne..."></textarea></label></div><div class="mobile-product-sheet-footer"><div class="mobile-product-sheet-stepper"><button type="button" data-step="-1">−</button><output>1</output><button type="button" data-step="1">+</button></div><button type="button" class="mobile-product-sheet-add">Adicionar <span></span></button></div></section>';
    document.body.append(sheet);
    const close=()=>closeProductSheet();
    sheet.querySelector(".mobile-product-sheet-close").onclick=close;
    sheet.querySelector(".mobile-product-sheet-backdrop").onclick=close;
    sheet.querySelectorAll("[data-step]").forEach(btn=>btn.onclick=()=>{
      const next=Math.max(1,Math.min(20,(Number(sheet.dataset.qty)||1)+Number(btn.dataset.step)));
      sheet.dataset.qty=String(next);
      sheet.querySelector(".mobile-product-sheet-stepper output").textContent=String(next);
      updateSheetTotal();
    });
    sheet.addEventListener("change",e=>{if(e.target.matches(".mobile-product-option input"))updateSheetTotal()});
    sheet.querySelector(".mobile-product-sheet-add").onclick=()=>{
      const product=sheet._product;
      if(!product)return;
      const extras=[...sheet.querySelectorAll(".mobile-product-option input:checked")].map(x=>state.addons.find(a=>a.id===x.value)).filter(Boolean);
      Cart.add(product,Number(sheet.dataset.qty)||1,extras,sheet.querySelector(".mobile-product-sheet-notes").value);
      closeProductSheet();
      Utils.toast("Item adicionado ao carrinho.","toast");
    };
    return sheet;
  }

  function updateSheetTotal(){
    const sheet=document.getElementById("mobileProductSheet");
    if(!sheet||!sheet._product)return;
    const extras=[...sheet.querySelectorAll(".mobile-product-option input:checked")].reduce((sum,x)=>sum+Number(x.dataset.price||0),0);
    const unit=(Number(sheet._product.price)||0)+extras;
    const qty=Number(sheet.dataset.qty)||1;
    sheet.querySelector(".mobile-product-sheet-add span").textContent=Utils.money(unit*qty,state.settings.currency);
  }

  function closeProductSheet(){
    const sheet=document.getElementById("mobileProductSheet");
    if(!sheet)return;
    sheet.hidden=true;
    sheet.setAttribute("aria-hidden","true");
    sheet._product=null;
    document.body.classList.remove("mobile-product-sheet-open");
  }

  function openProductSheet(product){
    const sheet=ensureProductSheet();
    sheet._product=product;
    sheet.hidden=false;
    sheet.setAttribute("aria-hidden","false");
    sheet.dataset.qty="1";
    sheet.querySelector(".mobile-product-sheet-image").src=safe(product.image);
    sheet.querySelector(".mobile-product-sheet-image").alt=product.name;
    sheet.querySelector(".mobile-product-sheet-name").textContent=product.name;
    sheet.querySelector(".mobile-product-sheet-description").textContent=product.description||"";
    sheet.querySelector(".mobile-product-sheet-price").textContent=Utils.money(product.price,state.settings.currency);
    sheet.querySelector(".mobile-product-sheet-notes").value="";
    const options=sheet.querySelector(".mobile-product-sheet-options");
    options.replaceChildren();
    (state.addons||[]).filter(a=>(product.addonIds||[]).includes(a.id)).forEach(a=>{
      const label=document.createElement("label");label.className="mobile-product-option";
      const copy=document.createElement("span");copy.className="mobile-product-option-copy";
      const name=document.createElement("strong");name.textContent=a.name;
      const price=document.createElement("small");price.textContent=a.price?"+ "+Utils.money(a.price,state.settings.currency):"";
      copy.append(name,price);
      const input=document.createElement("input");input.type="checkbox";input.value=a.id;input.dataset.price=String(a.price||0);
      label.append(copy,input);options.append(label);
    });
    sheet.querySelector(".mobile-product-sheet-stepper output").textContent="1";
    updateSheetTotal();
    document.body.classList.add("mobile-product-sheet-open");
  }

  function productCard(product){
    const b=document.createElement("button");b.type="button";b.className="mobile-ref-product";
    const copy=document.createElement("span");copy.className="mobile-ref-product-copy";
    const name=document.createElement("h3");name.textContent=product.name;
    const desc=document.createElement("p");desc.textContent=product.description||"";
    const price=document.createElement("div");price.className="mobile-ref-product-bottom";price.textContent=Utils.money(product.price,state.settings.currency);
    copy.append(name,desc,price);
    const img=document.createElement("img");img.src=safe(product.image);img.alt=product.name;img.loading="lazy";
    b.append(copy,img);b.onclick=()=>openProductSheet(product);return b;
  }

  function promoCard(product){
    const b=document.createElement("button");b.type="button";b.className="mobile-ref-promo";b.onclick=()=>openProductSheet(product);
    const copy=document.createElement("span");copy.className="mobile-ref-promo-copy";
    const badge=document.createElement("span");badge.className="badge";badge.textContent="OFERTA";
    const name=document.createElement("h3");name.textContent=product.name;
    const desc=document.createElement("p");desc.textContent=product.description||"";
    const meta=document.createElement("small");meta.textContent="Disponível agora";
    const price=document.createElement("strong");price.textContent=Utils.money(product.price,state.settings.currency);
    copy.append(badge,name,desc,meta,price);
    const img=document.createElement("img");img.src=safe(product.image);img.alt=product.name;img.loading="lazy";
    b.append(copy,img);return b;
  }

  function render(){
    state=Data.sync?Data.sync():Data.getState();
    const s=settings(),cats=state.categories.slice().sort((a,b)=>a.sort-b.sort);
    const active=state.products.filter(p=>p.active),featured=active.filter(p=>p.featured).slice(0,5);
    const accent=s.mobileAccentColor||s.primaryColor||"#18b84b";
    root.style.setProperty("--mobile-bg",s.mobileBackgroundColor||"#f2f2f2");
    root.style.setProperty("--mobile-accent",accent);
    root.replaceChildren();

    const wrap=document.createElement("div");wrap.className="mobile-ref-wrap";
    if(s.mobileCouponEnabled!==false){
      const bar=document.createElement("div");bar.className="mobile-ref-coupon";
      const tx=document.createElement("strong");tx.textContent=s.mobileCouponText||defaults.mobileCouponText;
      const close=document.createElement("button");close.type="button";close.textContent="×";close.onclick=()=>bar.remove();
      bar.append(tx,close);wrap.append(bar);
    }

    const hero=document.createElement("section");hero.className="mobile-ref-hero";
    const cover=document.createElement("div");cover.className="mobile-ref-cover";cover.style.backgroundImage=s.banner?"url("+JSON.stringify(safe(s.banner))+")":"linear-gradient(135deg,"+accent+",#888)";
    const identity=document.createElement("div");identity.className="mobile-ref-identity";
    if(s.logo){const logo=document.createElement("img");logo.className="mobile-ref-logo";logo.src=safe(s.logo);logo.alt="";identity.append(logo)}
    else {const mark=document.createElement("div");mark.className="mobile-ref-logo mobile-ref-logo-text";mark.textContent=(s.restaurantName||"C").slice(0,1).toUpperCase();identity.append(mark)}
    const name=document.createElement("h1");name.textContent=s.restaurantName||"Cardápio";
    const loc=document.createElement("p");loc.className="mobile-ref-location";loc.textContent=s.address||"Endereço não informado";
    const more=document.createElement("button");more.type="button";more.className="mobile-ref-more";more.textContent=s.mobileMoreInfoText||defaults.mobileMoreInfoText;more.onclick=()=>document.querySelector(".visit-section")?.scrollIntoView({behavior:"smooth"});
    const status=document.createElement("p");status.className="mobile-ref-status"+(s.isOpen?"":" closed");status.textContent=s.isOpen?"Aberto agora":("Fechado • "+(s.hours||"ver horário"));
    identity.append(name,loc,more,status);hero.append(cover,identity);wrap.append(hero);

    const actions=document.createElement("section");actions.className="mobile-ref-actions";
    const delivery=document.createElement("button");delivery.type="button";delivery.className="mobile-ref-action";delivery.innerHTML='<span class="icon">⌖</span><span></span><span class="arrow">›</span>';delivery.children[1].textContent=s.mobileDeliveryLabel||defaults.mobileDeliveryLabel;
    delivery.onclick=()=>document.getElementById("cartBar")?.click();actions.append(delivery);
    if(s.mobileCashbackEnabled!==false){const cash=document.createElement("article");cash.className="mobile-ref-cashback";const head=document.createElement("div");head.className="mobile-ref-cashback-head";head.innerHTML='<span class="icon">↻</span><strong></strong>';head.querySelector("strong").textContent=s.mobileCashbackTitle||defaults.mobileCashbackTitle;const p=document.createElement("p");p.textContent=s.mobileCashbackText||defaults.mobileCashbackText;const btn=document.createElement("button");btn.type="button";btn.textContent=s.mobileCashbackButton||defaults.mobileCashbackButton;btn.onclick=()=>Utils.toast("O cashback fica disponível para clientes cadastrados.","toast");cash.append(head,p,btn);actions.append(cash)}
    wrap.append(actions);

    const nav=document.createElement("section");nav.className="mobile-ref-nav";
    const sw=document.createElement("label");sw.className="mobile-ref-select";
    const sel=document.createElement("select");sel.setAttribute("aria-label","Categorias");cats.forEach(c=>{const o=document.createElement("option");o.value=c.id;o.textContent=c.name;sel.append(o)});sel.onchange=()=>document.getElementById("mref-"+sel.value)?.scrollIntoView({behavior:"smooth",block:"start"});
    const chev=document.createElement("span");chev.className="chev";chev.textContent="⌄";sw.append(sel,chev);
    const searchBtn=document.createElement("button");searchBtn.className="mobile-ref-search-btn";searchBtn.type="button";searchBtn.innerHTML='<span class="mobile-ref-search-icon"></span>';
    nav.append(sw,searchBtn);wrap.append(nav);
    const search=document.createElement("label");search.className="mobile-ref-search";search.hidden=true;const input=document.createElement("input");input.type="search";input.placeholder="Buscar no cardápio";search.append(input);wrap.append(search);
    searchBtn.onclick=()=>{search.hidden=!search.hidden;if(!search.hidden)input.focus()};

    const promoTitle=document.createElement("h2");promoTitle.className="mobile-ref-promo-title";promoTitle.textContent="PROMOÇÕES DO RESTAURANTE";promoTitle.hidden=!featured.length;wrap.append(promoTitle);
    const promos=document.createElement("section");promos.className="mobile-ref-promos";featured.forEach(p=>promos.append(promoCard(p)));promos.hidden=!featured.length;wrap.append(promos);

    const menu=document.createElement("section");menu.className="mobile-ref-menu";wrap.append(menu);
    const renderMenu=term=>{
      menu.replaceChildren();const q=(term||"").toLowerCase();
      cats.forEach(cat=>{
        const ps=state.products.filter(p=>p.active&&p.categoryId===cat.id).filter(p=>!q||[p.name,p.description,...(p.tags||[])].join(" ").toLowerCase().includes(q));
        if(!ps.length)return;
        const sec=document.createElement("article");sec.id="mref-"+cat.id;
        const h=document.createElement("h2");h.className="mobile-ref-category-title";h.textContent=cat.name;
        const d=document.createElement("p");d.className="mobile-ref-category-description";d.textContent=cat.name+" • "+ps.length+" opções disponíveis";
        const grid=document.createElement("div");grid.className="mobile-ref-products";ps.forEach(p=>grid.append(productCard(p)));
        sec.append(h,d,grid);menu.append(sec);
      });
    };
    input.oninput=()=>renderMenu(input.value.trim());
    renderMenu();

    const bottom=document.createElement("nav");bottom.className="mobile-ref-bottom";
    const navButton=(icon,label,fn,activeState)=>{const b=document.createElement("button");b.type="button";if(activeState)b.className="active";b.innerHTML="<span>"+icon+"</span><small></small>";b.querySelector("small").textContent=label;b.onclick=fn;return b};
    bottom.append(
      navButton("⌂",s.mobileHomeLabel||defaults.mobileHomeLabel,()=>window.scrollTo({top:0,behavior:"smooth"}),true),
      navButton("☆",s.mobilePromosLabel||defaults.mobilePromosLabel,()=>{if(!promoTitle.hidden)promoTitle.scrollIntoView({behavior:"smooth",block:"start"})}),
      navButton("▱",s.mobileOrdersLabel||defaults.mobileOrdersLabel,()=>document.getElementById("cartBar")?.click()),
      navButton("○",s.mobileProfileLabel||defaults.mobileProfileLabel,()=>document.getElementById("changeTableButton")?.click())
    );
    wrap.append(bottom);root.append(wrap);
    ensureProductSheet();
  }
  ensureProductSheet();
  render();
  addEventListener("cardapio:data-changed",render);
  addEventListener("storage",render);
});
})();