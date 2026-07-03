const CATEGORIAS = [
  { v: 'mantenimiento', l: 'Mantenimiento', i: '🔧' },
  { v: 'seguro', l: 'Seguro', i: '🛡️' },
  { v: 'combustible', l: 'Combustible', i: '⛽' },
  { v: 'lavado', l: 'Lavado', i: '🧽' },
  { v: 'multa', l: 'Multa', i: '🚨' },
  { v: 'verificacion', l: 'Verificacion', i: '📋' },
  { v: 'otro', l: 'Otro', i: '📌' }
];

const GastosPage = {
  render(container) {
    const total = App.data.gastos.reduce((s, g) => s + g.monto, 0);


    container.innerHTML = `
      <div class="flex-between">
        <h2 class="page-title">💸 Gastos</h2>
        <button onclick="GastosPage.toggleForm()" class="btn btn-primary btn-sm">+ Nuevo</button>
      </div>

      <div class="card">
        <h3 class="card-title">Total: ${App.formatMoney(total)}</h3>
        ${GastosPage.resumen()}
      </div>

      <div id="gasto-form-container" style="display:none">
        <form class="card" onsubmit="GastosPage.save(event)">
          <div class="form-group"><label>Categoria</label>
            <select id="gasto-cat" class="input">
              ${CATEGORIAS.map(c => `<option value="${c.v}">${c.i} ${c.l}</option>`).join('')}
            </select>
          </div>
          <div class="grid-2">
            <div class="form-group"><label>Monto</label><input type="number" id="gasto-monto" class="input" placeholder="150000" required></div>
            <div class="form-group"><label>Fecha</label><input type="date" id="gasto-fecha" value="${App.today()}" class="input" required></div>
          </div>
          <div class="form-group"><label>Descripcion</label><input type="text" id="gasto-desc" class="input" placeholder="Detalle"></div>
          <button type="submit" class="btn btn-primary w-full">Registrar</button>
          <div id="gasto-msg"></div>
        </form>
      </div>

      <div id="gastos-list">
        ${App.data.gastos.slice().reverse().map((g, i) => {
          const cat = CATEGORIAS.find(c => c.v === g.categoria) || CATEGORIAS[6];
          return `<div class="card list-item">
            <div class="flex-between">
              <div class="flex-row">
                <span class="icon-lg">${cat.i}</span>
                <div><p class="font-medium">${cat.l}</p><p class="text-muted text-sm">${g.fecha}${g.descripcion ? ' - ' + g.descripcion : ''}</p></div>
              </div>
              <span class="text-danger font-bold">${App.formatMoney(g.monto)}</span>
            </div>
          </div>`;
        }).join('')}
      </div>
    `;
  },

  resumen() {
    const por_cat = {};
    App.data.gastos.forEach(g => {
      por_cat[g.categoria] = (por_cat[g.categoria] || 0) + g.monto;
    });
    return Object.entries(por_cat).map(([cat, total]) => {
      const c = CATEGORIAS.find(x => x.v === cat) || CATEGORIAS[6];
      return `<div class="list-item"><span>${c.i} ${c.l}</span><span class="font-medium">${App.formatMoney(total)}</span></div>`;
    }).join('');
  },

  toggleForm() {
    const f = document.getElementById('gasto-form-container');
    f.style.display = f.style.display === 'none' ? 'block' : 'none';
  },

  async save(e) {
    e.preventDefault();
    const gasto = {
      categoria: document.getElementById('gasto-cat').value,
      monto: parseInt(document.getElementById('gasto-monto').value),
      fecha: document.getElementById('gasto-fecha').value,
      descripcion: document.getElementById('gasto-desc').value || null,
      usuario: App.currentUser.nombre,
      timestamp: new Date().toISOString()
    };

    App.showLoading(true);
    App.data.gastos.push(gasto);
    const result = await GitHubAPI.saveData('gastos.json', App.data.gastos, `Gasto ${gasto.categoria}: ${App.formatMoney(gasto.monto)}`);
    App.showLoading(false);

    if (result.success) {
      App.showMsg(document.getElementById('gasto-msg'), 'Gasto registrado ✓', false);
      setTimeout(() => GastosPage.render(document.getElementById('page-content')), 1500);
    } else {
      App.data.gastos.pop();
      App.showMsg(document.getElementById('gasto-msg'), 'Error: ' + result.error, true);
    }
  }
};
