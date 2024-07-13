<template>
  <div>
    <div style="display: flex; justify-content: space-around">
      <div style="display: flex; justify-content: center; margin-bottom: 10px">
        <t-button size="large" @click="visibleExcel = true">
          excel表格上传
        </t-button>
      </div>
      <div style="display: flex; justify-content: center; margin-bottom: 20px">
        <t-button size="large" @click="visibleNewWord = true">单词搜索</t-button>
      </div>

      <div style="display: flex; justify-content: center; margin-bottom: 20px">
        <t-button theme="primary" size="large" @click="getMenusList">管理一级目录</t-button>
      </div>

      <div style="display: flex; justify-content: center; margin-bottom: 20px">
        <t-button size="large" @click="visibleBatch = true">批量上传资源</t-button>
      </div>
    </div>

    <!--    <t-card>
      <div style="display: grid">
        <div style="display: flex; justify-content: center; margin-bottom: 20px; font-size: 16px">一级目录查询</div>
        <div style="display: flex; justify-content: center">
          <div>请选择要查询的一级目录</div>
          <div style="width: 400px; margin-left: 20px; margin-right: 20px">
            <t-select
              v-model="menusChoose"
              placeholder="无"
            >
              <t-option
                v-for="item in menusListData"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </t-select>
          </div>
          <t-button @click="remake">重置</t-button>
          <t-button @click="inquire">查询</t-button>
        </div>
      </div>
    </t-card>-->

    <t-dialog v-model:visible="visibleExcel" width=" 500px" theme="info" header="excel表格上传" :footer="false"
      @close="closeExcel()" @confirm="">
      <div style="font-size: 14px; font-weight: 700; justify-content: center; display: flex">批量导入单词</div>
      <!--     <div style="width: 300px; display: flex; margin-bottom: 30px; justify-content: space-around; margin-top: 10px">
       <div style="line-height: 30px">bookId:</div>
        <div>
          <t-input
            v-model="excelBookId"
            placeholder="请先输入bookId"
          ></t-input>
        </div>
      </div>-->
      <div>
        <div style="margin: 20px 0; display: flex; justify-content: center">
          <t-upload v-model="excel" action="/manager/manager/book/uploadWordByExcel" theme="file" :draggable="draggable"
            :headers="{ accessToken: accessToken }" :max="1" :auto-upload="false" :data="{ bookId: excelBookId }"
            @success="handleuploadExcel" @fail="excelFail" @onRemove="removeExcel()"></t-upload>
        </div>
      </div>
      <hr class="hr-twill" />
      <div style="
          font-size: 14px;
          font-weight: 700;
          justify-content: center;
          display: flex;
          margin-top: 50px;
          border: soild 1px #aaaaaa;
        ">
        批量导入词根
      </div>
      <div style="margin-top: 20px; display: flex; justify-content: center">
        <t-upload v-model="rootExcel" action="/manager/manager/book/uploadWordRoot" theme="file" :draggable="draggable"
          :headers="{ accessToken: accessToken }" :max="1" :auto-upload="false" @success="handleuploadExcel"
          @onRemove="removeExcel()"></t-upload>
      </div>
    </t-dialog>

    <t-tabs placement="left" size="large" :value="menusChoose" @change="(e) => {
      menusChoose = e;
      inquire();
    }
      ">
      <t-tab-panel v-for="(item, index2) in menusListData" :key="index2" :value="item.id" :label="item.name">
        <t-table :row-key="index" :data="data" :columns="columns" resizable table-layout="fixed" :bordered="true"
          size="small" :pagination="pagination" :filter-row="null" drag-sort="row-handler" cell-empty-content="-"
          :loading="isLoading" :selected-row-keys="selectedRowKeys" @drag-sort="(e) => bookSort(e)"
          @row-click="handleRowClick" @filter-change="filterChange" @change="onChange">
          <template #url="{ row }">
            <img :src="row.url" style="width: 80px; height: 110px" />
          </template>
        </t-table>
      </t-tab-panel>
    </t-tabs>

    <t-dialog v-model:visible="visible" width="500px" theme="info" header="词组列表" :footer="false" @close="close()">
      <div style="display: flex; justify-content: center; margin-bottom: 20px">
        <t-button size="large" @click="visibleNewWord = true">新增/修改单词</t-button>
      </div>
      <t-card>
        <t-table :row-key="index" :data="data2" :columns="columns2" resizable table-layout="fixed" :bordered="true"
          size="small" :filter-row="null" cell-empty-content="-" :selected-row-keys="selectedRowKeys"
          :loading="isLoading2" @filter-change="onFilterChange" @change="onChange">
        </t-table>
      </t-card>
    </t-dialog>

    <t-dialog v-model:visible="visible2" width="800px" theme="info" header="词组详情" :footer="false"
      @close="visible2 = false">
      <t-card>
        <t-table :row-key="index" :data="data3" :columns="columns3" resizable table-layout="fixed" :bordered="true"
          size="small" :filter-row="null" cell-empty-content="-" :selected-row-keys="selectedRowKeys"
          @filter-change="onFilterChange" @change="onChange">
        </t-table>
      </t-card>
    </t-dialog>

    <t-dialog v-model:visible="visible3" width="800px" theme="info" header="单词详情" :footer="false" @close="close2()">
      <t-card>
        <t-space style="margin: 0 20px 20px 0">
          <!-- <add @add="AddFinsh"></add> -->
          <t-popconfirm content="确认删除吗" :on-confirm="handleMoreDelete">
            <t-button theme="danger"> 批量删除 </t-button>
          </t-popconfirm>
        </t-space>

        <t-table :row-key="index" :data="data5" :columns="columns4" resizable table-layout="fixed" :bordered="true"
          size="small" :filter-row="null" cell-empty-content="-" :selected-row-keys="selectedRowKeys"
          :loading="isLoading3" @select-change="onSelectChange" @filter-change="onFilterChange" @change="onChange">
        </t-table>
      </t-card>
    </t-dialog>

    <div v-if="allLoading">
      <t-loading size="medium" text="加载中" fullscreen></t-loading>
    </div>

    <t-dialog key="11" v-model:visible="visibleNewWord" width="1000px" theme="info" header="单词搜索" :footer="false"
      @close="newWordClose()">
      <div style="display: flex; justify-content: center; margin-bottom: 20px">
        <t-input v-model="searchWord" placeholder="请输入要搜索的单词" :style="{ width: '300px' }"
          @enter="wordSearch()"></t-input>
        <div style="margin-left: 5px">
          <t-button @click="wordSearch()">搜索</t-button>
        </div>
      </div>
      <!--      <div style="display: flex; justify-content: center; margin-bottom: 10px">
        <t-link
          theme="primary"
          @click="visibleWordAdd = true"
          >没有搜索到想要添加的单词？点击这里添加</t-link
        >
      </div>-->

      <t-table :row-key="index" :data="searchRes" :columns="columnsWordSearch" resizable table-layout="fixed"
        :bordered="true" size="small" :filter-row="null" cell-empty-content="-" :selected-row-keys="selectedRowKeys"
        :loading="isloadingBook" @filter-change="onFilterChange">
      </t-table>
    </t-dialog>

    <t-dialog v-model:visible="visibleWordAdd" width="800px" theme="info" header="自定义添加单词" :footer="false"
      @close="visibleWordAdd = false">
      <div style="display: flex; justify-content: space-around">
        <div style="font-size: 14px; line-height: 30px">请输入需要添加的单词全拼</div>
        <t-input v-model="addWord1" placeholder="请输入要添加的单词" :style="{ width: '300px' }"></t-input>
      </div>
      <div style="display: flex; justify-content: center; margin-top: 20px">
        <t-button @click="uploadWord()">添加</t-button>
      </div>
    </t-dialog>

    <t-dialog key="12" v-model:visible="visible4" width="1000px" theme="info" header="单词属性详情" :footer="false"
      @close="close3()">
      <div style="font-size: 18px; font-weight: 700">单词拼写：{{ word }}</div>
      <div style="display: flex; justify-content: center; margin-top: 20px; font-size: 20px; font-weight: 700">
        同源树
      </div>
      <div style="margin-left: 86%; margin-bottom: 10px"><t-button @click="modify(1)">添加同源树</t-button></div>
      <div v-if="data6">
        <div v-if="data6.relWord">
          <t-table :row-key="index" :data="data6.relWord.rels" :columns="columnsrels" resizable table-layout="fixed"
            :bordered="true" size="small" :filter-row="null" cell-empty-content="-" :selected-row-keys="selectedRowKeys"
            :loading="isLoading3" @filter-change="onFilterChange" @change="onChange">
            <template #words="{ row }">
              <div v-for="item in row.words">
                <div style="display: flex">
                  <p>{{ item.hwd }}</p>
                  <p style="margin-left: 10px">翻译：{{ item.tran }}</p>
                </div>
              </div>
            </template>
          </t-table>
        </div>
        <div v-else>
          <div style="display: flex; justify-content: center">
            <img src="https://stickyfinger.oss-cn-guangzhou.aliyuncs.com/null5dc984f6d7d2418abc61ea0890fc81b0.png"
              style="width: 100px; height: 100px" />
          </div>
          <div style="display: flex; justify-content: center; color: #b5b8bdd8; margin-bottom: 40px">
            该单词暂无同源树
          </div>
        </div>
      </div>
      <div v-else>
        <div style="display: flex; justify-content: center">
          <img src="https://stickyfinger.oss-cn-guangzhou.aliyuncs.com/null5dc984f6d7d2418abc61ea0890fc81b0.png"
            style="width: 100px; height: 100px" />
        </div>
        <div style="display: flex; justify-content: center; color: #b5b8bdd8; margin-bottom: 40px">
          该单词暂无同源树
        </div>
      </div>

      <div style="display: flex; justify-content: center; font-size: 20px; font-weight: 700; margin-top: 20px">
        例句
      </div>
      <div style="margin-left: 88%; margin-bottom: 10px"><t-button @click="modify(2)">添加例句</t-button></div>
      <div v-if="data6">
        <div v-if="data6.sentence">
          <t-table :row-key="index" :data="data6.sentence.sentences" :columns="columnsSen" resizable
            table-layout="fixed" :bordered="true" size="small" :filter-row="null" cell-empty-content="-"
            :selected-row-keys="selectedRowKeys" :loading="isLoading3" @filter-change="onFilterChange"
            @change="onChange">
          </t-table>
        </div>
        <div v-else>
          <div style="display: flex; justify-content: center">
            <img src="https://stickyfinger.oss-cn-guangzhou.aliyuncs.com/null5dc984f6d7d2418abc61ea0890fc81b0.png"
              style="width: 100px; height: 100px" />
          </div>
          <div style="display: flex; justify-content: center; color: #b5b8bdd8; margin-bottom: 40px">
            该单词暂无例句
          </div>
        </div>
      </div>

      <div v-else>
        <div style="display: flex; justify-content: center">
          <img src="https://stickyfinger.oss-cn-guangzhou.aliyuncs.com/null5dc984f6d7d2418abc61ea0890fc81b0.png"
            style="width: 100px; height: 100px" />
        </div>
        <div style="display: flex; justify-content: center; color: #b5b8bdd8; margin-bottom: 40px">该单词暂无例句</div>
      </div>

      <div style="display: flex; justify-content: center; margin-top: 20px; font-size: 20px; font-weight: 700">
        翻译
      </div>
      <div style="margin-left: 88%; margin-bottom: 10px"><t-button @click="modify(3)">添加翻译</t-button></div>
      <div v-if="data6">
        <div v-if="data6.trans">
          <t-table :row-key="index" :data="data6.trans" :columns="columnsTran" resizable table-layout="fixed"
            :bordered="true" size="small" :filter-row="null" cell-empty-content="-" :selected-row-keys="selectedRowKeys"
            :loading="isLoading3" @filter-change="onFilterChange" @change="onChange">
          </t-table>
        </div>
        <div v-else>
          <div style="display: flex; justify-content: center">
            <img src="https://stickyfinger.oss-cn-guangzhou.aliyuncs.com/null5dc984f6d7d2418abc61ea0890fc81b0.png"
              style="width: 100px; height: 100px" />
          </div>
          <div style="display: flex; justify-content: center; color: #b5b8bdd8; margin-bottom: 40px">
            该单词暂无翻译
          </div>
        </div>
      </div>

      <div v-else>
        <div style="display: flex; justify-content: center">
          <img src="https://stickyfinger.oss-cn-guangzhou.aliyuncs.com/null5dc984f6d7d2418abc61ea0890fc81b0.png"
            style="width: 100px; height: 100px" />
        </div>
        <div style="display: flex; justify-content: center; color: #b5b8bdd8; margin-bottom: 40px">该单词暂无翻译</div>
      </div>

      <div style="display: flex; justify-content: center; margin-top: 20px; font-size: 20px; font-weight: 700">
        短语
      </div>
      <div style="margin-left: 88%; margin-bottom: 10px"><t-button @click="modify(4)">添加短语</t-button></div>
      <div v-if="data6">
        <div v-if="data6.phrase">
          <t-table :row-key="index" :data="data6.phrase.phrases" :columns="columnsPrase" resizable table-layout="fixed"
            :bordered="true" size="small" :filter-row="null" cell-empty-content="-" :selected-row-keys="selectedRowKeys"
            :loading="isLoading3" @filter-change="onFilterChange" @change="onChange">
          </t-table>
        </div>
        <div v-else>
          <div style="display: flex; justify-content: center">
            <img src="https://stickyfinger.oss-cn-guangzhou.aliyuncs.com/null5dc984f6d7d2418abc61ea0890fc81b0.png"
              style="width: 100px; height: 100px" />
          </div>
          <div style="display: flex; justify-content: center; color: #b5b8bdd8; margin-bottom: 40px">
            该单词暂无短语
          </div>
        </div>
      </div>
      <div v-else>
        <div style="display: flex; justify-content: center">
          <img src="https://stickyfinger.oss-cn-guangzhou.aliyuncs.com/null5dc984f6d7d2418abc61ea0890fc81b0.png"
            style="width: 100px; height: 100px" />
        </div>
        <div style="display: flex; justify-content: center; color: #b5b8bdd8; margin-bottom: 40px">该单词暂无短语</div>
      </div>

      <div style="display: flex; justify-content: center; margin-top: 20px; font-size: 20px; font-weight: 700">
        近义词
      </div>
      <div style="margin-left: 86%; margin-bottom: 10px"><t-button @click="modify(5)">添加近义词</t-button></div>
      <div v-if="data6">
        <div v-if="data6.syno">
          <t-table :row-key="index" :data="data6.syno.synos" :columns="columnsSyno" resizable table-layout="fixed"
            :bordered="true" size="small" :filter-row="null" cell-empty-content="-" :selected-row-keys="selectedRowKeys"
            :loading="isLoading3" @filter-change="onFilterChange" @change="onChange">
            <template #hwds="{ row }">
              <div v-for="item in row.hwds">
                <div style="display: flex">
                  <p>{{ item.w }}</p>
                </div>
              </div>
            </template>
          </t-table>
        </div>
        <div v-else>
          <div style="display: flex; justify-content: center">
            <img src="https://stickyfinger.oss-cn-guangzhou.aliyuncs.com/null5dc984f6d7d2418abc61ea0890fc81b0.png"
              style="width: 100px; height: 100px" />
          </div>
          <div style="display: flex; justify-content: center; color: #b5b8bdd8; margin-bottom: 40px">
            该单词暂无近义词
          </div>
        </div>
      </div>

      <div v-else>
        <div style="display: flex; justify-content: center">
          <img src="https://stickyfinger.oss-cn-guangzhou.aliyuncs.com/null5dc984f6d7d2418abc61ea0890fc81b0.png"
            style="width: 100px; height: 100px" />
        </div>
        <div style="display: flex; justify-content: center; color: #b5b8bdd8; margin-bottom: 40px">
          该单词暂无近义词
        </div>
      </div>

      <div style="display: flex; justify-content: center; margin-top: 20px">
        <t-button size="large" @click="modifyData6()">修改确认</t-button>
      </div>
    </t-dialog>

    <t-dialog v-model:visible="visible5" width="800px" theme="info" header="修改" :footer="false" @close="close4()">
      <div v-if="keyWord == 1">
        <div v-if="data6.relWord.rels[arrIndex]">
          <div style="display: flex">
            <div style="width: 50px; line-height: 30px">分类</div>
            <t-input v-model="data6.relWord.rels[arrIndex].pos" :style="{ width: '600px' }"
              placeholder="请输入分类:如n.;adj.;adv.;v.;" />
          </div>

          <div v-for="(item, index) in data6.relWord.rels[arrIndex].words">
            <div style="display: flex; margin-top: 20px">
              <div style="width: 50px; line-height: 30px">单词{{ index + 1 }}</div>
              <t-input v-model="item.hwd" :style="{ width: '250px' }" placeholder="请输入单词" />
              <div style="width: 100px; line-height: 30px; margin-left: 30px">单词{{ index + 1 }}翻译：</div>
              <t-input v-model="item.tran" :style="{ width: '200px' }" placeholder="请输入对应翻译" />
            </div>
          </div>
        </div>
      </div>

      <div v-if="keyWord == 2">
        <div v-if="data6.sentence.sentences[arrIndex]">
          <div style="display: flex">
            <div style="line-height: 30px; margin-right: 20px">例句:</div>
            <t-input v-model="data6.sentence.sentences[arrIndex].scontent" :style="{ width: '600px' }"
              placeholder="请输入单词" />
          </div>
          <div style="display: flex; margin-top: 20px">
            <div style="line-height: 30px; margin-right: 20px">翻译</div>
            <t-input v-model="data6.sentence.sentences[arrIndex].scn" :style="{ width: '600px' }" placeholder="请输入单词" />
          </div>
        </div>
      </div>

      <div v-if="keyWord == 3">
        <div v-if="data6.trans[arrIndex]">
          <div style="display: flex">
            <div style="line-height: 30px; margin-right: 20px">翻译：</div>
            <t-input v-model="data6.trans[arrIndex].tranCn" :style="{ width: '600px' }" placeholder="请输入单词" />
          </div>
        </div>
      </div>

      <div v-if="keyWord == 4">
        <div v-if="data6.phrase.phrases[arrIndex]">
          <div style="display: flex">
            <div style="line-height: 30px; margin-right: 20px">短语:</div>
            <t-input v-model="data6.phrase.phrases[arrIndex].pcontent" :style="{ width: '600px' }"
              placeholder="请输入单词" />
          </div>
          <div style="display: flex; margin-top: 20px">
            <div style="line-height: 30px; margin-right: 20px">翻译：</div>
            <t-input v-model="data6.phrase.phrases[arrIndex].pcn" :style="{ width: '600px' }" placeholder="请输入单词" />
          </div>
        </div>
      </div>

      <div v-if="keyWord == 5">
        <div v-if="data6.syno.synos[arrIndex]">
          <div style="display: flex">
            <div style="line-height: 30px; margin-right: 20px">词性:</div>
            <t-input v-model="data6.syno.synos[arrIndex].pos" :style="{ width: '100px' }" placeholder="请输入单词" />
          </div>
          <div style="display: flex; margin-top: 20px">
            <div style="line-height: 30px; margin-right: 20px">对应词义：</div>
            <t-input v-model="data6.syno.synos[arrIndex].tran" :style="{ width: '460px' }" placeholder="请输入单词" />
          </div>
          <div style="margin-top: 20px">
            <div style="line-height: 30px; margin-right: 20px">词组列表</div>
            <div v-for="(item, index) in data6.syno.synos[arrIndex].hwds">
              <div style="display: flex; margin-top: 20px">
                <div style="line-height: 25px; margin-right: 20px">词组{{ index + 1 }}</div>
                <t-input v-model="item.w" :style="{ width: '300px' }" placeholder="请输入单词" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </t-dialog>

    <t-dialog v-model:visible="visibleModify" width="800px" theme="info" header="新增内容" :footer="false"
      @close="visibleModify = false">
      <div v-if="modifyBool == 1">
        <div style="display: flex; justify-content: center; font-size: 18px; font-weight: 700">添加同源树</div>
        <div style="display: flex; margin-top: 10px">
          <div style="width: 50px; line-height: 28px">分类:</div>
          <t-input v-model="relWord1.pos" :style="{ width: '400px' }"></t-input>
          <div v-if="showPos" style="font-size: 14px; color: red; line-height: 28px; margin-left: 10px">
            *请填写分类
          </div>
        </div>

        <t-button style="margin-top: 10px" @click="relWord1add()">添加单词</t-button>
        <div v-for="(item, index) in relWord1.words">
          <div style="border: 2px #82a0cf solid; border-radius: 25px; margin-top: 20px">
            <div style="display: flex; margin-top: 30px; padding: 10px">
              <div style="width: 50px; line-height: 28px">单词{{ index + 1 }}</div>
              <t-input v-model="item.hwd" :style="{ width: '300px' }"></t-input>
              <t-button style="margin-left: 20px" @click="relWord1delete(index)">删除单词</t-button>
            </div>
            <div style="display: flex; margin-top: 10px; margin-bottom: 30px; padding: 10px">
              <div style="width: 70px; line-height: 28px">单词{{ index + 1 }}翻译</div>
              <t-input v-model="item.tran" :style="{ width: '600px' }"></t-input>
            </div>
          </div>
        </div>
        <div v-if="showWords" style="font-size: 14px; color: red; line-height: 28px; margin-left: 10px">
          *请填写单词及其对应翻译
        </div>
        <div v-if="!relWord1.words[0]" style="font-size: 14px; color: red; line-height: 28px; margin-left: 10px">
          *请至少填写一个单词及其对应翻译
        </div>

        <div style="display: flex; justify-content: center; margin-top: 20px">
          <t-button @click="relWord1Con()">确认添加</t-button>
        </div>
      </div>

      <div v-if="modifyBool == 2">
        <div style="display: flex; justify-content: center; font-size: 18px; font-weight: 700">添加例句</div>

        <t-button style="margin-top: 10px" @click="sentence1add()">新增例句</t-button>
        <div v-for="(item, index) in sentence1">
          <div style="border: 2px #82a0cf solid; border-radius: 25px; margin-top: 20px">
            <div style="display: flex; margin-top: 30px; padding: 10px">
              <div style="width: 50px; line-height: 28px">例句{{ index + 1 }}</div>
              <t-input v-model="item.scontent" :style="{ width: '600px' }"></t-input>
            </div>
            <div style="display: flex; margin-top: 10px; margin-bottom: 20px; padding: 10px">
              <div style="width: 70px; line-height: 28px">例句{{ index + 1 }}翻译</div>
              <t-input v-model="item.scn" :style="{ width: '600px' }"></t-input>
            </div>
            <div style="display: flex; justify-content: center; margin-bottom: 20px">
              <t-button @click="sentence1delete(index)">删除例句</t-button>
            </div>
          </div>
        </div>
        <div v-if="showSentence" style="font-size: 14px; color: red; line-height: 28px; margin-left: 10px">
          *请填写例句及其对应翻译
        </div>
        <div v-if="!sentence1[0]" style="font-size: 14px; color: red; line-height: 28px; margin-left: 10px">
          *请至少填写一个例句及其对应翻译
        </div>

        <div style="display: flex; justify-content: center; margin-top: 20px">
          <t-button @click="sentence1Con()">确认添加</t-button>
        </div>
      </div>

      <div v-if="modifyBool == 3">
        <div style="display: flex; justify-content: center; font-size: 18px; font-weight: 700">添加翻译</div>

        <t-button style="margin-top: 10px" @click="tran1add()">新增翻译</t-button>
        <div v-for="(item, index) in tran1">
          <div style="border: 2px #82a0cf solid; border-radius: 25px; margin-top: 20px">
            <div style="display: flex; margin-top: 30px; padding: 10px">
              <div style="width: 50px; line-height: 28px">翻译{{ index + 1 }}</div>
              <t-input v-model="item.tranCn" :style="{ width: '600px' }"></t-input>
            </div>
            <div style="display: flex; justify-content: center; margin-bottom: 20px">
              <t-button @click="tran1delete(index)">删除翻译</t-button>
            </div>
          </div>
        </div>
        <div v-if="showTran" style="font-size: 14px; color: red; line-height: 28px; margin-left: 10px">
          *请填写翻译
        </div>

        <div v-if="!tran1[0]" style="font-size: 14px; color: red; line-height: 28px; margin-left: 10px">
          *请至少填写一个翻译
        </div>

        <div style="display: flex; justify-content: center; margin-top: 20px">
          <t-button @click="tran1Con()">确认添加</t-button>
        </div>
      </div>

      <div v-if="modifyBool == 4">
        <div style="display: flex; justify-content: center; font-size: 18px; font-weight: 700">添加短语</div>

        <t-button style="margin-top: 10px" @click="phrase1add()">新增短语</t-button>
        <div v-for="(item, index) in phrase1">
          <div style="border: 2px #82a0cf solid; border-radius: 25px; margin-top: 20px">
            <div style="display: flex; margin-top: 30px; padding: 10px">
              <div style="width: 50px; line-height: 28px">短语{{ index + 1 }}</div>
              <t-input v-model="item.pcontent" :style="{ width: '600px' }"></t-input>
            </div>
            <div style="display: flex; margin-top: 10px; margin-bottom: 20px; padding: 10px">
              <div style="width: 70px; line-height: 28px">短语{{ index + 1 }}翻译</div>
              <t-input v-model="item.pcn" :style="{ width: '600px' }"></t-input>
            </div>
            <div style="display: flex; justify-content: center; margin-bottom: 20px">
              <t-button @click="phrase1delete(index)">删除短语</t-button>
            </div>
          </div>
        </div>
        <div v-if="showPha" style="font-size: 14px; color: red; line-height: 28px; margin-left: 10px">
          *请填写短语及其对应翻译
        </div>
        <div v-if="!phrase1[0]" style="font-size: 14px; color: red; line-height: 28px; margin-left: 10px">
          *请至少填写一个短语及其对应翻译
        </div>

        <div style="display: flex; justify-content: center; margin-top: 20px">
          <t-button @click="phrase1Con()">确认添加</t-button>
        </div>
      </div>

      <div v-if="modifyBool == 5">
        <div style="display: flex; justify-content: center; font-size: 18px; font-weight: 700">添加近义词</div>
        <div style="display: flex; margin-top: 10px">
          <div style="width: 50px; line-height: 28px">词性:</div>
          <t-input v-model="syno1.pos" :style="{ width: '70px' }"></t-input>
          <div v-if="showSynoPos" style="font-size: 14px; color: red; line-height: 28px; margin-left: 10px">
            *请填写词性
          </div>
        </div>

        <div style="display: flex; margin-top: 10px">
          <div style="width: 50px; line-height: 28px">词义:</div>
          <t-input v-model="syno1.tran" :style="{ width: '70px' }"></t-input>
          <div v-if="showSynoTran" style="font-size: 14px; color: red; line-height: 28px; margin-left: 10px">
            *请填写对应词义
          </div>
        </div>

        <t-button style="margin-top: 10px" @click="syno1add()">添加单词</t-button>
        <div v-for="(item, index) in syno1.hwds">
          <div style="border: 2px #82a0cf solid; border-radius: 25px; margin-top: 20px">
            <div style="display: flex; margin-top: 30px; padding: 10px">
              <div style="width: 50px; line-height: 28px">单词{{ index + 1 }}</div>
              <t-input v-model="item.w" :style="{ width: '300px' }"></t-input>
              <t-button style="margin-left: 20px" @click="syno1delete(index)">删除单词</t-button>
            </div>
          </div>
        </div>
        <div v-if="!syno1.hwds[0]" style="font-size: 14px; color: red; line-height: 28px; margin-left: 10px">
          *请至少填写一个单词
        </div>
        <div v-if="showSynoDelete" style="font-size: 14px; color: red; line-height: 28px; margin-left: 10px">
          *请填写空单词
        </div>

        <div style="display: flex; justify-content: center; margin-top: 20px">
          <t-button @click="syno1Con()">确认添加</t-button>
        </div>
      </div>
    </t-dialog>

    <t-dialog v-model:visible="visibleBook" width="800px" theme="info" header="单词书修改" :footer="false"
      @close="visibleBook = false">
      <div style="display: flex; justify-content: center">单词书序号修改</div>
      <div style="width: 300px; margin: 0 auto; margin-top: 10px">
        <t-input v-model="rank"></t-input>
      </div>

      <div style="display: flex; justify-content: center; margin-top: 30px">单词书名称修改</div>
      <div style="width: 300px; margin: 0 auto; margin-top: 10px">
        <t-input v-model="bookName"></t-input>
      </div>

      <div style="margin-right: 70px; margin: 0 auto; width: 100px; line-height: 40px; margin-top: 30px">
        单词书封面修改
      </div>
      <div style="display: flex; justify-content: center">
        <t-upload v-model="image" action="/manager/manager/upload/file" theme="file" :draggable="draggable"
          :headers="{ accessToken: accessToken }" :max="2" accept="image/*"
          @onWaitingUploadFilesChange="console.log('发生变化')" @success="handleupload" @onRemove="remove1()"></t-upload>
      </div>

      <!-- </div> -->
      <div style="width: 80px; margin: 0 auto; margin-top: 40px">单词书描述</div>
      <div style="width: 400px; margin: 0 auto">
        <t-textarea v-model="bookDescription1" placeholder="请输入词汇书描述"
          :autosize="{ minRows: 3, maxRows: 5 }"></t-textarea>
      </div>

      <div style="width: 80px; margin: 0 auto; margin-top: 40px">一级目录</div>
      <div style="width: 400px; margin: 0 auto">
        <t-select v-model="menus" placeholder="无">
          <t-option v-for="item in menusListData" :key="item.id" :label="item.name" :value="item.id" />
        </t-select>
      </div>

      <div style="display: flex; justify-content: center; margin-top: 10px">
        <t-button @click="menus = ''">重置一级目录</t-button>
      </div>

      <div style="width: 80px; margin: 0 auto; margin-top: 40px">标签修改</div>
      <div style="width: 700px; margin: 0 auto; border: 2px solid #82a0cf; border-radius: 25px">
        <div v-if="labelArr.length != 0">
          <t-tag v-for="(item, index) in labelArr" theme="primary" style="margin: 10px" closable
            @close="handleClose(index)">
            {{ item }}
          </t-tag>
        </div>
        <div v-else
          style="display: flex; justify-content: center; margin-top: 10px; margin-bottom: 10px; color: #8e98a8c5">
          暂无标签
        </div>
      </div>
      <div style="display: flex; justify-content: center; margin-top: 10px">
        <div>添加标签</div>
        <t-input ref="input" v-model="labelAdd" placeholder="请输入标签内容" size="small"
          style="width: 154px; margin-left: 10px" @enter="handleInputEnter" />
      </div>
      <div style="display: flex; justify-content: center; margin-top: 20px">
        <t-button size="large" @click="editLabel">
          确认修改
        </t-button>
      </div>
    </t-dialog>

    <t-dialog v-if="visibleResource" v-model:visible="visibleResource" width="800px" theme="info" header="单词资源修改"
      :footer="false" @close="closeModifyWord">
      <!-- <video src=""></video> -->
      <div style="border: 2px solid #82a0cf; border-radius: 25px">
        <div style="display: flex; justify-content: center; margin-top: 10px">单词图片修改</div>
        <div style="display: flex; justify-content: center">
          <div style="display: flex; justify-content: center; margin-top: 10px; margin-bottom: 20px">
            <t-upload v-model="resourceImage" action="/manager/manager/upload/file" theme="image-flow"
              :headers="{ accessToken: accessToken }" :max="100" :files="resourceImage" multiple accept="image/*"
              @success="handleuploadImage" @remove="removeImage" @validate="repite"></t-upload>
          </div>
        </div>

        <!-- <div style="display: flex;justify-content: center;margin-top: 10px;">单词图片预览</div>
        <div style="display: flex;flex-direction: row;flex-wrap:wrap;justify-content: center;min-height: 120px;">
          <div v-for="item in resourceImage">
            <img style="width: 100px;height: 120px;margin: 10px;" :src=item.url>
          </div>
        </div> -->
      </div>
      <!-- <div v-for="item in resourceImage">
        {{ item }}
      </div> -->
      <div style="border: 2px solid #82a0cf; border-radius: 25px; margin-top: 30px">
        <div style="display: flex; justify-content: center; margin-top: 10px">视频文件上传</div>
        <div style="display: flex; justify-content: center; margin-top: 10px">
          <t-upload v-model="resourceVideo" action="/manager/manager/upload/file" theme="file"
            :headers="{ accessToken: accessToken }" :max="100" :files="resourceVideo" multiple accept="video/*"
            @onWaitingUploadFilesChange="console.log('发生变化')" @success="handleuploadVideo" @remove="removeVideo"
            @validate="repite"></t-upload>
        </div>
        <div style="display: flex; justify-content: center; margin-top: 10px">视频文件预览</div>
        <div style="display: flex; flex-direction: row; flex-wrap: wrap; justify-content: center; min-height: 120px">
          <div v-for="item in resourceVideo">
            <video style="margin: 10px; width: 200px; height: 200px" :src="item.url" controls="true" preload="auto"
              webkit-playsinline="true" playsinline="true" object-fit="contain"
              x5-video-orientation="landscape"></video>
            <div>
              <!-- {{ item.url }} -->
            </div>
          </div>
        </div>
      </div>

      <div style="border: 2px solid #82a0cf; border-radius: 25px; margin-top: 30px">
        <div style="display: flex; justify-content: center; margin-top: 10px">美式发音上传</div>
        <div style="display: flex; justify-content: center; margin-top: 10px">
          <t-upload v-model="resourceAudio" action="/manager/manager/upload/file" theme="file"
            :headers="{ accessToken: accessToken }" :max="2" accept="audio/*"
            @onWaitingUploadFilesChange="console.log('发生变化')" @success="handleuploadAudioUs" @remove="removeAudioUs"
            @validate="repite"></t-upload>
        </div>
        <div style="display: flex; justify-content: center; margin-top: 10px; margin-bottom: 10px">
          <audio :src="resourceAudioUs.url" controls></audio>
        </div>
        <div style="height: 10px"></div>
      </div>

      <div style="border: 2px solid #82a0cf; border-radius: 25px; margin-top: 30px">
        <div style="display: flex; justify-content: center; margin-top: 10px">英式式发音上传</div>
        <div style="display: flex; justify-content: center; margin-top: 10px">
          <t-upload v-model="resourceAudio1" action="/manager/manager/upload/file" theme="file"
            :headers="{ accessToken: accessToken }" :max="2" accept="audio/*"
            @onWaitingUploadFilesChange="console.log('发生变化')" @success="handleuploadAudioUk" @remove="removeAudioUk"
            @validate="repite"></t-upload>
        </div>
        <div style="display: flex; justify-content: center; margin-top: 10px; margin-bottom: 10px">
          <audio :src="resourceAudioUk.url" controls></audio>
        </div>
        <div style="height: 10px"></div>
      </div>

      <div style="display: flex; justify-content: center; margin-top: 15px">
        <t-button size="large" @click="resourceChange">
          确认更改资源
        </t-button>
      </div>
    </t-dialog>

    <t-dialog v-model:visible="visibleMenus" z-index="2501" width="800px" theme="info" header="新增一级目录" :footer="false"
      @close="visibleMenus = false">
      <div style="display: flex">
        <div>一级标签名称</div>
        <div style="margin-left: 20px">
          <t-input ref="input" v-model="menusNmae" placeholder="请输入一级目录名称" size="small"
            style="width: 354px; margin-left: 10px" />
        </div>
      </div>

      <div style="display: flex; margin-top: 20px">
        <div>一级标签描述</div>
        <div style="width: 400px; margin-left: 30px">
          <t-textarea v-model="menusDesc" placeholder="请输入一级目录描述" :autosize="{ minRows: 3, maxRows: 5 }"></t-textarea>
        </div>
      </div>

      <div style="display: flex; justify-content: center; margin-top: 20px">
        <t-button size="large" @click="editMenus">
          确认新增
        </t-button>
      </div>
    </t-dialog>

    <t-dialog v-model:visible="visibleMenusList" width="900px" theme="info" header="管理一级目录" :footer="false"
      @close="visibleMenusList = false">
      <div style="display: flex; justify-content: right; margin-bottom: 20px">
        <t-button size="large" @click="visibleMenus = true">新增一级目录</t-button>
      </div>
      <t-table :data="menusListData" :columns="columnsMenus" drag-sort="row-handler" resizable table-layout="fixed"
        :bordered="true" size="small" cell-empty-content="-" :loading="isLoading" @drag-sort="(e) => onSortChange(e)">
        <template #url="{ row }">
          <img :src="row.url" style="width: 80px; height: 110px" />
        </template>
      </t-table>
    </t-dialog>

    <t-dialog v-model:visible="visibleModifyMenus" width="800px" theme="info" header="修改一级目录" :footer="false"
      @close="visibleModifyMenus = false">
      <div style="display: flex">
        <div>一级标签序号</div>
        <div style="margin-left: 20px">
          <t-input ref="input" v-model="rankModify" placeholder="请输入一级目录序号" size="small"
            style="width: 354px; margin-left: 10px" />
        </div>
      </div>

      <div style="display: flex; margin-top: 20px">
        <div>一级标签名称</div>
        <div style="margin-left: 20px">
          <t-input ref="input" v-model="nameModify" placeholder="请输入一级目录名称" size="small"
            style="width: 354px; margin-left: 10px" />
        </div>
      </div>

      <div style="display: flex; margin-top: 20px">
        <div>一级标签描述</div>
        <div style="width: 400px; margin-left: 30px">
          <t-textarea v-model="descModify" placeholder="请输入一级目录描述" :autosize="{ minRows: 3, maxRows: 5 }"></t-textarea>
        </div>
      </div>

      <div style="display: flex; justify-content: center; margin-top: 20px">
        <t-button size="large" @click="modifyMenus">
          确认修改
        </t-button>
      </div>
    </t-dialog>

    <t-dialog v-model:visible="visibleBatch" width="1100px" theme="info" header="批量上传文件" :footer="false"
      @close="visibleBatch = false">
      <div style="display: flex; justify-content: center; align-items: center">
        <div>针对单词视频，图片资源的批量上传，重复上传不会覆盖原有资源</div>
        <t-tooltip content="上传单词视频、图片需把文件名改成对应单词名">
          <help-circle-icon />
        </t-tooltip>
      </div>
      <div style="display: flex; justify-content: center; margin: 10px 0">
        <!--        <t-button @click="files = []">清空表格</t-button>-->
        <!--        <t-button @click="uploadBatch2()">确认上传</t-button>-->
      </div>
      <div style="display: flex; justify-content: center; color: red; font-size: 12px">
        注：清空表格并不会删除已上传文件，请谨慎操作
      </div>
      <!-- <t-upload v-model="batchFiles" action="/manager/manager/web/file" :headers="{ accessToken: accessToken }"
        ref="uploadBatch" @success="handleuploadBatch" @remove="removeVideo" :files="batchFiles2" multiple
        @validate="repite" :autoUpload="false" :upload-all-files-in-one-request="true"></t-upload>
      <t-button @click="uploadBatch1">确定上传</t-button> -->
      <!--      <upload-pan-->
      <!--        ref="upload"-->
      <!--        :single="true"-->
      <!--        style="margin-top: 20px"-->
      <!--        dir="liberty"-->
      <!--        @input="inputSuccess"-->
      <!--      />-->
      <!-- <div> -->
      <!-- <h3>前端JS调用腾讯COS接口实现大文件断点续传</h3> -->

      <!-- 文件上传 -->
      <input type="file" id="file-selector" multiple="multiple" class="inputFile" @change="filechange" />

      <!-- 已上传文件列表 -->
      <!-- <div v-if="successList.length"> -->
      <!-- <pre> -->
      <!-- 已上传： -->
      <!-- {{ successList }} -->
      <!-- </pre> -->
      <!-- </div> -->

      <div v-for="(item, i) in files" :key="i">
        <minio-upload :cos="cos" :file1="item" mode="word" />
      </div>

      <!-- </div> -->

      <!--      <t-upload
        ref="uploadBatchFiles"
        v-model="files"
        action="/manager/manager/web/file"
        theme="file-flow"
        :headers="{ accessToken: accessToken }"
        multiple
        :disabled="disabled"
        :abridge-name="ABRIDGE_NAME"
        :auto-upload="false"
        :max="100"
        :show-thumbnail="false"
        :allow-upload-duplicate-file="true"
        :is-batch-upload="false"
        :upload-all-files-in-one-request="false"
        :format-response="formatResponse"
      ></t-upload>-->
      <!-- <t-base-table row-key="index" :data="data" :columns="columns"></t-base-table> -->
    </t-dialog>
  </div>
