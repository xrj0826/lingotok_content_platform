<template>
  <div>
    <t-row :gutter="16">
      <t-col :span="8">
        <div class="max-title">仪表盘</div>
        <div style="margin-top: 14px; color: rgb(84, 87, 122); font-family: Poppins; font-size: 18px; font-weight: 500">
          查看你的工作数据
        </div>
        <t-space align="center" size="0">
          <div class="mini-title">过去30天数据</div>
          <t-icon name="help-circle"></t-icon>
        </t-space>
        <t-row :gutter="30">
          <t-col :span="4">
            <t-card>
              <t-row justify="center" align="center" style="height: 120px">
                <t-list-item-meta class="normal active" :image="loveImage" title="5枚" description="￥5"></t-list-item-meta>
              </t-row>
            </t-card>
          </t-col>
          <t-col :span="4">
            <t-card>
              <t-row justify="center" align="center" style="height: 120px">
                <t-list-item-meta class="normal active" :image="loveImage" title="5枚" description="￥5"></t-list-item-meta>
              </t-row>
            </t-card>
          </t-col>
          <t-col :span="4">
            <t-card>
              <t-row justify="center" align="center" style="height: 120px">
                <t-list-item-meta class="normal active" :image="loveImage" title="5枚" description="￥5"></t-list-item-meta>
              </t-row>
            </t-card>
          </t-col>
        </t-row>
        <t-card style="margin-top: 15px">
          <div class="mini-title">任务</div>
          <div id="monitorContainer" class="dashboard-chart-container"
            :style="{ width: '100%', height: `${resizeTime * 326}px` }" />
        </t-card>
        <t-row justify="space-between" style="margin: 10px 0">
          <div class="mediumn" style="color: rgb(20, 21, 34); font-family: Poppins; font-size: 24px; font-weight: 600">
            进行中的任务
          </div>
          <t-space>
            <t-icon name="chevron-left" size="24px"></t-icon>
            <t-icon name="chevron-right" size="24px"></t-icon>
          </t-space>
        </t-row>
        <t-row :gutter="16">
          <t-col :span="6">
            <t-card>
              <t-image src="http://pic.lvmama.com/uploads/pc/place2/2017-11-24/19e96e3c-ba34-4dc4-8b17-62b3aa595cf9.jpg"
                style="width: 100%; height: 160px"></t-image>
              <div class="mini-title">英语文章翻译</div>
              <div>文案/翻译</div>
              <t-row>
                <t-col :span="6"> 金额</t-col>
                <t-col :span="6">50000.0元</t-col>
              </t-row>
              <t-row>
                <t-col :span="6">任务状态</t-col>
                <t-col :span="6">
                  <t-tag theme="warning">合作中</t-tag>
                </t-col>
              </t-row>
              <t-row>
                <t-col :span="6">
                  <t-space align="center" size="0">
                    <t-icon name="history"></t-icon>
                    3天后截止
                  </t-space>
                </t-col>
                <t-col :span="6">
                  <t-space align="center" size="0">
                    <t-icon name="books"></t-icon>
                    <div>任务编号:10021343</div>
                  </t-space>
                </t-col>
              </t-row>
            </t-card>
          </t-col>
          <t-col :span="6">
            <t-card>
              <t-image src="http://pic.lvmama.com/uploads/pc/place2/2017-11-24/19e96e3c-ba34-4dc4-8b17-62b3aa595cf9.jpg"
                style="width: 100%; height: 160px"></t-image>
              <div class="mini-title">英语文章翻译</div>
              <div>文案/翻译</div>
              <t-row>
                <t-col :span="6"> 金额</t-col>
                <t-col :span="6">50000.0元</t-col>
              </t-row>
              <t-row>
                <t-col :span="6">任务状态</t-col>
                <t-col :span="6">
                  <t-tag theme="warning">合作中</t-tag>
                </t-col>
              </t-row>
              <t-row>
                <t-col :span="6">
                  <t-space align="center" size="0">
                    <t-icon name="history"></t-icon>
                    3天后截止
                  </t-space>
                </t-col>
                <t-col :span="6">
                  <t-space align="center" size="0">
                    <t-icon name="books"></t-icon>
                    <div>任务编号:10021343</div>
                  </t-space>
                </t-col>
              </t-row>
            </t-card>
          </t-col>
        </t-row>
      </t-col>
      <t-col :span="4">
        <t-card>
          <t-row justify="space-between">
            <t-list-item-meta title="Hi Shakir" description="早上好!"></t-list-item-meta>
            <t-space direction="vertical" size="0" align="center">
              <t-badge :count="12">
                <div class="badge-block">
                  <t-icon name="notification" size="25px"></t-icon>
                </div>
              </t-badge>
              <div>消息中心</div>
            </t-space>
          </t-row>
          <user-card id="4124321312" :name="'AR Shakir'" :score="4.7" :score-number="7" service="11" compare="12"
            done="21" :status="0" avatar-url="https://avatars.githubusercontent.com/Wen1kang"></user-card>
          <t-row justify="center" style="margin-top: 15p">
            <t-space>
              <t-button theme="primary">简历详情</t-button>
              <t-button>基本资料</t-button>
            </t-space>
          </t-row>
        </t-card>
        <t-card title="今日任务推荐">
          <template #actions>
            <t-space align="center" size="0">
              <t-icon name="books"></t-icon>
              <div>任务编号:10021343</div>
            </t-space>
          </template>
          <t-image src="http://pic.lvmama.com/uploads/pc/place2/2017-11-24/19e96e3c-ba34-4dc4-8b17-62b3aa595cf9.jpg"
            style="width: 100%; height: 160px"></t-image>
          <t-row style="margin-bottom: 7px" justify="space-between" align="center">
            <div class="mini-title">安卓开发平板APP开发</div>
            <div>任务预算</div>
          </t-row>
          <t-row style="margin-bottom: 7px" justify="space-between">
            <div>Andorid /后端开发/平板应用</div>
            <div style="color: rgb(84, 111, 255); font-family: Poppins; font-size: 16px; font-weight: 500">
              50000.0元
            </div>
          </t-row>
          <t-row justify="space-between">
            <div>发布时间: 2022年11月1日</div>
            <div>50天</div>
            <div>投标情况: 11/20</div>
          </t-row>
          <t-space style="margin-top: 10px" align="center">
            <t-avatar size="40px" image="https://avatars.githubusercontent.com/Wen1kang"></t-avatar>
            <div style="color: rgb(20, 21, 34); font-family: Poppins; font-size: 16px; font-weight: 600">
              AbrahamLincol
            </div>
          </t-space>
          <div class="mini-title">项目简介</div>
          <div style="background: rgb(245, 245, 247); padding: 20px">
            熟悉react native框架，我们要从ChatGPT要提取一些信息，生成相关的文字图片。 核心功能基于react
            native框架已经开发了需要转成微信小程序代码，增加一些常见功能，比如支付功能。可以在微信上架
          </div>
        </t-card>
      </t-col>
    </t-row>
  </div>
