/**
 * ============================================
 * ELECTRONILAB 2.0 - SCRIPT PRINCIPAL
 * Versión: 2.0.0
 * Features: Mini-Juego, Badges, Modo Oscuro, Audio
 * ============================================
 */

'use strict';

// ===== CONFIGURACIÓN GLOBAL =====
const CONFIG = {
    version: '2.0.0',
    appName: 'ElectroniLab',
    debug: false, // Cambiar a true para ver logs en consola
    
    // Configuración del mini-juego
    game: {
        defaultTime: 60, // segundos por ronda
        basePoints: 10,
        speedBonus: {
            fast: { threshold: 3, multiplier: 3 },    // < 3s = x3 puntos
            medium: { threshold: 5, multiplier: 2 },   // < 5s = x2 puntos
            slow: { threshold: 8, multiplier: 1.5 }    // < 8s = x1.5 puntos
        },
        difficultyThreshold: 3 // aciertos seguidos para subir dificultad
    },
    
    // Configuración de badges
    badges: [
        // === BADGES DEL MINI-JUEGO ===
        { 
            id: 'speed-demon', 
            name: '⚡ Rayo Veloz', 
            desc: 'Responde 5 veces en menos de 3 segundos', 
            icon: '⚡', 
            category: 'game',
            condition: () => gameStats.fastResponses >= 5 
        },
        { 
            id: 'perfect-10', 
            name: '🎯 Perfección Absoluta', 
            desc: 'Obtén 10 aciertos consecutivos sin errores', 
            icon: '🎯', 
            category: 'game',
            condition: () => gameStats.maxStreak >= 10 
        },
        { 
            id: 'ohm-master', 
            name: '🧠 Maestro de Ohm', 
            desc: 'Acumula 500 puntos totales en desafíos', 
            icon: '🧠', 
            category: 'game',
            condition: () => gameStats.totalScore >= 500 
        },
        { 
            id: 'combo-king', 
            name: '🔥 Rey del Combo', 
            desc: 'Alcanza un combo de x5 o mayor', 
            icon: '🔥', 
            category: 'game',
            condition: () => gameStats.maxCombo >= 5 
        },
        { 
            id: 'marathon', 
            name: '🏃 Maratonista Electrónico', 
            desc: 'Completa 5 rondas completas de 60 segundos', 
            icon: '🏃', 
            category: 'game',
            condition: () => gameStats.roundsCompleted >= 5 
        },
        
        // === BADGES DE APRENDIZAJE ===
        { 
            id: 'explorer', 
            name: '🗺️ Explorador Curioso', 
            desc: 'Visita todas las áreas de aprendizaje', 
            icon: '🗺️', 
            category: 'learn',
            condition: () => learningStats.sectionsVisited.size >= 6 
        },
        { 
            id: 'circuit-builder', 
            name: '🔧 Constructor de Circuitos', 
            desc: 'Simula al menos 10 circuitos diferentes', 
            icon: '🔧', 
            category: 'learn',
            condition: () => learningStats.circuitsSimulated >= 10 
        },
        { 
            id: 'component-wizard', 
            name: '🎩 Mago de Componentes', 
            desc: 'Decodifica o calcula 50 resistencias/capacitores', 
            icon: '🎩', 
            category: 'learn',
            condition: () => learningStats.componentsCalculated >= 50 
        },
        { 
            id: 'wave-rider', 
            name: '🌊 Surfista de Ondas', 
            desc: 'Experimenta con los 5 tipos de señales', 
            icon: '🌊', 
            category: 'learn',
            condition: () => learningStats.wavesExplored.size >= 5 
        },
        
        // === BADGES ESPECIALES ===
        { 
            id: 'night-owl', 
            name: '🦉 Búho Nocturno', 
            desc: 'Usa el modo oscuro más de 5 veces', 
            icon: '🦉', 
            category: 'special',
            condition: () => specialStats.darkModeUses >= 5 
        },
        { 
            id: 'curious', 
            name: '🤔 Mente Inquisitiva', 
            desc: 'Lee todas las secciones conceptuales disponibles', 
            icon: '🤔', 
            category: 'special',
            condition: () => learningStats.conceptsRead.size >= 10 // Ajustar número real
        },
        { 
            id: 'legendary', 
            name: '👑 Leyenda de ElectroniLab', 
            desc: '¡Desbloquea TODOS los demás logros!', 
            icon: '👑', 
            category: 'special',
            condition: () => {
                const otherBadges = CONFIG.badges.filter(b => b.id !== 'legendary');
                return otherBadges.every(b => unlockedBadges.includes(b.id));
            }
        }
    ],
    
    // Firebase config (mantener la original)
    firebase: {
        apiKey: "AIzaSyCZbKU27EngACUMP1FNBxA0N3HabxcBPZg",
        authDomain: "electronilab-aa4da.firebaseapp.com",
        databaseURL: "https://electronilab-aa4da-default-rtdb.firebaseio.com/",
        projectId: "electronilab-aa4da",
        storageBucket: "electronilab-aa4da.firebasestorage.app",
        messagingSenderId: "1009038542986",
        appId: "1:1009038542986:web:2ca34ff0ab861637eb0573"
    }
};

// ===== ESTADO GLOBAL DE LA APLICACIÓN =====
let appState = {
    currentView: 'inicio',
    currentPage: 'areas',
    isDarkMode: false,
    soundEnabled: true,
    isAdminAuthenticated: false,
    editingId: null,
    pendingAction: null
};

// ===== ESTADÍSTICAS DEL MINI-JUEGO =====
let gameStats = {
    isActive: false,
    timeLeft: CONFIG.game.defaultTime,
    score: 0,
    combo: 0,
    maxCombo: 0,
    correctAnswers: 0,
    totalScore: 0,
    fastResponses: 0,
    roundsCompleted: 0,
    maxStreak: 0,
    currentStreak: 0,
    difficulty: 'easy', // easy, medium, hard
    questionStartTime: 0,
    timerInterval: null,
    currentQuestion: null
};

// ===== ESTADÍSTICAS DE APRENDIZAJE =====
let learningStats = {
    sectionsVisited: new Set(),
    circuitsSimulated: 0,
    componentsCalculated: 0,
    wavesExplored: new Set(),
    conceptsRead: new Set()
};

