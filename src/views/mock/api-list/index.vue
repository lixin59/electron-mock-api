<template>
  <n-card title="接口数据" class="h-full shadow-sm rounded-16px">
    <n-space :vertical="true">
      <loading-empty-wrapper class="h-480px" :loading="loading" :empty="empty">
        <n-data-table :columns="columns" :data="mockList" :flex-height="true" class="h-480px" />
      </loading-empty-wrapper>
    </n-space>
  </n-card>
</template>

<script setup lang="tsx">
import { onMounted } from 'vue';
import { NSpace, NTag } from 'naive-ui';
import type { DataTableColumn } from 'naive-ui';
import { useLoadingEmpty } from '@/hooks';
import type { tMockItem } from '~/electron/utils/mock/types';
const { loading, startLoading, endLoading, empty, setEmpty } = useLoadingEmpty();
interface Props {
  baseUrl: string;
  mockList: tMockItem[];
}
const props = defineProps<Props>();

const methodTagMap: Record<string, 'default' | 'error' | 'primary' | 'info' | 'success' | 'warning'> = {
  get: 'success',
  post: 'info',
  delete: 'error',
  put: 'warning',
  head: 'primary',
  link: 'primary',
  options: 'primary',
  patch: 'primary',
  unlink: 'default'
};

const columns: DataTableColumn<tMockItem>[] = [
  {
    title: '接口',
    key: 'name',
    align: 'center',
    render: row => {
      return row.name;
    }
  },
  {
    title: '接口路径',
    key: 'method',
    align: 'center',
    render: row => {
      return (
        <NSpace justify={'center'}>
          <NTag type={methodTagMap[row.method]}>{row.method.toUpperCase()}</NTag>
          {`${props.baseUrl}${row.url}`}
        </NSpace>
      );
    }
  },
  {
    title: '状态',
    key: 'enable',
    align: 'center',
    render: row => {
      return (
        <NSpace justify={'center'}>
          <NTag type={row.enable ? 'success' : 'error'}>{row.enable ? '启用' : '关闭'}</NTag>
        </NSpace>
      );
    }
  },
  {
    title: '延时',
    key: 'timeout',
    align: 'center',
    render: row => {
      return row.timeout;
    }
  }
];

const fetchData = async () => {
  startLoading();
  endLoading();
  setEmpty(!props?.mockList?.length);
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped></style>
