/* ============================================
   ELECTRONILAB 2.0 - SCRIPT ESTABLE CORREGIDO
   Versión con Diagnóstico y Navegación Garantizada
   ============================================ */

'use strict';

console.log('%c⚡ ElectroniLab 2.0 - Cargando...', 'color: #0A84FF; font-size: 16px;');

/* ============================================
   CONFIGURACIÓN BÁSICA
============================================ */
const CONFIG = {
    version: '2.0.0',
    debug: true  // Cambiar a false en producción
};

/* ============================================
   VARIABLES DE ESTADO
============================================ */
let appState = {
    currentView: 'inicio',
    isDarkMode: false,
    soundEnabled: true,
    isLoaded: false
};

let heroAnimationActive = true;

/* ============================================
   INICIALIZACIÓN PRINCIPAL (DOM Ready)
============================================ */
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM Cargado - Inicializando...');
    
    try {
        // Paso 1: Inicializar UI básica
        initBasicUI();
        
        // Paso 2: Inicializar navegación
        initNavigation();
        
        // Paso 3: Inicializar features opcionales
        initOptionalFeatures();
        
        // Paso 4: Marcar como cargado
        appState.isLoaded = true;
        
        // Paso 5: Mostrar estado en debug
        updateDebugStatus('✅ Listo');
        
        console.log('%c🚀 ElectroniLab 2.0 COMPLETAMENTE CARGADO', 'color: #22C55E; font-size: 18px; font-weight: bold;');
        
        // Forzar render de icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
    } catch (error) {
        console.error('❌ ERROR CRÍTICO EN INICIALIZACIÓN:', error);
        updateDebugStatus('❌ Error: ' + error.message);
    }
});

/* ============================================
   FUNCIÓN DE NAVEGACIÓN PRINCIPAL (CORREGIDA)
============================================ */

/**
 * Navegar entre secciones - VERSIÓN ESTABLE
 * @param {string} page - Nombre de la página ('inicio', 'areas', 'ohm', etc.)
 */
