# Dockerfile para desarrollo con Vue + Vite
# Usamos una imagen base de Node.js LTS

FROM node:20-alpine

# Definir variables de entorno para desarrollo
ENV NODE_ENV=development
ENV HOST=0.0.0.0

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de package para instalar dependencias primero
# Esto optimiza el cache de Docker cuando solo cambia el código fuente
COPY package*.json ./

# Instalar dependencias
# --prefer-offline usa cache local si está disponible
# --no-audit omite el audit de seguridad para acelerar instalación
# --no-fund omite mensajes de donation
RUN npm install --force

# Copiar el resto del código fuente
COPY . .

# Exponer el puerto del servidor Vite (configurado en vite.config.js)
EXPOSE 3000

# Comando para iniciar el servidor de desarrollo
# --host hace que el servidor sea accesible desde fuera del contenedor
CMD ["npm", "run", "dev", "--", "--host"]

