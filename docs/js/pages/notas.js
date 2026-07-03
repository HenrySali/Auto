const NotasPage = {
  render(container) {
    container.innerHTML = `
      <h2 class="page-title">📝 Notas y Avisos</h2>
      <form class="card" onsubmit="NotasPage.save(event)">
        <textarea id="nota-content" class="input" rows="3" placeholder="Escribe una nota..." required></textarea>
        <div class="flex-row mt-2">
          <select id="nota-prioridad" class="input" style="width:auto">
            <option value="normal">Normal</option>
            <option value="urgente">🔴 Urgente</option>
          </select>
          <button type="submit" class="btn btn-primary flex-1">Enviar</button>
        </div>
        <div id="nota-msg"></div>
      </form>
      <div id="notas-list" class="mt-2">
        ${App.data.notas.length === 0 ?
          '<div class="card text-center text-muted">No hay notas</div>' :
          App.data.notas.slice().reverse().map(n => `
            <div class="card ${n.prioridad === 'urgente' ? 'card-danger' : ''} ${n.usuario === App.currentUser.nombre ? 'ml-4' : 'mr-4'}">
              <div class="flex-between">
                <span class="text-sm text-primary font-medium">${n.usuario}</span>
                ${n.prioridad === 'urgente' ? '<span class="badge badge-danger">URGENTE</span>' : ''}
              </div>
              <p class="mt-1">${n.contenido}</p>
              <p class="text-muted text-sm mt-1">${new Date(n.timestamp).toLocaleString('es-CO')}</p>
            </div>
          `).join('')
        }
      </div>
    `;
  },

  async save(e) {
    e.preventDefault();
    const nota = {
      contenido: document.getElementById('nota-content').value,
      prioridad: document.getElementById('nota-prioridad').value,
      usuario: App.currentUser.nombre,
      rol: App.currentUser.rol,
      leida: false,
      timestamp: new Date().toISOString()
    };
    App.showLoading(true);
    App.data.notas.push(nota);
    const result = await GitHubAPI.saveData('notas.json', App.data.notas, `Nota de ${nota.usuario}`);
    App.showLoading(false);
    if (result.success) {
      document.getElementById('nota-content').value = '';
      NotasPage.render(document.getElementById('page-content'));
    } else {
      App.data.notas.pop();
      App.showMsg(document.getElementById('nota-msg'), 'Error: ' + result.error, true);
    }
  }
};
