<template>
  <n-card>
    <n-tabs
      class="card-tabs"
      default-value="signin"
      size="large"
      animated
      style="margin: 0 -4px"
      pane-style="padding-left: 4px; padding-right: 4px; box-sizing: border-box;"
    >
      <n-tab-pane name="signin" tab="编辑">
        <n-form>
          <n-form-item-row label="接口名称">
            <n-input />
          </n-form-item-row>
          <n-form-item-row label="url">
            <n-input />
          </n-form-item-row>
        </n-form>
        <n-button type="primary" block secondary strong> 接口名称 </n-button>
      </n-tab-pane>
      <n-tab-pane name="signup" tab="预览">
        <n-form>
          <n-form-item-row label="接口名称">
            <n-input />
          </n-form-item-row>
          <n-form-item-row label="url">
            <n-input />
          </n-form-item-row>
        </n-form>
        <n-button type="primary" block secondary strong> 注册 </n-button>
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import type { tMockItem, tMockProject } from '~/electron/utils/mock/types';

interface Props {
  id: number;
  project: tMockProject | null;
}
const props = defineProps<Props>();

const mockData = ref<tMockItem>();

const fetchData = () => {
  const { id, project } = props;
  const data = project?.mockList.find((m: tMockItem) => m.id === id);
  if (data) {
    mockData.value = data;
  }
};
watch(
  () => props.project,
  () => {
    fetchData();
  }
);
onMounted(() => {
  fetchData();
});
</script>

<style scoped></style>