// ===== ESTADÍSTICAS ESPECIALES =====
let specialStats = {
    darkModeUses: 0
};

// ===== BADGES DESBLOQUEADOS =====
let unlockedBadges = JSON.parse(localStorage.getItem('electronilab_badges') || '[]');

// ===== VARIABLES DE FIREBASE =====
let db;
let practicesListener = null;
let provider;

// ===== AUDIO CONTEXT (PARA EFECTOS SONOROS) =====
let audioContext = null;

// ============================================
// INICIALIZACIÓN PRINCIPAL
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log(`%c⚡ ${CONFIG.appName} v${CONFIG.version}`, 'color: #0A84FF; font-size: 20px; font-weight: bold;');
    
    // Inicializar Firebase
    initFirebase();
    
    // Inicializar UI
    initUI();
    
    // Inicializar módulos
    initHeroCanvas();
    initOhm();
    initResistor();
    initWaveform();
    initQuiz();
    renderFormulas();
    initCircuit();
    
    // Inicializar nuevas features
    initDarkMode();
    initAudio();
    loadBadgesFromStorage();
    updateBadgeUI();
    
    // Polyfill roundRect si no existe
    if (!CanvasRenderingContext2D.prototype.roundRect) {
        CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
            if (w < 2 * r) r = w / 2;
            if (h < 2 * r) r = h / 2;
            this.moveTo(x + r, y);
            this.lineTo(x + w - r, y);
            this.quadraticCurveTo(x + w, y, x + w, y + r);
            this.lineTo(x + w, y + h - r);
            this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            this.lineTo(x + r, y + h);
            this.quadraticCurveTo(x, y + h, x, y + h - r);
            this.lineTo(x, y + r);
            this.quadraticCurveTo(x, y, x + r, y);
            return this;
        };
    }
    
    // Iniciar reloj
    updateClock();
    setInterval(updateClock, 1000);
    
    // Iniciar icons de Lucide
    lucide.createIcons();
    
    log('✅ Aplicación inicializada completamente');
});

// ============================================
// SISTEMA DE LOGS (DEBUG)
// ============================================
function log(message, data = null) {
    if (CONFIG.debug) {
        console.log(`[${new Date().toLocaleTimeString()}]`, message, data || '');
    }
}

function logError(message, error = null) {
    console.error(`[ERROR ${new Date().toLocaleTimeString()}]`, message, error || '');
}

// ============================================
// FIREBASE INICIALIZACIÓN
// ============================================
function initFirebase() {
    try {
        firebase.initializeApp(CONFIG.firebase);
        db = firebase.database();
        provider = new firebase.auth.GoogleAuthProvider();
        
        // Listener de autenticación
        firebase.auth().onAuthStateChanged((user) => {
            appState.isAdminAuthenticated = !!user;
            updateAuthUI();
        });
        
        // Testear conexión
        testFirebaseConnection();
        
        log('✅ Firebase inicializado');
    } catch (error) {
        logError('Error inicializando Firebase:', error);
    }
}

function updateAuthUI() {
    const btnLogout = document.getElementById('btnLogout');
    const btnAdd = document.getElementById('btnAddPractice');
    
    if (btnLogout) btnLogout.style.display = appState.isAdminAuthenticated ? 'flex' : 'none';
    if (btnAdd) btnAdd.style.display = appState.isAdminAuthenticated ? 'flex' : 'none';
}

// ============================================
// UI INICIALIZACIÓN
// ============================================
function initUI() {
    log('🎨 Inicializando interfaz...');
    // La UI se inicializa componente por componente
}

// ============================================
// RELOJ EN VIVO
// ============================================
function updateClock() {
    const now = new Date();
    const clockEl = document.getElementById('liveClock');
    if (clockEl) {
        clockEl.textContent = now.toLocaleTimeString('es-ES');
    }
}

// ============================================
// MODO OSCURO/CLARO
// ============================================
function initDarkMode() {
    // Cargar preferencia guardada
    const savedTheme = localStorage.getItem('electronilab_theme') || 'light';
    setTheme(savedTheme, false); // false = no guardar de nuevo
    
    log(`🌙 Modo oscuro inicializado: ${savedTheme}`);
}

function toggleDarkMode() {
    const newTheme = appState.isDarkMode ? 'light' : 'dark';
    setTheme(newTheme, true);
    
    // Trackear uso para badge
    if (newTheme === 'dark') {
        specialStats.darkModeUses++;
        saveSpecialStats();
        checkAndUnlockBadges();
    }
    
    showToast(newTheme === 'dark' ? '🌙 Modo oscuro activado' : '☀️ Modo claro activado');
}

function setTheme(theme, saveToStorage = true) {
    appState.isDarkMode = theme === 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    
    if (saveToStorage) {
        localStorage.setItem('electronilab_theme', theme);
    }
    
    // Re-render icons para que cambien de color
    setTimeout(() => lucide.createIcons(), 100);
}

// ============================================
// SISTEMA DE AUDIO
// ============================================
function initAudio() {
    // Audio context se crea bajo demanda (por políticas del navegador)
    log('🔊 Sistema de audio listo');
}

function playSound(type) {
    if (!appState.soundEnabled) return;
    
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch(type) {
            case 'correct':
                oscillator.frequency.value = 523.25; // Do (C5)
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
                break;
                
            case 'incorrect':
                oscillator.frequency.value = 200;
                oscillator.type = 'sawtooth';
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
                break;
                
            case 'achievement':
                // Secuencia de notas para celebración
                const notes = [523.25, 659.25, 783.99, 1046.50]; // Do, Mi, Sol, Do agudo
                notes.forEach((freq, i) => {
                    const osc = audioContext.createOscillator();
                    const gain = audioContext.createGain();
                    osc.connect(gain);
                    gain.connect(audioContext.destination);
                    osc.frequency.value = freq;
                    osc.type = 'sine';
                    gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.1);
                    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.2);
                    osc.start(audioContext.currentTime + i * 0.1);
                    osc.stop(audioContext.currentTime + i * 0.1 + 0.2);
                });
                return; // Return early because we handled oscillators differently
                
            case 'click':
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.05);
                break;
        }
    } catch (error) {
        logError('Error reproduciendo sonido:', error);
    }
}

