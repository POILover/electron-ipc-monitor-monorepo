<template>
  <div class="monitor-container">
    <div class="main-content" :class="{ 'panel-open': isPanelOpen }">
      <div class="table-container">
        <table class="monitor-table">
          <thead>
            <tr>
              <th>Channel</th>
              <th>Status</th>
              <th>Time</th>
              <th>Size</th>
              <th>Start Time</th>
            </tr>
          </thead>
          <tbody ref="tbodyRef">
            <tr v-for="(log, index) in monitorLogs" :key="index" :class="getRowClass(log, index)">
              <td class="channel-cell clickable" @click="openPanel(log, index)">{{ log.channel }}</td>
              <td class="status-cell">
                <span :class="getStatusClass(log.status)">{{ getStatusText(log.status) }}</span>
              </td>
              <td class="perf-cell">{{ formatPerf(log) }}</td>
              <td class="size-cell">{{ formatSize(log.result) }}</td>
              <td class="time-cell">{{ formatTime(log.startTime) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 右侧面板 -->
      <div class="details-panel" v-if="isPanelOpen">
        <div class="panel-header">
          <span class="close-btn" @click="closePanel">×</span>
          <span>{{ selectedLog?.channel }}</span>
        </div>
        <div class="panel-tabs">
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'payload' }"
            @click="activeTab = 'payload'"
          >
            Payload
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'response' }"
            @click="activeTab = 'response'"
          >
            Response
          </button>
        </div>
        <div class="panel-content">
          <div v-if="activeTab === 'payload'" class="tab-content">
            <vue-json-pretty 
              :data="selectedLog?.args" 
              :showLength="true"
              :showLine="true"
              :showDoubleQuotes="true"
              :showIcon="true"
              :deep="4"
            />
          </div>
          <div v-if="activeTab === 'response'" class="tab-content">
            <vue-json-pretty 
              :data="selectedLog?.result" 
              :showLength="true"
              :showLine="true"
              :showDoubleQuotes="true"
              :showIcon="true"
              :deep="4"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { nextTick, onMounted, ref } from 'vue';
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';

const monitorLogs = ref<any[]>([]);
const isPanelOpen = ref(false);
const selectedLog = ref<any>(null);
const selectedRowIndex = ref<number>(-1);
const activeTab = ref<'payload' | 'response'>('payload');

// 打开面板
const openPanel = (log: any, index: number) => {
  selectedLog.value = log;
  selectedRowIndex.value = index;
  isPanelOpen.value = true;
  // 保持当前的 tab 选择，不重置为 payload
};

// 关闭面板
const closePanel = () => {
  isPanelOpen.value = false;
  selectedLog.value = null;
  selectedRowIndex.value = -1;
};

// 格式化函数

const formatSize = (result: any) => {
  if (!result) return '0 B';
  const str = JSON.stringify(result);
  const bytes = new Blob([str]).size;
  
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};
const tbodyRef = ref<HTMLTableSectionElement | null>(null);
const scrollToBottom = () => {
  nextTick(() => {
    if (tbodyRef.value) {
      tbodyRef.value.scrollTop = tbodyRef.value.scrollHeight;
    }
  });
};

const formatTime = (timestamp: number) => {
  if (!timestamp) return '-';
  return new Date(timestamp).toLocaleTimeString();
};

const formatPerf = (log: any) => {
  if(log.status === 'pending'){
    return 'pending'
  }
  const perf = log.perf || 0;
  return perf > 1000 ? `${(perf / 1000).toFixed(2)}s` : `${(perf).toFixed(2)}ms`;
};

const getStatusText = (status: string) => {
  // TODO: i18n
  const statusMap: Record<string, string> = {
    'pending': 'pending',
    'fulfilled': 'success',
    'rejected': 'failed'
  };
  return statusMap[status] || status;
};

const getStatusClass = (status: string) => {
  return `status status-${status}`;
};

const getRowClass = (log: any, index: number) => {
  const baseClass = `row-${log.status}`;
  const selectedClass = selectedRowIndex.value === index ? 'row-selected' : '';
  return `${baseClass} ${selectedClass}`.trim();
};

onMounted(async () => {
  window.monitorApi.getMonitorData(data => {
    if (data.status === 'pending') {
      data.startTime = Date.now() // 记录实际开始时间
      monitorLogs.value.push(data)
      scrollToBottom()
    }
    if (data.status === 'fulfilled') {
      const index = monitorLogs.value.findIndex(item => item.id === data.id)
      const pendingData = { ...monitorLogs.value[index] }
      if (index !== -1) {
        data.startTime = pendingData.startTime
        data.perf = data.perf - pendingData.perf // 计算耗时
        monitorLogs.value[index] = data
      }
    }
    if (data.status === 'rejected') {
      const index = monitorLogs.value.findIndex(item => item.id === data.id)
      if (index !== -1) {
        const pendingData = { ...monitorLogs.value[index] }
        data.startTime = pendingData.startTime
        data.perf = data.perf - pendingData.perf
        monitorLogs.value[index] = data
      }
    }

  });
});
</script>

