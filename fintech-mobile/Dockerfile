# syntax=docker/dockerfile:1
FROM node:20-bookworm-slim AS build

WORKDIR /app

ARG EXPO_API_URL_WEB=http://localhost:8080/api
ARG EXPO_API_URL_ANDROID=http://10.0.2.2:8080/api
ARG EXPO_API_URL_IOS=http://localhost:8080/api
ARG EXPO_API_URL_DEVICE=http://192.168.19.159:8080/api

ENV CI=true \
    EXPO_NO_TELEMETRY=1 \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Provide Expo env vars at build-time (react-native-dotenv reads `.env`)
RUN printf "EXPO_API_URL_WEB=%s\nEXPO_API_URL_ANDROID=%s\nEXPO_API_URL_IOS=%s\nEXPO_API_URL_DEVICE=%s\n" \
  "$EXPO_API_URL_WEB" "$EXPO_API_URL_ANDROID" "$EXPO_API_URL_IOS" "$EXPO_API_URL_DEVICE" > .env

# Build static web bundle to /app/dist
RUN npx expo export -p web

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
