// "use client"

// import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { signOut } from "firebase/auth" // Import Firebase signOut
// import { auth } from "@/lib/firebase/firebase-config" // Import Firebase auth config
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Progress } from "@/components/ui/progress"
// import { Toaster } from "@/components/ui/sonner"
// import { toast } from "sonner" // Add sonner toast import
// import { ArrowDownIcon, ArrowUpIcon, LogOutIcon, PlusIcon } from "lucide-react"
// import { TransactionList } from "@/components/Transaction-list"
// import { TransactionForm } from "@/components/Transaction-form"
// import { SettingsForm } from "@/components/Settings-form"
// import { useFirebase } from "@/lib/firebase/firebase-provider"
// import { formatCurrency } from "@/lib/utils"
// import { useCollection } from 'react-firebase-hooks/firestore';
// import { db } from "@/lib/firebase/firebase-config"
// import { collection, query, orderBy, where } from "firebase/firestore"
// import type { Transaction } from "@/lib/types"

// export function Dashboard() {
//   const [activeTab, setActiveTab] = useState("resumen")
//   const [showTransactionForm, setShowTransactionForm] = useState(false)
//   const [transactionType, setTransactionType] = useState<"ingreso" | "gasto">("ingreso")
//   const { user, userData, loading } = useFirebase()
//   const router = useRouter()
//   const [fetchedTransactions, setFetchedTransactions] = useState<Transaction[]>([])
//   const [monthlyTransactions, setMonthlyTransactions] = useState<Transaction[]>([])

//   const [movimientos, loadingMovimientos, errorMovimientos] = useCollection(
//     user ? query(
//       collection(db, "transactions"),
//       where("userId", "==", user.uid),
//     ) : null
//   );

//   useEffect(() => {
//     if (movimientos) {
//       const transactionData = movimientos.docs.map((doc) => {
//         const data = doc.data();
//         return { id: doc.id, ...data, date: data.date?.toDate ? data.date.toDate() : new Date(data.date) } as Transaction;
//       }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort descending by date
//       setFetchedTransactions(transactionData);
//     } else {
//       setFetchedTransactions([]);
//     }
//   }, [movimientos]);

//   useEffect(() => {
//     const now = new Date();
//     const currentYear = now.getFullYear();
//     const currentMonth = now.getMonth(); 

//     const filtered = fetchedTransactions.filter(t => {
//       if (!t.date || !(t.date instanceof Date) || isNaN(t.date.getTime())) {
//         console.warn("Skipping transaction due to invalid date:", t);
//         return false; // Skip if date is invalid or not a Date object
//       }
//       return t.date.getFullYear() === currentYear && t.date.getMonth() === currentMonth;
//     });
//     setMonthlyTransactions(filtered);
//   }, [fetchedTransactions]);

//   useEffect(() => {
//     if (!loading && !user) {
//       router.push("/login")
//     }
//   }, [user, loading, router])

//   const handleAddTransaction = (type: "ingreso" | "gasto") => {
//     setTransactionType(type)
//     setShowTransactionForm(true)
//   }

//   const handleSignOut = async () => {
//     try {
//       await signOut(auth)
//       router.push("/login")
//     } catch (error) {
//       console.error("Error signing out: ", error);
//       toast.error("Error al cerrar sesión.");
//     }
//   }
//   if (loading) {
//     return <div className="flex items-center justify-center min-h-screen">Verificando sesión...</div>
//   }

//   if (user && !userData) {
//     return <div className="flex items-center justify-center min-h-screen">Cargando datos...</div>
//   }

//   if (!user) {
//     return null;
//   }
//   if (!userData) {
//     console.error("Error: User authenticated but userData is null after loading.")
//     return <div className="flex items-center justify-center min-h-screen">Error al cargar datos del usuario.</div>
//   }

//   const totalIngresos = fetchedTransactions.filter((t) => t.type === "ingreso").reduce((sum, t) => sum + t.amount, 0)
//   const totalGastos = fetchedTransactions.filter((t) => t.type === "gasto").reduce((sum, t) => sum + t.amount, 0)
//   const saldoActual = totalIngresos - totalGastos
//   const monthlyTotalGastos = monthlyTransactions.filter((t) => t.type === "gasto").reduce((sum, t) => sum + t.amount, 0)

//   const porcentajeGastado = userData.limiteGastos ? (monthlyTotalGastos / userData.limiteGastos) * 100 : 0
//   const restanteParaLimite = userData.limiteGastos
//     ? Math.max(0, userData.limiteGastos - monthlyTotalGastos)
//     : 0;

//   return (
//     <div className="container mx-auto p-4 max-w-6xl">
//       <header className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">FinanzApp</h1>
//         <Button variant="ghost" size="icon" onClick={handleSignOut}>
//           <LogOutIcon className="h-5 w-5" />
//           <span className="sr-only">Cerrar sesión</span>
//         </Button>
//       </header>

