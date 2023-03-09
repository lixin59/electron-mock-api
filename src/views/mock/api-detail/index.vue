<template>
  <n-card>
    <n-tabs
      class="card-tabs"
      default-value="editor"
      size="large"
      animated
      style="margin: 0 -4px"
      pane-style="padding-left: 4px; padding-right: 4px; box-sizing: border-box;"
    >
      <n-tab-pane name="editor" tab="编辑">
        <n-form ref="formRef" inline :label-width="80" :model="mockData" size="medium">
          <n-form-item label="接口名称" path="name">
            <n-input v-model:value="mockData.name" placeholder="请输入接口名称" />
          </n-form-item>
          <n-form-item style="min-width: 100px" label="请求方法" path="method">
            <n-select v-model:value="mockData.method" :options="options" />
          </n-form-item>
          <n-form-item label="URL" path="url">
            <n-input v-model:value="mockData.url" placeholder="/test" />
          </n-form-item>
          <n-form-item style="max-width: 150px" label="模拟延时" path="port">
            <n-input-number v-model:value="mockData.timeout" clearable />
          </n-form-item>
          <n-form-item label="是否启用" path="name">
            <n-switch v-model:value="mockData.enable" />
          </n-form-item>
          <n-form-item>
            <n-button attr-type="button" type="info" dashed @click="saveData"> 保存 </n-button>
          </n-form-item>
        </n-form>
        <n-divider title-placement="left"> 请求参数 </n-divider>
        <n-space :vertical="true"> 开发中敬请期待 </n-space>
        <n-divider title-placement="left"> 响应数据 </n-divider>
        <MonacoEditor
          v-model:value="mockData.data"
          style="min-width: 300px; min-height: 400px"
          :options="{ language: 'json' }"
        />
      </n-tab-pane>
      <n-tab-pane name="preview" tab="预览">
        <n-form inline :label-width="80" size="medium">
          <n-form-item path="name">
            <n-input :value="mockData.name" placeholder="请输入接口名称" disabled />
          </n-form-item>
          <n-form-item path="method">
            <n-tag :type="methodTagMap[mockData.method]">
              {{ mockData.method }}
            </n-tag>
          </n-form-item>
          <n-form-item path="url">
            <n-input
              style="min-width: 300px"
              :value="`127.0.0.1:${project?.config?.port}${project?.config?.baseUrl}${mockData.url}`"
              placeholder="/test"
              disabled
            />
          </n-form-item>
          <n-form-item style="max-width: 150px" path="port">
            <n-input-number :value="mockData.timeout" disabled />
          </n-form-item>
          <n-form-item path="name">
            <n-switch :value="mockData.enable" disabled />
          </n-form-item>
          <n-form-item>
            <n-button attr-type="button" type="warning" dashed @click="mockTest"> 测试 </n-button>
          </n-form-item>
        </n-form>
        <n-divider title-placement="left"> 请求参数 </n-divider>
        <n-space :vertical="true"> 开发中敬请期待 </n-space>
        <n-divider title-placement="left"> 响应数据 </n-divider>
        <n-code :code="resData" language="json" word-wrap />
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { FormInst } from 'naive-ui';
import axios from 'axios';
import { useProjectStore } from '@/store';
import MonacoEditor from '@/components/custom/MonacoEditor.vue';
import { methodTagMap } from '@/constants';
import type { tMockItem, tMockProject } from '~/electron/utils/mock/types';
const options = [
  {
    label: 'get',
    value: 'get'
  },
  {
    label: 'delete',
    value: 'delete'
  },
  {
    label: 'post',
    value: 'post'
  },
  {
    label: 'put',
    value: 'put'
  },
  {
    label: 'head',
    value: 'head'
  },
  {
    label: 'options',
    value: 'options'
  },
  {
    label: 'patch',
    value: 'patch'
  },
  {
    label: 'link',
    value: 'link'
  },
  {
    label: 'unlink',
    value: 'unlink'
  }
];
interface Props {
  id: number;
  project: tMockProject | null;
}
const props = defineProps<Props>();
const projectStore = useProjectStore();
const mockData = ref<tMockItem>({
  name: '',
  id: 1,
  enable: true,
  url: '',
  method: 'get',
  data: '',
  timeout: 0,
  createdAt: 0,
  lastUpdateAt: 0,
  responseType: 'json'
});
const formRef = ref<FormInst | null>(null);
const resData = ref('');
const saveData = async (e: any) => {
  e.preventDefault();
  try {
    formRef.value?.validate(async errors => {
      if (!errors) {
        const data = await projectStore.editMock(props.project?.config.id || 0, mockData.value.id, {
          ...mockData.value,
          lastUpdateAt: new Date().getTime()
        });
        if (!data.code) {
          window.$message?.error(data.msg);
          return;
        }
        window.$message?.success('保存成功');
      } else {
        window.$message?.error('Invalid');
      }
    });
  } catch (err: any) {
    window.$message?.error(JSON.stringify(err));
  }
};
const mockTest = async () => {
  try {
    const res = await axios({
      baseURL: `http://127.0.0.1:${props?.project?.config?.port}${props?.project?.config.baseUrl}${mockData.value.url}`,
      method: mockData.value.method
    });
    if (res.data) {
      resData.value = JSON.stringify(res.data);
      window.$message?.success('测试请求成功');
    }
  } catch (err: any) {
    window.$message?.error(JSON.stringify(err));
  }
};

const fetchData = () => {
  const { id, project } = props;
  const data = project?.mockList.find((m: tMockItem) => m.id === id);
  if (data) {
    mockData.value = data;
  }
  resData.value = '';
};
watch(
  () => props.id,
  () => {
    fetchData();
  }
);

fetchData();
</script>

<style scoped></style>
