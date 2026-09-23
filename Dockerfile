FROM node:22-alpine

WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

COPY backend/server.js ./backend/

WORKDIR /app/backend
ENV NODE_ENV=production
EXPOSE 10000

CMD ["npm", "start"]
