
// Emojis para las tarjetas
const emojis = ['🍎', '🚗', '🐶', '⚽', '🎮', '🌟', '🍕', '🚀'];

let cards = [...emojis, ...emojis];

let firstCard = null;
let secondCard = null;
let lock = false;
let startTime;
let timerInterval;

// Mezclar las tarjetas
function shuffle(array) {
    return array.sort(() => 0.5 - Math.random());
}

// Iniciar cronómetro
function startTimer() {
    startTime = Date.now();

    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        const diff = Math.floor((Date.now() - startTime) / 1000);

        document.getElementById('timer').textContent = formatTime(diff);
    }, 1000);
}

// Detener cronómetro
function stopTimer() {
    clearInterval(timerInterval);
}

// Convertir segundos a minutos y segundos
function formatTime(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');

    return `${m}:${s}`;
}

// Guardar mejor tiempo
function saveBestTime(time) {
    const best = localStorage.getItem('bestTime');

    if (best === null || time < Number(best)) {
        localStorage.setItem('bestTime', time);

        document.getElementById('bestTime').textContent = formatTime(time);
    }
}

// Preparar el juego
function setupGame() {
    const board = document.getElementById('gameBoard');

    board.innerHTML = '';

    const shuffled = shuffle([...cards]);

    shuffled.forEach((emoji, index) => {
        const div = document.createElement('div');

        div.classList.add('card');
        div.dataset.emoji = emoji;
        div.dataset.index = index;

        div.addEventListener('click', flipCard);

        board.appendChild(div);
    });

    firstCard = null;
    secondCard = null;
    lock = false;

    document.getElementById('timer').textContent = '00:00';

    startTimer();
}

// Voltear tarjetas
function flipCard(e) {
    const card = e.currentTarget;

    if (lock || card.classList.contains('flipped')) {
        return;
    }

    card.textContent = card.dataset.emoji;
    card.classList.add('flipped');

    if (!firstCard) {
        firstCard = card;
        return;
    }

    secondCard = card;
    lock = true;

    // Comprobar si las tarjetas son iguales
    if (firstCard.dataset.emoji === secondCard.dataset.emoji) {

        firstCard = null;
        secondCard = null;
        lock = false;

        // Comprobar si todas las tarjetas fueron encontradas
        if (document.querySelectorAll('.flipped').length === cards.length) {

            stopTimer();

            const time = Math.floor((Date.now() - startTime) / 1000);

            saveBestTime(time);

            setTimeout(() => {
                alert('¡Ganaste!');
            }, 300);
        }

    } else {

        // Voltear nuevamente las tarjetas diferentes
        setTimeout(() => {

            firstCard.textContent = '';
            secondCard.textContent = '';

            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');

            firstCard = null;
            secondCard = null;
            lock = false;

        }, 1000);
    }
}

// Cargar juego al abrir la página
document.addEventListener('DOMContentLoaded', () => {

    const best = localStorage.getItem('bestTime');

    if (best !== null) {
        document.getElementById('bestTime').textContent = formatTime(Number(best));
    }

    setupGame();
});

// Registro del Service Worker
if ('serviceWorker' in navigator) {

    navigator.serviceWorker.register('./sw.js')
        .then(() => console.log('Service Worker registrado'))
        .catch(err => console.error('Error SW:', err));

}

// Instalación manual de la PWA
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {

    e.preventDefault();

    deferredPrompt = e;

    const btn = document.getElementById('btnInstall');

    btn.style.display = 'inline-block';

    btn.addEventListener('click', async () => {

        if (!deferredPrompt) return;

        deferredPrompt.prompt();

        const choiceResult = await deferredPrompt.userChoice;

        console.log('Resultado de la instalación:', choiceResult.outcome);

        deferredPrompt = null;

        btn.style.display = 'none';

    });

});

