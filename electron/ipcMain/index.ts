import net from 'net';
import { ipcMain, shell } from 'electron';
import type { BrowserWindow } from 'electron';
import { mockService, mockServiceMethod } from '../utils/mock';
import { lError, Info, Warn, Success, Query } from '../utils/logger';
import { getAppPathMain, mkFilePathMain, getImageWithDefaultMain } from '../utils/appDir';
import getConfig, { setConfigFile, setConfigFileAll } from '../config/index';

// 检测端口是否可用
function checkPortUsable(port: number) {
  return new Promise(resolve => {
    const server = net.createConnection({ port });
    server.on('connect', () => {
      server.end();
      resolve({ port, usable: false, msg: `Port ${port} is not available!` });
    });
    server.on('error', () => {
      resolve({ port, usable: true });
    });
  });
}

export default function initIpcMain(mainWindow: BrowserWindow) {
  // eslint-disable-next-line consistent-return
  ipcMain.handle('ipc-mockService', async (_e, args: { type: 'add' | 'remove' | 'write'; data: any }) => {
    try {
      const { data, type } = args;
      if (mockServiceMethod[type]) {
        return mockServiceMethod[type](data);
      }
    } catch (e: any) {
      lError(`mockService异常`, e);
    }
  });
  // eslint-disable-next-line consistent-return
  ipcMain.handle('ipc-checkPortUsable', async (_e, data) => {
    try {
      const res = await checkPortUsable(data.port);
      return res;
    } catch (e: any) {
      lError(`检测端口时异常`, e);
    }
  });
  // eslint-disable-next-line consistent-return
  ipcMain.handle('ipc-getMockProjects', async _e => {
    try {
      return mockService.getProjectList();
    } catch (e: any) {
      lError(`获取mock项目配置失败`, e);
    }
  });

  // eslint-disable-next-line consistent-return
  ipcMain.handle('ipc-getAppPath', async (_e, data) => {
    const { dir } = data;
    try {
      return getAppPathMain(dir);
    } catch (e: any) {
      lError(`获取软件文件目录失败: ${dir}`, e);
    }
  });

  // eslint-disable-next-line consistent-return
  ipcMain.handle('ipc-mkFilePath', async (_e, data) => {
    const { pathName } = data;
    try {
      return mkFilePathMain(pathName);
    } catch (e: any) {
      lError(`创建文件目录失败: ${pathName}`, e);
    }
  });

  // eslint-disable-next-line consistent-return
  ipcMain.handle('ipc-getImageWithDefault', async (_e, data) => {
    const { name } = data;
    try {
      const pdfStr = await getImageWithDefaultMain(name);
      return pdfStr;
    } catch (e: any) {
      lError(`获取图片失败: ${name}`, e);
    }
  });

  ipcMain.handle('ipc-get-config', () => {
    let config = null;
    try {
      config = getConfig();
      return config;
    } catch (e: any) {
      lError('获取配置文件失败', e);
      return config;
    }
  });

  ipcMain.handle('ipc-set-config', (_event, data) => {
    let isSuccess = true;
    const { keyPath, value, opts } = data;
    try {
      setConfigFile(keyPath, value);
      return isSuccess;
    } catch (e: any) {
      lError(`修改配置文件字段值失败: ${opts}`, e);
      isSuccess = false;
      return isSuccess;
    }
  });

  ipcMain.handle('ipc-set-config-all', (_event, data) => {
    let isSuccess = true;
    const { obj } = data;
    try {
      setConfigFileAll(obj);
      return isSuccess;
    } catch (e: any) {
      lError(`修改配置文件失败: ${obj}`, e);
      isSuccess = false;
      return isSuccess;
    }
  });

  // ipcMain.on('ipc-get-wifi', async () => {
  //   try {
  //     // const data = await si.wifiConnections();
  //     // const wifiInfo = {
  //     //   signal: data[0].signalLevel,
  //     //   ssid: data[0].ssid
  //     // };
  //     // mainWindow.webContents.send('ipc-get-wifi-res', { isSuccess: true, wifiInfo });
  //     wifi.init({
  //       iface: null // network interface, choose a random wifi interface if set to null
  //     });
  //     // Scan networks
  //     wifi.getCurrentConnections((error, networks) => {
  //       if (error) {
  //         console.log(error);
  //       }
  //       if (networks && networks.length !== 0) {
  //         const wifiInfo = {
  //           signal: networks[0].quality,
  //           ssid: networks[0].ssid
  //         };
  //         mainWindow.webContents.send('ipc-get-wifi-res', { isSuccess: true, wifiInfo });
  //       }
  //     });
  //   } catch (e) {
  //     lError('获取wifi信息失败', e);
  //   }
  // });

  // eslint-disable-next-line consistent-return
  ipcMain.on('ipc-query-logger', (_e, options) => {
    try {
      return Query(options, (err, result) => {
        if (err) {
          mainWindow.webContents.send('ipc-query-logger-res', { isSuccess: false, err });
          throw err;
        }
        mainWindow.webContents.send('ipc-query-logger-res', { isSuccess: true, result });
      });
    } catch (e: any) {
      lError('查询日志失败', e);
    }
  });

  ipcMain.on('ipc-event-logger', (_event, data) => {
    try {
      const fnAlways: Record<string, any> = {
        Error: lError,
        Info,
        Warn,
        Success
      };
      if (fnAlways[data.lvl]) {
        fnAlways[data.lvl](data.msg, ...data.rest);
      }
    } catch (e: any) {
      lError('渲染进程日志记录失败', e);
    }
  });
  // 以桌面的默认方式打开给定的文件。
  ipcMain.on('open-file-with-default', (_event, data) => {
    try {
      shell.openPath(data?.path);
    } catch (e: any) {
      lError('打开文件失败', e);
    }
  });
}
