import { MessagePlugin } from 'tdesign-vue-next';
import { PrimaryTableCol } from 'tdesign-vue-next/es/table/type';

import { delete3 } from '@/api/user/yonghuguanlixiangguanjiekou';
import { useRenewDataStore } from '@/store/renewData';

import Edit from './components/Edit.vue';

// const onNameChange = async (val, _) => {
//   // console.log(val, ctx);
//   if (val === '' || null) {
//     store.renewData({ pageNmber: store.pagination.current, pagaSize: store.pagination.pageSize }); // 使用pinia里面的分页请求
//   } else {
//     const res = await store.renewData(null, null, { name: val });
//     console.log(res);
//   }
// };
export const columns: PrimaryTableCol[] = [
  {
    colKey: 'row-select',
    type: 'multiple',
    width: 50,
  },
  // {
  //   colKey: 'id',
  //   title: 'id',
  // },
  {
    colKey: 'name',
    title: '姓名',
    // // 输入框过滤配置
    // filter: {
    //   type: 'input',

    //   // 文本域搜索
    //   // component: Textarea,

    //   resetValue: '',
    //   // 按下 Enter 键时也触发确认搜索
    //   confirmEvents: ['onEnter', 'onReset'],
    //   props: {
    //     placeholder: '输入关键词过滤',
    //     onChange: onNameChange,
    //   },
    //   // 是否显示重置取消按钮，一般情况不需要显示
    //   showConfirmAndReset: true,
    // },
  },
  { colKey: 'nickName', title: '昵称' },
  {
    colKey: 'credit',
    title: '累计消费',
    sorter: true,
  },
  // {
  //   colKey: 'status',
  //   title: '状态',
  //   // 单选过滤配置
  //   filter: {
  //     // 过滤行中的列标题别名
  //     // label: '申请状态 A',
  //     type: 'single',
  //     list: [
  //       // @ts-ignore
  //       { label: '禁用', value: false },
  //       // @ts-ignore
  //       { label: '正常', value: true },
  //     ],
  //   },
  //   // 支持透传全部 Popup 组件属性
  //   // popupProps: {
  //   //   attach: () => document.body,
  //   // },
  //   // cell: (h, { row }) => {
  //   //   return (
  //   //     <t-tag
  //   //       shape="round"
  //   //       theme={row.status === false ? 'danger' : 'success'}
  //   //       variant="light-outline"
  //   //     >
  //   //       {row.status === false ? '禁用' : '正常'}
  //   //     </t-tag>
  //   //   );
  //   // },
  // },

  { colKey: 'phoneNumber', title: '手机号', width: '110px' },
  { colKey: 'email', title: '邮件', width: '150px' },
  { colKey: 'birthday', title: '生日' },
  // {
  //   colKey: 'avatar',
  //   title: '头像',
  //   width: ' 100px',
  //   cell: (h, { row }) => {
  //     return (
  //       <t-image
  //         key={loadingCount}
  //         src={`https://${row.avatar}`}
  //         style={{ width: '80px', height: '80px' }}
  //         lazy={true}
  //         placeholder={renderPlaceholder}
  //         loading={renderLoading}
  //       />
  //     );
  //   },
  // },
  {
    colKey: 'sex',
    title: '性别',
    cell: (h, { row }) => {
      let cellValue;
      switch (row.sex) {
        case 0:
          cellValue = <span>男</span>;
          break;
        case 1:
          cellValue = <span>女</span>;
          break;
        default:
          cellValue = <span>用户未设置</span>;
          break;
      }
      return cellValue;
    },
  },

  // { colKey: 'createBy', title: '创建者' },
  // { colKey: 'createTime', title: '创建时间', sorter: true },
  // { colKey: 'updateBy', title: '修改者' },
  // { colKey: 'updateTime', title: '修改时间', sorter: true },
  {
    colKey: 'operation',
    title: '操作',
    fixed: 'right',
    cell: (h, { row }) => {
      return (
        <t-space>
          <t-popconfirm
            content="确认删除吗"
            onConfirm={() => handleDelete(row.id)}
          >
            <t-link
              variant="text"
              hover="color"
              theme="danger"
            >
              删除
            </t-link>
          </t-popconfirm>
          <Edit
            // @ts-ignore
            onEdit={editFinish}
            editId={row.id}
          ></Edit>
        </t-space>
      );
    },
  },
];
// 循环为列属性配置居中属性
for (let i = 0; i < columns.length; i++) {
  columns[i].align = 'center';
}
const store = useRenewDataStore();
const handleDelete = async (id) => {
  try {
    console.log('删除的id', id);
    // 参数要求是个对象
    const params = {
      id,
    };
    const res = await delete3(params);
    console.log('删除后', res);
    MessagePlugin.success('删除成功');

    store.renewData({ pageNmber: store.pagination.current, pagaSize: store.pagination.pageSize });
  } catch (error) {
    console.log(error);
  }
};
// 发送编辑行后执行回调
const editFinish = async (newData) => {
  console.log('edit传回', newData);
  store.renewData({ pageNmber: store.pagination.current, pagaSize: store.pagination.pageSize });
};

// const loadingCount = ref(0);
// const renderPlaceholder = () => (
//   <img
//     width="100%"
//     height="100%"
//     src="https://tdesign.gtimg.com/demo/demo-image-5.png"
//   />
// );
// const renderLoading = () => (
//   <div
//     style={{
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       width: '100%',
//       height: '100%',
//       background: 'rgba(255,255,255,.4)',
//       backdropFilter: 'blur(10px)',
//     }}
//   >
//     <Loading
//       delay={0}
//       fullscreen={false}
//       indicator
//       inheritColor={false}
//       loading
//       preventScrollThrough
//       showOverlay
//       size="small"
//     />
//   </div>
// );