function navigateTo(page) {
    console.log('🔄 Navegando a:', page);
    
    try {
        // Obtener elementos clave
        const viewInicio = document.getElementById('view-inicio');
        const appShell = document.getElementById('app-shell');
        const appFooter = document.getElementById('appFooter');
        
        if (!viewInicio || !appShell) {
            console.error('❌ No encontré view-inicio o app-shell');
            alert('Error: Estructura HTML incompleta. Recarga la página.');
            return;
        }
        
        if (page === 'inicio') {
            // Mostrar hero, ocultar contenido
            viewInicio.style.display = 'block';
            appShell.style.display = 'none';
            if (appFooter) appFooter.style.display = 'none';
            
            heroAnimationActive = true;
            
            // Reiniciar canvas si existe
            if (typeof initHeroCanvas === 'function') {
                setTimeout(initHeroCanvas, 100);
            }
            
        } else {
            // Ocultar hero, mostrar contenido
            viewInicio.style.display = 'none';
            appShell.style.display = 'block';
            if (appFooter) appFooter.style.display = 'block';
            
            heroAnimationActive = false;
            
            // Ocultar todas las páginas de contenido
            const allPages = document.querySelectorAll('.content-page');
            allPages.forEach(function(p) {
                p.classList.remove('active');
                p.style.display = 'none';
            });
            
            // Mostrar la página solicitada
            const targetPage = document.getElementById('page-' + page);
            if (targetPage) {
                targetPage.classList.add('active');
                targetPage.style.display = 'block';
                console.log('✅ Página mostrada:', page);
            } else {
                console.warn('⚠️ Página no encontrada:', page);
                // Mostrar areas por defecto si no existe
                const defaultPage = document.getElementById('page-areas');
                if (defaultPage) {
                    defaultPage.classList.add('active');
                    defaultPage.style.display = 'block';
                }
            }
            
            // Actualizar tabs de navegación
            const allTabs = document.querySelectorAll('.nav-tab');
            allTabs.forEach(function(tab) {
                tab.classList.remove('active');
            });
            
            const activeTab = document.querySelector('[data-nav="' + page + '"]');
            if (activeTab) {
                activeTab.classList.add('active');
            }
            
            // Scroll al top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        // Actualizar estado
        appState.currentView = page;
        
        // Toast de confirmación (opcional)
        // showToast('Navegando a ' + page);
        
    } catch (error) {
        console.error('❌ ERROR EN NAVIGACIÓN:', error);
        alert('Error al navegar: ' + error.message);
    }
}

/**
 * Función TEST con diagnóstico visual
 */
function testAndNavigate(page) {
    console.log('🧪 TEST: Intentando navegar a', page);
    
    // Verificar que existe la función
    if (typeof navigateTo !== 'function') {
        console.error('❌ navigateTo no existe');
        alert('Error crítico: La función de navegación no existe. Recarga la página (F5).');
        return;
    }
    
    // Verificar elementos críticos
    const checks = [
        { name: 'view-inicio', elem: document.getElementById('view-inicio') },
        { name: 'app-shell', elem: document.getElementById('app-shell') },
        { name: 'btnMainEnter', elem: document.getElementById('btnMainEnter') }
    ];
    
    let errors = [];
    checks.forEach(function(check) {
        if (!check.elem) {
            errors.push(check.name + ' NO EXISTE');
        }
    });
    
    if (errors.length > 0) {
        console.error('❌ Elementos faltantes:', errors);
        alert('Error: Faltan elementos HTML:\n' + errors.join('\n') + '\n\nVerifica que index.html esté completo.');
        return;
    }
    
    // Si todo OK, navegar
    console.log('✅ Todos los elementos existen. Navegando...');
    navigateTo(page);
}

function testNavigation() {
    testAndNavigate('areas');
}

/* ============================================
   INICIALIZACIÓN UI BÁSICA
============================================ */
function initBasicUI() {
    console.log('📦 Inicializando UI básica...');
    
    // Reloj
    updateClock();
    setInterval(updateClock, 1000);
    
    // Dark mode desde localStorage
    const savedTheme = localStorage.getItem('electronilab_theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        appState.isDarkMode = savedTheme === 'dark';
    }
}

/* ============================================
   INICIALIZACIÓN NAVEGACIÓN
============================================ */
function initNavigation() {
    console.log('🧭 Inicializando navegación...');
    
    // Agregar event listeners a botones principales
    const btnMainEnter = document.getElementById('btnMainEnter');
    if (btnMainEnter) {
        btnMainEnter.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🖱️ Click en EXPERIMENTA YA detectado');
            testAndNavigate('areas');
        });
        console.log('✅ Botón principal configurado');
    } else {
        console.warn('⚠️ Botón principal no encontrado');
    }
}

/* ============================================
   INICIALIZACIÓN FEATURES OPCIONALES
============================================ */
function initOptionalFeatures() {
    console.log('🎮 Inicializando features opcionales...');
    
    try {
        // Hero Canvas
        if (document.getElementById('heroCanvas')) {
            if (typeof initHeroCanvas === 'function') {
                initHeroCanvas();
            }
        }
        
        // Ley de Ohm
        if (typeof initOhm === 'function') {
            initOhm();
        }
        
        // Componentes
        if (typeof initResistor === 'function') {
            initResistor();
        }
        
        // Waveform
        if (typeof initWaveform === 'function') {
            initWaveform();
        }
        
        // Quiz
        if (typeof initQuiz === 'function') {
            initQuiz();
        }
        
        // KaTeX formulas
        if (typeof renderFormulas === 'function') {
            renderFormulas();
        }
        
        // Circuitos
        if (typeof initCircuit === 'function') {
            initCircuit();
        }
        
        // Badges
        if (typeof loadBadgesFromStorage === 'function') {
            loadBadgesFromStorage();
        }
        
        console.log('✅ Features opcionales inicializados');
        
    } catch (error) {
        console.warn('⚠️ Error en features opcionales (no crítico):', error);
    }
}

/* ============================================
   UTILIDADES
============================================ */

function updateClock() {
    const now = new Date();
    const clockEl = document.getElementById('liveClock');
    if (clockEl) {
        clockEl.textContent = now.toLocaleTimeString('es-ES');
    }
}

function showToast(msg, duration) {
    duration = duration || 3000;
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    
    if (toast && toastMsg) {
        toastMsg.textContent = msg;
        toast.style.display = 'block';
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons({ root: toast });
        }
        
        setTimeout(function() {
            toast.style.display = 'none';
        }, duration);
    }
}

