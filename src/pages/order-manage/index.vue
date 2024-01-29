<template>
  <div>
    <div style="display: flex;justify-content: center;margin-bottom: 10px;">
      <t-button @click="visibleExcel = true">
        excel表格上传
      </t-button>
    </div>

    <t-dialog width="500px" theme="info" header="excel表格上传" @close="closeExcel()" :visible.sync="visibleExcel" @confirm=""
      :footer="false">
      <div style="font-size: 14px;font-weight: 700;justify-content: center;display: flex;">请先输入bookId</div>
      <div style="width: 300px;display: flex;justify-content: space-around;margin-top: 10px;">
        <div style="line-height: 30px;">bookId:</div>
        <div> <t-input v-model="excelBookId"></t-input></div>
      </div>
      <div v-if="excelBookId != ''">
        <div style="margin-top: 20px;display: flex;justify-content: center;">
          <t-upload v-model="excel" action="/manager/manager/book/uploadWordByExcel" theme="file" :draggable=draggable
            :headers="{ accessToken: accessToken }" :max="2" @success="handleuploadExcel" @fail="excelFail"
            @onRemove="removeExcel()" :autoUpload=false :data="{ bookId: excelBookId }"></t-upload>
        </div>
      </div>

    </t-dialog>

    <t-card>
      <t-table :row-key="index" :data="data" :columns="columns" resizable table-layout="fixed" :bordered="true"
        size="small" :pagination="pagination" :filter-row="null" cell-empty-content="-" :loading="isLoading"
        :selected-row-keys="selectedRowKeys" @row-click="handleRowClick" @filter-change="onFilterChange"
        @change="onChange">
        <template #url="{ row }">
          <img :src="row.url" style="width: 80px;height: 110px;">
        </template>
      </t-table>
    </t-card>

    <t-dialog width="500px" theme="info" header="词组列表" @close="close()" :visible.sync="visible" :footer="false">
      <div style="display: flex;justify-content: center;margin-bottom: 20px;">
        <t-button size="large" @click="visibleNewWord = true">新增/修改单词</t-button>
      </div>
      <t-card>
        <t-table :row-key="index" :data="data2" :columns="columns2" resizable table-layout="fixed" :bordered="true"
          size="small" :filter-row="null" cell-empty-content="-" :selected-row-keys="selectedRowKeys"
          :loading="isLoading2" @filter-change="onFilterChange" @change="onChange">
        </t-table>
      </t-card>
    </t-dialog>

    <t-dialog width="800px" theme="info" header="词组详情" @close="visible2 = false" :visible.sync="visible2" :footer="false">

      <t-card>
        <t-table :row-key="index" :data="data3" :columns="columns3" resizable table-layout="fixed" :bordered="true"
          size="small" :filter-row="null" cell-empty-content="-" :selected-row-keys="selectedRowKeys"
          @filter-change="onFilterChange" @change="onChange">
        </t-table>
      </t-card>
    </t-dialog>

    <t-dialog width="800px" theme="info" header="单词详情" @close="close2()" :visible.sync="visible3" :footer="false">
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

    <t-dialog width="800px" theme="info" header="修改" @close="close4()" :visible.sync="visible5" :footer="false">
      <div v-if="keyWord == 1">
        <div v-if="data6.relWord.rels[arrIndex]">
          <div style="display: flex;">
            <div style="width: 50px;line-height:30px;">词性</div>
            <t-input :style="{ width: '200px' }" placeholder="请输入词性:如n.;adj.;adv.;v.;"
              v-model=data6.relWord.rels[arrIndex].pos />
          </div>

          <div v-for="item, index in data6.relWord.rels[arrIndex].words">
            <div style="display: flex;margin-top: 20px;">
              <div style="width: 50px;line-height:30px;">单词{{ index + 1 }}</div>
              <t-input :style="{ width: '250px' }" placeholder="请输入单词" v-model=item.hwd />
              <div style="width: 100px;line-height:30px;margin-left: 30px;">单词{{ index + 1 }}翻译：</div>
              <t-input :style="{ width: '200px' }" placeholder="请输入对应翻译" v-model=item.tran />
            </div>
          </div>
        </div>

      </div>

      <div v-if="keyWord == 2">
        <div v-if="data6.sentence.sentences[arrIndex]">
          <div style="display: flex;">
            <div style="line-height: 30px;margin-right: 20px;">例句:</div>
            <t-input :style="{ width: '600px' }" placeholder="请输入单词"
              v-model=data6.sentence.sentences[arrIndex].scontent />
          </div>
          <div style="display: flex;margin-top: 20px;">
            <div style="line-height: 30px;margin-right: 20px;">翻译</div>
            <t-input :style="{ width: '600px' }" placeholder="请输入单词" v-model=data6.sentence.sentences[arrIndex].scn />
          </div>
        </div>

      </div>

      <div v-if="keyWord == 3">
        <div v-if="data6.trans[arrIndex]">
          <div style="display: flex;">
            <div style="line-height: 30px;margin-right: 20px;">翻译：</div>
            <t-input :style="{ width: '600px' }" placeholder="请输入单词" v-model=data6.trans[arrIndex].tranCn />
          </div>
        </div>

      </div>

      <div v-if="keyWord == 4">
        <div v-if="data6.phrase.phrases[arrIndex]">
          <div style="display: flex;">
            <div style="line-height: 30px;margin-right: 20px;">短语:</div>
            <t-input :style="{ width: '600px' }" placeholder="请输入单词" v-model=data6.phrase.phrases[arrIndex].pcontent />
          </div>
          <div style="display: flex;margin-top: 20px;">
            <div style="line-height: 30px;margin-right: 20px;">翻译：</div>
            <t-input :style="{ width: '600px' }" placeholder="请输入单词" v-model=data6.phrase.phrases[arrIndex].pcn />
          </div>
        </div>

      </div>

      <div v-if="keyWord == 5">
        <div v-if="data6.syno.synos[arrIndex]">
          <div style="display: flex;">
            <div style="line-height: 30px;margin-right: 20px;">词性:</div>
            <t-input :style="{ width: '100px' }" placeholder="请输入单词" v-model=data6.syno.synos[arrIndex].pos />
          </div>
          <div style="display: flex;margin-top: 20px;">
            <div style="line-height: 30px;margin-right: 20px;">对应词义：</div>
            <t-input :style="{ width: '460px' }" placeholder="请输入单词" v-model=data6.syno.synos[arrIndex].tran />
          </div>
          <div style="margin-top: 20px;">
            <div style="line-height: 30px;margin-right: 20px;">词组列表</div>
            <div v-for="item, index in data6.syno.synos[arrIndex].hwds">
              <div style="display: flex;margin-top: 20px;">
                <div style="line-height: 25px;margin-right: 20px;">词组{{ index + 1 }}</div><t-input
                  :style="{ width: '300px' }" placeholder="请输入单词" v-model=item.w />
              </div>
            </div>
          </div>
        </div>

      </div>
    </t-dialog>

    <div v-if="allLoading">
      <t-loading size="medium" text="加载中" fullscreen></t-loading>
    </div>

    <t-dialog width="800px" key="11" theme="info" header="新增单词" @close="newWordClose()" :visible.sync="visibleNewWord"
      :footer="false">
      <div style="display: flex;justify-content: center;margin-bottom: 20px;">
        <t-input v-model="searchWord" placeholder="请输入要添加的单词" :style="{ width: '300px' }" @enter="wordSearch()"></t-input>
        <div style="margin-left: 5px;">
          <t-button @click="wordSearch()">搜索</t-button>
        </div>
      </div>
      <div style="display: flex;justify-content: center;margin-bottom: 10px;">
        <t-link @click="visibleWordAdd = true" theme="primary">没有搜索到想要添加的单词？点击这里添加</t-link>
      </div>

      <t-table :row-key="index" :data="searchRes" :columns="columnsWordSearch" resizable table-layout="fixed"
        :bordered="true" size="small" :filter-row="null" cell-empty-content="-" :selected-row-keys="selectedRowKeys"
        :loading="isloadingBook" @filter-change="onFilterChange">
      </t-table>
    </t-dialog>

    <t-dialog width="800px" theme="info" header="自定义添加单词" @close="visibleWordAdd = false" :visible.sync="visibleWordAdd"
      :footer="false">
      <div style="display: flex;justify-content: space-around;">
        <div style="font-size: 14px;line-height: 30px;">请输入需要添加的单词全拼</div>
        <t-input v-model="addWord1" placeholder="请输入要添加的单词" :style="{ width: '300px' }"></t-input>
      </div>
      <div style="display: flex;justify-content: center;">
        <t-button @click="uploadWord()">添加</t-button>
      </div>
    </t-dialog>

    <t-dialog width="1000px" key="12" theme="info" header="单词属性详情" @close="close3()" :visible.sync="visible4"
      :footer="false">
      <div style="font-size: 18px;font-weight: 700;">单词拼写：{{ word }}</div>
      <div style="display:flex;justify-content: center;margin-top: 20px;font-size: 20px;font-weight: 700;">同根词</div>
      <div style="margin-left: 86%;margin-bottom: 10px;"><t-button @click="modify(1)">添加同根词</t-button></div>
      <div v-if="data6.relWord">
        <t-table :row-key="index" :data="data6.relWord.rels" :columns="columnsrels" resizable table-layout="fixed"
          :bordered="true" size="small" :filter-row="null" cell-empty-content="-" :selected-row-keys="selectedRowKeys"
          :loading="isLoading3" @filter-change="onFilterChange" @change="onChange">
          <template #words="{ row }">
            <div v-for="item in row.words">
              <div style="display: flex;">
                <p>{{ item.hwd }}</p>
                <p style="margin-left: 10px;">翻译：{{ item.tran }}</p>
              </div>
            </div>
          </template>
        </t-table>
      </div>
      <div v-else>
        <div style="display: flex;justify-content: center;">
          <img src="https://stickyfinger.oss-cn-guangzhou.aliyuncs.com/null5dc984f6d7d2418abc61ea0890fc81b0.png"
            style="width: 100px;height: 100px;">
        </div>
        <div style="display: flex;justify-content: center;color: #b5b8bdd8;margin-bottom: 40px;">
          该单词暂无同根词
        </div>
      </div>

      <div style="display: flex;justify-content: center;font-size: 20px;font-weight: 700;margin-top: 20px;">例句</div>
      <div style="margin-left: 88%;margin-bottom: 10px;"><t-button @click="modify(2)">添加例句</t-button></div>
      <div v-if="data6.sentence">
        <t-table :row-key="index" :data="data6.sentence.sentences" :columns="columnsSen" resizable table-layout="fixed"
          :bordered="true" size="small" :filter-row="null" cell-empty-content="-" :selected-row-keys="selectedRowKeys"
          :loading="isLoading3" @filter-change="onFilterChange" @change="onChange">
        </t-table>
      </div>
      <div v-else>
        <div style="display: flex;justify-content: center;">
          <img src="https://stickyfinger.oss-cn-guangzhou.aliyuncs.com/null5dc984f6d7d2418abc61ea0890fc81b0.png"
            style="width: 100px;height: 100px;">
        </div>
        <div style="display: flex;justify-content: center;color: #b5b8bdd8;margin-bottom: 40px;">
          该单词暂无例句
        </div>
      </div>


      <div style="display: flex;justify-content: center;margin-top: 20px;font-size: 20px;font-weight: 700;">翻译</div>
      <div style="margin-left: 88%;margin-bottom: 10px;"><t-button @click="modify(3)">添加翻译</t-button></div>
      <div v-if="data6.trans">
        <t-table :row-key="index" :data="data6.trans" :columns="columnsTran" resizable table-layout="fixed"
          :bordered="true" size="small" :filter-row="null" cell-empty-content="-" :selected-row-keys="selectedRowKeys"
          :loading="isLoading3" @filter-change="onFilterChange" @change="onChange">
        </t-table>
      </div>
      <div v-else>
        <div style="display: flex;justify-content: center;">
          <img src="https://stickyfinger.oss-cn-guangzhou.aliyuncs.com/null5dc984f6d7d2418abc61ea0890fc81b0.png"
            style="width: 100px;height: 100px;">
        </div>
        <div style="display: flex;justify-content: center;color: #b5b8bdd8;margin-bottom: 40px;">
          该单词暂无翻译
        </div>
      </div>


      <div style="display: flex;justify-content: center;margin-top: 20px;font-size: 20px;font-weight: 700;">短语</div>
      <div style="margin-left: 88%;margin-bottom: 10px;"><t-button @click="modify(4)">添加短语</t-button></div>
      <div v-if="data6.phrase">
        <t-table :row-key="index" :data="data6.phrase.phrases" :columns="columnsPrase" resizable table-layout="fixed"
          :bordered="true" size="small" :filter-row="null" cell-empty-content="-" :selected-row-keys="selectedRowKeys"
          :loading="isLoading3" @filter-change="onFilterChange" @change="onChange">
        </t-table>
      </div>
      <div v-else>
        <div style="display: flex;justify-content: center;">
          <img src="https://stickyfinger.oss-cn-guangzhou.aliyuncs.com/null5dc984f6d7d2418abc61ea0890fc81b0.png"
            style="width: 100px;height: 100px;">
        </div>
        <div style="display: flex;justify-content: center;color: #b5b8bdd8;margin-bottom: 40px;">
          该单词暂无短语
        </div>
      </div>

      <div style="display:flex;justify-content: center;margin-top: 20px;font-size: 20px;font-weight: 700;">近义词</div>
      <div style="margin-left: 86%;margin-bottom: 10px;"><t-button @click="modify(5)">添加近义词</t-button></div>
      <div v-if="data6.syno">
        <t-table :row-key="index" :data="data6.syno.synos" :columns="columnsSyno" resizable table-layout="fixed"
          :bordered="true" size="small" :filter-row="null" cell-empty-content="-" :selected-row-keys="selectedRowKeys"
          :loading="isLoading3" @filter-change="onFilterChange" @change="onChange">
          <template #hwds="{ row }">
            <div v-for="item in row.hwds">
              <div style="display: flex;">
                <p>{{ item.w }}</p>
              </div>
            </div>
          </template>
        </t-table>
      </div>
      <div v-else>
        <div style="display: flex;justify-content: center;">
          <img src="https://stickyfinger.oss-cn-guangzhou.aliyuncs.com/null5dc984f6d7d2418abc61ea0890fc81b0.png"
            style="width: 100px;height: 100px;">
        </div>
        <div style="display: flex;justify-content: center;color: #b5b8bdd8;margin-bottom: 40px;">
          该单词暂无近义词
        </div>
      </div>

      <div style="display: flex;justify-content: center;margin-top: 20px;">
        <t-button size="large" @click="modifyData6()">修改确认</t-button>
      </div>

    </t-dialog>

    <t-dialog width="800px" theme="info" header="新增内容" @close="visibleModify = false" :visible.sync="visibleModify"
      :footer="false">
      <div v-if="modifyBool == 1">
        <div style="display: flex;justify-content: center;font-size: 18px;font-weight: 700;">添加同根词</div>
        <div style="display: flex;margin-top: 10px;">
          <div style="width: 50px;line-height: 28px;">词性:</div>
          <t-input :style="{ width: '70px' }" v-model="relWord1.pos"></t-input>
          <div v-if="showPos" style="font-size: 14px;color: red;line-height: 28px;margin-left: 10px;">*请填写词性</div>
        </div>

        <t-button style="margin-top: 10px;" @click="relWord1add()">添加单词</t-button>
        <div v-for="item, index in relWord1.words">
          <div style="border: 2px #82a0cf solid;border-radius: 25px;margin-top: 20px;">
            <div style="display: flex;margin-top: 30px;padding: 10px;">
              <div style="width: 50px;line-height: 28px;">单词{{ index + 1 }}</div>
              <t-input :style="{ width: '300px' }" v-model="item.hwd"></t-input>
              <t-button style="margin-left: 20px;" @click="relWord1delete(index)">删除单词</t-button>
            </div>
            <div style="display: flex;margin-top: 10px;margin-bottom: 30px;padding: 10px;">
              <div style="width: 70px;line-height: 28px;">单词{{ index + 1 }}翻译</div>
              <t-input :style="{ width: '600px' }" v-model="item.tran"></t-input>
            </div>
          </div>
        </div>
        <div v-if="showWords" style="font-size: 14px;color: red;line-height: 28px;margin-left: 10px;">*请填写单词及其对应翻译
        </div>
        <div v-if="!relWord1.words[0]" style="font-size: 14px;color: red;line-height: 28px;margin-left: 10px;">
          *请至少填写一个单词及其对应翻译
        </div>

        <div style="display: flex;justify-content: center;margin-top: 20px;">
          <t-button @click="relWord1Con()">确认添加</t-button>
        </div>
      </div>

      <div v-if="modifyBool == 2">
        <div style="display: flex;justify-content: center;font-size: 18px;font-weight: 700;">添加例句</div>

        <t-button style="margin-top: 10px;" @click="sentence1add()">新增例句</t-button>
        <div v-for="item, index in sentence1">
          <div style="border: 2px #82a0cf solid;border-radius: 25px;margin-top: 20px;">
            <div style="display: flex;margin-top: 30px;padding: 10px;">
              <div style="width: 50px;line-height: 28px;">例句{{ index + 1 }}</div>
              <t-input :style="{ width: '600px' }" v-model="item.scontent"></t-input>
            </div>
            <div style="display: flex;margin-top: 10px;margin-bottom: 20px;padding: 10px;">
              <div style="width: 70px;line-height: 28px;">例句{{ index + 1 }}翻译</div>
              <t-input :style="{ width: '600px' }" v-model="item.scn"></t-input>
            </div>
            <div style="display: flex;justify-content: center;margin-bottom: 20px;">
              <t-button @click="sentence1delete(index)">删除例句</t-button>
            </div>

          </div>
        </div>
        <div v-if="showSentence" style="font-size: 14px;color: red;line-height: 28px;margin-left: 10px;">*请填写例句及其对应翻译
        </div>
        <div v-if="!sentence1[0]" style="font-size: 14px;color: red;line-height: 28px;margin-left: 10px;">*请至少填写一个例句及其对应翻译
        </div>

        <div style="display: flex;justify-content: center;margin-top: 20px;">
          <t-button @click="sentence1Con()">确认添加</t-button>
        </div>
      </div>

      <div v-if="modifyBool == 3">
        <div style="display: flex;justify-content: center;font-size: 18px;font-weight: 700;">添加翻译</div>

        <t-button style="margin-top: 10px;" @click="tran1add()">新增翻译</t-button>
        <div v-for="item, index in tran1">
          <div style="border: 2px #82a0cf solid;border-radius: 25px;margin-top: 20px;">
            <div style="display: flex;margin-top: 30px;padding: 10px;">
              <div style="width: 50px;line-height: 28px;">翻译{{ index + 1 }}</div>
              <t-input :style="{ width: '600px' }" v-model="item.tranCn"></t-input>
            </div>
            <div style="display: flex;justify-content: center;margin-bottom: 20px;">
              <t-button @click="tran1delete(index)">删除翻译</t-button>
            </div>

          </div>
        </div>
        <div v-if="showTran" style="font-size: 14px;color: red;line-height: 28px;margin-left: 10px;">*请填写翻译
        </div>

        <div v-if="!tran1[0]" style="font-size: 14px;color: red;line-height: 28px;margin-left: 10px;">*请至少填写一个翻译
        </div>

        <div style="display: flex;justify-content: center;margin-top: 20px;">
          <t-button @click="tran1Con()">确认添加</t-button>
        </div>
      </div>

      <div v-if="modifyBool == 4">
        <div style="display: flex;justify-content: center;font-size: 18px;font-weight: 700;">添加短语</div>

        <t-button style="margin-top: 10px;" @click="phrase1add()">新增短语</t-button>
        <div v-for="item, index in phrase1">
          <div style="border: 2px #82a0cf solid;border-radius: 25px;margin-top: 20px;">
            <div style="display: flex;margin-top: 30px;padding: 10px;">
              <div style="width: 50px;line-height: 28px;">短语{{ index + 1 }}</div>
              <t-input :style="{ width: '600px' }" v-model="item.pcontent"></t-input>
            </div>
            <div style="display: flex;margin-top: 10px;margin-bottom: 20px;padding: 10px;">
              <div style="width: 70px;line-height: 28px;">短语{{ index + 1 }}翻译</div>
              <t-input :style="{ width: '600px' }" v-model="item.pcn"></t-input>
            </div>
            <div style="display: flex;justify-content: center;margin-bottom: 20px;">
              <t-button @click="phrase1delete(index)">删除短语</t-button>
            </div>

          </div>
        </div>
        <div v-if="showPha" style="font-size: 14px;color: red;line-height: 28px;margin-left: 10px;">*请填写短语及其对应翻译
        </div>
        <div v-if="!phrase1[0]" style="font-size: 14px;color: red;line-height: 28px;margin-left: 10px;">*请至少填写一个短语及其对应翻译
        </div>

        <div style="display: flex;justify-content: center;margin-top: 20px;">
          <t-button @click="phrase1Con()">确认添加</t-button>
        </div>
      </div>

      <div v-if="modifyBool == 5">
        <div style="display: flex;justify-content: center;font-size: 18px;font-weight: 700;">添加近义词</div>
        <div style="display: flex;margin-top: 10px;">
          <div style="width: 50px;line-height: 28px;">词性:</div>
          <t-input :style="{ width: '70px' }" v-model="syno1.pos"></t-input>
          <div v-if="showSynoPos" style="font-size: 14px;color: red;line-height: 28px;margin-left: 10px;">*请填写词性</div>
        </div>

        <div style="display: flex;margin-top: 10px;">
          <div style="width: 50px;line-height: 28px;">词义:</div>
          <t-input :style="{ width: '70px' }" v-model="syno1.tran"></t-input>
          <div v-if="showSynoTran" style="font-size: 14px;color: red;line-height: 28px;margin-left: 10px;">*请填写对应词义</div>
        </div>

        <t-button style="margin-top: 10px;" @click="syno1add()">添加单词</t-button>
        <div v-for="item, index in syno1.hwds">
          <div style="border: 2px #82a0cf solid;border-radius: 25px;margin-top: 20px;">
            <div style="display: flex;margin-top: 30px;padding: 10px;">
              <div style="width: 50px;line-height: 28px;">单词{{ index + 1 }}</div>
              <t-input :style="{ width: '300px' }" v-model="item.w"></t-input>
              <t-button style="margin-left: 20px;" @click="syno1delete(index)">删除单词</t-button>
            </div>
          </div>
        </div>
        <div v-if="!syno1.hwds[0]" style="font-size: 14px;color: red;line-height: 28px;margin-left: 10px;">
          *请至少填写一个单词
        </div>
        <div v-if="showSynoDelete" style="font-size: 14px;color: red;line-height: 28px;margin-left: 10px;">*请填写空单词
        </div>

        <div style="display: flex;justify-content: center;margin-top: 20px;">
          <t-button @click="syno1Con()">确认添加</t-button>
        </div>
      </div>

    </t-dialog>

    <t-dialog width="800px" theme="info" header="单词书修改" @close="visibleBook = false" :visible.sync="visibleBook"
      :footer="false">

      <div style="display: flex;justify-content: center;">单词书名称修改</div>
      <div style="width: 300px;margin: 0 auto;margin-top: 10px;">
        <t-input v-model="bookName"></t-input>
      </div>

      <div style="margin-right: 70px;margin: 0  auto;width: 100px;line-height: 40px;margin-top: 30px;">单词书封面修改</div>
      <div style="display: flex;justify-content: center;">
        <t-upload v-model="image" action="/manager/manager/upload/file" theme="file" :draggable=draggable
          :headers="{ accessToken: accessToken }" :max="2" @onWaitingUploadFilesChange="console.log('发生变化')"
          @success="handleupload" @onRemove="remove1()" accept="image/*"></t-upload>
      </div>

      <!-- </div> -->
      <div style="width: 80px;margin: 0 auto;margin-top: 40px;">单词书描述</div>
      <div style="width: 400px;margin: 0 auto;">
        <t-textarea placeholder="请输入词汇书描述" v-model="bookDescription1" :autosize="{ minRows: 3, maxRows: 5 }"></t-textarea>
      </div>

      <div style="width: 80px;margin: 0 auto;margin-top: 40px;">标签修改</div>
      <div style="width: 700px;margin: 0 auto;border: 2px solid #82a0cf;border-radius: 25px;">
        <div v-if="labelArr.length != 0">
          <t-tag v-for="item, index in labelArr" theme="primary" style="margin: 10px;" closable
            @close="handleClose(index)">
            {{ item }}
          </t-tag>
        </div>
        <div v-else style="display: flex;justify-content: center;margin-top: 10px;margin-bottom: 10px;color: #8e98a8c5;">
          暂无标签
        </div>
      </div>
      <div style="display: flex;justify-content: center;margin-top: 10px;">
        <div>
          添加标签
        </div>
        <t-input v-model="labelAdd" placeholder="请输入标签内容" ref="input" size="small" style="width: 154px;margin-left: 10px;"
          @enter="handleInputEnter" />
      </div>
      <div style="display: flex;justify-content: center;margin-top: 20px;">
        <t-button @click="editLabel" size="large"> 确认修改 </t-button>
      </div>

    </t-dialog>

    <t-dialog width="800px" theme="info" header="单词资源修改" @close="closeModifyWord" :visible.sync="visibleResource"
      :footer="false">
      <!-- <video src=""></video> -->
      <div style="border: 2px solid #82a0cf;border-radius: 25px;">

        <div style="display: flex;justify-content: center;margin-top: 10px;">
          单词图片修改
        </div>
        <div style="display: flex;justify-content: center;margin-top: 10px;">
          <t-upload v-model="resourceImage" action="/manager/manager/upload/file" theme="file"
            :headers="{ accessToken: accessToken }" :max="100" @onWaitingUploadFilesChange="console.log('发生变化')"
            @success="handleuploadImage" @remove="removeImage" :files="resourceImage" multiple @validate="repite"
            accept="image/*"></t-upload>
          <!-- <div v-for="item in resourceImage">
            {{ item.name }}
          </div> -->
        </div>

        <div style="display: flex;justify-content: center;margin-top: 10px;">单词图片预览</div>
        <div style="display: flex;flex-direction: row;flex-wrap:wrap;justify-content: center;min-height: 120px;">
          <div v-for="item in resourceImage">
            <img style="width: 100px;height: 120px;margin: 10px;" :src=item.url>
          </div>
        </div>
      </div>
      <!-- <div v-for="item in resourceImage">
        {{ item }}
      </div> -->
      <div style="border: 2px solid #82a0cf;border-radius: 25px;margin-top: 30px;">
        <div style="display: flex;justify-content: center;margin-top: 10px;">
          视频文件上传
        </div>
        <div style="display: flex;justify-content: center;margin-top: 10px;">
          <t-upload v-model="resourceVideo" action="/manager/manager/upload/file" theme="file"
            :headers="{ accessToken: accessToken }" :max="100" @onWaitingUploadFilesChange="console.log('发生变化')"
            @success="handleuploadVideo" @remove="removeVideo" :files="resourceVideo" multiple @validate="repite"
            accept="video/*"></t-upload>
        </div>
        <div style="display: flex;justify-content: center;margin-top: 10px;">视频文件预览</div>
        <div style="display: flex;flex-direction: row;flex-wrap:wrap;justify-content: center;min-height: 120px;">
          <div v-for="item in resourceVideo">
            <video style="margin: 10px;width: 200px;height: 200px;" :src=item.url controls="true" preload="auto"
              webkit-playsinline="true" playsinline="true" object-fit="contain" x5-video-orientation="landscape"></video>
            <div>
              <!-- {{ item.url }} -->
            </div>
          </div>
        </div>
      </div>

      <div style="border: 2px solid #82a0cf;border-radius: 25px;margin-top: 30px;">
        <div style="display:flex;justify-content: center;margin-top: 10px;">美式发音上传</div>
        <div style="display: flex;justify-content: center;margin-top: 10px;">
          <t-upload v-model="resourceAudio" action="/manager/manager/upload/file" theme="file"
            :headers="{ accessToken: accessToken }" :max="100" @onWaitingUploadFilesChange="console.log('发生变化')"
            @success="handleuploadAudioUs" @remove="removeAudioUs" @validate="repite" accept="audio/*"></t-upload>
        </div>
        <div v-if="resourceAudioUs" style="display: flex;justify-content: center;margin-top: 10px;margin-bottom: 10px;">
          <audio :src=resourceAudioUs.url controls></audio>
        </div>
        <div style="height: 10px;"></div>
      </div>

      <div style="border: 2px solid #82a0cf;border-radius: 25px;margin-top: 30px;">
        <div style="display:flex;justify-content: center;margin-top: 10px;">英式式发音上传</div>
        <div style="display: flex;justify-content: center;margin-top: 10px;">
          <t-upload v-model="resourceAudio1" action="/manager/manager/upload/file" theme="file"
            :headers="{ accessToken: accessToken }" :max="100" @onWaitingUploadFilesChange="console.log('发生变化')"
            @success="handleuploadAudioUk" @remove="removeAudioUk" @validate="repite" accept="audio/*"></t-upload>
        </div>
        <div v-if="resourceAudioUk" style="display: flex;justify-content: center;margin-top: 10px;margin-bottom: 10px;">
          <audio :src=resourceAudioUk.url controls></audio>
        </div>
        <div style="height: 10px;"></div>
      </div>

      <div style="display: flex;justify-content: center;margin-top: 15px;">
        <t-button size="large" @click="resourceChange">
          确认更改资源
        </t-button>
      </div>


    </t-dialog>
  </div>
