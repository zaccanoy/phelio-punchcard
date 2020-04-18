/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
module.exports = (env) => {
  return require(`./webpack.${env}.js`);
};
