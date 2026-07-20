# 📖 HƯỚNG DẪN PHÁT TRIỂN TÍNH NĂNG MỚI (FEATURE DEVELOPMENT GUIDE)

Tài liệu hướng dẫn dành cho người mới bắt đầu dự án **Bulletproof React**. Dự án tuân theo **Feature-Based Architecture**, trong đó mỗi tính năng lớn là một module độc lập nằm trong thư mục `src/features/`.

---

## 📂 1. Cấu trúc thư mục của một Feature

Khi tạo một tính năng mới (ví dụ: `notifications` hoặc `todos`), hãy tạo thư mục tại:
`src/features/<feature-name>/`

Cấu trúc chuẩn của một feature bao gồm:

```text
src/features/my-feature/
├── api/                  # Quản lý API calls, Zod validation & React Query hooks
│   ├── get-my-feature.ts
│   └── create-my-feature.ts
├── components/           # Các UI Component riêng cho tính năng này
│   ├── my-feature-list.tsx
│   ├── create-my-feature-form.tsx
│   └── __tests__/        # Unit & Integration Tests cho Component
│       └── create-my-feature-form.test.tsx
├── hooks/                # (Optional) Custom hooks dùng riêng cho feature
├── stores/               # (Optional) Zustand state dùng riêng cho feature
└── types/                # (Optional) TypeScript types nội bộ của feature
```

---

## 🔄 2. Quy trình phát triển 5 bước (Step-by-Step)

### **Bước 1: Khai báo Zod Schema, API Fetcher & React Query Hook**

Tạo file trong `src/features/<feature-name>/api/` (Tham khảo mẫu tại [create-discussion.ts](file:///c:/Users/toanp/OneDrive/Desktop/FE-Project/bulletproof-react/apps/nextjs-app/src/features/discussions/api/create-discussion.ts)):

```typescript
// src/features/todos/api/create-todo.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { getTodosQueryOptions } from './get-todos';

// 1. Zod Input Schema
export const createTodoInputSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
});

export type CreateTodoInput = z.infer<typeof createTodoInputSchema>;

// 2. Fetcher Function
export const createTodo = ({ data }: { data: CreateTodoInput }) => {
  return api.post('/todos', data);
};

// 3. Custom React Query Hook
type UseCreateTodoOptions = {
  mutationConfig?: MutationConfig<typeof createTodo>;
};

export const useCreateTodo = ({
  mutationConfig,
}: UseCreateTodoOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getTodosQueryOptions().queryKey,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: createTodo,
  });
};
```

---

### **Bước 2: Giả lập Mock API Handler (MSW)**

Tạo mock API handler tại `src/testing/mocks/handlers/<feature-name>.ts` để phục vụ test và dev khi chưa có backend real:

```typescript
// src/testing/mocks/handlers/todos.ts
import { http, HttpResponse } from 'msw';
import { env } from '@/config/env';

export const todosHandlers = [
  http.get(`${env.API_URL}/todos`, () => {
    return HttpResponse.json([{ id: '1', title: 'Học Bulletproof React' }]);
  }),
  http.post(`${env.API_URL}/todos`, async ({ request }) => {
    const data = await request.json();
    return HttpResponse.json({ id: Date.now().toString(), ...data });
  }),
];
```

---

### **Bước 3: Xây dựng UI Component**

Tạo UI Component tại `src/features/<feature-name>/components/`:

```tsx
// src/features/todos/components/create-todo-form.tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createTodoInputSchema,
  CreateTodoInput,
  useCreateTodo,
} from '../api/create-todo';

export const CreateTodoForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const createTodoMutation = useCreateTodo({
    mutationConfig: { onSuccess },
  });

  const form = useForm<CreateTodoInput>({
    resolver: zodResolver(createTodoInputSchema),
  });

  const onSubmit = (data: CreateTodoInput) => {
    createTodoMutation.mutate({ data });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input {...form.register('title')} placeholder="Nhập việc cần làm..." />
      <Button type="submit" isLoading={createTodoMutation.isPending}>
        Thêm mới
      </Button>
    </form>
  );
};
```

---

### **Bước 4: Viết Kiểm thử (Integration Test)**

Tạo thư mục `__tests__` bên trong `components` và viết test (Tham khảo mẫu tại [login-form.test.tsx](file:///c:/Users/toanp/OneDrive/Desktop/FE-Project/bulletproof-react/apps/nextjs-app/src/features/auth/components/__tests__/login-form.test.tsx)):

```tsx
// src/features/todos/components/__tests__/create-todo-form.test.tsx
import { renderApp, screen, userEvent, waitFor } from '@/testing/test-utils';
import { CreateTodoForm } from '../create-todo-form';

test('Tạo todo thành công và gọi hàm onSuccess', async () => {
  const onSuccess = vi.fn();

  await renderApp(<CreateTodoForm onSuccess={onSuccess} />);

  await userEvent.type(
    screen.getByPlaceholderText(/nhập việc cần làm/i),
    'Nhiệm vụ mới',
  );

  await userEvent.click(screen.getByRole('button', { name: /thêm mới/i }));

  await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
});
```

---

### **Bước 5: Ghép vào Route (App Pages)**

Tạo trang hiển thị trong Next.js App Router tại `src/app/app/todos/page.tsx`:

```tsx
import { CreateTodoForm } from '@/features/todos/components/create-todo-form';

export default function TodosPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Danh sách công việc</h1>
      <CreateTodoForm />
    </div>
  );
}
```

---

## 🎯 Quy tắc kiến trúc quan trọng (Architectural Rules)

1. **Không Import chéo giữa các Feature (No Cross-Feature Imports):**
   - ❌ `src/features/todos` **không được** import trực tiếp từ `src/features/discussions`.
   - ✅ Các tài nguyên chung (UI components, utils, hooks) phải được chuyển vào `src/components/`, `src/hooks/`, hoặc `src/utils/`.
2. **Quy tắc đặt tên file & folder:**
   - Luôn đặt tên theo định dạng `kebab-case` (ví dụ: `create-todo-form.tsx`, `get-todos.ts`).
3. **Ưu tiên Integration Test:**
   - Kiểm thử hành vi người dùng thông qua `renderApp` và `@testing-library/react`.
