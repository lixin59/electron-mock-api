import type { Server } from 'http';
import type { RuleType } from 'async-validator';
export type Method = 'get' | 'delete' | 'head' | 'options' | 'post' | 'put' | 'patch' | 'link' | 'unlink';
// eslint-disable-next-line no-warning-comments
// TODO 修复响应数据类型
export type tMockItem = {
  name: string; // 接口名称
  id: number; // 接口id
  enable: boolean; // 是否启用
  url: string; // 接口的url
  rules: ruleColumn[]; // 请求参数验证规则
  method: Method; // 请求方法
  data: any; // 正确响应的数据 json字符串或者遵循mockjs语法的json字符串
  timeout: number; // 延时时间
  createdAt: number; // 接口创建时间
  lastUpdateAt: number; // 接口最后修改时间
  responseType: any; // 响应数据的类型
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
  update: (projectList: Array<tMockProject>) => tRes;
  addProject: (obj: tMockProject) => tRes;
  writeProject: (obj: tMockProject) => tRes;
  removeProject: (id: number) => tRes;
  clear: () => void;
  reload: () => void;
}

export type ruleColumn = {
  name: string;
  key: number;
  type: RuleType;
  required: boolean;
  message: string;
};
