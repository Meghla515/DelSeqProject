# README
# Structure

Frontend files are located in the root `src` directory. 
Backend files are located in `functions/src/`
The static ASP rules are located in /functions/src/asp/

## Getting started

### Run frontend locally

`npm run start`

### Run API and database emulators locally

When testing and developing, all Firebase features should be emulated, so that it won't interfere with the production data.

To run firestore and functions emulator:
`firebase emulators:start`

The emulators do not currently persist the data, so it will be reset when it's shut down. To store the data for later use, run the following command while the emulator is running:
`firebase emulators:export seed`

To start up the emulator with data from the previous session run the following command:
`firebase emulators:start --import seed`

If there's been changes to the backend API, the service has to be built in advance:
`cd functions && npm run build`

### Firebase deploy

`firebase deploy`

### Run tests

Make sure that the frontend and emulators are running, and that the database is seeded with the correct data. Then run the following:

`npm run e2e`
