# Reservation_manager

预约小程序管理系统

# 2023/9/15

## 创建新页面步骤：

1. src/pages 里面新建文件夹，里面放 index.vue 及 js/ts 文件等
   `warn: index.vue导出的组件名子用大驼峰命名，且必须与路由的name一致`
2. 在 src/router/modules 里面新建.ts 文件，配置新建页面的路由，具体代码可参照已有的.ts 文件
3. 在 pages 新建的文件夹里面即可编辑页面

# 项目设置了 lint-stage 提交规范，需按照以下规范提交

## 这些是常见的 Git 提交类型，以下是它们的含义和一些适用场景：

- build: 构建相关的修改，如修改了构建脚本等。
- chore: 不修改 src 或 test 文件的其他修改，如更新文档、添加依赖等。
- ci: 修改 CI 配置文件和脚本。
- docs: 修改文档，如 README、API 文档等。
- feat: 新功能，如添加了一个新功能模块。
- fix: 修复 bug。
- perf: 提高性能的代码修改。
- refactor: 代码重构，既不是新增功能也不是修复 bug 的修改。
- revert: 撤销上一次的提交。
- style: 修改代码风格，如修改空格、缩进等。
- test: 添加或修改测试用例。

提交代码例子:

```
git add .
```

```
git commit "feat: 123"
```

# 2023/9/15

## 目前页面写法有两种方案:

1. 在 index.vue 上写 data 数据的交互以及一些组件
2. 在 .tsx 文件中将组件写在 cell 里面，引入 index.tsx 文件里面的 data 变量等

   `warn: 目前尚未确定哪种写法更好，待有接口后进一步试验`

# 2023/9/20

## emit 与自定义事件，实现组件间通信(在 tsx 里的实现)

1. 自定义事件在 tsx 里的写法:

```tsx
<Dialog onEdit={editFinish}></Dialog> //on+自定义事件名(首字母大写)
```

2. 在子组件里用 defineEmits 接收自定义组件

```ts
const emit = defineEmits(['edit']); //数组写法
```

3. 使用自定义组件名,emit 传递信信息

```js
const edit = () => {
  visible.value = false;
  emit('edit', 'emit传来喜报:组件通信成功'); //第一个参数为自定义方法名，第二个为传递的信息
};
```

# 2023/9/23

## 踩坑: tsx 里面的点击事件(带参)变成立即执行事件

1. 错误写法:

```tsx
onClick={edit(id)}
```

2. 正确写法:

```tsx
onClick={()=>{edit(id)}}//调用带参事件需要写成箭头函数的方式，就不会变成立即执行函数。
```
