<!-- 客服管理 -->
<template>
  <div>
    <t-card>
      <t-space style="margin: 0 20px 20px 0">
        <add @add="AddFinsh"></add>
        <t-popconfirm content="确认删除吗" :on-confirm="handleMoreDelete">
          <t-button theme="danger"> 批量删除 </t-button>
        </t-popconfirm>
        <!-- 
        <t-select-input
          placeholder="请输入任意关键词"
          allow-input
          clearable
          style="width: 300px"
          @input-change="onInputChange"
        >
          <template #suffixIcon><search-icon /></template>
</t-select-input> -->
      </t-space>
      <t-table :row-key="index" :data="data" :columns="columns" table-layout="fixed" :bordered="true" size="small"
        :pagination="pagination" cell-empty-content="-" resizable :loading="isLoading" :hover="true"
        :show-sort-column-bg-color="true" right-fixed-column="1" :selected-row-keys="selectedRowKeys"
        @row-click="handleRowClick" @select-change="onSelectChange" @change="onChange">
      </t-table></t-card>

    <t-dialog theme="info" header="更改读物名称" @close="visible = false" @confirm="edit()" :visible.sync="visible">
      <t-input v-model="name"></t-input>
    </t-dialog>

    <t-dialog header="读物详情" width="1000px" @close="visibleDetail = false" :visible.sync="visibleDetail" :footer="false">
      <div style="font-size: 16px;margin-bottom: 20px;">读物类型：{{ readingDetailContent.name }}</div>
      <div style="display: flex;margin-bottom: 20px;">
        <t-button @click="visibleUploadArticle = true">上传文章</t-button>
        <t-popconfirm content="确认删除吗" :on-confirm="handleMoreDeleteReading">
          <t-button theme="danger"> 批量删除 </t-button>
        </t-popconfirm>
      </div>

      <div style="display: flex;justify-content: center;font-size: 16px;margin-bottom: 10px;">
        文章列表
      </div>

      <t-table :row-key="index" :data="readingDetailContent.articlesList" :columns="columnsReading" table-layout="fixed"
        :bordered="true" size="small" cell-empty-content="-" resizable :loading="isLoading" :hover="true"
        :show-sort-column-bg-color="true" right-fixed-column="1" :selected-row-keys="selectedRowKeysReading"
        @row-click="handleRowClick" @select-change="onSelectChangeReading">
        <template #picture="{ row }">
          <img :src=row.picture style="width: 100px;height: 120px;">
        </template>
      </t-table>
    </t-dialog>

    <t-dialog header="文章详情" width="1000px" @close="visibleEassy = false" :visible.sync="visibleEassy" :footer="false">
      <div style="font-size: 16px;margin-bottom: 20px;">文章名称：{{ articlesContent.title }}</div>
      <div style="display: flex;margin-bottom: 20px;">
        <t-button @click="visibleUploadExercise = true">上传练习</t-button>
        <t-popconfirm content="确认删除吗" :on-confirm="handleMoreDeleteExercise">
          <t-button theme="danger"> 批量删除 </t-button>
        </t-popconfirm>
      </div>
      <div style="display: flex;justify-content: center;font-size: 16px;margin-bottom: 10px;">
        练习列表
      </div>
      <t-table :row-key="index" :data="articlesContent.exercisesList" :columns="columnsEssay" table-layout="fixed"
        :bordered="true" size="small" cell-empty-content="-" resizable :loading="isLoading" :hover="true"
        :show-sort-column-bg-color="true" right-fixed-column="1" :selected-row-keys="selectedRowKeysEassy"
        @row-click="handleRowClick" @select-change="onSelectChangeEassy">
      </t-table>
    </t-dialog>

    <t-dialog header="练习详情" width="1200px" @close="visibleExercise = false" :visible.sync="visibleExercise"
      :footer="false">
      <div v-if="exercises.title" style="font-size: 16px;margin-bottom: 20px;">练习名称：{{ exercises.title }}</div>
      <div v-else style="font-size: 16px;margin-bottom: 20px;">暂无练习名称</div>
      <div style="display: flex;margin-bottom: 20px;">
        <t-button @click="visibleUploadSen = true">上传句子</t-button>
        <t-popconfirm content="确认删除吗" :on-confirm="handleMoreDeleteSen">
          <t-button theme="danger"> 批量删除 </t-button>
        </t-popconfirm>
      </div>
      <div style="display: flex;justify-content: center;font-size: 16px;margin-bottom: 10px;color: black;">句子列表</div>
      <t-table :row-key="index" :data="exercises.sentenceList" :columns="columnsExercise" table-layout="fixed"
        :bordered="true" size="small" cell-empty-content="-" resizable :loading="isLoading" :hover="true"
        :show-sort-column-bg-color="true" right-fixed-column="1" :selected-row-keys="selectedRowKeysSen"
        @row-click="handleRowClick" @select-change="onSelectChangeSen">
      </t-table>
    </t-dialog>

    <t-dialog header="上传文章" width="1000px" @close="closeArticle()" :visible.sync="visibleUploadArticle" :footer="false">
      <div style="padding-left: 50px;">
        <div style="display: flex;">
          <div>文章数量</div>
          <div style="width: 100px;margin-left: 20px;">
            <t-input v-model="articleCount" />
          </div>
        </div>

        <div style="display: flex;margin-top: 20px;">
          <div>文章介绍</div>
          <div style="width: 500px;margin-left: 20px;">
            <t-textarea v-model="articleIntroduction" placeholder="请输入文章介绍" name="description"
              :autosize="{ minRows: 3, maxRows: 10 }" />
          </div>
        </div>

        <div style="display: flex;margin-top: 20px;">
          <div>文章封面</div>
          <div style="width: 500px;margin-left: 20px;">
            <t-upload v-model="picture" action="/manager/manager/upload/file" theme="file"
              :headers="{ accessToken: accessToken }" :max="2" @onWaitingUploadFilesChange="console.log('发生变化')"
              @success="pictureUpload" @remove="removePicture" accept="image/*"></t-upload>
          </div>
        </div>

        <div style="display: flex;margin-top: 20px;">
          <div>文章标题</div>
          <div style="width: 300px;margin-left: 20px;">
            <t-input v-model="articleTitle" />
          </div>
        </div>
      </div>

      <div style="display: flex;justify-content: center;margin-top: 20px;">
        <t-button @click="articleUpload()" size="large">确认上传</t-button>
      </div>

    </t-dialog>

    <t-dialog header="修改文章" width="1000px" @close="closeArticleModify()" :visible.sync="visibleModifyArticle"
      :footer="false">
      <div style="padding-left: 50px;">
        <div style="display: flex;">
          <div>文章数量</div>
          <div style="width: 100px;margin-left: 20px;">
            <t-input v-model="rowModifyArticle.articleCount" />
          </div>
        </div>

        <div style="display: flex;margin-top: 20px;">
          <div>文章介绍</div>
          <div style="width: 500px;margin-left: 20px;">
            <t-textarea v-model="rowModifyArticle.introduction" placeholder="请输入文章介绍" name="description"
              :autosize="{ minRows: 3, maxRows: 10 }" />
          </div>
        </div>

        <div style="display: flex;margin-top: 20px;">
          <div>文章封面</div>
          <img style="width: 150px;height: 200px;margin-left: 20px;" :src=rowModifyArticle.picture>
        </div>

        <div style="display: flex;margin-top: 20px;">
          <div>文章封面</div>
          <div style="width: 500px;margin-left: 20px;">
            <t-upload v-model="pictureModify" action="/manager/manager/upload/file" theme="file"
              :headers="{ accessToken: accessToken }" :max="2" @onWaitingUploadFilesChange="console.log('发生变化')"
              @success="pictureModifyUpload" @remove="removePicture" accept="image/*"></t-upload>
          </div>
        </div>

        <div style="display: flex;margin-top: 20px;">
          <div>文章标题</div>
          <div style="width: 300px;margin-left: 20px;">
            <t-input v-model="rowModifyArticle.title" />
          </div>
        </div>
      </div>

      <div style="display: flex;justify-content: center;margin-top: 20px;">
        <t-button @click="articleUploadModify()" size="large">确认修改</t-button>
      </div>

    </t-dialog>

    <t-dialog header="上传练习" width="1000px" @close="closeExerciseUpload()" :visible.sync="visibleUploadExercise"
      :footer="false">
      <div style="padding-left: 50px;">
        <div style="display: flex;">
          <div>练习名称：</div>
          <div style="width: 100px;margin-left: 20px;">
            <t-input v-model="exerciseTitle" />
          </div>
        </div>

        <div style="display: flex;margin-top: 20px;">
          <div>练习难度：</div>
          <div style="margin-left: 20px;">
            <t-radio-group variant="primary-filled" :defaultValue=defaultValue @change="radioChange">
              <t-radio-button value="EASY">easy</t-radio-button>
              <t-radio-button value="MIDDLE">middle</t-radio-button>
              <t-radio-button value="HARD">hard</t-radio-button>
            </t-radio-group>
          </div>

        </div>
      </div>

      <div style="display: flex;justify-content: center;margin-top: 20px;">
        <t-button @click="exerciseUpload()" size="large">确认上传</t-button>
      </div>

    </t-dialog>

    <t-dialog header="修改练习" width="1000px" @close="closeExerciseModify()" :visible.sync="visivleModifyExercise"
      :footer="false">
      <div style="padding-left: 50px;">
        <div style="display: flex;">
          <div>练习名称：</div>
          <div style="width: 400px;margin-left: 20px;">
            <t-input v-model="exerciseModifyName" />
          </div>
        </div>

        <div style="display: flex;margin-top: 20px;">
          <div>练习难度：</div>
          <div style="margin-left: 20px;display: flex;">
            <div @click="levelChange('EASY')" :class="(exerciseModifyLevel == 'EASY') ? 'choose' : 'unchoose'">easy
            </div>
            <div @click="levelChange('MIDDLE')" :class="(exerciseModifyLevel == 'MIDDLE') ? 'choose' : 'unchoose'"
              style="margin-left: 10px;">
              middle</div>
            <div @click="levelChange('HARD')" :class="(exerciseModifyLevel == 'HARD') ? 'choose' : 'unchoose'"
              style="margin-left: 10px;">hard</div>
          </div>

        </div>
      </div>

      <div style="display: flex;justify-content: center;margin-top: 20px;">
        <t-button @click="exerciseUploadModify()" size="large">确认修改</t-button>
      </div>

    </t-dialog>

    <t-dialog header="上传句子" width="1000px" @close="closeSenUpload()" :visible.sync="visibleUploadSen" :footer="false">
      <div style="padding: 20px;">
        <div style="display: flex;">
          <div>句子内容</div>
          <div style="margin-left: 20px;width: 400px;">
            <t-textarea v-model="senUploadCon" placeholder="请输入句子内容" name="description"
              :autosize="{ minRows: 3, maxRows: 10 }"></t-textarea>
          </div>
        </div>

        <div style="margin-top: 20px;display: flex;">
          <div>句子翻译</div>
          <div style="margin-left: 20px;width: 400px;">
            <t-textarea v-model="senUploadTran" placeholder="请输入句子翻译" name="description"
              :autosize="{ minRows: 3, maxRows: 10 }"></t-textarea>
          </div>
        </div>

        <div style="display: flex;justify-content: center;margin-top: 20px;">
          <t-button @click="senUpload()">确认上传</t-button>
        </div>

      </div>

    </t-dialog>

    <t-dialog header="修改句子" width="1000px" @close="closeSenModify()" :visible.sync="visibleModifySen" :footer="false">
      <div style="padding: 20px;">
        <div style="display: flex;">
          <div>句子内容</div>
          <div style="margin-left: 20px;width: 400px;">
            <t-textarea v-model="rowModifySen.content" placeholder="请输入句子内容" name="description"
              :autosize="{ minRows: 3, maxRows: 10 }"></t-textarea>
          </div>
        </div>

        <div style="margin-top: 20px;display: flex;">
          <div>句子翻译</div>
          <div style="margin-left: 20px;width: 400px;">
            <t-textarea v-model="rowModifySen.translation" placeholder="请输入句子翻译" name="description"
              :autosize="{ minRows: 3, maxRows: 10 }"></t-textarea>
          </div>
        </div>

        <div style="display: flex;justify-content: center;margin-top: 20px;">
          <t-button @click="senModify()">确认修改</t-button>
        </div>

      </div>

    </t-dialog>

    <t-loading :loading="loading" text="加载中..." fullscreen />
  </div>
