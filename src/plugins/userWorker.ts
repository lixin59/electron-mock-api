import * as monaco from 'monaco-editor';
// eslint-disable-next-line import/no-unresolved
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
// eslint-disable-next-line import/no-unresolved
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
// eslint-disable-next-line import/no-unresolved
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
// eslint-disable-next-line import/no-unresolved
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
// eslint-disable-next-line import/no-unresolved
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

self.MonacoEnvironment = {
  getWorker(_: any, label: string) {
    if (label === 'json') {
      // eslint-disable-next-line new-cap
      return new jsonWorker();
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      // eslint-disable-next-line new-cap
      return new cssWorker();
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      // eslint-disable-next-line new-cap
      return new htmlWorker();
    }
    if (label === 'typescript' || label === 'javascript') {
      // eslint-disable-next-line new-cap
      return new tsWorker();
    }
    // eslint-disable-next-line new-cap
    return new editorWorker();
  }
};

monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
