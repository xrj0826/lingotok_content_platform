import { MoveIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { PrimaryTableCol } from 'tdesign-vue-next/es/table/type';
import { ref } from 'vue';

import { delete9, get9 } from '@/api/user/articles';
import { delete7, get8, updateSentenceResource } from '@/api/user/exercises';
import { delete5, get7 } from '@/api/user/readingMaterials';
import { delete3 } from '@/api/user/sentence';
// import { delete21 } from '@/api/user/guanliyuan';
import { useRenewDataStore } from '@/store/renewData';
// import { delete5 } from '@/api/user/readingMaterials';

// import Edit from './components/Edit.vue';

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
    title: '读物名称',
  },
  // { colKey: 'nickName', title: '昵称' },
  {
    colKey: 'edit',
    fixed: 'right',
    title: '修改读物名称',
    cell: (h, { row }) => {
      return <t-button onClick={() => edit(row)}>编辑</t-button>;
    },
  },
  {
    colKey: 'detail',
    fixed: 'right',
    title: '读物详情',
    cell: (h, { row }) => {
      return <t-button onClick={() => readingDetail(row)}>读物详情</t-button>;
    },
  },
  {
    colKey: 'operation',
    fixed: 'right',
    title: '操作',
    cell: (h, { row }) => {
      return (
        <t-space>
          <t-popconfirm
            content="确认删除吗"
            onConfirm={() => {
              handleDelete(row);
            }}
          >
            <t-link
              variant="text"
              hover="color"
              theme="danger"
            >
              删除
            </t-link>
          </t-popconfirm>
          {/* <Edit
            // @ts-ignore
            onEdit={editFinish}
            editId={row.id}
          ></Edit> */}
        </t-space>
      );
    },
  },
];

export const columnsReading: PrimaryTableCol[] = [
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
    colKey: 'title',
    title: '文章名称',
  },
  // { colKey: 'nickName', title: '昵称' },
  { colKey: 'picture', title: '文章封面', width: '120px' },
  { colKey: 'introduction', title: '文章简介', width: '400px' },
  {
    colKey: 'edit',
    title: '修改文章',
    cell: (h, { row }) => {
      return <t-button onClick={() => modifyArticle(row)}>编辑</t-button>;
    },
  },
  { colKey: 'articleCount', title: '文章数量' },
  {
    colKey: 'detail',
    title: '文章详情',
    cell: (h, { row }) => {
      return <t-button onClick={() => essayDetail(row)}>文章详情</t-button>;
    },
  },
  {
    colKey: 'operation',
    title: '操作',
    cell: (h, { row }) => {
      return (
        <t-space>
          <t-popconfirm
            content="确认删除吗"
            onConfirm={() => {
              deleteReading(row);
            }}
          >
            <t-link
              variant="text"
              hover="color"
              theme="danger"
            >
              删除
            </t-link>
          </t-popconfirm>
          {/* <Edit
            // @ts-ignore
            onEdit={editFinish}
            editId={row.id}
          ></Edit> */}
        </t-space>
      );
    },
  },
];

export const columnsEssay: PrimaryTableCol[] = [
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
    colKey: 'articleId',
    title: '所属文章ID',
    width: '200px',
  },
  {
    colKey: 'title',
    title: '练习名称',
  },
  // { colKey: 'nickName', title: '昵称' },
  { colKey: 'difficultyLevel', title: '难度分类', width: '120px' },
  {
    colKey: 'edit',
    title: '修改练习内容',
    cell: (h, { row }) => {
      return <t-button onClick={() => modifyExercise(row)}>编辑</t-button>;
    },
  },
  { colKey: 'articleCount', title: '文章数量' },
  {
    colKey: 'detail',
    title: '句子列表',
    cell: (h, { row }) => {
      return <t-button onClick={() => exercisesDetail(row)}>练习详情</t-button>;
    },
  },
  {
    colKey: 'operation',
    title: '操作',
    cell: (h, { row }) => {
      return (
        <t-space>
          <t-popconfirm
            content="确认删除吗"
            onConfirm={() => {
              deleteEssay(row);
            }}
          >
            <t-link
              variant="text"
              hover="color"
              theme="danger"
            >
              删除
            </t-link>
          </t-popconfirm>
          {/* <Edit
            // @ts-ignore
            onEdit={editFinish}
            editId={row.id}
          ></Edit> */}
        </t-space>
      );
    },
  },
];

