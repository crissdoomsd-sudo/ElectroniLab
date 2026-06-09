/* ============================================
   ELECTRONILAB 2.0 - SCRIPT COMPLETO FINAL
   Versión con Dinamismo Total + Estructura Estable
   ============================================ */

'use strict';

console.log('%c⚡ ElectroniLab 2.0 - Cargando...', 'color: #0A84FF; font-size: 16px;');

/* ============================================
   SECCIÓN 1: CONFIGURACIÓN Y CONSTANTES
============================================ */
const CONFIG = {
    version: '2.0.0',
    debug: true,
    
    game: {
        defaultTime: 60,
        basePoints: 10,
        speedBonus: {
            fast: { threshold: 3, multiplier: 3 },
            medium: { threshold: 5, multiplier: 2 },
            slow: { threshold: 8, multiplier: 1.5 }
        },
        maxCombo: 5,
        difficultyThreshold: 3
    },
    
    badges: [
        { id: 'speed-demon', icon: '⚡', name: 'Rayo Veloz', category: 'game', description: 'Responde 5 veces en menos de 3 segundos' },
        { id: 'perfect-10', icon: '🎯', name: 'Perfección Absoluta', category: 'game', description: 'Obtén 10 aciertos consecutivos sin errores' },
        { id: 'ohm-master', icon: '🧠', name: 'Maestro de Ohm', category: 'game', description: 'Acumula 500 puntos totales en desafíos' },
        { id: 'combo-king', icon: '🔥', name: 'Rey del Combo', category: 'game', description: 'Alcanza un combo de x5 o mayor' },
        { id: 'marathon', icon: '🏃', name: 'Maratonista Electrónico', category: 'game', description: 'Completa 5 rondas completas de 60 segundos' },
        { id: 'explorer', icon: '🗺️', name: 'Explorador Curioso', category: 'learn', description: 'Visita todas las áreas de aprendizaje (6 secciones)' },
        { id: 'circuit-builder', icon: '🔧', name: 'Constructor de Circuitos', category: 'learn', description: 'Simula al menos 10 circuitos diferentes' },
        { id: 'component-wizard', icon: '🎩', name: 'Mago de Componentes', category: 'learn', description: 'Decodifica o calcula 50 resistencias/capacitores' },
        { id: 'wave-rider', icon: '🌊', name: 'Surfista de Ondas', category: 'learn', description: 'Experimenta con los 5 tipos de señales eléctricas' },
        { id: 'night-owl', icon: '🦉', name: 'Búho Nocturno', category: 'special', description: 'Usa el modo oscuro más de 5 veces' },
        { id: 'curious', icon: '🤔', name: 'Mente Inquisitiva', category: 'special', description: 'Lee todas las secciones conceptuales disponibles' },
        { id: 'legendary', icon: '👑', name: 'Leyenda de ElectroniLab', category: 'special', description: '¡Desbloquea TODOS los demás logros!' }
    ],
    
    firebase: {
        apiKey: "AIzaSyCZbKU27EngACUMP1FNBxA0N3HabxcBPZg",
        authDomain: "electronilab-aa4da.firebaseapp.com",
        databaseURL: "https://electronilab-aa4da-default-rtdb.firebaseio.com/",
        projectId: "electronilab-aa4da"
    }
};

// Banco de preguntas del mini-juego (30+ preguntas)
const GAME_QUESTIONS = {
    easy: [
        { cat: 'Ohm', q: 'Si V=12V y R=4Ω, ¿cuál es la corriente I?', options: ['3A', '48A', '0.33A', '8A'], correct: 0, explanation: 'I = V/R = 12/4 = 3A' },
        { cat: 'Ohm', q: 'Si I=2A y R=10Ω, ¿cuál es el voltaje V?', options: ['20V', '5V', '0.2V', '12V'], correct: 0, explanation: 'V = I×R = 2×10 = 20V' },
        { cat: 'Ohm', q: 'Si V=9V e I=3A, ¿cuál es la resistencia R?', options: ['3Ω', '27Ω', '0.33Ω', '12Ω'], correct: 0, explanation: 'R = V/I = 9/3 = 3Ω' },
        { cat: 'Ohm', q: '¿Cuál es la unidad de voltaje?', options: ['Voltio (V)', 'Amperio (A)', 'Ohmio (Ω)', 'Vatio (W)'], correct: 0, explanation: 'El voltio (V) es la unidad de voltaje o tensión eléctrica' },
        { cat: 'Ohm', q: '¿Cuál es la unidad de corriente?', options: ['Amperio (A)', 'Voltio (V)', 'Ohmio (Ω)', 'Henrio (H)'], correct: 0, explanation: 'El amperio (A) es la unidad de corriente eléctrica' },
        { cat: 'Ohm', q: 'En un circuito, si duplicamos el voltaje y mantenemos R constante, la corriente:', options: ['Se duplica', 'Se reduce a la mitad', 'No cambia', 'Se cuadruplica'], correct: 0, explanation: 'I = V/R, si V×2 entonces I×2 (Ley de Ohm)' },
        { cat: 'Ohm', q: 'Si V=5V y R=100Ω, ¿I?', options: ['0.05A (50mA)', '0.5A', '20A', '500mA'], correct: 0, explanation: 'I = V/R = 5/100 = 0.05A = 50mA' },
        { cat: 'Ohm', q: '¿Qué dice la Ley de Ohm?', options: ['V = I × R', 'P = V × I', 'I = V × R', 'R = V × I'], correct: 0, explanation: 'La Ley de Ohm establece que V = I × R' },
        { cat: 'Comp.', q: 'Un resistor Marrón-Negro-Rojo tiene un valor aproximado de:', options: ['1 kΩ', '100 Ω', '10 kΩ', '1 MΩ'], correct: 0, explanation: 'Marrón=1, Negro=0, Rojo=×100 → 10×100 = 1000Ω = 1kΩ' },
        { cat: 'Comp.', q: '¿Qué componente almacena energía en un campo eléctrico?', options: ['Capacitor', 'Resistor', 'Inductor', 'Diodo'], correct: 0, explanation: 'El capacitor almacena energía en forma de campo eléctrico' }
    ],
    medium: [
        { cat: 'Comp.', q: 'LED rojo Vf=2V, If=20mA, fuente 9V. ¿Resistencia limitadora?', options: ['350Ω', '450Ω', '150Ω', '250Ω'], correct: 0, explanation: 'R = (Vfuente-Vled)/I = (9-2)/0.02 = 350Ω' },
        { cat: 'Comp.', q: 'Un capacitor código "104" tiene capacitancia de:', options: ['100 nF', '10 μF', '104 pF', '1 μF'], correct: 0, explanation: '104 → 10×10^4 pF = 100000pF = 100nF' },
        { cat: 'Circ.', q: 'Dos resistencias de 100Ω en SERIE dan como resultado:', options: ['200Ω', '100Ω', '50Ω', '10kΩ'], correct: 0, explanation: 'Rs = R1+R2 = 100+100 = 200Ω' },
        { cat: 'Circ.', q: 'Dos resistencias de 100Ω en PARALELO dan:', options: ['50Ω', '200Ω', '100Ω', '25Ω'], correct: 0, explanation: 'Rp = (R1×R2)/(R1+R2) = 10000/200 = 50Ω' },
        { cat: 'Ohm', q: 'Si V=10V e I=2A, ¿potencia disipada?', options: ['20W', '5W', '100W', '200W'], correct: 0, explanation: 'P = V×I = 10×2 = 20W' },
        { cat: 'Ohm', q: 'Un resistor de 100Ω con 0.1A disipa aproximadamente:', options: ['1W', '10W', '0.1W', '100W'], correct: 0, explanation: 'P = I²R = 0.01×100 = 1W' },
        { cat: 'Comp.', q: 'El código Amarillo-Violeta-Naranja representa:', options: ['47 kΩ', '470 Ω', '4.7 MΩ', '470 kΩ'], correct: 0, explanation: 'Amarillo=4, Violeta=7, Naranja=×1000 → 47kΩ' },
        { cat: 'Comp.', q: '¿Qué tolerancia representa la banda dorada?', options: ['±5%', '±10%', '±1%', '±20%'], correct: 0, explanation: 'La banda dorada indica tolerancia de ±5%' },
        { cat: 'Circ.', q: 'Divisor voltaje Vin=10V, R1=R2=1kΩ. ¿Vout?', options: ['5V', '10V', '2.5V', '0V'], correct: 0, explanation: 'Vout = Vin×(R2/(R1+R2)) = 10×(1/2) = 5V' },
        { cat: 'Señal', q: 'Una señal senoidal de 50Hz tiene periodo de:', options: ['20 ms', '50 ms', '0.02 s', '2 s'], correct: 0, explanation: 'T = 1/f = 1/50 = 0.02s = 20ms' }
    ],
    hard: [
        { cat: 'Mixto', q: 'Divisor voltaje Vin=12V, R1=R2=1kΩ. ¿Vout en R2?', options: ['6V', '12V', '3V', '9V'], correct: 0, explanation: 'Vout = Vin×(R2/(R1+R2)) = 12×(1/2) = 6V' },
        { cat: 'Mixto', q: 'Circuito: R1=1kΩ serie con (R2=2kΩ||R3=2kΩ). V=12V. ¿Itotal?', options: ['8 mA', '4 mA', '12 mA', '6 mA'], correct: 0, explanation: 'Rp=(2k×2k)/(2k+2k)=1k. Rt=1k+1k=2k. I=12/2k=6mA' },
        { cat: 'Trans.', q: 'Transistor NPN Ib=0.1mA y β=100. ¿Corriente de colector Ic?', options: ['10 mA', '1 mA', '100 mA', '0.01 mA'], correct: 0, explanation: 'Ic = β×Ib = 100×0.1mA = 10mA' },
        { cat: 'Trans.', q: 'Si transistor NPN está en saturación, Vce es:', options: ['≈0.2V', '0.7V', 'Vcc', '12V'], correct: 0, explanation: 'En saturación, Vce(sat) ≈ 0.2V (como interruptor cerrado)' },
        { cat: 'Diodo', q: 'Diodo silicio polarizado directamente, caída típica:', options: ['≈0.7V', '0.3V', '1.5V', '0V'], correct: 0, explanation: 'Los diodos de silicio tienen Vf ≈ 0.7V en conducción directa' },
        { cat: 'Diodo', q: 'Fuente 5V, diodo (0.7V), resistor 220Ω. ¿Corriente I?', options: ['≈19.5 mA', '22.7 mA', '5 mA', '0.23 mA'], correct: 0, explanation: 'I = (5-0.7)/220 ≈ 19.5mA' },
        { cat: 'Señal', q: 'Valor RMS de señal senoidal con Vp=10V:', options: ['≈7.07V', '10V', '14.14V', '5V'], correct: 0, explanation: 'Vrms = Vp/√2 = 10/1.414 ≈ 7.07V' },
        { cat: 'Señal', q: 'Valor pico de señal AC 220V RMS:', options: ['≈311V', '220V', '156V', '440V'], correct: 0, explanation: 'Vp = Vrms×√2 = 220×1.414 ≈ 311V' },
        { cat: 'Comp.', q: 'Código SMD "472" representa:', options: ['4.7 kΩ', '47 Ω', '472 Ω', '4.72 MΩ'], correct: 0, explanation: '472 → 47×10² = 4700Ω = 4.7kΩ' },
        { cat: 'Comp.', q: 'Código SMD "4R7" representa:', options: ['4.7 Ω', '470 Ω', '47 kΩ', '4.7 MΩ'], correct: 0, explanation: '4R7 significa 4.7 ohms (R actúa como punto decimal)' }
    ]
};

