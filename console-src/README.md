# Kontist API Console

This is the source code of the Kontist API Console (available here: https://kontist.dev/console/)

### Description

The Kontist API Console allows Kontist user to manage (CRUD) their OAuth2 clients.

### Running locally

1. start your kontist backend locally
2. `yarn && yarn start` / `npm install && npm start`
3. go to `http://localhost:3001`

### Deploying changes

The app is deploying through github pages so the compiled app must be checked into version control.

If you make changes to the code, once you are happy with them, please run `yarn build`, it will generate the compiled app the in `/console` directory, and once you merge to master, the new app version will be deployed automatically.
It is good practice to commit the compiled code in a separate commit.
