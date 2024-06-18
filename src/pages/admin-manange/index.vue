<!-- 客服管理 -->
<template>
  <div>
    <t-card>
      <t-space style="margin: 0 20px 20px 0">
        <add @add="AddFinsh"></add>
        <t-popconfirm
          content="确认删除吗"
          :on-confirm="handleMoreDelete"
        >
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
      <t-table
        :row-key="index"
        :data="data"
        :columns="columns"
        table-layout="fixed"
        :bordered="true"
        size="small"
        :pagination="pagination"
        cell-empty-content="-"
        resizable
        :loading="isLoading"
        :hover="true"
        :show-sort-column-bg-color="true"
        right-fixed-column="1"
        :selected-row-keys="selectedRowKeys"
        @row-click="handleRowClick"
        @select-change="onSelectChange"
        @change="onChange"
      >
      </t-table
    ></t-card>

    <t-dialog
      v-model:visible="visible"
      theme="info"
      header="更改读物名称"
      @close="visible = false"
      @confirm="edit()"
    >
      <t-input v-model="name"></t-input>
    </t-dialog>

    <t-dialog
      v-model:visible="visibleDetail"
      header="读物详情"
      width="1200px"
      :footer="false"
      @close="visibleDetail = false"
    >
      <div style="font-size: 16px; margin-bottom: 20px">读物类型：{{ readingDetailContent.name }}</div>
      <div style="display: flex; margin-bottom: 20px">
        <t-button @click="visibleUploadArticle = true">上传文章</t-button>
        <t-popconfirm
          content="确认删除吗"
          :on-confirm="handleMoreDeleteReading"
        >
          <t-button theme="danger"> 批量删除 </t-button>
        </t-popconfirm>
      </div>

      <div style="display: flex; justify-content: center; font-size: 16px; margin-bottom: 10px">文章列表</div>

      <t-table
        :row-key="index"
        :data="readingDetailContent.articlesList"
        :columns="columnsReading"
        table-layout="fixed"
        :bordered="true"
        size="small"
        cell-empty-content="-"
        resizable
        :loading="isLoading"
        :hover="true"
        :show-sort-column-bg-color="true"
        right-fixed-column="1"
        :selected-row-keys="selectedRowKeysReading"
        @row-click="handleRowClick"
        @select-change="onSelectChangeReading"
      >
        <template #picture="{ row }">
          <img
            :src="row.picture"
            style="width: 100px; height: 120px"
          />
        </template>
      </t-table>
    </t-dialog>

    <t-dialog
      v-model:visible="visibleEassy"
      header="文章详情"
      width="1000px"
      :footer="false"
      @close="visibleEassy = false"
    >
      <div style="font-size: 16px; margin-bottom: 20px">文章名称：{{ articlesContent.title }}</div>
      <div style="display: flex; margin-bottom: 20px">
        <t-button @click="visibleUploadExercise = true">上传练习</t-button>
        <t-popconfirm
          content="确认删除吗"
          :on-confirm="handleMoreDeleteExercise"
        >
          <t-button theme="danger"> 批量删除 </t-button>
        </t-popconfirm>
      </div>
      <div style="display: flex; justify-content: center; font-size: 16px; margin-bottom: 10px">练习列表</div>
      <t-table
        :row-key="index"
        :data="articlesContent.exercisesList"
        :columns="columnsEssay"
        table-layout="fixed"
        :bordered="true"
        size="small"
        cell-empty-content="-"
        resizable
        :loading="isLoading"
        :hover="true"
        :show-sort-column-bg-color="true"
        right-fixed-column="1"
        :selected-row-keys="selectedRowKeysEassy"
        @row-click="handleRowClick"
        @select-change="onSelectChangeEassy"
      >
      </t-table>
    </t-dialog>

    <t-dialog
      v-model:visible="visibleExercise"
      header="练习详情"
      width="1400px"
      :footer="false"
      @close="visibleExercise = false"
    >
      <div
        v-if="exercises.title"
        style="font-size: 16px; margin-bottom: 20px"
      >
        练习名称：{{ exercises.title }}
      </div>
      <div
        v-else
        style="font-size: 16px; margin-bottom: 20px"
      >
        暂无练习名称
      </div>
      <div style="display: flex; margin-bottom: 20px">
        <t-button @click="visibleUploadSen = true">上传句子</t-button>
        <t-button @click="visibleMerge = true"
          >句子资源列表({{
            (exercises.audioList?.length || 0) +
            (exercises.conetentList?.length || 0) +
            (exercises.translationList?.length || 0) +
            (exercises.videoList?.length || 0)
          }})</t-button
        >
        <t-popconfirm
          content="确认删除吗"
          :on-confirm="handleMoreDeleteSen"
        >
          <t-button theme="danger"> 批量删除 </t-button>
        </t-popconfirm>
      </div>
      <div style="display: flex; justify-content: center; font-size: 16px; margin-bottom: 10px; color: black">
        句子列表
      </div>
      <t-table
        :row-key="index"
        :data="exercises.sentenceList"
        :columns="columnsExercise"
        table-layout="fixed"
        :bordered="true"
        size="small"
        cell-empty-content="-"
        resizable
        :loading="isLoading"
        :hover="true"
        :show-sort-column-bg-color="true"
        right-fixed-column="1"
        :selected-row-keys="selectedRowKeysSen"
        @row-click="handleRowClick"
        @select-change="onSelectChangeSen"
      >
        <template #voiceUrl="{ row }">
          <audio
            v-if="row.voiceUrl"
            :autoplay="false"
            controls="controls"
            preload="meta"
            :src="row.voiceUrl"
          ></audio>
        </template>
        <template #videoUrl="{ row }">
          <video
            v-if="row.videoUrl"
            ref="videoRef"
            :src="row.videoUrl"
            width="200"
            height="100"
            :poster="row.videoUrl + '?vframe/jpg/offset/10/w/200/h/100'"
            preload="none"
            :autoplay="false"
            controls
          ></video>
        </template>
      </t-table>
    </t-dialog>
    <t-dialog
      v-model:visible="visibleMerge"
      header="句子资源列表"
      width="1500px"
      :footer="false"
      @close="visibleMerge = false"
    >
      <div
        v-if="exercises.title"
        style="font-size: 16px; margin-bottom: 20px"
      >
        练习名称：{{ exercises.title }}
      </div>
      <div
        v-else
        style="font-size: 16px; margin-bottom: 20px"
      >
        暂无练习名称
      </div>
      <div style="display: flex; margin-bottom: 20px">
        <div>
          <t-button
            :disabled="
              selectedRowKeysContent?.length > 1 ||
              selectedRowKeysTrans?.length > 1 ||
              selectedRowKeysAudio?.length > 1 ||
              selectedRowKeysVideo?.length > 1
            "
            @click="mergeInSentence"
            >组成句子</t-button
          >
          <p style="font-size: 10px; color: gray">每个资源列表最多只能选择一项！</p>
        </div>
        <!--        <div>
          <t-button @click="mergeInSentence">批量组成句子</t-button>
          <p style="font-size: 10px; color: gray">请保证每列勾选的数量一致</p>
        </div>-->
        <t-popconfirm
          content="确认删除吗"
          :on-confirm="handleMoreDeleteContent"
        >
          <t-button theme="danger"> 批量删除 </t-button>
        </t-popconfirm>
        <!--        <t-popconfirm
          content="确认删除吗"
          :on-confirm="handleMoreDeleteMerge"
        >
          <t-button theme="danger"> 批量删除 </t-button>
        </t-popconfirm>-->
      </div>
      <div style="display: grid; grid-template-columns: repeat(2, 47%); gap: 10px">
        <div
          style="
            text-align: center;
            font-size: 16px;
            margin-bottom: 10px;
            border: 1px solid #dddddd;
            border-radius: 20px;
            padding: 20px 0;
            position: relative;
          "
        >
          <div style="text-align: center; margin: 0 80px">
            原文资源
            <p>{{ exercises.contentFileName }}</p>
          </div>
          <div style="position: absolute; right: 10px; top: 10px">
            <t-button
              :disabled="selectedRowKeysContent?.length != 2"
              @click="handleMerge('content')"
              >合并</t-button
            >
          </div>
          <t-table
            v-if="exercises.conetentList"
            :row-key="id"
            :data="exercises.conetentList"
            :columns="columnsContent"
            drag-sort="row-handler"
            :sort="{ sortBy: 'rank', descending: false }"
            table-layout="fixed"
            size="small"
            cell-empty-content="-"
            resizable
            :loading="isLoading"
            :hover="true"
            :show-sort-column-bg-color="true"
            right-fixed-column="1"
            :selected-row-keys="selectedRowKeysContent"
            @drag-sort="(e) => onSortChange(e, 'content')"
            @row-click="handleRowClick"
            @select-change="onSelectChangeContent"
          >
            <template #content="{ row }">
              <div>
                <t-input
                  v-model="row.content"
                  style="min-width: 300px"
                  clearable
                  size="small"
                  borderless
                  placeholder="请输入内容"
                ></t-input>
              </div>
            </template>
          </t-table>
        </div>
        <div
          style="
            text-align: center;
            font-size: 16px;
            margin-bottom: 10px;
            border: 1px solid #dddddd;
            border-radius: 20px;
            padding: 20px 0;
            position: relative;
          "
        >
          <div style="text-align: center; margin: 0 80px">
            翻译资源
            <p>{{ exercises.translationFileName }}</p>
          </div>
          <div style="position: absolute; right: 10px; top: 10px">
            <t-button
              :disabled="selectedRowKeysTrans?.length != 2"
              @click="handleMerge('trans')"
              >合并</t-button
            >
          </div>
          <t-table
            v-if="exercises.translationList"
            :row-key="id"
            :data="exercises.translationList"
            :columns="columnsContent"
            table-layout="fixed"
            drag-sort="row-handler"
            size="small"
            cell-empty-content="-"
            resizable
            :loading="isLoading"
            :hover="true"
            :show-sort-column-bg-color="true"
            right-fixed-column="1"
            :selected-row-keys="selectedRowKeysTrans"
            @drag-sort="(e) => onSortChange(e, 'trans')"
            @row-click="handleRowClick"
            @select-change="onSelectChangeTrans"
          >
            <template #content="{ row }">
              <div>
                <t-input
                  v-model="row.content"
                  style="min-width: 300px"
                  clearable
                  size="small"
                  borderless
                  placeholder="请输入内容"
                ></t-input>
              </div>
            </template>
          </t-table>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(2, 47%); gap: 10px">
        <div
          style="
            text-align: center;
            font-size: 16px;
            margin-bottom: 10px;
            border: 1px solid #dddddd;
            border-radius: 20px;
            padding: 20px 0;
            position: relative;
          "
        >
          <div style="text-align: center; margin: 0 80px">
            音频资源
            <p>{{ exercises.audioFileName }}</p>
          </div>
          <div style="position: absolute; right: 10px; top: 10px">
            <t-button
              :disabled="selectedRowKeysAudio?.length != 2"
              @click="handleMerge('audio')"
              >合并</t-button
            >
          </div>
          <t-table
            v-if="exercises.audioList"
            :row-key="id"
            :data="exercises.audioList"
            :columns="columnsVideo"
            drag-sort="row-handler"
            table-layout="fixed"
            size="small"
            cell-empty-content="-"
            resizable
            :loading="isLoading"
            :hover="true"
            :show-sort-column-bg-color="true"
            right-fixed-column="1"
            :selected-row-keys="selectedRowKeysAudio"
            @drag-sort="(e) => onSortChange(e, 'audio')"
            @row-click="handleRowClick"
            @select-change="onSelectChangeAudio"
          >
            <template #url="{ row }">
              <audio
                :autoplay="false"
                controls="controls"
                preload="meta"
                :src="row.url"
              ></audio>
            </template>
          </t-table>
        </div>
        <div
          style="
            text-align: center;
            font-size: 16px;
            margin-bottom: 10px;
            border: 1px solid #dddddd;
            border-radius: 20px;
            padding: 20px 0;
            position: relative;
          "
        >
          <div style="text-align: center; margin: 0 80px">
            视频资源
            <p>{{ exercises.videoFileName }}</p>
          </div>
          <div style="position: absolute; right: 10px; top: 10px">
            <t-button
              :disabled="selectedRowKeysVideo?.length != 2"
              @click="handleMerge('video')"
              >合并</t-button
            >
          </div>
          <t-table
            v-if="exercises.videoList"
            :row-key="id"
            :data="exercises.videoList.slice((current - 1) * pageSize, current * pageSize)"
            :columns="columnsVideo"
            drag-sort="row-handler"
            table-layout="fixed"
            size="small"
            cell-empty-content="-"
            resizable
            :loading="isLoading"
            :hover="true"
            :show-sort-column-bg-color="true"
            right-fixed-column="1"
            :selected-row-keys="selectedRowKeysVideo"
            @drag-sort="(e) => onSortChange(e, 'video')"
            @row-click="handleRowClick"
            @select-change="onSelectChangeVideo"
          >
            <template #url="{ row }">
              <video
                ref="videoRef"
                :src="row.url"
                width="200"
                height="100"
                :poster="row.url + '?vframe/jpg/offset/10/w/200/h/100'"
                preload="none"
                :autoplay="false"
                controls
              ></video>
            </template>
          </t-table>
          <t-pagination
            v-model="current"
            v-model:pageSize="pageSize"
            :total="exercises?.videoList?.length"
            show-jumper
            @change="onPageChange"
            @page-size-change="onPageSizeChange"
            @current-change="onCurrentChange"
          />
        </div>
      </div>
    </t-dialog>

    <t-dialog
      v-model:visible="visibleUploadArticle"
      header="上传文章"
      width="1000px"
      :footer="false"
      @close="closeArticle()"
    >
      <div style="padding-left: 50px">
        <div style="display: flex">
          <div>文章数量</div>
          <div style="width: 100px; margin-left: 20px">
            <t-input v-model="articleCount" />
          </div>
        </div>

        <div style="display: flex; margin-top: 20px">
          <div>文章介绍</div>
          <div style="width: 500px; margin-left: 20px">
            <t-textarea
              v-model="articleIntroduction"
              placeholder="请输入文章介绍"
              name="description"
              :autosize="{ minRows: 3, maxRows: 10 }"
            />
          </div>
        </div>

        <div style="display: flex; margin-top: 20px">
          <div>文章封面</div>
          <div style="width: 500px; margin-left: 20px">
            <t-upload
              v-model="picture"
              action="/manager/manager/upload/file"
              theme="file"
              :headers="{ accessToken: accessToken }"
              :max="2"
              accept="image/*"
              @onWaitingUploadFilesChange="console.log('发生变化')"
              @success="pictureUpload"
              @remove="removePicture"
            ></t-upload>
          </div>
        </div>

        <div style="display: flex; margin-top: 20px">
          <div>文章标题</div>
          <div style="width: 300px; margin-left: 20px">
            <t-input v-model="articleTitle" />
          </div>
        </div>
      </div>

      <div style="display: flex; justify-content: center; margin-top: 20px">
        <t-button
          size="large"
          @click="articleUpload()"
          >确认上传</t-button
        >
      </div>
    </t-dialog>

    <t-dialog
      v-model:visible="visibleModifyArticle"
      header="修改文章"
      width="1000px"
      :footer="false"
      @close="closeArticleModify()"
    >
      <div style="padding-left: 50px">
        <div style="display: flex">
          <div>文章数量</div>
          <div style="width: 100px; margin-left: 20px">
            <t-input v-model="rowModifyArticle.articleCount" />
          </div>
        </div>

        <div style="display: flex; margin-top: 20px">
          <div>文章介绍</div>
          <div style="width: 500px; margin-left: 20px">
            <t-textarea
              v-model="rowModifyArticle.introduction"
              placeholder="请输入文章介绍"
              name="description"
              :autosize="{ minRows: 3, maxRows: 10 }"
            />
          </div>
        </div>

        <div style="display: flex; margin-top: 20px">
          <div>文章封面</div>
          <img
            style="width: 150px; height: 200px; margin-left: 20px"
            :src="rowModifyArticle.picture"
          />
        </div>

        <div style="display: flex; margin-top: 20px">
          <div>文章封面</div>
          <div style="width: 500px; margin-left: 20px">
            <t-upload
              v-model="pictureModify"
              action="/manager/manager/upload/file"
              theme="file"
              :headers="{ accessToken: accessToken }"
              :max="2"
              accept="image/*"
              @onWaitingUploadFilesChange="console.log('发生变化')"
              @success="pictureModifyUpload"
              @remove="removePicture"
            ></t-upload>
          </div>
        </div>

        <div style="display: flex; margin-top: 20px">
          <div>文章标题</div>
          <div style="width: 300px; margin-left: 20px">
            <t-input v-model="rowModifyArticle.title" />
          </div>
        </div>
      </div>

      <div style="display: flex; justify-content: center; margin-top: 20px">
        <t-button
          size="large"
          @click="articleUploadModify()"
          >确认修改</t-button
        >
      </div>
    </t-dialog>

    <t-dialog
      v-model:visible="visibleUploadExercise"
      header="上传练习"
      width="1000px"
      :footer="false"
      @close="closeExerciseUpload()"
    >
      <div style="padding-left: 50px">
        <div style="display: flex">
          <div>练习名称：</div>
          <div style="width: 100px; margin-left: 20px">
            <t-input v-model="exerciseTitle" />
          </div>
        </div>

        <div style="display: flex; margin-top: 20px">
          <div>练习难度：</div>
          <div style="margin-left: 20px">
            <t-radio-group
              variant="primary-filled"
              :default-value="defaultValue"
              @change="radioChange"
            >
              <t-radio-button value="EASY">easy</t-radio-button>
              <t-radio-button value="MIDDLE">middle</t-radio-button>
              <t-radio-button value="HARD">hard</t-radio-button>
            </t-radio-group>
          </div>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 20px; margin: 20px">
        <div style="display: flex; width: 500px">
          <div style="width: 130px">原文文档</div>
          <t-upload
            v-model="fileList.contentFileName"
            action="/manager/manager/upload/file"
            theme="file"
            :headers="{ accessToken: accessToken }"
            :max="1"
            @onWaitingUploadFilesChange="console.log('发生变化')"
            @success="(e) => fileUpload(e, 'contentFileName')"
            @remove="(e) => removeFile('contentFileName')"
          ></t-upload>
        </div>
        <div style="display: flex; width: 500px">
          <div style="width: 130px">翻译文档</div>
          <t-upload
            v-model="fileList.translationFileName"
            action="/manager/manager/upload/file"
            theme="file"
            :headers="{ accessToken: accessToken }"
            :max="1"
            @onWaitingUploadFilesChange="console.log('发生变化')"
            @success="(e) => fileUpload(e, 'translationFileName')"
            @remove="(e) => removeFile('translationFileName')"
          ></t-upload>
        </div>
        <div style="display: flex; width: 500px">
          <div style="width: 130px">音频文件</div>
          <t-upload
            v-model="fileList.audioFileName"
            action="/manager/manager/upload/file"
            theme="file"
            :headers="{ accessToken: accessToken }"
            :max="1"
            @onWaitingUploadFilesChange="console.log('发生变化')"
            @success="(e) => fileUpload(e, 'audioFileName')"
            @remove="(e) => removeFile('audioFileName')"
          ></t-upload>
        </div>
        <div style="display: flex; width: 500px">
          <div style="width: 130px">视频字幕文件</div>
          <t-upload
            v-model="fileList.videoSubtitleFileName"
            action="/manager/manager/upload/file"
            theme="file"
            :headers="{ accessToken: accessToken }"
            :max="1"
            @onWaitingUploadFilesChange="console.log('发生变化')"
            @success="(e) => fileUpload(e, 'videoSubtitleFileName')"
            @remove="(e) => removeFile('videoSubtitleFileName')"
          ></t-upload>
        </div>
        <!--        <minio-upload
          v-model:fileName="fileForm.contentFileName"
          :single="true"
          title="原文文档"
        />
        <minio-upload
          v-model:fileName="fileForm.translationFileName"
          :single="true"
          title="原文翻译文档"
        />
        <minio-upload
          v-model:fileName="fileForm.audioFileName"
          :single="true"
          title="音频文件"
        />-->
        <div style="display: flex; gap: 20px">
          <div>视频文件</div>
          <!--          <div>文件路径：<t-input placeholder="请输入文件路径"></t-input></div>-->
          <div>
            文件名：<t-input
              v-model="fileForm.videoFileName"
              placeholder="请输入文件名"
            ></t-input>
          </div>
        </div>
        <!--        <minio-upload
          v-model:fileName="fileForm.videoSubtitleFileName"
          :single="true"
          title="视频字幕文件"
        />-->
      </div>
      <div style="display: flex; justify-content: center; margin-top: 20px">
        <t-button
          size="large"
          @click="exerciseUpload()"
          >确认上传</t-button
        >
      </div>
    </t-dialog>

    <t-dialog
      v-model:visible="visivleModifyExercise"
      header="修改练习"
      width="1000px"
      :footer="false"
      @opened="setProgress()"
      @close="closeExerciseModify()"
    >
      <div style="padding-left: 50px">
        <div style="display: flex">
          <div>练习名称：</div>
          <div style="width: 400px; margin-left: 20px">
            <t-input v-model="modifyEx.title" />
          </div>
        </div>

        <div style="display: flex; margin-top: 20px">
          <div>练习难度：</div>
          <div style="margin-left: 20px; display: flex">
            <div
              :class="modifyEx.difficultyLevel == 'EASY' ? 'choose' : 'unchoose'"
              @click="levelChange('EASY')"
            >
              easy
            </div>
            <div
              :class="modifyEx.difficultyLevel == 'MIDDLE' ? 'choose' : 'unchoose'"
              style="margin-left: 10px"
              @click="levelChange('MIDDLE')"
            >
              middle
            </div>
            <div
              :class="modifyEx.difficultyLevel == 'HARD' ? 'choose' : 'unchoose'"
              style="margin-left: 10px"
              @click="levelChange('HARD')"
            >
              hard
            </div>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 20px; margin: 20px">
          上传完文件请先点击确认修改保存文件
          <div style="display: flex">
            <div style="width: 130px">原文文档</div>
            <div
              v-if="modifyEx.contentFileName"
              style="width: 200px; margin-right: 20px"
            >
              当前文件：
              {{ modifyEx.contentFileName }}
            </div>
            <t-upload
              v-model="fileList.contentFileName"
              action="/manager/manager/upload/file"
              theme="file"
              :headers="{ accessToken: accessToken }"
              :max="1"
              @onWaitingUploadFilesChange="console.log('发生变化')"
              @success="(e) => fileUpload(e, 'contentFileName')"
              @remove="(e) => removeFile('contentFileName')"
            ></t-upload>
          </div>
          <div style="display: flex">
            <div style="width: 130px">翻译文档</div>
            <div
              v-if="modifyEx.translationFileName"
              style="width: 200px; margin-right: 20px"
            >
              当前文件：
              {{ modifyEx.translationFileName }}
            </div>
            <t-upload
              v-model="fileList.translationFileName"
              action="/manager/manager/upload/file"
              theme="file"
              :headers="{ accessToken: accessToken }"
              :max="1"
              @onWaitingUploadFilesChange="console.log('发生变化')"
              @success="(e) => fileUpload(e, 'translationFileName')"
              @remove="(e) => removeFile('translationFileName')"
            ></t-upload>
          </div>
          <div style="display: flex">
            <div style="width: 130px">音频文件</div>
            <div
              v-if="modifyEx.audioFileName"
              style="width: 200px; margin-right: 20px"
            >
              当前文件：
              {{ modifyEx.audioFileName }}
            </div>
            <t-upload
              v-model="fileList.audioFileName"
              action="/manager/manager/upload/file"
              theme="file"
              :headers="{ accessToken: accessToken }"
              :max="1"
              @onWaitingUploadFilesChange="console.log('发生变化')"
              @success="(e) => fileUpload(e, 'audioFileName')"
              @remove="(e) => removeFile('audioFileName')"
            ></t-upload>
          </div>
          <div style="display: flex">
            <div style="width: 130px">视频字幕文件</div>
            <div
              v-if="modifyEx.videoSubtitleFileName"
              style="width: 200px; margin-right: 20px"
            >
              当前文件：
              {{ modifyEx.videoSubtitleFileName }}
            </div>
            <t-upload
              v-model="fileList.videoSubtitleFileName"
              action="/manager/manager/upload/file"
              theme="file"
              :headers="{ accessToken: accessToken }"
              :max="1"
              @onWaitingUploadFilesChange="console.log('发生变化')"
              @success="(e) => fileUpload(e, 'videoSubtitleFileName')"
              @remove="(e) => removeFile('videoSubtitleFileName')"
            ></t-upload>
          </div>
          <div style="display: flex">
            <div style="width: 130px">视频文件</div>
            <!--            <div>文件路径：<t-input placeholder="请输入文件路径"></t-input></div>-->
            <div>
              文件路径：<t-input
                v-model="modifyEx.videoFileName"
                placeholder="例如：/data/english/T.mp4"
              ></t-input>
            </div>
          </div>
        </div>
      </div>
      <div v-if="progressVisible && progressVal">
        {{ progressVal == '100' ? '视频分段完成' : '视频文件分段中' }}
        <t-progress
          theme="plump"
          :color="{ from: '#0052D9', to: '#00A870' }"
          :percentage="progressVal"
          :status="'active'"
        />
      </div>
      <div style="display: flex; justify-content: center; margin-top: 20px">
        <t-button
          size="large"
          @click="cutContentFun()"
          >文档分段</t-button
        >
        <t-button
          size="large"
          @click="cutAudioFun()"
          >音频分段</t-button
        >
        <t-popconfirm :on-confirm="cutVideoFun">
          <template #content>
            请先选择视频字幕类型
            <t-card>
              <t-radio-group v-model="type">
                <t-radio-button :value="1">类型1：Dialogue +时间戳</t-radio-button>
                <t-radio-button :value="2">类型2：单独时间戳</t-radio-button>
              </t-radio-group>
            </t-card>
          </template>
          <t-button size="large">视频分段</t-button>
        </t-popconfirm>

        <t-button
          size="large"
          @click="exerciseUploadModify()"
          >确认修改</t-button
        >
      </div>
    </t-dialog>

    <t-dialog
      v-model:visible="visibleUploadSen"
      header="上传句子"
      width="1000px"
      :footer="false"
      @close="closeSenUpload()"
    >
      <div style="padding: 20px">
        <div style="display: flex">
          <div>句子内容</div>
          <div style="margin-left: 20px; width: 400px">
            <t-textarea
              v-model="senUploadCon"
              placeholder="请输入句子内容"
              name="description"
              :autosize="{ minRows: 3, maxRows: 10 }"
            ></t-textarea>
          </div>
        </div>

        <div style="margin-top: 20px; display: flex">
          <div>句子翻译</div>
          <div style="margin-left: 20px; width: 400px">
            <t-textarea
              v-model="senUploadTran"
              placeholder="请输入句子翻译"
              name="description"
              :autosize="{ minRows: 3, maxRows: 10 }"
            ></t-textarea>
          </div>
        </div>
        <div style="display: flex; justify-content: center; margin-top: 20px">
          <t-button @click="senUpload()">确认上传</t-button>
        </div>
      </div>
    </t-dialog>

    <t-dialog
      v-model:visible="visibleModifySen"
      header="修改句子"
      width="1000px"
      :footer="false"
      @close="closeSenModify()"
    >
      <div style="display: flex; flex-direction: column; padding: 20px; gap: 30px">
        <div style="display: flex">
          <div>句子内容</div>
          <div style="margin-left: 20px; width: 400px">
            <t-textarea
              v-model="rowModifySen.content"
              placeholder="请输入句子内容"
              name="description"
              :autosize="{ minRows: 3, maxRows: 10 }"
            ></t-textarea>
          </div>
        </div>
        <div style="display: flex">
          <div>句子翻译</div>
          <div style="margin-left: 20px; width: 400px">
            <t-textarea
              v-model="rowModifySen.translation"
              placeholder="请输入句子翻译"
              name="description"
              :autosize="{ minRows: 3, maxRows: 10 }"
            ></t-textarea>
          </div>
        </div>
        <div style="display: flex; width: 500px">
          <div style="width: 130px">音频文件</div>
          <t-upload
            v-model="sentenceFiles.voiceUrl"
            action="/manager/manager/upload/file"
            theme="file"
            :headers="{ accessToken: accessToken }"
            :max="1"
            @success="(e) => sentenceFileUpload(e, 'voiceUrl')"
            @remove="(e) => sentenceRemoveFile('voiceUrl')"
          ></t-upload>
        </div>
        <div style="display: flex; width: 500px">
          <div style="width: 130px">视频文件</div>
          <t-upload
            v-model="sentenceFiles.videoUrl"
            action="/manager/manager/upload/file"
            theme="file"
            :headers="{ accessToken: accessToken }"
            :max="1"
            @success="(e) => sentenceFileUpload(e, 'videoUrl')"
            @remove="(e) => sentenceRemoveFile('videoUrl')"
          ></t-upload>
        </div>
        <div style="display: flex; justify-content: center; margin-top: 20px">
          <t-button @click="senModify()">确认修改</t-button>
        </div>
      </div>
    </t-dialog>

    <t-loading
      :loading="loading"
      text="加载中..."
      fullscreen
    />
  </div>
