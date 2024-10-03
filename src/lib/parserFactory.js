import musicParser from './parsers/musicParser';
import textParser from './parsers/textParser';
// 导入其他类别的解析器

const parserFactory = (type) => {
  switch (type) {
    case 'music':
      return musicParser;
    case 'text':
      return textParser;
    // 添加其他类别的 case
    default:
      // 如果没有特定的解析器，返回一个通用解析器
      return async (content, fileName) => {
        const title = fileName.replace('.md', '');
        const sections = content.split('## ');
        
        // 尝试提取 pinContent 和 pinTags，如果不存在则为 undefined
        const pinContentSection = sections.find(s => s.startsWith('PinContent'));
        const pinContent = pinContentSection ? pinContentSection.replace('PinContent\n', '').trim() : undefined;
        
        const pinTagsSection = sections.find(s => s.startsWith('PinTag'));
        const pinTags = pinTagsSection ? pinTagsSection.replace('PinTag\n', '').trim().split('\n').map(line => line.trim().replace('#', '')) : undefined;

        return {
          title,
          content,
          pinContent,
          pinTags,
          // 其他通用字段...
        };
      };
  }
};

export default parserFactory;