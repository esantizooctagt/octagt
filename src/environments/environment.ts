// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // apiUrl: 'https://7zlzt08oi1.execute-api.us-east-1.amazonaws.com', // 
  apiUrl: 'https://31m1uop4pi.execute-api.us-east-1.amazonaws.com/dev', //'http://localhost:3000'
  bucket: 'https://octagt-erp.s3.amazonaws.com/'
  // apiLocUrl: '7ea1cff846ab05c3a53b2471383af0f1'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
