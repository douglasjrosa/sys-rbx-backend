FROM node:18-alpine
RUN mkdir -p /var/www/html/Backend/sisVendas/node_modules && chmod -R /var/www/html/Backend/sisVendas/node_modules
WORKDIR /var/www/html/Backend/sisVendas
COPY package*.json . /
RUN npm install
COPY . .
EXPOSE 1337
RUN npm rum build
CMD [ "npm", "start" ]