/* ============================================
   SECCIÓN 2: VARIABLES DE ESTADO GLOBALES
============================================ */
let appState = {
    currentView: 'inicio',
    isDarkMode: false,
    soundEnabled: true,
    isLoaded: false
};

let heroAnimationActive = true;
let db = null;
let provider = null;
let audioContext = null;
let confettiAnimationId = null;

// Estadísticas del juego
let gameStats = {
    isActive: false,
    timeLeft: 60,
    score: 0,
    combo: 0,
    maxCombo: 0,
    correctAnswers: 0,
    totalScore: 0,
    fastResponses: 0,
    roundsCompleted: 0,
    maxStreak: 0,
    currentStreak: 0,
    difficulty: 'easy',
    questionStartTime: 0,
    timerInterval: null,
    currentQuestion: null
};

// Estadísticas de aprendizaje
let learningStats = {
    sectionsVisited: new Set(),
    circuitsSimulated: 0,
    componentsCalculated: 0,
    wavesExplored: new Set(),
    conceptsRead: new Set()
};

let specialStats = {
    darkModeUses: 0
};

let unlockedBadges = [];

/* ============================================
   SECCIÓN 3: INICIALIZACIÓN PRINCIPAL
============================================ */
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM Cargado - Inicializando sistema completo...');
    
    try {
        // Paso 1: UI básica
        initBasicUI();
        
        // Paso 2: Navegación
        initNavigation();
        
        // Paso 3: Features dinámicas completas
        initHeroCanvas();      // Canvas partículas animadas
        initOhm();             // Calculadora Ley de Ohm
        initResistor();         // Decodificador resistencias
        initWaveform();        // Osciloscopio virtual
        initQuiz();             // Cuestionario
        renderFormulas();       // Fórmulas KaTeX
        initCircuit();          // Simulador circuitos
        
        // Paso 4: Features gamificadas
        initDarkMode();
        loadBadgesFromStorage();
        updateBadgeUI();
        
        // Paso 5: Firebase (opcional, no bloquea)
        initFirebase();
        
        // Marcar como cargado
        appState.isLoaded = true;
        
        console.log('%c🚀 ElectroniLab 2.0 COMPLETAMENTE CARGADO CON DINAMISMO TOTAL', 'color: #22C55E; font-size: 18px; font-weight: bold;');
        
        // Forzar icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
    } catch (error) {
        console.error('❌ ERROR CRÍTICO:', error);
        alert('Error al inicializar: ' + error.message);
    }
});

