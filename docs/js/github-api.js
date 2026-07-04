// GitHub API - Repo publico
// LEER: sin token (el repo es publico)
// ESCRIBIR: necesita token (se pide al propietario la primera vez)
const GitHubAPI = {
  owner: 'HenrySali',
  repo: 'Auto',
  branch: 'main',

  init() {},

  getToken() {
    return localStorage.getItem('gh_write_token') || null;
  },

  setToken(token) {
    localStorage.setItem('gh_write_token', token);
  },

  hasWriteAccess() {
    return !!this.getToken();
  },

  headersRead() {
    const token = this.getToken();
    if (token) {
      return {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      };
    }
    return { 'Accept': 'application/vnd.github.v3+json' };
  },

  headersWrite() {
    const token = this.getToken();
    return {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    };
  },

  async readFile(path) {
    try {
      const res = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}?ref=${this.branch}&t=${Date.now()}`,
        { headers: this.headersRead() }
      );
      if (!res.ok) {
        if (res.status === 404) return { content: null, sha: null };
        throw new Error(`Error ${res.status}`);
      }
      const data = await res.json();
      const content = JSON.parse(atob(data.content));
      return { content, sha: data.sha };
    } catch (error) {
      console.error('Error leyendo:', path, error);
      return { content: null, sha: null };
    }
  },

  async writeFile(path, content, sha, message) {
    if (!this.hasWriteAccess()) {
      return { success: false, error: 'Sin acceso de escritura. Configura el token.' };
    }
    try {
      const body = {
        message: message || `Actualizar ${path}`,
        content: btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2)))),
        branch: this.branch
      };
      if (sha) body.sha = sha;

      const res = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}`,
        { method: 'PUT', headers: this.headersWrite(), body: JSON.stringify(body) }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || `Error ${res.status}`);
      }
      const data = await res.json();
      return { success: true, sha: data.content.sha };
    } catch (error) {
      console.error('Error escribiendo:', path, error);
      return { success: false, error: error.message };
    }
  },

  async uploadImage(filename, base64Data, message) {
    if (!this.hasWriteAccess()) {
      return { success: false, error: 'Sin acceso de escritura.' };
    }
    try {
      const path = `data/fotos/${filename}`;
      const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
      const body = {
        message: message || `Foto: ${filename}`,
        content: cleanBase64,
        branch: this.branch
      };
      const res = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}`,
        { method: 'PUT', headers: this.headersWrite(), body: JSON.stringify(body) }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || `Error ${res.status}`);
      }
      const data = await res.json();
      return { success: true, url: data.content.download_url, sha: data.content.sha };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getData(filename) {
    const { content } = await this.readFile(`data/${filename}`);
    return content;
  },

  async saveData(filename, content, message) {
    const { sha } = await this.readFile(`data/${filename}`);
    return await this.writeFile(`data/${filename}`, content, sha, message);
  }
};
