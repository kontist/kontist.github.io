# Kontist Client Management

This is the source code of the Kontist Client Management (available here: https://kontist.dev/client-management/)

### Description

The Kontist Client Management allows Kontist user to manage (CRUD) their OAuth2 clients.

### Running locally

1. start your kontist backend locally
2. `yarn && yarn start` / `npm install && npm start`
3. go to `http://localhost:3001/client-management`

### Deploying changes

The app is deploying through github pages so the compiled app must be checked into version control.

If you make changes to the code, once you are happy with them, please run `yarn build`, it will generate the compiled app the in `/client-management` directory, and once you merge to master, the new app version will be deployed automatically.
It is good practice to commit the compiled code in a separate commit.