//       <Tabs defaultValue="resumen" value={activeTab} onValueChange={setActiveTab}>
//         <TabsList className="grid w-full grid-cols-3">
//           <TabsTrigger value="resumen">Resumen</TabsTrigger>
//           <TabsTrigger value="transacciones">Transacciones</TabsTrigger>
//           <TabsTrigger value="configuracion">Configuración</TabsTrigger>
//         </TabsList>

//         <TabsContent value="resumen" className="space-y-4 mt-4">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <Card>
//               <CardHeader className="pb-2">
//                 <CardDescription>Saldo actual</CardDescription>
//                 <CardTitle className={saldoActual >= 0 ? "text-green-600" : "text-red-600"}>
//                   {formatCurrency(saldoActual)}
//                 </CardTitle>
//               </CardHeader>
//             </Card>

//             <Card>
//               <CardHeader className="pb-2">
//                 <CardDescription>Total ingresos</CardDescription>
//                 <CardTitle className="text-green-600">{formatCurrency(totalIngresos)}</CardTitle>
//               </CardHeader>
//             </Card>

//             <Card>
//               <CardHeader className="pb-2">
//                 <CardDescription>Total gastos</CardDescription>
//                 <CardTitle className="text-red-600">{formatCurrency(totalGastos)}</CardTitle>
//               </CardHeader>
//             </Card>
//           </div>

//           <Card>
//             <CardHeader>
//               <CardTitle>Límite de gastos mensual</CardTitle>
//               <CardDescription>
//                 Has gastado {formatCurrency(totalGastos)} de {formatCurrency(userData.limiteGastos || 0)}
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <Progress value={porcentajeGastado} className="h-2" />
//               <p className="mt-2 text-sm">Te quedan {formatCurrency(restanteParaLimite)} disponibles para gastar</p>
//             </CardContent>
//           </Card>

//           <div className="flex space-x-4">
//             <Button onClick={() => handleAddTransaction("ingreso")} className="flex-1 bg-green-600 hover:bg-green-700">
//               <ArrowUpIcon className="mr-2 h-4 w-4" />
//               Agregar ingreso
//             </Button>
//             <Button onClick={() => handleAddTransaction("gasto")} className="flex-1 bg-red-600 hover:bg-red-700">
//               <ArrowDownIcon className="mr-2 h-4 w-4" />
//               Agregar gasto
//             </Button>
//           </div>

//           <Card>
//             <CardHeader>
//               <CardTitle>Últimas transacciones</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <TransactionList
//                 transactions={fetchedTransactions.slice(0, 5)}
//                 showViewAll={() => setActiveTab("transacciones")}
//               />
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="transacciones" className="space-y-4 mt-4">
//           <div className="flex justify-between items-center">
//             <h2 className="text-xl font-bold">Historial de transacciones</h2>
//             <div className="flex space-x-2">
//             </div>
//           </div>

//           <Card>
//             <CardContent className="pt-6">
//               <TransactionList transactions={fetchedTransactions} />
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="configuracion" className="space-y-4 mt-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Configuración de finanzas</CardTitle>
//               <CardDescription>Establece tus límites de gastos y objetivos financieros</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <SettingsForm userData={userData} />
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>