<style scoped lang="scss">
@use "sass:color";

// 变量定义
$primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
$primary-color: #667eea;
$secondary-color: #764ba2;
$white: #ffffff;
$gray-600: #666;
$gray-500: #555;

// 状态颜色
$pending-color: #fdcb6e;
$pending-bg: #ffeaa7;
$success-color: #00b894;
$success-bg: #00cec9;
$error-color: #e17055;
$error-bg: #d63031;

.monitor-container {
  background: $primary-gradient;
  height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow: hidden;
}

.main-content {
  display: flex;
  height: 100vh;
  // transition: all 0.3s ease;

  &.panel-open .table-container {
    width: 60%;
  }
}

// 表格容器
.table-container {
  background: rgba($white, 0.95);
  // border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  width: 100%;
  transition: width 0.3s ease;

  // 滚动条样式
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: $primary-gradient;
    border-radius: 4px;

    &:hover {
      background: linear-gradient(135deg, color.scale($primary-color, $lightness: -10%), color.scale($secondary-color, $lightness: -10%));
    }
  }
}

.details-panel {
  width: 40%;
  background: rgba($white, 0.95);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease;
  overflow: hidden;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.panel-header {
  height: 34px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  gap: 10px;
  padding: 0 4px;
  display: flex;
  align-items: center;
  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: #666;
    cursor: pointer;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(0, 0, 0, 0.1);
      color: #333;
    }
  }
}


.panel-tabs {
  display: flex;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.tab-btn {
  flex: 1;
  padding: 10px 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #333;
  }

  &.active {
    color: $primary-color;
    border-bottom-color: $primary-color;
    background: rgba($primary-color, 0.1);
  }
}

.panel-content {
  flex: 1;
  overflow: auto;
}

.tab-content {
  padding: 10px;
  height: calc(100vh - 120px); // 减去标题和标签的高度

  // JSON Pretty 样式覆盖
  :deep(.vjs-tree) {
    font-size: 13px;
    line-height: 1.4;
  }

  :deep(.vjs-key) {
    color: $primary-color;
  }

  :deep(.vjs-value-string) {
    color: $success-color;
  }

  :deep(.vjs-value-number) {
    color: $error-color;
  }

  :deep(.vjs-value-boolean) {
    color: #d63031;
  }

  :deep(.vjs-value-null) {
    color: #636e72;
  }
}

// 表格样式
.monitor-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;

  thead {
    background: $primary-gradient;
    display: block;

    tr {
      display: table;
      table-layout: fixed;
      width: 100%;
    }
  }

  tbody {
    display: block;
    max-height: calc(100vh - 40px);
    overflow: hidden auto;

    tr {
      display: table;
      table-layout: fixed;
      width: 100%;
      transition: all 0.3s ease;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }
  }

  th {
    padding: 10px 4px;
    color: $white;
    font-weight: 600;
    text-align: center;
    font-size: 13px;
    letter-spacing: 0.5px;
    border: none;
  }

  td {
    padding: 12px;
    border: none;
    vertical-align: middle;
    text-align: center;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

// 列样式
.channel-cell {
  font-weight: 600;
  color: #333;

  &.clickable {
    cursor: pointer;
    color: $primary-color !important;
    transition: all 0.2s ease;

    &:hover {
      color: color.scale($primary-color, $lightness: -15%) !important;
      text-decoration: underline;
    }
  }
}

.args-cell, 
.size-cell {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: $gray-500;
  cursor: help;
}

.perf-cell {
  font-weight: 600;
  color: $error-color;
}

.time-cell {
  color: $gray-600;
  font-size: 12px;
}

// 响应式设计
@media (max-width: 1200px) {
  .main-content.panel-open .table-container {
    width: 50%;
  }

  .details-panel {
    width: 50%;
  }
}

// 状态样式
.status {
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;

  &-pending {
    background: linear-gradient(135deg, $pending-bg, $pending-color);
    color: $error-color;
  }

  &-fulfilled {
    background: linear-gradient(135deg, $success-color, $success-bg);
    color: $white;
  }

  &-rejected {
    background: linear-gradient(135deg, $error-color, $error-bg);
    color: $white;
  }
}

// 行状态样式
.row {
  &-pending {
    background: rgba($pending-bg, 0.3);
    border-left: 4px solid $pending-color;
  }

  &-fulfilled {
    background: rgba($success-color, 0.1);
    border-left: 4px solid $success-color;
  }

  &-rejected {
    background: rgba($error-color, 0.1);
    border-left: 4px solid $error-color;
  }

  &-selected {
    background: rgba($primary-color, 0.2) !important;
    border-left: 4px solid $primary-color !important;
    box-shadow: 0 2px 8px rgba($primary-color, 0.3);
    
    &:hover {
      background: rgba($primary-color, 0.25) !important;
    }
  }
}

</style>