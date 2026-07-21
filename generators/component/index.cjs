const path = require('path');
const fs = require('fs');

const featuresDir = path.join(process.cwd(), 'src/features');
const features = fs.existsSync(featuresDir) ? fs.readdirSync(featuresDir) : [];

/**
 * @type {import('plop').PlopGenerator}
 */
module.exports = {
  description: 'Component, Layout & Feature Generator',
  prompts: [
    {
      type: 'list',
      name: 'type',
      message: 'Generator type (ui, layout, feature)',
      choices: [
        { name: 'UI Component', value: 'ui' },
        { name: 'Layout Component', value: 'layout' },
        { name: 'Feature Module (api & components)', value: 'feature' },
      ],
    },
    {
      type: 'input',
      name: 'name',
      message: 'Name (component or feature name)',
      validate: (value) => {
        if (!value || !value.trim()) return 'Name is required';
        return true;
      },
    },
    // {
    //   type: 'list',
    //   name: 'feature',
    //   message: 'Which feature does this component belong to?',
    //   choices: ['components', ...features],
    //   when: (answers) => answers.type === 'ui' && features.length > 0,
    // },
    // {
    //   type: 'input',
    //   name: 'folder',
    //   message: 'folder in components (optional)',
    //   when: (answers) =>
    //     answers.type === 'ui' &&
    //     (!answers.feature || answers.feature === 'components'),
    // },
  ],
  actions: (answers) => {
    // 1. Nếu chọn feature: Tạo folder src/features/{{kebabCase name}} chứa 2 folder api và components
    if (answers.type === 'feature') {
      return [
        {
          type: 'add',
          path: 'src/features/{{kebabCase name}}/api/index.ts',
          template: '// Export API hooks / functions here\n',
        },
        {
          type: 'add',
          path: 'src/features/{{kebabCase name}}/components/index.ts',
          template: '// Export feature components here\n',
        },
      ];
    }

    // 2. Nếu chọn layout: Tạo folder src/components/layouts/{{kebabCase name}} chứa {{kebabCase name}}.tsx
    if (answers.type === 'layout') {
      return [
        {
          type: 'add',
          path: 'src/components/layouts/{{kebabCase name}}/index.ts',
          templateFile: 'generators/component/index.ts.hbs',
        },
        {
          type: 'add',
          path: 'src/components/layouts/{{kebabCase name}}/{{kebabCase name}}.tsx',
          templateFile: 'generators/component/component.tsx.hbs',
        },
      ];
    }

    // 3. Nếu chọn UI: Theo hướng tạo cũ
    const folderPath = answers.folder ? `/${answers.folder}` : '';
    const componentGeneratePath =
      !answers.feature || answers.feature === 'components'
        ? `src/components/ui${folderPath}`
        : `src/features/${answers.feature}/components`;

    return [
      {
        type: 'add',
        path: componentGeneratePath + '/{{kebabCase name}}/index.ts',
        templateFile: 'generators/component/index.ts.hbs',
      },
      {
        type: 'add',
        path:
          componentGeneratePath + '/{{kebabCase name}}/{{kebabCase name}}.tsx',
        templateFile: 'generators/component/component.tsx.hbs',
      },
      {
        type: 'add',
        path:
          componentGeneratePath +
          '/{{kebabCase name}}/{{kebabCase name}}.stories.tsx',
        templateFile: 'generators/component/component.stories.tsx.hbs',
      },
    ];
  },
};
