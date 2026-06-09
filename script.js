/* ============================================
   ELECTRONILAB 2.0 - JAVASCRIPT COMPLETO
   Versión Gamificada con Todas las Features
   ============================================ */

'use strict';

/* ============================================
   SECCIÓN 1: CONFIGURACIÓN Y CONSTANTES
   ============================================ */
const CONFIG = {
    version: '2.0.0',
    debug: true,
    
    // Configuración del juego
    game: {
        defaultTime: 60,
        basePoints: 10,
        speedBonus: {
            fast: { threshold: 3, multiplier: 3 },
            medium: { threshold: 5, multiplier: 2 },
            slow: { threshold: 8, multiplier: 1.5 }
        },
        maxCombo: 5,
        difficultyThreshold: 3 // Cada 3 aciertos sube dificultad
    },
    
    // Firebase credentials
    firebase: {
        apiKey: "AIzaSyCZbKU27EngACUMP1FNBxA0N3HabxcBPZg",
        authDomain: "electronilab-aa4da.firebaseapp.com",
        databaseURL: "https://electronilab-aa4da-default-rtdb.firebaseio.com/",
        projectId: "electronilab-aa4da",
        storageBucket: "electronilab-aa4da.firebasestorage.app",
        messagingSenderId: "1009038542986",
        appId: "1:1009038542986:web:2ca34ff0ab861637eb0573"
    },
    
    // Definición de los 12 badges
    badges: [
        {
            id: 'speed-demon',
            icon: '⚡',
            name: 'Rayo Veloz',
            category: 'game',
            description: 'Responde 5 veces en menos de 3 segundos'
        },
        {
            id: 'perfect-10',
            icon: '🎯',
            name: 'Perfección Absoluta',
            category: 'game',
            description: 'Obtén 10 aciertos consecutivos sin errores'
        },
        {
            id: 'ohm-master',
            icon: '🧠',
            name: 'Maestro de Ohm',
            category: 'game',
            description: 'Acumula 500 puntos totales en desafíos'
        },
        {
            id: 'combo-king',
            icon: '🔥',
            name: 'Rey del Combo',
            category: 'game',
            description: 'Alcanza un combo de x5 o mayor'
        },
        {
            id: 'marathon',
            icon: '🏃',
            name: 'Maratonista Electrónico',
            category: 'game',
            description: 'Completa 5 rondas completas de 60 segundos'
        },
        {
            id: 'explorer',
            icon: '🗺️',
            name: 'Explorador Curioso',
            category: 'learn',
            description: 'Visita todas las áreas de aprendizaje (6 secciones)'
        },
        {
            id: 'circuit-builder',
            icon: '🔧',
            name: 'Constructor de Circuitos',
            category: 'learn',
            description: 'Simula al menos 10 circuitos diferentes'
        },
        {
            id: 'component-wizard',
            icon: '🎩',
            name: 'Mago de Componentes',
            category: 'learn',
            description: 'Decodifica o calcula 50 resistencias/capacitores'
        },
        {
            id: 'wave-rider',
            icon: '🌊',
            name: 'Surfista de Ondas',
            category: 'learn',
            description: 'Experimenta con los 5 tipos de señales eléctricas'
        },
        {
            id: 'night-owl',
            icon: '🦉',
            name: 'Búho Nocturno',
            category: 'special',
            description: 'Usa el modo oscuro más de 5 veces'
        },
        {
            id: 'curious',
            icon: '🤔',
            name: 'Mente Inquisitiva',
            category: 'special',
            description: 'Lee todas las secciones conceptuales disponibles'
        },
        {
            id: 'legendary',
            icon: '👑',
            name: 'Leyenda de ElectroniLab',
            category: 'special',
            description: '¡Desbloquea TODOS los demás logros!'
        }
    ]
};

/* ============================================
   SECCIÓN 2: VARIABLES DE ESTADO GLOBALES
   ============================================ */

// Estado principal de la aplicación
let appState = {
    currentView: 'inicio',
    currentPage: null,
    isDarkMode: false,
    soundEnabled: true,
    isAdminAuthenticated: false
};

// Estadísticas del mini-juego
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
    difficulty: 'easy', // easy | medium | hard
    questionStartTime: 0,
    timerInterval: null,
    currentQuestion: null
};

// Estadísticas de aprendizaje (para badges)
let learningStats = {
    sectionsVisited: new Set(),
    circuitsSimulated: 0,
    componentsCalculated: 0,
    wavesExplored: new Set(),
    conceptsRead: new Set()
};

// Estadísticas especiales (para badges)
let specialStats = {
    darkModeUses: 0
};

// Badges desbloqueados
let unlockedBadges = [];

// Variables globales auxiliares
let db = null;
let practicesListener = null;
let provider = null;
let audioContext = null;
let confettiAnimationId = null;

/* ============================================
   SECCIÓN 3: INICIALIZACIÓN PRINCIPAL
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    console.log('%c⚡ ElectroniLab 2.0 Gamificado', 'color: #0A84FF; font-size: 20px; font-weight: bold;');
    console.log('%cVersión: ' + CONFIG.version, 'color: #22C55E;');
    
    // Inicializar sistemas
    initFirebase();
    initUI();
    initHeroCanvas();
    initOhm();
    initResistor();
    initWaveform();
    initQuiz();
    renderFormulas();
    initCircuit();
    
    // Inicializar nuevas features
    initDarkMode();      // Feature D
    initAudio();         // Feature E
    loadBadgesFromStorage(); // Feature C
    updateBadgeUI();     // Actualizar contadores
    
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
    
    // Reloj
    updateClock();
    setInterval(updateClock, 1000);
    
    // Icons
    lucide.createIcons();
});

/* ============================================
   SECCIÓN 4: UTILIDADES GENERALES
   ============================================ */

/**
 * Log condicional para debug
 */
function log(msg, data) {
    if (CONFIG.debug) {
        console.log(`[ElectroniLab] ${msg}`, data || '');
    }
}

/**
 * Log de errores
 */
function logError(msg, err) {
    console.error(`[ElectroniLab ERROR] ${msg}`, err || '');
}

/**
 * Actualizar reloj en formato es-ES
 */
function updateClock() {
    const now = new Date();
    const clockEl = document.getElementById('liveClock');
    if (clockEl) {
        clockEl.textContent = now.toLocaleTimeString('es-ES');
    }
}

/**
 * Mostrar notificación toast
 */
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

/**
 * Sanitizar HTML para prevenir XSS
 */
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/* ============================================
   SECCIÓN 5: FIREBASE (Auth + Database)
   ============================================ */

/**
 * Inicializar Firebase
 */
function initFirebase() {
    try {
        firebase.initializeApp(CONFIG.firebase);
        db = firebase.database();
        provider = new firebase.auth.GoogleAuthProvider();
        
        // Auth state listener
        firebase.auth().onAuthStateChanged((user) => {
            const btnLogout = document.getElementById('btnLogout');
            const btnAdd = document.getElementById('btnAddPractice');
            
            appState.isAdminAuthenticated = !!user;
            
            if (btnLogout) btnLogout.style.display = appState.isAdminAuthenticated ? 'flex' : 'none';
            if (btnAdd) btnAdd.style.display = appState.isAdminAuthenticated ? 'flex' : 'none';
        });
        
        testFirebaseConnection();
        log('Firebase inicializado correctamente');
    } catch (error) {
        logError('Error inicializando Firebase', error);
    }
}

/**
 * Probar conexión Firebase
 */
function testFirebaseConnection() {
    if (!db) return;
    
    db.ref('.info/connected').on('value', (snap) => {
        const dot = document.getElementById('fbDot');
        const txt = document.getElementById('fbText');
        
        if (snap.val() === true) {
            dot.className = 'w-2 h-2 rounded-full bg-green-400';
            txt.textContent = 'Conectado a Firebase ✓';
            loadFirebasePractices();
        } else {
            dot.className = 'w-2 h-2 rounded-full bg-red-400';
            txt.textContent = 'Sin conexión';
        }
    });
}

/**
 * Refrescar prácticas
 */
function refreshAllPractices() {
    if (practicesListener) practicesListener.off();
    loadFirebasePractices();
    showToast('Listas actualizadas');
}

/**
 * Cargar prácticas desde Firebase
 */
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
        arr.reverse();
        
        renderPracticeList('tareaList', 'tarea', arr);
        renderPracticeList('editorList', 'editor', arr);
    });
}

/**
 * Renderizar lista de prácticas
 */
