# RKPin

优雅高效地分享见闻 Share your insights elegantly and efficiently

- 使用 javascript 开发
- 使用 next.js 14 框架

## 项目规划
1. 用户在telegram上 向 rkpin-bot 发送分享链接，如 GitHub、微博、微信公众号、bilibili、telegram转发内容等
2. rkpin-bot 将链接转发到指定群组，并提供选项给群组管理员来选择是否将内容展示在频道
3. 如果管理员选择展示，则 rkpin-bot 开始通过浏览器或API等方式获取链接更详细的内容
4. 获取到内容后，通过 rkpin-bot 发送给频道，并将内容按照标准格式保存到数据库，与频道内容的messageId关联
5. 如果用户在频道内对内容进行留言，则机器人会在对应的群组内接收到留言，并将留言保存到数据库，与频道内容的messageId关联
6. 用户访问 rkpin-web ，rkpin-web 会通过HTML解析频道内容，并通过messageId在数据库中获取到更多的对应内容，处理后展示在页面上
7. 用户在 rkpin-web 内可以选择AI模型，服务器会调用llm-api来实现针对内容的对话
8. rkpin-bot 可以调用API实现功能拓展，管理员通过在telegram的群组中与rkpin-bot交互，实现总结对话、AI问答、视频生成等功能

## 项目优化
- 组件拆分和重用
- 使用自定义 hooks 抽离复杂逻辑
- 统一状态管理，使用 Context API 管理全局状态
- 实现模块化的 CSS，使用 CSS Modules 或 styled-components 来实现更模块化的样式管理
- 优化性能
  - 实现虚拟滚动以处理大量消息
  - 使用 React.memo 来优化不必要的重渲染
  - 实现懒加载和代码分割

## 项目说明

### 目录结构（修改中）
- src/app/page.js：页面
- src/components/：组件
  - Card.js：内容卡片
  - /content/：不同类型的内容组件
  - TimeLine.js：时间线组件
- src/lib/get/：
  - getChannelContent.js：获取频道内容
  - getGithubContent.js：获取github项目的readme内容
- src/lib/parser/：频道内容解析器

### 内容获取
1. 访问公开频道的链接，使用cheerio + https-proxy-agent解析html内容
2. 将获取到的去重（messageId唯一）频道内容按照标准格式处理解析后保存为json文件（src\public\），具体标准见文档：[README_tg_channel_data_rule.md](README_tg_channel_data_rule.md)
3. 通过dataParser读取json文件，通过route的API获取messageId对应内容。如果json文件中没有messageId对应的内容，则继续获取频道内容