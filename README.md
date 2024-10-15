# RKPin

优雅高效地分享见闻 Share your insights elegantly and efficiently

- 使用javascript开发
- 使用next.js 14 框架

## 功能计划

- AI总结
```
在GitHub类型的卡片右下角添加一个 AI总结 按钮，点击按钮后通过 getGitHubReadme 获取该项目的README，然后将内容打包通过 ChatBar对话框向LLM提问，让其总结项目内容

先告诉我要改动哪些文件，我们一个一个来改，先从第一个开始改起，实现其代码
```


## 项目说明

### 目录结构（修改中）
- src/app/page.js：页面
- src/components/：组件
  - Card.js：内容卡片
  - /content/：不同类型的内容组件
  - TimeLine.js：时间线组件
- public/parsed_content.json：处理后的频道内容json文件
- .env：环境变量，存放代理地址、频道链接
- src/lib/getChannelContent.js：获取频道内容
- src/lib/parserFactory.js：解析内容工厂
  - src/lib/parser/：不同类型的内容解析器

### 内容获取
1. 访问公开频道的链接，使用cheerio + https-proxy-agent解析html内容
2. 将获取到的去重（messageId唯一）频道内容按照标准格式处理解析后保存为json文件（src\public\），具体标准见文档：[README_tg_channel_data_rule.md](README_tg_channel_data_rule.md)
3. 通过dataParser读取json文件，通过route的API获取messageId对应内容。如果json文件中没有messageId对应的内容，则继续获取频道内容
4. 若json文件中已存在messageId为1的内容，则认为已完整获取内容，此时不再触发获取数据。
5. 初始化或强制刷新时，清除json文件，重新获取数据
6. page通过TimeLine + Card组件展示数据：
   - TimeLine是时间线组件，通过总结json文件的date字段，汇总日期（如：2024/10/11），在每个日期标签下展示该日期的Card
   - Card是内容展示卡片，根据json文件中内容的不同type，使用不同content组件正确展示对应的内容，已保证内容格式正确