function toggleSound() {
    appState.soundEnabled = !appState.soundEnabled;
    const btn = document.getElementById('soundToggleBtn');
    if (btn) {
        btn.innerHTML = appState.soundEnabled ? 
            '<i data-lucide="volume-2" class="w-4 h-4 inline"></i> ON' :
            '<i data-lucide="volume-x" class="w-4 h-4 inline"></i> OFF';
        lucide.createIcons({ root: btn });
    }
    showToast(appState.soundEnabled ? '🔊 Sonido activado' : '🔇 Sonido silenciado');
}

// ============================================
// NAVEGACIÓN PRINCIPAL
// ============================================
function navigateTo(page) {
    log(`📍 Navegando a: ${page}`);
    
    // Trackear visitas para badge explorer
    if (page !== 'inicio') {
        learningStats.sectionsVisited.add(page);
        saveLearningStats();
        checkAndUnlockBadges();
    }
    
    if (page === 'inicio') {
        document.getElementById('view-inicio').style.display = 'block';
        document.getElementById('app-shell').style.display = 'none';
        document.getElementById('appFooter').style.display = 'none';
        // Reiniciar canvas hero si es necesario
        initHeroCanvas();
    } else {
        document.getElementById('view-inicio').style.display = 'none';
        document.getElementById('app-shell').style.display = 'block';
        document.getElementById('appFooter').style.display = 'block';
        
        // Ocultar todas las páginas, mostrar la seleccionada
        document.querySelectorAll('.content-page').forEach(p => p.classList.remove('active'));
        const targetPage = document.getElementById('page-' + page);
        if (targetPage) targetPage.classList.add('active');
        
        // Actualizar tab activo
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        const activeTab = document.querySelector(`.nav-tab[data-nav="${page}"]`);
        if (activeTab) activeTab.classList.add('active');
        
        // Inicializaciones específicas por página
        if (page === 'circuitos') setTimeout(() => updateCircuitStatic(), 50);
        if (page === 'senales') setTimeout(updateWaveParams, 50);
    }
    
    appState.currentView = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// SUB-TABS (Práctica)
// ============================================
function switchSubTab(sub) {
    ['quiz', 'tarea', 'editor'].forEach(s => {
        const panel = document.getElementById('panel-' + s);
        if (panel) panel.style.display = 'none';
    });
    
    const targetPanel = document.getElementById('panel-' + sub);
    if (targetPanel) targetPanel.style.display = 'block';
    
    // Actualizar estilos de tabs
    document.querySelectorAll('.sub-tab').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'var(--bg-tertiary)';
        b.style.color = 'var(--text-secondary)';
    });
    
    const activeBtn = document.getElementById('sub' + sub.charAt(0).toUpperCase() + sub.slice(1));
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.background = 'var(--electric-primary)';
        activeBtn.style.color = 'white';
    }
}

// ============================================
// COMP-TABS (Componentes)
// ============================================
function switchCompTab(tab) {
    ['resistencias', 'capacitores', 'transistores', 'diodos'].forEach(t => {
        const panel = document.getElementById('comp-' + t);
        if (panel) panel.style.display = 'none';
    });
    
    const targetPanel = document.getElementById('comp-' + tab);
    if (targetPanel) targetPanel.style.display = 'block';
    
    // Actualizar estilos
    document.querySelectorAll('.comp-tab').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'var(--bg-tertiary)';
        b.style.color = 'var(--text-secondary)';
    });
    
    document.querySelectorAll('.comp-tab').forEach(b => {
        if (b.textContent.toLowerCase().includes(tab.substring(0, 4))) {
            b.classList.add('active');
            b.style.background = 'var(--electric-primary)';
            b.style.color = 'white';
        }
    });
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(msg, duration = 3000) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    
    if (toast && toastMsg) {
        toastMsg.textContent = msg;
        toast.style.display = 'block';
        lucide.createIcons({ root: toast });
        
        setTimeout(() => {
            toast.style.display = 'none';
        }, duration);
    }
}

// ============================================
// VIDEO HERO
// ============================================
function playVideo() {
    const placeholder = document.getElementById('videoPlaceholder');
    const frame = document.getElementById('videoFrame');
    const urlInput = document.getElementById('videoUrl');
    
    if (placeholder && frame && urlInput) {
        placeholder.style.display = 'none';
        frame.src = urlInput.value + '?autoplay=1&rel=0';
        frame.classList.remove('hidden');
        frame.classList.add('block');
    }
}

