# Use a imagem Node.js como base
FROM node:18

# Crie e defina o diretório de trabalho dentro do contêiner
WORKDIR /opt/app

# Copie o arquivo package.json e yarn.lock para o contêiner
COPY package.json yarn.lock ./

# Instale as dependências do projeto usando o Yarn
RUN yarn install

# Copie todo o restante do código-fonte para o contêiner
COPY . .

# Exponha a porta 1339 (ou a porta que você deseja)
EXPOSE 1339

# Comando para iniciar o Strapi (substitua pelo seu comando Strapi)
CMD ["yarn", "dev"]
