import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: '@storybook/nextjs',
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    skipCompiler: false,
  },
};

export default config;