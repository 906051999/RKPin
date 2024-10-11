# RKPin

优雅高效地分享见闻 Share your insights elegantly and efficiently

- 使用javascript开发
- 使用next.js 14 框架

## 项目说明

### 内容获取
- 访问公开频道的链接
- 使用cheerio解析html内容

### 触发更新
> https://core.telegram.org/bots/api
- 添加管理员bot
- 使用webhook触发更新

### 数据处理
1.将获取到的去重（messageId唯一）频道内容保存为json文件（src\public\）
2. 通过dataParser读取json文件，通过route的API获取内容总数，messageId对应内容。如果json文件中没有messageId对应的内容，则触发逻辑获取频道内容
3.page通过TimeLine+Card组件展示数据：
TimeLine是时间线组件，通过总结json文件的date字段，汇总日期（如：2024/10/11），在每个日期标签下展示该日期的Card。
Card是内容展示卡片，将json文件中messageId对应的rawHtml正确渲染