const Dashboard = {
  render(container) {
    const { km, entregas, gastos, vehiculo, notas, config } = App.data;

    const totalIngresos = entregas.reduce((sum, e) => sum + (e.monto_pagado || 0), 0);
    const totalGastos = gastos.reduce((sum, g) => sum + (g.monto || 0), 0);
    const ganancia = totalIngresos - totalGastos;
    const deuda = entregas.reduce((sum, e) => sum + ((e.monto_debido || config.renta_semanal) - (e.monto_pagado || 0)), 0);

    const ultimoKm = km.length > 0 ? km[km.length - 1] : null;
    const alertasActivas = vehiculo.alertas.filter(a => a.estado === 'activa');
    const mantPendientes = vehiculo.mantenimientos.filter(m => m.estado === 'pendiente');
    const notasSinLeer = notas.filter(n => !n.leida).length;

    container.innerHTML = `
      <h2 class="page-title">Hola, ${App.currentUser.nombre}</h2>
      
      <div class="grid-2">
        <div class="card stat-card">
          <p class="stat-label">Ingresos (renta)</p>
          <p class="stat-value success">${App.formatMoney(totalIngresos)}</p>
        </div>
        <div class="card stat-card">
          <p class="stat-label">Gastos vehiculo</p>
          <p class="stat-value danger">${App.formatMoney(totalGastos)}</p>
        </div>
        <div class="card stat-card">
          <p class="stat-label">Ganancia neta</p>
          <p class="stat-value ${ganancia >= 0 ? 'success' : 'danger'}">${App.formatMoney(ganancia)}</p>
        </div>
        <div class="card stat-card">
          <p class="stat-label">Deuda pendiente</p>
          <p class="stat-value ${deuda > 0 ? 'warning' : 'success'}">${App.formatMoney(deuda)}</p>
        </div>
      </div>

      ${ultimoKm ? `
        <div class="card">
          <h3 class="card-title">Ultimo km registrado</h3>
          <p class="stat-value">${ultimoKm.km_fin.toLocaleString()} km</p>
          <p class="text-muted">${ultimoKm.fecha} - Recorrido: ${ultimoKm.km_fin - ultimoKm.km_inicio} km</p>
        </div>
      ` : ''}

      ${alertasActivas.length > 0 ? `
        <div class="card card-warning">
          <h3 class="card-title">⚠️ Alertas</h3>
          ${alertasActivas.map(a => `
            <div class="list-item">
              <span>${a.titulo}</span>
              <span class="text-muted">${a.fecha_vence}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${mantPendientes.length > 0 ? `
        <div class="card">
          <h3 class="card-title">🔧 Mantenimientos pendientes</h3>
          ${mantPendientes.slice(0, 3).map(m => `
            <div class="list-item">
              <span>${m.titulo}</span>
              <span class="text-muted">${m.fecha || (m.km_limite + ' km')}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${notasSinLeer > 0 ? `
        <div class="card card-primary">
          <p>${notasSinLeer} nota(s) sin leer</p>
        </div>
      ` : ''}

      ${entregas.length > 0 ? `
        <div class="card">
          <h3 class="card-title">Ultimas entregas</h3>
          ${entregas.slice(-4).reverse().map(e => `
            <div class="list-item">
              <div>
                <p class="text-sm font-medium">${e.semana_inicio} - ${e.semana_fin}</p>
                <p class="text-muted">${e.km_total || 0} km</p>
              </div>
              <span class="badge badge-${e.estado === 'pagado' ? 'success' : e.estado === 'parcial' ? 'warning' : 'danger'}">${e.estado}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;
  }
};