function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function updateDebugStatus(status) {
    var debugStatus = document.getElementById('debugStatus');
    if (debugStatus) {
        debugStatus.textContent = status;
    }
}

/* ============================================
   LEY DE OHM (Funcionalidad Completa)
============================================ */
var solveFor = 'V';

function setSolveFor(val) {
    solveFor = val;
    
    document.querySelectorAll('.solve-btn').forEach(function(b) {
        b.className = 'solve-btn px-4 py-2 text-sm font-semibold rounded-lg border-2 border-slate-300 text-slate-500 bg-white';
    });
    
    var activeBtn = document.getElementById('solve' + val);
    var cls = {
        V: 'border-volt text-volt bg-red-50',
        I: 'border-amps text-amps bg-amber-50',
        R: 'border-ohms text-ohms bg-green-50'
    };
    
    if (activeBtn) {
        activeBtn.className = 'solve-btn px-4 py-2 text-sm font-semibold rounded-lg border-2 ' + cls[val];
    }
    
    updateOhm();
}

function initOhm() {
    setSolveFor('V');
}

function updateOhm() {
    var V = parseFloat(document.getElementById('rangeV').value);
    var I = parseFloat(document.getElementById('rangeI').value);
    var R = parseFloat(document.getElementById('rangeR').value);
    var P;
    
    if (solveFor === 'V') {
        V = I * R;
        P = V * I;
    } else if (solveFor === 'I') {
        I = V / R;
        P = V * I;
    } else {
        R = V / I;
        P = V * I;
    }
    
    document.getElementById('valV').textContent = V.toFixed(1) + ' V';
    document.getElementById('valI').textContent = I.toFixed(2) + ' A';
    document.getElementById('valR').textContent = R.toFixed(1) + ' Ω';
    
    var resultDiv = document.getElementById('ohmResult');
    if (resultDiv) {
        var resultText = '';
        if (solveFor === 'V') {
            resultText = 'V = I×R = ' + V.toFixed(1) + ' V';
        } else if (solveFor === 'I') {
            resultText = 'I = V/R = ' + I.toFixed(3) + ' A';
        } else {
            resultText = 'R = V/I = ' + R.toFixed(1) + ' Ω';
        }
        
        resultDiv.innerHTML = 
            '<div class="text-sm opacity-80 mb-1">Resultado</div>' +
            '<div class="font-mono text-2xl font-bold">' + resultText + '</div>' +
            '<div class="text-sm mt-2 opacity-80">P = ' + P.toFixed(2) + ' W</div>';
    }
}

/* ============================================
   VIDEO HERO
============================================ */
function playVideo() {
    var placeholder = document.getElementById('videoPlaceholder');
    var iframe = document.getElementById('videoFrame');
    var videoUrlInput = document.getElementById('videoUrl');
    
    if (!placeholder || !iframe || !videoUrlInput) return;
    
    placeholder.style.display = 'none';
    iframe.classList.remove('hidden');
    
    var videoUrl = videoUrlInput.value;
    iframe.src = videoUrl + '?autoplay=1';
    
    console.log('▶️ Video reproducido');
}

/* ============================================
   MINI-JUEGO (Versión Simplificada Funcional)
============================================ */
var gameStats = {
    isActive: false,
    timeLeft: 60,
    score: 0,
    combo: 0,
    correctAnswers: 0,
    difficulty: 'easy',
    timerInterval: null
};

