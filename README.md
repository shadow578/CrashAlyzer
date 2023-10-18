# typescript-project-template

A simple project template for a library or node application written in typescript. 

- code and tests in `typescript`
- linting using `eslinit`
- formatting using `prettier`
- testing using `jest` and `ts-jest`


## Setup
After cloning, first run the following command:
```shell
npm i
```

After the command finished, you'll want to adjust the `package.json` and `tsconfig.json` to better match your use-case.

### Library Project
For a library project (that you wish to publish on npm), remove the following script from the `package.json`:

```json
"scripts": {
  "start": "npm run build & node .",
},
```

### Node Application Project
For a application project using node, remove the following scripts from the `package.json` (unless you want to publish the application on npm):

```json
"scripts": {
  "prepare": "npm run build",
  "prepublishOnly": "npm test && npm run lint",
},
```

Additionally, you may remove any of the following lines in the `package.json`:

```json
"description": "",
"author": "shadow578",
"license": "Apache-2.0",
"keywords": [
  "typescript"
],
"repository": {
  "type": "git",
  "url": "git+https://github.com/shadow578/typescript-project-template.git"
},
"homepage": "https://github.com/shadow578/typescript-project-template",
"bugs": {
  "url": "https://github.com/shadow578/typescript-project-template/issues"
},
"types": "lib/index.d.ts",
"files": [
  "lib/**/*"
],
```


Additionally, you may want to adjust the `tsconfig.json` file to use the recommended settings for node.
To do this, first install the `@tsconfig/node18` package using
```shell
npm install --save-dev @tsconfig/node18
```

Now, adjust the `tsconfig.json` to match the following:
```json
{
  "extends": "@tsconfig/node18/tsconfig.json",
  "compilerOptions": {
    "moduleResolution": "Node",
    "outDir": "lib",
    "strict": true,
    "sourceMap": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "**/__tests__/*"]
}
```


You may also adjust the `.eslintrc.json` file and set `"browser": false`.


## Usage
### Commands

 | Command              | Description                                        | Library | Node Application |
 | -------------------- | -------------------------------------------------- | ------- | ---------------- |
 | `npm run build`      | Build the Project (`tsc`)                          | ✔️       | ✔️                |
 | `npm start`          | Build and Start the Application                    | ❌       | ✔️                |
 | `npm test`           | Run all unit tests                                 | ✔️       | ✔️                |
 | `npm run format `    | Format all files with `prettier`                   | ✔️       | ✔️                |
 | `npm run lint`       | Lint all files with `es-lint`                      | ✔️       | ✔️                |
 | `npm version ()...)` | Change the project version (see below)             | ✔️       | ✔️                |
 | `npm publish `       | Build, Test, Lint. Then Publish the Library to npm | ✔️       | ❌\*              |


#### Details on `npm version`
with `npm version (...)`, the version of the project can be changed easily.
the project is configured in such a way that changing the version automaticall creates a new tag and pushes it to the remote repository (if set up).

For more details, see [the npm docs](https://docs.npmjs.com/cli/v8/commands/npm-version)
