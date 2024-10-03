import CategoryList from '@/components/CategoryList';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-center text-blue-800 mb-16 tracking-wide">
          RKPin
        </h1>
        <div className="bg-white shadow-md rounded-xl p-8 max-w-6xl mx-auto">
          <CategoryList />
        </div>
      </div>
    </main>
  );
}