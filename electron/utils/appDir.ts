import fs from 'fs';
import path, { sep } from 'path';
import os from 'os';
import fse from 'fs-extra';

export const getAppDirectoryMain = () => {
  let dir = path.join(os.homedir(), '.app-mock-admin');
  if (process.platform === 'darwin') {
    dir = process.execPath.substring(0, process.execPath.indexOf('.app') + 4);
  }
  const isExist = fs.existsSync(dir);
  if (!isExist) {
    fse.mkdirpSync(dir);
  }
  return dir;
};

export const getAppPathMain = (dir: string) => path.join(getAppDirectoryMain(), dir);
export const getProjectPath = () => getAppPathMain('projects').split(sep).join('/');

export const mkFilePathMain = (pathName: string) => {
  const filePath = pathName;
  const isExist = fs.existsSync(filePath);
  if (!isExist) {
    fse.mkdirpSync(filePath);
  }
  return filePath;
};

function getFile(dir: string, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      fs.readFile(dir, options, (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    } catch (e) {
      reject(e);
    }
  });
}

export async function getImageWithDefaultMain(name: string) {
  const fileTypes = ['.jpg', '.png', '.jpeg'];
  let filePath = '';
  let imagePrefix = 'data:image/jpg;base64,';
  // eslint-disable-next-line no-restricted-syntax
  for (const f of fileTypes) {
    const fPath = getAppPathMain(`/imgs/${name}${f}`);
    // eslint-disable-next-line no-await-in-loop
    const ret = await getFile(`${fPath}`)
      .then(() => true)
      // err参数未使用暂时删除了
      .catch(() => false);
    if (f === '.png') {
      imagePrefix = 'data:image/png;base64,';
    }
    if (ret) {
      filePath = fPath;
      break;
    }
  }
  if (filePath) {
    const imageData = fs.readFileSync(filePath);
    const imageBase64 = imageData.toString('base64');
    return imagePrefix + imageBase64;
  }
  return null;
}
