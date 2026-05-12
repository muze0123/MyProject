# 订单管理 CRUD 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `@vben/web-antd` 中创建订单管理模块，实现完整的 CRUD 和分页功能

**Architecture:** 使用 Vben 框架的 API 层 + Ant Design Vue Table 组件，采用弹窗表单进行增删改操作，Mock 数据模拟后端

**Tech Stack:** Vben 框架 / Ant Design Vue / TypeScript / Mock API

---

## 文件结构

```
apps/web-antd/src/
├── api/demos/
│   └── orders.ts          # 创建：API + Mock 数据
├── views/demos/
│   └── orders/
│       └── index.vue      # 创建：主页面组件
└── router/routes/modules/
    └── demos.ts           # 修改：添加订单路由
apps/web-antd/src/locales/langs/
    └── zh-CN.ts           # 修改：添加订单模块中文翻译
```

---

## Task 1: 创建订单 API 和 Mock 数据

**Files:**

- Create: `apps/web-antd/src/api/demos/orders.ts`

- [ ] **Step 1: 创建 API 文件**

```typescript
// apps/web-antd/src/api/demos/orders.ts

export interface Order {
  id: number;
  orderNo: string;
  customerName: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled';
  createTime: string;
}

export interface OrderListParams {
  page: number;
  pageSize: number;
  orderNo?: string;
  customerName?: string;
  status?: string;
}

export interface OrderListResult {
  list: Order[];
  total: number;
}

// Mock 数据生成
function generateMockData(count: number, startId = 1): Order[] {
  const statuses = [
    'pending',
    'confirmed',
    'shipped',
    'completed',
    'cancelled',
  ] as const;
  const customers = [
    '张三',
    '李四',
    '王五',
    '赵六',
    '钱七',
    '孙八',
    '周九',
    '吴十',
  ];

  return Array.from({ length: count }, (_, i) => {
    const id = startId + i;
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));

    return {
      id,
      orderNo: `ORD-${date.toISOString().slice(0, 10).replace(/-/g, '')}-${String(id).padStart(4, '0')}`,
      customerName: customers[Math.floor(Math.random() * customers.length)],
      amount: Math.floor(Math.random() * 10000) + 100,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createTime: date.toISOString(),
    };
  });
}

// 生成 100 条 Mock 数据
let mockOrders = generateMockData(100);

// API 函数
export async function getOrderListApi(
  params: OrderListParams,
): Promise<OrderListResult> {
  const { page, pageSize, orderNo, customerName, status } = params;

  let filtered = mockOrders;

  // 筛选
  if (orderNo) {
    filtered = filtered.filter((item) => item.orderNo.includes(orderNo));
  }
  if (customerName) {
    filtered = filtered.filter((item) =>
      item.customerName.includes(customerName),
    );
  }
  if (status) {
    filtered = filtered.filter((item) => item.status === status);
  }

  // 分页
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const list = filtered.slice(start, end);

  return {
    list,
    total: filtered.length,
  };
}

export async function createOrderApi(
  data: Omit<Order, 'id' | 'createTime'>,
): Promise<Order> {
  const newOrder: Order = {
    id: Math.max(...mockOrders.map((o) => o.id)) + 1,
    ...data,
    createTime: new Date().toISOString(),
  };
  mockOrders.unshift(newOrder);
  return newOrder;
}

export async function updateOrderApi(
  id: number,
  data: Partial<Order>,
): Promise<Order> {
  const index = mockOrders.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error('订单不存在');
  }
  mockOrders[index] = { ...mockOrders[index], ...data };
  return mockOrders[index];
}

export async function deleteOrderApi(id: number): Promise<void> {
  const index = mockOrders.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error('订单不存在');
  }
  mockOrders.splice(index, 1);
}

export async function batchDeleteOrderApi(ids: number[]): Promise<void> {
  mockOrders = mockOrders.filter((item) => !ids.includes(item.id));
}
```

- [ ] **Step 2: 提交**

```bash
git add apps/web-antd/src/api/demos/orders.ts
git commit -m "feat(demos): add orders API with mock data"
```

---

## Task 2: 创建订单页面组件

**Files:**

- Create: `apps/web-antd/src/views/demos/orders/index.vue`
- Modify: `apps/web-antd/src/router/routes/modules/demos.ts:18-23` (添加路由)

- [ ] **Step 1: 创建订单页面目录**

```bash
mkdir -p apps/web-antd/src/views/demos/orders
```

- [ ] **Step 2: 创建订单页面组件**