</template>

<script lang="tsx">
export default {
  name: 'OrderManage',
};
</script>

<script setup lang="tsx">
import { HelpCircleIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin, UploadProps } from 'tdesign-vue-next';
import { getCurrentInstance, onMounted, reactive, ref, watch } from 'vue';

import {
  addBookMenu,
  addWord,
  bookMenuList,
  page1,
  sortBook,
  sortMenu,
  updateBookMenu,
  updateWord1,
} from '@/api/user/bookApi';
import { deleteWord, search, updateWord, upload } from '@/api/user/wordsApi';
import minioUpload from '@/components/minioUpload/index.vue';
import { exercises } from '@/pages/admin-manange/columnData';
// import { get, page } from '@/api/user/changdeguanli';
// import { delete9, page4 } from '@/api/user/dingdanguanlijiekou';
import { useRenewDataStore } from '@/store/renewData';
import { defineComponent, onMount } from 'vue'
import {
  allLoading,
  arrIndex,
  bookDescription1,
  bookID,
  bookid,
  bookId1,
  bookName,
  columns,
  columns2,
  columns3,
  columns4,
  columnsMenus,
  columnsPrase,
  columnsrels,
  columnsSen,
  columnsSyno,
  columnsTran,
  columnsWordSearch,
  data2,
  data3,
  data5,
  data6,
  data7,
  descModify,
  edit3,
  getMenusList,
  headWord1,
  imageUrl,
  isLoading2,
  isLoading3,
  keyWord,
  labelArr,
  menus,
  menusId,
  menusListData,
  nameModify,
  resourceAudio,
  resourceAudio1,
  resourceAudioUk,
  resourceAudioUs,
  resourceImage,
  resourceVideo,
  row1,
  visible,
  visible2,
  visible3,
  visible4,
  visible5,
  visibleBook,
  visibleMenusList,
  visibleModifyMenus,
  visibleNewWord,
  visibleResource,
  word,
  wordIndex,
} from './newFile';
import COS from 'cos-js-sdk-v5';