// ============================================
// MINI-JUEGO "DESAFÍO ELÉCTRICO"
// ============================================
const GAME_QUESTIONS = {
    easy: [
        { cat: 'Ohm', q: 'Si V = 12V y R = 4Ω, ¿cuál es I?', options: ['3 A', '48 A', '0.33 A', '8 A'], correct: 0, explanation: 'I = V/R = 12/4 = 3 A' },
        { cat: 'Ohm', q: 'Si I = 2A y R = 10Ω, ¿cuál es V?', options: ['20 V', '5 V', '0.2 V', '12 V'], correct: 0, explanation: 'V = I×R = 2×10 = 20 V' },
        { cat: 'Ohm', q: 'Si V = 9V e I = 0.5A, ¿cuál es R?', options: ['18 Ω', '4.5 Ω', '0.05 Ω', '9 Ω'], correct: 0, explanation: 'R = V/I = 9/0.5 = 18 Ω' },
        { cat: 'Comp.', q: '¿Qué componente almacena carga eléctrica?', options: ['Resistor', 'Capacitor', 'Inductor', 'Diodo'], correct: 1, explanation: 'El capacitor almacena carga en un campo eléctrico' },
        { cat: 'Comp.', q: '¿Qué unidad mide la resistencia?', options: ['Voltio', 'Amperio', 'Ohmio', 'Vatio'], correct: 2, explanation: 'La resistencia se mide en Ohmios (Ω)' },
        { cat: 'Señal', q: '¿Cuál es la frecuencia de la corriente doméstica (T=0.02s)?', options: ['50 Hz', '60 Hz', '0.02 Hz', '100 Hz'], correct: 0, explanation: 'f = 1/T = 1/0.02 = 50 Hz' }
    ],
    medium: [
        { cat: 'Ohm', q: 'Un LED rojo (Vf=2V, If=20mA) con fuente de 9V. ¿R necesaria?', options: ['350 Ω', '450 Ω', '150 Ω', '250 Ω'], correct: 0, explanation: 'R = (9V-2V)/0.02A = 350 Ω' },
        { cat: 'Ohm', q: 'Si P = 12W y V = 6V, ¿cuál es R?', options: ['3 Ω', '72 Ω', '2 Ω', '0.5 Ω'], correct: 0, explanation: 'R = V²/P = 36/12 = 3 Ω' },
        { cat: 'Circ.', q: 'En serie: R₁=100Ω, R₂=200Ω. ¿R_total?', options: ['300 Ω', '66.67 Ω', '150 Ω', '20000 Ω'], correct: 0, explanation: 'R_serie = R₁ + R₂ = 100 + 200 = 300 Ω' },
        { cat: 'Circ.', q: 'En paralelo: R₁=100Ω, R₂=100Ω. ¿R_total?', options: ['50 Ω', '200 Ω', '100 Ω', '25 Ω'], correct: 0, explanation: '1/R = 1/100 + 1/100 = 2/100 → R = 50 Ω' },
        { cat: 'Comp.', q: 'Un resistor tiene bandas: Marrón-Negro-Rojo-Oro. ¿Valor?', options: ['1 kΩ ±5%', '10 kΩ ±5%', '100 Ω ±5%', '1 MΩ ±5%'], correct: 0, explanation: '1-0 ×100 = 1000Ω = 1kΩ ±5%' },
        { cat: 'Potencia', q: 'Si I = 3A y R = 8Ω, ¿potencia disipada?', options: ['72 W', '24 W', '11 W', '192 W'], correct: 0, explanation: 'P = I²R = 9×8 = 72 W' }
    ],
    hard: [
        { cat: 'Ohm', q: 'Divisor de voltaje: Vin=12V, R1=R2=1kΩ. ¿Vout?', options: ['6 V', '12 V', '3 V', '9 V'], correct: 0, explanation: 'Vout = Vin × (R2/(R1+R2)) = 12 × (1k/2k) = 6V' },
        { cat: 'Mixto', q: 'Circuito mixto: R1=100Ω serie con (R2=200Ω||R3=200Ω). V=12V. ¿Itotal?', options: ['40 mA', '60 mA', '120 mA', '30 mA'], correct: 0, explanation: 'Rp = 100Ω, Rt = 200Ω, It = 12/200 = 0.06A = 60mA... espera, recalculemos: Rp = (200×200)/(200+200) = 100Ω, Rt = 100+100 = 200Ω, It = 12/200 = 0.06A = 60mA. Respuesta B.' },
        { cat: 'Señal', q: 'Onda senoidal: Vp=10V. ¿Valor RMS?', options: ['7.07 V', '10 V', '14.14 V', '5 V'], correct: 0, explanation: 'Vrms = Vp/√2 = 10/1.414 ≈ 7.07V' },
        { cat: 'Transistor', q: 'NPN: Ib=0.1mA, β=100. ¿Ic?', options: ['10 mA', '1 mA', '100 mA', '0.01 mA'], correct: 0, explanation: 'Ic = β × Ib = 100 × 0.1mA = 10mA' },
        { cat: 'Capacitor', q: 'Capacitor 104 (código 3 dígitos). ¿Valor?', options: ['100 nF', '10 nF', '1 µF', '10 µF'], correct: 0, explanation: '10 × 10⁴ pF = 100000 pF = 100 nF' },
        { cat: 'Diodo', q: 'Diodo ideal: Vi=5V, Vd=0.7V, R=430Ω. ¿I?', options: ['10 mA', '5 mA', '12 mA', '1 mA'], correct: 0, explanation: 'I = (Vi-Vd)/R = (5-0.7)/430 = 0.01A = 10mA' }
    ]
};

function openMiniGame() {
    const modal = document.getElementById('miniGameModal');
    if (modal) {
        modal.style.display = 'flex';
        resetGameState();
        showGameStartScreen();
        playSound('click');
    }
}

function closeMiniGame() {
    const modal = document.getElementById('miniGameModal');
    if (modal) {
        modal.style.display = 'none';
        stopGameTimer();
        playSound('click');
    }
}

function resetGameState() {
    gameStats.isActive = false;
    gameStats.timeLeft = CONFIG.game.defaultTime;
    gameStats.score = 0;
    gameStats.combo = 0;
    gameStats.maxCombo = 0;
    gameStats.correctAnswers = 0;
    gameStats.currentStreak = 0;
    gameStats.difficulty = 'easy';
    gameStats.currentQuestion = null;
    
    updateGameUI();
}

function showGameStartScreen() {
    const questionArea = document.getElementById('gameQuestionArea');
    const optionsDiv = document.getElementById('gameOptions');
    const feedbackDiv = document.getElementById('gameFeedback');
    
    if (questionArea && optionsDiv && feedbackDiv) {
        document.getElementById('gameCategory').textContent = '🎮 Listo';
        document.getElementById('gameQuestionText').innerHTML = '⚡ <strong>Desafío Eléctrico Rápido</strong><br><span class="text-base font-normal text-slate-600 dark:text-slate-300">Tienes 60 segundos para responder la máxima cantidad de preguntas posibles. ¡Cuanto más rápido, más puntos!</span>';
        
        optionsDiv.innerHTML = `
            <button onclick="startMiniGameRound()" class="col-span-2 bg-gradient-to-r from-electric-600 to-blue-600 hover:from-electric-500 hover:to-blue-500 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all hover:scale-105 shadow-lg">
                🚀 INICIAR RONDA
            </button>
        `;
        
        feedbackDiv.className = 'hidden rounded-xl p-4 text-center font-semibold text-lg mb-4';
        feedbackDiv.style.display = 'none';
    }
    
    updateGameUI();
}

