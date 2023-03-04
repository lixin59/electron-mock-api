import type { IpcRenderer } from 'electron';
import type { tDefaultConfigs } from '../../electron/config/defaultConfig';
export interface IElectronAPI {
  getAppConfig: () => Promise<tDefaultConfigs>;
  ipcRenderer: IpcRenderer;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
