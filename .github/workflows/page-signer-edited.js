#!/usr/bin/env node
/* eslint node: true */

const fs = require('fs');
const child_process = require('child_process');
const Minimize = require('minimize');

function errorAbort(text) {
  console.error(text);
  process.exit(1);
}

function getSignature(content, callback) {
  const tmpfile = `/tmp/${process.pid}`;
  fs.writeFileSync(tmpfile, content, 'utf-8');
  
  // Uložení hesla do souboru
  const passphraseFile = '/path/to/passphrase/file'; // Změň na cestu k souboru s heslem
  const gpg = child_process.spawnSync('gpg', ['--armor', '--output', '-', '--detach-sign', '--passphrase-fd', '0', tmpfile], {
    stdio: [
      fs.openSync(passphraseFile, 'r'), // Otevření souboru s heslem pro čtení
      'pipe',
      process.stderr
    ]
  });

  fs.unlink(tmpfile, () => {});

  callback(gpg.stdout.toString());
}

let args = process.argv.slice(2);

const filename = args.shift();
const outfile = args.shift();

if (!filename) {
  errorAbort(`Usage: ${process.argv[1]} <infile> [outfile]`);
}

fs.readFile(filename, 'utf8', (err, data) => {
  if (err) {
    errorAbort(err);
  }

  // Minimize and strip the doctype
  const content = new Minimize({ spare: true, conditionals: true, empty: true, quotes: true }).parse(data)
    .replace(/^\s*<!doctype[^>]*>/i, '');

  getSignature(content, (signature) => {
    const out = data.replace('%%%SIGNED_PAGES_PGP_SIGNATURE%%%', signature);

    if (outfile) {
      fs.writeFile(outfile, out, 'utf8', (writeErr) => {
        if (writeErr) {
          errorAbort(writeErr);
        }
      });
    } else {
      process.stdout.write(out);
    }
  });
});
