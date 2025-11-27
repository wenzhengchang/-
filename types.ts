// 定义灵感记录的数据结构
export interface Thought {
  id: string;
  content: string;
  createdAt: string; // ISO string
  tags: string[];
}

// 定义总结文档的数据结构
export interface Summary {
  id: string;
  date: string; // YYYY-MM-DD
  content: string; // Markdown content
  createdAt: string;
}

// 应用视图状态
export enum ViewState {
  CAPTURE = 'CAPTURE',
  HISTORY = 'HISTORY',
  SUMMARY = 'SUMMARY'
}

// AI 处理状态
export enum AIStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}