</template>

<script lang="tsx">
export default {
  name: 'OrderManage',
};
</script>
<script setup lang="tsx">
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, reactive, ref, watch } from 'vue';

// import { get, page } from '@/api/user/changdeguanli';
// import { delete9, page4 } from '@/api/user/dingdanguanlijiekou';
import { useRenewDataStore } from '@/store/renewData';

import {
  columns, columns2, visible, data2, visible2, data3, columns3, data5, columns4, visible3, isLoading2, isLoading3,
  allLoading, visible4, data6, columnsrels, columnsSen, columnsTran, columnsPrase, columnsSyno, word, visible5,
  arrIndex, keyWord, data7, row1, edit3, visibleNewWord, wordIndex, columnsWordSearch, bookID, visibleBook, row2, labelArr,
  bookDescription, imageUrl, bookDescription1, bookId1, bookid, visibleResource, headWord1, resourceImage,
  resourceVideo, bookName
} from './newFile';
import { addWord, group, page1, updateWord1 } from '@/api/user/bookApi';
import { triggerAsyncId } from 'async_hooks';
import { deleteWord, search, updateWord, upload } from '@/api/user/wordsApi';
import { fail } from 'assert';

// const visibleBook = ref(false)
// const imagefiles = ref([])
// const resourceImage = ref([])
const excelBookId = ref("")
const excel = ref([])
const visibleExcel = ref(false)
const resourceAudio = ref([])
// const resourceImage1 = ref([])
const resourceAudio1 = ref([])
const usUrl = ref("")
const resourceAudioUs = ref({})
const resourceAudioUk = ref({})
const labelAdd = ref("")
const draggable = ref(true)
const image = ref([])
const addWord1 = ref("")
const visibleWordAdd = ref(false)
const showSynoDelete = ref(false)
const syno1 = ref({ pos: "", tran: "", hwds: [{ w: "" }] })
const showSynoPos = ref(false)
const showSynoTran = ref(false)
const showSynoHwd = ref(false)
const phrase1 = ref([{ pcontent: "", pcn: "" }])
const tran1 = ref([{ tranCn: "" }])
const sentence1 = ref([{ scn: "", scontent: "" }])
const showPha = ref(false)
const showTran = ref(false)
const showWords = ref(false)
const showPos = ref(false)
const relWord1 = ref({ pos: "", words: [{ hwd: "", tran: "" }] })
const visibleModify = ref(false)
const store = useRenewDataStore();
const index = ref();
const data = ref([]);
const isLoading = ref(false)
const isloadingBook = ref(false)
const accessToken = ref<string | null>();
// const data2 = ref([]);
const selectedRowKeys = ref([]);
// const visible = ref(false)