const files = reactive([])
const filechange = (e) => {
  files.push(...e.target.files);
  console.log("files", files)
}

const uploadBatchFiles = ref();

const cos = ref(null); // 腾讯云 cos 操作实例


const getCosInstance = () => {
  console.log("1112454", COS)
  cos.value = new COS({
    getAuthorization: (options, callback) => {
      const url = "http://111.229.66.85:8866/manager/web/sts"; // 这里替换成您的服务接口地址
      const xhr = new XMLHttpRequest();

      xhr.open("GET", url, true);
      xhr.setRequestHeader("accessToken", localStorage.getItem('accessToken'))
      xhr.onload = (e) => {
        try {
          const data = JSON.parse(e.target.responseText);
          console.log('data', data);
          const credentials = data.result;
          if (!data || !credentials) return console.error("credentials invalid");
          callback({
            TmpSecretId: credentials.tmpSecretId,
            TmpSecretKey: credentials.tmpSecretKey,
            XCosSecurityToken: credentials.sessionToken,
            StartTime: Math.floor(Date.now() / 1000), // 时间戳，单位秒，如：1580000000，建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
            ExpiredTime: Math.floor(Date.now() / 1000) + 1800, // 时间戳，单位秒，如：1580000900
          });
        } catch (e) { console.error(e) }
      };
      xhr.send();
    },
  });
};

