# RKPin | AI增强内容聚合平台

聚合用户定制内容，与内容实时AI互动。

## 主要功能
- 内容聚合：整合Telegram、RSS等多源内容
- AI互动：实时与聚合内容进行智能对话
- 个性化定制：根据用户兴趣定制内容推送

## 技术特点
- 使用 javascript 开发
- 使用 next.js 14 框架

## 项目优化（实现中）
- 组件拆分和重用
- 使用自定义 hooks 抽离复杂逻辑
- 统一状态管理，使用 Context API 管理全局状态
- 实现模块化的 CSS，使用 CSS Modules 或 styled-components 来实现更模块化的样式管理
- 优化性能
  - 实现虚拟滚动以处理大量消息
  - 使用 React.memo 来优化不必要的重渲染
  - 实现懒加载和代码分割

## 项目改动
为实现多频道内容聚合，和实现数据云同步，需要调整数据存储方式，以及相关代码逻辑。
修改内容如下：
- 获取频道、rss数据时，直接使用link作为数据标识符
- 内容数据不再使用messageId或uniqueId作为数据标识符，改为使用link作为数据标识符
- 对话数据不再使用messageId或uniqueId作为数据标识符，改为使用link作为数据标识符
- 使用indexedDB替代localStorage，改用indexedDBManager管理数据存储
- 通过indexedDB的索引功能，实现数据查询
- 支持多频道数据同时展示

直接涉及改动文件：
- [src/context/AppContext.js]
- [src/app/api/[...slug]/route.js]
- [src/components/card/Card.js]
- [src/components/channel/ChannelList.js] 
- [src/lib/get/getChannelContent.js] 
- [src/utils/storageManager.js] 

### 使用indexedDB存储用户数据
使用indexedDB存储数据，替代localStorage
1. 源数据（Telegram频道、RSS订阅）
   - 标识符 链接：keyPath: `url`
   - 索引1 名称：name
   - 索引2 类型：type （rss、telegram_channel）
   - 索引3 更新时间：updateTime
   - 索引4 是否订阅：isSubscribed
   - 索引5 简介：description
2. 内容数据
   - 标识符 链接：keyPath: `link`
   - 索引1 对应源链接：url
   - 索引2 类型：type （rss、telegram_channel）
   - 索引3 日期：date
   - 索引4 是否已读：isRead
   - 索引5 是否已收藏：isFavorite
3. 对话数据
   - 标识符 内容链接：keyPath: `link`
   - 索引1 对应源链接：sourceUrl
   - 索引2 创建日期：createDate
   - 索引3 更新日期：updateDate
4. 用户相关数据
   - 标识符 钥匙：keyPath: `key`
   - 数据结构：扁平化键值结构
   - 参考示例
   - ```json
     { key: 'theme', value: 'dark', lastModified: Date, syncStatus: 'synced' }
     { key: 'llmConfig', value: { model: 'gpt-3.5-turbo', provider: 'openai', apiBaseUrl: 'https://api.openai.com/v1'}, lastModified: Date, syncStatus: 'local' }
     { key: 'apiKey', value: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', lastModified: Date, syncStatus: 'local' }
     { key: 'oauthProfile', value: { id: '123', name: 'John Doe', email: 'john@example.com' }, lastModified: Date, syncStatus: 'synced' }
     ```

### 数据获取流程

打开界面、刷新界面、清除缓存流程：
```
[src/app/page.js] -> [src/context/AppContext.js] -> [src/utils/storageManager.js]
                  -> [src/components/common/Header.js]
                  -> [src/components/horizontal/TimeLine.js]
                  -> [src/components/layout/HorizontalLayout.js]
                      |
                      v
[src/context/AppContext.js] -> [src/app/api/[...slug]/route.js] -> [src/lib/get/getChannelContent.js]
                                                                -> [src/lib/parser/telegramParser.js]
                                                                -> [src/lib/parser/bilibiliParser.js]
                                                                -> (其他解析器)
                      |
                      v
[src/utils/storageManager.js] (保存或清除数据)
                      |
                      v
[src/components/common/Header.js] (更新UI)
[src/components/horizontal/TimeLine.js] (更新时间线)
[src/components/layout/HorizontalLayout.js] (更新布局)
```

切换频道流程：
```
[src/components/common/ChannelList.js] -> [src/context/AppContext.js]
                                       -> [src/utils/storageManager.js]
                      |
                      v
[src/context/AppContext.js] -> [src/app/api/[...slug]/route.js] -> [src/lib/get/getChannelContent.js]
                                                                -> [src/lib/parser/telegramParser.js]
                                                                -> [src/lib/parser/bilibiliParser.js]
                                                                -> (其他解析器)
                      |
                      v
[src/utils/storageManager.js] (保存新频道数据)
                      |
                      v
[src/components/horizontal/TimeLine.js] (更新时间线)
[src/components/layout/HorizontalLayout.js] (更新布局)
```