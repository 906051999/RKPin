import { parseBilibili } from './bilibiliParser';
import { parseGithub } from './githubParser';
import { parseTelegram } from './telegramParser';

export function parseFactory(type) {
  switch (type.toLowerCase()) {
    case 'bilibili':
      return parseBilibili;
    case 'github':
      return parseGithub;
    case 'telegram':
    default:
      return parseTelegram;
  }
}