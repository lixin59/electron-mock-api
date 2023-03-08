<template>
  <n-space :vertical="true" :size="16">
    <n-card :title="project?.config?.projectName" :bordered="false" size="small" class="shadow-sm rounded-16px">
      <template #header-extra>
        <n-button @click="handleAddMock">添加接口</n-button>
        <n-button @click="handleToProjects">返回</n-button>
      </template>
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
                :value="menuValue"
                :collapsed-width="64"
                :collapsed-icon-size="22"
                :options="options"
                @update:value="handleUpdateValue"
              />
            </n-layout-sider>
            <n-layout style="min-height: 500px">
              <ApiList
                v-if="menuValue === 'api-list'"
                :id="project?.config?.id || 0"
                :mock-list="project?.mockList || []"
                :base-url="project?.config?.baseUrl || ''"
              />
              <ApiDetail v-else :id="mockId" :project="project" />
            </n-layout>
          </n-layout>
        </n-layout>
      </n-space>
    </n-card>
  </n-space>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { routeName } from '@/router';
import { useProjectStore } from '@/store';
import { useIconRender, useRouterPush } from '@/composables';
import ApiList from '@/views/mock/api-list/index.vue';
import ApiDetail from '@/views/mock/api-detail/index.vue';
import type { tMockProject } from '~/electron/utils/mock/types';

const { projectList, addMock } = useProjectStore();
const { routerPush } = useRouterPush();
const route = useRoute();
const id = Number(route.query?.id);
const menuValue = ref('api-list');
const project = ref<tMockProject | null>(null);
const mockId = ref(0);

const { iconRender } = useIconRender();

const options = computed<any[]>(() => {
  const baseItem = {
    label: '全部接口',
    key: 'api-list',
    id: 0,
    icon: iconRender({ icon: 'vscode-icons:default-folder-opened' })
  };
  const list =
    project?.value?.mockList?.map(mock => ({
      label: mock?.name || '',
      key: String(mock?.id) || 'null',
      id: mock?.id || 1,
      icon: iconRender({ icon: 'vscode-icons:file-type-light-json' })
    })) || [];
  return [baseItem, ...list];
});

const fetchData = async () => {
  const data = projectList.find((p: tMockProject) => p.config.id === id);
  if (data) {
    project.value = data;
  }
};

const handleToProjects = () => {
  routerPush({ name: routeName('mock_projects') });
};
const handleUpdateValue = (key: string, item: any) => {
  menuValue.value = key;
  if (item.id) {
    mockId.value = item.id;
  }
};
const handleAddMock = async () => {
  try {
    const res = await addMock(project?.value?.config.id || 0, {
      name: `接口${(project?.value?.mockList?.length || 0) + 1}`,
      enable: true,
      url: '/test',
      id: new Date().getTime(),
      method: 'get',
      createdAt: new Date().getTime(),
      lastUpdateAt: new Date().getTime(),
      data: JSON.stringify({
        code: 200,
        msg: 'test',
        data: {
          'list|1-10': [
            {
              'id|+1': 1
            }
          ]
        }
      }),
      timeout: 1000,
      responseType: 'json'
    });
    if (res.code === 200) {
      window.$message?.success(`接口添加成功 `);
    } else {
      window.$message?.error(`接口添加失败 `);
    }
  } catch (e: any) {
    window.$message?.error(`接口添加失败:${JSON.stringify(e)} `);
  } finally {
    fetchData();
  }
};
fetchData();
</script>

<style scoped></style>
