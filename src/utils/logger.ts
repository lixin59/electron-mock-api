import { ipcRenderer } from '@/service/api/electronAPI';

export type CommonLogLvl = 'Warn' | 'Info' | 'Error' | 'Success';
type tCommonLogMeta = Record<any, any>;

function logger(lvl: CommonLogLvl, msg: string, ...rest: any[]) {
  // if ((process.env.NODE_ENV !== 'production' || process.env.DEBUG_PROD === 'true') && fn[lvl]) {
  //   fn[lvl](msg, ...rest);
  // }
  // if (fnAlways[lvl]) {
  //   fnAlways[lvl](msg, ...rest);
  // }
  ipcRenderer.send('ipc-event-logger', { lvl, msg, rest });
}

export const CommonLog = {
  Info(msg: string, meta?: tCommonLogMeta, isShow = false) {
    logger('Info', msg, meta);
    if (isShow) {
      window.$message?.info(msg, { duration: 5000 });
    }
  },

  Success(msg: string, meta?: tCommonLogMeta, isShow = false) {
    logger('Success', msg, meta);
    if (isShow) {
      window.$message?.success(msg, { duration: 5000 });
    }
  },

  Warn(msg: string, meta?: tCommonLogMeta, isShow = false) {
    logger('Warn', msg, meta);
    if (isShow) {
      window.$message?.warning(msg, { duration: 5000 });
    }
  },

  lError(msg: string, meta?: tCommonLogMeta, isShow = false) {
    logger('Error', msg, meta);
    if (isShow) {
      window.$message?.error(msg, { duration: 5000 });
    }
  }
};
