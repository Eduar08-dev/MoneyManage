"use client"

import type React from "react"

import { useState, useEffect } from "react" // Add useEffect
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import type { UserData } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

interface SettingsFormProps {
  userData: UserData
}

export function SettingsForm({ userData }: SettingsFormProps) {
  const [limiteGastos, setLimiteGastos] = useState(userData.limiteGastos || 0)
  const [margenSeguridad, setMargenSeguridad] = useState(userData.margenSeguridad || 10)
  const [isLoading, setIsLoading] = useState(false)
  const { updateUserData } = useFirebase() 

  useEffect(() => {
    setLimiteGastos(userData.limiteGastos || 0)
    setMargenSeguridad(userData.margenSeguridad || 10)
  }, [userData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateUserData({
        limiteGastos,
        margenSeguridad,
      })

      toast.success("Configuración actualizada", {
        description: "Tus preferencias han sido guardadas exitosamente",
      })
    } catch (error) {
      toast.error("Error", {
        description: "No se pudo actualizar la configuración",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ... rest of the form JSX ... */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="limiteGastos">Límite mensual de gastos</Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5">$</span>
            <Input
              id="limiteGastos"
              type="number"
              min=""
              step="100"
              className="pl-7"
              value={limiteGastos === 0 ? "" : limiteGastos}
              onChange={(e) => setLimiteGastos(Number(e.target.value) || 0)}
            />
          </div>
          <p className="text-sm text-muted-foreground">Establece un límite para tus gastos mensuales</p>
        </div>

        <div className="space-y-2">
          <Label>Margen de seguridad ({margenSeguridad}%)</Label>
          <Slider
            value={[margenSeguridad]}
            min={0}
            max={50}
            step={5}
            onValueChange={(value) => setMargenSeguridad(value[0])}
          />
          <p className="text-sm text-muted-foreground">
            Porcentaje de tus ingresos que deberías mantener como margen de seguridad
          </p>
          <div className="mt-2 p-3 bg-muted rounded-md">
            <p className="text-sm">
              Con un margen de seguridad del {margenSeguridad}%, deberías mantener al menos{" "}
              <span className="font-medium">{formatCurrency(limiteGastos * (margenSeguridad / 100))}</span> de tus
              ingresos sin gastar.
            </p>
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Guardando..." : "Guardar configuración"}
      </Button>
    </form>
  )
}