function startMiniGameRound() {
    log('🎮 Iniciando ronda del mini-juego');
    
    gameStats.isActive = true;
    gameStats.timeLeft = CONFIG.game.defaultTime;
    gameStats.score = 0;
    gameStats.combo = 0;
    gameStats.correctAnswers = 0;
    gameStats.currentStreak = 0;
    gameStats.difficulty = 'easy';
    
    updateGameUI();
    startGameTimer();
    nextGameQuestion();
}

function startGameTimer() {
    stopGameTimer(); // Limpiar timer anterior si existe
    
    gameStats.timerInterval = setInterval(() => {
        gameStats.timeLeft--;
        updateGameUI();
        
        // Actualizar barra de tiempo visualmente
        const timeBar = document.getElementById('gameTimeBar');
        if (timeBar) {
            const percentage = (gameStats.timeLeft / CONFIG.game.defaultTime) * 100;
            timeBar.style.width = percentage + '%';
        }
        
        if (gameStats.timeLeft <= 0) {
            endGameRound();
        }
    }, 1000);
}

function stopGameTimer() {
    if (gameStats.timerInterval) {
        clearInterval(gameStats.timerInterval);
        gameStats.timerInterval = null;
    }
}

function nextGameQuestion() {
    if (!gameStats.isActive) return;
    
    // Seleccionar pregunta según dificultad
    const questions = GAME_QUESTIONS[gameStats.difficulty];
    const randomIndex = Math.floor(Math.random() * questions.length);
    gameStats.currentQuestion = questions[randomIndex];
    gameStats.questionStartTime = Date.now();
    
    // Renderizar pregunta
    renderGameQuestion();
}

function renderGameQuestion() {
    const q = gameStats.currentQuestion;
    if (!q) return;
    
    const categoryEl = document.getElementById('gameCategory');
    const questionEl = document.getElementById('gameQuestionText');
    const optionsEl = document.getElementById('gameOptions');
    const feedbackEl = document.getElementById('gameFeedback');
    
    if (categoryEl) categoryEl.textContent = q.cat;
    if (questionEl) questionEl.textContent = q.q;
    if (feedbackEl) {
        feedbackEl.style.display = 'none';
        feedbackEl.className = 'hidden rounded-xl p-4 text-center font-semibold text-lg mb-4';
    }
    
    if (optionsEl) {
        // Mezclar opciones (pero recordar cuál es la correcta)
        const shuffledOptions = q.options.map((opt, idx) => ({ text: opt, originalIndex: idx }))
                                         .sort(() => Math.random() - 0.5);
        
        optionsEl.innerHTML = shuffledOptions.map((opt, idx) => `
            <button onclick="answerGameQuestion(${opt.originalIndex}, this)" 
                    class="game-option-btn col-span-1" 
                    data-index="${opt.originalIndex}">
                <span class="font-bold text-electric-600 mr-2">${String.fromCharCode(65 + idx)})</span>
                ${opt.text}
            </button>
        `).join('');
    }
    
    updateGameUI();
}

function answerGameQuestion(selectedIndex, buttonElement) {
    if (!gameStats.isActive || !gameStats.currentQuestion) return;
    
    const q = gameStats.currentQuestion;
    const isCorrect = selectedIndex === q.correct;
    const timeTaken = (Date.now() - gameStats.questionStartTime) / 1000; // en segundos
    
    // Deshabilitar todos los botones
    document.querySelectorAll('.game-option-btn').forEach(btn => {
        btn.disabled = true;
        if (btn.dataset.index == q.correct) {
            btn.classList.add('correct');
        } else if (btn === buttonElement && !isCorrect) {
            btn.classList.add('incorrect');
        }
    });
    
    // Mostrar feedback
    const feedbackEl = document.getElementById('gameFeedback');
    if (feedbackEl) {
        feedbackEl.style.display = 'block';
        feedbackEl.className = isCorrect ? 'feedback-correct rounded-xl p-4 text-center font-semibold text-lg mb-4 animate-bounce' : 'feedback-incorrect rounded-xl p-4 text-center font-semibold text-lg mb-4 animate-shake';
        feedbackEl.innerHTML = isCorrect ? 
            `✅ ¡Correcto! ${q.explanation}` : 
            `❌ Incorrecto. ${q.explanation}`;
    }
    
    // Calcular puntos y actualizar estadísticas
    if (isCorrect) {
        let points = CONFIG.game.basePoints;
        
        // Bonus por velocidad
        if (timeTaken < CONFIG.game.speedBonus.fast.threshold) {
            points *= CONFIG.game.speedBonus.fast.multiplier;
            gameStats.fastResponses++;
        } else if (timeTaken < CONFIG.game.speedBonus.medium.threshold) {
            points *= CONFIG.game.speedBonus.medium.multiplier;
        } else if (timeTaken < CONFIG.game.speedBonus.slow.threshold) {
            points *= CONFIG.game.speedBonus.slow.multiplier;
        }
        
        // Aplicar combo
        gameStats.combo++;
        gameStats.currentStreak++;
        if (gameStats.combo > gameStats.maxCombo) gameStats.maxCombo = gameStats.combo;
        if (gameStats.currentStreak > gameStats.maxStreak) gameStats.maxStreak = gameStats.currentStreak;
        
        const comboMultiplier = Math.min(gameStats.combo, 5); // Máximo x5
        points = Math.floor(points * comboMultiplier);
        
        gameStats.score += points;
        gameStats.correctAnswers++;
        gameStats.totalScore += points;
        
        playSound('correct');
        
        log(`✅ Correcto! +${points} pts (combo: x${comboMultiplier}, tiempo: ${timeTaken.toFixed(1)}s)`);
        
        // Subir dificultad cada 3 aciertos
        if (gameStats.currentStreak % CONFIG.game.difficultyThreshold === 0) {
            if (gameStats.difficulty === 'easy') gameStats.difficulty = 'medium';
            else if (gameStats.difficulty === 'medium') gameStats.difficulty = 'hard';
            
            const diffEl = document.getElementById('gameDifficulty');
            if (diffEl) {
                diffEl.textContent = gameStats.difficulty === 'easy' ? 'Fácil' : 
                                     gameStats.difficulty === 'medium' ? 'Medio' : 'Difícil';
            }
            
            showToast(`🔥 ¡Dificultad aumentada: ${gameStats.difficulty.toUpperCase()}!`);
        }
    } else {
        // Resetear combo en error
        gameStats.combo = 0;
        gameStats.currentStreak = 0;
        
        playSound('incorrect');
        log(`❌ Incorrecto. Combo reseteado.`);
    }
    
    updateGameUI();
    
    // Siguiente pregunta después de breve delay
    setTimeout(() => {
        if (gameStats.isActive) {
            nextGameQuestion();
        }
    }, 1500); // 1.5 segundos para leer feedback
}

