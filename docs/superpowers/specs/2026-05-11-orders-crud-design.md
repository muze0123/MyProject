# 订单管理 CRUD 设计文档

## 概述

在 `@vben/web-antd` 项目中创建订单管理模块，包含完整的增删改查和分页功能。

## 技术方案

| 项目      | 选择                                             |
| --------- | ------------------------------------------------ |
| API 位置  | `apps/web-antd/src/api/demos/orders.ts`          |
| View 位置 | `apps/web-antd/src/views/demos/orders/index.vue` |
| Mock 数据 | 使用 Vben 内置 Mock 机制                         |
| 表格组件  | Ant Design Vue Table + Pagination                |

## 数据模型

### 订单 Order

| 字段         | 类型   | 说明                              |
| ------------ | ------ | --------------------------------- |
| id           | number | 主键                              |
| orderNo      | string | 订单号（格式：ORD-YYYYMMDD-XXXX） |
| customerName | string | 客户名                            |
| amount       | number | 金额（元）                        |
| status       | string | 状态枚举                          |
| createTime   | string | 创建时间（ISO 格式）              |

### 状态枚举

- `pending` - 待处理
- `confirmed` - 已确认
- `shipped` - 已发货
- `completed` - 已完成
- `cancelled` - 已取消

## API 设计

### 获取订单列表

```
GET /api/demos/orders
Query: { page: number, pageSize: number, orderNo?: string, customerName?: string, status?: string }
Response: { list: Order[], total: number }
```

### 新增订单

```
POST /api/demos/orders
Body: { orderNo, customerName, amount, status }
Response: Order
```

### 编辑订单

```
PUT /api/demos/orders/:id
Body: { orderNo, customerName, amount, status }
Response: Order
```

### 删除订单

```
DELETE /api/demos/orders/:id
Response: { success: boolean }
```

## 页面功能

| 功能     | 说明                                         |
| -------- | -------------------------------------------- |
| 列表展示 | 分页表格，每页 10 条，支持排序               |
| 搜索     | 订单号（模糊）、客户名（模糊）、状态下拉筛选 |
| 重置     | 清空筛选条件                                 |
| 新增     | 右上角按钮，打开弹窗表单                     |
| 编辑     | 行内操作按钮，打开弹窗表单（复用新增）       |
| 删除     | 行内操作按钮，单条删除                       |
| 批量删除 | 批量选择后，顶部批量删除按钮                 |
| 导出     | 导出当前筛选结果的 CSV 文件                  |

## 弹窗表单

| 字段   | 类型        | 验证       |
| ------ | ----------- | ---------- |
| 订单号 | Input       | 必填，唯一 |
| 客户名 | Input       | 必填       |
| 金额   | InputNumber | 必填，> 0  |
| 状态   | Select      | 必填       |

## 文件结构

```
src/
├── api/demos/
│   └── orders.ts          # API + Mock 数据
├── views/demos/
│   └── orders/
│       └── index.vue      # 主页面组件
└── router/routes/modules/
    └── demos.ts           # 添加订单路由
```

## 路由配置

- 路径：`/demos/orders`
- 名称：`OrderManagement`
- 菜单位置：`/demos` 目录下
- 标题：`订单管理`
- 图标：`lucide:shopping-cart`
