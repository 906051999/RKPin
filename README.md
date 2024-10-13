# RKPin

优雅高效地分享见闻 Share your insights elegantly and efficiently

- 使用javascript开发
- 使用next.js 14 框架

## 项目说明

### 目录结构
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
2. 将获取到的去重（messageId唯一）频道内容按照标准格式处理解析后保存为json文件（src\public\），具体标准见段落：数据解析
3. 通过dataParser读取json文件，通过route的API获取messageId对应内容。如果json文件中没有messageId对应的内容，则继续获取频道内容
4. 若json文件中已存在messageId为1的内容，则认为已完整获取内容，此时不再触发获取数据。
5. 初始化或强制刷新时，清除json文件，重新获取数据
6. page通过TimeLine + Card组件展示数据：
   - TimeLine是时间线组件，通过总结json文件的date字段，汇总日期（如：2024/10/11），在每个日期标签下展示该日期的Card
   - Card是内容展示卡片，根据json文件中内容的不同type，使用不同content组件正确展示对应的内容，已保证内容格式正确

### 数据解析
解析频道内容生成json文件的内容格式：

- messageId：
    - 类名：tgme_widget_message text_not_supported_wrap js-widget_message
    - 属性：data-post="频道名/messageId"
    - 举例：`<div class="tgme_widget_message text_not_supported_wrap js-widget_message" data-post="rk_pins/42">`，messageId为42 

- type：
    - 类名：link_preview_site_name accent_color
    - 举例：`<div class="link_preview_site_name accent_color">GitHub</div>`，type为GitHub

- replyId：
    - 类名：tgme_widget_message_reply
    - 举例：`<a class="tgme_widget_message_reply" href="https://t.me/rk_pins/41">`，replyId为41
    - 若无该class则为默认空

- author：
    - 类名：tgme_widget_message_from_author
    - 举例：`<span class="tgme_widget_message_from_author" dir="auto">steven rk</span>`, author为steven rk

- date：
    - 类名：tgme_widget_message_date
    - 举例：`<a class="tgme_widget_message_date" href="https://t.me/rk_pins/41"><time datetime="2024-10-12T09:19:36+00:00" class="time">17:19</time></a>`, date为2024-10-12T09:19:36+00:00
    - 该时间为UTC时间，需要根据时区转换为北京时间

- parsedContent：
    - 此部分内容根据type的不同，包含不同的字段
    - 目前支持的类别：Bilibili\GitHub\Telegram(默认)
    - 详情内容如下：

#### 1. Bilibili
- link：
    - 类名：tgme_widget_message_link_preview
    - 举例：`<a class="tgme_widget_message_link_preview" href="https://b23.tv/qA5P1eb">`，link为https://b23.tv/qA5P1eb

- title：
    - 类名：link_preview_title
    - 举例：`<div class="link_preview_title" dir="auto">游戏画面和真实感，有关系吗？_哔哩哔哩bilibili_游戏杂谈</div>`，其中`游戏画面和真实感，有关系吗？`为title

- previewImage：
    - 类名：link_preview_right_image
    - 举例：`<i class="link_preview_right_image" style="background-image:url('https://cdn4.cdn-telegram.org/file/MvmIfBHjM0MBPjIVJPlUHbmBe_92BC8Kc0SB47RDG4ZlPRRIssboViXBziP4P2SKy8CAlFsSwfUyNEvVEJLCkpP72l0zk07jrTqaM0bl4iklcPoR4oDRoSCakZpUYNgsarTfGc2-YbXaeK48QDNh0iQeiYEq83JU7JdlYBdrh7b5hbRmjlAyYer_ezH73juAVIns41shV6PvLfo_GGp27IPrVlD_KVJT8uSpW7msZnQNFKiWBDfzM5WnWCLBsT4WpdfgEyGk-vjr4b22E7bI9L-cwEQnL0JKmnwueGsnYgpYo7ps656gUs3qvvvmr2kwLpYmLpTzA3SktH539mgg-g.jpg')"></i>`，其中`https://cdn4.cdn-telegram.org/file/MvmIfBHjM0MBPjIVJPlUHbmBe_92BC8Kc0SB47RDG4ZlPRRIssboViXBziP4P2SKy8CAlFsSwfUyNEvVEJLCkpP72l0zk07jrTqaM0bl4iklcPoR4oDRoSCakZpUYNgsarTfGc2-YbXaeK48QDNh0iQeiYEq83JU7JdlYBdrh7b5hbRmjlAyYer_ezH73juAVIns41shV6PvLfo_GGp27IPrVlD_KVJT8uSpW7msZnQNFKiWBDfzM5WnWCLBsT4WpdfgEyGk-vjr4b22E7bI9L-cwEQnL0JKmnwueGsnYgpYo7ps656gUs3qvvvmr2kwLpYmLpTzA3SktH539mgg-g.jpg`部分为图片地址

