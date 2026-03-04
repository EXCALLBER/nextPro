"use client"; // 🚀 关键：声明这是一个客户端组件

import { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const [todo, setTodo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { id } = use(params)

  // 模拟客户端获取数据（如果完全移交给客户端交互）
  useEffect(() => {
    fetch(`https://jsonplaceholder.typicode.com/todos/${id}`)
      .then(res => res.json())
      .then(data => {
        setTodo(data);
        setLoading(false);
      });
  }, [id]);

  // 交互逻辑：切换完成状态
  const toggleComplete = () => {
    setTodo({ ...todo});
  };

  if (loading) return <p className="p-6 text-slate-500">正在努力加载交互界面...</p>;
  if (!todo?.id) notFound();

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <div className="rounded-lg border p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-4">文章 ID: {todo.id}</h1>
        
        <div className="space-y-4">
          <p><strong>标题:</strong> {todo.title}</p>
          
          <div className="flex items-center gap-4">
            <strong>状态:</strong>
            <span className={todo.completed ? "text-green-600" : "text-amber-600"}>
              {todo.completed ? '✅ 已完成' : '⏳ 未完成'}
            </span>
            
            {/* 🚀 交互按钮 */}
            <button 
              onClick={toggleComplete}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              切换状态
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
