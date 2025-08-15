import pkg from './package.json' with { type: 'json' };

export default function (plop) {
  plop.setGenerator('npm', {
    description: 'Build npm package',
    prompts: [],
    actions: [
      {
        type: 'add',
        force: true,
        path: './dist_npm/package.json',
        templateFile: './plop-templates/package.json.hbs',
        data: {
          version: pkg.version
        }
      },
      {
        type: 'add',
        force: true,
        path: './dist_npm/README.md',
        templateFile: './plop-templates/README.md.hbs'
      },
      {
        type: 'add',
        force: true,
        path: './dist_npm/LICENSE',
        templateFile: './plop-templates/LICENSE.hbs',
        data: {
          year: new Date().getFullYear()
        }
      },
      {
        type: 'add',
        force: true,
        path: './dist_npm/.npmignore',
        templateFile: './plop-templates/.npmignore.hbs'
      }
    ]
  })
}