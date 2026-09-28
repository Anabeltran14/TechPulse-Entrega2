// --- FUNCIONES PARA CARGAR NOTICIAS ---
// --- 1. CARGAR NOTICIAS DESTACADAS (HOME) ---

async function cargarNoticiasDestacadas() {
    try {
        const respuesta = await fetch('./data/noticias.json');
        const noticias = await respuesta.json();
        const contenedor = document.getElementById('contenedor-destacadas');
        
        if (!contenedor) return; 
        contenedor.innerHTML = '';

        const destacadas = noticias.slice(0, 3);
        destacadas.forEach(noticia => {
            contenedor.appendChild(crearTarjetaHTML(noticia));
        });
    } catch (error) {
        console.error("Error al cargar destacadas:", error);
    }
}

let todasLasNoticias = []; // Variable global para guardar las noticias cargadas
// --- 2. CARGAR CATÁLOGO Y BUSCADOR ---
async function cargarCatalogoNoticias() {
    const contenedor = document.getElementById('contenedor-catalogo');
    if (!contenedor) return; 

    try {
        const respuesta = await fetch('./data/noticias.json');
        todasLasNoticias = await respuesta.json();
        
        renderizarTarjetas(todasLasNoticias, contenedor);
        configurarFiltros(contenedor);
        configurarBuscador(contenedor); // Iniciar buscador
        
    } catch (error) {
        console.error("Error al cargar el catálogo:", error);
    }
}

function renderizarTarjetas(arregloNoticias, contenedor) {
    contenedor.innerHTML = ''; 
    if (arregloNoticias.length === 0) {
        contenedor.innerHTML = '<p class="text-gray-400 col-span-2">No se encontraron artículos con tu búsqueda.</p>';
        return;
    }
    arregloNoticias.forEach(noticia => {
        contenedor.appendChild(crearTarjetaHTML(noticia));
    });
}

function configurarFiltros(contenedor) {
    const botonesFiltro = document.querySelectorAll('.btn-filtro');
    const linksNav = document.querySelectorAll('.nav-link');
    const tituloSeccion = document.getElementById('titulo-seccion');
    const buscador = document.getElementById('buscador');

    function aplicarFiltro(categoria) {
        // Limpiar el buscador si seleccionamos una categoría
        if (buscador) buscador.value = '';

        // Actualizar colores en el menú LATERAL
        botonesFiltro.forEach(btn => {
            if(btn.getAttribute('data-categoria') === categoria) {
                btn.classList.add('text-techAccent', 'font-medium');
                btn.classList.remove('text-gray-400');
            } else {
                btn.classList.remove('text-techAccent', 'font-medium');
                btn.classList.add('text-gray-400');
            }
        });

        // Actualizar colores en el menú SUPERIOR
        linksNav.forEach(link => {
            if(link.getAttribute('data-nav') === categoria) {
                link.classList.add('text-techAccent');
            } else {
                link.classList.remove('text-techAccent');
            }
        });

        // Cambiar título y filtrar
        tituloSeccion.textContent = categoria === 'Todas' ? 'Todas las publicaciones' : categoria;
        
        if (categoria === 'Todas') {
            renderizarTarjetas(todasLasNoticias, contenedor);
        } else {
            const noticiasFiltradas = todasLasNoticias.filter(n => n.categoria === categoria);
            renderizarTarjetas(noticiasFiltradas, contenedor);
        }
    }

    // Eventos para menú lateral
    botonesFiltro.forEach(boton => {
        boton.addEventListener('click', (e) => aplicarFiltro(e.target.getAttribute('data-categoria')));
    });

    // Eventos para menú superior
    linksNav.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Evita que la página salte al inicio
            aplicarFiltro(e.target.getAttribute('data-nav'));
        });
    });
}

