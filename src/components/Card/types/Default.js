import Image from 'next/image';

export function DefaultThumbnail({ data }) {
  return (
    <div>
      <Image
        src={data.coverUrl || '/images/default-cover.png'}
        alt={data.title || 'Default cover'}
        width={200}
        height={200}
        className="w-full h-auto"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{data.title || 'Untitled'}</h3>
      </div>
    </div>
  );
}

export function DefaultFullContent({ data }) {
  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="flex-shrink-0">
        <Image
          src={data.coverUrl || '/images/default-cover.png'}
          alt={data.title || 'Default cover'}
          width={200}
          height={200}
          className="rounded-lg"
        />
      </div>
      <div className="flex-grow">
        <h2 className="text-2xl font-bold mb-4">{data.title || 'Untitled'}</h2>
        <div className="mt-4">
          {Object.entries(data).map(([key, value]) => (
            <p key={key} className="mb-2">
              <strong>{key}:</strong> {JSON.stringify(value)}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}