// enum paymentMethod {
//   'WECHAT',
//   'CARD',
// }
// 暂存查询条件
const querySave = reactive({
  orderType: '',
  orderState: '',
  paymentMethods: '',
  sort: 'createTime',
  order: true,
  phoneNumber: '',
});

const image2 = ref("")

const handleupload = (value) => {
  // avatar.value=
  // image.value=
  console.log('内容', value)
  image2.value = value.response.result.url
  console.log('image2', image2.value)
  // console.log('imagevalue', value, value.response.result)
};

const handleuploadExcel = (value) => {
  if (value.response.code == 200) {
    MessagePlugin.success("上传成功")
    console.log('valueExcel', value)
    visibleExcel.value = false
    excel.value = []
    queryData({
      pageNumber: pagination.current,
      pageSize: pagination.pageSize,
      sort: 'createTime',
      order: 'desc',
    });
  }
}

const handleuploadAudioUk = (value) => {
  console.log('内容', value.response[0])
  resourceAudioUk.value = value.response.result
  console.log('resourceAudioUk', resourceAudioUk.value)
  // console.log('imagevalue', value, value.response.result)
};

const handleuploadAudioUs = (value) => {
  console.log('内容', value.response)
  resourceAudioUs.value = value.response.result
  // usUrl.value = resourceAudioUs.value.url
  console.log('resourceAudioUs', resourceAudioUs.value)
  // console.log('imagevalue', value, value.response.result)
};

