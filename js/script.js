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
     PEDIR POR WHATSAPP
     ======================================== */
  // Itera sobre cada botón "Pedir ahora" y le asigna un evento click
  orderButtons.forEach(btn => {
    btn.addEventListener('click', function (){
      // Obtiene el nombre del producto del atributo data-product
      const productName = this.getAttribute('data-product');
      
      // Verifica si el producto tiene selector de tamaño
      const sizeGroup = this.getAttribute('data-size-group');
      let sizeInfo = '';
      
      if (sizeGroup) {
        // Busca el radio button seleccionado de ese grupo
        const selectedSize = document.querySelector(`input[name="${sizeGroup}"]:checked`);
        if (selectedSize) {
          const sizeName = selectedSize.getAttribute('data-size');
          const sizePrice = selectedSize.value;
          // Formatea el precio con puntos de miles
          const formattedPrice = new Intl.NumberFormat('es-CO').format(sizePrice);
          sizeInfo = ` - ${sizeName} ($${formattedPrice})`;
        }
      }
      
      // Construye la URL de WhatsApp con el número y el mensaje predefinido
      // encodeURIComponent codifica el texto para que funcione en URLs
      const wa = 'https://wa.me/573115934823?text=' + encodeURIComponent(`Hola, quiero ordenar: ${productName}${sizeInfo}`);
      // Abre WhatsApp en una nueva pestaña/ventana
      window.open(wa, '_blank');
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
    });
  });

}); // Fin del DOMContentLoaded