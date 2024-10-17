# RKPin 系统架构

```mermaid
flowchart TB
    %% 设置全局样式
    classDef default fill:#f9f9f9,stroke:#333,stroke-width:1px;
    
    subgraph Users["👥 用户"]
        direction TB
        User([👤 普通用户])
        WebUser([💻 Web用户])
        Admin([👑 管理员])
    end

    subgraph RKPin["🚀 RKPin 系统"]
        direction TB
        Bot[🤖 rkpin-bot]
        Web[🌐 rkpin-web]
        DB[(💾 数据库)]
        LLMAPI[🧠 LLM API]
    end

    subgraph External["🌍 外部系统"]
        direction TB
        Channel[📢 Telegram频道]
        AdminGroup[👥 管理群组]
        subgraph ExternalSources["🔗 外部内容源"]
            GitHub[GitHub]
            Weibo[微博]
            WeChat[微信公众号]
            Bilibili[Bilibili]
            TGForward[Telegram转发]
        end
    end

    User -->|分享链接| Bot
    User -->|留言| Channel
    WebUser -->|访问| Web
    Admin -->|审核/使用AI功能| AdminGroup

    Bot -->|转发链接| AdminGroup
    AdminGroup -->|审核决定| Bot
    Bot -->|获取内容| ExternalSources
    Bot <-->|内容/留言| Channel
    Bot <-->|存储/获取数据| DB
    
    Channel -->|内容| Web
    Web <-->|获取数据| DB
    Web <-->|AI交互| LLMAPI
    
    Bot <-->|AI功能| LLMAPI

    %% 定义样式类
    classDef userColor fill:#e1f5fe,stroke:#03a9f4,stroke-width:2px,color:#01579b,font-weight:bold;
    classDef systemColor fill:#fff9c4,stroke:#fbc02d,stroke-width:2px,color:#f57f17,font-weight:bold;
    classDef externalColor fill:#c8e6c9,stroke:#4caf50,stroke-width:2px,color:#1b5e20,font-weight:bold;
    classDef sourceColor fill:#ffcdd2,stroke:#e57373,stroke-width:2px,color:#b71c1c,font-weight:bold;
    
    %% 应用样式
    class User,WebUser,Admin userColor;
    class Bot,Web,DB,LLMAPI systemColor;
    class Channel,AdminGroup externalColor;
    class GitHub,Weibo,WeChat,Bilibili,TGForward sourceColor;

    %% 设置子图样式
    style Users fill:#e1f5fe,stroke:#03a9f4,stroke-width:4px;
    style RKPin fill:#fff9c4,stroke:#fbc02d,stroke-width:4px;
    style External fill:#c8e6c9,stroke:#4caf50,stroke-width:4px;
    style ExternalSources fill:#ffcdd2,stroke:#e57373,stroke-width:4px;
````

## 核心组件

1. rkpin-bot：Telegram 机器人
2. rkpin-web：Web 前端界面
3. 数据库：存储内容和元数据
4. llm-api：AI 模型接口

## 工作流程

### 内容采集与分发

1. 用户向 rkpin-bot 发送分享链接（支持 GitHub、微博、微信公众号、bilibili、Telegram 等）
2. rkpin-bot 将链接转发至指定管理群组
3. 群组管理员决定是否在频道展示内容
4. 若同意展示，rkpin-bot 获取详细内容（通过浏览器或 API）
5. rkpin-bot 将内容发送至频道并存入数据库，关联 messageId

### 用户互动

1. 用户在频道对内容留言
2. rkpin-bot 在管理群组接收留言
3. 留言存入数据库，关联原内容 messageId

### Web 展示

1. 用户访问 rkpin-web
2. rkpin-web 解析频道内容
3. 通过 messageId 从数据库获取额外信息
4. 处理并在页面上展示完整内容

### AI 交互

1. 用户在 rkpin-web 选择 AI 模型
2. 服务器调用 llm-api 实现内容对话
3. 管理员可通过 rkpin-bot 在管理群组中使用 AI 功能：
   - 总结对话
   - AI 问答
   - 视频生成

## 系统扩展

1. rkpin-bot 可调用外部 API 实现功能拓展
2. 管理员通过 Telegram 群组与 rkpin-bot 交互，控制高级功能

## 数据流

1. 用户 -> rkpin-bot -> 管理群组 -> 频道 -> 数据库
2. 频道 -> rkpin-web <- 数据库
3. rkpin-web <-> llm-api
4. 管理群组 <-> rkpin-bot <-> 外部 API

## 下一步计划

1. 增加、优化内容爬取和解析算法
2. 支持更多 AI 模型
3. 支持更多API
4. 实现内容分类、总结、推荐
5. 开发移动端、桌面端应用