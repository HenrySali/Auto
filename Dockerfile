FROM node:22-slim

# Instalar dependencias del sistema para better-sqlite3
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instalar dependencias del servidor
COPY package.json package-lock.json ./
RUN npm ci

# Instalar dependencias del cliente
COPY client/package.json client/package-lock.json ./client/
RUN cd client && npm ci

# Copiar código fuente
COPY . .

# Build del frontend
RUN cd client && npm run build

# Crear directorio para uploads y data
RUN mkdir -p /app/data /app/client/public/uploads

# Puerto
EXPOSE 3001

# Producción
ENV NODE_ENV=production
ENV PORT=3001

CMD ["node", "server/index.js"]
