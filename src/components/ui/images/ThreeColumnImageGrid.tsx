export default function ThreeColumnImageGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <div className="h-40 rounded-xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center text-gray-400 text-xs font-medium">
        Grid Image 1
      </div>

      <div className="h-40 rounded-xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center text-gray-400 text-xs font-medium">
        Grid Image 2
      </div>

      <div className="h-40 rounded-xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center text-gray-400 text-xs font-medium">
        Grid Image 3
      </div>
    </div>
  );
}
