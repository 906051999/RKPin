const textParser = async (content, fileName) => {
    const title = fileName.replace('.md', '');
    
    // 解析 Markdown 内容
    const lines = content.split('\n');
    const headers = [];
    const sections = {};
    let currentSection = '';

    lines.forEach(line => {
        if (line.startsWith('#')) {
            const level = line.match(/^#+/)[0].length;
            const headerText = line.replace(/^#+\s*/, '').trim();
            headers.push({ level, text: headerText });
            currentSection = headerText;
            sections[currentSection] = '';
        } else if (currentSection) {
            sections[currentSection] += line + '\n';
        }
    });

    return {
        title,
        headers,
        sections,
        content
    };
};

export default textParser;