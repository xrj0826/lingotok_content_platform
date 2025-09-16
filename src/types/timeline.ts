/**
 * 时间轴数据结构 - 基于OpenCut架构
 * 实现非破坏性编辑和多轨道支持
 */

export type TrackType = "media" | "audio" | "text";

/**
 * 时间轴轨道
 */
export interface TimelineTrack {
  id: string;
  name: string;
  type: TrackType;
  elements: TimelineElement[];
  muted: boolean;
  isMain?: boolean; // 是否为主轨道
}

/**
 * 时间轴元素
 */
export interface TimelineElement {
  id: string;
  type: "media" | "text";
  name: string;
  startTime: number;      // 在时间轴上的开始时间(秒)
  duration: number;       // 原始媒体时长(秒)
  trimStart: number;      // 头部裁剪时间(秒)
  trimEnd: number;        // 尾部裁剪时间(秒)
  mediaId?: string;       // 关联的媒体文件ID
  muted?: boolean;
  hidden?: boolean;       // 是否隐藏
}

/**
 * 媒体文件
 */
export interface MediaFile {
  id: string;
  name: string;
  type: "video" | "audio" | "image";
  file: File;
  url: string;
  duration?: number;
  width?: number;
  height?: number;
  fps?: number;
  thumbnailUrl?: string;
}

/**
 * 创建时间轴元素的数据
 */
export interface CreateTimelineElement {
  type: "media" | "text";
  name: string;
  startTime: number;
  duration: number;
  trimStart?: number;
  trimEnd?: number;
  mediaId?: string;
  muted?: boolean;
}

/**
 * 项目设置
 */
export interface ProjectSettings {
  name: string;
  canvasSize: { width: number; height: number };
  fps: number;
  duration: number;
  backgroundType: "color" | "blur";
  backgroundColor?: string;
  blurIntensity?: number;
}

/**
 * 活动元素（用于渲染）
 */
export interface ActiveElement {
  element: TimelineElement;
  track: TimelineTrack;
  mediaItem: MediaFile | null;
}

/**
 * 视频帧数据
 */
export interface VideoFrame {
  canvas: HTMLCanvasElement;
  time: number;
}

/**
 * 渲染上下文
 */
export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  time: number;
  canvasWidth: number;
  canvasHeight: number;
  tracks: TimelineTrack[];
  mediaFiles: MediaFile[];
  backgroundType?: "color" | "blur";
  backgroundColor?: string;
  blurIntensity?: number;
  projectCanvasSize?: { width: number; height: number };
}

/**
 * 导出选项
 */
export interface ExportOptions {
  format: "mp4" | "webm";
  quality: "low" | "medium" | "high";
  fps: number;
  includeAudio: boolean;
  onProgress?: (progress: number) => void;
  onCancel?: () => boolean;
}

/**
 * 导出结果
 */
export interface ExportResult {
  success: boolean;
  buffer?: ArrayBuffer;
  error?: string;
}
