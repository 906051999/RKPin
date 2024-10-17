import * as cheerio from 'cheerio';

export async function parseWeixin(message) {
  const $ = cheerio.load(message.rawHtml);
  
  // 尝试多种可能的选择器来获取链接
  const link = $('.tgme_widget_message_link_preview').attr('href') || 
               $('a.tgme_widget_message_link_preview').attr('href');

  // 尝试多种可能的选择器来获取标题
  const title = $('.link_preview_title').text().trim() || 
                $('.tgme_widget_message_text').text().trim();

  // 尝试多种可能的选择器来获取预览图片
  let previewImage = $('.link_preview_right_image').css('background-image');
  if (previewImage) {
    previewImage = previewImage.replace(/^url\(['"](.+)['"]\)$/, '$1');
  } else {
    previewImage = $('.link_preview_image').attr('src');
  }

  // 如果还是没有找到预览图片，尝试在整个消息中查找图片
  if (!previewImage) {
    previewImage = $('img').attr('src');
  }

  console.log('Parsed Weixin content:', { link, title, previewImage }); // 添加日志

  return {
    link,
    title,
    previewImage
  };
}
