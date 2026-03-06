# Next.js 15 + Supabase 身份验证全流程实战指南 (超详细版)

本指南记录了本项目从传统 Auth.js 方案切换到 **Supabase Auth + SSR** 方案的完整技术细节。旨在帮助开发者深入理解 Supabase 是如何与 Next.js 15 的 App Router、Server Actions、以及异步 Cookies 协同工作的。

---

## 一、 依赖库及工具链 (Tech Stack)

在本项目中，我们使用了以下关键库来实现身份验证：

1.  **`@supabase/supabase-js`**: 
    *   **作用**：Supabase 的底层核心 SDK，提供所有与后端交互的基础 API。
2.  **`@supabase/ssr`**: 
    *   **作用**：专为服务端渲染 (SSR) 框架设计的适配库。
    *   **核心价值**：它解决了一个痛点——如何安全、自动地在 Next.js 的服务端（Server Components/Actions/Middleware）中读取和设置浏览器的 Cookies。它取代了已废弃的 `@supabase/auth-helpers-nextjs`。
3.  **`next/headers` (cookies)**:
    *   **作用**：Next.js 提供的原生方法，用于在服务端访问 HTTP 请求的 Cookies。在 Next.js 15 中，`cookies()` 变为了**异步函数**，这是本方案配置的关键点。

---

## 二、 核心代码片段全解 (保姆级逐行注释)

以下是实现登录注册所需的完整代码清单，按执行逻辑顺序排列。

### 1. 环境变量配置 (`.env`)
必须配置，且不可有空格或换行，否则会导致 `Failed to fetch` 网络错误。

```env
# 你的 Supabase 项目完整 URL，注意不要以斜杠 '/' 结尾
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"

# 你的 Supabase 匿名公钥 (Anon Key)，用于客户端发起安全的公开请求
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI..."
```

---

### 2. 客户端工具 (`lib/supabase/client.ts`)
**使用场景**：在顶部带有 `"use client"` 的组件中（如普通的 React 表单、按钮点击事件）使用。

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // createBrowserClient 会自动在浏览器的 localStorage / cookies 中寻找并维护 Token
  return createBrowserClient(
    // 使用 .trim() 是为了防止从 .env 读取时末尾带有不可见的换行符/空格导致 URL 解析失败
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()!
  )
}
```

---

### 3. 服务端工具 (`lib/supabase/server.ts`)
**使用场景**：在 Server Actions (如提交表单)、Server Components (如服务端渲染的主页)、Route Handlers (API 路由) 中使用。这是最复杂也是最核心的配置。

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// 必须是 async 函数，因为 Next.js 15 中 cookies() 是异步的
export async function createClient() {
  // 获取当前请求的 Cookie 存储对象
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()!,
    {
      // 告诉 Supabase 如何在服务端操作浏览器的 Cookie
      cookies: {
        // 读取逻辑：当 Supabase 需要验证用户是否登录时调用
        getAll() {
          return cookieStore.getAll()
        },
        // 写入逻辑：当登录成功、注册成功、或 Token 过期被自动刷新时调用
        setAll(cookiesToSet) {
          try {
            // 遍历 Supabase 需要设置的所有 Cookie (如 access_token, refresh_token)
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // 【重点】如果这段代码在 Server Component 渲染期间被触发，
            // Next.js 会因为“HTTP 响应头已发送”而抛出错误。
            // 这属于正常现象。真正的 Cookie 更新工作交由 `proxy.ts` (中间件) 来完成，
            // 所以这里直接 catch 忽略错误即可，不会影响功能。
          }
        },
      },
    }
  )
}
```

---

### 4. 会话同步守卫 (`proxy.ts` / `middleware.ts`)
**重要性：⭐⭐⭐⭐⭐**
如果没有这个文件，用户每次刷新页面，登录状态可能就会丢失。它拦截所有请求，检查并刷新过期的 Token。

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// 注意：在某些部署环境中，必须命名为 proxy 而不是 middleware
export async function proxy(request: NextRequest) {
  // 1. 初始化一个默认的 NextResponse 对象，用于向浏览器发回更新后的 Header
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // 2. 初始化一个仅供中间件使用的 Supabase 客户端
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          // 当 Token 刷新时，我们需要同时更新 request 和 response 的 Cookie
          // 这样后续路由能读到最新状态，浏览器也能保存最新状态
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({ request: { headers: request.headers } })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. 【核心触发点】调用 getUser() 会向 Supabase 发送请求验证当前 Token
  // 如果 Token 过期，Supabase 会自动刷新，并触发上面的 setAll 逻辑将新 Token 写入 Cookie
  await supabase.auth.getUser()

  // 4. 返回携带最新 Cookie 的响应
  return response
}

