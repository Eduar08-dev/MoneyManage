"use client"

import { useState } from "react"
import { Timestamp } from "firebase/firestore"
import { ArrowDownIcon, ArrowUpIcon, CalendarIcon, TrashIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { Transaction } from "@/lib/types"

interface TransactionListProps {
  transactions: Transaction[]
  showViewAll?: () => void
}

export function TransactionList({ transactions, showViewAll }: TransactionListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { deleteTransaction } = useFirebase()

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      await deleteTransaction(deleteId)
      toast.success("Transacción eliminada", {
        description: "La transacción ha sido eliminada exitosamente",
      })
    } catch (error) {
      toast.error("Error", {
        description: "No se pudo eliminar la transacción",
      })
    } finally {
      setIsDialogOpen(false)
      setDeleteId(null)
    }
  }

  const confirmDelete = (id: string) => {
    setDeleteId(id)
    setIsDialogOpen(true)
  }

  if (transactions.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No hay transacciones registradas</p>
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${transaction.type === "ingreso" ? "bg-green-100" : "bg-red-100"}`}>
                {transaction.type === "ingreso" ? (
                  <ArrowUpIcon className="h-5 w-5 text-green-600" />
                ) : (
                  <ArrowDownIcon className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div>
                <p className="font-medium">{transaction.description}</p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  {formatDate(
                    transaction.date instanceof Date
                      ? transaction.date.toISOString()
                      : transaction.date instanceof Timestamp
                      ? transaction.date.toDate().toISOString()
                      : transaction.date
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`font-medium ${transaction.type === "ingreso" ? "text-green-600" : "text-red-600"}`}>
                {transaction.type === "ingreso" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </span>
              <Button variant="ghost" size="icon" onClick={() => confirmDelete(transaction.id)}>
                <TrashIcon className="h-4 w-4 text-muted-foreground" />
                <span className="sr-only">Eliminar</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {showViewAll && transactions.length > 0 && (
        <div className="flex justify-center">
          <Button variant="link" onClick={showViewAll}>
            Ver todas las transacciones
          </Button>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta transacción? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
