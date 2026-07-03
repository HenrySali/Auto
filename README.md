# 🚗 Auto Manager - Gestion de Auto en Cabify

App 100% gratuita para gestionar el alquiler semanal de un auto en Cabify.
**Sin servidor. Sin costos. Para siempre.**

## Como funciona
- La app corre en **GitHub Pages** (gratis)
- Los datos se guardan como archivos **JSON en este repo**
- Las fotos se suben directamente al repo (comprimidas)
- Cada operacion es un commit automatico via la API de GitHub

## Modelo de negocio
- Renta semanal fija: **$420,000 COP**
- Dia de entrega: **Sabados**
- Conductor registra km diario, sube fotos del auto cada sabado

## Roles
- **Admin/Dueno**: Ve todo, confirma entregas, registra gastos y mantenimientos
- **Conductor**: Registra km, entregas, fotos y notas

## Primer uso

1. Ve a la app: `https://henrysali.github.io/Auto/`
2. Necesitas un **token de GitHub**:
   - Ve a GitHub.com > Settings > Developer settings
   - Personal access tokens > Tokens (classic)
   - Generate new token
   - Marca el permiso **"repo"** completo
   - Copia el token (empieza con ghp_)
3. Entra a la app con tu nombre, rol y token
4. Listo!

## Estructura de datos
```
data/
  km.json           - Kilometraje diario
  entregas.json     - Entregas semanales ($420k)
  gastos.json       - Gastos del vehiculo
  notas.json        - Comunicacion entre todos
  vehiculo.json     - Mantenimientos y alertas
  config.json       - Configuracion (renta, etc)
  fotos_index.json  - Indice de fotos
  fotos/            - Fotos del vehiculo
docs/               - App web (GitHub Pages)
```

## Activar GitHub Pages
1. Ve a Settings del repo
2. Pages > Source: "Deploy from a branch"
3. Branch: main, Folder: /docs
4. Save
5. En ~1 min estara en: https://henrysali.github.io/Auto/