const GAME_QUESTIONS = {
    easy: [
        { cat: 'Ohm', q: 'Si V=12V y R=4Ω, ¿cuál es la corriente I?', options: ['3A', '48A', '0.33A', '8A'], correct: 0, explanation: 'I = V/R = 12/4 = 3A' },
        { cat: 'Ohm', q: 'Si I=2A y R=10Ω, ¿cuál es el voltaje V?', options: ['20V', '5V', '0.2V', '12V'], correct: 0, explanation: 'V = I×R = 2×10 = 20V' },
        { cat: 'Ohm', q: '¿Unidad de resistencia?', options: ['Ohmio (Ω)', 'Voltio (V)', 'Amperio (A)', 'Vatio (W)'], correct: 0, explanation: 'El Ohmio (Ω) es la unidad de resistencia' },
        { cat: 'Comp.', q: 'Color Marrón-Negro-Rojo en resistencias:', options: ['1 kΩ', '100 Ω', '10 kΩ', '1 MΩ'], correct: 0, explanation: 'Marrón=1, Negro=0, Rojo=×100 → 1000Ω = 1kΩ' },
        { cat: 'Circ.', q: 'Dos resistencias de 100Ω en SERIE dan:', options: ['200 Ω', '100 Ω', '50 Ω', '10 kΩ'], correct: 0, explanation: 'Rs = R1 + R2 = 100 + 100 = 200Ω' }
    ],
    medium: [
        { cat: 'Comp.', q: 'LED rojo Vf=2V, If=20mA, fuente 9V. ¿Resistencia?', options: ['350 Ω', '450 Ω', '150 Ω', '250 Ω'], correct: 0, explanation: 'R = (9-2)/0.02 = 350Ω' },
        { cat: 'Circ.', q: 'Dos resistencias de 100Ω en PARALELO dan:', options: ['50 Ω', '200 Ω', '100 Ω', '25 Ω'], correct: 0, explanation: 'Rp = (100×100)/(100+100) = 50Ω' },
        { cat: 'Ohm', q: 'Si V=10V e I=2A, ¿potencia disipada?', options: ['20 W', '5 W', '100 W', '200 W'], correct: 0, explanation: 'P = V×I = 10×2 = 20W' }
    ],
    hard: [
        { cat: 'Mixto', q: 'Divisor voltaje Vin=12V, R1=R2=1kΩ. ¿Vout?', options: ['6 V', '12 V', '3 V', '9 V'], correct: 0, explanation: 'Vout = 12 × (1k/2k) = 6V' },
        { cat: 'Trans.', q: 'NPN con Ib=0.1mA y β=100. ¿Ic?', options: ['10 mA', '1 mA', '100 mA', '0.01 mA'], correct: 0, explanation: 'Ic = β×Ib = 100×0.1mA = 10mA' }
    ]
};

function openMiniGame() {
    var modal = document.getElementById('miniGameModal');
    if (modal) {
        modal.style.display = 'flex';
        showGameStartScreen();
        resetGameState();
        console.log('🎮 Mini-juego abierto');
    }
}

function closeMiniGame() {
    var modal = document.getElementById('miniGameModal');
    if (modal) {
        modal.style.display = 'none';
        stopGameTimer();
    }
}

function resetGameState() {
    gameStats = {
        isActive: false,
        timeLeft: 60,
        score: 0,
        combo: 0,
        correctAnswers: 0,
        difficulty: 'easy',
        timerInterval: null
    };
    updateGameUI();
}

function showGameStartScreen() {
    var startScreen = document.getElementById('gameStartScreen');
    var playArea = document.getElementById('gamePlayArea');
    var resultsArea = document.getElementById('gameResultsArea');
    
    if (startScreen) startScreen.style.display = 'block';
    if (playArea) playArea.style.display = 'none';
    if (resultsArea) resultsArea.style.display = 'none';
    
    updateGameUI();
}

function startMiniGameRound() {
    resetGameState();
    gameStats.isActive = true;
    
    var startScreen = document.getElementById('gameStartScreen');
    var playArea = document.getElementById('gamePlayArea');
    
    if (startScreen) startScreen.style.display = 'none';
    if (playArea) playArea.style.display = 'block';
    
    startGameTimer();
    nextGameQuestion();
    
    console.log('🚀 Ronda iniciada');
}