```vue
<!-- apps/web-antd/src/views/demos/orders/index.vue -->
<script lang="ts" setup>
import { Page } from '@vben/common-ui';

import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  message,
} from 'ant-design-vue';
import { ref, reactive } from 'vue';

import {
  batchDeleteOrderApi,
  createOrderApi,
  deleteOrderApi,
  getOrderListApi,
  updateOrderApi,
  type Order,
} from '#/api/demos/orders';

import { useVbenForm } from '#/adapter';

// 状态
const loading = ref(false);
const dataSource = ref<Order[]>([]);
const selectedRowKeys = ref<number[]>([]);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

// 搜索表单
const searchForm = reactive({
  orderNo: '',
  customerName: '',
  status: '',
});

// 弹窗
const modalVisible = ref(false);
const modalTitle = ref('新增订单');
const editingId = ref<number | null>(null);

// 表单数据
const formData = reactive({
  orderNo: '',
  customerName: '',
  amount: 0,
  status: 'pending' as Order['status'],
});

// 状态选项
const statusOptions = [
  { label: '待处理', value: 'pending' },
  { label: '已确认', value: 'confirmed' },
  { label: '已发货', value: 'shipped' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
];

// 状态颜色映射
const statusColorMap: Record<string, string> = {
  pending: 'warning',
  confirmed: 'processing',
  shipped: 'cyan',
  completed: 'success',
  cancelled: 'error',
};

const statusTextMap: Record<string, string> = {
  pending: '待处理',
  confirmed: '已确认',
  shipped: '已发货',
  completed: '已完成',
  cancelled: '已取消',
};

// 表格列定义
const columns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '订单号', dataIndex: 'orderNo', width: 180 },
  { title: '客户名', dataIndex: 'customerName', width: 120 },
  { title: '金额', dataIndex: 'amount', width: 120 },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    customRender: ({ text }: { text: Order['status'] }) =>
      (Tag.colorMap[statusColorMap[text]] = Tag),
    text = statusTextMap[text],
  },
  { title: '创建时间', dataIndex: 'createTime', width: 180 },
  {
    title: '操作',
    width: 180,
    fixed: 'right' as const,
  },
];

// 加载数据
async function loadData() {
  loading.value = true;
  try {
    const result = await getOrderListApi({
      page: pagination.current,
      pageSize: pagination.pageSize,
      orderNo: searchForm.orderNo || undefined,
      customerName: searchForm.customerName || undefined,
      status: searchForm.status || undefined,
    });
    dataSource.value = result.list;
    pagination.total = result.total;
  } finally {
    loading.value = false;
  }
}

// 搜索
function handleSearch() {
  pagination.current = 1;
  loadData();
}

// 重置
function handleReset() {
  searchForm.orderNo = '';
  searchForm.customerName = '';
  searchForm.status = '';
  pagination.current = 1;
  loadData();
}

// 表格变化
function handleTableChange(pag: { current: number; pageSize: number }) {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  loadData();
}

// 行选择变化
function handleSelectionChange(keys: number[]) {
  selectedRowKeys.value = keys;
}

// 新增
function handleAdd() {
  editingId.value = null;
  modalTitle.value = '新增订单';
  formData.orderNo = '';
  formData.customerName = '';
  formData.amount = 0;
  formData.status = 'pending';
  modalVisible.value = true;
}

// 编辑
function handleEdit(record: Order) {
  editingId.value = record.id;
  modalTitle.value = '编辑订单';
  formData.orderNo = record.orderNo;
  formData.customerName = record.customerName;
  formData.amount = record.amount;
  formData.status = record.status;
  modalVisible.value = true;
}

// 删除
async function handleDelete(id: number) {
  await deleteOrderApi(id);
  message.success('删除成功');
  loadData();
}

// 批量删除
async function handleBatchDelete() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的数据');
    return;
  }
  await batchDeleteOrderApi(selectedRowKeys.value);
  message.success(`成功删除 ${selectedRowKeys.value.length} 条数据`);
  selectedRowKeys.value = [];
  loadData();
}

// 提交表单
async function handleSubmit() {
  if (editingId.value) {
    await updateOrderApi(editingId.value, formData);
    message.success('更新成功');
  } else {
    await createOrderApi(formData);
    message.success('创建成功');
  }
  modalVisible.value = false;
  loadData();
}

// 导出 CSV
function handleExport() {
  const headers = ['ID', '订单号', '客户名', '金额', '状态', '创建时间'];
  const rows = dataSource.value.map((item) => [
    item.id,
    item.orderNo,
    item.customerName,
    item.amount,
    statusTextMap[item.status],
    item.createTime,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `orders-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  message.success('导出成功');
}

// 页面加载时获取数据
loadData();
</script>

