/**
 * 文件上传相关工具函数
 */

/**
 * 获取最大公约数
 * @param a 数字a
 * @param b 数字b
 * @returns 最大公约数
 */
function getGcd(a: number, b: number): number {
  let n1: number, n2: number;
  if (a > b) {
    n1 = a;
    n2 = b;
  } else {
    n1 = b;
    n2 = a;
  }
  const remainder = n1 % n2;
  if (remainder === 0) {
    return n2;
  } else {
    return getGcd(n2, remainder);
  }
}

/**
 * 视频信息接口
 */
export interface VideoInfo {
  width: number;      // 视频宽度
  height: number;     // 视频高度
  duration: number;   // 视频时长(秒)
  ccbl: number[];     // 尺寸比例
}

/**
 * 检查视频文件大小和信息
 * @param files 文件列表
 * @param isVideo 是否为视频文件
 * @returns Promise<VideoInfo>
 */
const checkSize = async (files: FileList | File[] | null, isVideo: boolean = false): Promise<VideoInfo | false> => {
  if (!files || !files[0]) return false;

  const checktimevideo = document.getElementById('checktimevideo');
  if (checktimevideo) {
    document.body.removeChild(checktimevideo);
  }

  let doms: HTMLVideoElement | HTMLAudioElement;
  if (!isVideo) {
    doms = document.createElement('video') as HTMLVideoElement;
  } else {
    doms = document.createElement('audio') as HTMLAudioElement;
  }

  const url = URL.createObjectURL(files[0]);
  console.log(url);
  doms.src = url;
  doms.id = 'checktimevideo';
  doms.style.display = 'none';
  document.body.appendChild(doms);

  return await gettime(doms as HTMLVideoElement);
};

/**
 * 获取视频时长和尺寸信息
 * @param doms 视频元素
 * @returns Promise<VideoInfo>
 */
const gettime = (doms: HTMLVideoElement): Promise<VideoInfo> => {
  // 由于loadedmetadata是异步代码所以需要promise进行封装转换为同步代码执行
  const promise = new Promise<VideoInfo>((resolve) => {
    doms.addEventListener('loadedmetadata', (e) => {
      const target = e.target as HTMLVideoElement;
      const gcd = getGcd(target.videoWidth || 640, target.videoHeight || 360);

      const obj: VideoInfo = {
        width: doms.videoWidth || 640,        // 尺寸宽 --- 分辨率
        height: doms.videoHeight || 360,      // 尺寸高
        duration: Number(target.duration?.toFixed(2) || 0), // 视频时长 1表示一秒
        ccbl: [(target.videoWidth || 640) / gcd, (target.videoHeight || 360) / gcd] // 计算尺寸比例
      };
      resolve(obj);
    });
  });
  return promise;
};

export default checkSize;