</template>

<script lang="tsx">
export default {
  name: 'AdminManager',
};
</script>
<script setup lang="tsx">
// import { SearchIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, reactive, ref } from 'vue';

// import { delete21, page10 } from '@/api/user/guanliyuan';
import { useRenewDataStore } from '@/store/renewData';

import {
  columns, visible, name, visibleDetail, readingDetailContent, readingId, loading, rowEssay, rowReading,
  readingDetail, id, articlesContent, columnsReading, columnsEssay, visibleEassy, visibleExercise, exercises, columnsExercise,
  visibleModifyArticle, rowModifyArticle, articleId, rowArticle, exercisesDetail, essayDetail, visivleModifyExercise, modifyEx, exerciseModifyLevel,
  exerciseModifyName, rowExercise, visibleModifySen, rowModifySen
} from './columnData';
import Add from './components/Add.vue';
import { delete4, page, update6 } from '@/api/user/readingMaterials';
import { delete8, save9, update8 } from '@/api/user/articles';
import { delete6, save8, update7 } from '@/api/user/exercises';
import { delete2, save3, update1 } from '@/api/user/sentence';
import { number } from 'echarts';

// 挂载时调用请求函数
onMounted(async () => {
  accessToken.value = localStorage.getItem('accessToken');
  queryData({
    pageNumber: pagination.current,
    pageSize: pagination.pageSize,
  });
  store.renewData = queryData; // 挂载时，将请求函数给pinia
  store.pagination.current = pagination.current; // 分页数据也一起给
  store.pagination.pageSize = pagination.pageSize;
});
const querySave = reactive({
  sort: '',
  order: null,
});
const index = ref();
const data = ref([]);
const isLoading = ref(false);
const store = useRenewDataStore();
const selectedRowKeysReading = ref([])
const selectedRowKeysEassy = ref([])
const selectedRowKeysExercise = ref([])
const selectedRowKeysSen = ref([])
const articleCount = ref("0")
const articleIntroduction = ref("")
const picture = ref([])
const articlePicture = ref("")
const articleTitle = ref("")
const readingMaterialId = ref("")
const visibleUploadArticle = ref(false)
const accessToken = ref<string | null>();
const articleCountModify = ref("0")
const articleIntroductionModify = ref("")
const pictureModify = ref([])
const articlePictureModify = ref("")
const articleTitleModify = ref("")
const visibleUploadExercise = ref(false)
const exerciseTitle = ref("")
const defaultValue = ref("EASY")
const exerciseLevel = ref("EASY")
const visibleUploadSen = ref(false)
const senUploadCon = ref("")
const senUploadTran = ref("")

