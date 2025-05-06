import type { Timestamp } from "firebase/firestore"
import { FieldValue } from "firebase/firestore"

export interface Transaction {
  id: string
  type: "ingreso" | "gasto"
  description: string
  amount: number
  date: string | Timestamp | Date
  userId: string
  createdAt?: Timestamp
}

export interface UserData {
  limiteGastos?: number
  id: string
  margenSeguridad?: number
  createdAt?: Timestamp | FieldValue | undefined
  updatedAt?: Timestamp | FieldValue | undefined
}