/* ============================================
   SECCIÓN 4: FUNCIÓN DE NAVEGACIÓN PRINCIPAL (ESTABLE)
============================================ */
function navigateTo(page) {
    console.log('🔄 Navegando a:', page);
    
    try {
        const viewInicio = document.getElementById('view-inicio');
        const appShell = document.getElementById('app-shell');
        const appFooter = document.getElementById('appFooter');
        
        if (!viewInicio || !appShell) {
            console.error('❌ Elementos críticos no encontrados');
            return;
        }
        
        if (page === 'inicio') {
            viewInicio.style.display = 'block';
            appShell.style.display = 'none';
            if (appFooter) appFooter.style.display = 'none';
            
            heroAnimationActive = true;
            
            if (typeof initHeroCanvas === 'function') {
                setTimeout(initHeroCanvas, 100);
            }
            
        } else {
            viewInicio.style.display = 'none';
            appShell.style.display = 'block';
            if (appFooter) appFooter.style.display = 'block';
            
            heroAnimationActive = false;
            
            // Ocultar todas las páginas
            document.querySelectorAll('.content-page').forEach(function(p) {
                p.classList.remove('active');
                p.style.display = 'none';
            });
            
            // Mostrar página solicitada
            const targetPage = document.getElementById('page-' + page);
            if (targetPage) {
                targetPage.classList.add('active');
                targetPage.style.display = 'block';
            } else {
                // Fallback a areas
                const fallback = document.getElementById('page-areas');
                if (fallback) {
                    fallback.classList.add('active');
                    fallback.style.display = 'block';
                }
            }
            
            // Actualizar tabs
            document.querySelectorAll('.nav-tab').forEach(function(t) {
                t.classList.remove('active');
            });
            
            const activeTab = document.querySelector('[data-nav="' + page + '"]');
            if (activeTab) activeTab.classList.add('active');
            
            // Track badge explorer
            if (page !== 'inicio') {
                learningStats.sectionsVisited.add(page);
                checkAndUnlockBadges();
                
                // Inicializar específicos por página
                if (page === 'circuitos') setTimeout(updateCircuitStatic, 50);
                if (page === 'senales') setTimeout(updateWaveParams, 50);
            }
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        appState.currentView = page;
        
    } catch (error) {
        console.error('❌ Error en navegación:', error);
    }
}

/* ============================================
   SECCIÓN 5: UTILIDADES
============================================ */
function initBasicUI() {
    updateClock();
    setInterval(updateClock, 1000);
    
    const savedTheme = localStorage.getItem('electronilab_theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        appState.isDarkMode = savedTheme === 'dark';
    }
}

function initNavigation() {
    const btnMainEnter = document.getElementById('btnMainEnter');
    if (btnMainEnter) {
        btnMainEnter.addEventListener('click', function(e) {
            e.preventDefault();
            navigateTo('areas');
        });
    }
}

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

/* ============================================
   SECCIÓN 6: VIDEO HERO
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
    
    console.log('▶️ Video reproducido:', videoUrl);
}

/* ============================================
   SECCIÓN 7: HERO CANVAS (PARTÍCULAS ANIMADAS)
============================================ */
function initHeroCanvas() {
    if (!heroAnimationActive) return;
    
    var canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    
    var ctx = canvas.getContext('2d');
    var w, h, nodes = [], traces = [], electrons = [];
    
    function resize() {
        w = canvas.width = canvas.parentElement.offsetWidth;
        h = canvas.height = canvas.parentElement.offsetHeight;
        generateNetwork();
    }
    
    function generateNetwork() {
        nodes = [];
        traces = [];
        electrons = [];
        
        var cols = Math.floor(w / 70);
        var rows = Math.floor(h / 70);
        
        for (var r = 0; r < rows; r++) {
            for (var c = 0; c < cols; c++) {
                if (Math.random() > 0.3) {
                    nodes.push({ x: 50 + c * 70, y: 50 + r * 70 });
                }
            }
        }
        
        for (var i = 0; i < nodes.length; i++) {
            for (var j = i + 1; j < nodes.length; j++) {
                var dx = Math.abs(nodes[i].x - nodes[j].x);
                var dy = Math.abs(nodes[i].y - nodes[j].y);
                
                if ((dx === 70 && dy === 0) || (dx === 0 && dy === 70)) {
                    if (Math.random() > 0.35) {
                        traces.push({ from: i, to: j });
                        electrons.push({
                            trace: traces.length - 1,
                            t: Math.random(),
                            speed: 0.003 + Math.random() * 0.004
                        });
                    }
                }
            }
        }
    }
    
    function draw() {
        if (!heroAnimationActive) return;
        
        ctx.clearRect(0, 0, w, h);
        
        // Dibujar conexiones
        traces.forEach(function(tr) {
            var a = nodes[tr.from];
            var b = nodes[tr.to];
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = 'rgba(10,132,255,.12)';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
        
        // Dibujar nodos
        nodes.forEach(function(n) {
            ctx.beginPath();
            ctx.arc(n.x, n.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(10,132,255,.3)';
            ctx.fill();
        });
        
        // Dibujar electrones animados
        electrons.forEach(function(e) {
            e.t += e.speed;
            if (e.t > 1) e.t = 0;
            
            var tr = traces[e.trace];
            var a = nodes[tr.from];
            var b = nodes[tr.to];
            var x = a.x + (b.x - a.x) * e.t;
            var y = a.y + (b.y - a.y) * e.t;
            
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(100,180,255,.9)';
            ctx.fill();
        });
        
        requestAnimationFrame(draw);
    }
    
    window.addEventListener('resize', function() {
        if (heroAnimationActive) resize();
    });
    
    resize();
    draw();
    
    console.log('🎨 Hero canvas iniciado con', nodes.length, 'nodos y', electrons.length, 'electrones');
}

/* ============================================
   SECCIÓN 8: LEY DE OHM (COMPLETA)
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
    
    var inputs = { V: 'rangeV', I: 'rangeI', R: 'rangeR' };
    Object.keys(inputs).forEach(function(k) {
        var el = document.getElementById(inputs[k]);
        el.disabled = (k === val);
        el.style.opacity = (k === val) ? '0.4' : '1';
    });
    
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
        if (solveFor === 'V') resultText = 'V = I×R = ' + V.toFixed(1) + ' V';
        else if (solveFor === 'I') resultText = 'I = V/R = ' + I.toFixed(3) + ' A';
        else resultText = 'R = V/I = ' + R.toFixed(1) + ' Ω';
        
        resultDiv.innerHTML =
            '<div class="text-sm opacity-80 mb-1">Resultado</div>' +
            '<div class="font-mono text-2xl font-bold">' + resultText + '</div>' +
            '<div class="text-sm mt-2 opacity-80">P = ' + P.toFixed(2) + ' W</div>';
    }
}

/* ============================================
   SECCIÓN 9: COMPONENTES (COMPLETO CON RESISTENCIAS DE COLORES)
============================================ */
var rCols = [
    { n:'Negro', c:'#1a1a1a', v:0 }, { n:'Marrón', c:'#8B4513', v:1 }, { n:'Rojo', c:'#FF0000', v:2 },
    { n:'Naranja', c:'#FF8C00', v:3 }, { n:'Amarillo', c:'#FFD700', v:4 },
    { n:'Verde', c:'#228B22', v:5 }, { n:'Azul', c:'#0000FF', v:6 },
    { n:'Violeta', c:'#8B008B', v:7 }, { n:'Gris', c:'#808080', v:8 }, { n:'Blanco', c:'#F0F0F0', v:9 }
];

var rTols = [
    { n:'Oro', c:'#FFD700', t:5 }, { n:'Plata', c:'#C0C0C0', t:10 },
    { n:'Ninguno', c:'#D4A76A', t:20 }, { n:'1%', c:'#8B4513', t:1 }, { n:'2%', c:'#FF0000', t:2 }
];

var rBands = { 1:1, 2:0, 3:2, 4:0, m:2, t:0 };

function resetResistorBandsAndUpdateUI() {
    var type = document.getElementById('resType').value;
    
    if (type === '4') {
        rBands = { 1:1, 2:0, 3:2, 4:0, m:2, t:0 };
    } else if (type === '5') {
        rBands = { 1:1, 2:0, 3:2, 4:0, 5:0, m:3, t:0 };
    } else {
        rBands = {};
    }
    
    updateResistorUI();
}

function initResistor() {
    resetResistorBandsAndUpdateUI();
}

function updateResistorUI() {
    var type = document.getElementById('resType').value;
    var inputsDiv = document.getElementById('resInputs');
    var bodyDiv = document.getElementById('resBody');
    
    inputsDiv.innerHTML = '';
    bodyDiv.innerHTML = '';
    
    if (type === 'smd') {
        inputsDiv.innerHTML = '<input type="text" id="smdIn" placeholder="Ej: 103 o 4R7" class="form-input-easy w-full" oninput="calcResistor()">';
        bodyDiv.style.padding = '12px 16px';
        bodyDiv.innerHTML = '<span class="font-mono font-bold text-xs" id="smdBody">SMD</span>';
    } else {
        var count = parseInt(type);
        var bandIds = [];
        
        for (var i = 1; i <= count; i++) {
            var isTol = (i === count);
            var isMult = (i === count - 1);
            var label = isTol ? 'Tolerancia' : (isMult ? 'Multiplicador' : 'Banda ' + i);
            
            inputsDiv.innerHTML += '<div><label class="text-xs font-semibold text-slate-500 mb-1 block">' + label + '</label><div class="flex flex-wrap gap-1" id="rBand' + i + '"></div></div>';
            bandIds.push(i);
        }
        
        bodyDiv.style.padding = '12px 24px';
        bodyDiv.style.gap = '3px';
        
        bandIds.forEach(function(idx) {
            var el = document.createElement('div');
            el.className = 'resistor-band';
            el.id = 'rBandVisual' + idx;
            bodyDiv.appendChild(el);
        });
        
        bandIds.forEach(function(idx) {
            var isTol = (idx === count);
            var isMult = (idx === count - 1);
            var container = document.getElementById('rBand' + idx);
            var arr = isTol ? rTols : rCols;
            
            arr.forEach(function(col, i) {
                var sw = document.createElement('div');
                sw.className = 'color-swatch';
                sw.style.background = col.c;
                sw.style.width = '28px';
                sw.style.height = '28px';
                sw.title = col.n;
                sw.setAttribute('role', 'button');
                sw.setAttribute('tabindex', '0');
                sw.onclick = function() {
                    if (isTol) rBands.t = i;
                    else if (isMult) rBands.m = i;
                    else rBands[idx] = i;
                    calcResistor();
                    
                    // Track badge
                    learningStats.componentsCalculated++;
                    checkAndUnlockBadges();
                };
                container.appendChild(sw);
            });
        });
    }
    
    calcResistor();
}

function calcResistor() {
    var type = document.getElementById('resType').value;
    var resEl = document.getElementById('resistorResult');
    
    if (type === 'smd') {
        var code = document.getElementById('smdIn').value.trim();
        var val = '—';
        
        if (code.length >= 3) {
            if (code.includes('R')) {
                val = code.replace('R', '.');
            } else {
                var d = code.substring(0, code.length - 1);
                var m = code.charAt(code.length - 1);
                val = parseFloat(d) * Math.pow(10, parseInt(m));
            }
        }
        
        document.getElementById('smdBody').textContent = code;
        resEl.innerHTML = '<div class="text-sm text-ohms font-medium mb-1">Valor</div><div class="font-mono text-2xl font-bold">' + formatR(val) + '</div>';
        return;
    }
    
    var count = parseInt(type);
    var baseVal = 0;
    var multIdx = rBands.m || 0;
    var tolIdx = rBands.t || 0;
    
    if (count === 4) {
        var d1 = rBands[1] || 0;
        var d2 = rBands[2] || 0;
        baseVal = d1 * 10 + d2;
    } else if (count === 5) {
        var d1 = rBands[1] || 0;
        var d2 = rBands[2] || 0;
        var d3 = rBands[3] || 0;
        baseVal = d1 * 100 + d2 * 10 + d3;
    }
    
    var multVal = rCols[multIdx] ? Math.pow(10, multIdx) : 1;
    var finalVal = baseVal * multVal;
    var tolVal = rTols[tolIdx] ? rTols[tolIdx].t : 20;
    
    // Actualizar visuales
    for (var i = 1; i <= count; i++) {
        var vis = document.getElementById('rBandVisual' + i);
        if (vis) {
            var isTol = (i === count);
            var isMult = (i === count - 1);
            var arr = isTol ? rTols : rCols;
            var idx = isTol ? tolIdx : (isMult ? multIdx : rBands[i]);
            vis.style.background = arr[idx] ? arr[idx].c : '#ccc';
        }
    }
    
    resEl.innerHTML = '<div class="text-sm text-ohms font-medium mb-1">Valor</div><div class="font-mono text-2xl font-bold">' + formatR(finalVal) + ' ± ' + tolVal + '%</div>';
}

function formatR(v) {
    if (isNaN(v)) return '—';
    if (v >= 1e6) return (v / 1e6).toFixed(v % 1e6 ? 1 : 0) + ' MΩ';
    if (v >= 1e3) return (v / 1e3).toFixed(v % 1e3 ? 1 : 0) + ' kΩ';
    return v + ' Ω';
}

function formatC(v) {
    if (isNaN(v)) return '—';
    if (v >= 1e6) return (v / 1e6).toFixed(1) + ' µF';
    if (v >= 1e3) return (v / 1e3).toFixed(1) + ' nF';
    return v + ' pF';
}

function updateCap() {
    var c = document.getElementById('capCode').value.trim();
    var val = '—';
    
    if (c.length === 3) {
        var num = parseInt(c.substring(0, 2));
        var mult = parseInt(c.charAt(2));
        val = num * Math.pow(10, mult);
    }
    
    document.getElementById('capResult').innerHTML = '<div class="text-sm text-blue-600 font-medium mb-1">Capacitancia</div><div class="font-mono text-2xl font-bold">' + formatC(val) + '</div>';
}

function updateCapQ() {
    var v = parseFloat(document.getElementById('capV').value) || 0;
    var c = parseFloat(document.getElementById('capF').value) || 0;
    document.getElementById('capQResult').textContent = 'Q = ' + (v * c).toFixed(4) + ' C';
}

function updateTrans() {
    var ib = parseFloat(document.getElementById('transIb').value) || 0;
    var hfe = parseFloat(document.getElementById('transHfe').value) || 100;
    var vcc = parseFloat(document.getElementById('transVcc').value) || 0;
    var rc = parseFloat(document.getElementById('transRc').value) || 1000;
    
    var ic = ib * hfe;
    var vce = vcc - (ic / 1000) * rc;
    var vce_sat = 0.2;
    var sat = vce < vce_sat;
    
    document.getElementById('transResult').innerHTML =
        '<p>Ic = ' + ic.toFixed(2) + ' mA</p>' +
        '<p>Vce = ' + (sat ? vce_sat : vce.toFixed(2)) + ' V</p>' +
        '<p>Estado: <b>' + (sat ? 'Saturado (Switch ON)' : 'Activo (Amplificador)') + '</b></p>';
}

function updateDiod() {
    var vi = parseFloat(document.getElementById('diodVi').value) || 0;
    var vd = parseFloat(document.getElementById('diodVd').value) || 0.7;
    var r = parseFloat(document.getElementById('diodR').value) || 1000;
    
    var i = (vi > vd) ? ((vi - vd) / r) : 0;
    
    document.getElementById('diodResult').innerHTML =
        '<p>Corriente (I) = ' + (i * 1000).toFixed(2) + ' mA</p>' +
        '<p>Potencia Diodo = ' + (i * vd).toFixed(4) + ' W</p>' +
        '<p>Estado: ' + (vi > vd ? 'Conducción (ON)' : 'Corte (OFF)') + '</p>';
}

/* ============================================
   SECCIÓN 10: CIRCUITOS (CON CANVAS ANIMADO)
============================================ */
var cType = 'serie';
var flowType = 'convencional';
var circuitStaticValues = {};
var electronPos = 0;
var animFrame;

function toggleFlowType() {
    flowType = flowType === 'convencional' ? 'electrones' : 'convencional';
    var label = document.getElementById('flowLabel');
    if (label) label.textContent = flowType === 'convencional' ? 'Convencional' : 'Electrones';
    updateCircuitStatic();
}

function setCircuitType(t) {
    cType = t;
    
    ['btnSerie', 'btnParalelo', 'btnMixto'].forEach(function(id, idx) {
        var types = ['serie', 'paralelo', 'mixto'];
        var btn = document.getElementById(id);
        btn.className = types[idx] === t 
            ? 'px-4 py-2.5 rounded-lg text-sm font-semibold bg-electric-600 text-white shadow-md'
            : 'px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-500';
    });
    
    var inp = document.getElementById('circInputs');
    
    if (t === 'mixto') {
        inp.classList.remove('grid-cols-3');
        inp.classList.add('grid-cols-4');
        
        if (!document.getElementById('circR3')) {
            var d = document.createElement('div');
            d.innerHTML = '<label class="text-xs font-semibold text-ohms block mb-1">R₃</label><input type="number" id="circR3" value="300" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono bg-white" onchange="updateCircuitStatic()">';
            inp.appendChild(d.firstChild);
            inp.appendChild(d.lastChild);
        }
    } else {
        inp.classList.add('grid-cols-3');
        inp.classList.remove('grid-cols-4');
        var r3 = document.getElementById('circR3');
        if (r3) r3.parentElement.remove();
    }
    
    updateCircuitStatic();
    
    // Track badge
    learningStats.circuitsSimulated++;
    checkAndUnlockBadges();
}

function updateCircuitStatic() {
    var V = parseFloat(document.getElementById('circV').value) || 12;
    var R1 = parseFloat(document.getElementById('circR1').value) || 100;
    var R2 = parseFloat(document.getElementById('circR2').value) || 200;
    var R3 = cType === 'mixto' ? (parseFloat(document.getElementById('circR3').value) || 300) : 0;
    
    var Rt, It, V1, V2, I1, I2, I3;
    
    if (cType === 'serie') {
        Rt = R1 + R2;
        It = V / Rt;
        V1 = It * R1;
        V2 = It * R2;
        I1 = I2 = It;
    } else if (cType === 'paralelo') {
        Rt = (R1 * R2) / (R1 + R2);
        It = V / Rt;
        V1 = V2 = V;
        I1 = V / R1;
        I2 = V / R2;
    } else {
        var Rp = (R2 * R3) / (R2 + R3);
        Rt = R1 + Rp;
        It = V / Rt;
        V1 = It * R1;
        V2 = V - V1;
        I1 = It;
        I2 = V2 / R2;
        I3 = V2 / R3;
    }
    
    var P = V * It;
    
    document.getElementById('circuitResults').innerHTML =
        '<div class="grid grid-cols-2 gap-3">' +
            '<div class="bg-white rounded-lg p-3 border border-slate-100"><div class="text-xs text-slate-400">R total</div><div class="font-mono font-bold text-ohms">' + Rt.toFixed(1) + 'Ω</div></div>' +
            '<div class="bg-white rounded-lg p-3 border border-slate-100"><div class="text-xs text-slate-400">I total</div><div class="font-mono font-bold text-amps">' + It.toFixed(4) + 'A</div></div>' +
            '<div class="bg-white rounded-lg p-3 border border-slate-100"><div class="text-xs text-slate-400">V R₁</div><div class="font-mono font-bold text-volt">' + V1.toFixed(2) + 'V</div></div>' +
            '<div class="bg-white rounded-lg p-3 border border-slate-100"><div class="text-xs text-slate-400">V R₂</div><div class="font-mono font-bold text-volt">' + V2.toFixed(2) + 'V</div></div>' +
        '</div>';
    
    var rules = cType === 'serie' 
        ? ['R<sub>T</sub>=R₁+R₂', 'Corriente igual', 'Voltaje se divide']
        : cType === 'paralelo'
        ? ['1/R<sub>T</sub>=1/R₁+1/R₂', 'Voltaje igual', 'Corriente se divide']
        : ['R₁ en serie con (R₂||R₃)', 'Mixto combina serie y paralelo', 'La corriente principal pasa por R₁'];
    
    document.getElementById('circuitRules').innerHTML = rules.map(function(r) {
        return '<p class="text-sm text-slate-600">• ' + r + '</p>';
    }).join('');
    
    circuitStaticValues = { V: V, R1: R1, R2: R2, R3: R3, Rt: Rt, It: It, V1: V1, V2: V2, I1: I1, I2: I2, I3: I3 };
    
    drawCircuitAnimation();
}

function initCircuit() {
    updateCircuitStatic();
}

function drawCircuitAnimation() {
    var canvas = document.getElementById('circuitCanvas');
    if (!canvas) return;
    
    var ctx = canvas.getContext('2d');
    var cw = canvas.width, ch = canvas.height;
    var _circuitStaticValues$circuitStaticValues;
    var isConv = flowType === 'convencional';
    var pColor = isConv ? '#F59E0B' : '#3B82F6';
    var gColor = isConv ? 'rgba(245,158,11,0.3)' : 'rgba(59,130,246,0.3)';
    
    ctx.clearRect(0, 0, cw, ch);
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, cw, ch);
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(40, 40, cw - 80, ch - 80);
    ctx.fillStyle = '#F1F5F9';
    ctx.fillRect(41, 41, cw - 82, ch - 82);
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, cw - 80, ch - 80);
    
    function drawCable(pts, color) {
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = color;
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.stroke();
        ctx.shadowColor = 'transparent';
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y - 1);
        for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y - 1);
        ctx.stroke();
    }
    
    function drawBattery(cx, cy) {
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;
        var grad = ctx.createLinearGradient(cx - 15, cy, cx + 15, cy);
        grad.addColorStop(0, '#334155');
        grad.addColorStop(0.5, '#64748B');
        grad.addColorStop(1, '#334155');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(cx - 15, cy - 40, 30, 80, 8);
        ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(cx - 8, cy - 42, 16, 6);
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(cx - 6, cy + 36, 12, 4);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Space Grotesk';
        ctx.textAlign = 'center';
        ctx.fillText('+', cx, cy - 28);
        ctx.fillText('−', cx, cy + 28);
        ctx.fillStyle = '#EF4444';
        ctx.font = 'bold 14px Space Grotesk';
        ctx.fillText(V + 'V', cx + 25, cy + 5);
    }
    
    function drawHRes(cx, cy, label) {
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 3;
        var grad = ctx.createLinearGradient(cx, cy - 10, cx, cy + 10);
        grad.addColorStop(0, '#D4A76A');
        grad.addColorStop(0.5, '#C49555');
        grad.addColorStop(1, '#B8894A');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(cx - 40, cy - 10, 80, 20, 4);
        ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = '#334155';
        ctx.font = 'bold 12px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(label, cx, cy + 5);
    }
    
    function drawVRes(cx, cy, label) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-Math.PI / 2);
        drawHRes(0, 0, label);
        ctx.restore();
    }
    
    function drawElectrons(path, speed) {
        var numE = 6;
        for (var i = 0; i < numE; i++) {
            var t = (electronPos * speed + i / numE) % 1;
            if (!isConv) t = 1 - t;
            var pos = t * (path.length - 1);
            var idx = Math.floor(pos);
            var frac = pos - idx;
            if (idx >= path.length - 1) { idx = path.length - 2; frac = 1; }
            var ax = path[idx].x, ay = path[idx].y;
            var bx = path[idx + 1].x, by = path[idx + 1].y;
            var ex = ax + (bx - ax) * frac, ey = ay + (by - ay) * frac;
            ctx.beginPath();
            ctx.arc(ex, ey, 7, 0, Math.PI * 2);
            ctx.fillStyle = gColor;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(ex, ey, 4, 0, Math.PI * 2);
            ctx.fillStyle = pColor;
            ctx.fill();
        }
    }
    
    if (cType === 'serie') {
        var TL = { x: 80, y: 80 }, TR = { x: 420, y: 80 }, BR = { x: 420, y: 300 }, BL = { x: 80, y: 300 };
        drawCable([TL, TR], '#EF4444');
        drawCable([TR, BR], '#0F172A');
        drawCable([BR, BL], '#0F172A');
        drawCable([BL, { x: 80, y: 230 }], '#0F172A');
        drawCable([{ x: 80, y: 150 }, TL], '#EF4444');
        drawBattery(80, 190);
        drawHRes(190, 80, 'R₁');
        drawHRes(320, 80, 'R₂');
        drawElectrons([TL, TR, BR, BL, TL], 1);
    } else if (cType === 'paralelo') {
        var TL = { x: 80, y: 80 }, TR = { x: 420, y: 80 }, BR = { x: 420, y: 300 }, BL = { x: 80, y: 300 };
        var N1T = { x: 220, y: 80 }, N1B = { x: 220, y: 300 };
        var N2T = { x: 360, y: 80 }, N2B = { x: 360, y: 300 };
        drawCable([TL, N1T], '#EF4444');
        drawCable([N1T, N2T], '#EF4444');
        drawCable([N2T, TR], '#EF4444');
        drawCable([TR, BR], '#0F172A');
        drawCable([BR, N2B], '#0F172A');
        drawCable([N2B, N1B], '#0F172A');
        drawCable([N1B, BL], '#0F172A');
        drawCable([BL, { x: 80, y: 230 }], '#0F172A');
        drawCable([{ x: 80, y: 150 }, TL], '#EF4444');
        drawCable([N1T, { x: N1T.x, y: 100 }], '#0F172A');
        drawCable([{ x: N1B.x, y: 120 }, N1B], '#0F172A');
        drawCable([N2T, { x: N2T.x, y: 100 }], '#0F172A');
        drawCable([{ x: N2B.x, y: 120 }, N2B], '#0F172A');
        drawVRes(N1T.x, N1T.y + 110, 'R₁');
        drawVRes(N2T.x, N2T.y + 110, 'R₂');
        drawBattery(80, 190);
        drawElectrons([{ x: 80, y: 150 }, TL, N1T, { x: N1T.x, y: 100 }, { x: N1B.x, y: 120 }, N1B, BL, { x: 80, y: 230 }], 1);
        drawElectrons([N1T, N2T, { x: N2T.x, y: 100 }, { x: N2B.x, y: 120 }, N2B, N1B], 0.6);
    } else {
        var TL = { x: 80, y: 80 }, TR = { x: 420, y: 80 }, BR = { x: 420, y: 300 }, BL = { x: 80, y: 300 };
        var J1T = { x: 180, y: 80 }, J1B = { x: 180, y: 300 };
        var J2T = { x: 300, y: 80 }, J2B = { x: 300, y: 300 };
        drawCable([TL, J1T], '#EF4444');
        drawCable([J1T, TR], '#EF4444');
        drawCable([J1T, J2T], '#EF4444');
        drawCable([J2T, TR], '#EF4444');
        drawCable([TR, BR], '#0F172A');
        drawCable([BR, J2B], '#0F172A');
        drawCable([J2B, J1B], '#0F172A');
        drawCable([J1B, BL], '#0F172A');
        drawCable([BL, { x: 80, y: 230 }], '#0F172A');
        drawCable([{ x: 80, y: 150 }, TL], '#EF4444');
        drawCable([J1T, { x: J1T.x, y: 100 }], '#0F172A');
        drawCable([{ x: J1B.x, y: 120 }, J1B], '#0F172A');
        drawCable([J2T, { x: J2T.x, y: 100 }], '#0F172A');
        drawCable([{ x: J2B.x, y: 120 }, J2B], '#0F172A');
        drawHRes(130, 80, 'R₁');
        drawVRes(J1T.x, J1T.y + 110, 'R₂');
        drawVRes(J2T.x, J2T.y + 110, 'R₃');
        drawBattery(80, 190);
        drawElectrons([{ x: 80, y: 150 }, TL, J1T, { x: J1T.x, y: 100 }, { x: J1B.x, y: 120 }, J1B, BL, { x: 80, y: 230 }], 1);
        drawElectrons([J1T, J2T, { x: J2T.x, y: 100 }, { x: J2B.x, y: 120 }, J2B, J1B], 0.6);
    }
    
    ctx.fillStyle = isConv ? '#F59E0B' : '#3B82F6';
    ctx.font = 'bold 12px Space Grotesk';
    ctx.textAlign = 'center';
    ctx.fillText(isConv ? 'I Convencional (+ → −)' : 'I Real (− → +)', cw / 2, ch - 15);
    
    electronPos += 0.002;
    if (electronPos > 1) electronPos = 0;
    animFrame = requestAnimationFrame(drawCircuitAnimation);
}

