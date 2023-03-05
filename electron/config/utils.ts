/**
 * @function 将新的配置文件删除或者添加的元素替换到旧的配置文件里面
 * @description 该函数目的是为了实现自动修改本地配置文件的功能，配置文件有更改的时候可以调用该函数修改本地配置文件
 * @param oldObj {object|undefined} 旧的配置文件是Object类型的参数,在函数递归的时候有可能为undefined
 * @param newObj {object|undefined} 新的配置文件是Object类型的参数,在函数递归的时候有可能为undefined
 * @return void 该函数没有返回值,在异常的情况会返回false
 * @author lixin 2021/08/27
 * @version 1.0.0
 * @example
 */
// eslint-disable-next-line consistent-return
export function newDefaultConfig(oldObj: any, newObj: any) {
  try {
    if (oldObj?.constructor !== newObj?.constructor) {
      // 深度对比的时候如果类不一样直接退出
      return true;
    }
    const oldKeys: Array<string> = Object.keys(oldObj);
    const newKeys: Array<string> = Object.keys(newObj);
    const difference: Array<string> = oldKeys
      .filter(x => newKeys.indexOf(x) === -1)
      .concat(newKeys.filter(x => oldKeys.indexOf(x) === -1));
    if (oldKeys.length < newKeys.length) {
      // 如果新对象的属性多于旧的对象将新对象里面多出来的属性添加到旧对象里面
      difference.forEach(e => {
        // eslint-disable-next-line no-param-reassign
        oldObj[e] = newObj[e]; // 将多出来的属性添加到旧的对象里面
      });
    }
    if (oldKeys.length > newKeys.length) {
      difference.forEach(e => {
        // eslint-disable-next-line no-param-reassign
        delete oldObj[e]; // 将旧的对象里面不需要的属性删除
      });
    }
    // 如果属性数量相等先判断新旧两个对象里面是否有不一样的属性，如果有将新对象的属性添加到旧对象里面并且删除
    if (difference.length > 0) {
      difference.forEach(k => {
        if (k in oldObj) {
          // eslint-disable-next-line no-param-reassign
          delete oldObj[k];
        }
        if (k in newObj) {
          // eslint-disable-next-line no-param-reassign
          oldObj[k] = newObj[k];
        }
      });
    }
    // 以新的配置文件为参照继续检查这些属性里面是否存在对象，属性值是对象的继续进行重复以上操作
    newKeys.forEach(e => {
      if (newObj[e].constructor === Object) {
        newDefaultConfig(oldObj[e], newObj[e]); // 函数递归
      }
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('修改配置文件失败', e);
    return false;
  }
}

/**
 * @function 深度对比对象属性是否相同
 * @description 该函数实现深度对比对象的属性是否相同，只对比对象，数组这种特殊的Object类型不做对比
 * @param o1 {object|undefined} o1是Object类型的参数,在函数递归的时候有可能为undefined
 * @param o2 {object|undefined} 02是Object类型的参数,在函数递归的时候有可能为undefined
 * @return false|true :返回值为false代表两个对象属性有不相同的地方，true证明两个对象属性全部相同
 * @author lixin 2021/09/10
 * @version 1.0.1
 * @example
 */
export function isDifference(o1: object, o2: object): boolean {
  let flag = true;
  // eslint-disable-next-line consistent-return
  function isDiff(oldObj: any, newObj: any) {
    try {
      if (oldObj?.constructor !== newObj?.constructor) {
        // 前一个参数或者后一个参数可能为undefined
        throw new TypeError("两个参数的类型必须都为'object'");
      }
      const oldKeys: Array<string> = Object.keys(oldObj);
      const newKeys: Array<string> = Object.keys(newObj);
      const difference = oldKeys
        .filter(x => newKeys.indexOf(x) === -1)
        .concat(newKeys.filter(x => oldKeys.indexOf(x) === -1));
      if (difference.length !== 0) {
        flag = false;
      }
      if (oldKeys.length === newKeys.length) {
        // 同一层元素属性一样多才进行递归
        newKeys.forEach(e => {
          // 以新的配置文件为参照进行深度递归
          if (oldObj[e]?.constructor === Object && newObj[e]?.constructor === Object) {
            // 两个参数的属性都为object才继续进行对比
            isDiff(oldObj[e], newObj[e]);
          }
        });
      }
      return flag;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('对比时出错', e);
      return false;
    }
  }
  return isDiff(o1, o2);
}
