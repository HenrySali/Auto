const DatosPage = {
  render(container) {
    container.innerHTML = `
      <h2 class="page-title">💾 Datos</h2>

      <div class="card">
        <h3 class="card-title">Descargar respaldo</h3>
        <p class="text-muted text-sm mb-2">Descarga todos los datos en un archivo. Guardalo antes de actualizar.</p>
        <button onclick="DatosPage.descargar()" class="btn btn-primary w-full">📥 Descargar datos</button>
      </div>

      <div class="card">
        <h3 class="card-title">Cargar respaldo</h3>
        <p class="text-muted text-sm mb-2">Restaura datos desde un archivo descargado previamente.</p>
        <input type="file" id="datos-file" accept=".json" class="input">
        <button onclick="DatosPage.cargar()" class="btn btn-primary w-full mt-2">📤 Cargar datos</button>
        <div id="datos-msg"></div>
      </div>

      <div class="card card-info">
        <p class="text-sm">Los datos se guardan automaticamente en el repositorio. Este respaldo es por si necesitas restaurar.</p>
      </div>
    `;
  },

  descargar() {
    const backup = {
      fecha_backup: new Date().toISOString(),
      version: '2.0',
      km: App.data.km,
      entregas: App.data.entregas,
      gastos: App.data.gastos,
      notas: App.data.notas,
      vehiculo: App.data.vehiculo,
      config: App.data.config
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auto-backup-${App.today()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  async cargar() {
    const fileInput = document.getElementById('datos-file');
    if (!fileInput.files || fileInput.files.length === 0) {
      App.showMsg(document.getElementById('datos-msg'), 'Selecciona un archivo', true);
      return;
    }

    const file = fileInput.files[0];
    const text = await file.text();

    try {
      const backup = JSON.parse(text);

      if (!backup.km || !backup.entregas) {
        App.showMsg(document.getElementById('datos-msg'), 'Archivo invalido', true);
        return;
      }

      if (!confirm('Esto reemplazara TODOS los datos actuales. ¿Continuar?')) return;

      App.showLoading(true);

      // Restaurar cada archivo
      const saves = [];
      if (backup.km) saves.push(GitHubAPI.saveData('km.json', backup.km, 'Restaurar km desde backup'));
      if (backup.entregas) saves.push(GitHubAPI.saveData('entregas.json', backup.entregas, 'Restaurar entregas desde backup'));
      if (backup.gastos) saves.push(GitHubAPI.saveData('gastos.json', backup.gastos, 'Restaurar gastos desde backup'));
      if (backup.notas) saves.push(GitHubAPI.saveData('notas.json', backup.notas, 'Restaurar notas desde backup'));
      if (backup.vehiculo) saves.push(GitHubAPI.saveData('vehiculo.json', backup.vehiculo, 'Restaurar vehiculo desde backup'));
      if (backup.config) saves.push(GitHubAPI.saveData('config.json', backup.config, 'Restaurar config desde backup'));

      await Promise.all(saves);

      // Actualizar datos en memoria
      App.data.km = backup.km || [];
      App.data.entregas = backup.entregas || [];
      App.data.gastos = backup.gastos || [];
      App.data.notas = backup.notas || [];
      App.data.vehiculo = backup.vehiculo || { mantenimientos: [], alertas: [] };
      App.data.config = backup.config || App.data.config;

      App.showLoading(false);
      App.showMsg(document.getElementById('datos-msg'), 'Datos restaurados correctamente ✓', false);
    } catch (e) {
      App.showLoading(false);
      App.showMsg(document.getElementById('datos-msg'), 'Error: archivo no valido', true);
    }
  }
};
