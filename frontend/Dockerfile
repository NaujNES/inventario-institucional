# Etapa 1: Construcción (Build)
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
# LA MAGIA ESTÁ AQUÍ: --include=dev
RUN npm install --include=dev 

COPY . .
RUN npm run build

# Etapa 2: Servidor Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]