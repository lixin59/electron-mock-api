import { ref } from 'vue';
import { defineStore } from 'pinia';
import { ipcRenderer } from '@/service/api/electronAPI';
import type { tMockProject } from '~/electron/utils/mock/types';
export const useProjectStore = defineStore('mock-project', () => {
  const projectList = ref([]);
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
  return { projectList, getData, addProject, removeProject, writeProject };
});