const formatResponse: UploadProps['formatResponse'] = (res) => {
  if (!res) {
    return {
      status: 'fail',
      error: '上传失败，原因：文件过大或网络不通',
    };
  }
  return res;
};

const visibleMenus = ref(false);
const excelBookId = ref('');
const excel = ref([]);
const rootExcel = ref([]);
const visibleExcel = ref(false);
const usUrl = ref('');
const labelAdd = ref('');
const menusNmae = ref('');
const menusDesc = ref('');
const draggable = ref(true);
const image = ref([]);
const addWord1 = ref('');
const visibleWordAdd = ref(false);
const showSynoDelete = ref(false);
const syno1 = ref({ pos: '', tran: '', hwds: [{ w: '' }] });
const showSynoPos = ref(false);
const showSynoTran = ref(false);
const phrase1 = ref([{ pcontent: '', pcn: '' }]);
const tran1 = ref([{ tranCn: '' }]);
const sentence1 = ref([{ scn: '', scontent: '' }]);
const showPha = ref(false);
const showTran = ref(false);
const showWords = ref(false);
const showPos = ref(false);
const relWord1 = ref({ pos: '', words: [{ hwd: '', tran: '' }] });
const visibleModify = ref(false);
const store = useRenewDataStore();
const index = ref();
const data = ref([]);
const isLoading = ref(false);
const isloadingBook = ref(false);
const accessToken = ref<string | null>();
const menusChoose = ref('0');
const batchFiles = ref([]);
const batchFiles2 = ref([]);
// const data2 = ref([]);
const selectedRowKeys = ref([]);
const visibleBatch = ref(false);
const fileList = ref([]);

