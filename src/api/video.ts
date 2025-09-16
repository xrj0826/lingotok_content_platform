import axios from 'axios';
import { generateRequestParams } from '@/utils/crypto';

const API_BASE_URL = 'https://api.lingotok.ai';

export async function getAllSeriesName() {
  const apiName = 'get_all_series_name';
  const params = generateRequestParams(apiName);

  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/video/${apiName}`,
      {}, // 空对象作为请求体
      {
        headers: {
          'Timestamp': params.Timestamp.toString(),
          'Signature': params.Signature
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('获取系列名称失败:', error);
    throw error;
  }
}

// 确认上传视频到系列
export async function confirmVideoUpload(params: {
  series_id: string;
  videos: Array<{
    name: string;
    url: string;
    size: number;
  }>;
}) {
  const apiName = 'confirm_video_upload';
  const requestParams = generateRequestParams(apiName);

  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/video/${apiName}`,
      params,
      {
        headers: {
          'Timestamp': requestParams.Timestamp.toString(),
          'Signature': requestParams.Signature
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('确认上传视频失败:', error);
    throw error;
  }
}

// 提交单个视频信息
export async function handleVideoSubmit(params: {
  username: string;
  series_name: string;
  video_url: string;
  title: string;
}) {
  const apiName = 'upload_video';
  const requestParams = generateRequestParams(apiName);

  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/video/${apiName}`,
      params,
      {
        headers: {
          'Timestamp': requestParams.Timestamp.toString(),
          'Signature': requestParams.Signature
        }
      }
    );

    if (response.data?.code !== 0) {
      throw new Error(response.data?.message || '上传失败');
    }

    return response.data;
  } catch (error) {
    console.error('提交视频信息失败:', error);
    throw error;
  }
} 