const cencel = () => {
  visible.value = false

}

// const name = ref("")

// 请求数据
const queryData = async (paginationInfo?, searchVo?, entityInfo?) => {
  try {
    isLoading.value = true;
    console.log('请求', entityInfo, paginationInfo);
    const res = await page({ entity: null, searchVo, page: paginationInfo }); // 在此发送请求
    console.log('数据已送达', res);

    data.value = res.result; // 获得表格数据
    pagination.total = res.result.length; // 数据加载完成，设置数据总条数
    store.renewData = queryData;
  } catch (err) {
    console.log(err);
  }
  isLoading.value = false;
};
const selectedRowKeys = ref([]);

const handleMoreDelete = async () => {
  try {
    const ids = selectedRowKeys.value.join(); // 提取数组里面的字符串
    if (ids === '') {
      MessagePlugin.error('未勾选删除项');
    } else {
      const res = await delete4({ ids });
      console.log('批量删除后', res);
      queryData({
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
      });
      MessagePlugin.success('删除成功');
      selectedRowKeys.value = []
    }
  } catch (error) {
    console.log(error);
  }
};

const handleMoreDeleteReading = async () => {
  try {
    const ids = selectedRowKeysReading.value.join(); // 提取数组里面的字符串
    if (ids === '') {
      MessagePlugin.error('未勾选删除项');
    } else {
      const res = await delete8({ ids });
      console.log('批量删除后', res);
      readingDetail(rowReading.value)
      // console.log('rowEaasy', );
      MessagePlugin.success('删除成功');
      selectedRowKeysReading.value = []
    }
  } catch (error) {
    console.log(error);
  }
};