const inputSuccess = (files) => {
  console.log('--files--', files);
  fileList.value = files;
};

const uploadBatch2 = () => {
  uploadBatchFiles.value.uploadFiles();
};

const querySave = reactive({
  orderType: '',
  orderState: '',
  paymentMethods: '',
  sort: 'createTime',
  order: true,
  phoneNumber: '',
});

const image2 = ref('');

const handleupload = (value) => {
  console.log('内容', value);
  image2.value = value.response.result.url;
  console.log('image2', image2.value);
};
const sortIds = ref([]);
const currentMenu = ref(0);
const onSortChange = (e) => {
  console.log('排序', e);
  menusListData.value = e.currentData;
  sortIds.value = e.currentData.map((item) => {
    return item.id;
  });
  sortMenu({ ids: sortIds.value, pageNumber: 1, pageSize: 100 }).then(() => { });
};

const bookSort = (e, menuId) => {
  data.value = e.currentData;
  sortIds.value = e.currentData.map((item) => {
    return item.id;
  });
  sortBook({ ids: sortIds.value, pageNumber: pagination.current, pageSize: pagination.pageSize }).then(() => { });
};
const handleuploadExcel = (value) => {
  if (value.response.code == 200) {
    MessagePlugin.success('上传成功');
    console.log('valueExcel', value);
    visibleExcel.value = false;
    excel.value = [];
    rootExcel.value = [];
    queryData({
      pageNumber: pagination.current,
      pageSize: pagination.pageSize,
      sort: 'createTime',
      order: 'desc',
    });
  }
};

