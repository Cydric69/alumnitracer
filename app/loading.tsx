export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-blue-200"></div>
        <div className="h-16 w-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin absolute left-0 top-0"></div>
      </div>
    </div>
  );
}