export const config = {
  // 指定哪些路径需要经过此中间件。通常是排除静态文件和图片，节省服务器资源
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

---

### 5. 注册逻辑 (Server Action: `app/actions/register.ts`)
服务端接收表单数据，调用 Supabase API 完成注册。不再需要手动 `bcrypt` 哈希密码，Supabase 自动处理。

```typescript
"use server" // 声明这是一个只能在服务端运行的动作

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function register(formData: FormData) {
  // 1. 从 FormData 提取用户输入
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string

  // 2. 初始化服务端 Supabase 客户端 (会自动处理 cookies)
  const supabase = await createClient()

  // 3. 调用注册接口
  const { error } = await supabase.auth.signUp({
    email,
    password, // 传入明文即可，Supabase 后端会自动进行加盐哈希
    options: {
      data: { full_name: name }, // 可以存储额外的业务字段 (Metadata)
    },
  })

  // 4. 错误处理
  if (error) {
    console.error("Supabase Auth Error:", error.message)
    return { error: error.message }
  }

  // 5. 成功后重定向到登录页
  return redirect("/login?message=Registration successful.")
}
```

---

### 6. 登录页面与逻辑 (`app/login/page.tsx`)
客户端组件，负责处理用户交互，并强制刷新页面以同步服务端状态。

```tsx
"use client" // 声明这是一个客户端组件

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()
  
  // 初始化客户端 Supabase 实例
  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()

    // 1. 发起密码登录请求
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Login Error:", error.message)
      // 显示错误给用户...
    } else {
      console.log("Login Success:", data)
      // 2. 登录成功，跳转到首页
      router.push("/")
      
      // 3. 【关键步骤】由于我们是在客户端(浏览器)获取的凭证，
      // Next.js 的服务端缓存可能还不知道用户已登录。
      // 调用 router.refresh() 会强制触发全站重新获取数据，
      // 从而让 proxy.ts 识别到新的 Cookie，更新整个应用的登录状态。
      setTimeout(() => router.refresh(), 500) 
    }
  }

  return (
    <form onSubmit={handleSignIn}>
      {/* 输入框和按钮的 JSX... */}
    </form>
  )
}
```

---

### 7. 服务端读取会话 (`app/page.tsx`)
在页面渲染时检查用户是否登录，决定显示哪些内容。

```tsx
import { createClient } from "@/lib/supabase/server";

// 这是一个异步 Server Component
export default async function Home() {
  // 1. 获取服务端客户端
  const supabase = await createClient();
  
  // 2. 获取当前会话 (Session)。
  // 不要直接用 getUser，除非你需要强验证。getSession 速度更快，因为它直接解析本地 Cookie 的 JWT
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <main>
      {session ? (
        // 如果 session 存在，说明已登录
        <p>欢迎, {session.user?.email}</p>
      ) : (
        // 如果 session 为 null，显示登录按钮
        <a href="/login">请登录</a>
      )}
    </main>
  );
}
```

---

### 8. 退出登录 API (`app/api/auth/signout/route.ts`)
安全地销毁 Session。

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// 必须使用 POST 请求以防止 CSRF 攻击导致的意外登出
export async function POST(request: Request) {
  const supabase = await createClient()

  // 检查是否在登录状态
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    // 调用 signOut 会让 Supabase 销毁后端的 Session 并在 HTTP 响应中设置清除 Cookie 的指令
    await supabase.auth.signOut()
  }

  // 重定向回首页
  return NextResponse.redirect(new URL('/', request.url), {
    status: 302,
  })
}
```

---

## 三、 环境故障排查 (Troubleshooting)

1.  **报错 "Failed to fetch"**:
    *   **原因**：通常是网络问题，导致客户端 `app/login/page.tsx` 无法连接到 Supabase 服务器。
    *   **解决**：检查 `.env` 中的 URL 是否拼写错误；关闭浏览器的广告拦截插件 (AdBlock)；尝试关闭 VPN 工具。
2.  **报错 "requested path is invalid"**:
    *   **原因**：旧的认证拦截器（如 Auth.js 的配置）还在生效并干扰路由。
    *   **解决**：删除项目中多余的 Auth 配置文件（如 `auth.ts`, `auth.config.ts`）。
3.  **刷新页面后登录状态消失**:
    *   **原因**：`proxy.ts` (中间件) 配置错误或未能拦截请求。
    *   **解决**：确保文件命名正确（在特殊环境中是 `proxy.ts`，常规是 `middleware.ts`），并确保导出的函数名与文件名匹配，且 `matcher` 未屏蔽您的页面。