function renderPracticeList(containerId, type, practices) {
    const c = document.getElementById(containerId);
    if (!c) return;
    
    if (!practices.length) {
        c.innerHTML = `
            <div class="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600">
                <p class="text-slate-400">No hay prácticas</p>
            </div>
        `;
        return;
    }
    
    const areaColors = {
        'Ley de Ohm': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        'Componentes': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        'Circuitos': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        'Señales': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        'Otros': 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
    };
    
    c.innerHTML = practices.map(p => {
        const acC = areaColors[p.area] || areaColors['Otros'];
        const btns = type === 'editor' ? `
            <div class="flex gap-1">
                <button onclick="editPractice('${p._id}')" class="text-slate-300 hover:text-electric-500 p-1" aria-label="Editar">✏️</button>
                <button onclick="deletePractice('${p._id}')" class="text-slate-300 hover:text-red-500 p-1" aria-label="Eliminar">🗑️</button>
            </div>
        ` : '';
        
        return `
            <div class="practice-card">
                <div class="flex items-start justify-between gap-3 mb-3">
                    <div>
                        <span class="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${acC} mb-2">${escapeHtml(p.area)}</span>
                        <h4 class="font-bold text-slate-900 dark:text-white">${escapeHtml(p.title)}</h4>
                        <p class="text-xs text-slate-400">${p.date || ''}</p>
                    </div>
                    ${btns}
                </div>
                <div class="space-y-3 text-sm">
                    ${p.objetivo ? `<p class="text-slate-500 dark:text-slate-400">🎯 ${escapeHtml(p.objetivo)}</p>` : ''}
                    ${p.materiales ? `<p class="text-slate-500 dark:text-slate-400 whitespace-pre-line">🛠 ${escapeHtml(p.materiales)}</p>` : ''}
                    ${p.pasos ? `<div class="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 text-slate-600 dark:text-slate-300 whitespace-pre-line font-mono text-xs">${escapeHtml(p.pasos)}</div>` : ''}
                    ${p.notas ? `<p class="text-slate-500 dark:text-slate-400">📝 ${escapeHtml(p.notas)}</p>` : ''}
                    ${p.imageUrl ? `<img src="${p.imageUrl}" class="rounded-lg max-h-48 border" loading="lazy" alt="Imagen de práctica">` : ''}
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Eliminar práctica
 */
function deletePractice(id) {
    if (!appState.isAdminAuthenticated) {
        showToast('Inicia sesión primero');
        return;
    }
    if (confirm('¿Eliminar esta práctica?')) {
        db.ref('practices/editor/' + id).remove()
            .then(() => showToast('Práctica eliminada'))
            .catch(err => logError('Error eliminando', err));
    }
}

/**
 * Editar práctica
 */
function editPractice(id) {
    if (!appState.isAdminAuthenticated) {
        showToast('Inicia sesión primero');
        return;
    }
    
    editingId = id;
    db.ref('practices/editor/' + id).once('value')
        .then(snap => {
            const d = snap.val();
            if (!d) return;
            
            document.getElementById('practiceFormModal').style.display = 'flex';
            document.getElementById('pfModalTitle').textContent = 'Editar Práctica';
            document.getElementById('pfSubmitText').textContent = 'Actualizar';
            document.getElementById('pfTitle').value = d.title || '';
            document.getElementById('pfArea').value = d.area || 'Otros';
            document.getElementById('pfObj').value = d.objetivo || '';
            document.getElementById('pfMat').value = d.materiales || '';
            document.getElementById('pfPasos').value = d.pasos || '';
            document.getElementById('pfNotas').value = d.notas || '';
        })
        .catch(err => logError('Error cargando práctica', err));
}

/* ============================================
   SECCIÓN 6: AUTENTICACIÓN
   ============================================ */

let editingId = null;
let pendingAction = null;

function accessEditor() {
    if (appState.isAdminAuthenticated) {
        switchSubTab('editor');
        return;
    }
    pendingAction = 'switchEditor';
    showAuthModal();
}

function showAuthModal(action) {
    if (appState.isAdminAuthenticated) {
        openPracticeForm();
        return;
    }
    pendingAction = action;
    document.getElementById('authModal').style.display = 'flex';
    document.getElementById('authError').style.display = 'none';
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

function loginWithGoogle() {
    firebase.auth().signInWithPopup(provider)
        .then(result => {
            closeAuthModal();
            if (pendingAction === 'switchEditor') switchSubTab('editor');
            else openPracticeForm();
            showToast(`Bienvenido, ${result.user.displayName}`);
        })
        .catch(error => {
            logError('Error en login Google', error);
            document.getElementById('authError').style.display = 'block';
            document.getElementById('authError').textContent = 'Error: ' + error.message;
        });
}

function logoutEditor() {
    firebase.auth().signOut()
        .then(() => {
            showToast('Sesión cerrada');
            switchSubTab('quiz');
        })
        .catch(err => logError('Error cerrando sesión', err));
}

function openPracticeForm() {
    editingId = null;
    document.getElementById('practiceFormModal').style.display = 'flex';
    document.getElementById('pfModalTitle').textContent = 'Nueva Práctica';
    document.getElementById('pfSubmitText').textContent = 'Guardar';
    document.getElementById('pfTitle').value = '';
    document.getElementById('pfObj').value = '';
    document.getElementById('pfMat').value = '';
    document.getElementById('pfPasos').value = '';
    document.getElementById('pfNotas').value = '';
    document.getElementById('pfImage').value = '';
}

function closePracticeForm() {
    document.getElementById('practiceFormModal').style.display = 'none';
    editingId = null;
}

function submitPractice() {
    if (!appState.isAdminAuthenticated) {
        showToast('Debes iniciar sesión');
        return;
    }
    
    const title = document.getElementById('pfTitle').value.trim();
    const area = document.getElementById('pfArea').value;
    const obj = document.getElementById('pfObj').value.trim();
    const mat = document.getElementById('pfMat').value.trim();
    const pasos = document.getElementById('pfPasos').value.trim();
    const notas = document.getElementById('pfNotas').value.trim();
    const fileInput = document.getElementById('pfImage');
    
    if (!title || !obj || !pasos) {
        showToast('Completa los campos obligatorios');
        return;
    }
    
    const practiceData = {
        title,
        area,
        objetivo: obj,
        materiales: mat,
        pasos,
        notas,
        date: new Date().toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    };
    
    const finishSave = (data) => {
        const ref = editingId 
            ? db.ref('practices/editor/' + editingId)
            : db.ref('practices/editor').push();
        
        ref.set(data)
            .then(() => {
                closePracticeForm();
                showToast(editingId ? 'Práctica actualizada' : 'Práctica guardada');
                editingId = null;
                
                // Track badge de componente wizard
                trackBadgeProgress('component_calculated');
            })
            .catch(err => logError('Error guardando', err));
    };
    
    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let w = img.width, h = img.height;
                const maxSize = 800;
                if (w > maxSize) {
                    h = h * maxSize / w;
                    w = maxSize;
                }
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                const quality = 0.7;
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                
                if (dataUrl.length > 250000) {
                    showToast('Imagen muy grande, prueba con otra más pequeña');
                    return;
                }
                
                practiceData.imageUrl = dataUrl;
                finishSave(practiceData);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        if (editingId) {
            db.ref('practices/editor/' + editingId).once('value')
                .then(snap => {
                    if (snap.val() && snap.val().imageUrl) {
                        practiceData.imageUrl = snap.val().imageUrl;
                    }
                    finishSave(practiceData);
                });
        } else {
            finishSave(practiceData);
        }
    }
}

/* ============================================
   SECCIÓN 7: NAVEGACIÓN
   ============================================ */

let heroAnimationActive = true;

function navigateTo(page) {
    if (page === 'inicio') {
        document.getElementById('view-inicio').style.display = 'block';
        document.getElementById('app-shell').style.display = 'none';
        document.getElementById('appFooter').style.display = 'none';
        heroAnimationActive = true;
        initHeroCanvas();
    } else {
        document.getElementById('view-inicio').style.display = 'none';
        document.getElementById('app-shell').style.display = 'block';
        document.getElementById('appFooter').style.display = 'block';
        
        if (heroAnimationActive) {
            heroAnimationActive = false;
        }
        
        document.querySelectorAll('.content-page').forEach(p => p.classList.remove('active'));
        const targetPage = document.getElementById('page-' + page);
        if (targetPage) targetPage.classList.add('active');
        
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        const navTab = document.querySelector(`.nav-tab[data-nav="${page}"]`);
        if (navTab) navTab.classList.add('active');
        
        // Track badge explorer
        learningStats.sectionsVisited.add(page);
        saveLearningStats();
        checkAndUnlockBadges();
        
        if (page === 'circuitos') setTimeout(() => updateCircuitStatic(), 50);
        if (page === 'senales') setTimeout(updateWaveParams, 50);
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function switchSubTab(sub) {
    ['quiz', 'tarea', 'editor'].forEach(s => {
        const panel = document.getElementById(`panel-${s}`);
        if (panel) panel.style.display = 'none';
    });
    
    const targetPanel = document.getElementById(`panel-${sub}`);
    if (targetPanel) targetPanel.style.display = 'block';
    
    document.querySelectorAll('.sub-tab').forEach(b => {
        b.classList.remove('active');
        b.style.background = '#F1F5F9';
        b.style.color = '#475569';
    });
    
    const activeBtn = document.getElementById(`sub${sub.charAt(0).toUpperCase() + sub.slice(1)}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.background = '#0A84FF';
        activeBtn.style.color = '#fff';
    }
}

function switchCompTab(tab) {
    ['resistencias', 'capacitores', 'transistores', 'diodos'].forEach(t => {
        const panel = document.getElementById(`comp-${t}`);
        if (panel) panel.style.display = 'none';
    });
    
    const targetPanel = document.getElementById(`comp-${tab}`);
    if (targetPanel) targetPanel.style.display = 'block';
    
    document.querySelectorAll('.comp-tab').forEach(b => {
        b.classList.remove('active');
        b.style.background = '#F1F5F9';
        b.style.color = '#475569';
    });
    
    document.querySelectorAll('.comp-tab').forEach(b => {
        if (b.textContent.toLowerCase().includes(tab.substring(0, 4))) {
            b.classList.add('active');
            b.style.background = '#0A84FF';
            b.style.color = '#fff';
        }
    });
}

/* ============================================
   SECCIÓN 8: LEY DE OHM (MANTENER EXISTENTE)
   ============================================ */
let solveFor = 'V';

function setSolveFor(val) {
    solveFor = val;
    
    document.querySelectorAll('.solve-btn').forEach(b => {
        b.className = 'solve-btn px-4 py-2 text-sm font-semibold rounded-lg border-2 border-slate-300 dark:border-slate-600 text-slate-500 bg-white dark:bg-slate-700';
    });
    
    const activeBtn = document.getElementById(`solve${val}`);
    const cls = {
        V: 'border-volt text-volt bg-red-50 dark:bg-red-900/20',
        I: 'border-amps text-amps bg-amber-50 dark:bg-amber-900/20',
        R: 'border-ohms text-ohms bg-green-50 dark:bg-green-900/20'
    };
    
    activeBtn.className = `solve-btn px-4 py-2 text-sm font-semibold rounded-lg border-2 ${cls[val]}`;
    
    const inputs = { V: 'rangeV', I: 'rangeI', R: 'rangeR' };
    Object.keys(inputs).forEach(k => {
        const el = document.getElementById(inputs[k]);
        el.disabled = (k === val);
        el.style.opacity = (k === val) ? '0.4' : '1';
    });
    
    updateOhm();
}

function initOhm() {
    setSolveFor('V');
}

function updateOhm() {
    let V = parseFloat(document.getElementById('rangeV').value);
    let I = parseFloat(document.getElementById('rangeI').value);
    let R = parseFloat(document.getElementById('rangeR').value);
    let P;
    
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
    
    const resultDiv = document.getElementById('ohmResult');
    resultDiv.innerHTML = `
        <div class="text-sm opacity-80 mb-1">Resultado</div>
        <div class="font-mono text-2xl font-bold">
            ${solveFor === 'V' ? `V = I×R = ${V.toFixed(1)} V` :
              solveFor === 'I' ? `I = V/R = ${I.toFixed(3)} A` :
              `R = V/I = ${R.toFixed(1)} Ω`}
        </div>
        <div class="text-sm mt-2 opacity-80">P = ${P.toFixed(2)} W</div>
    `;
}

/* ============================================
   SECCIÓN 9: COMPONENTES (MANTENER EXISTENTE)
   ============================================ */
const rCols = [
    { n: 'Negro', c: '#1a1a1a', v: 0 },
    { n: 'Marrón', c: '#8B4513', v: 1 },
    { n: 'Rojo', c: '#FF0000', v: 2 },
    { n: 'Naranja', c: '#FF8C00', v: 3 },
    { n: 'Amarillo', c: '#FFD700', v: 4 },
    { n: 'Verde', c: '#228B22', v: 5 },
    { n: 'Azul', c: '#0000FF', v: 6 },
    { n: 'Violeta', c: '#8B008B', v: 7 },
    { n: 'Gris', c: '#808080', v: 8 },
    { n: 'Blanco', c: '#F0F0F0', v: 9 }
];

const rTols = [
    { n: 'Oro', c: '#FFD700', t: 5 },
    { n: 'Plata', c: '#C0C0C0', t: 10 },
    { n: 'Ninguno', c: '#D4A76A', t: 20 },
    { n: '1%', c: '#8B4513', t: 1 },
    { n: '2%', c: '#FF0000', t: 2 }
];

let rBands = { 1: 1, 2: 0, 3: 2, 4: 0, m: 2, t: 0 };

function resetResistorBandsAndUpdateUI() {
    const type = document.getElementById('resType').value;
    
    if (type === '4') {
        rBands = { 1: 1, 2: 0, 3: 2, 4: 0, m: 2, t: 0 };
    } else if (type === '5') {
        rBands = { 1: 1, 2: 0, 3: 2, 4: 0, 5: 0, m: 3, t: 0 };
    } else {
        rBands = {};
    }
    
    updateResistorUI();
}

function initResistor() {
    resetResistorBandsAndUpdateUI();
}

function updateResistorUI() {
    const type = document.getElementById('resType').value;
    const inputsDiv = document.getElementById('resInputs');
    const bodyDiv = document.getElementById('resBody');
    
    inputsDiv.innerHTML = '';
    bodyDiv.innerHTML = '';
    
    if (type === 'smd') {
        inputsDiv.innerHTML = `
            <input type="text" id="smdIn" placeholder="Ej: 103 o 4R7" 
                   class="form-input-easy w-full" oninput="calcResistor()">
        `;
        bodyDiv.style.padding = '12px 16px';
        bodyDiv.innerHTML = '<span class="font-mono font-bold text-xs" id="smdBody">SMD</span>';
    } else {
        const count = parseInt(type);
        const bandIds = [];
        
        for (let i = 1; i <= count; i++) {
            const isTol = (i === count);
            const isMult = (i === count - 1);
            const label = isTol ? 'Tolerancia' : (isMult ? 'Multiplicador' : 'Banda ' + i);
            
            inputsDiv.innerHTML += `
                <div>
                    <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">${label}</label>
                    <div class="flex flex-wrap gap-1" id="rBand${i}"></div>
                </div>
            `;
            bandIds.push(i);
        }
        
        bodyDiv.style.padding = '12px 24px';
        bodyDiv.style.gap = '3px';
        
        bandIds.forEach(idx => {
            const el = document.createElement('div');
            el.className = 'resistor-band';
            el.id = `rBandVisual${idx}`;
            bodyDiv.appendChild(el);
        });
        
        bandIds.forEach(idx => {
            const isTol = (idx === count);
            const isMult = (idx === count - 1);
            const container = document.getElementById(`rBand${idx}`);
            const arr = isTol ? rTols : rCols;
            
            arr.forEach((col, i) => {
                const sw = document.createElement('div');
                sw.className = 'color-swatch';
                sw.style.background = col.c;
                sw.style.width = '28px';
                sw.style.height = '28px';
                sw.title = col.n;
                sw.setAttribute('role', 'button');
                sw.setAttribute('tabindex', '0');
                sw.onclick = () => {
                    if (isTol) rBands.t = i;
                    else if (isMult) rBands.m = i;
                    else rBands[idx] = i;
                    
                    calcResistor();
                    trackBadgeProgress('component_calculated');
                };
                container.appendChild(sw);
            });
        });
    }
    
    calcResistor();
}

function calcResistor() {
    const type = document.getElementById('resType').value;
    const resEl = document.getElementById('resistorResult');
    
    if (type === 'smd') {
        const code = document.getElementById('smdIn').value.trim();
        let val = '—';
        
        if (code.length >= 3) {
            if (code.includes('R')) {
                val = code.replace('R', '.');
            } else {
                const d = code.substring(0, code.length - 1);
                const m = code.charAt(code.length - 1);
                val = parseFloat(d) * Math.pow(10, parseInt(m));
            }
        }
        
        document.getElementById('smdBody').textContent = code;
        resEl.innerHTML = `
            <div class="text-sm text-ohms font-medium mb-1">Valor</div>
            <div class="font-mono text-2xl font-bold text-slate-900 dark:text-white">${formatR(val)}</div>
        `;
        return;
    }
    
    const count = parseInt(type);
    let baseVal = 0;
    const multIdx = rBands.m || 0;
    const tolIdx = rBands.t || 0;
    
    if (count === 4) {
        const d1 = rBands[1] || 0;
        const d2 = rBands[2] || 0;
        baseVal = d1 * 10 + d2;
    } else if (count === 5) {
        const d1 = rBands[1] || 0;
        const d2 = rBands[2] || 0;
        const d3 = rBands[3] || 0;
        baseVal = d1 * 100 + d2 * 10 + d3;
    }
    
    const multVal = rCols[multIdx] ? Math.pow(10, multIdx) : 1;
    const finalVal = baseVal * multVal;
    const tolVal = rTols[tolIdx] ? rTols[tolIdx].t : 20;
    
    for (let i = 1; i <= count; i++) {
        const vis = document.getElementById(`rBandVisual${i}`);
        if (vis) {
            const isTol = (i === count);
            const isMult = (i === count - 1);
            const arr = isTol ? rTols : rCols;
            const idx = isTol ? tolIdx : (isMult ? multIdx : rBands[i]);
            vis.style.background = arr[idx] ? arr[idx].c : '#ccc';
        }
    }
    
    resEl.innerHTML = `
        <div class="text-sm text-ohms font-medium mb-1">Valor</div>
        <div class="font-mono text-2xl font-bold text-slate-900 dark:text-white">${formatR(finalVal)} ± ${tolVal}%</div>
    `;
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
    const c = document.getElementById('capCode').value.trim();
    let val = '—';
    
    if (c.length === 3) {
        const num = parseInt(c.substring(0, 2));
        const mult = parseInt(c.charAt(2));
        val = num * Math.pow(10, mult);
    }
    
    document.getElementById('capResult').innerHTML = `
        <div class="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">Capacitancia</div>
        <div class="font-mono text-2xl font-bold text-slate-900 dark:text-white">${formatC(val)}</div>
    `;
}

function updateCapQ() {
    const v = parseFloat(document.getElementById('capV').value) || 0;
    const c = parseFloat(document.getElementById('capF').value) || 0;
    document.getElementById('capQResult').textContent = `Q = ${(v * c).toFixed(4)} C`;
}

function updateTrans() {
    const ib = parseFloat(document.getElementById('transIb').value) || 0;
    const hfe = parseFloat(document.getElementById('transHfe').value) || 100;
    const vcc = parseFloat(document.getElementById('transVcc').value) || 0;
    const rc = parseFloat(document.getElementById('transRc').value) || 1000;
    
    const ic = ib * hfe;
    const vce = vcc - (ic / 1000) * rc;
    const vce_sat = 0.2;
    const sat = vce < vce_sat;
    
    document.getElementById('transResult').innerHTML = `
        <p>Ic = ${ic.toFixed(2)} mA</p>
        <p>Vce = ${sat ? vce_sat : vce.toFixed(2)} V</p>
        <p>Estado: <b>${sat ? 'Saturado (Switch ON)' : 'Activo (Amplificador)'}</b></p>
    `;
}

function updateDiod() {
    const vi = parseFloat(document.getElementById('diodVi').value) || 0;
    const vd = parseFloat(document.getElementById('diodVd').value) || 0.7;
    const r = parseFloat(document.getElementById('diodR').value) || 1000;
    
    const i = (vi > vd) ? ((vi - vd) / r) : 0;
    
    document.getElementById('diodResult').innerHTML = `
        <p>Corriente (I) = ${(i * 1000).toFixed(2)} mA</p>
        <p>Potencia Diodo = ${(i * vd).toFixed(4)} W</p>
        <p>Estado: ${vi > vd ? 'Conducción (ON)' : 'Corte (OFF)'}</p>
    `;
}

/* ============================================
   SECCIÓN 10: CIRCUITOS (MANTENER EXISTENTE)
   ============================================ */
let cType = 'serie';
let flowType = 'convencional';
let circuitStaticValues = {};
let electronPos = 0;
let animFrame;

function toggleFlowType() {
    flowType = flowType === 'convencional' ? 'electrones' : 'convencional';
    document.getElementById('flowLabel').textContent = flowType === 'convencional' ? 'Convencional' : 'Electrones';
    updateCircuitStatic();
}

function setCircuitType(t) {
    cType = t;
    
    ['btnSerie', 'btnParalelo', 'btnMixto'].forEach((id, idx) => {
        const types = ['serie', 'paralelo', 'mixto'];
        const btn = document.getElementById(id);
        btn.className = types[idx] === t
            ? 'px-4 py-2.5 rounded-lg text-sm font-semibold bg-electric-600 text-white shadow-md'
            : 'px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-500 dark:text-slate-300';
    });
    
    const inp = document.getElementById('circInputs');
    
    if (t === 'mixto') {
        inp.classList.remove('grid-cols-3');
        inp.classList.add('grid-cols-4');
        
        if (!document.getElementById('circR3')) {
            const d = document.createElement('div');
            d.innerHTML = `
                <label class="text-xs font-semibold text-ohms block mb-1">R₃</label>
                <input type="number" id="circR3" value="300" 
                       class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-mono bg-white dark:bg-slate-700 text-slate-900 dark:text-white" 
                       onchange="updateCircuitStatic()">
            `;
            inp.appendChild(d.firstChild);
            inp.appendChild(d.lastChild);
        }
    } else {
        inp.classList.add('grid-cols-3');
        inp.classList.remove('grid-cols-4');
        
        const r3 = document.getElementById('circR3');
        if (r3) r3.parentElement.remove();
    }
    
    updateCircuitStatic();
    
    // Track badge circuit builder
    learningStats.circuitsSimulated++;
    saveLearningStats();
    checkAndUnlockBadges();
}

function updateCircuitStatic() {
    const V = parseFloat(document.getElementById('circV').value) || 12;
    const R1 = parseFloat(document.getElementById('circR1').value) || 100;
    const R2 = parseFloat(document.getElementById('circR2').value) || 200;
    let R3 = cType === 'mixto' ? (parseFloat(document.getElementById('circR3').value) || 300) : 0;
    
    let Rt, It, V1, V2, I1, I2, I3;
    
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
        const Rp = (R2 * R3) / (R2 + R3);
        Rt = R1 + Rp;
        It = V / Rt;
        V1 = It * R1;
        V2 = V - V1;
        I1 = It;
        I2 = V2 / R2;
        I3 = V2 / R3;
    }
    
    const P = V * It;
    
    document.getElementById('circuitResults').innerHTML = `
        <div class="grid grid-cols-2 gap-3">
            <div class="bg-white dark:bg-slate-700 rounded-lg p-3 border border-slate-100 dark:border-slate-600">
                <div class="text-xs text-slate-400 dark:text-slate-500">R total</div>
                <div class="font-mono font-bold text-ohms">${Rt.toFixed(1)}Ω</div>
            </div>
            <div class="bg-white dark:bg-slate-700 rounded-lg p-3 border border-slate-100 dark:border-slate-600">
                <div class="text-xs text-slate-400 dark:text-slate-500">I total</div>
                <div class="font-mono font-bold text-amps">${It.toFixed(4)}A</div>
            </div>
            <div class="bg-white dark:bg-slate-700 rounded-lg p-3 border border-slate-100 dark:border-slate-600">
                <div class="text-xs text-slate-400 dark:text-slate-500">V R₁</div>
                <div class="font-mono font-bold text-volt">${V1.toFixed(2)}V</div>
            </div>
            <div class="bg-white dark:bg-slate-700 rounded-lg p-3 border border-slate-100 dark:border-slate-600">
                <div class="text-xs text-slate-400 dark:text-slate-500">V R₂</div>
                <div class="font-mono font-bold text-volt">${V2.toFixed(2)}V</div>
            </div>
        </div>
    `;
    
    const rules = cType === 'serie'
        ? ['R<sub>T</sub>=R₁+R₂', 'Corriente igual', 'Voltaje se divide']
        : cType === 'paralelo'
        ? ['1/R<sub>T</sub>=1/R₁+1/R₂', 'Voltaje igual', 'Corriente se divide']
        : ['R₁ en serie con (R₂||R₃)', 'Mixto combina serie y paralelo', 'La corriente principal pasa por R₁'];
    
    document.getElementById('circuitRules').innerHTML = rules.map(r =>
        `<p class="text-sm text-slate-600 dark:text-slate-300">• ${r}</p>`
    ).join('');
    
    circuitStaticValues = { V, R1, R2, R3, Rt, It, V1, V2, I1, I2, I3 };
    drawCircuitAnimation();
}