</template>
<script lang="tsx">
export default {
  name: 'DashboardBase',
};
</script>
<script setup lang="tsx">
import { LineChart, PieChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { computed, nextTick, onMounted, ref } from 'vue';

import UserCard from '@/components/user/index.vue';
import { useSettingStore } from '@/store';

import { getLineChartDataSet } from './index';

echarts.use([TooltipComponent, LegendComponent, PieChart, GridComponent, LineChart, CanvasRenderer]);
const loveImage = () => {
  return (
    <svg class="icon" aria-hidden="true" style={{ fontSize: '30px', color: 'red' }}>
      <use xlinkHref="#icon-game"></use>
    </svg>
  );
};
/* 折线图 */
const resizeTime = ref(1);
const store = useSettingStore();
const chartColors = computed(() => store.chartColors);
let monitorContainer: HTMLElement;
let monitorChart: echarts.ECharts;
const renderMonitorChart = () => {
  if (!monitorContainer) {
    monitorContainer = document.getElementById('monitorContainer');
  }
  monitorChart = echarts.init(monitorContainer);
  monitorChart.setOption(getLineChartDataSet({ ...chartColors.value }));
};
const renderCharts = () => {
  renderMonitorChart();
};
const updateContainer = () => {
  if (document.documentElement.clientWidth >= 1400 && document.documentElement.clientWidth < 1920) {
    resizeTime.value = Number((document.documentElement.clientWidth / 2080).toFixed(2));
  } else if (document.documentElement.clientWidth < 1080) {
    resizeTime.value = Number((document.documentElement.clientWidth / 1080).toFixed(2));
  } else {
    resizeTime.value = 1;
  }

  monitorChart.resize({
    width: monitorContainer.clientWidth,
    height: resizeTime.value * 326,
  });
};
onMounted(() => {
  renderCharts();
  nextTick(() => {
    updateContainer();
  });
  window.addEventListener('resize', updateContainer, false);
});
</script>

<style lang="less" scoped>
.badge-block {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 40px;
  height: 40px;
  background: #eeeeee;
  border: 1px solid #dcdcdc;
  border-radius: 3px;
}
</style>
