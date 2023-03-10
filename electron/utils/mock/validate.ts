import type { Context } from 'koa';
import type { Value, Rules } from 'async-validator';
import Schema from 'async-validator';
import { lError } from '../logger';
import type { ruleColumn } from './types';

/**
 * 获取body中的数据
 * @param ctx
 * @returns data
 */
export function parseBodyData(ctx: Context) {
  return new Promise((resolves, reject) => {
    try {
      let bodyData = '';
      ctx.req.addListener('data', data => {
        bodyData += data;
      });
      ctx.req.once('end', () => {
        const response = bodyData ? JSON.parse(bodyData) : {};
        resolves(response);
      });
    } catch (error) {
      reject(error);
    }
  });
}

// 转换请求规则数据
const parseRulesData = (ruleList?: ruleColumn[]): Rules => {
  const data: Rules = {};
  if (!ruleList) {
    return data;
  }
  ruleList.forEach(r => {
    if (r.name) {
      data[r.name] = {
        type: r.type,
        required: r.required,
        message: r.message
      };
    }
  });
  return data;
};

/**
 * 请求表单验证
 * @param ctx
 * @param rules
 * @returns
 */
const validate = async <T extends Value>(
  ctx: Context,
  ruleList?: ruleColumn[]
): Promise<{ data: T; error: string }> => {
  try {
    const rules = parseRulesData(ruleList);
    if (!rules) {
      return { data: {} as T, error: '' };
    }
    const validator = new Schema(rules);
    let data: any = {};
    switch (ctx.method) {
      case 'GET':
      case 'DELETE':
        data = ctx?.query ? { ...ctx.query } : {}; // ctx.query 不是普通对象，没有hasOwnProperty，验证器会报错
        break;
      case 'POST':
      case 'PUT':
        data = (await parseBodyData(ctx)) || {};
        break;
      default:
        data = ctx?.request?.query || {};
    }
    const res = await validator
      .validate(data)
      .then(() => {
        return {
          data: data as T,
          error: ''
        };
      })
      .catch(err => {
        return {
          data: {} as T,
          error: err.errors[0].message
        };
      });
    return res;
  } catch (err: any) {
    lError('验证请求参数出错', { at: 'validate', err });
    return { data: {} as T, error: '验证器异常' };
  }
};

export default validate;
