// eslint-disable-next-line @typescript-eslint/no-var-requires
const { generateService } = require('@umijs/openapi');

const basicConfig = {
  serversPath: './src/api',
  dataFields: ['data'],
};
const importList = [
  {
    schemaPath: 'http://101.34.243.115:8866/v3/api-docs',
    projectName: 'user',
    requestLibPath: "import request from '/@/utils/request/index'",
  },
  // {
  //   schemaPath: 'http://47.99.90.88:8890/v3/api-docs',
  //   projectName: 'common',
  //   requestLibPath: "import request from '/@/utils/request/requireCommon'",
  // },
  // {
  //   schemaPath: 'http://47.99.90.88:8887/v3/api-docs',
  //   projectName: 'manager',
  //   requestLibPath: "import request from '/@/utils/request/requireManager'",
  // },
];
function openapiGenerate() {
  for (const item of importList) {
    generateService({
      ...basicConfig,
      ...item,
    });
  }
}
openapiGenerate();
