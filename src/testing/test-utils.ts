import '@testing-library/jest-dom/vitest';
import { render as rtlRender } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Re-export toàn bộ hàm từ @testing-library/react (screen, waitFor, within, ...)
export * from '@testing-library/react';

// Export rtlRender và userEvent
export { rtlRender, userEvent };