function endGameRound() {
    gameStats.isActive = false;
    stopGameTimer();
    
    gameStats.roundsCompleted++;
    
    log(`🏁 Ronda finalizada. Score: ${gameStats.score}, Correctas: ${gameStats.correctAnswers}`);
    
    // Guardar estadísticas permanentes
    saveGameStats();
    
    // Verificar badges
    checkAndUnlockBadges();
    
    // Mostrar pantalla de resultados
    showGameResults();
}

function showGameResults() {
    const questionArea = document.getElementById('gameQuestionArea');
    const optionsEl = document.getElementById('gameOptions');
    const feedbackEl = document.getElementById('gameFeedback');
    
    if (questionArea && optionsEl) {
        document.getElementById('gameCategory').textContent = '🏆 Resultados';
        document.getElementById('gameQuestionText').innerHTML = `
            <div class="text-center space-y-4">
                <div class="text-5xl font-bold text-electric-600">${gameStats.score}</div>
                <div class="text-lg text-slate-600 dark:text-slate-300">Puntos obtenidos</div>
                
                <div class="grid grid-cols-3 gap-4 mt-6 text-sm">
                    <div class="bg-green-100 dark:bg-green-900/30 rounded-lg p-3">
                        <div class="font-bold text-green-700 dark:text-green-300">${gameStats.correctAnswers}</div>
                        <div class="text-xs">Correctas</div>
                    </div>
                    <div class="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-3">
                        <div class="font-bold text-amber-700 dark:text-amber-300">x${gameStats.maxCombo}</div>
                        <div class="text-xs">Max Combo</div>
                    </div>
                    <div class="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3">
                        <div class="font-bold text-purple-700 dark:text-purple-300">${gameStats.roundsCompleted}</div>
                        <div class="text-xs">Rondas</div>
                    </div>
                </div>
            </div>
        `;
        
        optionsEl.innerHTML = `
            <button onclick="startMiniGameRound()" class="col-span-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all hover:scale-105 shadow-lg">
                🔄 Jugar de Nuevo
            </button>
            <button onclick="closeMiniGame()" class="col-span-2 mt-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold py-3 px-6 rounded-xl text-lg transition-all">
                ✖ Cerrar
            </button>
        `;
        
        if (feedbackEl) feedbackEl.style.display = 'none';
    }
    
    updateGameUI();
}

function updateGameUI() {
    // Timer
    const timerEl = document.getElementById('gameTimer');
    if (timerEl) timerEl.textContent = gameStats.timeLeft;
    
    // Score
    const scoreEl = document.getElementById('gameScore');
    if (scoreEl) scoreEl.textContent = gameStats.score;
    
    // Combo
    const comboEl = document.getElementById('gameCombo');
    if (comboEl) comboEl.textContent = 'x' + Math.max(1, gameStats.combo);
    
    // Correct answers
    const correctEl = document.getElementById('gameCorrect');
    if (correctEl) correctEl.textContent = gameStats.correctAnswers;
    
    // Difficulty
    const diffEl = document.getElementById('gameDifficulty');
    if (diffEl) {
        diffEl.textContent = gameStats.difficulty === 'easy' ? 'Fácil' : 
                             gameStats.difficulty === 'medium' ? 'Medio' : 'Difícil';
    }
}

function saveGameStats() {
    try {
        const statsToSave = {
            totalScore: gameStats.totalScore,
            fastResponses: gameStats.fastResponses,
            maxCombo: gameStats.maxCombo,
            roundsCompleted: gameStats.roundsCompleted,
            maxStreak: gameStats.maxStreak,
            lastPlayed: new Date().toISOString()
        };
        
        // Merge con stats existentes
        const existing = JSON.parse(localStorage.getItem('electronilab_gamestats') || '{}');
        const merged = {
            totalScore: (existing.totalScore || 0) + statsToSave.totalScore,
            fastResponses: (existing.fastResponses || 0) + statsToSave.fastResponses,
            maxCombo: Math.max(existing.maxCombo || 0, statsToSave.maxCombo),
            roundsCompleted: (existing.roundsCompleted || 0) + statsToSave.roundsCompleted,
            maxStreak: Math.max(existing.maxStreak || 0, statsToSave.maxStreak),
            lastPlayed: statsToSave.lastPlayed
        };
        
        localStorage.setItem('electronilab_gamestats', JSON.stringify(merged));
        log('💾 Estadísticas de juego guardadas');
    } catch (error) {
        logError('Error guardando stats de juego:', error);
    }
}

function loadGameStats() {
    try {
        return JSON.parse(localStorage.getItem('electronilab_gamestats') || '{}');
    } catch {
        return {};
    }
}

