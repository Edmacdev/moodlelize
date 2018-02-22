// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyBG56khGtfcj1zAT0Qp1ApZs5URTV8RAtU",
    authDomain: "moodlelize-dev.firebaseapp.com",
    databaseURL: "https://moodlelize-dev.firebaseio.com",
    projectId: "moodlelize-dev",
    storageBucket: "moodlelize-dev.appspot.com",
    messagingSenderId: "709060654841"
  }
};
