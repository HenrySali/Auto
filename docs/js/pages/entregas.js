const EntregasPage = {
  render(container) {
    const renta = App.data.config.renta_semanal;

    container.innerHTML = `
      <div class="flex-between">
        <h2 class="page-title">💰 Entregas</h2>
        <button onclick="EntregasPage.toggleForm()" class="btn btn-primary btn-sm">+ Nueva</button>
      </div>

      <div class="card card-info">
        <p>Renta semanal: <strong>${App.formatMoney(renta)}</strong> - Entrega: Sabados</p>
      </div>

      <div id="entrega-form-container" style="display:none">
        <form class="card" onsubmit="EntregasPage.save(event)">
          <h3 class="card-title">Nueva entrega</h3>
          <div class="grid-2">
            <div class="form-group"><label>Desde</label><input type="date" id="ent-inicio" class="input" required></div>
            <div class="form-group"><label>Hasta</label><input type="date" id="ent-fin" class="input" required></div>
          </div>
          <div class="grid-2">
            <div class="form-group"><label>Km semana</label><input type="number" id="ent-km" class="input" placeholder="1500"></div>
            <div class="form-group"><label>Monto pagado</label><input type="number" id="ent-monto" class="input" value="${renta}" required></div>
          </div>
          <div class="form-group"><label>Notas</label><textarea id="ent-notas" class="input" rows="2" placeholder="Observaciones..."></textarea></div>
          <button type="submit" class="btn btn-primary w-full">Registrar</button>
          <div id="ent-msg"></div>
        </form>
      </div>

      <div id="entregas-list">
        ${App.data.entregas.length === 0 ? '<div class="card text-center text-muted">No hay entregas</div>' :
          App.data.entregas.slice().reverse().map((e, i) => `
            <div class="card">
              <div class="flex-between">
                <div>
                  <p class="font-medium">${e.semana_inicio} → ${e.semana_fin}</p>
                  <p class="text-muted">${e.km_total || 0} km</p>
                  ${e.notas ? `<p class="text-muted text-sm">${e.notas}</p>` : ''}
                </div>
                <span class="badge badge-${e.estado === 'pagado' ? 'success' : e.estado === 'parcial' ? 'warning' : 'danger'}">${e.estado}</span>
              </div>
              <div class="flex-between mt-2">
                <span>Pagado: <strong>${App.formatMoney(e.monto_pagado)}</strong> / ${App.formatMoney(e.monto_debido)}</span>
                ${App.currentUser.rol === 'admin' && !e.confirmado ? 
                  `<button onclick="EntregasPage.confirmar(${App.data.entregas.length - 1 - i})" class="btn btn-success btn-sm">Confirmar</button>` :
                  e.confirmado ? '<span class="text-success text-sm">✓ Confirmado</span>' : ''
                }
              </div>
            </div>
          `).join('')
        }
      </div>
    `;
  },

  toggleForm() {
    const f = document.getElementById('entrega-form-container');
    f.style.display = f.style.display === 'none' ? 'block' : 'none';
  },

  async save(e) {
    e.preventDefault();
    const renta = App.data.config.renta_semanal;
    const monto_pagado = parseInt(document.getElementById('ent-monto').value);

    let estado = 'pendiente';
    if (monto_pagado >= renta) estado = 'pagado';
    else if (monto_pagado > 0) estado = 'parcial';

    const entrega = {
      semana_inicio: document.getElementById('ent-inicio').value,
      semana_fin: document.getElementById('ent-fin').value,
      km_total: parseInt(document.getElementById('ent-km').value) || 0,
      monto_debido: renta,
      monto_pagado,
      estado,
      notas: document.getElementById('ent-notas').value || null,
      confirmado: false,
      usuario: App.currentUser.nombre,
      timestamp: new Date().toISOString()
    };

    App.showLoading(true);
    App.data.entregas.push(entrega);
    const result = await GitHubAPI.saveData('entregas.json', App.data.entregas, `Entrega semana ${entrega.semana_fin}`);
    App.showLoading(false);

    if (result.success) {
      App.showMsg(document.getElementById('ent-msg'), 'Entrega registrada ✓', false);
      setTimeout(() => EntregasPage.render(document.getElementById('page-content')), 1500);
    } else {
      App.data.entregas.pop();
      App.showMsg(document.getElementById('ent-msg'), 'Error: ' + result.error, true);
    }
  },

  async confirmar(idx) {
    App.showLoading(true);
    App.data.entregas[idx].confirmado = true;
    const result = await GitHubAPI.saveData('entregas.json', App.data.entregas, `Entrega confirmada ${App.data.entregas[idx].semana_fin}`);
    App.showLoading(false);
    if (result.success) {
      EntregasPage.render(document.getElementById('page-content'));
    }
  }
};
