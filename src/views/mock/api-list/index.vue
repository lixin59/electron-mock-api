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
import { onMounted, watch } from 'vue';
import { NSpace, NTag, NPopconfirm, NButton } from 'naive-ui';
import type { DataTableColumn } from 'naive-ui';
import { useProjectStore } from '@/store';
import { useLoadingEmpty } from '@/hooks';
import type { tMockItem } from '~/electron/utils/mock/types';
const { loading, startLoading, endLoading, empty, setEmpty } = useLoadingEmpty();
interface Props {
  id: number;
  baseUrl: string;
  mockList: tMockItem[];
}
const props = defineProps<Props>();
const project = useProjectStore();

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

const fetchData = async () => {
  startLoading();
  endLoading();
  setEmpty(!props?.mockList?.length);
};
const deleteRow = async (row: tMockItem) => {
  try {
    const { id, name } = row || {};
    if (!id) {
      window.$message?.error('id异常无法删除');
      return;
    }
    const res = await project.removeMock(props.id, id);
    if (res.code === 200) {
      window.$message?.success(`删除 ${name}成功`, { duration: 5000 });
    } else {
      window.$message?.error(`删除 ${name}失败`, { duration: 5000 });
    }
  } catch (e: any) {
    window.$message?.error(`操作失败:${JSON.stringify(e)} `);
  } finally {
    fetchData();
  }
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
        <NSpace justify={'start'}>
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
  },
  {
    key: 'action',
    title: 'Action',
    align: 'center',
    render: row => {
      return (
        <NSpace justify={'center'}>
          <NPopconfirm
            onPositiveClick={() => {
              deleteRow(row);
            }}
          >
            {{
              default: () => '确认删除',
              trigger: () => (
                <NButton type="error" size={'small'}>
                  删除
                </NButton>
              )
            }}
          </NPopconfirm>
        </NSpace>
      );
    }
  }
];

watch(
  () => props.id,
  () => {
    fetchData();
  }
);
onMounted(() => {
  fetchData();
});
</script>

<style scoped></style>
