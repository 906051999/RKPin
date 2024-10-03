import PinContent from './PinContent';
import PinTag from './PinTag';

export default function FullDataCard({ data, onClose, TypeSpecificContent }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="float-right text-2xl">&times;</button>
        <div className="flex flex-col md:flex-row gap-8">
          <TypeSpecificContent data={data} />
        </div>
        {data.pinContent && <PinContent content={data.pinContent} />}
        {data.pinTags && <PinTag tags={data.pinTags} />}
      </div>
    </div>
  );
}