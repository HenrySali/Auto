// Claves de acceso por rol
const CLAVES = {
  propietario: 'Socios2026',
  conductor: 'Leandro2026'
};

const App = {
  currentUser: null,
  currentPage: 'dashboard',
  data: {
    km: [],
    entregas: [],
    gastos: [],
    notas: [],
    vehiculo: { mantenimientos: [], alertas: [] },
    config: { renta_semanal: 420000, dia_entrega: 'sabado', moneda: 'COP' }
  },

  async init() {
    const userName = localStorage.getItem('user_name');
    const userRol = localStorage.getItem('user_rol');

    if (userName && userRol) {
      this.currentUser = { nombre: userName, rol: userRol };
      GitHubAPI.init();

      // Si no tiene token de escritura, pedirlo
      if (!GitHubAPI.hasWriteAccess()) {
        this.showTokenSetup();
        return;
      }

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
    document.getElementById('token-screen').style.display = 'none';
  },

  showTokenSetup() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-screen').style.display = 'none';
    document.getElementById('token-screen').style.display = 'flex';
  },

  async afterTokenSetup() {
    await this.loadAllData();
    this.showApp();
  },

  showApp() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-screen').style.display = 'flex';
    document.getElementById('token-screen').style.display = 'none';
    document.getElementById('user-name').textContent = this.currentUser.nombre;
    document.getElementById('user-rol').textContent = this.currentUser.rol === 'propietario' ? 'Propietario' : 'Conductor';
    this.updateNav();
    this.navigate('dashboard');
  },

  updateNav() {
    const nav = document.getElementById('bottom-nav');
    let items = [
      { page: 'dashboard', icon: '📊', label: 'Inicio' },
      { page: 'km', icon: '🛣️', label: 'Km' },
      { page: 'entregas', icon: '💰', label: 'Entregas' },
      { page: 'notas', icon: '📝', label: 'Notas' }
    ];
    if (this.currentUser.rol === 'propietario') {
      items.splice(3, 0, { page: 'fotos', icon: '📷', label: 'Fotos' });
      items.splice(4, 0, { page: 'gastos', icon: '💸', label: 'Gastos' });
      items.splice(5, 0, { page: 'vehiculo', icon: '🚗', label: 'Auto' });
      items.push({ page: 'datos', icon: '💾', label: 'Datos' });
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
    document.querySelectorAll('.nav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.page === page);
    });
    const content = document.getElementById('page-content');
    switch(page) {
      case 'dashboard': Dashboard.render(content); break;
      case 'km': KmPage.render(content); break;
      case 'entregas': EntregasPage.render(content); break;
      case 'fotos': FotosPage.render(content); break;
      case 'gastos': GastosPage.render(content); break;
      case 'vehiculo': VehiculoPage.render(content); break;
      case 'notas': NotasPage.render(content); break;
      case 'datos': DatosPage.render(content); break;
    }
  },

  login(nombre, clave) {
    let rol = null;
    if (clave === CLAVES.propietario) {
      rol = 'propietario';
    } else if (clave === CLAVES.conductor) {
      rol = 'conductor';
    } else {
      return false;
    }

    localStorage.setItem('user_name', nombre);
    localStorage.setItem('user_rol', rol);
    this.currentUser = { nombre, rol };
    GitHubAPI.init();

    if (!GitHubAPI.hasWriteAccess()) {
      this.showTokenSetup();
    } else {
      this.loadAllData().then(() => this.showApp());
    }
    return true;
  },

  logout() {
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_rol');
    this.currentUser = null;
    this.showLogin();
  },

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

document.addEventListener('DOMContentLoaded', () => App.init());
