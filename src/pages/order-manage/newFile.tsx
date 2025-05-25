import { MoveIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { PrimaryTableCol } from 'tdesign-vue-next/es/table/type';
import { ref } from 'vue';

import { addWord, bookMenuList, delete9, deleteBookMenu, group } from '@/api/user/bookApi';
import { getByGroupId, getById } from '@/api/user/wordsApi';
import { useRenewDataStore } from '@/store/renewData';

export const columns: PrimaryTableCol[] = [
  {
    colKey: 'drag', // 列拖拽排序必要参数
    title: '排序',
    cell: (h) => (
      <span>
        <MoveIcon />
      </span>
    ),
    width: 50,
  },
  { colKey: 'rank', title: '序号', width: '50px' },
  { colKey: 'bookId', title: '词汇书id', width: '100px' },
  { colKey: 'bookName', title: '词汇书名称', width: '100px' },
  { colKey: 'url', title: '词汇书封面', width: '100px' },
  { colKey: 'bookDescription', title: '词汇书描述', width: '100px' },
  { colKey: 'label', title: '词汇书标签', width: '100px' },

  {
    colKey: 'edit',
    title: '查看词组列表',
    width: '150px',
    cell: (h, { row }) => {
      return <t-button onClick={() => edit(row)}>查看详情</t-button>;
    },
  },
  // { colKey: 'endTime', title: '用户离开时间', width: '200px' },
  {
    colKey: 'operation',
    title: '操作',
    fixed: 'right',
    width: '140px',
    cell: (h, { row }) => {
      let ceil;
      {
        ceil = (
          <div
            style={{
              width: '28px',
            }}
          ></div>
        );
      }
      {
        ceil = (
          <div
            style={{
              width: '28px',
            }}
          ></div>
        );
      }
      return (
        <t-space>
          <t-button
            theme="primary"
            onClick={() => wordBookEdit(row)}
          >
            编辑
          </t-button>
          <t-popconfirm
            content="确认删除吗"
            onConfirm={() => handleDelete(row.bookId)}
          >
            <t-button theme="danger">删除</t-button>
          </t-popconfirm>
        </t-space>
      );
    },
  },
];

export const visible2 = ref(false);

export const columns2: PrimaryTableCol[] = [
  { colKey: 'index', title: '词组索引', width: '50px' },
  {
    colKey: 'edit',
    title: '查看词组详情',
    width: '100px',
    cell: (h, { row }) => {
      return <t-button onClick={() => edit2(row)}>查看详情</t-button>;
    },
  },
];

export const columns3: PrimaryTableCol[] = [
  { colKey: 'index', title: '组别', width: '50px' },
  { colKey: 'groupId', title: '组别Id', width: '50px' },
  { colKey: 'finish', title: '标记情况', width: '50px' },
  { colKey: 'total', title: '单词数量', width: '50px' },
  {
    colKey: 'edit',
    title: '查看单词详情',
    width: '100px',
    cell: (h, { row }) => {
      return (
        <t-space>
          <t-button onClick={() => edit3(row)}>查看详情</t-button>
        </t-space>
      );
    },
  },
];

export const columns4: PrimaryTableCol[] = [
  {
    colKey: 'row-select',
    type: 'multiple',
    width: 50,
  },
  { colKey: 'word', title: '单词拼写', width: '400px' },
  {
    colKey: 'edit',
    title: '单词详情',
    width: '200px',
    cell: (h, { row, rowIndex }) => {
      return (
        <t-space>
          <t-link
            theme="primary"
            onClick={() => edit6(row)}
          >
            查看详情
          </t-link>
          <t-link
            theme="primary"
            onClick={() => resourceModify(row)}
          >
            资源修改
          </t-link>
        </t-space>
      );
    },
  },
];

export const columnsrels: PrimaryTableCol[] = [
  { colKey: 'pos', title: '分类', width: '150px' },
  { colKey: 'words', title: '单词', width: '200px' },
  {
    colKey: 'edit',
    title: '修改同源树',
    width: '200px',
    cell: (h, { row, rowIndex }) => {
      return (
        <t-space>
          <t-button onClick={() => edit7(row, rowIndex, 1)}>操作</t-button>
          <t-popconfirm
            content="确认删除吗"
            onConfirm={() => {
              delete1(row, rowIndex, 1);
            }}
          >
            <t-button theme="danger">删除</t-button>
          </t-popconfirm>
        </t-space>
      );
    },
  },
];

export const columnsSen: PrimaryTableCol[] = [
  { colKey: 'scontent', title: '例句', width: '200px' },
  { colKey: 'scn', title: '翻译', width: '200px' },
  {
    colKey: 'edit',
    title: '修改例句',
    width: '100px',
    cell: (h, { row, rowIndex }) => {
      return (
        <t-space>
          <t-button onClick={() => edit7(row, rowIndex, 2)}>操作</t-button>
          <t-popconfirm
            content="确认删除吗"
            onConfirm={() => {
              delete1(row, rowIndex, 2);
            }}
          >
            <t-button theme="danger">删除</t-button>
          </t-popconfirm>
        </t-space>
      );
    },
  },
];

export const columnsMenus: PrimaryTableCol[] = [
  {
    colKey: 'drag', // 列拖拽排序必要参数
    title: '排序',
    cell: (h) => (
      <span>
        <MoveIcon />
      </span>
    ),
    width: 50,
  },
  { colKey: 'rank', title: '序号', width: '50px' },
  { colKey: 'name', title: '目录名称', width: '200px' },
  { colKey: 'description', title: '目录描述', width: '200px' },
  {
    colKey: 'edit',
    title: '删除目录',
    width: '100px',
    cell: (h, { row, rowIndex }) => {
      return (
        <t-space>
          <t-button onClick={() => modifyMenus(row)}>修改</t-button>
          <t-popconfirm
            content="确认删除吗"
            onConfirm={() => {
              deleteMenus(row);
            }}
          >
            <t-button theme="danger">删除</t-button>
          </t-popconfirm>
        </t-space>
      );
    },
  },
];

export const columnsTran: PrimaryTableCol[] = [
  { colKey: 'tranCn', title: '翻译', width: '200px' },
  {
    colKey: 'edit',
    title: '修改翻译',
    width: '45px',
    cell: (h, { row, rowIndex }) => {
      return (
        <t-space>
          <t-button onClick={() => edit7(row, rowIndex, 3)}>操作</t-button>
          <t-popconfirm
            content="确认删除吗"
            onConfirm={() => {
              delete1(row, rowIndex, 3);
            }}
          >
            <t-button theme="danger">删除</t-button>
          </t-popconfirm>
        </t-space>
      );
    },
  },
];

export const columnsPrase: PrimaryTableCol[] = [
  { colKey: 'pcontent', title: '短语', width: '200px' },
  { colKey: 'pcn', title: '翻译', width: '200px' },
  {
    colKey: 'edit',
    title: '修改短语',
    width: '45px',
    cell: (h, { row, rowIndex }) => {
      return (
        <t-space>
          <t-button onClick={() => edit7(row, rowIndex, 4)}>操作</t-button>
          <t-popconfirm
            content="确认删除吗"
            onConfirm={() => {
              delete1(row, rowIndex, 4);
            }}
          >
            <t-button theme="danger">删除</t-button>
          </t-popconfirm>
        </t-space>
      );
    },
  },
];

export const columnsSyno: PrimaryTableCol[] = [
  { colKey: 'pos', title: '词性', width: '200px' },
  { colKey: 'tran', title: '对应词义', width: '200px' },
  { colKey: 'hwds', title: '词组', width: '200px' },
  {
    colKey: 'edit',
    title: '修改单词',
    width: '200px',
    cell: (h, { row, rowIndex }) => {
      return (
        <t-space>
          <t-button onClick={() => edit7(row, rowIndex, 5)}>操作</t-button>
          <t-popconfirm
            content="确认删除吗"
            onConfirm={() => {
              delete1(row, rowIndex, 5);
            }}
          >
            <t-button theme="danger">删除</t-button>
          </t-popconfirm>
        </t-space>
      );
    },
  },
];

export const columnsWordSearch: PrimaryTableCol[] = [
  { colKey: 'word', title: '单词', width: '200px' },
  { colKey: 'translation', title: '翻译', width: '200px' },
  { colKey: 'bookId', title: '所属词汇书', width: '100px' },
  {
    colKey: 'edit',
    title: '单词操作',
    width: '250px',
    cell: (h, { row, rowIndex }) => {
      return (
        <t-space>
          {/*          <t-popconfirm
            content="确认上传吗"
            onConfirm={() => {
              uploadWord(row);
            }}
          >
            <t-button>上传单词</t-button>
          </t-popconfirm> */}
          <t-button onClick={() => edit9(row)}>查看详情</t-button>
          <t-button onClick={() => resourceModify1(row)}>资源修改</t-button>
        </t-space>
      );
    },
  },
];

export const visibleBook = ref(false);

const handleDelete = async (id) => {
  try {
    console.log('删除的id', id);
    // 参数要求是个对象
    const params = {
      bookId: id,
    };
    //
    const res = await delete9(params);
    console.log('删除后', res);
    MessagePlugin.success('删除成功');
    store.renewData(
      { pageNumber: store.pagination.current, pageSize: store.pagination.pageSize },
      null,
      store.querySave,
    ); // 使用pinia里面的分页请求
  } catch (error) {
    console.log(error);
  }
};

export const bookID = ref('');
const wordIndex1 = ref('');

const uploadWord = async (row) => {
  wordIndex1.value = row.word.charAt(0);
  wordIndex.value = wordIndex1.value.toUpperCase();
  console.log('row', row);
  const params = {
    id: row.dbId,
    headWord: row.word,
    bookId: bookID.value,
    wordIndex: wordIndex.value,
  };
  addWord(params).then((res) => {
    console.log(res);
    if (res.code == 200) {
      MessagePlugin.success('单词添加成功');
    }
    if (res.code == 90006) MessagePlugin.error('单词已存在');
  });
};

for (let i = 0; i < columns.length; i++) {
  columns[i].align = 'center';
}

for (let i = 0; i < columns2.length; i++) {
  columns2[i].align = 'center';
}
const store = useRenewDataStore();

// 发送编辑行后执行回调
const editFinish = async (newData) => {
  console.log('edit传回', newData);
  store.renewData({ pageNumber: store.pagination.current, pageSize: store.pagination.pageSize }, null, store.querySave); // 使用pinia里面的分页请求
};

export const visible = ref(false);
export const bookId = ref('');
export const data2 = ref([]);
export const data3 = ref([]);
export const data4 = ref([]);
export const data5 = ref([]);
export const data6 = ref({
  // sentence: { desc: "", sentences: [{ scn: "", scontent: "" }] },
  // relWord: { desc: "", rels: [{ pos: "", words: [{ hwd: "", tran: "" }] }] },
  // trans: [{ tranCn: "" }],
  // phrase: { phrases: [{ pcontent: "", pcn: "" }], desc: "" },
  // syno: { synos: [{ pos: "", tran: "", hwds: [{ w: "" }] }], desc: "" }
});
export const word = ref('');
export const visible3 = ref(false);
export const visible4 = ref(false);
export const isLoading2 = ref(false);
export const isLoading3 = ref(false);
export const wordIndex = ref('');
const index = ref([]);
const data1 = ref([]);

const edit = (row) => {
  bookID.value = row.bookId;
  isLoading2.value = true;
  console.log('row', row);
  visible.value = true;
  bookId.value = row.bookId;
  const params = {
    bookId: row.bookId,
  };
  group(params).then((res) => {
    data2.value = [];
    data1.value = res.result.groupVOS;
    index.value = res.result.index;
    console.log('data2', data2.value);
    for (const i in index.value) {
      data2.value.push({ index: index.value[i], group: data1.value[i] });
    }
    console.log(data2);
    isLoading2.value = false;
  });
};

const edit2 = (row) => {
  // console.log('555', row.group[1])
  visible2.value = true;
  data3.value = row.group;
  // wordIndex.value = row.index
};

export const allLoading = ref(false);
export const row1 = ref();

export const edit3 = async (row) => {
  allLoading.value = true;
  row1.value = row;
  // visible3.value = true
  // isLoading3.value = true
  console.log('groupId', row.total);
  const params = {
    groupId: row.groupId,
  };
  await getByGroupId(params).then((res) => {
    data5.value = [];
    // data5.value = []
    for (const i in res.result) {
      data5.value.push({ id: res.result[i].id, word: res.result[i].headWord });
    }
    // console.log('data5', data5.value)
    visible3.value = true;
    allLoading.value = false;
    // dg(0, row.total)
    // console.log('data5', data5.value.length)
    // console.log('total', row.total)
  });
};

export const data7 = ref();
const edit6 = (row) => {
  data6.value = {};
  allLoading.value = true;
  console.log('edit6', row);
  const params = {
    id: row.id,
  };
  getById(params).then((res) => {
    if (res.result.content != null) {
      word.value = res.result.content.word.wordHead;
      data6.value = res.result.content.word.content;
    }
    console.log('data6', data6.value);
    data7.value = res.result;
    console.log('data6', data6.value);
    allLoading.value = false;
    visible4.value = true;
  });
};

const edit9 = (row) => {
  allLoading.value = true;
  console.log('edit6', row);
  const params = {
    id: row.dbId,
  };
  getById(params).then((res) => {
    word.value = res.result.content.word.wordHead;
    data6.value = res.result.content.word.content;
    console.log('data6', data6.value);
    data7.value = res.result;
    console.log('data6', data6.value);
    allLoading.value = false;
    visible4.value = true;
  });
};

export const visible5 = ref(false);
export const keyWord = ref(0);
export const arrIndex = ref();
export const visibleNewWord = ref(false);

const edit7 = (row, index, num) => {
  console.log('row', row);
  if (num == 1) {
    // 同根
    keyWord.value = num;
    arrIndex.value = index;
    visible5.value = true;
  }
  if (num == 2) {
    // 例句
    keyWord.value = num;
    arrIndex.value = index;
    visible5.value = true;
  }
  if (num == 3) {
    // 翻译
    keyWord.value = num;
    arrIndex.value = index;
    visible5.value = true;
  }
  if (num == 4) {
    // 短语
    keyWord.value = num;
    arrIndex.value = index;
    visible5.value = true;
  }
  if (num == 5) {
    // 近义
    keyWord.value = num;
    arrIndex.value = index;
    visible5.value = true;
  }
};

const delete1 = (row, index, num) => {
  if (num == 1) {
    // 同根
    keyWord.value = num;
    arrIndex.value = index;
    data6.value.relWord.rels.splice(index, 1);
  }
  if (num == 2) {
    // 例句
    keyWord.value = num;
    arrIndex.value = index;
    data6.value.sentence.sentences.splice(index, 1);
  }
  if (num == 3) {
    // 翻译
    keyWord.value = num;
    arrIndex.value = index;
    data6.value.trans.splice(index, 1);
  }
  if (num == 4) {
    // 短语
    keyWord.value = num;
    arrIndex.value = index;
    data6.value.phrase.phrases.splice(index, 1);
  }
  if (num == 5) {
    // 近义
    keyWord.value = num;
    arrIndex.value = index;
    data6.value.syno.synos.splice(index, 1);
  }
};

const deleteMenus = (row) => {
  console.log(row);
  const params = {
    menuId: row.id,
  };
  deleteBookMenu(params).then((res) => {
    if (res.code == 200) {
      MessagePlugin.success('删除成功');
      getMenusList();
    }
  });
};

export const rowWordBook = ref();
export const row2 = ref();
export const label = ref([]);
const search = ref(0);
const search1 = ref('');
const label1 = ref('');
export const labelArr = ref([]);
export const bookDescription = ref('');
export const imageUrl = ref('');
export const bookDescription1 = ref('');
export const bookName = ref('');
export const rank = ref('');
export const bookId1 = ref('');
export const bookid = ref('');
export const menus = ref('');
// export const menusItem = ref("")
// export const imageUrl1 = ref("")

const wordBookEdit = (row) => {
  visibleBook.value = true;
  bookid.value = row.id;
  imageUrl.value = row.url;
  bookId1.value = row.bookId;
  // if (row.bookDescription) {
  rank.value = row.rank;
  bookName.value = row.bookName;
  bookDescription.value = row.bookDescription;
  bookDescription1.value = row.bookDescription;
  menus.value = row.menus;
  // }
  row2.value = row;
  bookMenuList().then((res) => {
    menusListData.value = res.result;
    menusListData.value.unshift({ name: '全部', rank: 0, id: '0' });
  });
  console.log('row', row);
  if (row.label != '') {
    label1.value = row.label;
    console.log(label1.value);
    search.value = label1.value.indexOf(']');
    // console.log(search)
    search1.value = label1.value.substring(1, search.value);
    console.log(search1.value);
    labelArr.value = search1.value.split('、');
  }
};

export const resource = ref({});
export const visibleResource = ref(false);
export const resourceAudio1 = ref([]);
export const resourceAudio = ref([]);
export const headWord1 = ref('');
export const resourceImage = ref([]);
// export const resourceImage1 = ref([])
export const resourceVideo = ref([]);
// export const resourceVideo1 = ref([])
const resourceAudioRadio = ref([]);
export const resourceAudioUs = ref({});
export const resourceAudioUk = ref({});
export const visibleModifyMenus = ref(false);
export const nameModify = ref('');
export const descModify = ref('');
export const menusId = ref('');
export const rankModify = ref('');

const modifyMenus = (row) => {
  rankModify.value = row.rank;
  visibleModifyMenus.value = true;
  nameModify.value = row.name;
  descModify.value = row.description;
  menusId.value = row.id;
};

const resourceModify = (row) => {
  allLoading.value = true;
  console.log(row);
  headWord1.value = row.word;
  const params = {
    id: row.id,
  };
  getById(params).then((res) => {
    allLoading.value = false;
    visibleResource.value = true;
    if (res.result.resource) {
      // resource.value = res.result.resource
      resourceImage.value = res.result.resource.images;
      // resourceImage1.value = JSON.parse(JSON.stringify(res.result.resource.images))
      resourceVideo.value = res.result.resource.videos;
      // resourceVideo1.value = res.result.resource.videos
      resourceAudioRadio.value = res.result.resource.voices;
      if (resourceAudioRadio.value) {
        for (const i in resourceAudioRadio.value) {
          if (resourceAudioRadio.value[i].name == 'usphone') {
            resourceAudio.value.push(resourceAudioRadio.value[i]);
            resourceAudioUs.value = resourceAudioRadio.value[i];
            console.log('Us', resourceAudio.value);
          }
          if (resourceAudioRadio.value[i].name == 'ukphone') {
            resourceAudio1.value.push(resourceAudioRadio.value[i]);
            resourceAudioUk.value = resourceAudioRadio.value[i];
            console.log('Uk', resourceAudio1.value);
          }
        }
      }
    }
    // else {
    //   resourceAudio.value = []
    //   resourceAudio1.value = []
    //   resourceAudioUk.value = {}
    //   resourceAudioUs.value = {}
    // }
  });
};

const resourceModify1 = (row) => {
  allLoading.value = true;
  console.log(row);
  headWord1.value = row.word;
  const params = {
    id: row.dbId,
  };
  getById(params).then((res) => {
    allLoading.value = false;
    visibleResource.value = true;
    if (res.result.resource) {
      // resource.value = res.result.resource
      resourceImage.value = res.result.resource.images;
      // resourceImage1.value = JSON.parse(JSON.stringify(res.result.resource.images))
      resourceVideo.value = res.result.resource.videos;
      // resourceVideo1.value = res.result.resource.videos
      console.log('resourceImage', resourceImage.value);
      resourceAudioRadio.value = res.result.resource.voices;
      if (resourceAudioRadio.value) {
        for (const i in resourceAudioRadio.value) {
          if (resourceAudioRadio.value[i].name == 'usphone') {
            resourceAudio.value.push(resourceAudioRadio.value[i]);
            resourceAudioUs.value = resourceAudioRadio.value[i];
            console.log('Us', resourceAudio.value);
          }
          if (resourceAudioRadio.value[i].name == 'ukphone') {
            resourceAudio1.value.push(resourceAudioRadio.value[i]);
            resourceAudioUk.value = resourceAudioRadio.value[i];
            console.log('Uk', resourceAudio1.value);
          }
        }
      }
    }
    // else {
    //   resourceAudio.value = []
    //   resourceAudio1.value = []
    //   resourceAudioUk.value = {}
    //   resourceAudioUs.value = {}
    // }
  });
};

export const visibleMenusList = ref(false);
export const menusListData = ref([]);
export const menusFilter = ref([]);

export const getMenusList = () => {
  allLoading.value = true;
  bookMenuList().then((res) => {
    menusListData.value = [];
    allLoading.value = false;
    menusListData.value = res.result;
    menusListData.value.unshift({ name: '全部', rank: 0, id: '0' });
    visibleMenusList.value = true;
  });
};
