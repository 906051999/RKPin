# RKPin

优雅高效地分享见闻 Share your insights elegantly and efficiently

- 使用javascript开发
- 使用next.js 14 框架

## 功能计划

- AI总结
```
在卡片右下角添加一个 AI对话 按钮，点击按钮后将卡片内容打包向LLM提问
```

- 横竖布局
```
对于竖版界面，布局显示调整较大。
竖版界面上方有日期栏，日期栏下方显示该日期有多少张卡片。
日期栏和卡片中间有一行标签页导航条，显示当前日期下对应卡片序号，点击即可跳转卡片内容。
界面展示单张卡片内容，横向滑动来切换卡片
该节目专门提供移动设备使用，对触屏有专门优化
```

- 移动端布局优化
  - 内容显示完整
```
页面布局分为横版和竖版，移动设备使用竖版布局
在竖版布局当前显示内容有遮挡、不完整情况，请调整相关样式
```

  - 无缝滑动
```
在该日期的最后一张卡片继续滑动时，显示加载下一日期卡片的状态，如果存在内容，此时继续滑动则跳转到下一日期的第一张卡片，没有则提示无内容
在该日期的第一张卡片继续滑动时，显示加载上一日期卡片的状态，如果存在内容，此时继续滑动则跳转到上一日期的最后一张卡片，没有则提示无内容
```

- 数据存储
```
1. 使用localStorage记录对话内容，与messageId绑定。当Card加载ChatCard时就从localStorage查找当前messageId对应的对话内容，如果存在则显示
2. 在Card展开收起对话框时、切换卡片显示等操作时，对话内容不会自动清除，除非用户明确在卡片中点击了清除对话按钮，才会从localStorage删除当前messageId对应的对话内容
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