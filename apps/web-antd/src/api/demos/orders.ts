// Order status types
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'completed'
  | 'cancelled';

// Order interface
export interface Order {
  id: string;
  orderNo: string;
  customerName: string;
  amount: number;
  status: OrderStatus;
  createTime: string;
}

// Order list params interface
export interface OrderListParams {
  page?: number;
  pageSize?: number;
  orderNo?: string;
  customerName?: string;
  status?: OrderStatus;
}

// Order list result interface
export interface OrderListResult {
  list: Order[];
  total: number;
  page: number;
  pageSize: number;
}

// Generate mock data
function generateMockData(): Order[] {
  const statuses: OrderStatus[] = [
    'pending',
    'confirmed',
    'shipped',
    'completed',
    'cancelled',
  ];
  const customerNames = [
    'Zhang Wei',
    'Li Na',
    'Wang Qiang',
    'Liu Fang',
    'Chen Xiao',
    'Yang Ming',
    'Huang Jing',
    'Zhao Long',
    'Sun Yue',
    'Zhou Min',
    'Wu Tao',
    'Xu Yan',
    'Ma Kai',
    'Zhu Ling',
    'Hu Bin',
    'Guo Feng',
    'He Lei',
    'Gao Xing',
    'Lin Yun',
    'Qian Sheng',
  ];

  const orders: Order[] = [];
  const now = Date.now();

  for (let i = 1; i <= 100; i++) {
    const createTime = new Date(now - Math.random() * 90 * 24 * 60 * 60 * 1000);
    orders.push({
      id: `ORD${String(i).padStart(6, '0')}`,
      orderNo: `ON${new Date().getFullYear()}${String(i).padStart(6, '0')}`,
      customerName:
        customerNames[Math.floor(Math.random() * customerNames.length)]!,
      amount: Number((Math.random() * 10000 + 100).toFixed(2)),
      status: statuses[Math.floor(Math.random() * statuses.length)]!,
      createTime: createTime.toISOString(),
    });
  }

  return orders;
}

// Mock data store (in-memory for demo purposes)
let mockOrders: Order[] = generateMockData();

// API: Get order list with pagination and filtering
export async function getOrderListApi(params: OrderListParams) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filteredList = [...mockOrders];

  // Apply filters
  if (params.orderNo) {
    filteredList = filteredList.filter((item) =>
      item.orderNo.toLowerCase().includes(params.orderNo!.toLowerCase()),
    );
  }
  if (params.customerName) {
    filteredList = filteredList.filter((item) =>
      item.customerName
        .toLowerCase()
        .includes(params.customerName!.toLowerCase()),
    );
  }
  if (params.status) {
    filteredList = filteredList.filter((item) => item.status === params.status);
  }

  // Pagination
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const list = filteredList.slice(startIndex, endIndex);

  return {
    list,
    total: filteredList.length,
    page,
    pageSize,
  };
}

// API: Create new order
export async function createOrderApi(data: Partial<Order>) {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const newOrder: Order = {
    id: `ORD${String(mockOrders.length + 1).padStart(6, '0')}`,
    orderNo: `ON${new Date().getFullYear()}${String(mockOrders.length + 1).padStart(6, '0')}`,
    customerName: data.customerName || '',
    amount: data.amount || 0,
    status: data.status || 'pending',
    createTime: new Date().toISOString(),
  };

  mockOrders.unshift(newOrder);
  return newOrder;
}

// API: Update existing order
export async function updateOrderApi(id: string, data: Partial<Order>) {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const existingOrder = mockOrders.find((item) => item.id === id);
  if (!existingOrder) {
    throw new Error('Order not found');
  }

  const index = mockOrders.indexOf(existingOrder);
  mockOrders[index] = {
    id: existingOrder.id,
    orderNo: existingOrder.orderNo,
    createTime: existingOrder.createTime,
    customerName: data.customerName ?? existingOrder.customerName,
    amount: data.amount ?? existingOrder.amount,
    status: data.status ?? existingOrder.status,
  };

  return mockOrders[index];
}

// API: Delete single order
export async function deleteOrderApi(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const index = mockOrders.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error('Order not found');
  }

  mockOrders.splice(index, 1);
  return { success: true };
}

// API: Batch delete orders
export async function batchDeleteOrderApi(ids: string[]) {
  await new Promise((resolve) => setTimeout(resolve, 300));

  mockOrders = mockOrders.filter((item) => !ids.includes(item.id));
  return { success: true, deletedCount: ids.length };
}
