import Link from "next/link";

interface ResType  {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export default async function DesignService() {
  const data = await fetch('https://jsonplaceholder.typicode.com/posts');
  const res:ResType[] = await data.json()
  console.log('这是请求的数据', res);
  return <div style={{ padding: '20px' }}>
    {res.map((item)=>{
      return <div key={item.id} className="mb-4">
        <Link href={`/blog/${item.userId}`} style={{ color: 'blue' }}>{item.id}:{item.title} （用户 ID: {item.userId}）</Link>
        <h4>{item.body}</h4>
      </div>
    })}
  </div>;
}