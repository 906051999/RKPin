import * as cheerio from 'cheerio';

export async function parseGithub(message) {
  const $ = cheerio.load(message.rawHtml);
  const link = $('.tgme_widget_message_link_preview').attr('href');
  const title = $('.link_preview_title').text().trim();
  const previewImage = $('.link_preview_image').css('background-image')?.replace(/^url\(['"](.+)['"]\)$/, '$1') || null;
  const previewDescription = $('.link_preview_description').text().trim();

  return {
    link,
    title,
    previewImage,
    previewDescription
  };
}