const handleMoreDeleteEassy = async () => {
  try {
    const ids = selectedRowKeysExercise.value.join(); // 提取数组里面的字符串
    if (ids === '') {
      MessagePlugin.error('未勾选删除项');
    } else {
      const res = await delete6({ ids });
      console.log('批量删除后', res);
      // essayDetail(rowArticle.value)

      // console.log('rowEaasy', );
      MessagePlugin.success('删除成功');
      selectedRowKeysExercise.value = []
    }
  } catch (error) {
    console.log(error);
  }
};

const handleMoreDeleteExercise = async () => {
  try {
    const ids = selectedRowKeysEassy.value.join(); // 提取数组里面的字符串
    if (ids === '') {
      MessagePlugin.error('未勾选删除项');
    } else {
      const res = await delete6({ ids });
      // console.log('批量删除后', res);
      // console.log('rowEaasy', );
      // exercisesDetail(rowExercise.value)
      essayDetail(rowArticle.value)
      MessagePlugin.success('删除成功');
      selectedRowKeysEassy.value = []

    }
  } catch (error) {
    console.log(error);
  }
};

const handleMoreDeleteSen = async () => {
  try {
    const ids = selectedRowKeysSen.value.join(); // 提取数组里面的字符串
    if (ids === '') {
      MessagePlugin.error('未勾选删除项');
    } else {
      const res = await delete2({ ids });
      // console.log('批量删除后', res);
      // console.log('rowEaasy', );
      // exercisesDetail(rowExercise.value)
      exercisesDetail(rowExercise.value)
      MessagePlugin.success('删除成功');
      selectedRowKeysSen.value = []
    }
  } catch (error) {
    console.log(error);
  }
};