const handleuploadAudioUk = (value) => {
  resourceAudioUk.value = {};
  console.log('内容', value.response[0]);
  resourceAudioUk.value = value.response.result;
  console.log('resourceAudioUk', resourceAudioUk.value);
  // console.log('imagevalue', value, value.response.result)
};

const handleuploadAudioUs = (value) => {
  resourceAudioUs.value = {};
  console.log('内容', value.response);
  resourceAudioUs.value = value.response.result;
  // usUrl.value = resourceAudioUs.value.url
  console.log('resourceAudioUs', resourceAudioUs.value);
  // console.log('imagevalue', value, value.response.result)
};

const handleuploadImage = (value1) => {
  // console.log('内容', value1)
  // console.log('resourceImage', resourceImage.value)
  console.log('value', value1.response);
  // console.log('i', i)
  if (resourceImage.value.length == 0) {
    for (const i in value1.response.length) {
      resourceImage.value.splice(Number(i), 1, value1.response[i].result);
    }
  }
  if (resourceImage.value.length != 0) {
    for (const i in value1.response) {
      resourceImage.value.splice(
        resourceImage.value.length - value1.response.length + Number(i),
        1,
        value1.response[i].result,
      );
    }
  }
  // console.log('resourceImage', resourceImage.value)
  // console.log('resourImage.value', resourceImage.value)
  // resourceImage.value.splice(resourceImage.value.length - 1, 1, value.response[0].result)
};

const handleuploadVideo = (value1) => {
  // console.log('内容', value)
  // console.log('resourceVideo1', resourceVideo1.value)
  // console.log('resourceVideo', resourceVideo.value)
  if (resourceVideo.value.length == 0) {
    for (const i in value1.response.length) {
      resourceVideo.value.splice(Number(i), 1, value1.response[i].result);
    }
  }
  if (resourceVideo.value.length != 0) {
    for (const i in value1.response) {
      resourceVideo.value.splice(
        resourceVideo.value.length - value1.response.length + Number(i),
        1,
        value1.response[i].result,
      );
    }
  }
  // resourceVideo.value.splice(resourceVideo.value.length - 1, 1, value.response[0].result)
  // console.log('imagevalue', value, value.response.result)
};

const handleuploadBatch = (value1) => {
  if (batchFiles2.value.length == 0) {
    for (const i in value1.response.length) {
      batchFiles2.value.splice(Number(i), 1, value1.response[i].result);
    }
  }
  if (batchFiles2.value.length != 0) {
    for (const i in value1.response) {
      batchFiles2.value.splice(
        batchFiles2.value.length - value1.response.length + Number(i),
        1,
        value1.response[i].result,
      );
    }
  }
};

// 挂载时调用请求函数
onMounted(async () => {
  getCosInstance()
  accessToken.value = localStorage.getItem('accessToken');
  bookMenuList().then((res) => {
    menusListData.value = [];
    menusListData.value = res.result;
    menusListData.value.unshift({ name: '全部', rank: 0, id: '0' });
  });
  queryData({
    pageNumber: pagination.current,
    pageSize: pagination.pageSize,
    sort: 'createTime',
    order: 'desc',
  });
  store.renewData = queryData; // 挂载时，将请求函数给pinia
  store.pagination.current = pagination.current; // 分页数据也一起给
  store.pagination.pageSize = pagination.pageSize;
  store.querySave = querySave;
});
// const AddFinsh = (newData: any) => {
//   console.log(newData);
//   queryData({
//     pageNumber: pagination.current,
//     pageSize: pagination.pageSize,
//   });
// };

// 过滤等发生变化时会出发 change 事件
const onFilterChange = (filterValue, context) => {
  // console.log('onchange', filterValue, context);
  // if ('orderType' in filterValue) {
  //   querySave.orderType = filterValue.orderType;
  // }
  // if ('orderType' in filterValue) {
  //   querySave.orderState = filterValue.orderState;
  // }
  querySave.orderType = filterValue.orderType;
  querySave.orderState = filterValue.orderState;
  querySave.paymentMethods = filterValue.paymentMethods;
  querySave.phoneNumber = filterValue.phoneNumber;

  console.log(' pagination.current', pagination.current, 'total', pagination.total, 'size', pagination.pageSize);

  queryData(
    {
      pageNumber: pagination.current,
      pageSize: pagination.pageSize,
      sort: querySave.sort,
      order: querySave.order === false ? 'asc' : 'desc',
    },
    null, // @ts-ignore
    querySave,
  );
};
// 行选中变化时
const onSelectChange = (value, params) => {
  selectedRowKeys.value = value;
  console.log(value, params);
};
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
      queryData(
        {
          pageNumber: pagination.current,
          pageSize: pagination.pageSize,
          sort: querySave.sort,
          order: querySave.order === false ? 'asc' : 'desc',
        },
        null,
        // @ts-ignore
        querySave,
      );
    }
  }
};

const ids1 = ref([]);
const searchRes = ref([]);
const searchWord = ref('');

const wordSearch = () => {
  // allLoading.value = true
  isloadingBook.value = true;
  const params = {
    query: searchWord.value,
    pageNumber: paginationSearch.current,
    pageSize: paginationSearch.pageSize,
  };
  search(params).then((res) => {
    // allLoading.value = false
    isloadingBook.value = false;
    searchRes.value = res.result;
    // paginationSearch.total = searchRes.value.length
  });
};

const paginationSearch = reactive({
  current: 1,
  pageSize: 10,
  total: 20,
});

const wordIndex1 = ref('');
const uploadWord = async () => {
  allLoading.value = true;
  wordIndex1.value = addWord1.value.charAt(0);
  wordIndex.value = wordIndex1.value.toUpperCase();
  const params = {
    headWord: addWord1.value,
    bookId: bookID.value,
    wordIndex: wordIndex.value,
  };
  addWord(params).then((res) => {
    allLoading.value = false;
    console.log(res);
    if (res.code == 200) {
      MessagePlugin.success('单词添加成功');
    }
    if (res.code == 90006) MessagePlugin.error('单词已存在');
  });
};

