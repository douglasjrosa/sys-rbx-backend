# Estágio 1: Build
FROM node:18-slim as build

# Instalar dependências necessárias para compilar pacotes nativos
RUN apt-get update && apt-get install -y \
    build-essential \
    pkg-config \
    python3 \
    libvips-dev \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/
COPY package.json package-lock.json ./
RUN npm install --production=false

WORKDIR /opt/app
COPY . .
RUN npm run build

# Estágio 2: Runtime
FROM node:18-slim
RUN apt-get update && apt-get install -y libvips-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/
COPY --from=build /opt/node_modules ./node_modules
WORKDIR /opt/app
COPY --from=build /opt/app ./

ENV PATH /opt/node_modules/.bin:$PATH
ENV NODE_ENV production

RUN chown -R node:node /opt/app
USER node
EXPOSE 1339
CMD ["npm", "run", "start"]
