// ============================================================
// REFERENCIAS A LA INTERFAZ
// ============================================================
const volumen = document.getElementById("volumen");
const audio = document.getElementById("audio");
const playBtn = document.getElementById("play");
const anteriorBtn = document.getElementById("anterior");
const siguienteBtn = document.getElementById("siguiente");
const barra = document.getElementById("barra");
const titulo = document.getElementById("titulo");
const muteBtn = document.getElementById("mute");
const tiempoActual = document.getElementById("tiempoActual");
const duracion = document.getElementById("duracion");
const volumenValor = document.getElementById("volumenValor");
const trackPosition = document.getElementById("trackPosition");
const artworkIndex = document.getElementById("artworkIndex");
const artwork = document.getElementById("artwork");
const favoriteBtn = document.getElementById("favorite");
const shuffleBtn = document.getElementById("shuffle");
const repeatBtn = document.getElementById("repeat");
const searchInput = document.getElementById("buscar");
const queueStatus = document.getElementById("queueStatus");
const tracks = [...document.querySelectorAll(".track")];

// ============================================================
// ESTADO Y CONFIGURACION DEL REPRODUCTOR
// ============================================================
let indice = 0;
let aleatorio = false;
let repetir = false;
// El orden de este arreglo debe coincidir con el data-index del HTML.
const canciones = [
    "musica/Devil Doesnt Bargain.mp3",
    "musica/Ghost in the Mirror.mp3",
    "musica/Mil estrellas.mp3",
    "musica/Una Vida Buena.mp3"
];
// ============================================================
// FUNCIONES DE PRESENTACION Y NAVEGACION
// ============================================================
function cargarCancion(i) {
    audio.src = canciones[i];
    titulo.textContent = tracks[i].querySelector("strong").textContent;
    trackPosition.textContent = `${String(i + 1).padStart(2, "0")} / 04`;
    artworkIndex.textContent = String(i + 1).padStart(2, "0");
    tracks.forEach((track, index) => track.classList.toggle("active", index === i));
}
function tiempo(segundos) {
    if (!Number.isFinite(segundos)) return "0:00";
    return `${Math.floor(segundos / 60)}:${String(Math.floor(segundos % 60)).padStart(2, "0")}`;
}
function actualizarEstado() {
    const reproduciendo = !audio.paused;
    playBtn.textContent = reproduciendo ? "Ⅱ" : "▶";
    playBtn.classList.toggle("playing", reproduciendo);
    artwork.classList.toggle("playing", reproduciendo);
}
function siguienteIndice() {
    if (!aleatorio) return (indice + 1) % canciones.length;
    let nuevo = indice;
    while (canciones.length > 1 && nuevo === indice) nuevo = Math.floor(Math.random() * canciones.length);
    return nuevo;
}

// Aleatorio y repetir son modos excluyentes: solo uno puede estar activo.
function actualizarModo(modo) {
    if (modo === "aleatorio") {
        aleatorio = !aleatorio;
        if (aleatorio) repetir = false;
    } else {
        repetir = !repetir;
        if (repetir) aleatorio = false;
    }

    shuffleBtn.classList.toggle("active", aleatorio);
    repeatBtn.classList.toggle("active", repetir);
    shuffleBtn.setAttribute("aria-pressed", String(aleatorio));
    repeatBtn.setAttribute("aria-pressed", String(repetir));

    if (aleatorio) queueStatus.textContent = "Modo aleatorio activado";
    else if (repetir) queueStatus.textContent = "Repitiendo esta canción";
    else queueStatus.textContent = "Reproducción continua";
}

// ============================================================
// INICIALIZACION Y CONTROLES PRINCIPALES
// ============================================================
cargarCancion(indice);
audio.volume = volumen.value / 100;
playBtn.addEventListener("click", () => { if (audio.paused) audio.play().catch(() => {}); else audio.pause(); actualizarEstado(); });
siguienteBtn.addEventListener("click", () => { indice = siguienteIndice(); cargarCancion(indice); audio.play().catch(() => {}); });
anteriorBtn.addEventListener("click", () => { indice = (indice - 1 + canciones.length) % canciones.length; cargarCancion(indice); audio.play().catch(() => {}); });
tracks.forEach((track) => track.addEventListener("click", () => { indice = Number(track.dataset.index); cargarCancion(indice); audio.play().catch(() => {}); }));
// Actualiza la barra y los tiempos mientras avanza el audio.
audio.addEventListener("timeupdate", () => { barra.value = (audio.currentTime / audio.duration) * 100 || 0; tiempoActual.textContent = tiempo(audio.currentTime); });
audio.addEventListener("loadedmetadata", () => { duracion.textContent = tiempo(audio.duration); });
audio.addEventListener("play", actualizarEstado);
audio.addEventListener("pause", actualizarEstado);
barra.addEventListener("input", () => { if (Number.isFinite(audio.duration)) audio.currentTime = (barra.value / 100) * audio.duration; });
volumen.addEventListener("input", () => { audio.volume = volumen.value / 100; volumenValor.textContent = volumen.value; audio.muted = false; muteBtn.textContent = "◖"; });
muteBtn.addEventListener("click", () => { audio.muted = !audio.muted; muteBtn.textContent = audio.muted ? "◌" : "◖"; });
// Al terminar, repetir conserva la pista; cualquier otro modo avanza.
audio.addEventListener("ended", () => { if (!repetir) { indice = siguienteIndice(); cargarCancion(indice); } audio.play().catch(() => {}); });
favoriteBtn.addEventListener("click", () => { const activo = favoriteBtn.classList.toggle("is-favorite"); favoriteBtn.textContent = activo ? "♥" : "♡"; favoriteBtn.setAttribute("aria-pressed", String(activo)); });
shuffleBtn.addEventListener("click", () => actualizarModo("aleatorio"));
repeatBtn.addEventListener("click", () => actualizarModo("repetir"));
searchInput.addEventListener("input", () => { const busqueda = searchInput.value.toLowerCase().trim(); tracks.forEach((track) => track.classList.toggle("hidden", !track.textContent.toLowerCase().includes(busqueda))); });
document.addEventListener("keydown", (event) => { if (event.target.matches("input")) return; if (event.code === "Space") { event.preventDefault(); playBtn.click(); } if (event.code === "ArrowRight") siguienteBtn.click(); if (event.code === "ArrowLeft") anteriorBtn.click(); });