function configurarBuscador(contenedor) {
    const buscador = document.getElementById('buscador');
    const tituloSeccion = document.getElementById('titulo-seccion');
    
    if(!buscador) return;

    // Escucha cada vez que el usuario escribe algo en el input
    buscador.addEventListener('input', (e) => {
        const termino = e.target.value.toLowerCase();
        
        const noticiasFiltradas = todasLasNoticias.filter(n => 
            n.titulo.toLowerCase().includes(termino) || 
            n.descripcion.toLowerCase().includes(termino)
        );
        
        renderizarTarjetas(noticiasFiltradas, contenedor);
        
        // Cambiar el título mientras se busca
        tituloSeccion.textContent = termino === '' ? 'Todas las publicaciones' : 'Resultados de búsqueda';

        // Desmarcar las categorías porque estamos usando el buscador libre
        if (termino !== '') {
            document.querySelectorAll('.btn-filtro').forEach(btn => {
                btn.classList.remove('text-techAccent', 'font-medium');
                btn.classList.add('text-gray-400');
            });
            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('text-techAccent'));
        }
    });
}
// --- 3. UTILIDAD PARA CREAR LAS TARJETAS ---
function crearTarjetaHTML(noticia) {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'bg-techCard rounded-xl overflow-hidden shadow-lg border border-gray-800 hover:border-techAccent transition duration-300 flex flex-col h-full';
    
    tarjeta.innerHTML = `
        <img src="${noticia.imagen}" alt="${noticia.titulo}" class="w-full h-48 object-cover">
        <div class="p-6 flex flex-col flex-grow">
            <span class="text-xs font-bold text-techAccent uppercase mb-2 tracking-wider">${noticia.categoria}</span>
            <h5 class="text-xl font-bold text-white mb-3 leading-snug">${noticia.titulo}</h5>
            <p class="text-gray-400 text-sm mb-6 flex-grow">${noticia.descripcion}</p>
            <div class="flex justify-between items-center mt-auto">
                <span class="text-xs text-gray-500">${noticia.fecha}</span>
                <a href="detalle.html?id=${noticia.id}" class="text-sm font-medium text-white hover:text-techAccent transition">Leer más →</a>
            </div>
        </div>
    `;
    return tarjeta;
}

