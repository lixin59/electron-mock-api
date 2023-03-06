<template>
  <n-space :vertical="true" :size="16">
    <n-card :title="project?.config?.projectName" :bordered="false" size="small" class="shadow-sm rounded-16px">
      <n-space vertical>
        <n-layout>
          <n-layout has-sider>
            <n-layout-sider
              bordered
              show-trigger
              collapse-mode="width"
              :collapsed-width="64"
              :width="240"
              :native-scrollbar="false"
              style="min-height: 500px"
            >
              <n-menu
                :collapsed-width="64"
                :collapsed-icon-size="22"
                :options="menuOptions"
                @update:value="handleUpdateValue"
              />
            </n-layout-sider>
            <n-layout style="min-height: 500px">
              <n-space vertical>
                <n-form ref="formRef" inline :label-width="80" :model="mockData" size="medium">
                  <n-form-item label="项目名称" path="user.name">
                    <n-input v-model:value="mockData.name" placeholder="请输入接口名称" />
                  </n-form-item>
                  <n-form-item label="url" path="phone">
                    <n-input v-model:value="mockData.url" placeholder="/test" />
                  </n-form-item>
                  <n-form-item>
                    <n-select
                      v-model:value="mockData.method"
                      :options="[
                        { label: 'get', value: 'get' },
                        { label: 'delete', value: 'delete' },
                        { label: 'put', value: 'put' },
                        { label: 'post', value: 'post' }
                      ]"
                      style="min-width: 100px"
                    />
                  </n-form-item>
                  <n-form-item>
                    <n-button attr-type="button" type="warning" dashed> 取消 </n-button>
                  </n-form-item>
                </n-form>
              </n-space>
            </n-layout>
          </n-layout>
        </n-layout>
      </n-space>
      <n-space :vertical="true" :size="12">
        <n-button @click="handleToProjects">返回</n-button>
      </n-space>
    </n-card>
  </n-space>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { routeName } from '@/router';
import { useProjectStore } from '@/store';
import { useRouterPush } from '@/composables';
import type { tMockProject, tMockItem } from '~/electron/utils/mock/types';

const { projectList } = useProjectStore();
const { routerPush } = useRouterPush();
const route = useRoute();
const id = Number(route.query?.id);
const baseMockData: tMockItem = {
  name: '',
  enable: true,
  url: '',
  id: 0,
  method: 'get',
  data: {
    code: 200,
    msg: 'holle',
    data: {
      'list|1-10': [
        {
          'id|+1': 1
        }
      ]
    }
  },
  timeout: 1000,
  responseType: 'json'
};
const mockData = ref<tMockItem>(baseMockData);
const project = ref<tMockProject | undefined>(projectList.find((p: tMockProject) => p.config.id === id));
const menuOptions = project.value?.mockList
  ?.map(mock => ({
    label: mock?.name || '',
    key: mock?.id || 1,
    id: mock?.id || 1
  }))
  .concat([
    {
      label: '添加',
      key: 0,
      id: 0
    }
  ]);

const handleToProjects = () => {
  routerPush({ name: routeName('mock_projects') });
};
const handleUpdateValue = (key: number, item: any) => {
  console.log(key);
  console.log(item);
};
</script>

<style scoped></style>
