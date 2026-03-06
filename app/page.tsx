import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Chat from "@/components/Chat";

export default async function Home() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-indigo-500/30">
      {/* 顶部装饰背景 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-indigo-600/20 blur-[120px] rounded-full -z-10"></div>

      <main className="max-w-6xl mx-auto px-6 py-20 flex flex-col items-center">
        {/* Hero Section */}
        <section className="text-center space-y-6 mb-16">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
            NextPro Dashboard
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            基于 Supabase 和 Next.js 的高性能全栈应用模板。
            实时协作、安全认证、现代 UI，一站式交付。
          </p>
        </section>

        {/* 动态内容区 */}
        <div className="w-full flex flex-col md:flex-row gap-8 items-start justify-center">
          
          {/* 左侧状态/导航卡片 */}
          <div className="w-full md:w-80 space-y-6">
            <div className="p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
              <h2 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-4">当前状态</h2>
              {session ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold">
                      {session.user?.email?.[0].toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium truncate">{session.user?.email}</p>
                      <p className="text-[10px] text-green-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> 已认证
                      </p>
                    </div>
                  </div>
                  <form action="/api/auth/signout" method="post">
                    <button className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 border border-white/10 transition-all text-sm font-medium">
                      退出登录
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-400">您尚未登录，请先登录以访问实时聊天室。</p>
                  <div className="flex flex-col gap-2">
                    <Link href="/login" className="w-full py-2.5 text-center rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all text-sm font-medium">
                      立即登录
                    </Link>
                    <Link href="/register" className="w-full py-2.5 text-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-medium">
                      创建账号
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 快速导航卡片 */}
            <div className="p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl space-y-4">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">快捷入口</h2>
              <nav className="flex flex-col gap-2">
                <Link href="/about" className="group flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-all text-sm text-gray-300">
                  <span>关于我们</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </Link>
                <Link href="/services/design" className="group flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-all text-sm text-gray-300">
                  <span>设计服务</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </Link>
              </nav>
            </div>
          </div>

          {/* 右侧聊天室 - 仅登录后显示 */}
          {session ? (
            <Chat userEmail={session.user.email!} userId={session.user.id} />
          ) : (
            <div className="h-[400px] w-full max-w-lg flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">登录后开启实时群聊</p>
            </div>
          )}

        </div>
      </main>

      {/* 底部版权 */}
      <footer className="mt-auto py-10 text-center border-t border-white/5">
        <p className="text-gray-600 text-xs">© 2026 NextPro Inc. Built with Next.js & Supabase.</p>
      </footer>
    </div>
  );
}