const handleMoreDelete = async () => {
  try {
    const id = selectedRowKeys.value.join(); // 提取数组里面的字符串
    if (id === '') {
      MessagePlugin.error('未勾选删除项');
    } else {
      ids1.value = id.split(',');
      console.log('ids1', ids1.value);
      // const res = await delete11({ ids });
      // console.log('ids', ids)
      // console.log('批量删除后', res);
      // queryData({
      //   pageNumber: pagination.current,
      //   pageSize: pagination.pageSize,
      // });
      const params: API.deleteWordParams = {
        ids: ids1.value,
      };
      deleteWord(params).then((res) => {
        edit3(row1.value);
      });
      MessagePlugin.success('删除成功');
    }
  } catch (error) {
    console.log(error);
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 10,
  showJumper: true,
  onChange: (pageInfo: { current: number; pageSize: number }) => {
    pagination.current = pageInfo.current;
    pagination.pageSize = pageInfo.pageSize;
    store.pagination.current = pagination.current; // 分页数据也一起给
    store.pagination.pageSize = pagination.pageSize;
    queryData(
      {
        // 分页改变时更新数据
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
        sort: querySave.sort,
        order: querySave.order === false ? 'asc' : 'desc',
      },
      null, // @ts-ignore
      querySave,
    );
    console.log('pagination.onChange', pageInfo);
  },
});

const pagination2 = reactive({
  current: 1,
  pageSize: 10,
  total: 10,
  showJumper: true,
  onChange: (pageInfo: { current: number; pageSize: number }) => {
    pagination.current = pageInfo.current;
    pagination.pageSize = pageInfo.pageSize;
    store.pagination.current = pagination.current; // 分页数据也一起给
    store.pagination.pageSize = pagination.pageSize;
    // queryData2(
    //   {
    //     // 分页改变时更新数据
    //     pageNumber: pagination.current,
    //     pageSize: pagination.pageSize,
    //     sort: querySave.sort,
    //     order: querySave.order === false ? 'asc' : 'desc',
    //   },
    //   null, // @ts-ignore
    //   querySave,
    // );
    console.log('pagination.onChange', pageInfo);
  },
});

const modifyBool = ref(0);

const queryData = async (paginationInfo?, entityInfo?: undefined) => {
  try {
    isLoading.value = true;
    console.log('请求', entityInfo, paginationInfo);
    if (inquireBool.value) {
      const params = {
        page: paginationInfo,
        entity: {
          menus: menusChoose.value == '0' ? '' : menusChoose.value,
        },
      };
      const res = await page1(params); // 在此发送请求
      data.value = res.result.records; // 获得表格数据
      isLoading.value = false;
      pagination.total = res.result.total; // 数据加载完成，设置数据总条数
      store.renewData = queryData;
      store.querySave = querySave;
      const deleteArr: string[] = [];
    } else {
      const params = {
        entity: {
          menus: menusChoose.value == '0' ? '' : menusChoose.value,
        },
        page: paginationInfo,
      };
      const res = await page1(params); // 在此发送请求

      console.log('数据已送达', res);
      data.value = res.result.records; // 获得表格数据
      isLoading.value = false;
      pagination.total = res.result.total; // 数据加载完成，设置数据总条数
      store.renewData = queryData;
      store.querySave = querySave;
      const deleteArr: string[] = [];
    }
    // 这段代码会安全地检查data.value数组中的每个对象是否具有paymentMethods属性，然后删除支付类型为null的数据
    // for (let i = 0; i < data.value.length; i++) {
    //   if (Object.prototype.hasOwnProperty.call(data.value[i], 'paymentMethods')) {
    //     if (data.value[i].paymentMethods === null) {
    //       deleteArr.push(data.value[i].id);
    //     }
    //   }
    // }
    const ids = deleteArr.join(); // 提取数组里面的字符串
    // delete9({ ids });
    // 如果总页数小于当前页数
    if (res.result.pages < res.result.current) {
      pagination.current = res.result.pages;
      queryData(
        {
          pageNumber: pagination.current,
          pageSize: pagination.pageSize,
          sort: querySave.sort,
          order: querySave.order === false ? 'asc' : 'desc',
        },
        null, // @ts-ignore
        querySave,
      );
    }
  } catch (err) {
    console.log(err);
  }
};

const handleRowClick = (e) => {
  console.log(e);
};
const close = () => {
  visible.value = false;
  data2.value = [];
};

const close2 = () => {
  visible3.value = false;
  data5.value = [];
};

const close3 = () => {
  visible4.value = false;
};
const close4 = () => {
  visible5.value = false;
};

const console1 = () => {
  console.log('data6', data6.value);
};

const modify = (num) => {
  visibleModify.value = true;
  modifyBool.value = num;
};

const relWord1add = () => {
  relWord1.value.words.push({ hwd: '', tran: '' });
};

const relWord1delete = (num) => {
  relWord1.value.words.splice(num, 1);
  if (showWords.value == true) {
    showWords.value = false;
  }
};

const relWord1Con = () => {
  if (relWord1.value.words.length == 0) {
    return;
  }
  for (const i in relWord1.value.words) {
    if (relWord1.value.words[i].hwd == '' || relWord1.value.words[i].tran == '') {
      showWords.value = true;
      return;
    }
  }
  if (relWord1.value.pos == '') {
    showPos.value = true;
    showWords.value = false;
    return;
  }
  showPos.value = false;
  showWords.value = false;
  if (data6.value.relWord != null) {
    data6.value.relWord.rels.push(relWord1.value);
  } else {
    data6.value.relWord = { desc: '同根', rels: [] };
    data6.value.relWord.rels.push(relWord1.value);
  }
  visibleModify.value = false;
  relWord1.value = { pos: '', words: [{ hwd: '', tran: '' }] };
};

const sentence1add = () => {
  sentence1.value.push({ scontent: '', scn: '' });
};

const sentence1delete = (num) => {
  sentence1.value.splice(num, 1);
  console.log('sentence', sentence1.value);
  if (showSentence.value == true) {
    showSentence.value = false;
  }
};

const showSentence = ref(false);

const sentence1Con = () => {
  if (sentence1.value.length == 0) {
    return;
  }
  for (const i in sentence1.value) {
    if (sentence1.value[i].scontent == '' || sentence1.value[i].scn == '') {
      showSentence.value = true;
      return;
    }
  }
  showSentence.value = false;
  if (data6.value.sentence != null) {
    data6.value.sentence.sentences = data6.value.sentence.sentences.concat(sentence1.value);
  } else {
    data6.value.sentence = { sentences: sentence1.value, desc: '例句' };
  }
  console.log('data6.sentence', data6.value.sentence);
  visibleModify.value = false;
  sentence1.value = [{ scn: '', scontent: '' }];
};

const tran1add = () => {
  tran1.value.push({ tranCn: '' });
};

const tran1delete = (num) => {
  tran1.value.splice(num, 1);
  if (showTran.value == true) {
    showTran.value = false;
  }
};

const tran1Con = () => {
  if (tran1.value.length == 0) {
    return;
  }
  if (tran1.value[0].tranCn == '') {
    showTran.value = true;
    return;
  }
  showTran.value = false;
  if (data6.value.trans != null) {
    data6.value.trans = data6.value.trans.concat(tran1.value);
  } else {
    data6.value.trans = tran1.value;
  }
  visibleModify.value = false;
  tran1.value = [{ tranCn: '' }];
};

const phrase1add = () => {
  phrase1.value.push({ pcontent: '', pcn: '' });
};

const phrase1delete = (num) => {
  phrase1.value.splice(num, 1);
  if (showPha.value == true) {
    showPha.value = false;
  }
};

const phrase1Con = () => {
  if (phrase1.value.length == 0) {
    return;
  }
  if (phrase1.value[0].pcn == '' || phrase1.value[0].pcontent == '') {
    showPha.value = true;
    return;
  }
  showPha.value = false;
  if (data6.value.phrase != null) {
    data6.value.phrase.phrases = data6.value.phrase.phrases.concat(phrase1.value);
  } else {
    data6.value.phrase = { phrases: phrase1.value, desc: '短语' };
  }
  console.log('phrase', data6.value.phrase);
  visibleModify.value = false;
  phrase1.value = [{ pcn: '', pcontent: '' }];
};

const syno1add = () => {
  syno1.value.hwds.push({ w: '' });
};

const syno1delete = (num) => {
  syno1.value.hwds.splice(num, 1);
  if (syno1.value.hwds.length == 0) {
    showSynoDelete.value = false;
  }
};

const syno1Con = () => {
  if (syno1.value.hwds.length == 0) {
    return;
  }
  for (const i in syno1.value.hwds) {
    if (syno1.value.hwds[i].w == '') {
      showSynoDelete.value = true;
      return;
    }
  }
  showSynoDelete.value = false;
  if (syno1.value.pos == '' && syno1.value.tran == '') {
    showSynoPos.value = true;
    showSynoTran.value = true;
    return;
  }
  if (syno1.value.pos == '' && syno1.value.tran != '') {
    showSynoPos.value = true;
    showSynoTran.value = false;
    return;
  }
  if (syno1.value.pos != '' && syno1.value.tran == '') {
    showSynoTran.value = true;
    showSynoPos.value = false;
    return;
  }
  showSynoPos.value = false;
  showSynoTran.value = false;
  if (data6.value.syno != null) {
    data6.value.syno.synos.push(syno1.value);
  } else {
    data6.value.syno = { synos: [], desc: '同近' };
    data6.value.syno.synos.push(syno1.value);
  }
  visibleModify.value = false;
  syno1.value = { pos: '', tran: '', hwds: [{ w: '' }] };
};

