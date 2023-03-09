import { ref } from 'vue';
import { defineStore } from 'pinia';
import { ipcRenderer } from '@/service/api/electronAPI';
import type { tMockProject, tMockItem } from '~/electron/utils/mock/types';
export const useProjectStore = defineStore('mock-project', () => {
  const projectList = ref<tMockProject[]>([]);
  const getData = async () => {
    const projects = await ipcRenderer.invoke('ipc-getMockProjects');
    projectList.value = projects;
  };
  const addProject = async (data: tMockProject) => {
    const res = await ipcRenderer.invoke('ipc-mockService', { type: 'add', data });
    projectList.value = res.data;
    return res;
  };
  const removeProject = async (id: number) => {
    const res = await ipcRenderer.invoke('ipc-mockService', { type: 'remove', data: id });
    projectList.value = res.data;
    return res;
  };
  const writeProject = async (data: tMockProject) => {
    const res = await ipcRenderer.invoke('ipc-mockService', { type: 'write', data });
    projectList.value = res.data;
    return res;
  };
  const updateServer = async () => {
    const res: { code: number; data: tMockProject[] } = await ipcRenderer.invoke('ipc-mockService', {
      type: 'update',
      data: JSON.parse(JSON.stringify(projectList.value))
    });
    return res;
  };
  const addMock = async (pid: number, mock: tMockItem) => {
    projectList.value.find(p => p?.config?.id === pid)?.mockList?.push(mock);
    const res: { code: number; data: tMockProject[] } = await updateServer();
    return res;
  };

  const removeMock = async (pid: number, id: number) => {
    const project = projectList.value?.find(p => p?.config?.id === pid);
    if (!project) {
      return { code: 0, data: projectList.value };
    }
    const mockList = project.mockList?.filter(mock => mock.id !== id);
    project.mockList = mockList;
    const res: { code: number; data: tMockProject[] } = await updateServer();
    return res;
  };

  const editMock = async (pid: number, id: number, mock: tMockItem) => {
    try {
      const project = projectList.value?.find(p => p?.config?.id === pid);
      if (!project) {
        return { code: 0, data: [], msg: '没有找到该项目' };
      }
      const mockList = project.mockList?.map(m => {
        if (m.id === id) {
          return mock;
        }
        return m;
      });
      project.mockList = mockList;
      const res: { code: number; data: tMockProject[] } = await updateServer();
      return { ...res, msg: '保存成功' };
    } catch (e: any) {
      return { code: 0, msg: e };
    }
  };

  return { projectList, getData, addProject, removeProject, writeProject, addMock, removeMock, editMock };
});
