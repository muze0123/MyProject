# Vben Admin Development Guide

This document outlines the development standards and practices for Vben Admin projects.

## Table of Contents

- [Project Structure](#project-structure)
- [Code Standards](#code-standards)
- [Git Workflow](#git-workflow)
- [Component Development](#component-development)
- [API Design](#api-design)
- [State Management](#state-management)
- [Testing](#testing)
- [Internationalization](#internationalization)

---

## Project Structure

### Monorepo Architecture

```
vben-admin-monorepo/
├── apps/                      # Application entries
│   ├── web-antd/             # Ant Design Vue variant
│   ├── web-antdv-next/       # Ant Design Vue Next variant
│   ├── web-ele/              # Element Plus variant
│   ├── web-naive/            # Naive UI variant
│   ├── web-tdesign/          # TDesign variant
│   └── docs/                 # Documentation
├── packages/                  # Shared packages
│   ├── @core/               # Core packages
│   │   ├── base/            # Base utilities
│   │   ├── composables/     # Vue composables
│   │   └── ui-kit/          # UI component kits
│   ├── effects/             # Side-effect packages
│   │   ├── access/         # Permission control
│   │   ├── hooks/          # Custom hooks
│   │   ├── layouts/        # Layout components
│   │   └── request/        # HTTP client
│   ├── locales/            # i18n resources
│   ├── stores/             # State management
│   └── utils/              # Utility functions
├── internal/                # Internal tooling
│   ├── lint-configs/       # Linting configurations
│   ├── node-utils/         # Node utilities
│   ├── tsconfig/          # TypeScript configs
│   └── vite-config/        # Vite shared configs
├── scripts/                # Build/deploy scripts
└── docs/                   # Project documentation
```

### Application Structure (e.g., web-antd)

```
apps/web-antd/src/
├── api/                    # API modules
├── locales/               # Locale files
├── router/                # Route configuration
│   └── routes/
│       └── modules/       # Route modules
├── store/                 # Pinia stores
├── views/                 # Page components
│   └── demos/
├── adapter/               # Framework adapters
├── layouts/               # Layout components
└── main.ts                # Entry point
```

---

## Code Standards

### Linting Tools

| Tool | Purpose | Commands |
| --- | --- | --- |
| Oxfmt | Code formatting | `pnpm oxfmt` |
| Oxlint | JS/TS linting | `pnpm oxlint` |
| ESLint | Vue/JSON/YAML | `pnpm eslint . --cache` |
| Stylelint | CSS/SCSS/Less | `pnpm stylelint "**/*.{vue,css,less,scss}" --cache` |
| Cspell | Spell checking | `pnpm check:cspell` |

### Recommended VSCode Extensions

- **Vue - Official** (Volar) - Vue 3 support
- **ESLint** - Script code linting
- **Oxc** - Oxlint/Oxfmt integration
- **Stylelint** - CSS linting
- **Code Spell Checker** - Spell checking
- **Tailwind CSS** - Tailwind support
- **i18n Ally** - Internationalization
- **Iconify IntelliSense** - Icon browsing

### Configuration Files

| File                   | Purpose                 |
| ---------------------- | ----------------------- |
| `oxfmt.config.ts`      | Code formatter config   |
| `oxlint.config.ts`     | JS/TS linter config     |
| `eslint.config.mjs`    | Vue/JSON/YAML rules     |
| `stylelint.config.mjs` | CSS style rules         |
| `lefthook.yml`         | Git hooks configuration |
| `cspell.json`          | Spell check config      |

### Naming Conventions

| Type             | Convention                  | Example                   |
| ---------------- | --------------------------- | ------------------------- |
| Vue Components   | PascalCase                  | `UserProfile.vue`         |
| Composables      | camelCase with `use` prefix | `useUserAuth.ts`          |
| API Modules      | camelCase                   | `userAuth.ts`             |
| Store Modules    | camelCase or PascalCase     | `useUserStore.ts`         |
| Route Files      | kebab-case                  | `user-auth.ts`            |
| Constants        | SCREAMING_SNAKE_CASE        | `MAX_RETRY_COUNT`         |
| Types/Interfaces | PascalCase                  | `UserInfo`, `OrderStatus` |

---

## Git Workflow

### Commit Message Format

Follow [Angular Convention](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular):

```
<type>(<scope>): <subject>

<body>
```

**Types:**

| Type       | Description                            |
| ---------- | -------------------------------------- |
| `feat`     | New feature                            |
| `fix`      | Bug fix                                |
| `style`    | Code style changes (no runtime impact) |
| `perf`     | Performance improvement                |
| `refactor` | Code refactoring                       |
| `test`     | Test updates                           |
| `docs`     | Documentation changes                  |
| `chore`    | Dependency updates, config changes     |
| `workflow` | Workflow improvements                  |
| `ci`       | CI/CD changes                          |
| `types`    | Type definition changes                |

**Examples:**

```bash
feat(orders): add order list API with pagination
fix(auth): resolve token refresh issue
docs(readme): update installation instructions
chore(deps): update ant-design-vue to 4.2.6
```

### Git Hooks (Lefthook)

Hooks run automatically on git events:

| Hook         | Trigger       | Purpose                    |
| ------------ | ------------- | -------------------------- |
| `pre-commit` | Before commit | Format & lint staged files |
| `post-merge` | After merge   | Auto-install dependencies  |
| `commit-msg` | On commit     | Validate commit message    |

**Bypass hooks (not recommended):**

```bash
git commit -m "message" --no-verify
```

---

## Component Development

### Page Component Structure

```
views/
└── module/
    └── index.vue        # Main page component
```

### Creating a New Page

1. **Create route module** in `router/routes/modules/`:

```typescript
// router/routes/modules/example.ts
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      title: 'Example',
      icon: 'lucide:example',
    },
    name: 'Example',
    path: '/example',
    component: () => import('#/views/example/index.vue'),
  },
];

export default routes;
```

2. **Create view component**:

```vue
<script lang="ts" setup>
import { Page } from '@vben/common-ui';

// Page logic here
</script>

<template>
  <Page title="Example Page" description="Example description">
    <!-- Page content -->
  </Page>
</template>
```

3. **Add API module** in `api/demos/`:

```typescript
// api/demos/example.ts
export interface ExampleItem {
  id: number;
  name: string;
}

export async function getExampleListApi(params: QueryParams) {
  return requestClient.get<ExampleItem[]>('/example/list', { params });
}
```

### Component Best Practices

1. Use `<script lang="ts" setup>` syntax
2. Import UI components from `@vben/common-ui` for cross-framework compatibility
3. Use framework-specific components from the UI library (ant-design-vue, naive-ui, etc.)
4. Keep components focused and single-purpose
5. Use TypeScript for all components

---

## API Design

### API Module Location

```
api/
├── core/                 # Core API (auth, user, menu)
└── demos/               # Demo/example APIs
    └── orders.ts
```

### API Function Pattern

```typescript
// api/demos/orders.ts
import { requestClient } from '#/api/request';

export interface Order {
  id: number;
  orderNo: string;
  // ... fields
}

export interface OrderListParams {
  page: number;
  pageSize: number;
  orderNo?: string;
}

export async function getOrderListApi(params: OrderListParams) {
  return requestClient.get<Order[]>('/demos/orders', { params });
}

export async function createOrderApi(data: CreateOrderDTO) {
  return requestClient.post<Order>('/demos/orders', data);
}
```

### Request Client Pattern

Use `requestClient` which provides:

- Automatic base URL handling
- Authentication headers
- Error handling
- Response transformation

---

## State Management

### Store Location

```
store/
└── auth.ts              # Authentication store
```

### Using Pinia Stores

```typescript
// stores/auth.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const userInfo = ref<UserInfo | null>(null);

  function setUserInfo(info: UserInfo) {
    userInfo.value = info;
  }

  return { userInfo, setUserInfo };
});
```

### Accessing Store in Components

```vue
<script lang="ts" setup>
import { useAuthStore } from '#/store/auth';

const authStore = useAuthStore();
const user = authStore.userInfo;
</script>
```

---

## Testing

### Unit Testing

- **Framework**: Vitest
- **Location**: Same directory as source or `__tests__/` folder
- **Naming**: `*.test.ts` or `*.spec.ts`

### Running Tests

```bash
# Run all unit tests
pnpm test:unit

# Run with coverage
pnpm test:unit --coverage
```

### Example Test

```typescript
// utils/sum.test.ts
import { expect, test } from 'vitest';
import { sum } from './sum';

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});
```

---

## Internationalization

### Locale File Structure

```
locales/
└── langs/
    ├── zh-CN/
    │   ├── demos.json
    │   └── page.json
    └── en-US/
        ├── demos.json
        └── page.json
```

### Using Translations

```vue
<script lang="ts" setup>
import { useI18n } from '@vben/locales';

const { t } = useI18n();
const title = t('demos.title');
</script>

<template>
  <Page :title="title">
    <!-- Content -->
  </Page>
</template>
```

### Adding New Translations

1. Add key-value to locale JSON files
2. Use `$t()` or `useI18n()` in components

---

## Development Commands

### Common Commands

| Command           | Description              |
| ----------------- | ------------------------ |
| `pnpm dev:antd`   | Start Ant Design variant |
| `pnpm dev:naive`  | Start Naive UI variant   |
| `pnpm build`      | Build all packages       |
| `pnpm build:antd` | Build specific app       |
| `pnpm check:type` | TypeScript type check    |
| `pnpm lint`       | Run all linters          |
| `pnpm format`     | Format code              |
| `pnpm test:unit`  | Run unit tests           |

### Environment Setup

1. **Clone repository**
2. **Install dependencies**: `pnpm install`
3. **Start development**: `pnpm dev` (select app)
4. **Access**: `http://localhost:5555`

### Adding New Environment

To add a new build environment (e.g., test):

1. Update `apps/web-antd/package.json`:

```json
{
  "scripts": {
    "build:test": "pnpm vite build --mode test"
  }
}
```

2. Create `.env.test` with environment variables
3. Update `turbo.json` with new task configuration

---

## Appendix

### Key Dependencies

| Package             | Purpose                       |
| ------------------- | ----------------------------- |
| `@vben/vite-config` | Shared Vite configuration     |
| `@vben/common-ui`   | Cross-framework UI components |
| `@vben/hooks`       | Vue composables               |
| `@vben/access`      | Permission control            |
| `@vben/request`     | HTTP client                   |
| `@vben/stores`      | State management              |

### Related Documentation

- [Official Docs](https://doc.vben.pro/)
- [Vue 3](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
