FROM node:20-alpine3.18

RUN addgroup app && adduser -S -G app app

USER app

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

# change ownership of the /app directory to the app user
USER root

# change ownership of the /app directory to the app user
# chown -R <user>:<group> <directory>
# chown command changes the user and/or group ownership of for given file.
RUN chown -R app:app .

# change the user back to the app user
USER app

RUN npm install
RUN npx prisma generate

COPY . . 

RUN npm run build

EXPOSE 3001 

CMD npm run start
# CMD ["node", "dist/src/main.js"]
