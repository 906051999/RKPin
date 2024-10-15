import * as cheerio from 'cheerio';

export async function parseBilibili(message) {
  const $ = cheerio.load(message.rawHtml);
  const link = $('.tgme_widget_message_link_preview').attr('href');
  let title = $('.link_preview_title').text().trim();
  // 去除 title 中的 "_哔哩哔哩_bilibili" 部分
  title = title.replace(/_哔哩哔哩_bilibili$/, '');
  const previewImage = $('.link_preview_right_image').css('background-image')?.replace(/^url\(['"](.+)['"]\)$/, '$1') || null;
  const previewDescription = $('.link_preview_description').text().trim();

  // 处理 previewDescription
  const [fullContent] = previewDescription.split('，相关视频：');
  const [description, ...rest] = fullContent.split(', 视频播放量');
  const stats = rest.join(', 视频播放量').split(', 视频作者')[0];
  const authorInfo = rest.join(', 视频播放量').split(', 视频作者')[1];

  const [author, authorDescription] = authorInfo.split(', 作者简介');

  return {
    link,
    title,
    previewImage,
    description: description.trim(),
    stats: stats ? `视频播放量${stats}` : null,
    author: author ? author.trim() : null,
    authorDescription: authorDescription ? authorDescription.trim() : null,
  };
}
