const MessageSkeleton = () => {
  const skeletonMessages = Array(6).fill(null);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {skeletonMessages.map((_, idx) => (
        <div
          key={idx}
          className={`flex items-start gap-2 ${idx % 2 === 0 ? "justify-start" : "justify-end"}`}
        >
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-gray-300 animate-pulse" />
          </div>

          <div className="flex flex-col space-y-1">
            <div className="h-4 w-16 bg-gray-300 rounded animate-pulse" />
            <div className="h-10 w-[200px] bg-gray-300 rounded-xl animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageSkeleton;