function initCircuit() {
    updateCircuitStatic();
}

function drawCircuitAnimation() {
    const canvas = document.getElementById('circuitCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const cw = canvas.width, ch = canvas.height;
    const { V, R1, R2, R3, It } = circuitStaticValues;
    const isConv = flowType === 'convencional';
    const pColor = isConv ? '#F59E0B' : '#3B82F6';
    const gColor = isConv ? 'rgba(245,158,11,0.3)' : 'rgba(59,130,246,0.3)';
    
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
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.stroke();
        ctx.shadowColor = 'transparent';
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y - 1);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y - 1);
        ctx.stroke();
    }
    
    function drawBattery(cx, cy) {
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;
        let grad = ctx.createLinearGradient(cx - 15, cy, cx + 15, cy);
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
        let grad = ctx.createLinearGradient(cx, cy - 10, cx, cy + 10);
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
        const numE = 6;
        for (let i = 0; i < numE; i++) {
            let t = (electronPos * speed + i / numE) % 1;
            if (!isConv) t = 1 - t;
            let pos = t * (path.length - 1);
            let idx = Math.floor(pos);
            let frac = pos - idx;
            if (idx >= path.length - 1) { idx = path.length - 2; frac = 1; }
            let ax = path[idx].x, ay = path[idx].y;
            let bx = path[idx + 1].x, by = path[idx + 1].y;
            let ex = ax + (bx - ax) * frac, ey = ay + (by - ay) * frac;
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
        let TL = { x: 80, y: 80 }, TR = { x: 420, y: 80 }, BR = { x: 420, y: 300 }, BL = { x: 80, y: 300 };
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
        let TL = { x: 80, y: 80 }, TR = { x: 420, y: 80 }, BR = { x: 420, y: 300 }, BL = { x: 80, y: 300 };
        let N1T = { x: 220, y: 80 }, N1B = { x: 220, y: 300 };
        let N2T = { x: 360, y: 80 }, N2B = { x: 360, y: 300 };
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
        let TL = { x: 80, y: 80 }, TR = { x: 420, y: 80 }, BR = { x: 420, y: 300 }, BL = { x: 80, y: 300 };
        let J1T = { x: 180, y: 80 }, J1B = { x: 180, y: 300 };
        let J2T = { x: 300, y: 80 }, J2B = { x: 300, y: 300 };
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
   SECCIÓN 11: SEÑALES/WAVEFORM (MANTENER EXISTENTE)
   ============================================ */
let wType = 'sine', wAmp = 5, wFreq = 2, wTime = 0;

function setWaveType(t) {
    wType = t;
    
    document.querySelectorAll('.wave-btn').forEach(b => {
        b.className = 'wave-btn px-4 py-2 rounded-lg text-sm font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300';
    });
    
    const btn = document.getElementById(`btn${t.charAt(0).toUpperCase() + t.slice(1)}`);
    if (btn) btn.className = 'wave-btn px-4 py-2 rounded-lg text-sm font-semibold bg-electric-600 text-white';
    
    // Track badge wave rider
    learningStats.wavesExplored.add(t);
    saveLearningStats();
    checkAndUnlockBadges();
    
    updateWaveParams();
}

function updateWaveParams() {
    wAmp = parseFloat(document.getElementById('ampSlider').value);
    wFreq = parseFloat(document.getElementById('freqSlider').value);
    
    document.getElementById('ampVal').textContent = wAmp.toFixed(1) + ' V';
    document.getElementById('freqVal').textContent = wFreq.toFixed(1) + ' Hz';
    
    const T = 1 / wFreq;
    let Vrms;
    
    if (wType === 'sine') Vrms = (wAmp / Math.sqrt(2)).toFixed(2);
    else if (wType === 'square') Vrms = wAmp.toFixed(2);
    else Vrms = (wAmp / Math.sqrt(3)).toFixed(2);
    
    document.getElementById('waveProps').innerHTML = `
        <div class="flex justify-between"><span class="text-slate-500 dark:text-slate-400">Vp</span><span class="font-mono font-semibold text-slate-900 dark:text-white">${wAmp.toFixed(1)}V</span></div>
        <div class="flex justify-between"><span class="text-slate-500 dark:text-slate-400">f</span><span class="font-mono font-semibold text-slate-900 dark:text-white">${wFreq.toFixed(1)}Hz</span></div>
        <div class="flex justify-between"><span class="text-slate-500 dark:text-slate-400">T</span><span class="font-mono font-semibold text-slate-900 dark:text-white">${T.toFixed(3)}s</span></div>
        <div class="flex justify-between"><span class="text-slate-500 dark:text-slate-400">Vrms</span><span class="font-mono font-semibold text-slate-900 dark:text-white">${Vrms}V</span></div>
    `;
}

function initWaveform() {
    const canvas = document.getElementById('waveCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    updateWaveParams();
    
    function draw() {
        const cw = canvas.width, ch = canvas.height;
        ctx.fillStyle = '#0C1A2E';
        ctx.fillRect(0, 0, cw, ch);
        
        // Grid
        ctx.strokeStyle = 'rgba(10,132,255,.1)';
        ctx.lineWidth = 1;
        for (let x = 0; x < cw; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, ch);
            ctx.stroke();
        }
        for (let y = 0; y < ch; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(cw, y);
            ctx.stroke();
        }
        
        // Center lines
        ctx.strokeStyle = 'rgba(10,132,255,.25)';
        ctx.beginPath();
        ctx.moveTo(0, ch / 4);
        ctx.lineTo(cw, ch / 4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, 3 * ch / 4);
        ctx.lineTo(cw, 3 * ch / 4);
        ctx.stroke();
        
        // Zero line
        ctx.strokeStyle = 'rgba(255,165,0,0.9)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, ch / 2);
        ctx.lineTo(cw, ch / 2);
        ctx.stroke();
        
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
        
        const midY = ch / 2, sY = (ch / 2 - 30) / 12;
        
        for (let x = 0; x < cw; x++) {
            const t = (x / cw) * 3 + wTime;
            let y;
            const ph = 2 * Math.PI * wFreq * t;
            
            if (wType === 'sine') y = midY - wAmp * Math.sin(ph) * sY;
            else if (wType === 'square') y = midY - wAmp * Math.sign(Math.sin(ph)) * sY;
            else if (wType === 'triangle') y = midY - wAmp * (2 / Math.PI) * Math.asin(Math.sin(ph)) * sY;
            else if (wType === 'sawtooth') {
                const p = (wFreq * t) % 1;
                y = midY - wAmp * (2 * p - 1) * sY;
            } else if (wType === 'half') y = midY - Math.max(0, wAmp * Math.sin(ph)) * sY;
            else y = midY - wAmp * sY;
            
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        wTime += 0.015;
        requestAnimationFrame(draw);
    }
    
    draw();
}

/* ============================================
   SECCIÓN 12: QUIZ/PRÁCTICA (MANTENER EXISTENTE)
   ============================================ */
const QQ = [
    { cat: 'Ohm', q: 'R=100Ω I=0.5A ¿V=?', o: ['25V', '50V', '100V', '200V'], c: 1, e: 'V=I×R=50V' },
    { cat: 'Comp.', q: '¿1kΩ ±5%?', o: ['M-N-R-Oro', 'M-N-N-Oro', 'R-N-M-Oro', 'M-R-N-Oro'], c: 0, e: '1-0-×100=1kΩ' },
    { cat: 'Circ.', q: 'Serie R₁=10 R₂=20 ¿RT?', o: ['6.67', '30', '200', '15'], c: 1, e: 'RT=30Ω' },
    { cat: 'Circ.', q: 'Paralelo: ¿qué es igual?', o: ['Corriente', 'Resistencia', 'Voltaje', 'Potencia'], c: 2, e: 'Voltaje igual en ramas' },
    { cat: 'Ohm', q: '¿Unidad resistencia?', o: ['Voltio', 'Amperio', 'Ohmio', 'Vatio'], c: 2, e: 'Ohmio' },
    { cat: 'Comp.', q: '¿Qué almacena carga?', o: ['Resistencia', 'Inductor', 'Capacitor', 'Diodo'], c: 2, e: 'Capacitor' },
    { cat: 'Señal', q: 'T=0.02s ¿f?', o: ['20Hz', '50Hz', '100Hz', '0.02Hz'], c: 1, e: 'f=50Hz' },
    { cat: 'Ohm', q: 'V=12 R=4 ¿P?', o: ['3W', '16W', '36W', '48W'], c: 2, e: 'P=36W' }
];

let cQ = 0, sc = 0, qans = false;

function initQuiz() {
    showQ();
}

function showQ() {
    if (cQ >= QQ.length) {
        document.getElementById('quizCard').style.display = 'none';
        document.getElementById('quizComplete').style.display = 'block';
        document.getElementById('finalScore').textContent = sc + '/' + QQ.length;
        
        const p = sc / QQ.length;
        document.getElementById('finalMsg').textContent = p >= .8 ? '¡Excelente!' : p >= .5 ? 'Buen trabajo' : 'Sigue practicando';
        return;
    }
    
    const q = QQ[cQ];
    document.getElementById('qNum').textContent = cQ + 1;
    document.getElementById('qTotal').textContent = QQ.length;
    document.getElementById('qProgress').style.width = ((cQ + 1) / QQ.length * 100) + '%';
    document.getElementById('quizCategory').textContent = q.cat;
    document.getElementById('quizQuestion').textContent = q.q;
    document.getElementById('quizFeedback').style.display = 'none';
    document.getElementById('btnNext').style.display = 'none';
    document.getElementById('btnSkip').style.display = 'inline-block';
    qans = false;
    
    document.getElementById('quizOptions').innerHTML = q.o.map((o, i) => `
        <button onclick="ansQ(${i})" class="quiz-option w-full text-left px-5 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-electric-400 hover:bg-electric-50 dark:hover:bg-electric-900/20 transition-all flex items-center gap-3">
            <span class="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500">${String.fromCharCode(65 + i)}</span>
            ${o}
        </button>
    `).join('');
}

function ansQ(i) {
    if (qans) return;
    qans = true;
    
    const q = QQ[cQ];
    
    document.querySelectorAll('.quiz-option').forEach((o, j) => {
        o.style.pointerEvents = 'none';
        if (j === q.c) o.classList.add('correct');
        if (i === j && j !== q.c) o.classList.add('incorrect');
    });
    
    const fb = document.getElementById('quizFeedback');
    fb.style.display = 'block';
    
    if (i === q.c) {
        sc++;
        document.getElementById('qScore').textContent = sc;
        fb.className = 'mt-6 rounded-xl p-4 text-sm bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300';
        fb.innerHTML = `✅ ${q.e}`;
        playSound('correct');
    } else {
        fb.className = 'mt-6 rounded-xl p-4 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300';
        fb.innerHTML = `❌ ${q.e}`;
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
   SECCIÓN 13: KATEX (MANTENER EXISTENTE)
   ============================================ */
function renderFormulas() {
    const tryR = () => {
        if (typeof katex === 'undefined') {
            setTimeout(tryR, 200);
            return;
        }
        
        const fm = {
            f1: 'V = I \\cdot R',
            f2: 'I = \\dfrac{V}{R}',
            f3: 'R = \\dfrac{V}{I}',
            f4: 'P = V \\cdot I',
            f5: 'P = I^2 \\cdot R',
            f6: 'P = \\dfrac{V^2}{R}'
        };
        
        Object.keys(fm).forEach(id => {
            const el = document.getElementById(id);
            if (el) katex.render(fm[id], el, { throwOnError: false });
        });
        
        const cf = {
            fc_r: 'R = \\dfrac{V}{I}\\;(\\Omega)',
            fc_c: 'Q = C \\cdot V\\;(F)',
            fc_d: 'V_d \\approx 0.7\\;V'
        };
        
        Object.keys(cf).forEach(id => {
            const el = document.getElementById(id);
            if (el) katex.render(cf[id], el, { throwOnError: false });
        });
    };
    
    tryR();
}

/* ============================================
   SECCIÓN 14: [NUEVO] VIDEO HERO (Feature A)
   ============================================ */

/**
 * Reproducir video del hero
 */
function playVideo() {
    const placeholder = document.getElementById('videoPlaceholder');
    const iframe = document.getElementById('videoFrame');
    const videoUrlInput = document.getElementById('videoUrl');
    
    if (!placeholder || !iframe || !videoUrlInput) return;
    
    // Ocultar placeholder
    placeholder.style.display = 'none';
    
    // Mostrar iframe
    iframe.classList.remove('hidden');
    
    // Setear URL con autoplay
    const videoUrl = videoUrlInput.value;
    iframe.src = videoUrl + '?autoplay=1';
    
    log('Video reproducido:', videoUrl);
}

/* ============================================
   SECCIÓN 15: [NUEVO] MINI-JUEGO ENGINE (Feature B)
   ============================================ */

/**
 * Banco de preguntas del mini-juego (30+ preguntas organizadas por dificultad)
 */
const GAME_QUESTIONS = {
    easy: [
        // Ley de Ohm básica
        { cat: 'Ohm', q: 'Si V=12V y R=4Ω, ¿cuál es la corriente I?', options: ['3A', '48A', '0.33A', '8A'], correct: 0, explanation: 'I = V/R = 12/4 = 3A' },
        { cat: 'Ohm', q: 'Si I=2A y R=10Ω, ¿cuál es el voltaje V?', options: ['20V', '5V', '0.2V', '12V'], correct: 0, explanation: 'V = I×R = 2×10 = 20V' },
        { cat: 'Ohm', q: 'Si V=9V e I=3A, ¿cuál es la resistencia R?', options: ['3Ω', '27Ω', '0.33Ω', '12Ω'], correct: 0, explanation: 'R = V/I = 9/3 = 3Ω' },
        { cat: 'Ohm', q: '¿Cuál es la unidad de voltaje?', options: ['Voltio (V)', 'Amperio (A)', 'Ohmio (Ω)', 'Vatio (W)'], correct: 0, explanation: 'El voltio (V) es la unidad de voltaje o tensión eléctrica' },
        { cat: 'Ohm', q: '¿Cuál es la unidad de corriente?', options: ['Amperio (A)', 'Voltio (V)', 'Ohmio (Ω)', 'Henrio (H)'], correct: 0, explanation: 'El amperio (A) es la unidad de corriente eléctrica' },
        { cat: 'Ohm', q: 'En un circuito, si duplicamos el voltaje y mantenemos R constante, la corriente:', options: ['Se duplica', 'Se reduce a la mitad', 'No cambia', 'Se cuadruplica'], correct: 0, explanation: 'I = V/R, si V×2 entonces I×2 (Ley de Ohm)' },
        { cat: 'Ohm', q: 'Si V=5V y R=100Ω, ¿I?', options: ['0.05A (50mA)', '0.5A', '20A', '500mA'], correct: 0, explanation: 'I = V/R = 5/100 = 0.05A = 50mA' },
        { cat: 'Ohm', q: '¿Qué dice la Ley de Ohm?', options: ['V = I × R', 'P = V × I', 'I = V × R', 'R = V × I'], correct: 0, explanation: 'La Ley de Ohm establece que V = I × R' },
        { cat: 'Comp.', q: 'Un resistor de color Marrón-Negro-Rojo tiene un valor aproximado de:', options: ['1 kΩ', '100 Ω', '10 kΩ', '1 MΩ'], correct: 0, explanation: 'Marrón=1, Negro=0, Rojo=×100 → 10×100 = 1000Ω = 1kΩ' },
        { cat: 'Comp.', q: '¿Qué componente almacena energía en un campo eléctrico?', options: ['Capacitor', 'Resistor', 'Inductor', 'Diodo'], correct: 0, explanation: 'El capacitor almacena energía en forma de campo eléctrico' }
    ],
    medium: [
        // LED resistor calculation
        { cat: 'Comp.', q: 'LED rojo con Vf=2V, If=20mA, fuente de 9V. ¿Resistencia limitadora?', options: ['350Ω', '450Ω', '150Ω', '250Ω'], correct: 0, explanation: 'R = (Vfuente - Vled) / I = (9-2)/0.02 = 350Ω' },
        { cat: 'Comp.', q: 'Un capacitor de código "104" tiene una capacitancia de:', options: ['100 nF', '10 μF', '104 pF', '1 μF'], correct: 0, explanation: '104 → 10 × 10^4 pF = 100,000 pF = 100 nF = 0.1μF' },
        // Serie/Paralelo simple
        { cat: 'Circ.', q: 'Dos resistencias de 100Ω en serie dan como resultado:', options: ['200Ω', '100Ω', '50Ω', '10kΩ'], correct: 0, explanation: 'Rs = R1 + R2 = 100 + 100 = 200Ω' },
        { cat: 'Circ.', q: 'Dos resistencias de 100Ω en paralelo dan como resultado:', options: ['50Ω', '200Ω', '100Ω', '25Ω'], correct: 0, explanation: 'Rp = (R1×R2)/(R1+R2) = 10000/200 = 50Ω' },
        // Potencia
        { cat: 'Ohm', q: 'Si V=10V e I=2A, ¿cuál es la potencia disipada?', options: ['20W', '5W', '100W', '200W'], correct: 0, explanation: 'P = V × I = 10 × 2 = 20W' },
        { cat: 'Ohm', q: 'Un resistor de 100Ω con 0.1A disipa aproximadamente:', options: ['1W', '10W', '0.1W', '100W'], correct: 0, explanation: 'P = I²R = 0.01 × 100 = 1W' },
        // Códigos de colores
        { cat: 'Comp.', q: 'El código de colores Amarillo-Violeta-Naranja representa:', options: ['47 kΩ', '470 Ω', '4.7 MΩ', '470 kΩ'], correct: 0, explanation: 'Amarillo=4, Violeta=7, Naranja=×1000 → 47×1000 = 47kΩ' },
        { cat: 'Comp.', q: '¿Qué tolerancia representa la banda dorada?', options: ['±5%', '±10%', '±1%', '±20%'], correct: 0, explanation: 'La banda dorada indica una tolerancia de ±5%' },
        // Divisor de voltaje básico
        { cat: 'Circ.', q: 'En un divisor con R1=R2=1kΩ y Vin=10V, Vout es aproximadamente:', options: ['5V', '10V', '2.5V', '0V'], correct: 0, explanation: 'Vout = Vin × (R2/(R1+R2)) = 10 × (1/2) = 5V' },
        { cat: 'Señal', q: 'Una señal senoidal de 50Hz tiene un periodo de:', options: ['20 ms', '50 ms', '0.02 s', '2 s'], correct: 0, explanation: 'T = 1/f = 1/50 = 0.02s = 20ms' }
    ],
    hard: [
        // Circuitos mixtos
        { cat: 'Mixto', q: 'Divisor de voltaje: Vin=12V, R1=R2=1kΩ. ¿Vout en R2?', options: ['6V', '12V', '3V', '9V'], correct: 0, explanation: 'Vout = Vin × R2/(R1+R2) = 12 × 1/2 = 6V' },
        { cat: 'Mixto', q: 'Circuito: R1=1kΩ en serie con (R2=2kΩ||R3=2kΩ). Si V=12V, ¿Itotal?', options: ['8 mA', '4 mA', '12 mA', '6 mA'], correct: 0, explanation: 'Rp = (2k×2k)/(2k+2k) = 1kΩ. Rt = 1k+1k = 2kΩ. I = 12/2k = 6mA' },
        // Transistor NPN
        { cat: 'Trans.', q: 'Transistor NPN con Ib=0.1mA y β=100. ¿Corriente de colector Ic?', options: ['10 mA', '1 mA', '100 mA', '0.01 mA'], correct: 0, explanation: 'Ic = β × Ib = 100 × 0.1mA = 10mA' },
        { cat: 'Trans.', q: 'Si un transistor NPN está en saturación, Vce es aproximadamente:', options: ['0.2V', '0.7V', 'Vcc', '12V'], correct: 0, explanation: 'En saturación, Vce(sat) ≈ 0.2V (como interruptor cerrado)' },
        // Diodo
        { cat: 'Diodo', q: 'Diodo silicona polarizado directamente, caída de voltaje típica:', options: ['0.7V', '0.3V', '1.5V', '0V'], correct: 0, explanation: 'Los diodos de silicio tienen Vf ≈ 0.7V en conducción directa' },
        { cat: 'Diodo', q: 'Fuente 5V, diodo (0.7V), resistor 220Ω. ¿Corriente I?', options: ['≈19.5 mA', '22.7 mA', '5 mA', '0.23 mA'], correct: 0, explanation: 'I = (5V - 0.7V) / 220Ω ≈ 19.5mA' },
        // RMS
        { cat: 'Señal', q: 'Valor RMS de una señal senoidal con Vp=10V:', options: ['≈7.07V', '10V', '14.14V', '5V'], correct: 0, explanation: 'Vrms = Vp/√2 = 10/1.414 ≈ 7.07V' },
        { cat: 'Señal', q: 'Valor pico de una señal AC de 220V RMS (aprox):', options: ['≈311V', '220V', '156V', '440V'], correct: 0, explanation: 'Vp = Vrms × √2 = 220 × 1.414 ≈ 311V' },
        // SMD
        { cat: 'Comp.', q: 'Código SMD "472" representa:', options: ['4.7 kΩ', '47 Ω', '472 Ω', '4.72 MΩ'], correct: 0, explanation: '472 → 47 × 10² = 4700Ω = 4.7kΩ' },
        { cat: 'Comp.', q: 'Código SMD "4R7" representa:', options: ['4.7 Ω', '470 Ω', '47 kΩ', '4.7 MΩ'], correct: 0, explanation: '4R7 significa 4.7 ohms (la R actúa como punto decimal)' }
    ]
};

/**
 * Abrir modal del mini-juego
 */
function openMiniGame() {
    const modal = document.getElementById('miniGameModal');
    if (modal) {
        modal.style.display = 'flex';
        showGameStartScreen();
        playSound('click');
    }
}

/**
 * Cerrar modal del mini-juego
 */
function closeMiniGame() {
    const modal = document.getElementById('miniGameModal');
    if (modal) {
        modal.style.display = 'none';
        stopGameTimer();
        playSound('click');
    }
}

/**
 * Resetear estado del juego
 */
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
        roundsCompleted: gameStats.roundsCompleted, // Mantener rondas previas
        maxStreak: gameStats.maxStreak,             // Mantener máximo histórico
        currentStreak: 0,
        difficulty: 'easy',
        questionStartTime: 0,
        timerInterval: null,
        currentQuestion: null
    };
}

/**
 * Mostrar pantalla de inicio del juego
 */
function showGameStartScreen() {
    const startScreen = document.getElementById('gameStartScreen');
    const playArea = document.getElementById('gamePlayArea');
    const resultsArea = document.getElementById('gameResultsArea');
    const feedbackArea = document.getElementById('gameFeedbackArea');
    
    if (startScreen) startScreen.style.display = 'block';
    if (playArea) playArea.style.display = 'none';
    if (resultsArea) resultsArea.style.display = 'none';
    if (feedbackArea) feedbackArea.classList.add('hidden');
    
    updateGameUI();
}

/**
 * Iniciar nueva ronda del juego
 */
function startMiniGameRound() {
    resetGameState();
    gameStats.isActive = true;
    
    const startScreen = document.getElementById('gameStartScreen');
    const playArea = document.getElementById('gamePlayArea');
    
    if (startScreen) startScreen.style.display = 'none';
    if (playArea) playArea.style.display = 'block';
    
    startGameTimer();
    nextGameQuestion();
    playSound('click');
}

/**
 * Iniciar timer del juego
 */
function startGameTimer() {
    stopGameTimer(); // Limpiar timer anterior si existe
    
    gameStats.timerInterval = setInterval(() => {
        gameStats.timeLeft--;
        updateGameUI();
        
        if (gameStats.timeLeft <= 0) {
            endGameRound();
        }
    }, 1000);
}

/**
 * Detener timer del juego
 */
function stopGameTimer() {
    if (gameStats.timerInterval) {
        clearInterval(gameStats.timerInterval);
        gameStats.timerInterval = null;
    }
}

/**
 * Obtener siguiente pregunta aleatoria según dificultad
 */
function nextGameQuestion() {
    if (!gameStats.isActive) return;
    
    const questions = GAME_QUESTIONS[gameStats.difficulty];
    if (!questions || questions.length === 0) return;
    
    // Seleccionar pregunta aleatoria
    const randomIndex = Math.floor(Math.random() * questions.length);
    gameStats.currentQuestion = questions[randomIndex];
    gameStats.questionStartTime = Date.now();
    
    renderGameQuestion();
}

/**
 * Renderizar pregunta actual en el DOM
 */
function renderGameQuestion() {
    if (!gameStats.currentQuestion) return;
    
    const q = gameStats.currentQuestion;
    
    // Actualizar categoría
    const catEl = document.getElementById('gameCategory');
    if (catEl) catEl.textContent = q.cat;
    
    // Actualizar texto de pregunta
    const questionTextEl = document.getElementById('gameQuestionText');
    if (questionTextEl) questionTextEl.textContent = q.q;
    
    // Generar opciones mezcladas visualmente
    const optionsContainer = document.getElementById('gameOptions');
    if (optionsContainer) {
        // Crear array de índices mezclados
        const indices = [0, 1, 2, 3];
        // Fisher-Yates shuffle simple
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        
        optionsContainer.innerHTML = indices.map((originalIndex, displayIndex) => `
            <button onclick="answerGameQuestion(${originalIndex}, this)" 
                    class="game-option-btn"
                    data-index="${originalIndex}">
                <span class="font-bold mr-2">${String.fromCharCode(65 + displayIndex)})</span>
                ${q.options[originalIndex]}
            </button>
        `).join('');
    }
    
    // Limpiar feedback
    const feedbackArea = document.getElementById('gameFeedbackArea');
    if (feedbackArea) {
        feedbackArea.classList.add('hidden');
        feedbackArea.innerHTML = '';
    }
}

/**
 * Procesar respuesta del usuario
 */
function answerGameQuestion(selectedIndex, btnElement) {
    if (!gameStats.isActive || !gameStats.currentQuestion) return;
    
    // Deshabilitar todos los botones
    const allButtons = document.querySelectorAll('#gameOptions .game-option-btn');
    allButtons.forEach(btn => {
        btn.disabled = true;
    });
    
    const q = gameStats.currentQuestion;
    const isCorrect = selectedIndex === q.correct;
    
    // Marcar botones
    allButtons.forEach((btn, idx) => {
        const originalIndex = parseInt(btn.dataset.index);
        if (originalIndex === q.correct) {
            btn.classList.add('selected-correct');
        }
        if (selectedIndex === originalIndex && !isCorrect) {
            btn.classList.add('selected-incorrect');
        }
    });
    
    // Calcular tiempo de respuesta
    const responseTime = (Date.now() - gameStats.questionStartTime) / 1000;
    
    // Calcular puntos
    let pointsEarned = 0;
    
    if (isCorrect) {
        // Base points
        pointsEarned = CONFIG.game.basePoints;
        
        // Speed bonus
        if (responseTime < CONFIG.game.speedBonus.fast.threshold) {
            pointsEarned *= CONFIG.game.speedBonus.fast.multiplier;
            gameStats.fastResponses++;
        } else if (responseTime < CONFIG.game.speedBonus.medium.threshold) {
            pointsEarned *= CONFIG.game.speedBonus.medium.multiplier;
        } else if (responseTime < CONFIG.game.speedBonus.slow.threshold) {
            pointsEarned *= CONFIG.game.speedBonus.slow.multiplier;
        }
        
        // Combo multiplier (máximo x5)
        gameStats.combo++;
        const comboMultiplier = Math.min(gameStats.combo, CONFIG.game.maxCombo);
        pointsEarned *= comboMultiplier;
        
        // Actualizar estadísticas
        gameStats.score += pointsEarned;
        gameStats.correctAnswers++;
        gameStats.currentStreak++;
        gameStats.maxStreak = Math.max(gameStats.maxStreak, gameStats.currentStreak);
        gameStats.maxCombo = Math.max(gameStats.maxCombo, comboMultiplier);
        
        playSound('correct');
        
        // Verificar subida de dificultad
        if (gameStats.currentStreak % CONFIG.game.difficultyThreshold === 0) {
            upgradeDifficulty();
        }
    } else {
        // Respuesta incorrecta
        gameStats.combo = 0;
        gameStats.currentStreak = 0;
        playSound('incorrect');
    }
    
    // Mostrar feedback
    showGameFeedback(isCorrect, q.explanation, responseTime, pointsEarned);
    
    // Actualizar UI
    updateGameUI();
    
    // Siguiente pregunta después de delay
    setTimeout(() => {
        if (gameStats.isActive) {
            nextGameQuestion();
        }
    }, 1500);
}

/**
 * Mostrar feedback de respuesta
 */
function showGameFeedback(isCorrect, explanation, time, points) {
    const feedbackArea = document.getElementById('gameFeedbackArea');
    if (!feedbackArea) return;
    
    feedbackArea.classList.remove('hidden');
    
    const icon = isCorrect ? '✅' : '❌';
    const bgColor = isCorrect ? 'feedback-correct' : 'feedback-incorrect';
    
    feedbackArea.innerHTML = `
        <div class="${bgColor}">
            <div class="flex items-center gap-2 mb-2">
                <span class="text-2xl">${icon}</span>
                <span class="font-bold">${isCorrect ? '¡Correcto!' : 'Incorrecto'}</span>
            </div>
            <p class="mb-1">${explanation}</p>
            <div class="text-xs opacity-75 mt-2">
                Tiempo: ${time.toFixed(1)}s | Puntos: +${points}
            </div>
        </div>
    `;
}

/**
 * Subir dificultad del juego
 */
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

/**
 * Finalizar ronda del juego
 */
function endGameRound() {
    gameStats.isActive = false;
    stopGameTimer();
    
    gameStats.totalScore += gameStats.score;
    gameStats.roundsCompleted++;
    
    // Guardar estadísticas
    saveGameStats();
    
    // Verificar badges
    checkAndUnlockBadges();
    
    // Mostrar resultados
    showGameResults();
}

/**
 * Mostrar pantalla de resultados finales
 */
function showGameResults() {
    const playArea = document.getElementById('gamePlayArea');
    const resultsArea = document.getElementById('gameResultsArea');
    
    if (playArea) playArea.style.display = 'none';
    if (resultsArea) resultsArea.style.display = 'block';
    
    // Actualizar valores de resultados
    const finalScoreEl = document.getElementById('gameFinalScore');
    const correctEl = document.getElementById('resultCorrect');
    const comboEl = document.getElementById('resultMaxCombo');
    const roundsEl = document.getElementById('resultRounds');
    
    if (finalScoreEl) finalScoreEl.textContent = gameStats.score + ' pts';
    if (correctEl) correctEl.textContent = gameStats.correctAnswers;
    if (comboEl) comboEl.textContent = 'x' + gameStats.maxCombo;
    if (roundsEl) roundsEl.textContent = gameStats.roundsCompleted;
}

/**
 * Actualizar UI del juego
 */
function updateGameUI() {
    // Timer
    const timerEl = document.getElementById('gameTimer');
    if (timerEl) timerEl.textContent = gameStats.timeLeft;
    
    // Score
    const scoreEl = document.getElementById('gameScore');
    if (scoreEl) scoreEl.textContent = gameStats.score;
    
    // Combo
    const comboEl = document.getElementById('gameCombo');
    if (comboEl) comboEl.textContent = 'x' + Math.min(gameStats.combo + 1, 1); // Mostrar combo actual
    
    // Correct answers
    const correctEl = document.getElementById('gameCorrect');
    if (correctEl) correctEl.textContent = gameStats.correctAnswers;
    
    // Time bar
    const timeBarEl = document.getElementById('gameTimeBar');
    if (timeBarEl) {
        const percentage = (gameStats.timeLeft / CONFIG.game.defaultTime) * 100;
        timeBarEl.style.width = percentage + '%';
    }
    
    // Difficulty badge
    updateDifficultyBadge();
}

/**
 * Actualizar badge de dificultad
 */
function updateDifficultyBadge() {
    const badgeEl = document.getElementById('gameDifficultyBadge');
    if (!badgeEl) return;
    
    const configs = {
        easy: { text: 'FÁCIL', class: 'difficulty-easy' },
        medium: { text: 'MEDIO', class: 'difficulty-medium' },
        hard: { text: 'DIFÍCIL', class: 'difficulty-hard' }
    };
    
    const config = configs[gameStats.difficulty];
    badgeEl.textContent = config.text;
    badgeEl.className = `px-3 py-1 text-xs font-bold rounded-full ${config.class}`;
}

/**
 * Guardar estadísticas del juego en localStorage
 */
function saveGameStats() {
    try {
        const statsToSave = {
            totalScore: gameStats.totalScore,
            fastResponses: gameStats.fastResponses,
            maxStreak: gameStats.maxStreak,
            maxCombo: gameStats.maxCombo,
            roundsCompleted: gameStats.roundsCompleted,
            lastPlayed: new Date().toISOString()
        };
        
        localStorage.setItem('electronilab_gamestats', JSON.stringify(statsToSave));
        log('Estadísticas del juego guardadas', statsToSave);
    } catch (error) {
        logError('Error guardando estadísticas del juego', error);
    }
}

/**
 * Cargar estadísticas del juego desde localStorage
 */
function loadGameStats() {
    try {
        const saved = localStorage.getItem('electronilab_gamestats');
        if (saved) {
            const stats = JSON.parse(saved);
            gameStats.totalScore = stats.totalScore || 0;
            gameStats.fastResponses = stats.fastResponses || 0;
            gameStats.maxStreak = stats.maxStreak || 0;
            gameStats.maxCombo = stats.maxCombo || 0;
            gameStats.roundsCompleted = stats.roundsCompleted || 0;
            log('Estadísticas del juego cargadas', stats);
        }
    } catch (error) {
        logError('Error cargando estadísticas del juego', error);
    }
}

/* ============================================
   SECCIÓN 16: [NUEVO] SISTEMA DE BADGES (Feature C)
   ============================================ */

/**
 * Verificar y desbloquear badges según condiciones
 */
function checkAndUnlockBadges() {
    const stats = {
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
    
    let newUnlocks = [];
    
    CONFIG.badges.forEach(badge => {
        // Skip legendary - se verifica al final
        if (badge.id === 'legendary') return;
        
        // Si ya está desbloqueado, saltar
        if (unlockedBadges.includes(badge.id)) return;
        
        // Evaluar condición
        if (evaluateBadgeCondition(badge, stats)) {
            unlockedBadges.push(badge.id);
            newUnlocks.push(badge);
        }
    });
    
    // Verificar badge LEGENDARY (todos los demás desbloqueados)
    const legendaryBadge = CONFIG.badges.find(b => b.id === 'legendary');
    if (legendaryBadge && !unlockedBadges.includes('legendary')) {
        const otherBadges = CONFIG.badges.filter(b => b.id !== 'legendary');
        const allOthersUnlocked = otherBadges.every(b => unlockedBadges.includes(b.id));
        
        if (allOthersUnlocked) {
            unlockedBadges.push('legendary');
            newUnlocks.push(legendaryBadge);
        }
    }
    
    // Guardar si hay nuevos desbloqueos
    if (newUnlocks.length > 0) {
        saveBadgesToStorage();
        updateBadgeUI();
        
        // Mostrar celebración para cada nuevo badge
        newUnlocks.forEach((badge, index) => {
            setTimeout(() => {
                showAchievementCelebration(badge);
                playSound('achievement');
            }, index * 500); // Delay entre celebraciones
        });
    }
}

/**
 * Evaluar condición de un badge específico
 */
function evaluateBadgeCondition(badge, stats) {
    switch (badge.id) {
        case 'speed-demon':
            return stats.game.fastResponses >= 5;
        case 'perfect-10':
            return stats.game.maxStreak >= 10;
        case 'ohm-master':
            return stats.game.totalScore >= 500;
        case 'combo-king':
            return stats.game.maxCombo >= 5;
        case 'marathon':
            return stats.game.roundsCompleted >= 5;
        case 'explorer':
            return stats.learning.sectionsVisited.size >= 6;
        case 'circuit-builder':
            return stats.learning.circuitsSimulated >= 10;
        case 'component-wizard':
            return stats.learning.componentsCalculated >= 50;
        case 'wave-rider':
            return stats.learning.wavesExplored.size >= 5;
        case 'night-owl':
            return stats.special.darkModeUses >= 5;
        case 'curious':
            return stats.learning.conceptsRead.size >= 8;
        default:
            return false;
    }
}

/**
 * Mostrar celebración de logro desbloqueado
 */
function showAchievementCelebration(badge) {
    const celebrationEl = document.getElementById('achievementCelebration');
    if (!celebrationEl || !badge) return;
    
    // Actualizar contenido
    const iconEl = document.getElementById('celebrationIcon');
    const nameEl = document.getElementById('celebrationName');
    const descEl = document.getElementById('celebrationDesc');
    
    if (iconEl) iconEl.textContent = badge.icon;
    if (nameEl) nameEl.textContent = badge.name;
    if (descEl) descEl.textContent = badge.description;
    
    // Mostrar
    celebrationEl.style.display = 'block';
    
    // Iniciar confeti
    startConfetti();
    
    // Auto-ocultar después de 3 segundos
    setTimeout(() => {
        celebrationEl.style.display = 'none';
        stopConfetti();
    }, 3000);
    
    log('¡Logro desbloqueado!', badge.name);
}

/**
 * Toggle panel de badges
 */
function toggleBadgesPanel() {
    const modal = document.getElementById('badgesModal');
    if (!modal) return;
    
    const isVisible = modal.style.display === 'flex';
    
    if (isVisible) {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'flex';
        renderBadgesGrid('all');
        playSound('click');
    }
}

/**
 * Renderizar grid de badges
 */
function renderBadgesGrid(filter = 'all') {
    const gridContainer = document.getElementById('badgesGrid');
    if (!gridContainer) return;
    
    let badgesToShow = CONFIG.badges;
    
    if (filter !== 'all') {
        badgesToShow = CONFIG.badges.filter(b => b.category === filter);
    }
    
    gridContainer.innerHTML = badgesToShow.map(badge => {
        const isUnlocked = unlockedBadges.includes(badge.id);
        
        return `
            <div class="badge-card ${isUnlocked ? 'unlocked' : 'locked'}">
                ${!isUnlocked ? `
                    <div class="badge-lock-overlay">
                        <span>🔒</span>
                    </div>
                ` : ''}
                <span class="badge-icon">${isUnlocked ? badge.icon : '❓'}</span>
                <div class="badge-name">${isUnlocked ? badge.name : '???'}</div>
                <div class="badge-desc">${isUnlocked ? badge.description : 'Completa los requisitos para desbloquear'}</div>
            </div>
        `;
    }).join('');
    
    // Actualizar contador y barra de progreso
    updateBadgesProgress();
}

/**
 * Filtrar badges por categoría
 */
function filterBadges(category) {
    // Actualizar botones activos
    document.querySelectorAll('.filter-badge-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    event.target.classList.add('active');
    
    // Re-renderizar grid
    renderBadgesGrid(category);
}

/**
 * Actualizar barra de progreso y contador de badges
 */
function updateBadgesProgress() {
    const totalBadges = CONFIG.badges.length;
    const unlockedCount = unlockedBadges.length;
    const percentage = (unlockedCount / totalBadges) * 100;
    
    // Contador
    const countEl = document.getElementById('badgesUnlockedCount');
    if (countEl) countEl.textContent = unlockedCount;
    
    // Barra de progreso
    const progressBar = document.getElementById('badgesProgressBar');
    if (progressBar) progressBar.style.width = percentage + '%';
}

/**
 * Actualizar contadores de badges en header
 */
function updateBadgeUI() {
    const count = unlockedBadges.length;
    
    // Hero badge count
    const heroCount = document.getElementById('badgeCountHero');
    if (heroCount) heroCount.textContent = count;
    
    // Nav badge count
    const navCount = document.getElementById('badgeCountNav');
    if (navCount) navCount.textContent = count;
}

/**
 * Guardar badges en localStorage
 */
function saveBadgesToStorage() {
    try {
        localStorage.setItem('electronilab_badges', JSON.stringify(unlockedBadges));
        log('Badges guardados', unlockedBadges);
    } catch (error) {
        logError('Error guardando badges', error);
    }
}

/**
 * Cargar badges desde localStorage
 */
function loadBadgesFromStorage() {
    try {
        const saved = localStorage.getItem('electronilab_badges');
        if (saved) {
            unlockedBadges = JSON.parse(saved);
            log('Badges cargados', unlockedBadges);
        }
        
        // También cargar estadísticas del juego
        loadGameStats();
        
        // Cargar estadísticas de aprendizaje
        loadLearningStats();
        
        // Cargar estadísticas especiales
        loadSpecialStats();
    } catch (error) {
        logError('Error cargando badges', error);
        unlockedBadges = [];
    }
}

/* ============================================
   SECCIÓN 17: [NUEVO] MODO OSCURO (Feature D)
   ============================================ */

/**
 * Inicializar modo oscuro
 */
function initDarkMode() {
    const savedTheme = localStorage.getItem('electronilab_theme');
    
    if (savedTheme) {
        setTheme(savedTheme, false);
    } else {
        // Por defecto claro
        setTheme('light', false);
    }
}

/**
 * Toggle modo oscuro/claro
 */
function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    setTheme(newTheme, true);
    
    // Contar uso para badge night owl
    if (newTheme === 'dark') {
        specialStats.darkModeUses++;
        saveSpecialStats();
        checkAndUnlockBadges();
    }
    
    showToast(newTheme === 'dark' ? '🌙 Modo oscuro activado' : '☀️ Modo claro activado');
    playSound('click');
}

/**
 * Aplicar tema
 */
function setTheme(theme, saveToStorage) {
    document.documentElement.setAttribute('data-theme', theme);
    appState.isDarkMode = theme === 'dark';
    
    if (saveToStorage) {
        localStorage.setItem('electronilab_theme', theme);
    }
    
    // Re-render Lucide icons después de cambiar tema
    setTimeout(() => {
        lucide.createIcons();
    }, 100);
    
    log('Tema cambiado a:', theme);
}

/* ============================================
   SECCIÓN 18: [NUEVO] AUDIO SYSTEM (Feature E)
   ============================================ */

/**
 * Inicializar sistema de audio
 */
function initAudio() {
    // Audio context se crea bajo demanda (lazy init)
    audioContext = null;
    appState.soundEnabled = true;
    
    // Actualizar UI del botón de sonido
    updateSoundButtonUI();
}

/**
 * Reproducir sonido usando Web Audio API
 */
function playSound(type) {
    if (!appState.soundEnabled) return;
    
    try {
        // Crear contexto bajo demanda
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // Reanudar si está suspendido (política de autoplay)
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch (type) {
            case 'correct':
                // Do (523.25Hz) - sonido alegre
                oscillator.frequency.value = 523.25;
                oscillator.type = 'sine';
                gainNode.gain.value = 0.3;
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
                break;
                
            case 'incorrect':
                // Sonido de error grave
                oscillator.frequency.value = 200;
                oscillator.type = 'sawtooth';
                gainNode.gain.value = 0.2;
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
                break;
                
            case 'achievement':
                // Fanfarria: Do-Mi-Sol-Do agudo
                const notes = [523.25, 659.25, 783.99, 1046.50];
                notes.forEach((freq, index) => {
                    const osc = audioContext.createOscillator();
                    const gain = audioContext.createGain();
                    osc.connect(gain);
                    gain.connect(audioContext.destination);
                    osc.frequency.value = freq;
                    osc.type = 'sine';
                    gain.gain.value = 0.2;
                    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15 + (index * 0.1));
                    osc.start(audioContext.currentTime + (index * 0.1));
                    osc.stop(audioContext.currentTime + 0.15 + (index * 0.1));
                });
                break;
                
            case 'click':
                // Click suave
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                gainNode.gain.value = 0.1;
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.05);
                break;
        }
    } catch (error) {
        // Silenciar errores (navegador puede bloquear audio)
        logError('Error reproduciendo sonido', error);
    }
}

/**
 * Toggle sonido on/off
 */
function toggleSound() {
    appState.soundEnabled = !appState.soundEnabled;
    updateSoundButtonUI();
    
    if (appState.soundEnabled) {
        playSound('click'); // Probar sonido al activar
    }
}

/**
 * Actualizar UI del botón de sonido
 */
function updateSoundButtonUI() {
    const soundText = document.getElementById('soundText');
    const soundIcon = document.getElementById('soundIcon');
    
    if (soundText) {
        soundText.textContent = appState.soundEnabled ? 'Sound ON' : 'Sound OFF';
    }
    
    if (soundIcon) {
        // Actualizar icono via lucide
        soundIcon.setAttribute('data-lucide', appState.soundEnabled ? 'volume-2' : 'volume-x');
        lucide.createIcons({
            nodes: [soundIcon]
        });
    }
}

/* ============================================
   SECCIÓN 19: [NUEVO] CONFETI ENGINE (Feature F)
   ============================================ */

/**
 * Iniciar animación de confeti
 */
function startConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const colors = ['#0A84FF', '#EF4444', '#F59E0B', '#22C55E', '#8B5CF6', '#FFD700'];
    const particles = [];
    const particleCount = 150;
    
    // Crear partículas
    for (let i = 0; i < particleCount; i++) {
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
        
        particles.forEach(p => {
            ctx.save();
            ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
            ctx.rotate(p.angle);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
            
            // Actualizar posición
            p.y += p.speed;
            p.angle += p.spin;
            
            // Reset si sale de pantalla
            if (p.y > canvas.height) {
                p.y = -p.h;
                p.x = Math.random() * canvas.width;
            }
        });
        
        confettiAnimationId = requestAnimationFrame(animate);
    }
    
    // Cancelar animación anterior si existe
    if (confettiAnimationId) {
        cancelAnimationFrame(confettiAnimationId);
    }
    
    animate();
    log('Confeti iniciado');
}

/**
 * Detener animación de confeti
 */
function stopConfetti() {
    if (confettiAnimationId) {
        cancelAnimationFrame(confettiAnimationId);
        confettiAnimationId = null;
    }
    
    const canvas = document.getElementById('confettiCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    log('Confeti detenido');
}

/* ============================================
   SECCIÓN 20: TRACKING DE PROGRESO (PARA BADGES)
   ============================================ */

/**
 * Registrar acción de progreso para badges
 */
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
        default:
            log('Acción de tracking desconocida:', action);
    }
    
    saveLearningStats();
}

