# 使用说明

## 添加项目
![新建项目](./add-project.png)
![新建项目](./add-project1.png)
![新建项目](./add-project2.png)

## 查看项目详情
![项目详情](./add-project3.png)

## 添加接口
![添加接口](./add-api.png)
![添加接口](./add-api1.png)

## 编辑接口
### 接口返回结果内容编辑
1. 普通json数据
```json
{
    "code": 200,
    "msg": "test",
    "data": {"name": "张三","age": 20}
}
```
2. [mockjs语法规则json数据](https://github.com/nuysoft/Mock/wiki/Syntax-Specification)

```json
{
	"code": 200,
	"msg": "test",
	"data": {
		"list|1-10": [
			{
				"id|+1": 1
			}
		]
	}
}
```
![添加接口](./edit-api.png)
![添加接口](./save-api.png)

## 接口预览与测试
![预览接口信息](./test-api.png)

### 错误响应
![错误响应](./test-api-result.png)
![正确响应](./test-api-result1.png)
