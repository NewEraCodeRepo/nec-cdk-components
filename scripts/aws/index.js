const { npmSecret } = require('./npmSecret');
const { githubSecret } = require('./githubSecret');
const { importGithubCreds } = require('./importGithubCreds');

(async () => {
  try {
    await npmSecret(); // creates npm secure parameter
    await githubSecret();
    await importGithubCreds();
  } catch (e) {
    console.log(e);
  }
})();
