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
        <h3 class="hf-cart-panel__title">
          Tu carrito
          <button class="hf-help-icon" type="button" title="Ayuda" aria-label="Información del carrito">?</button>
        </h3>
        <button class="hf-cart-panel__close" type="button" aria-label="Cerrar">✕</button>
      </div>
      <div class="hf-cart-panel__body">
        <div class="hf-cart-list" id="hfCartListDesk"></div>
      </div>
      <div class="hf-cart-panel__footer">
        <div class="hf-cart-panel__total">
          <span id="hfItemsCountDesk" class="hf-items-count"></span>
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
          <h3 class="hf-modal__title">
            Tu carrito
            <button class="hf-help-icon" type="button" title="Ayuda" aria-label="Información del carrito">?</button>
          </h3>
          <button class="hf-modal__close" type="button" data-close>✕</button>
        </div>
        <div class="hf-modal__body">
          <div class="hf-cart-list" id="hfCartListMob"></div>
        </div>
        <div class="hf-modal__footer">
          <div class="hf-summary">
            <span id="hfItemsCountMob" class="hf-items-count"></span>
            <span>Total</span>
            <strong id="hfTotalMob">$0</strong>
          </div>
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
          <form id="hfOrderForm" class="hf-form" novalidate>
            <div class="hf-field">
              <input class="hf-input" type="text" id="hfName" name="name" autocomplete="name" placeholder="Nombre completo" required minlength="3" maxlength="50" pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+">
              <span class="hf-error" id="hfNameError"></span>
            </div>
            <div class="hf-field">
              <input class="hf-input" type="tel" id="hfPhone" name="phone" autocomplete="tel" placeholder="Teléfono (10 dígitos)" required minlength="10" maxlength="10" pattern="[0-9]{10}">
              <span class="hf-error" id="hfPhoneError"></span>
            </div>
            <div class="hf-field">
              <input class="hf-input" type="text" id="hfAddress" name="address" autocomplete="street-address" placeholder="Dirección de entrega" required minlength="10" maxlength="100">
              <span class="hf-error" id="hfAddressError"></span>
            </div>
            <div class="hf-field">
              <input class="hf-input" type="text" id="hfNeighborhood" name="neighborhood" placeholder="Barrio" required minlength="3" maxlength="50">
              <span class="hf-error" id="hfNeighborhoodError"></span>
            </div>
          </form>
        </div>
        <div class="hf-modal__footer">
          <button class="btn btn--outline" type="button" data-back>Volver</button>
          <button class="btn" type="submit" form="hfOrderForm" id="hfSendOrder">Enviar pedido</button>
        </div>
      </div>`;
    document.body.appendChild(formModal);

    // Modal de ayuda
    const helpModal = document.createElement('div');
    helpModal.className = 'hf-modal hf-help-modal';
    helpModal.id = 'hfHelpModal';
    helpModal.setAttribute('role','dialog');
    helpModal.setAttribute('aria-modal','true');
    helpModal.innerHTML = `
      <div class="hf-modal__content hf-help-content">
        <div class="hf-modal__head">
          <h3 class="hf-modal__title">¿Cómo funciona el carrito?</h3>
          <button class="hf-modal__close" type="button" data-close-help>✕</button>
        </div>
        <div class="hf-modal__body">
          <div class="hf-help-text">
            <p><strong>Estás haciendo un pedido</strong></p>
            <p>Este carrito te permite seleccionar productos y enviar tu pedido directamente por WhatsApp al restaurante.</p>
            
            <p><strong>No estás pagando aquí</strong></p>
            <p>El pago se realiza al momento de la entrega o cuando recojas tu pedido. Puedes pagar en efectivo o con los métodos aceptados por el restaurante.</p>
            
            <p><strong>Pasos a seguir:</strong></p>
            <ol>
              <li>Agrega productos al carrito</li>
              <li>Revisa tu pedido y el total</li>
              <li>Haz clic en "Hacer pedido"</li>
              <li>Completa tus datos de contacto</li>
              <li>Confirma y envía por WhatsApp</li>
              <li>Espera la confirmación del restaurante</li>
            </ol>
            
            <p><strong>Confirmación por WhatsApp</strong></p>
            <p>Al enviar el pedido, se abrirá WhatsApp con un mensaje prellenado. El restaurante te confirmará la disponibilidad, tiempo de entrega y detalles del pago.</p>
          </div>
        </div>
        <div class="hf-modal__footer">
          <button class="btn" type="button" data-close-help>Entendido</button>
        </div>
      </div>`;
    document.body.appendChild(helpModal);

    // Eventos visuales básicos
    bubble.addEventListener('click', ()=> openCartModal());
    trigger.addEventListener('click', ()=> togglePanel(true));
    panel.querySelector('.hf-cart-panel__close').addEventListener('click', ()=> togglePanel(false));
    listModal.addEventListener('click', (e)=>{ if(e.target===listModal || e.target.hasAttribute('data-close')) closeModal(listModal); });
    formModal.addEventListener('click', (e)=>{ if(e.target===formModal || e.target.hasAttribute('data-close')) closeModal(formModal); });
    helpModal.addEventListener('click', (e)=>{ if(e.target===helpModal || e.target.hasAttribute('data-close-help')) closeModal(helpModal); });
    
    // Botones de ayuda
    const helpButtons = document.querySelectorAll('.hf-help-icon');
    helpButtons.forEach(btn => {
      btn.addEventListener('click', (e)=> {
        e.stopPropagation();
        helpModal.classList.add('show');
        document.body.style.overflow = 'hidden';
      });
    });
    
    const backBtn = formModal.querySelector('[data-back]');
    if(backBtn) backBtn.addEventListener('click', ()=>{ closeModal(formModal); openCartModal(); });
    const checkoutMob = document.getElementById('hfCheckoutMob');
    const checkoutDesk = document.getElementById('hfCheckoutDesk');
    if(checkoutMob) checkoutMob.addEventListener('click', ()=> openOrderModal());
    if(checkoutDesk) checkoutDesk.addEventListener('click', ()=> openOrderModal());

    // Submit del formulario con validación
    const orderForm = document.getElementById('hfOrderForm');
    const nameInput = document.getElementById('hfName');
    const phoneInput = document.getElementById('hfPhone');
    const addressInput = document.getElementById('hfAddress');
    const neighborhoodInput = document.getElementById('hfNeighborhood');
    const nameError = document.getElementById('hfNameError');
    const phoneError = document.getElementById('hfPhoneError');
    const addressError = document.getElementById('hfAddressError');
    const neighborhoodError = document.getElementById('hfNeighborhoodError');

    // Validación en tiempo real para nombre (solo letras y espacios)
    nameInput.addEventListener('input', (e)=>{
      const value = e.target.value;
      // Elimina cualquier caracter que no sea letra o espacio
      e.target.value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
      validateName();
    });

    // Validación en tiempo real para teléfono (solo números)
    phoneInput.addEventListener('input', (e)=>{
      const value = e.target.value;
      // Elimina cualquier caracter que no sea número
      e.target.value = value.replace(/[^0-9]/g, '');
      validatePhone();
    });

    // Validación para dirección
    addressInput.addEventListener('input', ()=> validateAddress());

    // Validación para barrio
    neighborhoodInput.addEventListener('input', ()=> validateNeighborhood());

    function validateName(){
      const value = nameInput.value.trim();
      if(!value){
        nameError.textContent = 'El nombre es obligatorio';
        nameInput.classList.add('hf-input--error');
        return false;
      }
      if(value.length < 3){
        nameError.textContent = 'Mínimo 3 caracteres';
        nameInput.classList.add('hf-input--error');
        return false;
      }
      if(value.length > 50){
        nameError.textContent = 'Máximo 50 caracteres';
        nameInput.classList.add('hf-input--error');
        return false;
      }
      if(!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)){
        nameError.textContent = 'Solo se permiten letras y espacios';
        nameInput.classList.add('hf-input--error');
        return false;
      }
      nameError.textContent = '';
      nameInput.classList.remove('hf-input--error');
      return true;
    }

    function validatePhone(){
      const value = phoneInput.value.trim();
      if(!value){
        phoneError.textContent = 'El teléfono es obligatorio';
        phoneInput.classList.add('hf-input--error');
        return false;
      }
      if(!/^[0-9]+$/.test(value)){
        phoneError.textContent = 'Solo se permiten números';
        phoneInput.classList.add('hf-input--error');
        return false;
      }
      if(value.length < 10){
        phoneError.textContent = 'Debe tener 10 dígitos';
        phoneInput.classList.add('hf-input--error');
        return false;
      }
      if(value.length > 10){
        phoneError.textContent = 'Máximo 10 dígitos';
        phoneInput.classList.add('hf-input--error');
        return false;
      }
      phoneError.textContent = '';
      phoneInput.classList.remove('hf-input--error');
      return true;
    }

    function validateAddress(){
      const value = addressInput.value.trim();
      if(!value){
        addressError.textContent = 'La dirección es obligatoria';
        addressInput.classList.add('hf-input--error');
        return false;
      }
      if(value.length < 10){
        addressError.textContent = 'Mínimo 10 caracteres';
        addressInput.classList.add('hf-input--error');
        return false;
      }
      if(value.length > 100){
        addressError.textContent = 'Máximo 100 caracteres';
        addressInput.classList.add('hf-input--error');
        return false;
      }
      addressError.textContent = '';
      addressInput.classList.remove('hf-input--error');
      return true;
    }

    function validateNeighborhood(){
      const value = neighborhoodInput.value.trim();
      if(!value){
        neighborhoodError.textContent = 'El barrio es obligatorio';
        neighborhoodInput.classList.add('hf-input--error');
        return false;
      }
      if(value.length < 3){
        neighborhoodError.textContent = 'Mínimo 3 caracteres';
        neighborhoodInput.classList.add('hf-input--error');
        return false;
      }
      if(value.length > 50){
        neighborhoodError.textContent = 'Máximo 50 caracteres';
        neighborhoodInput.classList.add('hf-input--error');
        return false;
      }
      neighborhoodError.textContent = '';
      neighborhoodInput.classList.remove('hf-input--error');
      return true;
    }

    orderForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      if(cart.length===0) return;
      
      // Validar todos los campos
      const isNameValid = validateName();
      const isPhoneValid = validatePhone();
      const isAddressValid = validateAddress();
      const isNeighborhoodValid = validateNeighborhood();

      if(!isNameValid || !isPhoneValid || !isAddressValid || !isNeighborhoodValid){
        return; // Detener si hay errores
      }

      const name = nameInput.value.trim();
      const phone = phoneInput.value.trim();
      const address = addressInput.value.trim();
      const neighborhood = neighborhoodInput.value.trim();
      
      const waUrl = buildWhatsAppUrl(name, phone, address, neighborhood);
      window.open(waUrl, '_blank');
      
      // Opcional: Limpiar formulario después de enviar
      orderForm.reset();
      nameError.textContent = '';
      phoneError.textContent = '';
      addressError.textContent = '';
      neighborhoodError.textContent = '';
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
    const itemsCount = cart.length; // Número de productos diferentes
    const c1 = document.getElementById('hfCartCount');
    const c2 = document.getElementById('hfCartCountDesk');
    if(c1) c1.textContent = count;
    if(c2) c2.textContent = count;

    // Contador de items únicos
    const ic1 = document.getElementById('hfItemsCountMob');
    const ic2 = document.getElementById('hfItemsCountDesk');
    const itemsText = itemsCount > 0 ? `${itemsCount} producto${itemsCount !== 1 ? 's' : ''} • ` : '';
    if(ic1) ic1.textContent = itemsText;
    if(ic2) ic2.textContent = itemsText;

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
    const color = item.colorLabel ? ` <span class="hf-cart-item__meta">• ${item.colorLabel}</span>` : '';
    const unitPrice = fmt(item.unitPrice);
    const subtotal = fmt(item.unitPrice*item.qty);
    return `
    <div class="hf-cart-item" data-id="${encodeURIComponent(item.id)}">
      <div>
        <div class="hf-cart-item__name">${escapeHtml(item.name)}${size}${color}</div>
        <div class="hf-cart-item__unit-price">${unitPrice} c/u</div>
        <button class="hf-remove" type="button" data-action="remove">Eliminar</button>
      </div>
      <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px">
        <div class="hf-cart-item__qty">
          <button class="hf-qty-btn" type="button" data-action="dec">−</button>
          <span>${item.qty}</span>
          <button class="hf-qty-btn" type="button" data-action="inc">＋</button>
        </div>
        <div class="hf-cart-item__subtotal">${subtotal}</div>
      </div>
    </div>`;
  }
  function escapeHtml(str){
    return String(str).replace(/[&<>"]/g, s=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[s]||s));
  }

  // WHATSAPP ----------------------------------
  function buildWhatsAppUrl(name, phone, address, neighborhood){
    const lines = [];
    lines.push('🛒 *PEDIDO HONGFA*');
    lines.push('');
    lines.push('📦 *Productos:*');
    lines.push('━━━━━━━━━━━━━━━');
    
    cart.forEach(item=>{
      const unit = fmt(item.unitPrice);
      const sizeInfo = item.sizeLabel ? `  Tamaño: ${item.sizeLabel}\n` : '';
      const colorInfo = item.colorLabel ? `  Color: ${item.colorLabel}\n` : '';
      
      lines.push(`• ${item.name}`);
      if(sizeInfo) lines.push(sizeInfo.trim());
      if(colorInfo) lines.push(colorInfo.trim());
      lines.push(`  Cantidad: x${item.qty}`);
      lines.push(`  Precio: ${unit}`);
      lines.push('');
    });
    
    lines.push(`💰 *Total: ${fmt(totalAmount())}*`);
    lines.push('');
    lines.push('👤 *Datos del cliente:*');
    lines.push(`📝 Nombre: ${name}`);
    lines.push(`📞 Teléfono: ${phone}`);
    lines.push(`📍 Dirección: ${address}`);
    lines.push(`🏘️ Barrio: ${neighborhood}`);

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

    // Color (si existe selector de color)
    let colorLabel = '';
    const colorGroup = orderBtn ? orderBtn.getAttribute('data-color-group') : null;
    if(colorGroup){
      const colorSel = card.querySelector(`input[name="${CSS.escape(colorGroup)}"]:checked`);
      if(colorSel){
        colorLabel = colorSel.getAttribute('data-color') || '';
      }
    }

    // ID único por nombre+tamaño+color
    const id = `${name}|${sizeLabel||''}|${colorLabel||''}`;
    return { id, name, unitPrice, sizeLabel, colorLabel };
  }

  // ACCIONES DE CARRITO ------------------------
  function addToCartFromCard(card){
    const info = getProductFromCard(card);
    if(!info.unitPrice){ return; }
    const existing = cart.find(it=> it.id===info.id);
    if(existing){ existing.qty += 1; }
    else { cart.push({ ...info, qty:1 }); }
    render();
    showToast(`✓ ${info.name} agregado al carrito`);
  }
  
  // CONFIRMACIÓN VISUAL (TOAST)
  function showToast(message){
    // Remover toast anterior si existe
    const existing = document.querySelector('.hf-toast');
    if(existing) existing.remove();
    
    // Crear nuevo toast
    const toast = document.createElement('div');
    toast.className = 'hf-toast';
    toast.innerHTML = `<span class="hf-toast__icon">✓</span><span class="hf-toast__message">${message}</span>`;
    document.body.appendChild(toast);
    
    // Mostrar con animación
    setTimeout(()=> toast.classList.add('show'), 10);
    
    // Ocultar después de 3 segundos
    setTimeout(()=>{
      toast.classList.remove('show');
      setTimeout(()=> toast.remove(), 300);
    }, 3000);
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
