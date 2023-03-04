import fs from 'fs';
import path from 'path';
import moment from 'moment';
import settings from 'electron-settings';
import { getAppDirectoryMain } from '../utils/appDir';
import type { tDefaultConfigs } from './defaultConfig';
import defaultConfigs from './defaultConfig';
import { isDifference, newDefaultConfig } from './utils';

const dir = getAppDirectoryMain();
settings.configure({
  dir,
  fileName: 'setting.json',
  prettify: true
});
let config: null | tDefaultConfigs = null;

// 如果是开发环境每次运行的时候删除本地配置文件
// if (process.env.NODE_ENV === 'development'
// // || process.env.NODE_ENV === 'test'
// // || process.env.DEBUG_PROD === 'true'
// ) {
//   settings.deleteAll();
// }

export function setConfigFile(keyPath: string, value: any) {
  settings.setSync(keyPath, value);
}

export function setConfigFileAll(obj: any) {
  settings.setSync(obj);
}

export function checkConfigFile() {
  const fileConfig = settings.getSync();
  if (Object.keys(fileConfig).length === 0) {
    config = defaultConfigs;
    setConfigFileAll(defaultConfigs);
  } else {
    const oldConfig = settings.getSync() as tDefaultConfigs;
    config = oldConfig;
    const isDiff = isDifference(oldConfig, defaultConfigs); // 比较新的配置文件是否与本地配置文件相同;
    if (isDiff === false) {
      // 如果新的配置文件与本地配置文件字段不一样，备份以前的配置文件然后生产一份新的配置文件
      newDefaultConfig(oldConfig, defaultConfigs); // 将新配置文件修改的字段添加到旧配置文件里面，不会更改已有属性的值
      fs.renameSync(
        path.join(dir, 'setting.json'),
        path.join(dir, `backup_${moment().format('YYYY-MM-DD_HH-mm-ss')}.json`)
      );
      config = oldConfig;
      setConfigFileAll(defaultConfigs);
    }
  }
  return config;
}

export default function getConfig() {
  return config;
}
