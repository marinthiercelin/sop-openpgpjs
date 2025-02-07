/*global process*/

const openpgp = require('openpgp');
const fs = require('fs');
const utils = require('./utils');

const sign = async (certfile, withKeyPassword) => {
  const data = utils.read_stdin();

  let signingKeys = await utils.load_keys(certfile);
  if (withKeyPassword) {
    const keyPassword = fs.readFileSync(withKeyPassword, 'utf8');
    signingKeys = await Promise.all(signingKeys.map(privateKey => openpgp.decryptKey({
      privateKey,
      passphrase: [keyPassword, keyPassword.trimEnd()]
    })));
  }

  const options = {
    message: await openpgp.createMessage({ text: data.toString('utf8') }),
    signingKeys,
    format: 'armored',
    detached: true
  };

  openpgp.sign(options).then(async (signature) => {
    process.stdout.write(signature);
  });
};

module.exports = sign;
