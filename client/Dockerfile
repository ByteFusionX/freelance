# Stage 1: Build Angular app
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install --force

RUN npm install -g @angular/cli

COPY . .

RUN ng build --configuration=production

# Stage 2: Nginx stage with directory check
FROM nginx:latest

# Check contents of /app in the build stage before copying to nginx
RUN echo "Checking /app directory contents from build stage:" && ls -la /app --from=build

COPY --from=build /app/dist/client /usr/share/nginx/html

EXPOSE 80
