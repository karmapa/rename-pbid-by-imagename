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
  if (undefined === ext) {
    throw new Error('Please add file extension in command line, e.g. \'node index.js jpg xml\'')
  }

  let routes = Glob.sync(dir + '/**/*.' + ext);

  if (0 === routes.length) {
    throw new Error('There is no files in \'' + dir + '\' folder');
  }

  return routes;
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
  checkImageAndPbNumber(imageNames, pbTexts);

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

function checkImageAndPbNumber(imageNames, pbTexts) {
  let pbs = pbTexts.map((pbText) => {
      return pbText.match(pbRegex) || [];
    })
    .reduce((arr1, arr2) => {
      return arr1.concat(arr2);
    });

  let pbN = pbs.length, imageN = imageNames.length;

  if (0 === pbN) {
    throw new Error('There is no pb tag in all text files');
  }

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

function writeTexts(texts, dir, names, ext) {
  texts.forEach((text, i) => {
    let route = dir + '/' + names[i] + '.' + ext;
    Fs.writeFile(route, text, 'utf8', (err) => {
      if (err) {
        throw err;
      }
      else {
        console.log('Rename pb id in', route, 'done');
      }
    });
  });
}