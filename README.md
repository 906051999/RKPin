# RKPin

> 项目需求调整中，pending

一个专注于记录和展示具有独特创作者风格、象征意义以及市场认可度的代表性作品的平台。

- 使用javascript开发
- 使用next.js 14 框架
- 使用markdown文件存储信息，并参考obsidian部分特性

## 项目说明

- 数据存储在markdown文件中，使用特定的格式记录
- data目录下有不同类别的文件夹，每个文件夹下有对应类别的markdown文件，一个markdown文件代表一个作品
- （待定）项目部署时读取data目录下的所有markdown文件，解析为json格式
- 单页面展示所有类别信息，点击类别名称，展示该类别的所有作品卡片
- 点击作品卡片，展示作品详情
- 不同类别的作品，使用不同类型的卡片展示

## 项目结构(优化中)

```
RKPin/
├── data/
│   ├── music/
│   │   └── 歌手 - 歌曲名.md
│   └── other_categories/
├── public/
│   └── images/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── [...slug]/
│   │   │       └── route.js
│   │   ├── layout.js
│   │   └── page.js
│   ├── components/
│   │   ├── Card/
│   │   │   ├── index.js
│   │   │   ├── PopCard.js
│   │   │   ├── ThumbnailCard.js
│   │   │   └── types/
│   │   │       ├── Music.js
│   │   │       └── Default.js
│   │   └── CategoryList.js
│   └── lib/
│       ├── markdownLoader.js
│       ├── parsers/
│       │   └── musicParser.js
│       └── parserFactory.js
├── next.config.mjs
├── package.json
└── README.md
```

## 卡片说明
- 参考obsidian部分特性：文件属性、#标签
- 以卡片形式展示，默认展示缩略卡片，点击卡片弹出详细卡片
- 图片默认使用占位图[https://placehold.co/200x200?text=Cover]，待实际图片资源准备就绪后替换
### 音乐卡片
#### 文件内容
- 在/data/music目录下，作品markdown文件名格式为：`歌手 - 歌曲名.md`，
- 内容以header 2分段，依次为：PinContent、PinTag
  - PinContent：使用markdown语法编写，在该2级标题以下的的内容视为有效部分
  - PinTag：使用 #标签 标注关键词（pin），通过 [歌词] 与对应歌词段落关联
- 在/public/music目录下，存放对应的音乐文件：`歌手 - 歌曲名.mp3`
  - 音乐文件名与markdown文件名相同
  - 读取音乐文件，获取音乐标签：专辑封面、专辑名称、歌手、歌词
#### 卡片样式
- 缩略卡片：歌曲专辑封面、歌手 - 歌曲名，在卡片旁显示PinContent和PinTag
- 弹出卡片：
   包含以下内容：
  - 封面：通过音乐标签获取
  - 歌曲信息：通过音乐标签获取
  - pinContent：解析文件中的PinContent部分，解析为HTML格式
  - pinTag: 点击与歌词关联的关键词跳转到歌词的对应段落位置
  - 歌词：通过音乐标签获取，如果某些段落存在关联pinTag，则在该段歌词右侧标注pinTag
