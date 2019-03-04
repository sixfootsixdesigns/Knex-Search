import typescript from 'rollup-plugin-typescript2';
import packageJson from 'rollup-plugin-generate-package-json';
import resolve from 'rollup-plugin-node-resolve';
import pkg from './package.json';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: './src/index.ts',
  output: [
    { name: 'index', file: `./dist/${pkg.module}`, format: 'es' },
    { name: 'index', file: `./dist/${pkg.main}`, format: 'cjs' },
  ],
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      declaration: true,
      exclude: [
        './src/**/*.spec.*',
      ]
    }),
    packageJson({
      inputFile: './package.json',
      outputFolder: './dist',
      baseContents: {
        'name': pkg.name,
        'version': pkg.version,
        'description': pkg.description,
        'author': pkg.author,
        'homepage': pkg.homepage,
        'license': pkg.license,
        'repository': pkg.repository,
        'bugs': pkg.bugs,
        'private': false,
        'main': pkg.main,
        'module': pkg.module,
        'types': pkg.types,
        'dependencies': pkg.dependencies,
      }
    })
  ]
};
