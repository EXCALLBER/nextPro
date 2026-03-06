import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main style={{ padding: '20px' }} className="text-center">
        <h1 className="text-2xl font-bold mb-4">项目首页 (Supabase 版)</h1>
        
        {session ? (
          <div className="mb-6 p-4 border rounded bg-white shadow-sm">
            <p className="mb-2">欢迎回来, <strong>{session.user?.email}</strong>!</p>
            <form action="/api/auth/signout" method="post">
              <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
                退出登录
              </button>
            </form>
          </div>
        ) : (
          <div className="mb-6 space-x-4">
            <Link href="/login" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
              登录
            </Link>
            <Link href="/register" className="border border-indigo-600 text-indigo-600 px-4 py-2 rounded hover:bg-indigo-50">
              注册
            </Link>
          </div>
        )}

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link href="/about" style={{ color: 'blue' }}>
            前往“关于我们” (一级页面)
          </Link>
          <Link href="/services/design" style={{ color: 'blue' }}>
            前往“设计服务” (二级页面)
          </Link>
        </nav>
      </main>
    </div>
  );
}
