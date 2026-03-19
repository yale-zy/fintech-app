export default function LoadingSpinner({ fullscreen }) {
  if (fullscreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-apple-gray-6">
        <div className="w-8 h-8 border-2 border-apple-gray-4 border-t-apple-blue rounded-full animate-spin" />
      </div>
    )
  }
  return (
    <div className="flex justify-center py-12">
      <div className="w-6 h-6 border-2 border-apple-gray-4 border-t-apple-blue rounded-full animate-spin" />
    </div>
  )
}
