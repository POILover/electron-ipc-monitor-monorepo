module.exports = function (api) {
  const env = api.env(); // 取环境变量

  const presets = [
    ["@babel/preset-env", {
      modules: env === "cjs" ? "commonjs" : false  // cjs编译成commonjs，esm保持原样
    }]
  ];

  return {
    presets
  };
};