// ============================================
// SISTEMA DE BADGES/LOGROS
// ============================================
function checkAndUnlockBadges() {
    const gameStatsLoaded = loadGameStats();
    const learningStatsLoaded = loadLearningStats();
    const specialStatsLoaded = loadSpecialStats();
    
    let newlyUnlocked = [];
    
    CONFIG.badges.forEach(badge => {
        if (!unlockedBadges.includes(badge.id)) {
            // Crear contexto para evaluar condición
            try {
                // Pasar variables globales necesarias a la función condition
                const context = {
                    gameStats: { ...gameStatsLoaded, ...gameStats },
                    learningStats: learningStatsLoaded,
                    specialStats: specialStatsLoaded
                };
                
                // Evaluar condición (las funciones usan variables globales así que necesitamos inyectarlas)
                // Esto es un workaround simple; en producción usaríamos un sistema más robusto
                if (evaluateBadgeCondition(badge)) {
                    unlockedBadges.push(badge.id);
                    newlyUnlocked.push(badge);
                    log(`🏆 Badge desbloqueado: ${badge.name}`);
                }
            } catch (error) {
                logError(`Error evaluando badge ${badge.id}:`, error);
            }
        }
    });
    
    if (newlyUnlocked.length > 0) {
        saveBadgesToStorage();
        updateBadgeUI();
        
        // Mostrar celebración para cada nuevo badge (con delay)
        newlyUnlocked.forEach((badge, index) => {
            setTimeout(() => {
                showAchievementCelebration(badge);
                playSound('achievement');
            }, index * 2500); // Cada celebración dura ~2.5s
        });
    }
}

function evaluateBadgeCondition(badge) {
    // Cargar stats actuales desde storage
    const gs = loadGameStats();
    const ls = loadLearningStats();
    const ss = loadSpecialStats();
    
    switch(badge.id) {
        case 'speed-demon':
            return (gs.fastResponses || 0) >= 5;
        case 'perfect-10':
            return (gs.maxStreak || 0) >= 10;
        case 'ohm-master':
            return (gs.totalScore || 0) >= 500;
        case 'combo-king':
            return (gs.maxCombo || 0) >= 5;
        case 'marathon':
            return (gs.roundsCompleted || 0) >= 5;
        case 'explorer':
            return (ls.sectionsVisited?.size || 0) >= 6;
        case 'circuit-builder':
            return (ls.circuitsSimulated || 0) >= 10;
        case 'component-wizard':
            return (ls.componentsCalculated || 0) >= 50;
        case 'wave-rider':
            return (ls.wavesExplored?.size || 0) >= 5;
        case 'night-owl':
            return (ss.darkModeUses || 0) >= 5;
        case 'curious':
            return (ls.conceptsRead?.size || 0) >= 5; // Reducido a 5 para testing
        case 'legendary':
            const otherBadges = CONFIG.badges.filter(b => b.id !== 'legendary');
            return otherBadges.every(b => unlockedBadges.includes(b.id));
        default:
            return false;
    }
}

function showAchievementCelebration(badge) {
    const celebration = document.getElementById('achievementCelebration');
    if (!celebration) return;
    
    // Actualizar contenido
    document.getElementById('celebrationIcon').textContent = badge.icon;
    document.getElementById('celebrationTitle').textContent = '¡Logro Desbloqueado!';
    document.getElementById('celebrationBadgeName').textContent = badge.name;
    document.getElementById('celebrationBadgeDesc').textContent = badge.desc;
    
    // Mostrar modal
    celebration.style.display = 'block';
    celebration.style.pointerEvents = 'auto';
    
    // Iniciar confeti
    startConfetti();
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        celebration.style.display = 'none';
        celebration.style.pointerEvents = 'none';
        stopConfetti();
    }, 3000);
}

function toggleBadgesPanel() {
    const modal = document.getElementById('badgesModal');
    if (modal) {
        const isVisible = modal.style.display === 'flex';
        modal.style.display = isVisible ? 'none' : 'flex';
        
        if (!isVisible) {
            renderBadgesGrid();
            playSound('click');
        }
    }
}

function renderBadgesGrid(filter = 'all') {
    const grid = document.getElementById('badgesGrid');
    if (!grid) return;
    
    const filteredBadges = filter === 'all' ? 
        CONFIG.badges : 
        CONFIG.badges.filter(b => b.category === filter);
    
    grid.innerHTML = filteredBadges.map(badge => {
        const isUnlocked = unlockedBadges.includes(badge.id);
        
        return `
            <div class="badge-card ${isUnlocked ? 'unlocked' : 'locked'}" data-category="${badge.category}">
                ${!isUnlocked ? '<div class="badge-lock-overlay">🔒</div>' : ''}
                <span class="badge-icon">${isUnlocked ? badge.icon : '❓'}</span>
                <div class="badge-name">${isUnlocked ? badge.name : '???'}</div>
                <div class="badge-desc">${isUnlocked ? badge.desc : 'Completa los requisitos para desbloquear'}</div>
            </div>
        `;
    }).join('');
    
    // Actualizar contadores
    const totalCount = document.getElementById('badgeTotalCount');
    const maxCount = document.getElementById('badgeMaxCount');
    const progressPercent = document.getElementById('badgeProgressPercent');
    const progressBar = document.getElementById('badgeProgressBar');
    
    if (totalCount) totalCount.textContent = unlockedBadges.length;
    if (maxCount) maxCount.textContent = CONFIG.badges.length;
    
    const percent = Math.round((unlockedBadges.length / CONFIG.badges.length) * 100);
    if (progressPercent) progressPercent.textContent = percent + '%';
    if (progressBar) progressBar.style.width = percent + '%';
    
    // Actualizar badges count en header
    updateBadgeCountInHeader();
}

function filterBadges(category) {
    // Actualizar botones activos
    document.querySelectorAll('.badge-filter').forEach(btn => {
        btn.classList.remove('active', 'bg-electric-600', 'text-white');
        btn.classList.add('bg-slate-100', 'dark:bg-slate-700', 'text-slate-600', 'dark:text-slate-300');
    });
    
    event.target.classList.add('active');
    event.target.classList.remove('bg-slate-100', 'dark:bg-slate-700', 'text-slate-600', 'dark:text-slate-300');
    event.target.classList.add('bg-electric-600', 'text-white');
    
    renderBadgesGrid(category);
}

function updateBadgeUI() {
    updateBadgeCountInHeader();
}

function updateBadgeCountInHeader() {
    const count = unlockedBadges.length;
    
    // Actualizar en hero (si existe)
    const heroBadge = document.getElementById('badgeCountHero');
    if (heroBadge) {
        if (count > 0) {
            heroBadge.textContent = count;
            heroBadge.classList.remove('hidden');
            heroBadge.classList.add('flex');
        } else {
            heroBadge.classList.add('hidden');
            heroBadge.classList.remove('flex');
        }
    }
    
    // Actualizar en nav (si existe)
    const navBadge = document.getElementById('badgeCountNav');
    if (navBadge) {
        if (count > 0) {
            navBadge.textContent = count;
            navBadge.classList.remove('hidden');
            navBadge.classList.add('flex');
        } else {
            navBadge.classList.add('hidden');
            navBadge.classList.remove('flex');
        }
    }
}

