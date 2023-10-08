import { MessagePlugin } from 'tdesign-vue-next';
import { PrimaryTableCol } from 'tdesign-vue-next/es/table/type';

import { delete6 } from '@/api/user/mendianguanlijiekou';
import { useRenewDataStore } from '@/store/renewData';

import AddAnno from './components/AddAnno.vue';
import Edit from './components/Edit.vue';
// import EditAnno from './components/EditAnno.vue';
import Introduction from './components/Introduction.vue';
import NeedKnow from './components/NeedKnow.vue';
import ShowImg from './components/ShowImg.vue';

const store = useRenewDataStore();

export const columns: PrimaryTableCol[] = [
  {
    colKey: 'row-select',
    type: 'multiple',
    width: 50,
    fixed: 'left',
  },
  // { colKey: 'createTime', title: '创建时间' },
  // {
  //   colKey: 'updateBy',
  //   title: '修改者',
  // },
  // {
  //   colKey: 'updateTime',
  //   title: '修改时间',
  // },
  {
    colKey: 'storeName',
    title: '门店名称',
  },
  {
    colKey: 'address',
    title: '门店地址 ',
    width: '150px',
  },
  {
    colKey: 'venueIntroduction',
    title: '场馆介绍',
    cell: (h, { row }) => {
      return <Introduction data={row.venueIntroduction}></Introduction>;
    },
  },
  {
    colKey: 'closingTime',
    title: '关店时间',
  },
  {
    colKey: 'openingTime',
    title: '开店时间',
  },
  // { colKey: 'deleteFlag', title: ' 删除标志', ellipsis: true, cell: undefined },

  {
    colKey: 'storeImages',
    title: '门店图片',
    cell: (h, { row }) => {
      return (
        // @ts-ignore
        <ShowImg
          editId={row.id} // @ts-ignore
          onShow={showFinish}
        ></ShowImg>
      );
    },
  },
  {
    colKey: 'wxCode',
    title: '微信号',
  },
  {
    colKey: 'serviceHotline',
    title: '服务热线',
    width: '110px',
  },
  {
    colKey: 'realTime',
    title: '实时人数',
  },
  {
    colKey: 'advanceDays',
    title: '提前预订天数',
  },
  {
    colKey: 'leadTime',
    title: '起订时间/分',
  },

  {
    colKey: 'announcement',
    title: '公告',
    // fixed: 'right',

    // @ts-ignore
    // cell: (h, { row }) => {
    //   return (
    //     <t-space>
    //       <AddAnno // @ts-ignore
    //         onAdd={addFinish}
    //         editId={row.id}
    //       ></AddAnno>
    //       {/* <EditAnno // @ts-ignore
    //         onEdit={editFinish}
    //         editId={row.id}
    //       ></EditAnno> */}
    //     </t-space>
    //   );
    // },
  },
  {
    colKey: 'scheduledNotice',
    title: '订场须知',
    fixed: 'right',

    cell: (h, { row }) => {
      return (
        <t-space>
          <NeedKnow data={row.scheduledNotice}></NeedKnow>
        </t-space>
      );
    },
  },

  {
    colKey: 'operation',
    title: '操作',
    width: '130px',
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
          <Edit // @ts-ignore
            onEdit={editFinish}
            editId={row.id}
          ></Edit>
        </t-space>
      );
    },
  },
];

for (let i = 0; i < columns.length; i++) {
  columns[i].align = 'center';
}
const handleDelete = async (id) => {
  try {
    console.log('删除的id', id);
    // 参数要求是个对象
    const params = {
      id,
    };
    const res = await delete6(params);
    console.log('删除后', res);
    MessagePlugin.success('删除成功');
    store.renewData({ pageNumber: store.pagination.current, pageSize: store.pagination.pageSize });
  } catch (error) {
    console.log(error);
  }
};
// 发送编辑行后执行回调
const editFinish = async (newData) => {
  console.log('edit传回', newData);
  store.renewData({ pageNumber: store.pagination.current, pageSize: store.pagination.pageSize }); // 使用pinia里面的分页请求
};

const addFinish = (newData) => {
  console.log(newData);
  store.renewData({ pageNumber: store.pagination.current, pageSize: store.pagination.pageSize }); // 使用pinia里面的分页请求
};
const showFinish = (newData) => {
  console.log(newData);
  store.renewData({ pageNumber: store.pagination.current, pageSize: store.pagination.pageSize }); // 使用pinia里面的分页请求
};
