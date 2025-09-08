# 1. Base leve e estável
FROM node:18-bullseye-slim

# 2. Crie pasta de trabalho e use usuário não-root
WORKDIR /app
RUN mkdir -p /data && chown node:node /app /data
USER node

# 3. Copie package.json e instale dependências
COPY --chown=node:node package*.json ./
RUN npm ci --only=production

# 4. Copie o restante do código
COPY --chown=node:node . .

# 5. Ambiente, porta e comando
ENV NODE_ENV=production
ENV DATABASE_FILE=/data/app.db
EXPOSE 3000
CMD ["node","Servidor_Principal.cjs"]
