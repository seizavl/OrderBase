'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

export default function UsersPage() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    axios.get('http://localhost:8080/api/users', {
      withCredentials: true
    })
      .then(res => setUsers(res.data))
      .catch(err => console.error('ユーザー一覧取得失敗', err))
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">ユーザー一覧</h1>
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">ユーザー名</th>
            <th className="border px-4 py-2">作成日時</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: any) => (
            <tr key={user.ID}>
              <td className="border px-4 py-2">{user.ID}</td>
              <td className="border px-4 py-2">{user.Username}</td>
              <td className="border px-4 py-2">{user.CreatedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
