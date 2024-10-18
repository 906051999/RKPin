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
  let description = fullContent;
  let stats = null;
  let author = null;
  let authorDescription = null;

  if (fullContent) {
    const parts = fullContent.split(', 视频播放量');
    description = parts[0].trim();
    
    if (parts.length > 1) {
      const restParts = parts[1].split(', 视频作者');
      stats = restParts[0] ? `视频播放量${restParts[0].trim()}` : null;
      
      if (restParts.length > 1) {
        const authorParts = restParts[1].split(', 作者简介');
        author = authorParts[0] ? authorParts[0].trim() : null;
        authorDescription = authorParts.length > 1 ? authorParts[1].trim() : null;
      }
    }
  }

  return {
    link,
    title,
    previewImage,
    description,
    stats,
    author,
    authorDescription,
  };
}