function startGameTimer() {
    stopGameTimer();
    
    gameStats.timerInterval = setInterval(function() {
        gameStats.timeLeft--;
        updateGameUI();
        
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
    
    var questions = GAME_QUESTIONS[gameStats.difficulty] || GAME_QUESTIONS.easy;
    if (!questions || questions.length === 0) return;
    
    var randomIndex = Math.floor(Math.random() * questions.length);
    gameStats.currentQuestion = questions[randomIndex];
    
    renderGameQuestion();
}

function renderGameQuestion() {
    if (!gameStats.currentQuestion) return;
    
    var q = gameStats.currentQuestion;
    
    var catEl = document.getElementById('gameCategory');
    var questionTextEl = document.getElementById('gameQuestionText');
    var optionsContainer = document.getElementById('gameOptions');
    
    if (catEl) catEl.textContent = q.cat;
    if (questionTextEl) questionTextEl.textContent = q.q;
    
    if (optionsContainer) {
        var html = '';
        for (var i = 0; i < q.options.length; i++) {
            html += '<button onclick="answerGameQuestion(' + i + ', this)" class="game-option-btn" data-index="' + i + '">' +
                    '<span class="font-bold mr-2">' + String.fromCharCode(65 + i) + ')</span>' +
                    q.options[i] +
                   '</button>';
        }
        optionsContainer.innerHTML = html;
    }
}

function answerGameQuestion(selectedIndex, btnElement) {
    if (!gameStats.isActive || !gameStats.currentQuestion) return;
    
    var allButtons = document.querySelectorAll('#gameOptions .game-option-btn');
    allButtons.forEach(function(btn) {
        btn.disabled = true;
    });
    
    var q = gameStats.currentQuestion;
    var isCorrect = selectedIndex === q.correct;
    
    allButtons.forEach(function(btn) {
        var idx = parseInt(btn.dataset.index);
        if (idx === q.correct) {
            btn.classList.add('selected-correct');
        }
        if (selectedIndex === idx && !isCorrect) {
            btn.classList.add('selected-incorrect');
        }
    });
    
    if (isCorrect) {
        gameStats.score += 10;
        gameStats.combo++;
        gameStats.correctAnswers++;
        console.log('✅ Correcto! +10 pts');
    } else {
        gameStats.combo = 0;
        console.log('❌ Incorrecto');
    }
    
    updateGameUI();
    
    setTimeout(function() {
        if (gameStats.isActive) {
            nextGameQuestion();
        }
    }, 1200);
}

function endGameRound() {
    gameStats.isActive = false;
    stopGameTimer();
    
    var playArea = document.getElementById('gamePlayArea');
    var resultsArea = document.getElementById('gameResultsArea');
    var finalScoreEl = document.getElementById('gameFinalScore');
    
    if (playArea) playArea.style.display = 'none';
    if (resultsArea) resultsArea.style.display = 'block';
    if (finalScoreEl) finalScoreEl.textContent = gameStats.score + ' pts';
    
    console.log('🏁 Ronda finalizada. Score:', gameStats.score);
    
    showToast('¡Ronda completada! Puntos: ' + gameStats.score);
}

function updateGameUI() {
    var timerEl = document.getElementById('gameTimer');
    var scoreEl = document.getElementById('gameScore');
    var comboEl = document.getElementById('gameCombo');
    var correctEl = document.getElementById('gameCorrect');
    var timeBarEl = document.getElementById('gameTimeBar');
    
    if (timerEl) timerEl.textContent = gameStats.timeLeft;
    if (scoreEl) scoreEl.textContent = gameStats.score;
    if (comboEl) comboEl.textContent = 'x' + (gameStats.combo + 1);
    if (correctEl) correctEl.textContent = gameStats.correctAnswers;
    if (timeBarEl) {
        var pct = (gameStats.timeLeft / 60) * 100;
        timeBarEl.style.width = pct + '%';
    }
}

/* ============================================
   BADGES (Versión Simplificada)
============================================ */
var unlockedBadges = [];

function toggleBadgesPanel() {
    var modal = document.getElementById('badgesModal');
    if (modal) {
        var isVisible = modal.style.display === 'flex';
        modal.style.display = isVisible ? 'none' : 'flex';
        console.log('🏆 Panel badges:', isVisible ? 'cerrado' : 'abierto');
    }
}

function loadBadgesFromStorage() {
    try {
        var saved = localStorage.getItem('electronilab_badges');
        if (saved) {
            unlockedBadges = JSON.parse(saved);
        }
        updateBadgeUI();
    } catch (e) {
        console.warn('⚠️ Error cargando badges:', e);
    }
}

function saveBadgesToStorage() {
    try {
        localStorage.setItem('electronilab_badges', JSON.stringify(unlockedBadges));
    } catch (e) {
        console.warn('⚠️ Error guardando badges:', e);
    }
}

function updateBadgeUI() {
    var count = unlockedBadges.length;
    var heroCount = document.getElementById('badgeCountHero');
    var navCount = document.getElementById('badgeCountNav');
    
    if (heroCount) heroCount.textContent = count;
    if (navCount) navCount.textContent = count;
}

/* ============================================
   DARK MODE
============================================ */
function toggleDarkMode() {
    var currentTheme = document.documentElement.getAttribute('data-theme');
    var newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    appState.isDarkMode = newTheme === 'dark';
    
    localStorage.setItem('electronilab_theme', newTheme);
    
    showToast(newTheme === 'dark' ? '🌙 Modo oscuro activado' : '☀️ Modo claro activado');
    
    console.log('🎨 Tema cambiado a:', newTheme);
    
    if (typeof lucide !== 'undefined') {
        setTimeout(function() {
            lucide.createIcons();
        }, 100);
    }
}

/* ============================================
   AUDIO (Versión Simplificada)
============================================ */
function playSound(type) {
    if (!appState.soundEnabled) return;
    
    try {
        var AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        
        var ctx = new AudioContext();
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        switch (type) {
            case 'correct':
                osc.frequency.value = 523.25;
                osc.type = 'sine';
                gain.gain.value = 0.2;
                break;
            case 'incorrect':
                osc.frequency.value = 200;
                osc.type = 'sawtooth';
                gain.gain.value = 0.15;
                break;
            default:
                osc.frequency.value = 800;
                osc.type = 'sine';
                gain.gain.value = 0.1;
        }
        
        osc.start(ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.stop(ctx.currentTime + 0.15);
        
    } catch (e) {
        // Silenciar errores de audio
    }
}

function toggleSound() {
    appState.soundEnabled = !appState.soundEnabled;
    
    var soundText = document.getElementById('soundText');
    var soundIcon = document.getElementById('soundIcon');
    
    if (soundText) soundText.textContent = appState.soundEnabled ? 'Sound ON' : 'Sound OFF';
    
    console.log('🔊 Sound:', appState.soundEnabled ? 'ON' : 'OFF');
}

/* ============================================
   COMPONENTES (Stubs para evitar errores)
============================================ */
function initResistor() {
    console.log('🔧 Componentes: Init resistor (stub)');
}

function resetResistorBandsAndUpdateUI() {
    console.log('🔧 Componentes: Reset bands (stub)');
}

function updateResistorUI() {}

function calcResistor() {}

function formatR(v) {
    if (isNaN(v)) return '—';
    if (v >= 1e6) return (v / 1e6).toFixed(1) + ' MΩ';
    if (v >= 1e3) return (v / 1e3).toFixed(1) + ' kΩ';
    return v + ' Ω';
}

function updateCap() {}
function updateCapQ() {}
function updateTrans() {}
function updateDiod() {}

/* ============================================
   CIRCUITOS (Stubs)
============================================ */
var cType = 'serie';
var flowType = 'convencional';
var circuitStaticValues = {};
var electronPos = 0;

function toggleFlowType() {
    flowType = flowType === 'convencional' ? 'electrones' : 'convencional';
    var label = document.getElementById('flowLabel');
    if (label) label.textContent = flowType === 'convencional' ? 'Convencional' : 'Electrones';
}

function setCircuitType(t) {
    cType = t;
    console.log('🔌 Tipo circuito:', t);
}

function updateCircuitStatic() {
    console.log('🔌 Update circuit static');
}

function initCircuit() {
    console.log('🔌 Init circuit (stub)');
}

function drawCircuitAnimation() {}

/* ============================================
   SEÑALES/WAVEFORM (Stubs)
============================================ */
var wType = 'sine', wAmp = 5, wFreq = 2, wTime = 0;

function setWaveType(t) {
    wType = t;
    console.log('📡 Wave type:', t);
}

function updateWaveParams() {
    console.log('📡 Update wave params');
}

function initWaveform() {
    console.log('📡 Init waveform (stub)');
}

/* ============================================
   QUIZ (Versión Simplificada)
============================================ */
var QQ = [
    { cat: 'Ohm', q: 'R=100Ω I=0.5A ¿V=?', o: ['25V', '50V', '100V', '200V'], c: 1, e: 'V=I×R=50V' },
    { cat: 'Comp.', q: '¿1kΩ ±5%?', o: ['M-N-R-Oro', 'M-N-N-Oro', 'R-N-M-Oro', 'M-R-N-Oro'], c: 0, e: '1-0-×100=1kΩ' },
    { cat: 'Circ.', q: 'Serie R₁=10 R₂=20 ¿RT?', o: ['6.67', '30', '200', '15'], c: 1, e: 'RT=30Ω' },
    { cat: 'Ohm', q: '¿Unidad resistencia?', o: ['Voltio', 'Amperio', 'Ohmio', 'Vatio'], c: 2, e: 'Ohmio' }
];

var cQ = 0, sc = 0, qans = false;

function initQuiz() {
    showQ();
}

function showQ() {
    if (cQ >= QQ.length) {
        var quizCard = document.getElementById('quizCard');
        var quizComplete = document.getElementById('quizComplete');
        var finalScore = document.getElementById('finalScore');
        var finalMsg = document.getElementById('finalMsg');
        
        if (quizCard) quizCard.style.display = 'none';
        if (quizComplete) quizComplete.style.display = 'block';
        if (finalScore) finalScore.textContent = sc + '/' + QQ.length;
        if (finalMsg) finalMsg.textContent = sc >= QQ.length * 0.8 ? '¡Excelente!' : '¡Buen intento!';
        return;
    }
    
    var q = QQ[cQ];
    var qNum = document.getElementById('qNum');
    var qTotal = document.getElementById('qTotal');
    var qProgress = document.getElementById('qProgress');
    var quizCategory = document.getElementById('quizCategory');
    var quizQuestion = document.getElementById('quizQuestion');
    var quizOptions = document.getElementById('quizOptions');
    var quizFeedback = document.getElementById('quizFeedback');
    var btnNext = document.getElementById('btnNext');
    var btnSkip = document.getElementById('btnSkip');
    
    if (qNum) qNum.textContent = cQ + 1;
    if (qTotal) qTotal.textContent = QQ.length;
    if (qProgress) qProgress.style.width = ((cQ + 1) / QQ.length * 100) + '%';
    if (quizCategory) quizCategory.textContent = q.cat;
    if (quizQuestion) quizQuestion.textContent = q.q;
    if (quizFeedback) quizFeedback.style.display = 'none';
    if (btnNext) btnNext.style.display = 'none';
    if (btnSkip) btnSkip.style.display = 'inline-block';
    
    qans = false;
    
    if (quizOptions) {
        quizOptions.innerHTML = q.o.map(function(o, i) {
            return '<button onclick="ansQ(' + i + ')" class="quiz-option w-full text-left px-5 py-3.5 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-700 hover:border-electric-400 hover:bg-electric-50 transition-all flex items-center gap-3">' +
                   '<span class="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">' + String.fromCharCode(65 + i) + '</span>' +
                   o + '</button>';
        }).join('');
    }
}

function ansQ(i) {
    if (qans) return;
    qans = true;
    
    var q = QQ[cQ];
    
    document.querySelectorAll('.quiz-option').forEach(function(o, j) {
        o.style.pointerEvents = 'none';
        if (j === q.c) o.classList.add('correct');
        if (i === j && j !== q.c) o.classList.add('incorrect');
    });
    
    var fb = document.getElementById('quizFeedback');
    var qScore = document.getElementById('qScore');
    var btnNext = document.getElementById('btnNext');
    var btnSkip = document.getElementById('btnSkip');
    
    if (fb) {
        fb.style.display = 'block';
        if (i === q.c) {
            sc++;
            if (qScore) qScore.textContent = sc;
            fb.className = 'mt-6 rounded-xl p-4 text-sm bg-green-50 border border-green-200 text-green-800';
            fb.innerHTML = '✅ ' + q.e;
            playSound('correct');
        } else {
            fb.className = 'mt-6 rounded-xl p-4 text-sm bg-red-50 border border-red-200 text-red-800';
            fb.innerHTML = '❌ ' + q.e;
            playSound('incorrect');
        }
    }
    
    if (btnNext) btnNext.style.display = 'inline-block';
    if (btnSkip) btnSkip.style.display = 'none';
}

function skipQuestion() {
    cQ++;
    showQ();
}

function nextQuestion() {
    cQ++;
    showQ();
}

function restartQuiz() {
    cQ = 0;
    sc = 0;
    qans = false;
    var qScore = document.getElementById('qScore');
    var quizCard = document.getElementById('quizCard');
    var quizComplete = document.getElementById('quizComplete');
    
    if (qScore) qScore.textContent = '0';
    if (quizCard) quizCard.style.display = 'block';
    if (quizComplete) quizComplete.style.display = 'none';
    
    showQ();
}

/* ============================================
   KATEX FORMULAS
============================================ */
function renderFormulas() {
    var tryRender = function() {
        if (typeof katex === 'undefined') {
            setTimeout(tryRender, 200);
            return;
        }
        
        var formulas = {
            f1: 'V = I \\cdot R',
            f2: 'I = \\dfrac{V}{R}',
            f3: 'R = \\dfrac{V}{I}',
            f4: 'P = V \\cdot I',
            f5: 'P = I^2 \\cdot R',
            f6: 'P = \\dfrac{V^2}{R}'
        };
        
        Object.keys(formulas).forEach(function(id) {
            var el = document.getElementById(id);
            if (el) {
                katex.render(formulas[id], el, { throwOnError: false });
            }
        });
    };
    
    tryRender();
}

/* ============================================
   HERO CANVAS (Versión Simplificada)
============================================ */
function initHeroCanvas() {
    var canvas = document.getElementById('heroCanvas');
    if (!canvas || !heroAnimationActive) return;
    
    console.log('🎨 Iniciando hero canvas...');
    
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    var w, h;
    
    function resize() {
        w = canvas.width = canvas.parentElement.offsetWidth;
        h = canvas.height = canvas.parentElement.offsetHeight;
    }
    
    function draw() {
        if (!heroAnimationActive) return;
        
        ctx.clearRect(0, 0, w, h);
        
        // Fondo gradiente
        var gradient = ctx.createLinearGradient(0, 0, w, h);
        gradient.addColorStop(0, '#0a1628');
        gradient.addColorStop(1, '#0f2847');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
        
        // Partículas simples
        ctx.fillStyle = 'rgba(10,132,255,0.5)';
        for (var i = 0; i < 30; i++) {
            var x = Math.random() * w;
            var y = Math.random() * h;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        requestAnimationFrame(draw);
    }
    
    resize();
    draw();
    
    window.addEventListener('resize', resize);
}

/* ============================================
   SWITCH TABS (Helper Functions)
============================================ */
function switchSubTab(sub) {
    ['quiz', 'tarea', 'editor'].forEach(function(s) {
        var panel = document.getElementById('panel-' + s);
        if (panel) panel.style.display = 'none';
    });
    
    var targetPanel = document.getElementById('panel-' + sub);
    if (targetPanel) targetPanel.style.display = 'block';
    
    document.querySelectorAll('.sub-tab').forEach(function(b) {
        b.classList.remove('active');
    });
    
    var activeBtn = document.getElementById('sub' + sub.charAt(0).toUpperCase() + sub.slice(1));
    if (activeBtn) activeBtn.classList.add('active');
}

function switchCompTab(tab) {
    ['resistencias', 'capacitores', 'transistores', 'diodos'].forEach(function(t) {
        var panel = document.getElementById('comp-' + t);
        if (panel) panel.style.display = 'none';
    });
    
    var targetPanel = document.getElementById('comp-' + tab);
    if (targetPanel) targetPanel.style.display = 'block';
    
    document.querySelectorAll('.comp-tab').forEach(function(b) {
        b.classList.remove('active');
    });
}

/* ============================================
   FIREBASE (Stubs - No bloquea si falla)
============================================ */
var db = null;
var provider = null;

try {
    // Solo inicializar si Firebase está disponible
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp({
            apiKey: "AIzaSyCZbKU27EngACUMP1FNBxA0N3HabxcBPZg",
            authDomain: "electronilab-aa4da.firebaseapp.com",
            databaseURL: "https://electronilab-aa4da-default-rtdb.firebaseio.com/",
            projectId: "electronilab-aa4da"
        });
        db = firebase.database();
        provider = new firebase.auth.GoogleAuthProvider();
        console.log('✅ Firebase inicializado');
    }
} catch (e) {
    console.warn('⚠️ Firebase no disponible (offline mode):', e.message);
}

/* ============================================
   FIN - SCRIPT CARGADO EXITOSAMENTE
============================================ */
console.log('%c✅ ElectroniLab 2.0 Script CARGADO', 'color: #22C55E; font-size: 14px;');
