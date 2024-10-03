import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function PinContent({ content }) {
  return (
    <div className="prose prose-sm max-w-none mb-4 markdown-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}