/* ============================================
   SECCIÓN 11: SEÑALES/WAVEFORM (CON CANVAS ANIMADO)
============================================ */
var wType = 'sine', wAmp = 5, wFreq = 2, wTime = 0;

function setWaveType(t) {
    wType = t;
    
    document.querySelectorAll('.wave-btn').forEach(function(b) {
        b.className = 'wave-btn px-4 py-2 rounded-lg text-sm font-semibold bg-slate-100 text-slate-600';
    });
    
    var btn = document.getElementById('btn' + t.charAt(0).toUpperCase() + t.slice(1));
    if (btn) btn.className = 'wave-btn px-4 py-2 rounded-lg text-sm font-semibold bg-electric-600 text-white';
    
    // Track badge
    learningStats.wavesExplored.add(t);
    checkAndUnlockBadges();
    
    updateWaveParams();
}

function updateWaveParams() {
    wAmp = parseFloat(document.getElementById('ampSlider').value);
    wFreq = parseFloat(document.getElementById('freqSlider').value);
    
    document.getElementById('ampVal').textContent = wAmp.toFixed(1) + ' V';
    document.getElementById('freqVal').textContent = wFreq.toFixed(1) + ' Hz';
    
    var T = 1 / wFreq;
    var Vrms;
    
    if (wType === 'sine') Vrms = (wAmp / Math.sqrt(2)).toFixed(2);
    else if (wType === 'square') Vrms = wAmp.toFixed(2);
    else Vrms = (wAmp / Math.sqrt(3)).toFixed(2);
    
    document.getElementById('waveProps').innerHTML =
        '<div class="flex justify-between"><span class="text-slate-500">Vp</span><span class="font-mono font-semibold">' + wAmp.toFixed(1) + 'V</span></div>' +
        '<div class="flex justify-between"><span class="text-slate-500">f</span><span class="font-mono font-semibold">' + wFreq.toFixed(1) + 'Hz</span></div>' +
        '<div class="flex justify-between"><span class="text-slate-500">T</span><span class="font-mono font-semibold">' + T.toFixed(3) + 's</span></div>' +
        '<div class="flex justify-between"><span class="text-slate-500">Vrms</span><span class="font-mono font-semibold">' + Vrms + 'V</span></div>';
}