// 行选中变化时
const onSelectChange = (value, params) => {
  selectedRowKeys.value = value;
};

const onSelectChangeReading = (value, params) => {
  selectedRowKeysReading.value = value;
};

const onSelectChangeEassy = (value, params) => {
  selectedRowKeysEassy.value = value;
}

const onSelectChangeExercise = (value, params) => {
  selectedRowKeysExercise.value = value;
}

const onSelectChangeSen = (value, params) => {
  selectedRowKeysSen.value = value;
}

const handleRowClick = (e) => {
  console.log(e);
};
// 排序、分页、过滤等发生变化时会出发 change 事件
const onChange = (info, context) => {
  console.log('change', info.sorter, context.trigger);

  if (context.trigger === 'sorter') {
    if (info.sorter === undefined) {
      querySave.sort = '';
      querySave.order = null;
      queryData({
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
      });
    } else {
      querySave.sort = info.sorter.sortBy;
      querySave.order = info.sorter.descending;
      queryData({
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
        sort: querySave.sort,
        order: querySave.order === false ? 'asc' : 'desc',
      });
    }
  }
};

const edit = async () => {
  // if (data.value.length === 1) {
  //   MessagePlugin.error('至少保留一位管理员');
  // } else {
  try {

    if (name.value == '') {
      MessagePlugin.error('读物名称不能为空');
    } else {
      const params = {
        id: id.value,
        name: name.value
      }
      const res = await update6(params);
      console.log('批量删除后', res);
      queryData({
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
      });
      MessagePlugin.success('更改成功');
      visible.value = false
    }
  } catch (error) {
    console.log(error);
  }
  // }
};
// 搜索框
// const onInputChange = (keyword) => {
//   console.log(keyword);
// };

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 10,
  showJumper: true,
  onChange: (pageInfo) => {
    pagination.current = pageInfo.current;
    pagination.pageSize = pageInfo.pageSize;
    store.pagination.current = pagination.current; // 分页数据也一起给
    store.pagination.pageSize = pagination.pageSize;
    queryData({
      pageNumber: pagination.current,
      pageSize: pagination.pageSize,
    }); // 分页数据改变时调用请求函数
    console.log('pagination.onChange', pageInfo);
  },
});

const AddFinsh = (newData) => {
  console.log(newData);
  queryData({
    pageNumber: pagination.current,
    pageSize: pagination.pageSize,
  });
};

const pictureUpload = (value) => {
  articlePicture.value = value.response.result.url
  console.log('articlePicture', articlePicture.value)
}

