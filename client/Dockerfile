FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install --force

RUN npm install -g @angular/cli

COPY . .

RUN ng build --configuration=production

RUN echo "Checking /app directory contents from build stage:" && ls -la /app

FROM nginx:latest

COPY --from=build app/dist/client /usr/share/nginx/html

EXPOSE 80