function initWaveform() {
    var canvas = document.getElementById('waveCanvas');
    if (!canvas) return;
    
    var ctx = canvas.getContext('2d');
    updateWaveParams();
    
    function draw() {
        var cw = canvas.width, ch = canvas.height;
        ctx.fillStyle = '#0C1A2E';
        ctx.fillRect(0, 0, cw, ch);
        
        // Grid
        ctx.strokeStyle = 'rgba(10,132,255,.1)';
        ctx.lineWidth = 1;
        for (var x = 0; x < cw; x += 40) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ch); ctx.stroke();
        }
        for (var y = 0; y < ch; y += 40) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cw, y); ctx.stroke();
        }
        
        // Center lines
        ctx.strokeStyle = 'rgba(10,132,255,.25)';
        ctx.beginPath(); ctx.moveTo(0, ch / 4); ctx.lineTo(cw, ch / 4); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 3 * ch / 4); ctx.lineTo(cw, 3 * ch / 4); ctx.stroke();
        
        // Zero line
        ctx.strokeStyle = 'rgba(255,165,0,0.9)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, ch / 2); ctx.lineTo(cw, ch / 2); ctx.stroke();
        
        // Labels
        ctx.fillStyle = '#3399FF';
        ctx.font = '10px JetBrains Mono';
        ctx.fillText('0V', 5, ch / 2 - 4);
        ctx.fillText(wAmp.toFixed(1) + 'V', 5, ch / 4 - 4);
        ctx.fillText('-' + wAmp.toFixed(1) + 'V', 5, 3 * ch / 4 - 4);
        ctx.fillText('t', cw - 5, ch / 2 - 4);
        
        // Waveform
        ctx.beginPath();
        ctx.strokeStyle = '#3399FF';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#3399FF';
        ctx.shadowBlur = 8;
        
        var midY = ch / 2, sY = (ch / 2 - 30) / 12;
        
        for (var x = 0; x < cw; x++) {
            var t = (x / cw) * 3 + wTime;
            var y;
            var ph = 2 * Math.PI * wFreq * t;
            
            switch (wType) {
                case 'sine': y = midY - wAmp * Math.sin(ph) * sY; break;
                case 'square': y = midY - wAmp * Math.sign(Math.sin(ph)) * sY; break;
                case 'triangle': y = midY - wAmp * (2 / Math.PI) * Math.asin(Math.sin(ph)) * sY; break;
                case 'sawtooth': var p = (wFreq * t) % 1; y = midY - wAmp * (2 * p - 1) * sY; break;
                case 'half': y = midY - Math.max(0, wAmp * Math.sin(ph)) * sY; break;
                default: y = midY - wAmp * sY; break;
            }
            
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        wTime += 0.015;
        requestAnimationFrame(draw);
    }
    
    draw();
    
    console.log('📡 Waveform canvas iniciado');
}