export const columnsExercise: PrimaryTableCol[] = [
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
    colKey: 'exercisesId',
    title: '所属练习ID',
    width: '200px',
  },
  // { colKey: 'nickName', title: '昵称' },
  { colKey: 'content', title: '练习内容', width: '300px' },
  { colKey: 'translation', title: '练习翻译', width: '300px' },
  { colKey: 'voiceUrl', title: '音频', width: '300px' },
  { colKey: 'videoUrl', title: '视频', width: '300px' },
  {
    colKey: 'operation',
    title: '操作',
    width: '150px',
    fixed: 'right',
    cell: (h, { row }) => {
      return (
        <t-space>
          <t-button onClick={() => modifySen(row)}>编辑</t-button>
          <t-popconfirm
            content="确认删除吗"
            onConfirm={() => {
              deleteExercise(row);
            }}
          >
            <t-link
              variant="text"
              hover="color"
              theme="danger"
            >
              删除
            </t-link>
          </t-popconfirm>
          {/* <Edit
            // @ts-ignore
            onEdit={editFinish}
            editId={row.id}
          ></Edit> */}
        </t-space>
      );
    },
  },
];

export const columnsContent: PrimaryTableCol[] = [
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
  {
    colKey: 'rank', // 列拖拽排序必要参数
    title: '排序值',
    width: 70,
  },
  {
    colKey: 'row-select',
    type: 'multiple',
    width: 30,
  },
  {
    colKey: 'content',
    title: '内容',
    width: 300,
  },
  {
    colKey: 'operation',
    title: '操作',
    fixed: 'right',
    width: 80,
    cell: (h, { row }) => {
      return (
        <t-space>
          <t-popconfirm
            content="确认保存修改吗"
            onConfirm={() => {
              saveContent(row);
            }}
          >
            <t-link
              variant="text"
              hover="color"
              theme="primary"
            >
              保存修改
            </t-link>
          </t-popconfirm>
        </t-space>
      );
    },
  },
];

export const columnsVideo: PrimaryTableCol[] = [
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
  {
    colKey: 'rank', // 列拖拽排序必要参数
    title: '排序值',
    width: 70,
  },
  {
    colKey: 'row-select',
    type: 'multiple',
    width: 30,
  },
  {
    colKey: 'url',
    title: '内容',
  },
  /* {
    colKey: 'operation',
    title: '操作',
    width: 80,
    cell: (h, { row }) => {
      return (
        <t-space>
          <t-popconfirm
            content="确认保存修改吗"
            onConfirm={() => {
              deleteExercise(row);
            }}
          >
            <t-link
              variant="text"
              hover="color"
              theme="primary"
            >
              保存修改
            </t-link>
          </t-popconfirm>
        </t-space>
      );
    },
  }, */
];

export const visible = ref(false);
// const essayId = ref("")
export const rowReading = ref();
export const rowEssay = ref();
export const name = ref('');
export const id = ref('');
export const visibleDetail = ref(false);
export const readingId = ref('');
export const readingDetailContent = ref({ name: '', articlesList: [] });
export const loading = ref(false);
export const visibleEassy = ref(false);
export const articlesContent = ref({ title: '', exercisesList: [] });
export const exercises = ref({
  title: '',
  sentenceList: [],
  conetentList: [],
  translationList: [],
  audioList: [],
  videoList: [],
});
export const visibleExercise = ref(false);
export const rowExercise = ref();
export const redingId = ref('');
export const visibleModifyArticle = ref(false);

// 循环为列属性配置居中属性
for (let i = 0; i < columns.length; i++) {
  columns[i].align = 'center';
}
const store = useRenewDataStore();
1;
const handleDelete = async (row) => {
  loading.value = true;
  console.log('管理员长度', row.username);
  if (row.username === 'gglq913') {
    MessagePlugin.error('不能删除超级管理员');
  } else {
    try {
      console.log('删除的id', row.id);

      const res = await delete5({ id: row.id });
      console.log('删除后', res);
      loading.value = false;
      MessagePlugin.success('删除成功');

      store.renewData({ pageNumber: store.pagination.current, pageSize: store.pagination.pageSize });
    } catch (error) {
      console.log(error);
    }
  }
};

