<script lang="ts" setup>
import type { Order } from '#/api/demos/orders';

import { onMounted, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tag,
} from 'ant-design-vue';

import {
  batchDeleteOrderApi,
  createOrderApi,
  deleteOrderApi,
  getOrderListApi,
  updateOrderApi,
} from '#/api/demos/orders';

// State
const loading = ref(false);
const dataSource = ref<Order[]>([]);
const selectedRowKeys = ref<number[]>([]);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

// Search form
const searchForm = reactive({
  orderNo: '',
  customerName: '',
  status: '',
});

// Modal
const modalVisible = ref(false);
const modalTitle = ref('新增订单');
const editingId = ref<null | number>(null);

// Form data
const formData = reactive({
  orderNo: '',
  customerName: '',
  amount: 0,
  status: 'pending' as Order['status'],
});

// Status options
const statusOptions = [
  { label: '待处理', value: 'pending' },
  { label: '已确认', value: 'confirmed' },
  { label: '已发货', value: 'shipped' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
];

// Status color map
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

// Table columns
const columns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '订单号', dataIndex: 'orderNo', width: 180 },
  { title: '客户名', dataIndex: 'customerName', width: 120 },
  { title: '金额', dataIndex: 'amount', width: 120 },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
  },
  { title: '创建时间', dataIndex: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 180, fixed: 'right' as const },
];

// Load data
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

// Search
function handleSearch() {
  pagination.current = 1;
  loadData();
}

// Reset
function handleReset() {
  searchForm.orderNo = '';
  searchForm.customerName = '';
  searchForm.status = '';
  pagination.current = 1;
  loadData();
}

// Table change
function handleTableChange(pag: { current: number; pageSize: number }) {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  loadData();
}

// Selection change
function handleSelectionChange(keys: number[]) {
  selectedRowKeys.value = keys;
}

// Add
function handleAdd() {
  editingId.value = null;
  modalTitle.value = '新增订单';
  formData.orderNo = '';
  formData.customerName = '';
  formData.amount = 0;
  formData.status = 'pending';
  modalVisible.value = true;
}

// Edit
function handleEdit(record: Order) {
  editingId.value = record.id;
  modalTitle.value = '编辑订单';
  formData.orderNo = record.orderNo;
  formData.customerName = record.customerName;
  formData.amount = record.amount;
  formData.status = record.status;
  modalVisible.value = true;
}

// Delete
async function handleDelete(id: number) {
  try {
    await deleteOrderApi(id);
    message.success('删除成功');
    loadData();
  } catch {
    message.error('删除失败');
  }
}

// Batch delete
async function handleBatchDelete() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的数据');
    return;
  }
  try {
    await batchDeleteOrderApi(selectedRowKeys.value);
    message.success(`成功删除 ${selectedRowKeys.value.length} 条数据`);
    selectedRowKeys.value = [];
    loadData();
  } catch {
    message.error('批量删除失败');
  }
}

// Submit form
async function handleSubmit() {
  try {
    if (editingId.value) {
      await updateOrderApi(editingId.value, formData);
      message.success('更新成功');
    } else {
      await createOrderApi(formData);
      message.success('创建成功');
    }
    modalVisible.value = false;
    loadData();
  } catch {
    message.error('操作失败');
  }
}

// Export CSV
async function handleExport() {
  if (pagination.total > pagination.pageSize) {
    message.warning('仅导出当前页数据，如需全部数据请先调整每页显示数量');
  }
  try {
    const allData = await getOrderListApi({
      page: 1,
      pageSize: pagination.total,
      orderNo: searchForm.orderNo || undefined,
      customerName: searchForm.customerName || undefined,
      status: searchForm.status || undefined,
    });
    const headers = ['ID', '订单号', '客户名', '金额', '状态', '创建时间'];
    const rows = allData.list.map((item) => [
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

    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    message.success('导出成功');
  } catch {
    message.error('导出失败');
  }
}

// Load on mount
onMounted(loadData);
</script>

<template>
  <Page title="订单管理" description="订单的增删改查演示">
    <!-- Search -->
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

    <!-- Actions -->
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

    <!-- Table -->
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
          ¥{{ record.amount?.toFixed(2) ?? '0.00' }}
        </template>
        <template v-else-if="column.dataIndex === 'createTime'">
          {{ record.createTime.slice(0, 19).replace('T', ' ') }}
        </template>
        <template v-else-if="column.key === 'action'">
          <Space>
            <Button size="small" type="link" @click="handleEdit(record)">
              编辑
            </Button>
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

    <!-- Modal -->
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