const handleuploadImage = (value, index) => {
  console.log('内容', value)
  console.log('resourceImage', resourceImage.value)
  resourceImage.value.splice(resourceImage.value.length - 1, 1, value.response[0].result)
};

const handleuploadVideo = (value) => {
  console.log('内容', value)
  // console.log('resourceVideo1', resourceVideo1.value)
  console.log('resourceVideo', resourceVideo.value)
  resourceVideo.value.splice(resourceVideo.value.length - 1, 1, value.response[0].result)
  // console.log('imagevalue', value, value.response.result)
};

// 挂载时调用请求函数
onMounted(async () => {
  accessToken.value = localStorage.getItem('accessToken');
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

const ids1 = ref([])
const searchRes = ref([])
const searchWord = ref("")

const wordSearch = () => {
  // allLoading.value = true
  isloadingBook.value = true
  const params = {
    query: searchWord.value,
    pageNumber: paginationSearch.current,
    pageSize: paginationSearch.pageSize
  }
  search(params).then((res) => {
    // allLoading.value = false
    isloadingBook.value = false
    searchRes.value = res.result
    // paginationSearch.total = searchRes.value.length
  })
}

const paginationSearch = reactive({
  current: 1,
  pageSize: 10,
  total: 20,
});

const wordIndex1 = ref("")
const uploadWord = async () => {
  wordIndex1.value = addWord1.value.charAt(0)
  wordIndex.value = wordIndex1.value.toUpperCase()
  const params = {
    headWord: addWord1.value,
    bookId: bookID.value,
    wordIndex: wordIndex.value
  }
  addWord(params).then((res) => {
    console.log(res)
    if (res.code == 200) {
      MessagePlugin.success("单词添加成功")
    }
    if (res.code == 90006)
      MessagePlugin.error("单词已存在")
  })
}

const handleMoreDelete = async () => {
  try {
    const id = selectedRowKeys.value.join(); // 提取数组里面的字符串
    if (id === '') {
      MessagePlugin.error('未勾选删除项');
    } else {
      ids1.value = id.split(",")
      console.log('ids1', ids1.value)
      // const res = await delete11({ ids });
      // console.log('ids', ids)
      // console.log('批量删除后', res);
      // queryData({
      //   pageNumber: pagination.current,
      //   pageSize: pagination.pageSize,
      // });
      const params: API.deleteWordParams = {
        ids: ids1.value
      }
      deleteWord(params).then((res) => {
        edit3(row1.value)
      })
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

const modifyBool = ref(0)

const queryData = async (paginationInfo?, searchVo?: undefined, entityInfo?: undefined) => {
  try {
    isLoading.value = true
    console.log('请求', entityInfo, paginationInfo);
    const params = {
      entity: entityInfo,
      page: paginationInfo
    }
    const res = await page1(params); // 在此发送请求

    console.log('数据已送达', res);
    data.value = res.result.records; // 获得表格数据
    isLoading.value = false
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
const queryData2 = async () => {
  try {
    const params = {
      bookId: "1"
    }
    const res = await group(params); // 在此发送请求

    console.log('数据已送达', res);

    store.renewData = queryData;
    store.querySave = querySave;
  } catch (err) {
    console.log(err);
  }
};
const handleRowClick = (e) => {
  console.log(e);
};
const close = () => {
  visible.value = false
  data2.value = []
}

const close2 = () => {
  visible3.value = false
  data5.value = []
}

const close3 = () => {
  visible4.value = false
}
const close4 = () => {
  visible5.value = false
}

const console1 = () => {
  console.log('data6', data6.value);
}

const modify = (num) => {
  visibleModify.value = true
  modifyBool.value = num
  // if (num == 1) {
  //   //同根
  // }
  // if (num == 2) {
  //   //例句
  // }
  // if (num == 3) {
  //   //翻译

  // }
  // if (num == 4) {
  //   //短语

  // }
  // if (num == 5) {
  //   //近义

  // }
}

const relWord1add = () => {
  relWord1.value.words.push({ hwd: "", tran: "" })
}

const relWord1delete = (num) => {
  relWord1.value.words.splice(num, 1)
  if (showWords.value == true) {
    showWords.value = false
  }
}

const relWord1Con = () => {
  if (relWord1.value.words.length == 0) {
    return
  }
  for (const i in relWord1.value.words) {
    if (relWord1.value.words[i].hwd == "" || relWord1.value.words[i].tran == "") {
      showWords.value = true
      return
    }
  }
  if (relWord1.value.pos == "") {
    showPos.value = true
    showWords.value = false
    return
  }
  showPos.value = false
  showWords.value = false
  if (data6.value.relWord != null) {
    data6.value.relWord.rels.push(relWord1.value)
  }
  else {
    data6.value.relWord = { desc: "同根", rels: [] }
    data6.value.relWord.rels.push(relWord1.value)
  }
  visibleModify.value = false
  relWord1.value = ({ pos: "", words: [{ hwd: "", tran: "" }] })
}

const sentence1add = () => {
  sentence1.value.push({ scontent: "", scn: "" })
}

const sentence1delete = (num) => {
  sentence1.value.splice(num, 1)
  console.log('sentence', sentence1.value)
  if (showSentence.value == true) {
    showSentence.value = false
  }
}

const showSentence = ref(false)

const sentence1Con = () => {
  if (sentence1.value.length == 0) {
    return
  }
  for (const i in sentence1.value) {
    if (sentence1.value[i].scontent == "" || sentence1.value[i].scn == "") {
      showSentence.value = true
      return
    }
  }
  showSentence.value = false
  if (data6.value.sentence != null) {
    data6.value.sentence.sentences = data6.value.sentence.sentences.concat(sentence1.value)
  }
  else {
    data6.value.sentence = { sentences: sentence1.value, desc: "例句" }
  }
  console.log('data6.sentence', data6.value.sentence)
  visibleModify.value = false
  sentence1.value = ([{ scn: "", scontent: "" }])
}

const tran1add = () => {
  tran1.value.push({ tranCn: "" })
}

const tran1delete = (num) => {
  tran1.value.splice(num, 1)
  if (showTran.value == true) {
    showTran.value = false
  }
}

const tran1Con = () => {
  if (tran1.value.length == 0) {
    return
  }
  if (tran1.value[0].tranCn == "") {
    showTran.value = true
    return
  }
  showTran.value = false
  if (data6.value.trans != null) {
    data6.value.trans = data6.value.trans.concat(tran1.value)
  }
  else {
    data6.value.trans = tran1.value
  }
  visibleModify.value = false
  tran1.value = ([{ tranCn: "" }])
}

const phrase1add = () => {
  phrase1.value.push({ pcontent: "", pcn: "" })
}

const phrase1delete = (num) => {
  phrase1.value.splice(num, 1)
  if (showPha.value == true) {
    showPha.value = false
  }
}

const phrase1Con = () => {
  if (phrase1.value.length == 0) {
    return
  }
  if (phrase1.value[0].pcn == "" || phrase1.value[0].pcontent == "") {
    showPha.value = true
    return
  }
  showPha.value = false
  if (data6.value.phrase != null) {
    data6.value.phrase.phrases = data6.value.phrase.phrases.concat(phrase1.value)
  }
  else {
    data6.value.phrase = { phrases: phrase1.value, desc: "短语" }
  }
  console.log('phrase', data6.value.phrase)
  visibleModify.value = false
  phrase1.value = ([{ pcn: "", pcontent: "" }])
}

const syno1add = () => {
  syno1.value.hwds.push({ w: "" })
}

const syno1delete = (num) => {
  syno1.value.hwds.splice(num, 1)
  if (syno1.value.hwds.length == 0) {
    showSynoDelete.value = false
  }
}

const syno1Con = () => {
  if (syno1.value.hwds.length == 0) {
    return
  }
  for (const i in syno1.value.hwds) {
    if (syno1.value.hwds[i].w == "") {
      showSynoDelete.value = true
      return
    }
  }
  showSynoDelete.value = false
  if (syno1.value.pos == "" && syno1.value.tran == "") {
    showSynoPos.value = true
    showSynoTran.value = true
    return
  }
  if (syno1.value.pos == "" && syno1.value.tran != "") {
    showSynoPos.value = true
    showSynoTran.value = false
    return
  }
  if (syno1.value.pos != "" && syno1.value.tran == "") {
    showSynoTran.value = true
    showSynoPos.value = false
    return
  }
  showSynoPos.value = false
  showSynoTran.value = false
  if (data6.value.syno != null) {
    data6.value.syno.synos.push(syno1.value)
  }
  else {
    data6.value.syno = { synos: [], desc: "同近" }
    data6.value.syno.synos.push(syno1.value)
  }
  visibleModify.value = false
  syno1.value = ({ pos: "", tran: "", hwds: [{ w: "" }] })
}

const modifyData6 = () => {
  data7.value.content.word.content.sentence = data6.value.sentence
  data7.value.content.word.content.syno = data6.value.syno
  data7.value.content.word.content.phrase = data6.value.phrase
  data7.value.content.word.content.relWord = data6.value.relWord
  data7.value.content.word.content.trans = data6.value.trans
  // console.log('data7', data7.va lue)
  const params = {
    id: data7.value.id,
  }
  const data = {
    ...data7.value
  }
  updateWord(params, { data }).then((res) => {
    console.log('res', res.result)
  })
}

const newWordClose = () => {
  visibleNewWord.value = false
  searchRes.value = []
  searchWord.value = ""
}

const handleFail = () => {
  MessagePlugin.error("上传失败，请稍后再试")
}

const remove1 = () => {
  image.value = []
}

const removeImage = (value) => {
  // console.log('value', value.index)
  // console.log('resourceImage1.value', resourceImage1.value)
  // // resourceImage1.value.splice(value.index, 1)
  // console.log('resourceImage.value', resourceImage.value)
  // console.log('resourceImage1.value', resourceImage1.value)
}

const removeVideo = (value) => {
  // resourceVideo1.value.splice(value.index, 1)
  // console.log('resourceVideo1.value', resourceVideo1.value)
}
const removeAudioUs = (value) => {
  // resourceAudioUs.value = ""
  resourceAudioUs.value = null
}

const removeAudioUk = (value) => {
  resourceAudioUk.value = null
  // resourceAudioUk.value = ""
}

const handleClose = (index) => {
  labelArr.value.splice(index, 1)
}

const handleInputEnter = () => {
  if (labelAdd.value == "") {
    MessagePlugin.error("添加的标签不能为空")
    return
  }
  labelArr.value.push(labelAdd.value)
  console.log(labelArr.value, '222')
  labelAdd.value = ""
}

const labelString = ref("")
const imageUrl2 = ref("")

const editLabel = () => {
  allLoading.value = true
  console.log('labelArr', labelArr.value)
  for (const i in labelArr.value) {
    if (labelArr.value.length == 1) {
      labelString.value = labelString.value + "["
      labelString.value = labelString.value + labelArr.value[i]
      labelString.value = labelString.value + "]"
      break
    }
    if (Number(i) == 0) {
      labelString.value = labelString.value + "["
      labelString.value = labelString.value + labelArr.value[i]
      // labelString.value = labelString.value + "、"
      console.log('111')
    }
    else if (Number(i) == labelArr.value.length - 1) {
      labelString.value = labelString.value + "、"
      labelString.value = labelString.value + labelArr.value[i]
      labelString.value = labelString.value + "]"
      console.log('222')
    }
    else {
      labelString.value = labelString.value + "、"
      labelString.value = labelString.value + labelArr.value[i]
      console.log('333')
    }
    // console.log('i', i)
  }
  // console.log('labelString', labelString.value)
  if (image2.value != "") {
    imageUrl2.value = image2.value
  }
  else {
    imageUrl2.value = imageUrl.value
  }
  const params = {
    bookName: bookName.value,
    bookId: bookId1.value,
    url: imageUrl2.value,
    bookDescription: bookDescription1.value,
    label: labelString.value,
    id: bookid.value
  }
  updateWord1(params).then((res) => {
    allLoading.value = false
    console.log('res', res)
    labelString.value = ""
    visibleBook.value = false
    queryData({
      pageNumber: pagination.current,
      pageSize: pagination.pageSize,
      sort: 'createTime',
      order: 'desc',
    });
  })
}

const repite = (value) => {
  MessagePlugin.error("请勿重复上传")
  console.log('11', value)
}

const voices = ref([])

const resourceChange = () => {
  allLoading.value = true
  if (resourceAudioUs.value != "" || resourceAudioUs.value != null) {
    voices.value.push(resourceAudioUs.value)
  }
  if (resourceAudioUk.value != "" || resourceAudioUk.value != null) {
    voices.value.push(resourceAudioUk.value)
  }
  const params = {
    headword: headWord1.value,
  }
  const body = {
    images: resourceImage.value,
    videos: resourceVideo.value,
    voices: voices.value
  }
  console.log('params', params)
  upload(params, body).then((res) => {
    allLoading.value = false
    visibleResource.value = false
    MessagePlugin.success("修改成功")
    resourceImage.value = []
    resourceVideo.value = []
    resourceAudioUk.value = null
    resourceAudioUs.value = null
    resourceAudio1.value = null
    resourceAudio.value = null
  })
}

const closeModifyWord = () => {
  visibleResource.value = false
  resourceImage.value = []
  resourceVideo.value = []
  resourceAudioUk.value = null
  resourceAudioUs.value = null
  resourceAudio1.value = null
  resourceAudio.value = null
}

const closeExcel = () => {
  visibleExcel.value = false
}

const removeExcel = () => {
  excel.value = []
}

const excelFail = () => {
  MessagePlugin.error("单词书已存在，请更换bookId")
}

watch(searchWord, (newValue, oldValue) => {
  wordSearch()
});
</script>

<style lang="less" scoped></style>
