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

      <button onclick="KmPage.openHistorial()" class="btn btn-secondary w-full">📋 Ver historial</button>

      <!-- Modal historial -->
      <div id="km-modal" class="modal" style="display:none">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Historial de Kilometraje</h3>
            <button onclick="KmPage.closeModal()" class="modal-close">✕</button>
          </div>
          <div class="modal-body" id="km-historial-body"></div>
        </div>
      </div>
    `;
  },

  getWeekNumber(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - startOfYear) / 86400000);
    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
  },

  groupByWeek(records) {
    const weeks = {};
    records.forEach(k => {
      const year = k.fecha.substring(0, 4);
      const weekNum = KmPage.getWeekNumber(k.fecha);
      const key = `${year}-S${weekNum}`;
      if (!weeks[key]) weeks[key] = { label: `Semana ${weekNum} (${year})`, records: [], totalKm: 0 };
      weeks[key].records.push(k);
      weeks[key].totalKm += (k.km_fin - k.km_inicio);
    });
    return weeks;
  },

  openHistorial() {
    const modal = document.getElementById('km-modal');
    const body = document.getElementById('km-historial-body');
    const records = App.data.km.slice().reverse();
    const weeks = KmPage.groupByWeek(records);

    if (records.length === 0) {
      body.innerHTML = '<p class="text-muted text-center">Sin registros</p>';
    } else {
      body.innerHTML = Object.entries(weeks).map(([key, week]) => `
        <div class="accordion">
          <button class="accordion-header" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('show')">
            <span>${week.label}</span>
            <span class="badge badge-primary">${week.totalKm} km</span>
          </button>
          <div class="accordion-body">
            ${week.records.map(k => `
              <div class="list-item">
                <div>
                  <p class="font-medium">${k.fecha}</p>
                  <p class="text-muted">${k.km_inicio} → ${k.km_fin}${k.notas ? ' • ' + k.notas : ''}</p>
                </div>
                <div class="flex-row">
                  <span class="badge badge-primary">${k.km_fin - k.km_inicio} km</span>
                  <button onclick="KmPage.editar('${k.fecha}')" class="btn btn-sm" style="padding:2px 8px;font-size:11px">✏️</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('');
    }

    modal.style.display = 'flex';
  },

  closeModal() {
    document.getElementById('km-modal').style.display = 'none';
  },

  editar(fecha) {
    const record = App.data.km.find(k => k.fecha === fecha);
    if (!record) return;
    KmPage.closeModal();
    document.getElementById('km-fecha').value = record.fecha;
    document.getElementById('km-inicio').value = record.km_inicio;
    document.getElementById('km-fin').value = record.km_fin;
    document.getElementById('km-notas').value = record.notas || '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

    App.data.km.sort((a, b) => a.fecha.localeCompare(b.fecha));

    const result = await GitHubAPI.saveData('km.json', App.data.km, `Km ${fecha}: ${km_fin - km_inicio} km`);
    App.showLoading(false);

    if (result.success) {
      App.showMsg(document.getElementById('km-msg'), 'Kilometraje registrado ✓', false);
      setTimeout(() => KmPage.render(document.getElementById('page-content')), 1500);
    } else {
      App.showMsg(document.getElementById('km-msg'), 'Error: ' + result.error, true);
    }
  }
};
