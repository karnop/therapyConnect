export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        {/* Animated Logo/Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-secondary rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-gray-500 font-medium animate-pulse">
          Finding peace...
        </p>
      </div>
    </div>
  );
}
