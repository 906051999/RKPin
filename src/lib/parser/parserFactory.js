import { parseBilibili } from './bilibiliParser';
import { parseLink } from './linkParser';
import { parseTelegram } from './telegramParser';
import { parseWeixin } from './weixinParser';
import { parseWeibo } from './weiboParser';

export function parseFactory(type) {
  switch (type.toLowerCase()) {
    case 'bilibili':
      return parseBilibili;
    case 'link':
    case 'github':
      return parseLink;
    case 'telegram':
      return parseTelegram;
    case 'weixin':
    case 'weixin official accounts platform':
      return parseWeixin;
    case 'weibo':
      return parseWeibo;
    default:
      return parseTelegram;
  }
}
