FROM node:24-alpine

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm install --only=production

# Copie des sources
COPY . .

# Port d'écoute de l'application Express
EXPOSE 3000

CMD ["node", "server.js"]