/* ========================================
   CARRITO DE COMPRAS - Integración ligera y no intrusiva
   - HTML/CSS/JS nativo
   - Mantiene intacto el diseño existente (solo añade UI flotante y modales)
   - Compatible móvil (burbuja + modales) y desktop (panel lateral)

   Cómo cambiar el número de WhatsApp del negocio:
   - Modifica la constante BUSINESS_WA_NUMBER (solo dígitos, con código de país). Ej: '573001112233'
   ======================================== */
(function(){
  'use strict';

  // CONFIGURACIÓN
  const BUSINESS_WA_NUMBER = '573115934823'; // <- Cambia este número
  const CURRENCY = new Intl.NumberFormat('es-CO');
  const STORAGE_KEY = 'hf_cart_v1';

  // ESTADO
  let cart = [];

  // UTILIDADES ---------------------------------
  const fmt = (n) => `$${CURRENCY.format(Number(n||0))}`;
  const saveCart = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  const loadCart = () => {
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      cart = raw ? JSON.parse(raw) : [];
      if(!Array.isArray(cart)) cart = [];
    }catch{ cart = []; }
  };
  const totalAmount = () => cart.reduce((acc,it)=> acc + (it.unitPrice*it.qty), 0);
  const cartCount = () => cart.reduce((acc,it)=> acc + it.qty, 0);

  // INYECCIÓN DE UI ----------------------------
  function injectUI(){
    // Burbuja (móvil)
    const bubble = document.createElement('button');
    bubble.className = 'hf-cart-bubble';
    bubble.type = 'button';
    bubble.setAttribute('aria-label','Abrir carrito');
    bubble.innerHTML = `
      <span class="hf-cart-bubble__count" id="hfCartCount">0</span>
      <svg class="hf-cart-bubble__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2zM7.16 14h9.48c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 21.08 5H6.21L5.27 3.11A1 1 0 0 0 4.38 2.5H2.5a1 1 0 1 0 0 2h1.2l3.6 7.19-1.35 2.46C5.4 14.72 6.1 16 7.16 16h12.34a1 1 0 1 0 0-2H7.16z"/>
      </svg>`;
    document.body.appendChild(bubble);

    // Botón trigger (desktop)
    const trigger = document.createElement('button');
    trigger.className = 'hf-cart-trigger';
    trigger.type = 'button';
    trigger.setAttribute('aria-label','Abrir panel de carrito');
    trigger.innerHTML = `
      <span class="hf-cart-trigger__count" id="hfCartCountDesk">0</span>
      <svg class="hf-cart-trigger__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2zM7.16 14h9.48c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 21.08 5H6.21L5.27 3.11A1 1 0 0 0 4.38 2.5H2.5a1 1 0 1 0 0 2h1.2l3.6 7.19-1.35 2.46C5.4 14.72 6.1 16 7.16 16h12.34a1 1 0 1 0 0-2H7.16z"/>
      </svg>`;
    document.body.appendChild(trigger);

    // Panel lateral (desktop)
    const panel = document.createElement('aside');
    panel.className = 'hf-cart-panel';
    panel.setAttribute('aria-hidden','true');
    panel.innerHTML = `
      <div class="hf-cart-panel__header">
        <h3 class="hf-cart-panel__title">Tu carrito</h3>
        <button class="hf-cart-panel__close" type="button" aria-label="Cerrar">✕</button>
      </div>
      <div class="hf-cart-panel__body">
        <div class="hf-cart-list" id="hfCartListDesk"></div>
      </div>
      <div class="hf-cart-panel__footer">
        <div class="hf-cart-panel__total">
          <span>Total</span>
          <strong id="hfTotalDesk">$0</strong>
        </div>
        <button class="btn" id="hfCheckoutDesk" type="button">Hacer pedido</button>
      </div>`;
    document.body.appendChild(panel);

    // Modal 1: Lista de carrito (móvil)
    const listModal = document.createElement('div');
    listModal.className = 'hf-modal';
    listModal.id = 'hfCartModal';
    listModal.setAttribute('role','dialog');
    listModal.setAttribute('aria-modal','true');
    listModal.innerHTML = `
      <div class="hf-modal__content">
        <div class="hf-modal__head">
          <h3 class="hf-modal__title">Tu carrito</h3>
          <button class="hf-modal__close" type="button" data-close>✕</button>
        </div>
        <div class="hf-modal__body">
          <div class="hf-cart-list" id="hfCartListMob"></div>
        </div>
        <div class="hf-modal__footer">
          <div class="hf-summary"><span>Total</span><strong id="hfTotalMob">$0</strong></div>
          <button class="btn" id="hfCheckoutMob" type="button">Hacer pedido</button>
        </div>
      </div>`;
    document.body.appendChild(listModal);

    // Modal 2: Formulario de pedido
    const formModal = document.createElement('div');
    formModal.className = 'hf-modal';
    formModal.id = 'hfOrderModal';
    formModal.setAttribute('role','dialog');
    formModal.setAttribute('aria-modal','true');
    formModal.innerHTML = `
      <div class="hf-modal__content">
        <div class="hf-modal__head">
          <h3 class="hf-modal__title">Datos del pedido</h3>
          <button class="hf-modal__close" type="button" data-close>✕</button>
        </div>
        <div class="hf-modal__body">
          <div class="hf-summary"><span>Total a pagar</span><strong id="hfOrderTotal">$0</strong></div>
          <form id="hfOrderForm" class="hf-form">
            <input class="hf-input" type="text" id="hfName" name="name" autocomplete="name" placeholder="Nombre completo" required>
            <input class="hf-input" type="tel" id="hfPhone" name="phone" autocomplete="tel" placeholder="Teléfono" required>
            <input class="hf-input" type="text" id="hfAddress" name="address" autocomplete="street-address" placeholder="Dirección de entrega" required>
          </form>
        </div>
        <div class="hf-modal__footer">
          <button class="btn btn--outline" type="button" data-back>Volver</button>
          <button class="btn" type="submit" form="hfOrderForm" id="hfSendOrder">Enviar pedido</button>
        </div>
      </div>`;
    document.body.appendChild(formModal);

    // Eventos visuales básicos
    bubble.addEventListener('click', ()=> openCartModal());
    trigger.addEventListener('click', ()=> togglePanel(true));
    panel.querySelector('.hf-cart-panel__close').addEventListener('click', ()=> togglePanel(false));
    listModal.addEventListener('click', (e)=>{ if(e.target===listModal || e.target.hasAttribute('data-close')) closeModal(listModal); });
    formModal.addEventListener('click', (e)=>{ if(e.target===formModal || e.target.hasAttribute('data-close')) closeModal(formModal); });
    const backBtn = formModal.querySelector('[data-back]');
    if(backBtn) backBtn.addEventListener('click', ()=>{ closeModal(formModal); openCartModal(); });
    const checkoutMob = document.getElementById('hfCheckoutMob');
    const checkoutDesk = document.getElementById('hfCheckoutDesk');
    if(checkoutMob) checkoutMob.addEventListener('click', ()=> openOrderModal());
    if(checkoutDesk) checkoutDesk.addEventListener('click', ()=> openOrderModal());

    // Submit del formulario
    const orderForm = document.getElementById('hfOrderForm');
    orderForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      if(cart.length===0) return;
      const name = (document.getElementById('hfName').value||'').trim();
      const phone = (document.getElementById('hfPhone').value||'').trim();
      const address = (document.getElementById('hfAddress').value||'').trim();
      if(!name || !phone || !address) return;
      const waUrl = buildWhatsAppUrl(name, phone, address);
      window.open(waUrl, '_blank');
    });
  }

  function openCartModal(){
    const el = document.getElementById('hfCartModal');
    if(el){ el.classList.add('show'); document.body.style.overflow='hidden'; }
  }
  function openOrderModal(){
    if(cart.length===0) return;
    const el = document.getElementById('hfOrderModal');
    const totalEl = document.getElementById('hfOrderTotal');
    if(totalEl) totalEl.textContent = fmt(totalAmount());
    // Cierra la lista si estaba abierta (móvil) y muestra el formulario
    const list = document.getElementById('hfCartModal');
    if(list) list.classList.remove('show');
    if(el){ el.classList.add('show'); document.body.style.overflow='hidden'; }
  }
  function closeModal(el){ if(!el) return; el.classList.remove('show'); document.body.style.overflow=''; }
  function togglePanel(open){
    const panel = document.querySelector('.hf-cart-panel');
    if(!panel) return;
    panel.classList.toggle('is-open', !!open);
    panel.setAttribute('aria-hidden', open? 'false':'true');
  }

  // RENDER ------------------------------------
  function render(){
    // Contadores
    const count = cartCount();
    const c1 = document.getElementById('hfCartCount');
    const c2 = document.getElementById('hfCartCountDesk');
    if(c1) c1.textContent = count;
    if(c2) c2.textContent = count;

    // Listas
    const listMob = document.getElementById('hfCartListMob');
    const listDesk = document.getElementById('hfCartListDesk');
    const html = cart.map(item=> itemRowHTML(item)).join('');
    if(listMob) listMob.innerHTML = html || emptyHTML();
    if(listDesk) listDesk.innerHTML = html || emptyHTML();

    // Totales
    const t1 = document.getElementById('hfTotalMob');
    const t2 = document.getElementById('hfTotalDesk');
    if(t1) t1.textContent = fmt(totalAmount());
    if(t2) t2.textContent = fmt(totalAmount());

    // Habilitar/Deshabilitar checkout
    const ck1 = document.getElementById('hfCheckoutMob');
    const ck2 = document.getElementById('hfCheckoutDesk');
    const disabled = cart.length===0;
    if(ck1) ck1.disabled = disabled;
    if(ck2) ck2.disabled = disabled;

    saveCart();
  }
  function emptyHTML(){
    return `<p style="opacity:.9">Tu carrito está vacío. Agrega productos para continuar.</p>`;
  }
  function itemRowHTML(item){
    const size = item.sizeLabel ? ` <span class="hf-cart-item__meta">• ${item.sizeLabel}</span>` : '';
    return `
    <div class="hf-cart-item" data-id="${encodeURIComponent(item.id)}">
      <div>
        <div class="hf-cart-item__name">${escapeHtml(item.name)}${size}</div>
        <button class="hf-remove" type="button" data-action="remove">Eliminar</button>
      </div>
      <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px">
        <div class="hf-cart-item__qty">
          <button class="hf-qty-btn" type="button" data-action="dec">−</button>
          <span>${item.qty}</span>
          <button class="hf-qty-btn" type="button" data-action="inc">＋</button>
        </div>
        <div class="hf-cart-item__subtotal">${fmt(item.unitPrice*item.qty)}</div>
      </div>
    </div>`;
  }
  function escapeHtml(str){
    return String(str).replace(/[&<>"]/g, s=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[s]||s));
  }

  // WHATSAPP ----------------------------------
  function buildWhatsAppUrl(name, phone, address){
    const lines = [];
    lines.push('Nuevo pedido:');
    lines.push('- Productos:');
    cart.forEach(item=>{
      const unit = fmt(item.unitPrice).replace(/\$/,'$');
      const label = item.sizeLabel ? ` ${item.sizeLabel}` : '';
      lines.push(`  • ${item.name}${label} x${item.qty} - ${unit}`);
    });
    lines.push(`Total: ${fmt(totalAmount())}`);
    lines.push('');
    lines.push('Datos del cliente:');
    lines.push(`Nombre: ${name}`);
    lines.push(`Teléfono: ${phone}`);
    lines.push(`Dirección: ${address}`);

    const message = lines.join('\n');
    const url = `https://wa.me/${BUSINESS_WA_NUMBER}?text=${encodeURIComponent(message)}`;
    return url;
  }

  // EXTRACCIÓN DE INFO DE PRODUCTO -------------
  function getProductFromCard(card){
    // Nombre: prioriza data-product del botón existente .order-btn
    let name = '';
    const orderBtn = card.querySelector('.order-btn');
    if(orderBtn && orderBtn.dataset.product){
      name = orderBtn.dataset.product.trim();
    }else{
      const title = card.querySelector('.product-card__title');
      name = title ? title.textContent.trim() : 'Producto';
    }

    // Precio y tamaño
    let unitPrice = 0; let sizeLabel = '';
    const sizeGroup = orderBtn ? orderBtn.getAttribute('data-size-group') : null;
    if(sizeGroup){
      const sel = card.querySelector(`input[name="${CSS.escape(sizeGroup)}"]:checked`);
      if(sel){
        unitPrice = Number(sel.value || 0);
        sizeLabel = sel.getAttribute('data-size') || '';
      }
    }
    if(!unitPrice){
      const priceEl = card.querySelector('.price');
      if(priceEl){
        const raw = priceEl.textContent.replace(/[^0-9]/g,'');
        unitPrice = Number(raw||0);
      }
    }

    // ID único por nombre+tamaño
    const id = `${name}|${sizeLabel||''}`;
    return { id, name, unitPrice, sizeLabel };
  }

  // ACCIONES DE CARRITO ------------------------
  function addToCartFromCard(card){
    const info = getProductFromCard(card);
    if(!info.unitPrice){ return; }
    const existing = cart.find(it=> it.id===info.id);
    if(existing){ existing.qty += 1; }
    else { cart.push({ ...info, qty:1 }); }
    render();
  }
  function updateQty(id, delta){
    const idx = cart.findIndex(it=> it.id===id);
    if(idx===-1) return;
    cart[idx].qty += delta;
    if(cart[idx].qty<=0){ cart.splice(idx,1); }
    render();
  }
  function removeItem(id){
    const idx = cart.findIndex(it=> it.id===id);
    if(idx!==-1){ cart.splice(idx,1); render(); }
  }

  // ENLACES Y EVENTOS --------------------------
  function injectAddButtons(){
    // Añade un botón "Agregar al carrito" a cada tarjeta sin modificar clases existentes
    document.querySelectorAll('.product-card').forEach(card=>{
      const actions = card.querySelector('.product-card__actions');
      if(!actions) return;
      // Evita duplicados
      if(actions.querySelector('.hf-add-to-cart')) return;
      const btn = document.createElement('button');
      btn.className = 'btn hf-add-to-cart';
      btn.type = 'button';
      btn.textContent = 'Agregar al carrito';
      actions.appendChild(btn);
    });
  }

  function delegateEvents(){
    // Click en botones agregados
    document.body.addEventListener('click', (e)=>{
      const addBtn = e.target.closest('.hf-add-to-cart');
      if(addBtn){
        const card = addBtn.closest('.product-card');
        if(card) addToCartFromCard(card);
      }

      // Acciones en items (en ambos contenedores por delegación)
      const itemEl = e.target.closest('.hf-cart-item');
      if(itemEl){
        const id = decodeURIComponent(itemEl.getAttribute('data-id'));
        if(e.target.matches('[data-action="inc"]')) updateQty(id, +1);
        if(e.target.matches('[data-action="dec"]')) updateQty(id, -1);
        if(e.target.matches('[data-action="remove"]')) removeItem(id);
      }
    });
  }

  // INICIO ------------------------------------
  document.addEventListener('DOMContentLoaded', ()=>{
    loadCart();
    injectUI();
    injectAddButtons();
    delegateEvents();
    render();
  });
})();