</template>

<script lang="tsx">
export default {
  name: 'AdminManager',
};
</script>
<script setup lang="tsx">
// import { SearchIcon } from 'tdesign-icons-vue-next';
import { number } from 'echarts';
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, reactive, ref } from 'vue';

import { delete8, save9, update8 } from '@/api/user/articles';
import {
  autoSplitContent,
  cutAudio,
  cutVideo,
  delete6,
  deleteSentenceResource,
  getProgress,
  mergeAudio,
  mergeSentence,
  mergeVideo,
  save8,
  update7,
  voiceASR,
} from '@/api/user/exercises';
import { delete4, page, update6 } from '@/api/user/readingMaterials';
import { delete2, save3, update1 } from '@/api/user/sentence';
import minioUpload from '@/components/minioUpload/index.vue';
// import { delete21, page10 } from '@/api/user/guanliyuan';
import { useRenewDataStore } from '@/store/renewData';

import {
  articleId,
  articlesContent,
  columns,
  columnsContent,
  columnsEssay,
  columnsExercise,
  columnsReading,
  columnsVideo,
  essayDetail,
  exerciseModifyLevel,
  exerciseModifyName,
  exercises,
  exercisesDetail,
  id,
  loading,
  modifyEx,
  name,
  readingDetail,
  readingDetailContent,
  readingId,
  rowArticle,
  rowEssay,
  rowExercise,
  rowModifyArticle,
  rowModifySen,
  rowReading,
  visible,
  visibleDetail,
  visibleEassy,
  visibleExercise,
  visibleModifyArticle,
  visibleModifySen,
  visivleModifyExercise,
} from './columnData';
import Add from './components/Add.vue';

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
const selectedRowKeysReading = ref([]);
const selectedRowKeysEassy = ref([]);
const selectedRowKeysExercise = ref([]);
const selectedRowKeysSen = ref([]);
const selectedRowKeysContent = ref([]);
const selectedRowKeysTrans = ref([]);
const selectedRowKeysAudio = ref([]);
const selectedRowKeysVideo = ref([]);
const articleCount = ref('0');
const articleIntroduction = ref('');
const picture = ref([]);
const articlePicture = ref('');
const articleTitle = ref('');
const readingMaterialId = ref('');
const visibleUploadArticle = ref(false);
const accessToken = ref<string | null>();
const articleCountModify = ref('0');
const articleIntroductionModify = ref('');
const pictureModify = ref([]);
const articlePictureModify = ref('');
const articleTitleModify = ref('');
const visibleUploadExercise = ref(false);
const exerciseTitle = ref('');
const defaultValue = ref('EASY');
const exerciseLevel = ref('EASY');
const visibleUploadSen = ref(false);
const visibleMerge = ref(false);
const senUploadCon = ref('');
const senUploadTran = ref('');

