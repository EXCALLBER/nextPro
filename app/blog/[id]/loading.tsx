export default function Loading() {
  return (
    <main className="p-6 max-w-2xl mx-auto animate-pulse">
      {/* 卡片外框 */}
      <div className="rounded-lg border border-slate-200 p-6 shadow-sm">
        {/* 标题骨架 */}
        <div className="h-8 bg-slate-200 rounded-md w-1/3 mb-6"></div>
        
        <div className="space-y-6">
          {/* 标题行骨架 */}
          <div className="flex gap-4">
            <div className="h-5 bg-slate-200 rounded w-16"></div>
            <div className="h-5 bg-slate-200 rounded w-full"></div>
          </div>
          
          {/* 状态行骨架 */}
          <div className="flex gap-4">
            <div className="h-5 bg-slate-200 rounded w-16"></div>
            <div className="h-8 bg-slate-100 rounded-full w-24"></div>
          </div>

          {/* 底部横线与用户ID骨架 */}
          <div className="border-t pt-4">
            <div className="h-4 bg-slate-100 rounded w-28"></div>
          </div>
        </div>
      </div>
    </main>
  );
}