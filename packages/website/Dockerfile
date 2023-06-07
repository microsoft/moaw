# syntax=docker/dockerfile:1

# Build website
# ------------------------------------
FROM node:18-bullseye as build
WORKDIR /app
COPY ./package*.json ./
COPY ./workshops ./workshops
COPY ./packages/website ./packages/website
COPY ./.git ./.git
RUN npm ci --workspace=website --cache /tmp/empty-cache
RUN npm run build:root --workspace=website

# Run website
# ------------------------------------
FROM nginx:latest

WORKDIR /app
# Copy the build output to replace the default nginx contents.
COPY --from=build /app/packages/website/dist/website /usr/share/nginx/html
COPY ./packages/website/nginx/default.conf /etc/nginx/conf.d/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
