import { MessagePlugin } from 'tdesign-vue-next';
import { PrimaryTableCol } from 'tdesign-vue-next/es/table/type';

import { delete3 } from '@/api/user/yonghuguanlixiangguanjiekou';
import { useRenewDataStore } from '@/store/renewData';

import Edit from './components/Edit.vue';

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
  },
  { colKey: 'nickName', title: '昵称' },
  {
    colKey: 'credit',
    title: '累计消费',
    sorter: true,
  },
  {
    colKey: 'status',
    title: '状态',
    cell: (h, { row }) => {
      return (
        <t-tag
          shape="round"
          theme={row.status === false ? 'danger' : 'success'}
          variant="light-outline"
        >
          {row.status === false ? '禁用' : '正常'}
        </t-tag>
      );
    },
  },

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
      return <span>{row.sex === 0 ? '男' : '女'}</span>;
    },
  },

  // { colKey: 'createBy', title: '创建者' },
  // { colKey: 'createTime', title: '创建时间', sorter: true },
  // { colKey: 'updateBy', title: '修改者' },
  // { colKey: 'updateTime', title: '修改时间', sorter: true },
  {
    colKey: 'operation',
    title: '操作',
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
  store.renewData({ pageNmber: 1, pagaSize: 10 }); // 使用pinia里面的分页请求
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