举例：`<div class="link_preview_description" dir="auto">因有小伙伴要拿去做演示，所以做了这个纯净版的都江堰，去除了视频前面账号相关的内容，修改了一些错误文字，增加了一些没提到的信息，并且开放了直接下载, 视频播放量 2178、弹幕量 1、点赞数 89、投硬币枚数 30、收藏人数 34、转发人数 12, 视频作者 蚂蚁爱游戏, 作者简介 免费拿模组鹅群298801874，都市天际线，新手教程，经常制作终极系列。终极格子城，终极工业区规划。<br>，相关视频：用游戏来理解都江堰【都市天际线】，全英vlog｜泪别成都聊聊为什么全家移居清迈，没事我溜达，当初不应该让他去成…</div>`

- description：
    - 类名：link_preview_description
    - 其中`因有小伙伴要拿去做演示，所以做了这个纯净版的都江堰，去除了视频前面账号相关的内容，修改了一些错误文字，增加了一些没提到的信息，并且开放了直接下载`为description

- stats：
    - 类名：link_preview_description
    - 其中`视频播放量 2178、弹幕量 1、点赞数 89、投硬币枚数 30、收藏人数 34、转发人数 12`为stats

- author：
    - 类名：link_preview_description
    - 举例：`<div class="link_preview_description" dir="auto">蚂蚁爱游戏</div>`，其中`蚂蚁爱游戏`为author

- authorDescription：
    - 类名：link_preview_description
    - 其中`免费拿模组鹅群298801874，都市天际线，新手教程，经常制作终极系列。终极格子城，终极工业区规划。`为authorDescription


#### 2. GitHub

- link：
    - 类名：tgme_widget_message_link_preview
    - 举例：`<a class="tgme_widget_message_link_preview" href="https://github.com/shardeum/shardeum">`，link为https://github.com/shardeum/shardeum

- title：
    - 类名：link_preview_title
    - 举例：`<div class="link_preview_title" dir="auto">GitHub - shardeum/shardeum: Shardeum is an EVM based autoscaling blockchain</div>`，其中`GitHub - shardeum/shardeum: Shardeum is an EVM based autoscaling blockchain`为title