/* ============================================
   SECCIÓN 12: QUIZ/PRÁCTICA (COMPLETO)
============================================ */
var QQ = [
    { cat: 'Ohm', q: 'R=100Ω I=0.5A ¿V=?', o: ['25V', '50V', '100V', '200V'], c: 1, e: 'V=I×R=50V' },
    { cat: 'Comp.', q: '¿1kΩ ±5%?', o: ['M-N-R-Oro', 'M-N-N-Oro', 'R-N-M-Oro', 'M-R-N-Oro'], c: 0, e: '1-0-×100=1kΩ' },
    { cat: 'Circ.', q: 'Serie R₁=10 R₂=20 ¿RT?', o: ['6.67', '30', '200', '15'], c: 1, e: 'RT=30Ω' },
    { cat: 'Circ.', q: 'Paralelo: ¿qué es igual?', o: ['Corriente', 'Resistencia', 'Voltaje', 'Potencia'], c: 2, e: 'Voltaje igual en ramas' },
    { cat: 'Ohm', q: '¿Unidad resistencia?', o: ['Voltio', 'Amperio', 'Ohmio', 'Vatio'], c: 2, e: 'Ohmio' },
    { cat: 'Comp.', q: '¿Qué almacena carga?', o: ['Resistencia', 'Inductor', 'Capacitor', 'Diodo'], c: 2, e: 'Capacitor' },
    { cat: 'Señal', q: 'T=0.02s ¿f?', o: ['20Hz', '50Hz', '100Hz', '0.02Hz'], c: 1, e: 'f=50Hz' },
    { cat: 'Ohm', q: 'V=12 R=4 ¿P?', o: ['3W', '16W', '36W', '48W'], c: 2, e: 'P=36W' }
];

var cQ = 0, sc = 0, qans = false;

function initQuiz() {
    showQ();
}

function showQ() {
    if (cQ >= QQ.length) {
        document.getElementById('quizCard').style.display = 'none';
        document.getElementById('quizComplete').style.display = 'block';
        document.getElementById('finalScore').textContent = sc + '/' + QQ.length;
        document.getElementById('finalMsg').textContent = sc >= QQ.length * 0.8 ? '¡Excelente!' : sc >= QQ.length * 0.5 ? 'Buen trabajo' : 'Sigue practicando';
        return;
    }
    
    var q = QQ[cQ];
    document.getElementById('qNum').textContent = cQ + 1;
    document.getElementById('qTotal').textContent = QQ.length;
    document.getElementById('qProgress').style.width = ((cQ + 1) / QQ.length * 100) + '%';
    document.getElementById('quizCategory').textContent = q.cat;
    document.getElementById('quizQuestion').textContent = q.q;
    document.getElementById('quizFeedback').style.display = 'none';
    document.getElementById('btnNext').style.display = 'none';
    document.getElementById('btnSkip').style.display = 'inline-block';
    qans = false;
    
    document.getElementById('quizOptions').innerHTML = q.o.map(function(o, i) {
        return '<button onclick="ansQ(' + i + ')" class="quiz-option w-full text-left px-5 py-3.5 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-700 hover:border-electric-400 hover:bg-electric-50 transition-all flex items-center gap-3">' +
               '<span class="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">' + String.fromCharCode(65 + i) + '</span>' +
               o + '</button>';
    }).join('');
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
    fb.style.display = 'block';
    
    if (i === q.c) {
        sc++;
        document.getElementById('qScore').textContent = sc;
        fb.className = 'mt-6 rounded-xl p-4 text-sm bg-green-50 border border-green-200 text-green-800';
        fb.innerHTML = '✅ ' + q.e;
        playSound('correct');
    } else {
        fb.className = 'mt-6 rounded-xl p-4 text-sm bg-red-50 border border-red-200 text-red-800';
        fb.innerHTML = '❌ ' + q.e;
        playSound('incorrect');
    }
    
    document.getElementById('btnNext').style.display = 'inline-block';
    document.getElementById('btnSkip').style.display = 'none';
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
    document.getElementById('qScore').textContent = '0';
    document.getElementById('quizCard').style.display = 'block';
    document.getElementById('quizComplete').style.display = 'none';
    showQ();
}

/* ============================================
   SECCIÓN 13: KATEX FORMULAS
============================================ */
function renderFormulas() {
    var tryRender = function() {
        if (typeof katex === 'undefined') {
            setTimeout(tryRender, 200);
            return;
        }
        
        var fm = {
            f1: 'V = I \\cdot R',
            f2: 'I = \\dfrac{V}{R}',
            f3: 'R = \\dfrac{V}{I}',
            f4: 'P = V \\cdot I',
            f5: 'P = I^2 \\cdot R',
            f6: 'P = \\dfrac{V^2}{R}'
        };
        
        Object.keys(fm).forEach(function(id) {
            var el = document.getElementById(id);
            if (el) katex.render(fm[id], el, { throwOnError: false });
        });
        
        var cf = {
            fc_r: 'R = \\dfrac{V}{I}\\;(\\Omega)',
            fc_c: 'Q = C \\cdot V\\;(F)',
            fc_d: 'V_d \\approx 0.7\\;V'
        };
        
        Object.keys(cf).forEach(function(id) {
            var el = document.getElementById(id);
            if (el) katex.render(cf[id], el, { throwOnError: false });
        });
    };
    
    tryRender();
}

/* ============================================
   SECCIÓN 14: MINI-JUEGO ENGINE (COMPLETO)
============================================ */
function openMiniGame() {
    var modal = document.getElementById('miniGameModal');
    if (modal) {
        modal.style.display = 'flex';
        showGameStartScreen();
        resetGameState();
        playSound('click');
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
        maxCombo: 0,
        correctAnswers: 0,
        totalScore: 0,
        fastResponses: 0,
        roundsCompleted: gameStats.roundsCompleted,
        maxStreak: 0,
        currentStreak: 0,
        difficulty: 'easy',
        questionStartTime: 0,
        timerInterval: null,
        currentQuestion: null
    };
    updateGameUI();
}

function showGameStartScreen() {
    document.getElementById('gameStartScreen').style.display = 'block';
    document.getElementById('gamePlayArea').style.display = 'none';
    document.getElementById('gameResultsArea').style.display = 'none';
    updateGameUI();
}

function startMiniGameRound() {
    resetGameState();
    gameStats.isActive = true;
    
    document.getElementById('gameStartScreen').style.display = 'none';
    document.getElementById('gamePlayArea').style.display = 'block';
    
    startGameTimer();
    nextGameQuestion();
    
    console.log('🚀 Ronda de mini-juego iniciada');
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
    gameStats.questionStartTime = Date.now();
    
    renderGameQuestion();
}