const detailCheck = async (row) => {
  console.log('管理员长度', row.username);
  if (row.username === 'gglq913') {
    MessagePlugin.error('不能删除超级管理员');
  } else {
    try {
      console.log('删除的id', row.id);

      const res = await delete5({ id: row.id });
      console.log('删除后', res);
      MessagePlugin.success('删除成功');

      store.renewData({ pageNumber: store.pagination.current, pageSize: store.pagination.pageSize });
    } catch (error) {
      console.log(error);
    }
  }
};

const edit = (row) => {
  visible.value = true;
  id.value = row.id;
  name.value = row.name;
};

export const readingDetail = (row) => {
  loading.value = true;
  rowReading.value = row;
  const params = {
    id: row.id,
  };
  get7(params).then((res) => {
    loading.value = false;
    visibleDetail.value = true;
    readingDetailContent.value = res.result;
    console.log('res', res);
  });
};

const deleteReading = (row) => {
  loading.value = true;
  const params = {
    id: row.id,
  };
  delete9(params).then((res) => {
    MessagePlugin.success('删除成功');
    readingDetail(rowReading.value);
  });
};

const deleteEssay = (row) => {
  loading.value = true;
  const params = {
    id: row.id,
  };
  delete7(params).then((res) => {
    MessagePlugin.success('删除成功');
    essayDetail(rowArticle.value);
  });
};

export const articleId = ref();
export const rowArticle = ref();

export const essayDetail = (row) => {
  // visibleEassy.value =
  rowArticle.value = row;
  loading.value = true;
  articleId.value = row.id;
  const params = {
    id: row.id,
  };
  get9(params).then((res) => {
    loading.value = false;
    articlesContent.value = res.result;
    visibleEassy.value = true;
  });
};

export const exercisesDetail = (row) => {
  loading.value = true;
  rowExercise.value = row;
  const params = {
    id: row.id,
  };
  get8(params).then((res) => {
    exercises.value = res.result;
    visibleExercise.value = true;
    loading.value = false;
  });
};

const saveContent = (row) => {
  loading.value = true;

  updateSentenceResource(row).then((res) => {
    MessagePlugin.success('修改成功');
    exercisesDetail(rowExercise.value);
    loading.value = false;
  });
};
const deleteExercise = (row) => {
  loading.value = true;
  const params = {
    id: row.id,
  };
  delete3(params).then((res) => {
    MessagePlugin.success('删除成功');
    exercisesDetail(rowExercise.value);
  });
};

export const rowModifyArticle = ref({
  title: '',
  readingMaterialId: '',
  introduction: '',
  picture: '',
  articleCount: '',
  id: '',
});

const modifyArticle = (row) => {
  visibleModifyArticle.value = true;
  // rowModifyArticle.value = row
  rowModifyArticle.value.articleCount = row.articleCount;
  rowModifyArticle.value.title = row.title;
  rowModifyArticle.value.readingMaterialId = row.readingMaterialId;
  rowModifyArticle.value.introduction = row.introduction;
  rowModifyArticle.value.picture = row.picture;
  rowModifyArticle.value.id = row.id;
};

export const visivleModifyExercise = ref(false);
export const modifyEx = ref({ articleId: '', title: '', id: '' });
export const exerciseModifyLevel = ref('');
export const exerciseModifyName = ref('');
export const rowModifySen = ref({ content: '', id: '', exercisesId: '', translation: '' });
export const visibleModifySen = ref(false);

const modifyExercise = (row) => {
  visivleModifyExercise.value = true;
  modifyEx.value = row;
  console.log('value', modifyEx.value.difficultyLevel);
};

const modifySen = (row) => {
  visibleModifySen.value = true;
  rowModifySen.value.id = row.id;
  rowModifySen.value.content = row.content;
  rowModifySen.value.exercisesId = row.exercisesId;
  rowModifySen.value.translation = row.translation;
};