/**
 * Guardar estadísticas de aprendizaje
 */
function saveLearningStats() {
    try {
        const data = {
            sectionsVisited: Array.from(learningStats.sectionsVisited),
            circuitsSimulated: learningStats.circuitsSimulated,
            componentsCalculated: learningStats.componentsCalculated,
            wavesExplored: Array.from(learningStats.wavesExplored),
            conceptsRead: Array.from(learningStats.conceptsRead)
        };
        localStorage.setItem('electronilab_learning_stats', JSON.stringify(data));
    } catch (error) {
        logError('Error guardando estadísticas de aprendizaje', error);
    }
}

/**
 * Cargar estadísticas de aprendizaje
 */
function loadLearningStats() {
    try {
        const saved = localStorage.getItem('electronilab_learning_stats');
        if (saved) {
            const data = JSON.parse(saved);
            learningStats.sectionsVisited = new Set(data.sectionsVisited || []);
            learningStats.circuitsSimulated = data.circuitsSimulated || 0;
            learningStats.componentsCalculated = data.componentsCalculated || 0;
            learningStats.wavesExplored = new Set(data.wavesExplored || []);
            learningStats.conceptsRead = new Set(data.conceptsRead || []);
        }
    } catch (error) {
        logError('Error cargando estadísticas de aprendizaje', error);
    }
}