<template>
  <Page title="订单管理" description="订单的增删改查演示">
    <!-- 搜索区域 -->
    <Form layout="inline" class="mb-4">
      <Form.Item label="订单号">
        <Input
          v-model:value="searchForm.orderNo"
          placeholder="请输入订单号"
          allow-clear
        />
      </Form.Item>
      <Form.Item label="客户名">
        <Input
          v-model:value="searchForm.customerName"
          placeholder="请输入客户名"
          allow-clear
        />
      </Form.Item>
      <Form.Item label="状态">
        <Select
          v-model:value="searchForm.status"
          placeholder="请选择状态"
          allow-clear
          style="width: 150px"
        >
          <Select.Option
            v-for="opt in statusOptions"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </Select.Option>
        </Select>
      </Form.Item>
      <Form.Item>
        <Space>
          <Button type="primary" @click="handleSearch">搜索</Button>
          <Button @click="handleReset">重置</Button>
        </Space>
      </Form.Item>
    </Form>

    <!-- 操作按钮区域 -->
    <Space class="mb-4">
      <Button type="primary" @click="handleAdd">新增订单</Button>
      <Button
        danger
        :disabled="selectedRowKeys.length === 0"
        @click="handleBatchDelete"
      >
        批量删除
      </Button>
      <Button @click="handleExport">导出 CSV</Button>
    </Space>

    <!-- 表格 -->
    <Table
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="{
        ...pagination,
        showSizeChanger: true,
        showTotal: (total: number) => `共 ${total} 条`,
      }"
      :scroll="{ x: 1000 }"
      :row-selection="{
        selectedRowKeys,
        onChange: (keys: number[]) => handleSelectionChange(keys),
      }"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'status'">
          <Tag :color="statusColorMap[record.status]">
            {{ statusTextMap[record.status] }}
          </Tag>
        </template>
        <template v-else-if="column.dataIndex === 'amount'">
          ¥{{ record.amount.toFixed(2) }}
        </template>
        <template v-else-if="column.dataIndex === 'createTime'">
          {{ record.createTime.slice(0, 19).replace('T', ' ') }}
        </template>
        <template v-else-if="column.key === 'action'">
          <Space>
            <Button size="small" type="link" @click="handleEdit(record)"
              >编辑</Button
            >
            <Button
              size="small"
              type="link"
              danger
              @click="handleDelete(record.id)"
            >
              删除
            </Button>
          </Space>
        </template>
      </template>
    </Table>

    <!-- 弹窗表单 -->
    <Modal
      v-model:open="modalVisible"
      :title="modalTitle"
      :confirm-loading="loading"
      @ok="handleSubmit"
    >
      <Form layout="vertical">
        <Form.Item label="订单号" required>
          <Input v-model:value="formData.orderNo" placeholder="请输入订单号" />
        </Form.Item>
        <Form.Item label="客户名" required>
          <Input
            v-model:value="formData.customerName"
            placeholder="请输入客户名"
          />
        </Form.Item>
        <Form.Item label="金额" required>
          <InputNumber
            v-model:value="formData.amount"
            :min="0.01"
            :precision="2"
            style="width: 100%"
          />
        </Form.Item>
        <Form.Item label="状态" required>
          <Select v-model:value="formData.status" style="width: 100%">
            <Select.Option
              v-for="opt in statusOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  </Page>
</template>
```

- [ ] **Step 3: 添加路由配置**

修改 `apps/web-antd/src/router/routes/modules/demos.ts`，在 `children` 数组中添加：

```typescript
{
  meta: {
    title: '订单管理',
  },
  name: 'OrderManagement',
  path: '/demos/orders',
  component: () => import('#/views/demos/orders/index.vue'),
},
```

- [ ] **Step 4: 提交**

```bash
git add apps/web-antd/src/views/demos/orders/index.vue
git add apps/web-antd/src/router/routes/modules/demos.ts
git commit -m "feat(demos): add order management CRUD page"
```

---

## Task 3: 添加国际化翻译（可选）

**Files:**

- Modify: `apps/web-antd/src/locales/langs/zh-CN.ts`

- [ ] **Step 1: 检查 locale 文件**

读取 `apps/web-antd/src/locales/langs/zh-CN.ts` 并添加订单相关翻译。

---

## 验证步骤

1. 启动开发服务器：`pnpm run dev:antd`
2. 访问 http://localhost:5666/
3. 导航到 **演示 > 订单管理**
4. 验证功能：
   - [ ] 分页显示 10 条/页
   - [ ] 搜索筛选正常工作
   - [ ] 新增订单成功
   - [ ] 编辑订单成功
   - [ ] 删除订单成功
   - [ ] 批量删除成功
   - [ ] 导出 CSV 正常工作

---

## 实现完成

两个执行选项：

**1. Subagent-Driven (推荐)** - 每个 Task 由独立 subagent 执行，任务间有检查点

**2. Inline Execution** - 当前 session 内批量执行，带检查点

选择哪个？