- previewImage：
    - 类名：link_preview_image
    - 举例：`<i class="link_preview_image" style="background-image:url('https://cdn4.cdn-telegram.org/file/IAfmBoL9xDeFsG42Hz0uA0f6_kNILBAMtHWTIvcHxm29cKcbBOXNDCJg7dlnWdVFi7_h6DqUKJK-gHCyb7Q0luxd15XOZfuBm_zmfICgemC2RKVMM06d5alx-_gyG1ogTeHae2dhvp0VFIwABhzwoG8krdhrWxrDBEofGcbRgzyKXdaiJVVDtjwCTeHevYyajKfQmA-pfo6M3t4SW_ZwZnxgMul_HMbaDi3PQpKE5rF32G6XdWNlJQPSw6k4oYfVk9ldidNaufsS0nO6b5Qt5zhiVnzTfxZr_0nydLC84vw5AB7vgWVodGxnCim8ydjE__XBRENzeTdPGJYCJwwxaw.jpg');padding-top:50%"></i>`，其中`https://cdn4.cdn-telegram.org/file/IAfmBoL9xDeFsG42Hz0uA0f6_kNILBAMtHWTIvcHxm29cKcbBOXNDCJg7dlnWdVFi7_h6DqUKJK-gHCyb7Q0luxd15XOZfuBm_zmfICgemC2RKVMM06d5alx-_gyG1ogTeHae2dhvp0VFIwABhzwoG8krdhrWxrDBEofGcbRgzyKXdaiJVVDtjwCTeHevYyajKfQmA-pfo6M3t4SW_ZwZnxgMul_HMbaDi3PQpKE5rF32G6XdWNlJQPSw6k4oYfVk9ldidNaufsS0nO6b5Qt5zhiVnzTfxZr_0nydLC84vw5AB7vgWVodGxnCim8ydjE__XBRENzeTdPGJYCJwwxaw.jpg`为图片地址

- previewDescription：
    - 类名：link_preview_description
    - 举例：`<div class="link_preview_description" dir="auto">Shardeum is an EVM based autoscaling blockchain. Contribute to shardeum/shardeum development by creating an account on GitHub.</div>`，其中`Shardeum is an EVM based autoscaling blockchain. Contribute to shardeum/shardeum development by creating an account on GitHub.`为previewDescription

#### 3. Telegram

- forwardFrom：
    - 类名：tgme_widget_message_forwarded_from accent_color
    - 举例：`<div class="tgme_widget_message_forwarded_from accent_color">Forwarded from&nbsp;<a class="tgme_widget_message_forwarded_from_name" href="https://t.me/TestFlightCN/27889"><span dir="auto">科技圈<i class="emoji" style="background-image:url('//telegram.org/img/emoji/40/F09F8E97.png')"><b>🎗</b></i>在花频道<i class="emoji" style="background-image:url('//telegram.org/img/emoji/40/F09F93AE.png')"><b>📮</b></i></span></a></div>`
    - 按照格式正常渲染即可

- message：
    - 类名：tgme_widget_message_text js-message_text before_footer
    - 举例：`<div class="tgme_widget_message_text js-message_text before_footer" dir="auto"><b>Android 将推出官方 Linux 终端应用</b><br><br>Google 正在为 Android 开发一个官方的 Linux 终端应用。这个应用将允许用户在 Android 设备上运行 Linux 命令，类似于 Chromebook 上的 Crostini。<br><br>开发人员可以通过开发人员选项启用终端应用程序，并将在虚拟机中安装 Debian。<br><br><a href="https://m.youtube.com/watch?time_continue=39&amp;amp;v=Be6oBsw41aQ&amp;amp;embeds_referring_euri=https%3A%2F%2Fwww.androidauthority.com%2F&amp;amp;embeds_referring_origin=https%3A%2F%2Fwww.androidauthority.com&amp;amp;source_ve_path=MTM5MTE3LDI4NjY2" target="_blank" rel="noopener" onclick="return confirm('Open this link?\n\n'+this.href);">演示</a> | <a href="https://www.androidauthority.com/android-linux-terminal-app-3489887/" target="_blank" rel="noopener" onclick="return confirm('Open this link?\n\n'+this.href);">Android Authority</a><br><br><i class="emoji" style="background-image:url('//telegram.org/img/emoji/40/E29898.png')"><b>☘️</b></i> 关注频道 <a href="https://t.me/ZaiHuapd" target="_blank">@ZaiHuapd</a><br><i class="emoji" style="background-image:url('//telegram.org/img/emoji/40/F09F93AE.png')"><b>📮</b></i> 热点投稿 <a href="https://t.me/ZaiHuabot" target="_blank">@ZaiHuabot</a><span style="display: inline-block; width: 126px;"></span></div>`
    - 按照格式正常渲染即可

