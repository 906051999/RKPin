import { parseBilibili } from './parser/bilibiliParser';
import { parseGithub } from './parser/githubParser';
import { parseTelegram } from './parser/telegramParser';

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