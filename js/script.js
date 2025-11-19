/* ========================================
   JAVASCRIPT - FUNCIONALIDAD INTERACTIVA
   Restaurante Hongfa
   ======================================== */

// Espera a que todo el DOM (HTML) esté completamente cargado antes de ejecutar el código
document.addEventListener('DOMContentLoaded', function () {
  
  /* ========================================
     AÑO DINÁMICO EN EL FOOTER
     ======================================== */
  // Obtiene el elemento span con id="year"
  const yearEl = document.getElementById('year');
  // Si el elemento existe, le asigna el año actual
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ========================================
     SISTEMA DE PESTAÑAS - Menú de navegación
     ======================================== */
  const menuTabs = document.querySelectorAll('.menu-tab'); // Todos los botones de pestañas
  const menuContents = document.querySelectorAll('.menu-content'); // Todos los contenedores de contenido

  // Agrega evento click a cada botón de pestaña
  menuTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Obtiene el nombre de la pestaña a mostrar
      const targetTab = this.getAttribute('data-tab');
      
      // Remueve la clase 'active' de todos los botones y contenidos
      menuTabs.forEach(t => t.classList.remove('active'));
      menuContents.forEach(c => c.classList.remove('active'));
      
      // Agrega la clase 'active' al botón clickeado
      this.classList.add('active');
      
      // Muestra el contenido correspondiente
      const targetContent = document.getElementById(targetTab);
      if (targetContent) {
        targetContent.classList.add('active');
      }
      
      // Centra el botón clickeado en el scroll horizontal del carrusel
      const tabsContainer = this.parentElement; // Contenedor .menu-tabs
      const buttonLeft = this.offsetLeft; // Posición del botón desde el inicio
      const buttonWidth = this.offsetWidth; // Ancho del botón
      const containerWidth = tabsContainer.offsetWidth; // Ancho del contenedor visible
      
      // Calcula la posición de scroll para centrar el botón
      const scrollPosition = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);
      
      // Hace scroll suave a la posición calculada
      tabsContainer.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    });
  });

  /* ========================================
     CARRUSEL DE PROMOCIONES
     ======================================== */
  const promoCarousel = document.querySelector('.promo-carousel');
  if (promoCarousel) {
    const track = promoCarousel.querySelector('.promo-carousel__track');
    const prevBtn = promoCarousel.querySelector('[data-carousel="prev"]');
    const nextBtn = promoCarousel.querySelector('[data-carousel="next"]');
    const dotsContainer = promoCarousel.querySelector('.promo-carousel__dots');
    const promotionsCards = document.querySelectorAll('#promociones .product-card');
    let slides = [];
    let dots = [];
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = motionQuery.matches;
    let currentSlide = 0;
    let autoTimer = null;
    const autoDelay = 4000;

    const buildCarouselFromPromos = () => {
      if (!track) return;
      track.innerHTML = '';
      if (dotsContainer) dotsContainer.innerHTML = '';

      const promosData = Array.from(promotionsCards).map(card => {
        const imageEl = card.querySelector('.product-card__image img');
        const titleEl = card.querySelector('.product-card__title');
        const descEl = card.querySelector('.product-card__desc');

        if (!imageEl || !titleEl || !descEl) {
          return null;
        }

        return {
          imgSrc: imageEl.getAttribute('src') || '',
          imgAlt: imageEl.getAttribute('alt') || titleEl.textContent || 'Promoción Hongfa',
          title: titleEl.textContent || '',
          description: descEl.textContent || ''
        };
      }).filter(Boolean);

      promosData.forEach((promo, index) => {
        const slide = document.createElement('article');
        slide.className = 'promo-carousel__slide';
        slide.setAttribute('role', 'group');
        slide.setAttribute('aria-roledescription', 'slide');
        slide.setAttribute('aria-label', `${index + 1} de ${promosData.length}`);
        if (index === 0) slide.classList.add('is-active');

        const img = document.createElement('img');
        img.src = promo.imgSrc;
        img.alt = promo.imgAlt;

        const caption = document.createElement('div');
        caption.className = 'promo-carousel__caption';

        const heading = document.createElement('h3');
        heading.textContent = promo.title;

        const text = document.createElement('p');
        text.textContent = promo.description;

        caption.appendChild(heading);
        caption.appendChild(text);
        slide.appendChild(img);
        slide.appendChild(caption);
        track.appendChild(slide);

        if (dotsContainer) {
          const dot = document.createElement('button');
          dot.className = 'promo-carousel__dot';
          dot.type = 'button';
          dot.setAttribute('aria-label', `Ver promoción ${index + 1}`);
          dot.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
          if (index === 0) dot.classList.add('is-active');
          dotsContainer.appendChild(dot);
        }
      });

      slides = Array.from(track.children);
      dots = dotsContainer ? Array.from(dotsContainer.children) : [];
    };

    buildCarouselFromPromos();

    if (!track || !slides.length) {
      if (prevBtn) prevBtn.setAttribute('hidden', 'true');
      if (nextBtn) nextBtn.setAttribute('hidden', 'true');
      if (dotsContainer) dotsContainer.setAttribute('hidden', 'true');
      return;
    }

    const hasMultipleSlides = slides.length > 1;

    if (!hasMultipleSlides) {
      if (prevBtn) prevBtn.setAttribute('hidden', 'true');
      if (nextBtn) nextBtn.setAttribute('hidden', 'true');
      if (dotsContainer) dotsContainer.setAttribute('hidden', 'true');
    } else {
      if (prevBtn) prevBtn.removeAttribute('hidden');
      if (nextBtn) nextBtn.removeAttribute('hidden');
      if (dotsContainer) dotsContainer.removeAttribute('hidden');
    }

    const updateCarousel = (nextIndex, { animate = true } = {}) => {
      if (!track || !slides.length) return;
      currentSlide = (nextIndex + slides.length) % slides.length;
      const offset = -currentSlide * 100;
      if (!animate) {
        track.style.transition = 'none';
      } else if (track.style.transition === 'none') {
        track.style.transition = '';
      }
      track.style.transform = `translateX(${offset}%)`;
      slides.forEach((slide, idx) => slide.classList.toggle('is-active', idx === currentSlide));
      dots.forEach((dot, idx) => {
        const isActive = idx === currentSlide;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-pressed', String(isActive));
      });
    };

    const stopAuto = () => {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    };

    const startAuto = () => {
      if (prefersReducedMotion || slides.length < 2) return;
      stopAuto();
      autoTimer = setInterval(() => {
        updateCarousel(currentSlide + 1);
      }, autoDelay);
    };

    const handleMotionPreference = (event) => {
      prefersReducedMotion = event.matches;
      if (prefersReducedMotion) {
        stopAuto();
      } else {
        startAuto();
      }
    };

    if (typeof motionQuery.addEventListener === 'function') {
      motionQuery.addEventListener('change', handleMotionPreference);
    } else if (typeof motionQuery.addListener === 'function') {
      motionQuery.addListener(handleMotionPreference);
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        updateCarousel(currentSlide - 1);
        startAuto();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        updateCarousel(currentSlide + 1);
        startAuto();
      });
    }

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        updateCarousel(idx);
        startAuto();
      });
    });

    let isPointerDown = false;
    let startX = 0;
    let deltaX = 0;

    const handlePointerDown = (event) => {
      if (!track) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      isPointerDown = true;
      startX = event.clientX;
      deltaX = 0;
      track.style.transition = 'none';
      track.classList.add('is-dragging');
      stopAuto();
      if (typeof track.setPointerCapture === 'function') {
        track.setPointerCapture(event.pointerId);
      }
    };

    const handlePointerMove = (event) => {
      if (!isPointerDown || !track) return;
      const currentX = event.clientX;
      deltaX = currentX - startX;
      const width = promoCarousel.offsetWidth || 1;
      const offsetPercent = (-currentSlide * 100) + ((deltaX / width) * 100);
      track.style.transform = `translateX(${offsetPercent}%)`;
    };

    const handlePointerUp = (event) => {
      if (!isPointerDown || !track) return;
      isPointerDown = false;
      track.classList.remove('is-dragging');
      if (track.style.transition === 'none') {
        track.style.transition = '';
      }
      const width = promoCarousel.offsetWidth || 1;
      if (Math.abs(deltaX) > width * 0.2) {
        const direction = deltaX < 0 ? 1 : -1;
        updateCarousel(currentSlide + direction);
      } else {
        updateCarousel(currentSlide);
      }
      deltaX = 0;
      if (typeof track.releasePointerCapture === 'function' && event.pointerId !== undefined) {
        track.releasePointerCapture(event.pointerId);
      }
      startAuto();
    };

    if (track) {
      track.addEventListener('pointerdown', handlePointerDown);
      track.addEventListener('pointermove', handlePointerMove);
      track.addEventListener('pointerup', handlePointerUp);
      track.addEventListener('pointercancel', handlePointerUp);
    }

    promoCarousel.addEventListener('mouseenter', stopAuto);
    promoCarousel.addEventListener('mouseleave', startAuto);
    promoCarousel.addEventListener('focusin', stopAuto);
    promoCarousel.addEventListener('focusout', (event) => {
      if (!promoCarousel.contains(event.relatedTarget)) {
        startAuto();
      }
    });

    updateCarousel(0, { animate: false });
    startAuto();
  }

  /* ========================================
     MODAL - Ventana emergente de detalles
     ======================================== */
  // Selecciona los elementos del modal
  const modal = document.getElementById('productModal'); // Contenedor principal del modal
  const modalTitle = document.getElementById('modalTitle'); // Título del producto en el modal
  const modalDescription = document.getElementById('modalDescription'); // Descripción detallada
  const modalPortions = document.getElementById('modalPortions'); // Información de porciones
  const closeBtn = document.querySelector('.modal__close'); // Botón X para cerrar

  /* ========================================
     BOTONES DE ACCIÓN - Pedir y Detalles
     ======================================== */
  // Selecciona TODOS los botones "Pedir ahora" (pueden ser varios)
  const orderButtons = document.querySelectorAll('.order-btn');
  // Selecciona TODOS los botones "Detalles" (pueden ser varios)
  const detailsButtons = document.querySelectorAll('.details-btn');

  /* ========================================
     ABRIR MODAL CON DETALLES DEL PRODUCTO
     ======================================== */
  // Itera sobre cada botón "Detalles" y le asigna un evento click
  detailsButtons.forEach(btn => {
    btn.addEventListener('click', function (){
      // Obtiene los atributos data-* del botón clickeado
      const title = this.getAttribute('data-title'); // Nombre del producto
      const description = this.getAttribute('data-description'); // Descripción completa
      
      // Busca si el producto tiene selector de tamaño
      const card = this.closest('.product-card');
      const selectedSize = card.querySelector('input[type="radio"]:checked');
      
      let portionsText = 'Disponible en diferentes tamaños';
      
      if (selectedSize) {
        const sizeName = selectedSize.getAttribute('data-size');
        // Define las porciones según el tamaño
        let people = '';
        if (sizeName === 'Caja Entera') {
          people = 'Para 6 personas';
        } else if (sizeName === 'Media Caja') {
          people = 'Para 4 personas';
        } else if (sizeName === '1/4 Caja') {
          people = 'Para 2 personas';
        } else if (sizeName === 'Entero') {
          people = 'Para 6 personas';
        } else if (sizeName === 'Medio') {
          people = 'Para 4 personas';
        } else if (sizeName === '1 L') {
          people = 'Presentación de 1 litro';
        } else if (sizeName === '1.5 L') {
          people = 'Presentación de 1.5 litros';
        } else if (sizeName === '2.25 L') {
          people = 'Presentación de 2.25 litros';
        } else if (sizeName === '500 ml') {
          people = 'Presentación individual de 500 ml';
        } else if (sizeName === '600 ml') {
          people = 'Presentación individual de 600 ml';
        }
        if (!people) {
          people = `Presentación ${sizeName}`;
        }
        portionsText = `${sizeName} - ${people}`;
      }
      
      // Asigna los valores a los elementos del modal
      modalTitle.textContent = title;
      modalDescription.textContent = description;
      modalPortions.textContent = portionsText;
      
      // Muestra el modal agregando la clase 'show' (display:flex en CSS)
      modal.classList.add('show');
      // Previene el scroll del body mientras el modal está abierto
      document.body.style.overflow = 'hidden';
    });
  });

  /* ========================================
     CERRAR MODAL - Botón X
     ======================================== */
  // Si existe el botón de cerrar, asigna el evento click
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  /* ========================================
     CERRAR MODAL - Clic fuera del contenido
     ======================================== */
  // Si el usuario hace clic directamente en el fondo oscuro (no en el contenido)
  modal.addEventListener('click', function(e) {
    if (e.target === modal) { // Verifica que el clic fue en el fondo, no en el contenido
      closeModal();
    }
  });

  /* ========================================
     CERRAR MODAL - Tecla Escape
     ======================================== */
  // Escucha eventos de teclado en todo el documento
  document.addEventListener('keydown', function(e) {
    // Si la tecla presionada es Escape Y el modal está visible
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      closeModal();
    }
  });

  /* ========================================
     FUNCIÓN PARA CERRAR EL MODAL
     ======================================== */
  function closeModal() {
    // Remueve la clase 'show' del modal (lo oculta)
    modal.classList.remove('show');
    // Restaura el scroll del body
    document.body.style.overflow = '';
  }

  /* ========================================
     PEDIR POR WHATSAPP - Abre modal de datos
     ======================================== */
  // Itera sobre cada botón "Pedir ahora" y le asigna un evento click
  orderButtons.forEach(btn => {
    btn.addEventListener('click', function (){
      // Encuentra la tarjeta del producto
      const card = this.closest('.product-card');
      
      // Llama a la función del carrito para hacer pedido directo
      if(window.HongfaCart && window.HongfaCart.orderSingleProduct){
        window.HongfaCart.orderSingleProduct(card);
      }
    });
  });

  /* ========================================
     CAMBIO DINÁMICO DE PRECIO SEGÚN TAMAÑO
     ======================================== */
  // Selecciona todos los radio buttons de tamaño
  const sizeRadios = document.querySelectorAll('.size-selector input[type="radio"]');
  
  // Agrega evento change a cada radio button
  sizeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      // Encuentra el elemento .price más cercano (dentro de la misma tarjeta)
      const card = this.closest('.product-card');
      const priceElement = card.querySelector('.price');
      
      // Obtiene el nuevo precio del radio seleccionado
      const newPrice = this.value;
      
      // Formatea el precio con puntos de miles (estilo colombiano)
      const formattedPrice = new Intl.NumberFormat('es-CO').format(newPrice);
      
      // Actualiza el texto del precio
      priceElement.textContent = `$${formattedPrice}`;
      
      // Cambio dinámico de descripción (para promociones con data-desc-base)
      const descElement = card.querySelector('.product-card__desc');
      if (descElement && descElement.hasAttribute('data-desc-base')) {
        const descTemplate = descElement.getAttribute('data-desc-base');
        const sizeText = this.getAttribute('data-size-text') || this.getAttribute('data-size') || '';
        // Reemplaza {SIZE} en la plantilla con el texto del tamaño
        const newDesc = descTemplate.replace('{SIZE}', sizeText);
        descElement.textContent = newDesc;
      }
    });
  });

  /* ========================================
     CONTROL DE PROMOCIONES POR DÍA DE LA SEMANA
     ======================================== */
  function checkPromoAvailability() {
    // Obtener día actual (0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado)
    const today = new Date().getDay();
    
    // Seleccionar todas las promociones con restricción de días
    const promoCards = document.querySelectorAll('.promo-limited-days');
    
    promoCards.forEach(card => {
      // Obtener los días permitidos (ejemplo: "3,4" = Miércoles y Jueves)
      const allowedDays = card.getAttribute('data-promo-days').split(',').map(d => parseInt(d));
      
      // Verificar si hoy está en los días permitidos
      const isAvailable = allowedDays.includes(today);
      
      if (!isAvailable) {
        // Desactivar la promoción
        card.classList.add('promo-unavailable');
        
        // Deshabilitar todos los botones (order-btn, details-btn, hf-add-to-cart)
        const buttons = card.querySelectorAll('.btn, .order-btn, .details-btn, .hf-add-to-cart');
        buttons.forEach(btn => {
          btn.disabled = true;
          btn.style.pointerEvents = 'none';
          
          // Agregar mensaje al hacer clic
          btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            showPromoUnavailableMessage();
            return false;
          });
        });
        
        // Deshabilitar selectores de radio
        const radios = card.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => radio.disabled = true);
        
        // Prevenir clics en toda la tarjeta
        card.addEventListener('click', function(e) {
          const isButton = e.target.closest('.btn, .order-btn, .details-btn, .hf-add-to-cart');
          if (isButton) {
            e.preventDefault();
            e.stopPropagation();
            showPromoUnavailableMessage();
            return false;
          }
        });
        
      } else {
        // Activar la promoción
        card.classList.remove('promo-unavailable');
        
        // Habilitar todos los botones
        const buttons = card.querySelectorAll('.btn, .order-btn, .details-btn, .hf-add-to-cart');
        buttons.forEach(btn => {
          btn.disabled = false;
          btn.style.pointerEvents = 'auto';
        });
        
        // Habilitar selectores de radio
        const radios = card.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => radio.disabled = false);
      }
    });
  }
  
  // Función para mostrar mensaje de no disponibilidad
  function showPromoUnavailableMessage() {
    // Verificar si ya existe un toast
    const existingToast = document.querySelector('.promo-toast');
    if (existingToast) existingToast.remove();
    
    // Crear toast
    const toast = document.createElement('div');
    toast.className = 'promo-toast';
    toast.innerHTML = `
      <span class="promo-toast__icon">📅</span>
      <span class="promo-toast__message">Esta promoción solo está disponible los Miércoles y Jueves</span>
    `;
    document.body.appendChild(toast);
    
    // Mostrar con animación
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Ocultar después de 4 segundos
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
  
  // Ejecutar al cargar la página
  checkPromoAvailability();
  
  // Opcional: Revisar cada minuto por si cambia el día
  setInterval(checkPromoAvailability, 60000);

}); // Fin del DOMContentLoaded