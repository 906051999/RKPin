export default function PinTag({ tags }) {
    return (
      <div>
        <h4 className="text-lg font-semibold mb-2">Pin Tags</h4>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    );
  }