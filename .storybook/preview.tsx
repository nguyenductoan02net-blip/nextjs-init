import type { Preview } from '@storybook/nextjs';
import '../src/styles/globals.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
  },
  tags: ['autodocs'],
  decorators: [(Story) => <Story />],
};

export default preview;