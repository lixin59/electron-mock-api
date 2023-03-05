import type { Server } from 'http';
export type Method = 'get' | 'delete' | 'head' | 'options' | 'post' | 'put' | 'patch' | 'link' | 'unlink';
// eslint-disable-next-line no-warning-comments
// TODO 修复响应数据类型
export type tMockItem = {
  enable: boolean;
  url: string;
  method: Method;
  data: any;
  timeout: number;
  responseType: any;
};

export type tMockProject = {
  config: {
    id: number;
    projectName: string;
    baseUrl: string;
    createdAt: number;
    lastUpdateAt: number;
    port: number;
  };
  mockList: Array<tMockItem>;
};

export interface IMockServer {
  readonly methodMap: Record<Method, Method>;
  project: tMockProject;
  server: Server;
  clear: () => void;
}

export type tRes = {
  data: Array<tMockProject>;
  code: number;
};
export interface IMockService {
  projectList: Array<tMockProject>;
  serverList: Array<IMockServer>;
  getProjectList: () => Array<tMockProject>;
  init: () => void;
  add: (obj: tMockProject) => void;
  addProject: (obj: tMockProject) => tRes;
  writeProject: (obj: tMockProject) => tRes;
  removeProject: (id: number) => tRes;
  clear: () => void;
  reload: () => void;
}