- previewImage：
    - 类名：tgme_widget_message_photo_wrap 或者 tgme_widget_message_video_thumb
    - 举例1：`<a class="tgme_widget_message_photo_wrap 4920400047552703609 1145619910_456240249" href="https://t.me/rk_pins/99" style="width:800px;background-image:url('https://cdn1.cdn-telegram.org/file/c9KmZDd4ldh_aYcKGsDd8bTix0_4xyK4YG2NY2MVRyQhCCDi-tOzO7J-C2MTvxxE-1JVwbbgGOhd6rCGH3NrsBH91bzOWoyC3fg1iN77kyWtuHuhxkuZDGrF_8vfnB-8jX9WZqzSa5b89YYbpgjqMkNUXfeYcUhJbp83x8F0-Vcc2_kb_UNI5C5DcEhgZliXAkJMiMpDlscyA37MXk2s1xThxkXtXt8OCuLTRnG1f6b17rYC0yxj_njpETn840OGvbnWTIgVZU7FKDQTr6t5qF0snnxcz4sjP65oZJTp1Ap2pWTY998r2_NnKZVtnRqSYfVb9MBudywmJEEY5G_-Kg.jpg')"><div class="tgme_widget_message_photo" style="padding-top:56.25%"></div></a>`，其中图片地址：`https://cdn1.cdn-telegram.org/file/c9KmZDd4ldh_aYcKGsDd8bTix0_4xyK4YG2NY2MVRyQhCCDi-tOzO7J-C2MTvxxE-1JVwbbgGOhd6rCGH3NrsBH91bzOWoyC3fg1iN77kyWtuHuhxkuZDGrF_8vfnB-8jX9WZqzSa5b89YYbpgjqMkNUXfeYcUhJbp83x8F0-Vcc2_kb_UNI5C5DcEhgZliXAkJMiMpDlscyA37MXk2s1xThxkXtXt8OCuLTRnG1f6b17rYC0yxj_njpETn840OGvbnWTIgVZU7FKDQTr6t5qF0snnxcz4sjP65oZJTp1Ap2pWTY998r2_NnKZVtnRqSYfVb9MBudywmJEEY5G_-Kg.jpg`
    - 举例2：`<i class="tgme_widget_message_video_thumb" style="background-image:url('https://cdn1.cdn-telegram.org/file/go1Bzk9ssQAzDjJ16ZZZ-FGTjwxlHT0wOSAaU0fctHgRwL54uRm4oCKUEu77b5oHveu0CnsgGFfk6T7Nvq_dg1UNHtU5E7L-bKPMSM_XGt4qNyDn2cknoefFcHo2Uag6Y_usisnqxqTrbBy8MWusOYQ12Pk3PtQzgELQJA7o0S3Ufq-wIZl5O3oDGlTQjKD9kjRAEG0OqHHVx7zPwUbrYcKy6J-DAnsjBBXGxvjPI5GU6LUmkGHVxTb4IcbzChF9pXY9Ane16Weagwxc5WIdgjUXP37Fnh4heKIK4RROCJRbn3FVcIOAstGQnmDjrL5PnNDocVp5C4hzQ9Xx9p0DHA')"></i>`，其中图片地址：`https://cdn1.cdn-telegram.org/file/go1Bzk9ssQAzDjJ16ZZZ-FGTjwxlHT0wOSAaU0fctHgRwL54uRm4oCKUEu77b5oHveu0CnsgGFfk6T7Nvq_dg1UNHtU5E7L-bKPMSM_XGt4qNyDn2cknoefFcHo2Uag6Y_usisnqxqTrbBy8MWusOYQ12Pk3PtQzgELQJA7o0S3Ufq-wIZl5O3oDGlTQjKD9kjRAEG0OqHHVx7zPwUbrYcKy6J-DAnsjBBXGxvjPI5GU6LUmkGHVxTb4IcbzChF9pXY9Ane16Weagwxc5WIdgjUXP37Fnh4heKIK4RROCJRbn3FVcIOAstGQnmDjrL5PnNDocVp5C4hzQ9Xx9p0DHA`