// Estado global de la app
const App = {
  currentUser: null,
  currentPage: 'dashboard',
  data: {
    km: [],
    entregas: [],
    gastos: [],
    notas: [],
    vehiculo: { mantenimientos: [], alertas: [] },
    config: { renta_semanal: 420000, dia_entrega: 'sabado', moneda: 'COP' },
    usuarios: []
  },

  async init() {
    const token = localStorage.getItem('gh_token');
    const userName = localStorage.getItem('user_name');
    const userRol = localStorage.getItem('user_rol');

    if (token && userName) {
      GitHubAPI.init(token);
      this.currentUser = { nombre: userName, rol: userRol || 'admin' };
      await this.loadAllData();
      this.showApp();
    } else {
      this.showLogin();
    }
  },

  async loadAllData() {
    this.showLoading(true);
    try {
      const [km, entregas, gastos, notas, vehiculo, config] = await Promise.all([
        GitHubAPI.getData('km.json'),
        GitHubAPI.getData('entregas.json'),
        GitHubAPI.getData('gastos.json'),
        GitHubAPI.getData('notas.json'),
        GitHubAPI.getData('vehiculo.json'),
        GitHubAPI.getData('config.json')
      ]);
      this.data.km = km || [];
      this.data.entregas = entregas || [];
      this.data.gastos = gastos || [];
      this.data.notas = notas || [];
      this.data.vehiculo = vehiculo || { mantenimientos: [], alertas: [] };
      this.data.config = config || this.data.config;
    } catch (e) {
      console.error('Error cargando datos:', e);
    }
    this.showLoading(false);
  },

  showLoading(show) {
    document.getElementById('loading').style.display = show ? 'flex' : 'none';
  },

  showLogin() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('app-screen').style.display = 'none';
  },

  showApp() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-screen').style.display = 'flex';
    document.getElementById('user-name').textContent = this.currentUser.nombre;
    document.getElementById('user-rol').textContent = this.currentUser.rol === 'admin' ? 'Admin/Dueño' : 'Conductor';
    this.updateNav();
    this.navigate('dashboard');
  },

  updateNav() {
    const nav = document.getElementById('bottom-nav');
    let items = [
      { page: 'dashboard', icon: '📊', label: 'Inicio' },
      { page: 'km', icon: '🛣️', label: 'Km' },
      { page: 'entregas', icon: '💰', label: 'Entregas' },
      { page: 'fotos', icon: '📷', label: 'Fotos' },
      { page: 'notas', icon: '📝', label: 'Notas' }
    ];
    if (this.currentUser.rol === 'admin') {
      items.splice(4, 0, { page: 'gastos', icon: '💸', label: 'Gastos' });
      items.splice(5, 0, { page: 'vehiculo', icon: '🚗', label: 'Auto' });
    }
    nav.innerHTML = items.map(i =>
      `<button onclick="App.navigate('${i.page}')" class="nav-btn" data-page="${i.page}">
        <span class="nav-icon">${i.icon}</span>
        <span class="nav-label">${i.label}</span>
      </button>`
    ).join('');
  },

  navigate(page) {
    this.currentPage = page;
    // Highlight nav
    document.querySelectorAll('.nav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.page === page);
    });
    // Render page
    const content = document.getElementById('page-content');
    switch(page) {
      case 'dashboard': Dashboard.render(content); break;
      case 'km': KmPage.render(content); break;
      case 'entregas': EntregasPage.render(content); break;
      case 'fotos': FotosPage.render(content); break;
      case 'gastos': GastosPage.render(content); break;
      case 'vehiculo': VehiculoPage.render(content); break;
      case 'notas': NotasPage.render(content); break;
    }
  },

  async login(token, nombre, rol) {
    GitHubAPI.init(token);
    const verify = await GitHubAPI.verifyToken();
    if (!verify.valid) {
      alert('Token inválido. Verifica que sea correcto.');
      return false;
    }
    localStorage.setItem('gh_token', token);
    localStorage.setItem('user_name', nombre);
    localStorage.setItem('user_rol', rol);
    this.currentUser = { nombre, rol };
    await this.loadAllData();
    this.showApp();
    return true;
  },

  logout() {
    localStorage.removeItem('gh_token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_rol');
    this.currentUser = null;
    this.showLogin();
  },

  // Helpers
  formatMoney(n) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
  },

  today() {
    return new Date().toISOString().split('T')[0];
  },

  showMsg(el, msg, isError) {
    el.innerHTML = `<p class="msg ${isError ? 'msg-error' : 'msg-success'}">${msg}</p>`;
    setTimeout(() => el.innerHTML = '', 3000);
  }
};

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', () => App.init());
