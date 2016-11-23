import Fs from 'fs';
import Path from 'path';
import Glob from 'glob';
import NaturalSort from 'javascript-natural-sort';

const imageDir = './images';
const imageExt = process.argv[2];
const textDir = './pbTexts';
const textExt = process.argv[3];
const newTextDir = './newPbTexts';
const pbRegex = new RegExp(/<pb id=".+?"\/>/, 'g');

let imageNames = getFileNames(imageDir, imageExt);
let pbTextNames = getFileNames(textDir, textExt);
let pbTexts = getTexts(textDir, textExt);
let newPbTexts = getNewPbTexts(imageNames, pbTexts);
writeTexts(newPbTexts, newTextDir, pbTextNames, textExt);

function getFileRoutes(dir, ext) {
  return Glob.sync(dir + '/**/*.' + ext);
}

function getFileNames(dir, ext) {
  return getFileRoutes(dir, ext)
    .map((route) => {
      return Path.basename(route, '.' + ext);
    })
    .sort(NaturalSort);
}

function getTexts(dir, ext) {
  return getFileRoutes(dir, ext)
    .sort(NaturalSort)
    .map((route) => {
      return Fs.readFileSync(route, 'utf8');
    });
}

function getNewPbTexts(imageNames, pbTexts) {
  let i = 0;

  return pbTexts.map((pbText) => {
    return pbText.replace(pbRegex, (pbTag) => {
      if (imageNames[i]) {
        let newPbTag = '<pb id="' + imageNames[i] + '"\/>';
        i++;
        return newPbTag;
      }
      else {
        return pbTag;
      }
    });
  });
}

function writeTexts(texts, dir, names, ext) {
  texts.forEach((text, i) => {
    let route = dir + '/' + names[i] + '.' + ext;
    Fs.writeFile(route, text, 'utf8', (err) => {
      if (err) {
        throw err;
      }
    });
  });
}