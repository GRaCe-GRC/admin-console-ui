FROM --platform=$BUILDPLATFORM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM nginx:stable-alpine
ENV ADMIN_CONSOLE_SERVICE_URL=http://admin-console-service:8080
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/admin-console-ui/browser /usr/share/nginx/html
EXPOSE 80
