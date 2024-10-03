import PinContent from './PinContent';
import PinTag from './PinTag';

export default function ThumbnailCard({ data, onClick, TypeSpecificContent }) {
  return (
    <div className="relative group cursor-pointer" onClick={onClick}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <TypeSpecificContent data={data} />
      </div>
      {(data.pinContent || data.pinTags) && (
        <div className="absolute top-0 left-full ml-4 w-64 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {data.pinContent && <PinContent content={data.pinContent} />}
          {data.pinTags && <PinTag tags={data.pinTags} />}
        </div>
      )}
    </div>
  );
}