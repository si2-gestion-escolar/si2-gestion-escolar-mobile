// app.json se mantiene con todos los valores estaticos; este archivo solo
// agrega la ruta de google-services.json en tiempo de build. Localmente usa
// el archivo del disco (./google-services.json, nunca subido a git); en EAS
// Build en la nube usa la variable de entorno tipo archivo GOOGLE_SERVICES_JSON
// (ver README) porque EAS solo sube lo que esta en git.
const appJson = require('./app.json')

module.exports = ({ config }) => ({
  ...config,
  ...appJson.expo,
  android: {
    ...appJson.expo.android,
    googleServicesFile:
      process.env.GOOGLE_SERVICES_JSON ?? appJson.expo.android.googleServicesFile,
  },
})
