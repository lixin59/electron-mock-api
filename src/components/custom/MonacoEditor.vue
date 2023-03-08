<template>
  <div ref="monacoEl"></div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import * as monaco from 'monaco-editor';
defineOptions({ name: 'MonacoEditor' });
interface Props {
  value: string;
  options?: monaco.editor.IStandaloneEditorConstructionOptions | undefined;
}
interface Emits {
  (e: 'update:value', value: string): void;
  (e: 'onchange', val: string): void;
}

const emit = defineEmits<Emits>();
const props = withDefaults(defineProps<Props>(), {
  value: '',
  options: undefined
});

const monacoEl = ref<HTMLDivElement | null>(null);
let editor: monaco.editor.IStandaloneCodeEditor | null = null;
onMounted(() => {
  if (monacoEl.value) {
    if (!editor) {
      const options = props.options ? { ...props.options, value: props.value } : { value: props.value };
      editor = monaco.editor.create(monacoEl.value, options);
      editor?.onKeyUp(() => {
        // console.log(e)
        const val = editor?.getValue();
        if (typeof val === 'string') {
          emit('update:value', val);
          emit('onchange', val);
        }
      });
    }
  }
});
onUnmounted(() => {
  editor?.dispose();
  editor = null;
});
</script>

<style scoped></style>
