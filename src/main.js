import Fs from 'fs';
import Path from 'path';
import Glob from 'glob';
import NaturalSort from 'javascript-natural-sort';

const imageDir = './images';
const imageExt = process.argv[2];

let imageNames = getFileNames(imageDir, imageExt);
console.log(imageNames);

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