function renderGameQuestion() {
    if (!gameStats.currentQuestion) return;
    
    var q = gameStats.currentQuestion;
    
    document.getElementById('gameCategory').textContent = q.cat;
    document.getElementById('gameQuestionText').textContent = q.q;
    
    var optionsContainer = document.getElementById('gameOptions');
    var html = '';
    
    // Mezclar opciones visualmente
    var indices = [0, 1, 2, 3];
    for (var i = indices.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    
    indices.forEach(function(originalIndex, displayIndex) {
        html += '<button onclick="answerGameQuestion(' + originalIndex + ', this)" ' +
                'class="game-option-btn" data-index="' + originalIndex + '">' +
                '<span class="font-bold mr-2">' + String.fromCharCode(65 + displayIndex) + ')</span>' +
                q.options[originalIndex] +
               '</button>';
    });
    
    optionsContainer.innerHTML = html;
    
    document.getElementById('gameFeedbackArea') ? document.getElementById('gameFeedbackArea').classList.add('hidden') : null;
}

function answerGameQuestion(selectedIndex, btnElement) {
    if (!gameStats.isActive || !gameStats.currentQuestion) return;
    
    // Deshabilitar todos
    document.querySelectorAll('#gameOptions .game-option-btn').forEach(function(btn) {
        btn.disabled = true;
    });
    
    var q = gameStats.currentQuestion;
    var isCorrect = selectedIndex === q.correct;
    var responseTime = (Date.now() - gameStats.questionStartTime) / 1000;
    
    // Marcar respuestas
    document.querySelectorAll('#gameOptions .game-option-btn').forEach(function(btn) {
        var idx = parseInt(btn.dataset.index);
        if (idx === q.correct) btn.classList.add('selected-correct');
        if (selectedIndex === idx && !isCorrect) btn.classList.add('selected-incorrect');
    });
    
    // Calcular puntos
    var pointsEarned = 0;
    
    if (isCorrect) {
        pointsEarned = CONFIG.game.basePoints;
        
        if (responseTime < CONFIG.game.speedBonus.fast.threshold) {
            pointsEarned *= CONFIG.game.speedBonus.fast.multiplier;
            gameStats.fastResponses++;
        } else if (responseTime < CONFIG.game.speedBonus.medium.threshold) {
            pointsEarned *= CONFIG.game.speedBonus.medium.multiplier;
        } else if (responseTime < CONFIG.game.speedBonus.slow.threshold) {
            pointsEarned *= CONFIG.game.speedBonus.slow.multiplier;
        }
        
        gameStats.combo++;
        var comboMultiplier = Math.min(gameStats.combo, CONFIG.game.maxCombo);
        pointsEarned *= comboMultiplier;
        
        gameStats.score += pointsEarned;
        gameStats.correctAnswers++;
        gameStats.currentStreak++;
        gameStats.maxStreak = Math.max(gameStats.maxStreak, gameStats.currentStreak);
        gameStats.maxCombo = Math.max(gameStats.maxCombo, comboMultiplier);
        
        playSound('correct');
        
        // Verificar dificultad
        if (gameStats.currentStreak % CONFIG.game.difficultyThreshold === 0) {
            upgradeDifficulty();
        }
        
    } else {
        gameStats.combo = 0;
        gameStats.currentStreak = 0;
        playSound('incorrect');
    }
    
    // Mostrar feedback
    showGameFeedback(isCorrect, q.explanation, responseTime, pointsEarned);
    updateGameUI();
    
    // Siguiente pregunta
    setTimeout(function() {
        if (gameStats.isActive) nextGameQuestion();
    }, 1500);
}

function upgradeDifficulty() {
    if (gameStats.difficulty === 'easy') {
        gameStats.difficulty = 'medium';
        showToast('🔥 Dificultad: MEDIO');
    } else if (gameStats.difficulty === 'medium') {
        gameStats.difficulty = 'hard';
        showToast('🔥 Dificultad: DIFÍCIL');
    }
    
    updateDifficultyBadge();
}

function showGameFeedback(isCorrect, explanation, time, points) {
    var feedbackArea = document.getElementById('gameFeedbackArea');
    if (!feedbackArea) return;
    
    feedbackArea.classList.remove('hidden');
    feedbackArea.classList.remove('feedback-correct', 'feedback-incorrect');
    
    var icon = isCorrect ? '✅' : '❌';
    var bgColor = isCorrect ? 'feedback-correct' : 'feedback-incorrect';
    
    feedbackArea.innerHTML = 
        '<div class="' + bgColor + ' mt-4 p-4 rounded-xl">' +
        '<div class="flex items-center gap-2 mb-2 text-lg font-bold">' + icon + ' ' +
            (isCorrect ? '¡Correcto!' : 'Incorrecto') + '</div>' +
        '<p class="mb-1">' + explanation + '</p>' +
        '<div class="text-xs opacity-75 mt-2">Tiempo: ' + time.toFixed(1) + 's | Puntos: +' + points + '</div>' +
        '</div>';
}

function endGameRound() {
    gameStats.isActive = false;
    stopGameTimer();
    
    gameStats.totalScore += gameStats.score;
    gameStats.roundsCompleted++;
    
    saveGameStats();
    checkAndUnlockBadges();
    
    document.getElementById('gamePlayArea').style.display = 'none';
    document.getElementById('gameResultsArea').style.display = 'block';
    
    document.getElementById('gameFinalScore').textContent = gameStats.score + ' pts';
    document.getElementById('resultCorrect').textContent = gameStats.correctAnswers;
    document.getElementById('resultMaxCombo').textContent = 'x' + gameStats.maxCombo;
    document.getElementById('resultRounds').textContent = gameStats.roundsCompleted;
    
    showToast('¡Ronda completada! Puntos: ' + gameStats.score);
    
    console.log('🏁 Ronda finalizada. Score:', gameStats.score);
}

function updateGameUI() {
    document.getElementById('gameTimer').textContent = gameStats.timeLeft;
    document.getElementById('gameScore').textContent = gameStats.score;
    document.getElementById('gameCombo').textContent = 'x' + (gameStats.combo + 1);
    document.getElementById('gameCorrect').textContent = gameStats.correctAnswers;
    
    var timeBar = document.getElementById('gameTimeBar');
    if (timeBar) {
        timeBar.style.width = ((gameStats.timeLeft / CONFIG.game.defaultTime) * 100) + '%';
    }
    
    updateDifficultyBadge();
}

function updateDifficultyBadge() {
    var badge = document.getElementById('gameDifficultyBadge');
    if (!badge) return;
    
    var configs = {
        easy: { text: 'FÁCIL', cls: 'difficulty-easy' },
        medium: { text: 'MEDIO', cls: 'difficulty-medium' },
        hard: { text: 'DIFÍCIL', cls: 'difficulty-hard' }
    };
    
    var config = configs[gameStats.difficulty];
    badge.textContent = config.text;
    badge.className = 'px-3 py-1 text-xs font-bold rounded-full ' + config.cls;
}

function saveGameStats() {
    try {
        var stats = {
            totalScore: gameStats.totalScore,
            fastResponses: gameStats.fastResponses,
            maxStreak: gameStats.maxStreak,
            maxCombo: gameStats.maxCombo,
            roundsCompleted: gameStats.roundsCompleted,
            lastPlayed: new Date().toISOString()
        };
        localStorage.setItem('electronilab_gamestats', JSON.stringify(stats));
    } catch (e) {
        console.warn('⚠️ Error guardando stats:', e);
    }
}

/* ============================================
   SECCIÓN 15: SISTEMA DE BADGES (12 BADGES)
============================================ */
function toggleBadgesPanel() {
    var modal = document.getElementById('badgesModal');
    if (modal) {
        modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
        renderBadgesGrid('all');
        playSound('click');
    }
}

function checkAndUnlockBadges() {
    var stats = {
        game: {
            fastResponses: gameStats.fastResponses,
            maxStreak: gameStats.maxStreak,
            totalScore: gameStats.totalScore,
            maxCombo: gameStats.maxCombo,
            roundsCompleted: gameStats.roundsCompleted
        },
        learning: {
            sectionsVisited: learningStats.sectionsVisited,
            circuitsSimulated: learningStats.circuitsSimulated,
            componentsCalculated: learningStats.componentsCalculated,
            wavesExplored: learningStats.wavesExplored,
            conceptsRead: learningStats.conceptsRead
        },
        special: {
            darkModeUses: specialStats.darkModeUses
        }
    };
    
    var newUnlocks = [];
    
    CONFIG.badges.forEach(function(badge) {
        if (badge.id === 'legendary') return; // Se verifica al final
        
        if (unlockedBadges.includes(badge.id)) return;
        
        if (evaluateBadgeCondition(badge, stats)) {
            unlockedBadges.push(badge.id);
            newUnlocks.push(badge);
        }
    });
    
    // Verificar LEGENDARY
    var legendaryBadge = CONFIG.badges.find(function(b) { return b.id === 'legendary'; });
    if (legendaryBadge && !unlockedBadges.includes('legendary')) {
        var allOthers = CONFIG.badges.filter(function(b) { return b.id !== 'legendary'; });
        var allUnlocked = allOthers.every(function(b) { return unlockedBadges.includes(b.id); });
        
        if (allUnlocked) {
            unlockedBadges.push('legendary');
            newUnlocks.push(legendaryBadge);
        }
    }
    
    if (newUnlocks.length > 0) {
        saveBadgesToStorage();
        updateBadgeUI();
        
        newUnlocks.forEach(function(badge, index) {
            setTimeout(function() {
                showAchievementCelebration(badge);
                playSound('achievement');
            }, index * 500);
        });
    }
}

function evaluateBadgeCondition(badge, stats) {
    switch (badge.id) {
        case 'speed-demon': return stats.game.fastResponses >= 5;
        case 'perfect-10': return stats.game.maxStreak >= 10;
        case 'ohm-master': return stats.game.totalScore >= 500;
        case 'combo-king': return stats.game.maxCombo >= 5;
        case 'marathon': return stats.game.roundsCompleted >= 5;
        case 'explorer': return stats.learning.sectionsVisited.size >= 6;
        case 'circuit-builder': return stats.learning.circuitsSimulated >= 10;
        case 'component-wizard': return stats.learning.componentsCalculated >= 50;
        case 'wave-rider': return stats.learning.wavesExplored.size >= 5;
        case 'night-owl': return stats.special.darkModeUses >= 5;
        case 'curious': return stats.learning.conceptsRead.size >= 8;
        default: return false;
    }
}

function showAchievementCelebration(badge) {
    var celebrationEl = document.getElementById('achievementCelebration');
    if (!celebrationEl || !badge) return;
    
    document.getElementById('celebrationIcon').textContent = badge.icon;
    document.getElementById('celebrationName').textContent = badge.name;
    document.getElementById('celebrationDesc').textContent = badge.description;
    
    celebrationEl.style.display = 'block';
    
    startConfeti();
    
    setTimeout(function() {
        celebrationEl.style.display = 'none';
        stopConfeti();
    }, 3000);
    
    console.log('🏆 Logro desbloqueado:', badge.name);
}

function renderBadgesGrid(filter) {
    filter = filter || 'all';
    var grid = document.getElementById('badgesGrid');
    if (!grid) return;
    
    var badgesToShow = filter === 'all' 
        ? CONFIG.badges 
        : CONFIG.badges.filter(function(b) { return b.category === filter; });
    
    grid.innerHTML = badgesToShow.map(function(badge) {
        var isUnlocked = unlockedBadges.includes(badge.id);
        
        return '<div class="badge-card ' + (isUnlocked ? 'unlocked' : 'locked') + '">' +
               (!isUnlocked ? '<div class="badge-lock-overlay"><span>🔒</span></div>' : '') +
               '<span class="text-3xl mb-2">' + (isUnlocked ? badge.icon : '❓') + '</span>' +
               '<div class="font-bold text-sm">' + (isUnlocked ? badge.name : '???') + '</div>' +
               '<div class="text-xs text-slate-500">' + (isUnlocked ? badge.description : 'Desbloquea jugando') + '</div>' +
               '</div>';
    }).join('');
    
    // Actualizar contador
    document.getElementById('badgesUnlockedCount').textContent = unlockedBadges.length;
    document.getElementById('badgesProgressBar').style.width = (unlockedBadges.length / CONFIG.badges.length * 100) + '%';
}

function filterBadges(category) {
    event.target.classList.add('active');
    document.querySelectorAll('.filter-badge-btn').forEach(function(btn) {
        if (btn !== event.target) btn.classList.remove('active');
    });
    renderBadgesGrid(category);
}

function updateBadgeUI() {
    var count = unlockedBadges.length;
    var heroCount = document.getElementById('badgeCountHero');
    var navCount = document.getElementById('badgeCountNav');
    
    if (heroCount) heroCount.textContent = count;
    if (navCount) navCount.textContent = count;
}

function saveBadgesToStorage() {
    try {
        localStorage.setItem('electronilab_badges', JSON.stringify(unlockedBadges));
    } catch (e) {
        console.warn('⚠️ Error guardando badges:', e);
    }
}

function loadBadgesFromStorage() {
    try {
        var saved = localStorage.getItem('electronilab_badges');
        if (saved) unlockedBadges = JSON.parse(saved);
        
        // Cargar otras estadísticas
        loadGameStats();
        loadLearningStats();
        loadSpecialStats();
        
        updateBadgeUI();
    } catch (e) {
        console.warn('⚠️ Error cargando badges:', e);
        unlockedBadges = [];
    }
}

/* ============================================
   SECCIÓN 16: DARK MODE
============================================ */
function initDarkMode() {
    var saved = localStorage.getItem('electronilab_theme');
    if (saved) {
        setTheme(saved, false);
    }
}

function toggleDarkMode() {
    var currentTheme = document.documentElement.getAttribute('data-theme');
    var newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    setTheme(newTheme, true);
    
    if (newTheme === 'dark') {
        specialStats.darkModeUses++;
        saveSpecialStats();
        checkAndUnlockBadges();
    }
    
    showToast(newTheme === 'dark' ? '🌙 Modo oscuro activado' : '☀️ Modo claro activado');
    playSound('click');
}

function setTheme(theme, saveToStorage) {
    document.documentElement.setAttribute('data-theme', theme);
    appState.isDarkMode = theme === 'dark';
    
    if (saveToStorage) {
        localStorage.setItem('electronilab_theme', theme);
    }
    
    setTimeout(function() {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 100);
}

/* ============================================
   SECCIÓN 17: AUDIO SYSTEM (WEB AUDIO API)
============================================ */
function initAudio() {
    audioContext = null;
    appState.soundEnabled = true;
    updateSoundButtonUI();
}

function playSound(type) {
    if (!appState.soundEnabled) return;
    
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        var osc = audioContext.createOscillator();
        var gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        switch (type) {
            case 'correct':
                osc.frequency.value = 523.25;
                osc.type = 'sine';
                gain.gain.value = 0.3;
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                osc.start(audioContext.currentTime);
                osc.stop(audioContext.currentTime + 0.2);
                break;
                
            case 'incorrect':
                osc.frequency.value = 200;
                osc.type = 'sawtooth';
                gain.gain.value = 0.2;
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                osc.start(audioContext.currentTime);
                osc.stop(audioContext.currentTime + 0.3);
                break;
                
            case 'achievement':
                var notes = [523.25, 659.25, 783.99, 1046.50];
                notes.forEach(function(freq, index) {
                    var o = audioContext.createOscillator();
                    var g = audioContext.createGain();
                    o.connect(g);
                    g.connect(audioContext.destination);
                    o.frequency.value = freq;
                    o.type = 'sine';
                    g.gain.value = 0.2;
                    g.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15 + (index * 0.1));
                    o.start(audioContext.currentTime + (index * 0.1));
                    o.stop(audioContext.currentTime + 0.15 + (index * 0.1));
                });
                break;
                
            case 'click':
                osc.frequency.value = 800;
                osc.type = 'sine';
                gain.gain.value = 0.1;
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
                osc.start(audioContext.currentTime);
                osc.stop(audioContext.currentTime + 0.05);
                break;
        }
    } catch (e) {
        // Silenciar errores de audio
    }
}

