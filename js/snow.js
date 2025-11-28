// Efecto de nieve navideña SOLO en el fondo, sin overlay sobre las cartas

document.addEventListener('DOMContentLoaded', function() {
    // --- Fondo de nieve global ---
    const snowContainer = document.createElement('div');
    snowContainer.className = 'snowfall-container';
    document.body.appendChild(snowContainer);

    // Generar copos de nieve
    const SNOWFLAKE_COUNT = window.innerWidth < 600 ? 30 : 60;
    for (let i = 0; i < SNOWFLAKE_COUNT; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        // Posición horizontal aleatoria
        snowflake.style.left = Math.random() * 100 + 'vw';
        // Tamaño aleatorio
        const size = Math.random() * 6 + 6;
        snowflake.style.width = size + 'px';
        snowflake.style.height = size + 'px';
        // Opacidad y duración aleatoria
        snowflake.style.opacity = (Math.random() * 0.5 + 0.5).toFixed(2);
        // Duración más lenta: entre 14 y 44 segundos
        const duration = Math.random() * 20 + 14;
        snowflake.style.animationDuration = duration + 's';
        snowflake.style.animationDelay = (Math.random() * 8) + 's';
        snowContainer.appendChild(snowflake);
    }
});
