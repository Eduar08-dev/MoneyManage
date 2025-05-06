"use client"

import type React from "react"

import { useState, useEffect} from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useFirebase } from "@/lib/firebase/firebase-provider"

interface TransactionFormProps {
  type: "ingreso" | "gasto"
  onClose: () => void
}

export function TransactionForm({ type, onClose }: TransactionFormProps) {
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { addTransaction, userData, transactions } = useFirebase()
  const router = useRouter()
  const [totalGastos, setTotalGastos] = useState(0)

  useEffect(() => {
    const calculateTotalGastos = () => {
      const total = transactions.filter((t) => t.type === "gasto").reduce((sum, t) => sum + t.amount, 0)
      setTotalGastos(total)
    }

    calculateTotalGastos()
  }, [transactions])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!description || !amount) {
      toast.error("Error", {
        description: "Por favor completa todos los campos",
      })
      return
    }

    const amountValue = Number.parseFloat(amount)

    if (isNaN(amountValue) || amountValue <= 0) {
      toast.error("Error", {
        description: "El monto debe ser un número positivo",
      })
      return
    }

    if (type === "gasto" && userData?.limiteGastos) {
      if (totalGastos + amountValue > userData.limiteGastos) {
        toast.warning("Advertencia de límite", {
          description: "Este gasto excederá tu límite mensual establecido",
        })
      }
    }
    setIsLoading(true)

    try {
      await addTransaction({
        type,
        description,
        amount: amountValue,
        date: new Date().toISOString(),
        userId: userData?.id || "",
      })

      toast.success("Transacción registrada", {
        description: `${type === "ingreso" ? "Ingreso" : "Gasto"} registrado exitosamente`,
      })

      onClose()
    } catch (error) {
      // Use sonner's error format
      toast.error("Error", {
        description: "No se pudo registrar la transacción",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{type === "ingreso" ? "Registrar ingreso" : "Registrar gasto"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder={type === "ingreso" ? "Ej: Salario, Freelance..." : "Ej: Supermercado, Transporte..."}
                value={description}
                onChange={(e:any) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Monto</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5">$</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  className="pl-7"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className={type === "ingreso" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {isLoading ? "Procesando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