// --- 4. CARGAR EL DETALLE DE LA NOTICIA ---
async function cargarDetalleNoticia() {
    const contenedor = document.getElementById('contenedor-detalle');
    if (!contenedor) return; 

    try {
        const parametros = new URLSearchParams(window.location.search);
        const idNoticia = parseInt(parametros.get('id'));

        const respuesta = await fetch('./data/noticias.json');
        const noticias = await respuesta.json();
        
        const noticia = noticias.find(n => n.id === idNoticia);

        if (!noticia) {
            contenedor.innerHTML = '<h2 class="text-2xl text-red-500">Noticia no encontrada</h2>';
            return;
        }

        const esFavorito = chequearSiEsFavorito(noticia.id);
        // Estilos rediseñados para el botón de favoritos según la maqueta
        const botonClase = esFavorito ? 'bg-yellow-900/40 text-yellow-500 border border-yellow-600/50' : 'bg-transparent border border-gray-700 text-yellow-500 hover:bg-yellow-900/20';
        const botonTexto = esFavorito ? '★ Favorito guardado' : '☆ Agregar a favoritos';

        // Construcción segura de elementos opcionales (por si otras noticias no tienen estos datos)
        const tiempoLecturaHTML = noticia.tiempoLectura ? `<span class="text-xs text-gray-500 ml-4 font-medium tracking-wide">${noticia.tiempoLectura}</span>` : '';
        const pieFotoHTML = noticia.pieFoto ? `<p class="text-center text-xs text-gray-500 mt-3 font-mono bg-gray-900/50 py-2 rounded-b-xl border-x border-b border-gray-800 -mt-10 pt-6 px-4">${noticia.pieFoto}</p>` : '';
        const fechaActualizacionHTML = noticia.fechaActualizacion ? `<span class="ml-4 pl-4 border-l border-gray-700 text-gray-500">${noticia.fechaActualizacion}</span>` : '';
        
        let citaHTML = '';
        if (noticia.citaDestacada) {
            citaHTML = `
                <blockquote class="my-10 pl-6 border-l-4 border-techAccent italic text-xl text-gray-300">
                    "${noticia.citaDestacada}"
                    ${noticia.autorCita ? `<footer class="text-sm text-gray-500 mt-4 not-italic font-mono">${noticia.autorCita}</footer>` : ''}
                </blockquote>
            `;
        }

        let tagsHTML = '';
        if (noticia.tags && noticia.tags.length > 0) {
            const etiquetas = noticia.tags.map(tag => `<span class="bg-gray-800 text-gray-400 text-xs px-3 py-1.5 rounded-full border border-gray-700 font-mono cursor-pointer hover:bg-gray-700 hover:text-white transition">${tag}</span>`).join('');
            tagsHTML = `<div class="flex flex-wrap gap-2 mb-8 mt-12">${etiquetas}</div>`;
        }

        // Variable para la URL actual para los botones de compartir
        const urlActual = window.location.href;
        const textoCompartir = encodeURIComponent(`He leído "${noticia.titulo}" en TechPulse: `);

        contenedor.innerHTML = `
            <div class="mb-8">
                <div class="flex items-center mb-4">
                    <span class="bg-techAccent text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">${noticia.categoria}</span>
                    ${tiempoLecturaHTML}
                </div>
                <h2 class="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">${noticia.titulo}</h2>
            </div>
            
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div class="flex items-center gap-3 text-sm text-gray-400">
                    <div class="w-10 h-10 bg-techAccent rounded-full flex items-center justify-center text-white font-bold">${noticia.autor.charAt(0)}</div>
                    <div class="flex flex-col md:flex-row md:items-center">
                        <span class="text-white font-medium md:mr-4">${noticia.autor}</span>
                        <div class="flex mt-1 md:mt-0 text-xs font-mono">
                            <span>${noticia.fecha}</span>
                            ${fechaActualizacionHTML}
                        </div>
                    </div>
                </div>
                <button id="btn-favorito" onclick="alternarFavorito(${noticia.id})" class="px-5 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2 ${botonClase}">
                    ${botonTexto}
                </button>
            </div>

            <div class="mb-10 relative">
                <img src="${noticia.imagen}" alt="${noticia.titulo}" class="w-full h-80 md:h-[450px] object-cover rounded-xl shadow-2xl relative z-10 border border-gray-800">
                ${pieFotoHTML}
            </div>
            
            <div class="text-gray-400 leading-loose text-lg whitespace-pre-line font-light">
                ${noticia.contenido}
            </div>

            ${citaHTML}
            ${tagsHTML}

            <!-- Sección de Compartir interactiva -->
            <div class="border-t border-gray-800 pt-8 mt-12 flex flex-col md:flex-row justify-between items-center gap-6">
                <span class="text-sm font-bold text-gray-500 tracking-wider">¿Te resultó útil? Compártelo:</span>
                <div class="flex gap-3">
                    <a href="https://twitter.com/intent/tweet?text=${textoCompartir}&url=${encodeURIComponent(urlActual)}" target="_blank" class="flex items-center gap-2 bg-transparent border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white text-xs font-medium px-4 py-2 rounded-lg transition">
                        𝕏 Twitter/X
                    </a>
                    <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(urlActual)}" target="_blank" class="flex items-center gap-2 bg-transparent border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white text-xs font-medium px-4 py-2 rounded-lg transition">
                        in LinkedIn
                    </a>
                    <button onclick="navigator.clipboard.writeText(window.location.href).then(() => alert('Enlace copiado al portapapeles!'))" class="flex items-center gap-2 bg-transparent border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white text-xs font-medium px-4 py-2 rounded-lg transition">
                        📋 Copiar enlace
                    </button>
                </div>
            </div>
        `;
    } catch (error) {
        console.error("Error al cargar el detalle:", error);
    }
}

// --- 5. FUNCIONES DE LOCALSTORAGE (FAVORITOS) ---
function obtenerFavoritos() {
    const favoritosGuardados = localStorage.getItem('techpulse_favoritos');
    return favoritosGuardados ? JSON.parse(favoritosGuardados) : [];
}

function chequearSiEsFavorito(id) {
    const favoritos = obtenerFavoritos();
    return favoritos.includes(id);
}

