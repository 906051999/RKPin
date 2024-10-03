import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function TextThumbnail({ data }) {
  return (
    <div>
      <Image
        src={data.coverUrl || '/images/default-cover.png'}
        alt={data.title}
        width={200}
        height={200}
        className="w-full h-auto"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{data.title}</h3>
      </div>
    </div>
  );
}

export function TextFullContent({ data }) {
  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="flex-shrink-0">
        <Image
          src={data.coverUrl || '/images/default-cover.png'}
          alt={data.title}
          width={200}
          height={200}
          className="rounded-lg"
        />
      </div>
      <div className="flex-grow">
        <h2 className="text-2xl font-bold mb-4">{data.title}</h2>
        <div className="mt-4">
          {Object.entries(data.sections).map(([header, content]) => (
            <div key={header} className="mb-6">
              <h3 className="text-xl font-semibold mb-2">{header}</h3>
              <div className="prose prose-sm max-w-none markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}