const current = ref(1);
const pageSize = ref(20);
const currentData = ref([]);

const onPageSizeChange = (size) => {
  pageSize.value = size;
};

const onCurrentChange = (index) => {
  current.value = index;
};

const onPageChange = (pageInfo) => {
  console.log(pageInfo);
};

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
      selectedRowKeys.value = [];
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
      readingDetail(rowReading.value);
      // console.log('rowEaasy', );
      MessagePlugin.success('删除成功');
      selectedRowKeysReading.value = [];
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
      selectedRowKeysExercise.value = [];
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
      essayDetail(rowArticle.value);
      MessagePlugin.success('删除成功');
      selectedRowKeysEassy.value = [];
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
      exercisesDetail(rowExercise.value);
      MessagePlugin.success('删除成功');
      selectedRowKeysSen.value = [];
    }
  } catch (error) {
    console.log(error);
  }
};
const handleMoreDeleteContent = async () => {
  try {
    const ids = [
      ...selectedRowKeysContent.value,
      ...selectedRowKeysTrans.value,
      ...selectedRowKeysAudio.value,
      ...selectedRowKeysVideo.value,
    ].join();
    if (ids === '') {
      MessagePlugin.error('未勾选删除项');
    } else {
      const res = await deleteSentenceResource({ ids });
      // console.log('批量删除后', res);
      // console.log('rowEaasy', );
      // exercisesDetail(rowExercise.value)
      exercisesDetail(rowExercise.value);
      MessagePlugin.success('删除成功');
      selectedRowKeysSen.value = [];
    }
  } catch (error) {
    console.log(error);
  }
};
const mergeInSentence = async () => {
  try {
    const ids = [
      ...selectedRowKeysContent.value,
      ...selectedRowKeysTrans.value,
      ...selectedRowKeysAudio.value,
      ...selectedRowKeysVideo.value,
    ].join();
    if (ids === '') {
      MessagePlugin.error('未勾选组合项');
    } else {
      /*      Math.min(
        selectedRowKeysContent.value.length,
        selectedRowKeysTrans.value,
        selectedRowKeysAudio.value,
        selectedRowKeysVideo.value,
      ); */
      console.log(exercises.value);
      const content = exercises.value.conetentList?.find((item) => selectedRowKeysContent.value[0] === item.id) || '';
      const translation =
        exercises.value.translationList?.find((item) => selectedRowKeysTrans.value[0] === item.id) || '';
      const audio = exercises.value.audioList?.find((item) => selectedRowKeysAudio.value[0] === item.id) || '';
      const video = exercises.value.videoList?.find((item) => selectedRowKeysVideo.value[0] === item.id) || '';
      const params = {
        exercisesId: rowExercise.value.id,
        content: content.content,
        translation: translation.content,
        voiceUrl: audio.url,
        videoUrl: video.url,
      };
      loading.value = true;
      save3(params).then(() => {
        MessagePlugin.success('句子组合成功');
        selectedRowKeysContent.value = [];
        selectedRowKeysTrans.value = [];
        selectedRowKeysAudio.value = [];
        selectedRowKeysVideo.value = [];
        exercisesDetail(rowExercise.value);
        loading.value = false;
        deleteSentenceResource({ ids });
      });
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
};

const onSelectChangeExercise = (value, params) => {
  selectedRowKeysExercise.value = value;
};

const onSelectChangeSen = (value, params) => {
  selectedRowKeysSen.value = value;
};
const onSelectChangeContent = (value, params) => {
  selectedRowKeysContent.value = value;
};
const onSelectChangeTrans = (value, params) => {
  selectedRowKeysTrans.value = value;
};
const onSelectChangeAudio = (value, params) => {
  selectedRowKeysAudio.value = value;
};
const onSelectChangeVideo = (value, params) => {
  selectedRowKeysVideo.value = value;
};
const onSortChange = (e, flag) => {
  if (flag === 'content') {
    exercises.value.conetentList = e.currentData;
  } else if (flag === 'trans') {
    exercises.value.translationList = e.currentData;
  } else if (flag === 'audio') {
    exercises.value.audioList = e.currentData;
  } else if (flag === 'video') {
    exercises.value.videoList = e.currentData;
  }
};
const handleMerge = async (flag) => {
  loading.value = true;
  if (flag === 'content') {
    const res = await mergeSentence({ ids: selectedRowKeysContent.value.join() });
    if (res.success) {
      MessagePlugin.success('合并成功');
      exercisesDetail(rowExercise.value);
      selectedRowKeysContent.value = [];
    }
  } else if (flag === 'trans') {
    const res = await mergeSentence({ ids: selectedRowKeysTrans.value.join() });
    if (res.success) {
      MessagePlugin.success('合并成功');
      exercisesDetail(rowExercise.value);
      selectedRowKeysTrans.value = [];
    }
  } else if (flag === 'audio') {
    const res = await mergeAudio({ ids: selectedRowKeysAudio.value.join() });
    if (res.success) {
      MessagePlugin.success('合并成功');
      exercisesDetail(rowExercise.value);
      selectedRowKeysAudio.value = [];
    }
  } else if (flag === 'video') {
    const res = await mergeVideo({ ids: selectedRowKeysVideo.value.join() });
    if (res.success) {
      MessagePlugin.success('合并成功');
      exercisesDetail(rowExercise.value);
      selectedRowKeysVideo.value = [];
    }
  }
  loading.value = false;
};

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
        name: name.value,
      };
      const res = await update6(params);
      console.log('批量删除后', res);
      queryData({
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
      });
      MessagePlugin.success('更改成功');
      visible.value = false;
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
const sentenceFiles = ref({ voiceUrl: [], videoUrl: [] });

const sentenceFileUpload = (value, name) => {
  rowModifySen.value[name] = value.response.result.url;
};
const sentenceRemoveFile = (name) => {
  sentenceFiles.value[name] = [];
};
const AddFinsh = (newData) => {
  console.log(newData);
  queryData({
    pageNumber: pagination.current,
    pageSize: pagination.pageSize,
  });
};
const fileUpload = (value, name) => {
  fileForm.value[name] = value.response.result.name;
};
const removeFile = (name) => {
  fileList.value[name] = [];
};
const pictureUpload = (value) => {
  articlePicture.value = value.response.result.url;
  console.log('articlePicture', articlePicture.value);
};

const pictureModifyUpload = (value) => {
  rowModifyArticle.value.picture = value.response.result.url;
  console.log('articlePicture', articlePicture.value);
};

const removePicture = () => {
  picture.value = [];
};

const articleUpload = () => {
  loading.value = true;
  const params = {
    articleCount: Number(articleCount.value),
    introduction: articleIntroduction.value,
    picture: articlePicture.value,
    title: articleTitle.value,
    readingMaterialId: rowReading.value.id,
  };
  save9(params).then((res) => {
    loading.value = false;
    readingDetail(rowReading.value);
    closeArticle();
  });
};

const closeArticle = () => {
  visibleUploadArticle.value = false;
  articleCount.value = '';
  articleIntroduction.value = '';
  articlePicture.value = '';
  picture.value = [];
  articleTitle.value = '';
};

const closeArticleModify = () => {
  visibleModifyArticle.value = false;
  pictureModify.value = [];
};

const articleUploadModify = () => {
  loading.value = true;
  const params = {
    articleCount: Number(rowModifyArticle.value.articleCount),
    introduction: rowModifyArticle.value.introduction,
    picture: rowModifyArticle.value.picture,
    title: rowModifyArticle.value.title,
    readingMaterialId: rowModifyArticle.value.readingMaterialId,
    id: rowModifyArticle.value.id,
  };
  update8(params).then((res) => {
    loading.value = false;
    closeArticleModify();
    readingDetail(rowReading.value);
  });
};
const fileForm = ref({
  audioFileName: '',
  videoFileName: '',
  videoSubtitleFileName: '',
  contentFileName: '',
  translationFileName: '',
});
const fileList = ref({
  audioFileName: [],
  videoFileName: [],
  videoSubtitleFileName: [],
  contentFileName: [],
  translationFileName: [],
});
const exerciseUploadModify = () => {
  loading.value = true;

  const omitNull = (obj) => {
    Object.keys(obj)
      .filter((k) => obj[k] === '')
      .forEach((k) => delete obj[k]);
    return obj;
  };
  modifyEx.value = { ...omitNull(modifyEx.value), ...omitNull(fileForm.value) };
  update7(modifyEx.value).then((res) => {
    loading.value = false;
    essayDetail(rowArticle.value);
    // closeExerxciseUpload()
    // closeExerciseModify();
    MessagePlugin.success('练习修改成功');
  });
};

const exerciseUpload = () => {
  loading.value = true;
  const params = {
    articleId: articleId.value,
    title: exerciseTitle.value,
    difficultyLevel: exerciseLevel.value,
    ...fileForm.value,
    /** 语音识别id */
    taskId: '',
  };
  save8(params).then((res) => {
    if (res.success) {
      loading.value = false;
      essayDetail(rowArticle.value);
      MessagePlugin.success('练习上传成功');
      if (fileForm.value.audioFileName) {
        voiceASR({ exerciseId: modifyEx.value.id });
      }
      closeExerciseUpload();
    }
  });
};
const cutContentFun = () => {
  autoSplitContent({ exerciseId: modifyEx.value.id }).then((res) => {
    if (res.success) {
      MessagePlugin.success('文档分段成功');
    }
  });
};
const cutAudioFun = () => {
  cutAudio({ exerciseId: modifyEx.value.id }).then((res) => {
    if (res.success) {
      MessagePlugin.success('音频分段成功');
    }
  });
};
const type = ref(1);
const cutVideoFun = () => {
  cutVideo({ exerciseId: modifyEx.value.id, filepath: modifyEx.value.videoFileName, type: type.value });
  clearInterval(progressInterval.value);
  progressInterval.value = null;
  getProgressMethods(modifyEx.value.id);
  progressInterval.value = setInterval(() => {
    getProgressMethods(modifyEx.value.id);
  }, 10000);
};
const progressInterval = ref(null);
const progressVisible = ref(false);
const progressVal = ref(0);
const setProgress = () => {
  getProgressMethods(modifyEx.value.id);
  progressInterval.value = setInterval(() => {
    getProgressMethods(modifyEx.value.id);
  }, 10000);
};
const getProgressMethods = (exerciseId) => {
  progressVisible.value = true;
  getProgress({ exerciseId }).then((res) => {
    if (res.result && res.success) {
      const nums = res.result.split('/');
      progressVal.value = Number(Number((Number(nums[0]) / Number(nums[1])) * 100).toFixed(2));
      if (progressVal.value == '100') {
        clearInterval(progressInterval.value);
        progressInterval.value = null;
        MessagePlugin.success('视频分段完成');
      }
    } else {
      // MessagePlugin.error('视频分段失败');
      progressVisible.value = false;
      clearInterval(progressInterval.value);
      progressInterval.value = null;
    }
  });
};
const closeExerciseUpload = () => {
  visibleUploadExercise.value = false;
  exerciseTitle.value = '';
  defaultValue.value = 'EASY';
  exerciseLevel.value = 'EASY';
};

const radioChange = (value) => {
  exerciseLevel.value = value;
};

const closeExerciseModify = () => {
  visivleModifyExercise.value = false;
  clearInterval(progressInterval.value);
  progressInterval.value = null;
};

const closeSenUpload = () => {
  visibleUploadSen.value = false;
  senUploadCon.value = '';
  senUploadTran.value = '';
};

const closeSenModify = () => {
  visibleModifySen.value = false;
};

const levelChange = (level) => {
  modifyEx.value.difficultyLevel = level;
};

const senUpload = () => {
  loading.value = true;
  const params = {
    exercisesId: rowExercise.value.id,
    content: senUploadCon.value,
    translation: senUploadTran.value,
  };
  save3(params).then(() => {
    MessagePlugin.success('句子上传成功');
    loading.value = false;
    exercisesDetail(rowExercise.value);
    closeSenUpload();
  });
};

const senModify = () => {
  loading.value = true;
  update1(rowModifySen.value).then(() => {
    MessagePlugin.success('句子修改成功');
    loading.value = false;
    exercisesDetail(rowExercise.value);
    closeSenModify();
  });
};
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
