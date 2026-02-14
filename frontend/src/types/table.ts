// テーブル（座席）の型定義
export interface Table {
  id: number
  table_number: number
  capacity: number
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

// テーブル作成リクエスト
export interface CreateTableRequest {
  table_number: number
  capacity: number
  status?: 'active' | 'inactive'
}

// テーブル更新リクエスト
export interface UpdateTableRequest {
  table_number?: number
  capacity?: number
  status?: 'active' | 'inactive'
}

// 注文型にテーブル情報を追加
export interface Order {
  id: number
  user_id?: number
  product_id: number
  quantity: number
  total_price: number
  status: string
  table_id?: number
  created_at: string
  updated_at: string
  table?: Table
  product?: {
    id: number
    name: string
    price: number
    image?: string
  }
  user?: {
    id: number
    username: string
  }
}
