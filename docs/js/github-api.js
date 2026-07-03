// Servicio para leer/escribir archivos JSON en el repo via GitHub API
const GitHubAPI = {
  owner: 'HenrySali',
  repo: 'Auto',
  branch: 'main',
  token: null,

  init(token) {
    this.token = token;
    localStorage.setItem('gh_token', token);
  },

  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem('gh_token');
    }
    return this.token;
  },

  headers() {
    return {
      'Authorization': `token ${this.getToken()}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    };
  },

  // Leer un archivo JSON del repo
  async readFile(path) {
    try {
      const res = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}?ref=${this.branch}&t=${Date.now()}`,
        { headers: this.headers() }
      );
      if (!res.ok) {
        if (res.status === 404) return { content: null, sha: null };
        throw new Error(`Error ${res.status}`);
      }
      const data = await res.json();
      const content = JSON.parse(atob(data.content));
      return { content, sha: data.sha };
    } catch (error) {
      console.error('Error leyendo archivo:', path, error);
      return { content: null, sha: null };
    }
  },

  // Escribir/actualizar un archivo JSON en el repo
  async writeFile(path, content, sha, message) {
    try {
      const body = {
        message: message || `Actualizar ${path}`,
        content: btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2)))),
        branch: this.branch
      };
      if (sha) body.sha = sha;

      const res = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}`,
        {
          method: 'PUT',
          headers: this.headers(),
          body: JSON.stringify(body)
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || `Error ${res.status}`);
      }
      const data = await res.json();
      return { success: true, sha: data.content.sha };
    } catch (error) {
      console.error('Error escribiendo archivo:', path, error);
      return { success: false, error: error.message };
    }
  },

  // Subir una imagen (base64) al repo
  async uploadImage(filename, base64Data, message) {
    try {
      const path = `data/fotos/${filename}`;
      // Quitar el prefijo data:image/...;base64,
      const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');

      const body = {
        message: message || `Foto: ${filename}`,
        content: cleanBase64,
        branch: this.branch
      };

      const res = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}`,
        {
          method: 'PUT',
          headers: this.headers(),
          body: JSON.stringify(body)
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || `Error ${res.status}`);
      }
      const data = await res.json();
      return {
        success: true,
        url: data.content.download_url,
        sha: data.content.sha
      };
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      return { success: false, error: error.message };
    }
  },

  // Leer datos JSON con cache simple
  async getData(filename) {
    const { content } = await this.readFile(`data/${filename}`);
    return content;
  },

  // Escribir datos JSON (lee sha actual, luego escribe)
  async saveData(filename, content, message) {
    const { sha } = await this.readFile(`data/${filename}`);
    return await this.writeFile(`data/${filename}`, content, sha, message);
  },

  // Verificar que el token funciona
  async verifyToken() {
    try {
      const res = await fetch('https://api.github.com/user', {
        headers: this.headers()
      });
      if (!res.ok) return { valid: false };
      const user = await res.json();
      return { valid: true, user: user.login };
    } catch {
      return { valid: false };
    }
  }
};