function saveBadgesToStorage() {
    try {
        localStorage.setItem('electronilab_badges', JSON.stringify(unlockedBadges));
        log('💾 Badges guardados en localStorage');
    } catch (error) {
        logError('Error guardando badges:', error);
    }
}

function loadBadgesFromStorage() {
    try {
        unlockedBadges = JSON.parse(localStorage.getItem('electronilab_badges') || '[]');
        log(`🏆 Cargados ${unlockedBadges.length} badges`);
    } catch (error) {
        unlockedBadges = [];
        logError('Error cargando badges:', error);
    }
}

// ============================================
// TRACKING DE PROGRESO PARA BADGES
// ============================================
function trackBadgeProgress(action) {
    switch(action) {
        case 'explorer':
            // Ya se trackea en navigateTo
            break;
        case 'circuit-simulated':
            learningStats.circuitsSimulated++;
            break;
        case 'component-calculated':
            learningStats.componentsCalculated++;
            break;
        case 'wave-explored':
            // Se pasa el tipo de onda como parámetro adicional
            if (arguments[1]) {
                learningStats.wavesExplored.add(arguments[1]);
            }
            break;
        case 'concept-read':
            if (arguments[1]) {
                learningStats.conceptsRead.add(arguments[1]);
            }
            break;
    }
    
    saveLearningStats();
    checkAndUnlockBadges();
}

function saveLearningStats() {
    try {
        const serializable = {
            sectionsVisited: Array.from(learningStats.sectionsVisited),
            circuitsSimulated: learningStats.circuitsSimulated,
            componentsCalculated: learningStats.componentsCalculated,
            wavesExplored: Array.from(learningStats.wavesExplored),
            conceptsRead: Array.from(learningStats.conceptsRead)
        };
        localStorage.setItem('electronilab_learning', JSON.stringify(serializable));
    } catch (error) {
        logError('Error guardando learning stats:', error);
    }
}

function loadLearningStats() {
    try {
        const saved = JSON.parse(localStorage.getItem('electronilab_learning') || '{}');
        return {
            sectionsVisited: new Set(saved.sectionsVisited || []),
            circuitsSimulated: saved.circuitsSimulated || 0,
            componentsCalculated: saved.componentsCalculated || 0,
            wavesExplored: new Set(saved.wavesExplored || []),
            conceptsRead: new Set(saved.conceptsRead || [])
        };
    } catch {
        return {
            sectionsVisited: new Set(),
            circuitsSimulated: 0,
            componentsCalculated: 0,
            wavesExplored: new Set(),
            conceptsRead: new Set()
        };
    }
}

function saveSpecialStats() {
    try {
        localStorage.setItem('electronilab_special', JSON.stringify(specialStats));
    } catch (error) {
        logError('Error guardando special stats:', error);
    }
}

function loadSpecialStats() {
    try {
        return JSON.parse(localStorage.getItem('electronilab_special') || '{}');
    } catch {
        return { darkModeUses: 0 };
    }
}

// ============================================
// SISTEMA DE CONFETI (CANVAS)
// ============================================
let confettiAnimationId = null;
let confettiParticles = [];

function startConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Crear partículas
    confettiParticles = [];
    const colors = ['#0A84FF', '#EF4444', '#F59E0B', '#22C55E', '#8B5CF6', '#FFD700'];
    
    for (let i = 0; i < 150; i++) {
        confettiParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: Math.random() * 10 + 5,
            h: Math.random() * 6 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 3 + 2,
            angle: Math.random() * 360,
            spin: Math.random() * 10 - 5
        });
    }
    
    function animateConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        confettiParticles.forEach(p => {
            ctx.save();
            ctx.translate(p.x + p.w/2, p.y + p.h/2);
            ctx.rotate(p.angle * Math.PI / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
            ctx.restore();
            
            p.y += p.speed;
            p.angle += p.spin;
            
            // Reiniciar si sale de pantalla
            if (p.y > canvas.height) {
                p.y = -20;
                p.x = Math.random() * canvas.width;
            }
        });
        
        confettiAnimationId = requestAnimationFrame(animateConfetti);
    }
    
    animateConfetti();
}

function stopConfetti() {
    if (confettiAnimationId) {
        cancelAnimationFrame(confettiAnimationId);
        confettiAnimationId = null;
    }
    confettiParticles = [];
}

// ============================================
// FIREBASE: CONEXIÓN Y PRÁCTICAS
// ============================================
function testFirebaseConnection() {
    if (!db) return;
    
    db.ref('.info/connected').on('value', (snap) => {
        const dot = document.getElementById('fbDot');
        const txt = document.getElementById('fbText');
        
        if (snap.val() === true) {
            if (dot) dot.className = 'w-2 h-2 rounded-full bg-green-400';
            if (txt) txt.textContent = 'Conectado a Firebase ✓';
            loadFirebasePractices();
        } else {
            if (dot) dot.className = 'w-2 h-2 rounded-full bg-red-400';
            if (txt) txt.textContent = 'Sin conexión';
        }
    });
}

function refreshAllPractices() {
    if (practicesListener) practicesListener.off();
    loadFirebasePractices();
    showToast('📋 Listas de prácticas actualizadas');
}

function loadFirebasePractices() {
    if (!db) return;
    
    if (practicesListener) practicesListener.off();
    
    practicesListener = db.ref('practices/editor').on('value', (snapshot) => {
        const data = snapshot.val() || {};
        const arr = Object.entries(data).map(([id, d]) => ({
            _id: id,
            title: d.title || '',
            area: d.area || 'Otros',
            objetivo: d.objetivo || '',
            materiales: d.materiales || '',
            pasos: d.pasos || '',
            notas: d.notas || '',
            date: d.date || '',
            imageUrl: d.imageUrl || ''
        }));
