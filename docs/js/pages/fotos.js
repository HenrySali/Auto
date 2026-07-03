const FotosPage = {
  render(container) {
    container.innerHTML = `
      <h2 class="page-title">📷 Fotos del Vehiculo</h2>
      <div class="card card-info"><p>Sube fotos del estado del carro cada sabado. Se comprimen automaticamente.</p></div>

      <form class="card" onsubmit="FotosPage.upload(event)">
        <h3 class="card-title">Subir fotos</h3>
        <div class="form-group">
          <input type="file" id="foto-input" accept="image/jpeg,image/png,image/webp" multiple class="input">
        </div>
        <div class="grid-2">
          <div class="form-group"><label>Fecha</label><input type="date" id="foto-fecha" value="${App.today()}" class="input"></div>
          <div class="form-group"><label>Descripcion</label><input type="text" id="foto-desc" class="input" placeholder="ej: Frente"></div>
        </div>
        <button type="submit" class="btn btn-primary w-full">Subir fotos</button>
        <div id="foto-msg"></div>
        <div id="foto-progress" style="display:none" class="progress-bar"><div id="foto-progress-fill" class="progress-fill"></div></div>
      </form>

      <div id="fotos-gallery">
        <p class="text-muted text-center">Cargando galeria...</p>
      </div>
    `;
    FotosPage.loadGallery();
  },

  async loadGallery() {
    // Leer las fotos registradas del km.json o un indice
    const data = await GitHubAPI.getData('fotos_index.json');
    const fotos = data || [];
    const gallery = document.getElementById('fotos-gallery');

    if (fotos.length === 0) {
      gallery.innerHTML = '<div class="card text-center text-muted">No hay fotos registradas</div>';
      return;
    }

    // Agrupar por fecha
    const grouped = {};
    fotos.forEach(f => {
      if (!grouped[f.fecha]) grouped[f.fecha] = [];
      grouped[f.fecha].push(f);
    });

    gallery.innerHTML = Object.entries(grouped).sort((a,b) => b[0].localeCompare(a[0])).map(([fecha, items]) => `
      <div class="card">
        <h3 class="card-title">📅 ${fecha}</h3>
        <div class="foto-grid">
          ${items.map(f => `
            <div class="foto-item">
              <img src="${f.url}" alt="${f.descripcion || 'Foto'}" loading="lazy">
              ${f.descripcion ? `<p class="text-muted text-sm">${f.descripcion}</p>` : ''}
            </div>
          `).join('')}
        </div>
        <p class="text-muted text-sm">Por: ${items[0].usuario}</p>
      </div>
    `).join('');
  },

  async upload(e) {
    e.preventDefault();
    const files = document.getElementById('foto-input').files;
    if (!files || files.length === 0) {
      App.showMsg(document.getElementById('foto-msg'), 'Selecciona al menos una foto', true);
      return;
    }

    const fecha = document.getElementById('foto-fecha').value;
    const descripcion = document.getElementById('foto-desc').value;
    const progress = document.getElementById('foto-progress');
    const fill = document.getElementById('foto-progress-fill');
    progress.style.display = 'block';

    // Cargar indice actual
    let fotosIndex = await GitHubAPI.getData('fotos_index.json') || [];

    for (let i = 0; i < files.length; i++) {
      fill.style.width = `${((i + 1) / files.length) * 100}%`;
      App.showMsg(document.getElementById('foto-msg'), `Subiendo ${i + 1} de ${files.length}...`, false);

      const compressed = await FotosPage.compressImage(files[i], 800, 0.7);
      const filename = `${fecha}_${Date.now()}_${i}.jpg`;
      const result = await GitHubAPI.uploadImage(filename, compressed, `Foto ${fecha}: ${descripcion || 'estado vehiculo'}`);

      if (result.success) {
        fotosIndex.push({
          fecha,
          descripcion: descripcion || null,
          url: result.url,
          filename,
          usuario: App.currentUser.nombre,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Guardar indice actualizado
    await GitHubAPI.saveData('fotos_index.json', fotosIndex, `Fotos ${fecha}: ${files.length} fotos`);

    progress.style.display = 'none';
    App.showMsg(document.getElementById('foto-msg'), `${files.length} foto(s) subidas ✓`, false);
    document.getElementById('foto-input').value = '';
    FotosPage.loadGallery();
  },

  // Comprimir imagen antes de subir
  compressImage(file, maxWidth, quality) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }
};
