'use client';

export default function NotFound() {
  return (
    <div className="p-6 max-w-2xl mx-auto text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-2">❌ 找不到该待办事项</h2>
      <p className="text-gray-600 mb-4">
        输入的 ID 无效或对应内容已被删除。
      </p>
      <button
        onClick={() => window.history.back()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        ← 返回上一页
      </button>
    </div>
  );
}
