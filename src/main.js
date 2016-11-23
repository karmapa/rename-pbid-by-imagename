import Fs from 'fs';
import Path from 'path';
import Glob from 'glob';
import NaturalSort from 'javascript-natural-sort';

const imageDir = './images';
const imageExt = process.argv[2];
const textDir = './pbTexts';
const textExt = process.argv[3];
const newTextDir = './newPbTexts';
const pbRegex = new RegExp(/<pb id=".*?"\/>/, 'g');

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
  compareImagePbNumber(imageNames, pbTexts);

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

function compareImagePbNumber(imageNames, pbTexts) {
  let imageN = imageNames.length;

  try {
    if (0 === imageN || 0 === pbTexts.length) {
      throw 'There is no image files or text files in \'images\' folder or \'pbTexts\' folder';
    }
  }
  catch(err) {
    console.log(err);
    return;
  }

  let pbs = pbTexts.map((pbText) => {
      return pbText.match(pbRegex) || [];
    })
    .reduce((arr1, arr2) => {
      return arr1.concat(arr2);
    });

  let pbN = pbs.length;

  if (imageN !== pbN) {
    console.log('There are', pbN, 'pb tags and', imageN, 'images');
    if (imageN > pbN) {
      console.log('The last pb', pbs[pbN - 1], 'is replaced by image name', imageNames[pbN - 1]);
    }
    else {
      console.log('Pb tags from', pbs[imageN], 'are not replaced');
    }
  }
}

function compareArrLength(arr1, arr2) {
  let arr1N = arr1.length;
  let arr2N = arr2.length;

  if (arr1N > arr2N) {
    console.log()
  }
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