const modifyData6 = () => {
  allLoading.value = true;
  data7.value.content.word.content.sentence = data6.value.sentence;
  data7.value.content.word.content.syno = data6.value.syno;
  data7.value.content.word.content.phrase = data6.value.phrase;
  data7.value.content.word.content.relWord = data6.value.relWord;
  data7.value.content.word.content.trans = data6.value.trans;
  // console.log('data7', data7.va lue)
  const params = {
    id: data7.value.id,
  };
  const body = {
    word: data7.value.content.word,
  };
  updateWord(params, body).then((res) => {
    if (res.code == 200) {
      console.log('res', res.result);
      allLoading.value = false;
      MessagePlugin.success('修改成功');
      visible4.value = false;
    } else {
      MessagePlugin.error('修改失败，请稍后再试');
    }
  });
};

const newWordClose = () => {
  visibleNewWord.value = false;
  searchRes.value = [];
  searchWord.value = '';
};

const remake = () => {
  inquireBool.value = false;
  if (!menusChoose.value) {
    MessagePlugin.error('当前为全部查询');
    return;
  }
  menusChoose.value = '0';
  queryData({
    pageNumber: pagination.current,
    pageSize: pagination.pageSize,
    sort: 'createTime',
    order: 'desc',
  });
};

const handleFail = () => {
  MessagePlugin.error('上传失败，请稍后再试');
};

const remove1 = () => {
  image.value = [];
};

const removeImage = (value) => { };

const removeVideo = (value) => { };
const removeAudioUs = (value) => {
  // resourceAudioUs.value = ""
  resourceAudioUs.value = {};
};

const removeAudioUk = (value) => {
  resourceAudioUk.value = {};
  // resourceAudioUk.value = ""
};

const handleClose = (index) => {
  labelArr.value.splice(index, 1);
};

const handleInputEnter = () => {
  if (labelAdd.value == '') {
    MessagePlugin.error('添加的标签不能为空');
    return;
  }
  labelArr.value.push(labelAdd.value);
  console.log(labelArr.value, '222');
  labelAdd.value = '';
};

const labelString = ref('');
const imageUrl2 = ref('');
const rank = ref(0);

const editLabel = () => {
  console.log('menus', menus);
  allLoading.value = true;
  console.log('labelArr', labelArr.value);
  for (const i in labelArr.value) {
    if (labelArr.value.length == 1) {
      labelString.value += '[';
      labelString.value += labelArr.value[i];
      labelString.value += ']';
      break;
    }
    if (Number(i) == 0) {
      labelString.value += '[';
      labelString.value += labelArr.value[i];
      // labelString.value = labelString.value + "、"
      // console.log('111')
    } else if (Number(i) == labelArr.value.length - 1) {
      labelString.value += '、';
      labelString.value += labelArr.value[i];
      labelString.value += ']';
      // console.log('222')
    } else {
      labelString.value += '、';
      labelString.value += labelArr.value[i];
      // console.log('333')
    }
    // console.log('i', i)
  }
  // console.log('labelString', labelString.value)
  if (image2.value != '') {
    imageUrl2.value = image2.value;
  } else {
    imageUrl2.value = imageUrl.value;
  }
  const params = {
    bookName: bookName.value,
    bookId: bookId1.value,
    url: imageUrl2.value,
    bookDescription: bookDescription1.value,
    label: labelString.value,
    id: bookid.value,
    menus: menus.value,
  };
  updateWord1(params).then((res) => {
    allLoading.value = false;
    // console.log('res', res)
    labelString.value = '';
    visibleBook.value = false;
    queryData({
      pageNumber: pagination.current,
      pageSize: pagination.pageSize,
      sort: 'createTime',
      order: 'desc',
    });
  });
};

const repite = (value) => {
  MessagePlugin.error('请勿重复上传');
  // console.log('11', value)
};

const voices = ref([]);

const filterChange = (a, b) => {
  console.log('a', a);
  console.log('b', b);
};

const inquireBool = ref(false);

const inquire = async (paginationInfo?, entityInfo?: undefined) => {
  inquireBool.value = true;
  try {
    if (!menusChoose.value) {
      MessagePlugin.error('请先选择一级标签');
      return;
    }
    isLoading.value = true;
    const params = {
      page: {
        pageNumber: 1,
        pageSize: 10,
      },
      entity: {
        menus: menusChoose.value == '0' ? '' : menusChoose.value,
      },
    };
    const res = await page1(params); // 在此发送请求
    data.value = res.result.records; // 获得表格数据
    isLoading.value = false;
    pagination.total = res.result.total; // 数据加载完成，设置数据总条数
    store.renewData = queryData;
    store.querySave = querySave;
    const deleteArr: string[] = [];
    // 这段代码会安全地检查data.value数组中的每个对象是否具有paymentMethods属性，然后删除支付类型为null的数据
    // for (let i = 0; i < data.value.length; i++) {
    //   if (Object.prototype.hasOwnProperty.call(data.value[i], 'paymentMethods')) {
    //     if (data.value[i].paymentMethods === null) {
    //       deleteArr.push(data.value[i].id);
    //     }
    //   }
    // }
    // const ids = deleteArr.join(); // 提取数组里面的字符串
    // delete9({ ids });
    // 如果总页数小于当前页数
    // if (res.result.pages < res.result.current) {
    //   pagination.current = res.result.pages;
    //   inquire(
    //     {
    //       pageNumber: pagination.current,
    //       pageSize: pagination.pageSize,
    //       sort: querySave.sort,
    //       order: querySave.order === false ? 'asc' : 'desc',
    //     },
    //     null, // @ts-ignore
    //     querySave,
    //   );
    // }
  } catch (err) {
    console.log(err);
  }
};

const resourceChange = () => {
  voices.value = [];
  allLoading.value = true;
  console.log('111', resourceAudioUs.value);
  if (resourceAudioUs.value.url) {
    resourceAudioUs.value.name = 'usphone';
    voices.value.push(resourceAudioUs.value);
  }
  if (resourceAudioUk.value.url) {
    resourceAudioUk.value.name = 'ukphone';
    voices.value.push(resourceAudioUk.value);
  }

  const params = {
    headword: headWord1.value,
  };
  const body = {
    images: resourceImage.value,
    videos: resourceVideo.value,
    voices: voices.value,
  };
  console.log('params', params);
  upload(params, body).then((res) => {
    allLoading.value = false;
    visibleResource.value = false;
    MessagePlugin.success('修改成功');
    resourceImage.value = [];
    resourceVideo.value = [];
    resourceAudioUk.value = {};
    resourceAudioUs.value = {};
    resourceAudio1.value = [];
    resourceAudio.value = [];
  });
};

const closeModifyWord = () => {
  visibleResource.value = false;
  resourceImage.value = [];
  resourceVideo.value = [];
  resourceAudioUk.value = {};
  resourceAudioUs.value = {};
  resourceAudio1.value = [];
  resourceAudio.value = [];
};

const closeExcel = () => {
  visibleExcel.value = false;
};

const removeExcel = () => {
  excel.value = [];
  rootExcel.value = [];
};

const excelFail = () => {
  MessagePlugin.error('单词书已存在，请更换bookId');
};

const editMenus = () => {
  const params = {
    name: menusNmae.value,
    description: menusDesc.value,
  };
  addBookMenu(params).then((res) => {
    if (res.code == 200) {
      MessagePlugin.success('添加成功');
      visibleMenus.value = false;
      bookMenuList().then((res) => {
        menusListData.value = [];
        allLoading.value = false;
        menusListData.value = res.result;
      });
    } else {
      MessagePlugin.success('添加失败，请稍后再试');
    }
  });
};
const modifyMenus = () => {
  const params = {
    id: menusId.value,
    name: nameModify.value,
    description: descModify.value,
  };
  updateBookMenu(params).then((res) => {
    if (res.code == 200) {
      MessagePlugin.success('修改成功');
      visibleModifyMenus.value = false;
      getMenusList();
    } else {
      MessagePlugin.success('修改失败，请稍后再试');
    }
  });
};

// const menusListData = ref()

watch(searchWord, (newValue, oldValue) => {
  wordSearch();
});
</script>

<style lang="less" scoped>
.hr-twill {
  border: 0;
  padding: 3px;
  background: repeating-linear-gradient(135deg, #a2a9b6 0px, #a2a9b6 1px, transparent 1px, transparent 6px);
}

.inputFile {
  /* 隐藏按钮后的文字 */
  font-size: 0;
}

/* 修改按钮后的文字颜色 */
.inputFile[type="file"] {
  color: gray;
}

.inputFile::file-selector-button {
  height: 3rem;
  font-size: 1rem;
  color: #fff;
  border-radius: .25rem;
  border: 1px solid #0052d9;
  padding: .75rem 1rem;
  background-color: #0052d9;
  box-sizing: border-box;
  font-family: inherit;
  cursor: pointer;
}
</style>
