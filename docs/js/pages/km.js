const KmPage = {
  render(container) {
    const todayRecord = App.data.km.find(k => k.fecha === App.today());

    container.innerHTML = `
      <h2 class="page-title">🛣️ Kilometraje Diario</h2>
      
      <form id="km-form" class="card" onsubmit="KmPage.save(event)">
        <div class="form-group">
          <label>Fecha</label>
          <input type="date" id="km-fecha" value="${App.today()}" class="input">
        </div>
        <div class="grid-2">
          <div class="form-group">
            <label>Km inicio</label>
            <input type="number" id="km-inicio" class="input" placeholder="45000" value="${todayRecord ? todayRecord.km_inicio : ''}" required>
          </div>
          <div class="form-group">
            <label>Km fin</label>
            <input type="number" id="km-fin" class="input" placeholder="45200" value="${todayRecord ? todayRecord.km_fin : ''}" required>
          </div>
        </div>
        <div class="form-group">
          <label>Novedades (opcional)</label>
          <textarea id="km-notas" class="input" rows="2" placeholder="Alguna novedad...">${todayRecord ? (todayRecord.notas || '') : ''}</textarea>
        </div>
        <button type="submit" class="btn btn-primary w-full">${todayRecord ? 'Actualizar' : 'Registrar km'}</button>
        <div id="km-msg"></div>
      </form>

      <div class="card">
        <h3 class="card-title">Historial</h3>
        ${App.data.km.length === 0 ? '<p class="text-muted">Sin registros</p>' :
          App.data.km.slice().reverse().slice(0, 14).map(k => `
            <div class="list-item">
              <div>
                <p class="font-medium">${k.fecha}</p>
                <p class="text-muted">${k.km_inicio} → ${k.km_fin}</p>
              </div>
              <span class="badge badge-primary">${k.km_fin - k.km_inicio} km</span>
            </div>
          `).join('')
        }
      </div>
    `;
  },

  async save(e) {
    e.preventDefault();
    const fecha = document.getElementById('km-fecha').value;
    const km_inicio = parseInt(document.getElementById('km-inicio').value);
    const km_fin = parseInt(document.getElementById('km-fin').value);
    const notas = document.getElementById('km-notas').value;

    if (km_fin < km_inicio) {
      App.showMsg(document.getElementById('km-msg'), 'Km fin no puede ser menor que km inicio', true);
      return;
    }

    App.showLoading(true);

    // Buscar si ya existe registro para esa fecha
    const idx = App.data.km.findIndex(k => k.fecha === fecha);
    const registro = {
      fecha,
      km_inicio,
      km_fin,
      notas: notas || null,
      usuario: App.currentUser.nombre,
      timestamp: new Date().toISOString()
    };

    if (idx >= 0) {
      App.data.km[idx] = registro;
    } else {
      App.data.km.push(registro);
    }

    // Ordenar por fecha
    App.data.km.sort((a, b) => a.fecha.localeCompare(b.fecha));

    const result = await GitHubAPI.saveData('km.json', App.data.km, `Km ${fecha}: ${km_fin - km_inicio} km`);
    App.showLoading(false);

    if (result.success) {
      App.showMsg(document.getElementById('km-msg'), 'Kilometraje registrado ✓', false);
      setTimeout(() => KmPage.render(document.getElementById('page-content')), 1500);
    } else {
      App.showMsg(document.getElementById('km-msg'), 'Error al guardar: ' + result.error, true);
    }
  }
};
