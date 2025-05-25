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