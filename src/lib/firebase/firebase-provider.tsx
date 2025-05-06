"use client"

import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from "react"
import { type User, onAuthStateChanged } from "firebase/auth"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { auth, db } from "./firebase-config"
import type { Transaction, UserData } from "@/lib/types"

interface FirebaseContextType {
  user: User | null
  userData: UserData | null
  transactions: Transaction[]
  loading: boolean
  fetchUserData: () => Promise<void>
  fetchTransactions: () => Promise<void>
  addTransaction: (transaction: Omit<Transaction, "id" | "createdAt">) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  updateUserData: (data: Partial<UserData>) => Promise<void>
}

const defaultContextValue: FirebaseContextType = {
  user: null,
  userData: null,
  transactions: [],
  loading: true,
  fetchUserData: async () => { console.warn("FirebaseProvider not ready"); },
  fetchTransactions: async () => { console.warn("FirebaseProvider not ready"); },
  addTransaction: async () => { throw new Error("FirebaseProvider not ready"); },
  deleteTransaction: async () => { throw new Error("FirebaseProvider not ready"); },
  updateUserData: async () => { throw new Error("FirebaseProvider not ready"); },
};

const FirebaseContext = createContext<FirebaseContextType>(defaultContextValue);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const fetchUserData = async () => {
    if (!user) return
    try {
      const userDocRef = doc(db, "users", user.uid)
      const userDoc = await getDoc(userDocRef)
      
      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserData)
      } else {
        const newUserData: Omit<UserData, 'createdAt'> & { createdAt: any } = {
          id: user.uid,
          limiteGastos: 0,
          margenSeguridad: 20,
          createdAt: serverTimestamp(),
        }
        await setDoc(userDocRef, newUserData)
        setUserData({ ...newUserData, createdAt: Timestamp.now() } as UserData) 
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

  const fetchTransactions = async () => {
    if (!user) return
    try {
      const q = query(collection(db, "transactions"), where("userId", "==", user.uid), orderBy("date", "desc"))
      const querySnapshot = await getDocs(q)
      const transactionsData: Transaction[] = []
      querySnapshot.forEach((doc) => {
        transactionsData.push({
          id: doc.id,
          ...(doc.data() as Omit<Transaction, "id">),
        })
      })
      setTransactions(transactionsData)
    } catch (error) {
      console.error("Error fetching transactions:", error)
    }
  }

  const addTransaction = async (transaction: Omit<Transaction, "id" | "createdAt">) => {
    if (!user) throw new Error("Usuario no autenticado")
    const newTransaction = {
      ...transaction,
      userId: user.uid,
      createdAt: serverTimestamp(),
    }
    try {
      await addDoc(collection(db, "transactions" ), newTransaction)
      await fetchTransactions() 
    } catch (error) {
      console.error("Error adding transaction:", error)
      throw error
    }
  }

  const deleteTransaction = async (id: string) => {
    if (!user) throw new Error("Usuario no autenticado")
    try {
      await deleteDoc(doc(db, "transactions", id))
      await fetchTransactions() 
    } catch (error) {
      console.error("Error deleting transaction:", error)
      throw error
    }
  }

  const updateUserData = async (data: Partial<UserData>) => {
    if (!user) throw new Error("Usuario no autenticado")
    const userDocRef = doc(db, "users", user.uid)
    try {
      await setDoc(userDocRef, { ...data, updatedAt: serverTimestamp() }, { merge: true })
      await fetchUserData() 
    } catch (error) {
      console.error("Error updating user data:", error)
      throw error
    }
  }

  useEffect(() => {
    if (user) {
      fetchUserData()
      fetchTransactions()
    } else {

      setUserData(null)
      setTransactions([])
    }
  }, [user])

  const contextValue = useMemo(() => ({
    user,
    userData,
    transactions,
    loading,
    fetchUserData,
    fetchTransactions,
    addTransaction,
    deleteTransaction,
    updateUserData,
  }), [user, userData, transactions, loading]); 

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  )
}

export const useFirebase = () => {
  const context = useContext(FirebaseContext)
  return context
}