/**
 * Guardar estadísticas especiales
 */
function saveSpecialStats() {
    try {
        localStorage.setItem('electronilab_special_stats', JSON.stringify(specialStats));
    } catch (error) {
        logError('Error guardando estadísticas especiales', error);
    }
}

/**
 * Cargar estadísticas especiales
 */
function loadSpecialStats() {
    try {
        const saved = localStorage.getItem('electronilab_special_stats');
        if (saved) {
            specialStats = JSON.parse(saved);
        }
    } catch (error) {
        logError('Error cargando estadísticas especiales', error);
    }
}

/* ============================================
   SECCIÓN 21: HERO CANVAS (MANTENER EXISTENTE)
   ============================================ */

/**
 * Inicializar canvas de partículas del hero
 */
function initHeroCanvas() {
    if (!heroAnimationActive) return;
    
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    
    let ctx = canvas.getContext('2d');
    let w, h, nodes = [], traces = [], electrons = [];
    
    function resize() {
        w = canvas.width = canvas.parentElement.offsetWidth;
        h = canvas.height = canvas.parentElement.offsetHeight;
        gen();
    }
    
    function gen() {
        nodes = [];
        traces = [];
        electrons = [];
        
        const cols = Math.floor(w / 70);
        const rows = Math.floor(h / 70);
        
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (Math.random() > 0.3) {
                    nodes.push({ x: 50 + c * 70, y: 50 + r * 70 });
                }
            }
        }
        
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = Math.abs(nodes[i].x - nodes[j].x);
                const dy = Math.abs(nodes[i].y - nodes[j].y);
                
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
        
        // Dibujar trazos
        traces.forEach(tr => {
            const a = nodes[tr.from];
            const b = nodes[tr.to];
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = 'rgba(10,132,255,.12)';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
        
        // Dibujar nodos
        nodes.forEach(n => {
            ctx.beginPath();
            ctx.arc(n.x, n.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(10,132,255,.3)';
            ctx.fill();
        });
        
        // Dibujar electrones
        electrons.forEach(e => {
            e.t += e.speed;
            if (e.t > 1) e.t = 0;
            
            const tr = traces[e.trace];
            const a = nodes[tr.from];
            const b = nodes[tr.to];
            const x = a.x + (b.x - a.x) * e.t;
            const y = a.y + (b.y - a.y) * e.t;
            
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(100,180,255,.9)';
            ctx.fill();
        });
        
        heroReq = requestAnimationFrame(draw);
    }
    
    window.addEventListener('resize', () => {
        if (heroAnimationActive) {
            resize();
        }
    });
    
    resize();
    draw();
}

/* ============================================
   FIN DEL ARCHIVO SCRIPT.JS
   ElectroniLab 2.0 - Versión Gamificada Completa
   ============================================ */
