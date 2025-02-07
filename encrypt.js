const openpgp = require('openpgp');
const fs = require('fs');
const process = require('process');
const utils = require('./utils');

const CERT_CANNOT_ENCRYPT = 17;

const encrypt = async (withPassword, signWith, withKeyPassword, certfile) => {
  const data = utils.read_stdin();
  if (withPassword) {
    const password = fs.readFileSync(withPassword);
    const options = {
      message: await openpgp.createMessage({ text: data.toString('utf8') }),
      passwords: password
    };
    openpgp.encrypt(options).then((ciphertext) => {
      process.stdout.write(ciphertext);
    });
    return;
  }

  const options = {
    message: await openpgp.createMessage({ text: data.toString('utf8') }),
    encryptionKeys: await utils.load_certs(certfile),
    format: 'armored'
  };
  if (signWith) {
    let signingKeys = await utils.load_keys(signWith);
    if (withKeyPassword) {
      const keyPassword = fs.readFileSync(withKeyPassword, 'utf8');
      signingKeys = await Promise.all(signingKeys.map(privateKey => openpgp.decryptKey({
        privateKey,
        passphrase: [keyPassword, keyPassword.trimEnd()]
      })));
    }
    options.signingKeys = signingKeys;
  }

  openpgp.encrypt(options).then((ciphertext) => {
    process.stdout.write(ciphertext);
  }).catch((e) => {
    console.error(e);
    return process.exit(CERT_CANNOT_ENCRYPT);
  });
};

module.exports = encrypt;
