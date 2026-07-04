const VehiculoPage = {
  render(container) {
    const { mantenimientos, alertas } = App.data.vehiculo;
    const alertasActivas = alertas.filter(a => a.estado === 'activa');
    container.innerHTML = `
      <h2 class="page-title">🚗 Control Vehiculo</h2>
      <div class="card">
        <div class="flex-between mb-2">
          <h3 class="card-title">⚠️ Alertas</h3>
          <button onclick="VehiculoPage.showAlertForm()" class="btn btn-primary btn-sm">+ Alerta</button>
        </div>
        <div id="alert-form" style="display:none"></div>
        ${alertasActivas.length === 0 ? '<p class="text-muted">Sin alertas</p>' :
          alertasActivas.map((a, i) => `
            <div class="list-item"><div><p class="font-medium">${a.titulo}</p>
            <p class="text-muted">${a.tipo} - Vence: ${a.fecha_vence}</p></div>
            <button onclick="VehiculoPage.resolverAlerta(${i})" class="btn btn-success btn-sm">Resolver</button></div>
          `).join('')}
      </div>
      <div class="card">
        <div class="flex-between mb-2">
          <h3 class="card-title">🔧 Mantenimientos</h3>
          <button onclick="VehiculoPage.showMantForm()" class="btn btn-primary btn-sm">+ Mant.</button>
        </div>
        <div id="mant-form" style="display:none"></div>
        ${mantenimientos.length === 0 ? '<p class="text-muted">Sin mantenimientos</p>' :
          mantenimientos.map((m, i) => `
            <div class="list-item"><div><p class="font-medium">${m.titulo}</p>
            <p class="text-muted">${m.fecha||''}${m.km_limite?' '+m.km_limite+' km':''}</p></div>
            <div>${m.estado==='pendiente'?`<button onclick="VehiculoPage.completarMant(${i})" class="btn btn-success btn-sm">Hecho</button>`:''}<span class="badge badge-${m.estado==='completado'?'success':'warning'}">${m.estado}</span></div></div>
          `).join('')}
      </div>`;
  },
  showAlertForm() {
    document.getElementById('alert-form').style.display = 'block';
    document.getElementById('alert-form').innerHTML = `
      <form onsubmit="VehiculoPage.saveAlerta(event)" class="mt-2">
        <input type="text" id="al-titulo" class="input" placeholder="Titulo" required>
        <div class="grid-2 mt-1"><input type="date" id="al-fecha" class="input" required>
        <select id="al-tipo" class="input"><option value="seguro">Seguro</option><option value="verificacion">Verificacion</option><option value="licencia">Licencia</option><option value="mantenimiento">Mantenimiento</option><option value="otro">Otro</option></select></div>
        <button type="submit" class="btn btn-primary w-full btn-sm mt-1">Guardar</button></form>`;
  },
  showMantForm() {
    document.getElementById('mant-form').style.display = 'block';
    document.getElementById('mant-form').innerHTML = `
      <form onsubmit="VehiculoPage.saveMant(event)" class="mt-2">
        <input type="text" id="mt-titulo" class="input" placeholder="Ej: Cambio aceite" required>
        <div class="grid-2 mt-1"><input type="date" id="mt-fecha" class="input">
        <input type="number" id="mt-km" class="input" placeholder="A los X km"></div>
        <button type="submit" class="btn btn-primary w-full btn-sm mt-1">Guardar</button></form>`;
  },
  async saveAlerta(e) {
    e.preventDefault();
    App.data.vehiculo.alertas.push({ titulo: document.getElementById('al-titulo').value, fecha_vence: document.getElementById('al-fecha').value, tipo: document.getElementById('al-tipo').value, estado: 'activa', timestamp: new Date().toISOString() });
    App.showLoading(true);
    await GitHubAPI.saveData('vehiculo.json', App.data.vehiculo, 'Nueva alerta');
    App.showLoading(false);
    VehiculoPage.render(document.getElementById('page-content'));
  },
  async saveMant(e) {
    e.preventDefault();
    App.data.vehiculo.mantenimientos.push({ titulo: document.getElementById('mt-titulo').value, fecha: document.getElementById('mt-fecha').value||null, km_limite: parseInt(document.getElementById('mt-km').value)||null, estado: 'pendiente', timestamp: new Date().toISOString() });
    App.showLoading(true);
    await GitHubAPI.saveData('vehiculo.json', App.data.vehiculo, 'Nuevo mantenimiento');
    App.showLoading(false);
    VehiculoPage.render(document.getElementById('page-content'));
  },
  async resolverAlerta(idx) {
    App.data.vehiculo.alertas[idx].estado = 'resuelta';
    App.showLoading(true);
    await GitHubAPI.saveData('vehiculo.json', App.data.vehiculo, 'Alerta resuelta');
    App.showLoading(false);
    VehiculoPage.render(document.getElementById('page-content'));
  },
  async completarMant(idx) {
    App.data.vehiculo.mantenimientos[idx].estado = 'completado';
    App.showLoading(true);
    await GitHubAPI.saveData('vehiculo.json', App.data.vehiculo, 'Mantenimiento completado');
    App.showLoading(false);
    VehiculoPage.render(document.getElementById('page-content'));
  }
};