// Esta función se llama al hacer clic en el botón de la vista de detalle
window.alternarFavorito = function(id) {
    let favoritos = obtenerFavoritos();
    const index = favoritos.indexOf(id);
    const boton = document.getElementById('btn-favorito');

    if (index === -1) {
        favoritos.push(id);
        boton.innerHTML = '★ Guardado en favoritos';
        boton.className = 'px-4 py-2 rounded-lg text-sm font-medium transition bg-yellow-600 text-white';
    } else {
        favoritos.splice(index, 1);
        boton.innerHTML = '☆ Agregar a favoritos';
        boton.className = 'px-4 py-2 rounded-lg text-sm font-medium transition bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700';
    }
    
    // Guardamos en el navegador
    localStorage.setItem('techpulse_favoritos', JSON.stringify(favoritos));
};
// --- 6. PÁGINA DE MIS FAVORITOS ---
async function cargarPaginaFavoritos() {
    const contenedor = document.getElementById('contenedor-favoritos');
    if (!contenedor) return; 

    try {
        const respuesta = await fetch('./data/noticias.json');
        const todasLasNoticiasParaFav = await respuesta.json(); // <-- Variable arreglada
        
        const idsFavoritos = obtenerFavoritos(); 
        contenedor.innerHTML = ''; 

        if (idsFavoritos.length === 0) {
            contenedor.innerHTML = `
                <div class="col-span-full text-center py-20 bg-techCard rounded-2xl border border-gray-800">
                    <span class="text-4xl mb-4 block">⭐</span>
                    <h3 class="text-2xl font-bold text-white mb-2">Aún no tienes noticias guardadas</h3>
                    <p class="text-gray-400 mb-6">Explora nuestro catálogo y guarda los artículos que más te interesen.</p>
                    <a href="noticias.html" class="bg-techAccent hover:bg-indigo-500 text-white font-medium py-3 px-6 rounded-lg transition inline-block">Ir a noticias</a>
                </div>
            `;
            return;
        }

        const noticiasFavoritas = todasLasNoticiasParaFav.filter(noticia => idsFavoritos.includes(noticia.id));
        noticiasFavoritas.forEach(noticia => {
            contenedor.appendChild(crearTarjetaHTML(noticia));
        });
        
    } catch (error) {
        console.error("Error al cargar la página de favoritos:", error);
    }
}
// --- 7. INICIALIZADOR Y FORMULARIO DE CONTACTO ---
document.addEventListener('DOMContentLoaded', () => {
    cargarNoticiasDestacadas();
    cargarCatalogoNoticias();
    cargarDetalleNoticia(); 
    cargarPaginaFavoritos(); 
});
// --- VALIDACIÓN DEL FORMULARIO DE CONTACTO ---
document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('form-contacto');
    if (!formulario) return; // Si no estamos en contacto.html, no hace nada

    formulario.addEventListener('submit', (e) => {
        e.preventDefault(); // Evitamos que recargue la página

        const nombre = document.getElementById('nombre');
        const email = document.getElementById('email');
        const mensaje = document.getElementById('mensaje');
        
        const errorNombre = document.getElementById('error-nombre');
        const errorEmail = document.getElementById('error-email');
        const errorMensaje = document.getElementById('error-mensaje');
        const mensajeExito = document.getElementById('mensaje-exito');

        let esValido = true;

        // Validar Nombre
        if (nombre.value.trim() === '') {
            errorNombre.classList.remove('hidden');
            nombre.classList.add('border-red-500');
            esValido = false;
        } else {
            errorNombre.classList.add('hidden');
            nombre.classList.remove('border-red-500');
        }

        // Validar Correo (usando expresión regular para asegurar formato válido)
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(email.value.trim())) {
            errorEmail.classList.remove('hidden');
            email.classList.add('border-red-500');
            esValido = false;
        } else {
            errorEmail.classList.add('hidden');
            email.classList.remove('border-red-500');
        }

        // Validar Mensaje
        if (mensaje.value.trim() === '') {
            errorMensaje.classList.remove('hidden');
            mensaje.classList.add('border-red-500');
            esValido = false;
        } else {
            errorMensaje.classList.add('hidden');
            mensaje.classList.remove('border-red-500');
        }

        // Si todo es válido, mostramos el éxito
        if (esValido) {
            mensajeExito.classList.remove('hidden');
            formulario.reset(); // Limpia los campos
            
            // Ocultar el mensaje de éxito después de 5 segundos
            setTimeout(() => {
                mensajeExito.classList.add('hidden');
            }, 5000);
        } else {
            mensajeExito.classList.add('hidden');
        }
        
    });
});