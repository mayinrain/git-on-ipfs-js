module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    ["prismjs", {
      "languages": ["javascript", "css", "markup", "java", "html", "python"],
      "plugins": ["line-numbers"], //配置显示行号插件
      "theme": "coy", //主体名称
      "css": true
    }]
  ]
}