const pictureModifyUpload = (value) => {
  rowModifyArticle.value.picture = value.response.result.url
  console.log('articlePicture', articlePicture.value)
}

const removePicture = () => {
  picture.value = []
}



const articleUpload = () => {
  loading.value = true
  const params = {
    articleCount: Number(articleCount.value),
    introduction: articleIntroduction.value,
    picture: articlePicture.value,
    title: articleTitle.value,
    readingMaterialId: rowReading.value.id
  }
  save9(params).then((res) => {
    loading.value = false
    readingDetail(rowReading.value)
    closeArticle()

  })
}

const closeArticle = () => {
  visibleUploadArticle.value = false
  articleCount.value = ""
  articleIntroduction.value = ""
  articlePicture.value = ""
  picture.value = []
  articleTitle.value = ""
}

const closeArticleModify = () => {
  visibleModifyArticle.value = false
  pictureModify.value = []
}

const articleUploadModify = () => {
  loading.value = true
  const params = {
    articleCount: Number(rowModifyArticle.value.articleCount),
    introduction: rowModifyArticle.value.introduction,
    picture: rowModifyArticle.value.picture,
    title: rowModifyArticle.value.title,
    readingMaterialId: rowModifyArticle.value.readingMaterialId,
    id: rowModifyArticle.value.id
  }
  update8(params).then((res) => {
    loading.value = false
    closeArticleModify()
    readingDetail(rowReading.value)
  })
}

const exerciseUploadModify = () => {
  loading.value = true
  const params = {
    articleId: modifyEx.value.articleId,
    title: exerciseModifyName.value,
    difficultyLevel: exerciseModifyLevel.value,
    id: modifyEx.value.id
  }
  update7(params).then((res) => {
    loading.value = false
    essayDetail(rowArticle.value)
    // closeExerxciseUpload()
    closeExerciseModify()
    MessagePlugin.success("练习上传成功")
  })
}

const exerciseUpload = () => {
  loading.value = true
  const params = {
    articleId: articleId.value,
    title: exerciseTitle.value,
    difficultyLevel: exerciseLevel.value,
  }
  save8(params).then((res) => {
    loading.value = false
    essayDetail(rowArticle.value)
    // closeExerxciseUpload()
    closeExerciseUpload()
    MessagePlugin.success("练习上传成功")
  })
}

const exercisesUpload = () => {

}

const closeExerciseUpload = () => {
  visibleUploadExercise.value = false
  exerciseTitle.value = ""
  defaultValue.value = "EASY"
  exerciseLevel.value = "EASY"
}

const radioChange = (value) => {
  exerciseLevel.value = value
}

const closeExerciseModify = () => {
  visivleModifyExercise.value = false

}

const closeSenUpload = () => {
  visibleUploadSen.value = false
  senUploadCon.value = ""
  senUploadTran.value = ""
}

const closeSenModify = () => {
  visibleModifySen.value = false
}

const levelChange = (level) => {
  exerciseModifyLevel.value = level
}

const senUpload = () => {
  loading.value = true
  const params = {
    exercisesId: rowExercise.value.id,
    content: senUploadCon.value,
    translation: senUploadTran.value,
  }
  save3(params).then(() => {
    MessagePlugin.success("句子修改成功")
    loading.value = false
    exercisesDetail(rowExercise.value)
    closeSenUpload()
  })
}

const senModify = () => {
  loading.value = true
  const params = {
    id: rowModifySen.value.id,
    exercisesId: rowModifySen.value.exercisesId,
    content: rowModifySen.value.content,
    translation: rowModifySen.value.translation,
  }
  update1(params).then(() => {
    MessagePlugin.success("句子上传成功")
    loading.value = false
    exercisesDetail(rowExercise.value)
    closeSenModify()
  })
}
</script>

<style lang="less" scoped>
.choose {
  width: 68px;
  height: 28px;
  line-height: 26px;
  background-color: #0052d9;
  display: flex;
  justify-content: center;
  color: #ffffff;
  border-radius: 12px;
  cursor: pointer;
}

.unchoose {
  width: 68px;
  height: 28px;
  line-height: 26px;
  background-color: #e8e8e8;
  display: flex;
  justify-content: center;
  border-radius: 12px;
  cursor: pointer;
}
</style>