//       {showTransactionForm && <TransactionForm type={transactionType} onClose={() => setShowTransactionForm(false)} />}
//     </div>
//   )
// }

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase/firebase-config"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { ArrowDownIcon, ArrowUpIcon, LogOutIcon, PlusIcon } from "lucide-react"
import { TransactionList } from "@/components/Transaction-list"
import { TransactionForm } from "@/components/Transaction-form"
import { SettingsForm } from "@/components/Settings-form"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { formatCurrency } from "@/lib/utils"
import { useCollection } from "react-firebase-hooks/firestore"
import { db } from "@/lib/firebase/firebase-config"
import { collection, query, where, Timestamp } from "firebase/firestore"
import type { Transaction } from "@/lib/types"

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("resumen")
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [transactionType, setTransactionType] = useState<"ingreso" | "gasto">("ingreso")
  const { user, userData, loading } = useFirebase()
  const router = useRouter()
  const [fetchedTransactions, setFetchedTransactions] = useState<Transaction[]>([])
  const [monthlyTransactions, setMonthlyTransactions] = useState<Transaction[]>([])

  const [movimientos, loadingMovimientos, errorMovimientos] = useCollection(
    user ? query(collection(db, "transactions"), where("userId", "==", user.uid)) : null,
  )

  useEffect(() => {
    if (movimientos) {
      const transactionData = movimientos.docs
        .map((doc) => {
          const data = doc.data()
          const dateValue =
            data.date instanceof Timestamp
              ? data.date.toDate()
              : typeof data.date === "string"
                ? new Date(data.date)
                : data.date

          return {
            id: doc.id,
            ...data,
            date: dateValue,
          } as Transaction
        })
        .sort((a, b) => {
          const dateA = a.date instanceof Date ? a.date : new Date()
          const dateB = b.date instanceof Date ? b.date : new Date()
          return dateB.getTime() - dateA.getTime()
        })

      setFetchedTransactions(transactionData)
    } else {
      setFetchedTransactions([])
    }
  }, [movimientos])

  useEffect(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    const filtered = fetchedTransactions.filter((t) => {
      let transactionDate: Date

      if (t.date instanceof Date) {
        transactionDate = t.date
      } else if (t.date instanceof Timestamp) {
        transactionDate = t.date.toDate()
      } else if (typeof t.date === "string") {
        transactionDate = new Date(t.date)
      } else {
        console.warn("Skipping transaction due to invalid date:", t)
        return false
      }
      if (isNaN(transactionDate.getTime())) {
        console.warn("Skipping transaction due to invalid date:", t)
        return false
      }

      return transactionDate.getFullYear() === currentYear && transactionDate.getMonth() === currentMonth
    })

    setMonthlyTransactions(filtered)
  }, [fetchedTransactions])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  const handleAddTransaction = (type: "ingreso" | "gasto") => {
    setTransactionType(type)
    setShowTransactionForm(true)
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Error signing out: ", error)
      toast.error("Error al cerrar sesión.")
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Verificando sesión...</div>
  }

  if (user && !userData) {
    return <div className="flex items-center justify-center min-h-screen">Cargando datos...</div>
  }

  if (!user) {
    return null
  }

  if (!userData) {
    console.error("Error: User authenticated but userData is null after loading.")
    return <div className="flex items-center justify-center min-h-screen">Error al cargar datos del usuario.</div>
  }

  const totalIngresos = fetchedTransactions.filter((t) => t.type === "ingreso").reduce((sum, t) => sum + t.amount, 0)
  const totalGastos = fetchedTransactions.filter((t) => t.type === "gasto").reduce((sum, t) => sum + t.amount, 0)
  const saldoActual = totalIngresos - totalGastos
  const monthlyTotalGastos = monthlyTransactions.filter((t) => t.type === "gasto").reduce((sum, t) => sum + t.amount, 0)

  const porcentajeGastado = userData.limiteGastos ? (monthlyTotalGastos / userData.limiteGastos) * 100 : 0
  const restanteParaLimite = userData.limiteGastos ? Math.max(0, userData.limiteGastos - monthlyTotalGastos) : 0

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">FinanzApp</h1>
        <Button variant="ghost" size="icon" onClick={handleSignOut}>
          <LogOutIcon className="h-5 w-5" />
          <span className="sr-only">Cerrar sesión</span>
        </Button>
      </header>

      <Tabs defaultValue="resumen" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="transacciones">Transacciones</TabsTrigger>
          <TabsTrigger value="configuracion">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Saldo actual</CardDescription>
                <CardTitle className={saldoActual >= 0 ? "text-green-600" : "text-red-600"}>
                  {formatCurrency(saldoActual)}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total ingresos</CardDescription>
                <CardTitle className="text-green-600">{formatCurrency(totalIngresos)}</CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total gastos</CardDescription>
                <CardTitle className="text-red-600">{formatCurrency(totalGastos)}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Límite de gastos mensual</CardTitle>
              <CardDescription>
                Has gastado {formatCurrency(monthlyTotalGastos)} de {formatCurrency(userData.limiteGastos || 0)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={porcentajeGastado} className="h-2" />
              <p className="mt-2 text-sm">Te quedan {formatCurrency(restanteParaLimite)} disponibles para gastar</p>
            </CardContent>
          </Card>

          <div className="flex space-x-4">
            <Button onClick={() => handleAddTransaction("ingreso")} className="flex-1 bg-green-600 hover:bg-green-700">
              <ArrowUpIcon className="mr-2 h-4 w-4" />
              Agregar ingreso
            </Button>
            <Button onClick={() => handleAddTransaction("gasto")} className="flex-1 bg-red-600 hover:bg-red-700">
              <ArrowDownIcon className="mr-2 h-4 w-4" />
              Agregar gasto
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Últimas transacciones</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionList
                transactions={monthlyTransactions.slice(0, 5)}
                showViewAll={() => setActiveTab("transacciones")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transacciones" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Historial de transacciones</h2>
            <div className="flex space-x-2">
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <TransactionList transactions={fetchedTransactions} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuracion" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de finanzas</CardTitle>
              <CardDescription>Establece tus límites de gastos y objetivos financieros</CardDescription>
            </CardHeader>
            <CardContent>
              <SettingsForm userData={userData} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showTransactionForm && <TransactionForm type={transactionType} onClose={() => setShowTransactionForm(false)} />}
    </div>
  )
}
