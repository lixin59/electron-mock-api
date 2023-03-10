import { resolve } from 'path';
import fs from 'fs';
import type { Server } from 'http';
import Koa from 'koa';
import cors from 'koa-cors';
import Router from 'koa-router';
import { globSync } from 'glob'; // glob 支持文件遍历查寻
// import logger from 'koa-logger'; // koa-logger 实现在终端打印node日志，方便调试
import Mock from 'mockjs';
import type { IMockServer, tMockProject, Method, IMockService } from '~/electron/utils/mock/types';
import { lError, Info } from '../logger';
import { getProjectPath, mkFilePathMain } from '../appDir';
import validate from './validate';

async function delay(timeout: number) {
  return new Promise(res => {
    setTimeout(() => {
      res('');
    }, timeout);
  });
}

class MockServer implements IMockServer {
  methodMap: Record<Method, Method> = {
    get: 'get',
    post: 'post',
    delete: 'delete',
    put: 'put',
    head: 'head',
    link: 'link',
    options: 'options',
    patch: 'patch',
    unlink: 'unlink'
  };

  project: tMockProject;

  server: Server;

  constructor(project: tMockProject) {
    this.project = project;
    const app = new Koa();
    const router = new Router({ prefix: `${project.config.baseUrl}` });
    // app.use(logger());
    this.project.mockList.forEach(({ enable, method, data, url, rules, timeout }) => {
      if (enable && this.methodMap[method]) {
        router[method](url, async (ctx: any) => {
          // 从ctx中读取get传值
          // console.log("ctx.query: ", ctx.query); // { aid: '123' } 获取的是对象 用的最多的方式  **推荐**
          // console.log("ctx.querystring: ", ctx.querystring); // aid=123&name=zhangsan  获取的是一个字符串
          // console.log("ctx.url: ", ctx.url); // 获取url地址

          // // ctx 里面的 request 里面获取 get 传值
          // console.log(ctx.request.url);
          // console.log(ctx.request.query); // { aid: '123', name: 'zhangsan' } 对象
          // console.log(ctx.request.querystring); // aid=123&name=zhangsan
          try {
            const { error } = await validate(ctx, rules);
            const resData = Mock.mock(JSON.parse(data));
            await delay(timeout); // 模拟延时
            if (error) {
              // eslint-disable-next-line require-atomic-updates
              ctx.body = {
                code: -1,
                error
              };
              return;
            }
            // eslint-disable-next-line require-atomic-updates
            ctx.body = resData;
          } catch (err: any) {
            lError(`服务器错误${project.config.port}`, err);
            // eslint-disable-next-line require-atomic-updates
            ctx.body = {
              status: 404,
              type: 'false'
            };
            ctx.throw('服务器错误: ', 500);
          }
        });
      }
    });
    app.use(cors()).use(router.routes()).use(router.allowedMethods());
    const { port } = this.project.config;
    const server = app.listen(port, () => {
      Info(`app started at port ${port}...`);
    });
    this.server = server;
  }

  clear() {
    this.server?.closeAllConnections();
    this.server?.closeIdleConnections();
    this.server?.close(() => {
      Info('服务器关闭', { at: 'MockServer.clear', port: this.project.config.port });
    });
  }
}

class MockService implements IMockService {
  projectList: Array<tMockProject> = [];

  serverList: Array<IMockServer> = [];

  constructor() {
    this.addProject = this.addProject.bind(this);
    this.removeProject = this.removeProject.bind(this);
    this.writeProject = this.writeProject.bind(this);
    this.update = this.update.bind(this);
  }

  getProjectList() {
    return this.projectList;
  }

  init() {
    const projectsFilePath = globSync(`${getProjectPath()}/*.json`);
    projectsFilePath.forEach(path => {
      const configFilePath = resolve(path); // 绝对路径
      const data = JSON.parse(fs.readFileSync(configFilePath, { encoding: 'utf-8' }));
      this.add(data);
    });
  }

  add(project: tMockProject) {
    this.projectList.push(project);
    const server = new MockServer(project);
    this.serverList.push(server);
  }

  addProject(project: tMockProject) {
    try {
      if (!project?.config?.id) {
        return { data: this.projectList, code: 0 };
      }
      this.add(project);
      const projectPath = mkFilePathMain(getProjectPath());
      fs.writeFileSync(`${projectPath}/${project.config.id}.json`, JSON.stringify(project));
      return { data: this.projectList, code: 200 };
    } catch (err: any) {
      lError('添加mock项目失败', { err, at: 'MockService.addProject' });
      return { data: this.projectList, code: 0 };
    }
  }

  removeProject(id: number) {
    try {
      this.projectList = this.projectList.filter(p => p.config.id !== id);
      this.serverList.find(p => p.project.config.id === id)?.clear();
      this.serverList = this.serverList.filter(p => p.project.config.id !== id);
      fs.unlinkSync(`${getProjectPath()}/${id}.json`);
      return { data: this.projectList, code: 200 };
    } catch (err: any) {
      lError('删除mock项目失败', { err, at: 'MockService.removeProject' });
      return { data: this.projectList, code: 0 };
    }
  }

  writeProject(project: tMockProject) {
    try {
      this.removeProject(project.config.id);
      this.addProject(project);
      return { data: this.projectList, code: 200 };
    } catch (err: any) {
      lError('修改mock项目失败', { err, at: 'MockService.writeProject' });
      return { data: this.projectList, code: 0 };
    }
  }

  update(projectList: Array<tMockProject>) {
    try {
      this.clear();
      projectList.forEach(p => {
        this.addProject(p);
      });
      this.reload();
      return { data: this.projectList, code: 200 };
    } catch (err: any) {
      return { data: this.projectList, code: 0 };
      lError('更新mock项目失败', { err, at: 'MockService.writeProject' });
    }
  }

  clear() {
    this.projectList = [];
    this.serverList.forEach(server => {
      server?.clear();
    });
    this.serverList = [];
  }

  reload() {
    this.clear();
    this.init();
  }
}

const mockService = new MockService();
mockService.init();

const mockServiceMethod = {
  add: mockService.addProject,
  remove: mockService.removeProject,
  write: mockService.writeProject,
  update: mockService.update
};

export { mockService, mockServiceMethod };
