<template>
  <n-space :vertical="true" :size="16">
    <n-card :title="project?.config?.projectName" :bordered="false" size="small" class="shadow-sm rounded-16px">
      <template #header-extra>
        <n-button>添加接口</n-button>
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
                :mock-list="project?.mockList || []"
                :base-url="project?.config?.baseUrl || ''"
              />
              <ApiDetail v-else />
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
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { routeName } from '@/router';
import { useProjectStore } from '@/store';
import { useIconRender, useRouterPush } from '@/composables';
import ApiList from '@/views/mock/api-list/index.vue';
import ApiDetail from '@/views/mock/api-detail/index.vue';
import type { tMockProject } from '~/electron/utils/mock/types';

const { projectList } = useProjectStore();
const { routerPush } = useRouterPush();
const route = useRoute();
const id = Number(route.query?.id);
// const baseMockData: tMockItem = {
//   name: '',
//   enable: true,
//   url: '',
//   id: 0,
//   method: 'get',
//   data: {
//     code: 200,
//     msg: 'holle',
//     data: {
//       'list|1-10': [
//         {
//           'id|+1': 1
//         }
//       ]
//     }
//   },
//   timeout: 1000,
//   responseType: 'json'
// };
// const mockData = ref<tMockItem>(baseMockData);
const menuValue = ref('api-list');
// eslint-disable-next-line @typescript-eslint/ban-types
const project = ref<tMockProject | null>(projectList.find((p: tMockProject) => p.config.id === id) || null);

const { iconRender } = useIconRender();

const options = computed<any[]>(() => {
  const baseItem = {
    label: '全部接口',
    key: 'api-list',
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

const handleToProjects = () => {
  routerPush({ name: routeName('mock_projects') });
};
const handleUpdateValue = (key: string) => {
  menuValue.value = key;
};
</script>

<style scoped></style>