function toggleSound() {
    appState.soundEnabled = !appState.soundEnabled;
    updateSoundButtonUI();
    
    if (appState.soundEnabled) playSound('click');
    
    console.log('🔊 Sound:', appState.soundEnabled ? 'ON' : 'OFF');
}

function updateSoundButtonUI() {
    var soundText = document.getElementById('soundText');
    var soundIcon = document.getElementById('soundIcon');
    
    if (soundText) soundText.textContent = appState.soundEnabled ? 'Sound ON' : 'Sound OFF';
    
    if (soundIcon && typeof lucide !== 'undefined') {
        soundIcon.setAttribute('data-lucide', appState.soundEnabled ? 'volume-2' : 'volume-x');
        lucide.createIcons({ nodes: [soundIcon] });
    }
}

/* ============================================
   SECCIÓN 18: CONFETI ENGINE (CANVAS ANIMATION)
============================================ */
function startConfeti() {
    var canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    
    var ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    var colors = ['#0A84FF', '#EF4444', '#F59E0B', '#22C55E', '#8B5CF6', '#FFD700'];
    var particles = [];
    var particleCount = 150;
    
    for (var i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: Math.random() * 10 + 5,
            h: Math.random() * 6 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 3 + 2,
            angle: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.2
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(function(p) {
            ctx.save();
            ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
            ctx.rotate(p.angle);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
            
            p.y += p.speed;
            p.angle += p.spin;
            
            if (p.y > canvas.height) {
                p.y = -p.h;
                p.x = Math.random() * canvas.width;
            }
        });
        
        confettiAnimationId = requestAnimationFrame(animate);
    }
    
    console.log('🎉 Confeti iniciado con', particleCount, 'partículas');
}

function stopConfeti() {
    if (confettiAnimationId) {
        cancelAnimationFrame(confettiAnimationId);
        confettiAnimationId = null;
    }
    
    var canvas = document.getElementById('confettiCanvas');
    if (canvas) {
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    console.log('✨ Confeti detenido');
}

/* ============================================
   SECCIÓN 19: TRACKING DE PROGRESO
============================================ */
function trackBadgeProgress(action, detail) {
    switch (action) {
        case 'section_visited':
            learningStats.sectionsVisited.add(detail);
            break;
        case 'circuit_simulated':
            learningStats.circuitsSimulated++;
            break;
        case 'component_calculated':
            learningStats.componentsCalculated++;
            break;
        case 'wave_explored':
            learningStats.wavesExplored.add(detail);
            break;
        case 'concept_read':
            learningStats.conceptsRead.add(detail);
            break;
    }
    
    saveLearningStats();
    checkAndUnlockBadges();
}

function saveLearningStats() {
    try {
        var data = {
            sectionsVisited: Array.from(learningStats.sectionsVisited),
            circuitsSimulated: learningStats.circuitsSimulated,
            componentsCalculated: learningStats.componentsCalculated,
            wavesExplored: Array.from(learningStats.wavesExplored),
            conceptsRead: Array.from(learningStats.conceptsRead)
        };
        localStorage.setItem('electronilab_learning_stats', JSON.stringify(data));
    } catch (e) {
        console.warn('⚠️ Error guardando stats aprendizaje:', e);
    }
}

function loadLearningStats() {
    try {
        var saved = localStorage.getItem('electronilab_learning_stats');
        if (saved) {
            var data = JSON.parse(saved);
            learningStats.sectionsVisited = new Set(data.sectionsVisited || []);
            learningStats.circuitsSimulated = data.circuitsSimulated || 0;
            learningStats.componentsCalculated data.componentsCalculated || 0;
            learningStats.wavesExploged = new Set(data.wavesExplored || []);
            learningStats.conceptsRead = new Set(data.conceptsRead || []);
        }
    } catch (e) {
        console.warn('⚠️ Error cargando stats aprendizaje:', e);
    }
}

function saveSpecialStats() {
    try {
        localStorage.setItem('electronilab_special_stats', JSON.stringify(specialStats));
    } catch (e) {
        console.warn('⚠️ Error guardando stats especiales:', e);
    }
}

function loadSpecialStats() {
    try {
        var saved = localStorage.getItem('electronilab_special_stats');
        if (saved) specialStats = JSON.parse(saved);
    } catch (e) {
        specialStats = { darkModeUses: 0 };
    }
}

/* ============================================
   SECCIÓN 20: FIREBASE (OPCIONAL)
============================================ */
function initFirebase() {
    try {
        if (typeof firebase !== 'undefined') {
            firebase.initializeApp(CONFIG.firebase);
            db = firebase.database();
            provider = new firebase.auth.GoogleAuthProvider();
            
            firebase.auth().onAuthStateChanged(function(user) {
                var btnLogout = document.getElementById('btnLogout');
                var btnAdd = document.getElementById('btnAddPractice');
                // Auth UI handled inline in HTML
            });
            
            console.log('✅ Firebase inicializado');
        }
    } catch (e) {
        console.warn('⚠️ Firebase no disponible (offline mode):', e.message);
    }
}

/* ============================================
   FIN - SCRIPT COMPLETAMENTE CARGADO
============================================ */
console.log('%c✅ ElectroniLab 2.0 Script COMPLETO CARGADO', 'color: #22C55E; font-size: 14px;');
