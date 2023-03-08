<template>
  <n-card title="项目数据" class="h-full shadow-sm rounded-16px">
    <n-space :vertical="true">
      <n-space v-if="!state.isCreatProject">
        <n-button @click="toggleCreatProject">新建项目</n-button>
      </n-space>
      <n-space v-if="state.isCreatProject">
        <n-form
          ref="formRef"
          inline
          :label-width="80"
          :model="formValue"
          :rules="{
            projectName: {
              required: true,
              message: '请输入项目名称',
              trigger: ['input', 'blur']
            },
            baseUrl: {
              required: true,
              message: '请输入基础URL',
              trigger: ['input', 'blur']
            }
          }"
          size="medium"
        >
          <n-form-item label="项目名称" path="projectName">
            <n-input v-model:value="formValue.projectName" placeholder="输入项目名称" />
          </n-form-item>
          <n-form-item label="端口号" path="port">
            <n-input-number v-model:value="formValue.port" clearable />
          </n-form-item>
          <n-form-item label="基础URL" path="baseUrl">
            <n-input v-model:value="formValue.baseUrl" placeholder="/api" />
          </n-form-item>
          <n-form-item>
            <n-button attr-type="button" type="info" dashed @click="handleValidateClick"> 验证 </n-button>
          </n-form-item>
          <n-form-item>
            <n-button attr-type="button" type="warning" dashed @click="toggleCreatProject"> 取消 </n-button>
          </n-form-item>
          <n-form-item>
            <n-button attr-type="button" type="success" dashed :disabled="!state.portCheck" @click="addProject">
              添加
            </n-button>
          </n-form-item>
        </n-form>
      </n-space>
      <loading-empty-wrapper class="h-480px" :loading="loading" :empty="empty">
        <n-data-table :columns="columns" :data="dataSource" :flex-height="true" class="h-480px" />
      </loading-empty-wrapper>
    </n-space>
  </n-card>
</template>

<script setup lang="tsx">
import { reactive, ref } from 'vue';
import { NSpace, NButton, NPopconfirm, NTime } from 'naive-ui';
import type { DataTableColumn, FormInst } from 'naive-ui';
import { routeName } from '@/router';
import { useProjectStore } from '@/store';
import { useRouterPush } from '@/composables';
import { useLoadingEmpty } from '@/hooks';
import { ipcRenderer } from '@/service/api/electronAPI';
import type { tMockProject } from '~/electron/utils/mock/types';

const { routerPush } = useRouterPush();
const project = useProjectStore();

const { loading, startLoading, endLoading, empty, setEmpty } = useLoadingEmpty();

const dataSource = ref<tMockProject[]>([]);
const formRef = ref<FormInst | null>(null);
const formValue = reactive({ projectName: '', baseUrl: '', port: 8080 });
const state = reactive({ isCreatProject: false, portCheck: false });
const fetchData = async () => {
  startLoading();
  try {
    await project.getData();
    dataSource.value = project.projectList;
  } finally {
    endLoading();
    setEmpty(!dataSource.value?.length);
  }
};

const deleteRow = async (row: tMockProject) => {
  try {
    const { id, projectName } = row.config || {};
    if (!id) {
      window.$message?.error('id异常无法删除');
      return;
    }
    const res = await project.removeProject(id);
    if (res.code === 200) {
      window.$message?.success(`删除 ${projectName}成功`, { duration: 5000 });
    } else {
      window.$message?.error(`删除 ${projectName}失败`, { duration: 5000 });
    }
  } catch (e: any) {
    window.$message?.error(`操作失败:${JSON.stringify(e)} `);
  } finally {
    fetchData();
  }
};

const toggleCreatProject = () => {
  state.isCreatProject = !state.isCreatProject;
};

const addProject = async () => {
  try {
    toggleCreatProject();
    const id = new Date().getTime();
    const res = await project.addProject({
      config: { ...formValue, createdAt: id, id, lastUpdateAt: id },
      mockList: []
    });
    if (res.code === 200) {
      window.$message?.success(`添加项目成功`);
    }
  } catch (err: any) {
    window.$message?.error(`添加项目失败${err}`);
  } finally {
    fetchData();
  }
};
const handleValidateClick = async (e: any) => {
  e.preventDefault();
  try {
    formRef.value?.validate(async errors => {
      if (!errors) {
        const data = await ipcRenderer.invoke('ipc-checkPortUsable', { port: formValue.port });
        if (!data.usable) {
          window.$message?.error(data.msg);
          return;
        }
        state.portCheck = true;
        window.$message?.success('验证成功');
      } else {
        window.$message?.error('Invalid');
      }
    });
  } catch (err: any) {
    window.$message?.error(JSON.stringify(err));
  }
};

const viewProject = (row: tMockProject) => {
  routerPush({ name: routeName('mock_project-detail'), query: { id: row.config.id } });
};

const columns: DataTableColumn<tMockProject>[] = [
  {
    title: '项目名称',
    key: 'name',
    align: 'center',
    render: row => {
      return row.config.projectName;
    }
  },
  {
    title: '端口',
    key: 'port',
    align: 'center',
    render: row => {
      return row.config.port;
    }
  },
  {
    title: 'baseUrl',
    key: 'baseUrl',
    align: 'center',
    render: row => {
      return row.config.baseUrl;
    }
  },
  {
    title: '接口数',
    key: 'mockNum',
    align: 'center',
    render: row => {
      return row.mockList?.length;
    }
  },
  // {
  //   title: 'Status',
  //   key: 'status',
  //   align: 'center',
  //   render: row => {
  //     return (
  //       <NSpace justify={'center'}>
  //         <NTag type={row.status ? 'success' : 'error'}>{row.status ? '在线' : '离线'}</NTag>
  //       </NSpace>
  //     );
  //   }
  // },
  {
    title: '创建时间',
    key: 'createdAt',
    align: 'center',
    render: row => {
      return (
        <NSpace justify={'center'}>
          <NTime time={row.config.createdAt as number} />
        </NSpace>
      );
    }
  },
  {
    title: '最后更新时间',
    key: 'lastUpdateAt',
    align: 'center',
    render: row => {
      return (
        <NSpace justify={'center'}>
          <NTime time={row.config.lastUpdateAt as number} />
        </NSpace>
      );
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
          <NButton type="info" size={'small'} onClick={() => viewProject(row)}>
            查看
          </NButton>
        </NSpace>
      );
    }
  }
];

fetchData();
</script>

<style scoped></style>
