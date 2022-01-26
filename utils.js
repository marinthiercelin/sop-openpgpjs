const openpgp = require('openpgp');
const fs = require('fs');
const process = require('process');

const BAD_DATA = 41;

const load_certs = async (filename) => {
    const buf = fs.readFileSync(filename);

    let certs = await openpgp.key.read(buf);
    if (!certs.keys[0]) {
	try {
	    certs = await openpgp.key.readArmored(buf);
	} catch (e) {
	    console.error(e);
	    return process.exit(BAD_DATA);
	}
    }

    return certs;
}

const load_keys = async (filename) => {
    const buf = fs.readFileSync(filename);

    let keys = await openpgp.key.read(buf);
    if (!keys.keys[0]) {
	try {
	    keys = await openpgp.key.readArmored(buf);
	} catch (e) {
	    console.error(e);
	    return process.exit(BAD_DATA);
	}
    }

    return keys;
}

const read_stdin = () => {
    // Using the file descriptor 0 is unreliable, because EAGAIN is
    // not handled.  Using '/dev/stdin' works better, but will not
    // work on non-posixly systems.
    return fs.readFileSync('/dev/stdin');
}

// Emits a Date as specified in Section 5.9 of the SOP spec.
const format_date = (d) => {
    // E.g.: 2019-10-24T23:48:29Z
    return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}T`
	+ `${d.getUTCHours()}:${d.getUTCMinutes()}:${d.getUTCSeconds()}Z`;
}

module.exports.load_certs = load_certs;
module.exports.load_keys = load_keys;
module.exports.read_stdin = read_stdin;
module.exports.format_date = format_date;
