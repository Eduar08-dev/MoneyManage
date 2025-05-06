"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase/firebase-config"
import { useFirebase } from "@/lib/firebase/firebase-provider"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { user, loading } = useFirebase()

  // Redirect if user is already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push("/")
    }
  }, [user, loading, router])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        // Crear usuario con Firebase
        await createUserWithEmailAndPassword(auth, email, password)
        toast.success("Cuenta creada exitosamente. Iniciando sesión...")
      } else {
        // Iniciar sesión con Firebase
        await signInWithEmailAndPassword(auth, email, password)
      }
    } catch (error: any) {
      console.error("Error de autenticación:", error)

      // Mensajes de error más amigables de Firebase
      let errorMessage = "Ocurrió un error durante la autenticación."

      if (error.code === "auth/invalid-email") {
        errorMessage = "El formato del correo electrónico no es válido."
      } else if (error.code === "auth/user-not-found" || error.code === "auth/invalid-credential") {
        errorMessage = "Credenciales inválidas. Verifica tu correo y contraseña."
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Contraseña incorrecta."
      } else if (error.code === "auth/email-already-in-use") {
        errorMessage = "Este correo electrónico ya está registrado."
      } else if (error.code === "auth/weak-password") {
        errorMessage = "La contraseña debe tener al menos 6 caracteres."
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Demasiados intentos fallidos. Intenta de nuevo más tarde."
      }

      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading indicator while checking auth state
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-muted/40">Verificando sesión...</div>
  }

  // If still loading or user is defined, don't render the form yet (wait for redirect)
  // This prevents flashing the login form briefly if already logged in.
  if (user) {
    return <div className="flex min-h-screen items-center justify-center bg-muted/40">Redirigiendo...</div>
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isSignUp ? "Crear cuenta" : "Iniciar sesión"}</CardTitle>
          <CardDescription>
            {isSignUp
              ? "Crea una cuenta para comenzar a gestionar tus finanzas"
              : "Inicia sesión para acceder a tu cuenta"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAuth}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Procesando..." : isSignUp ? "Crear cuenta" : "Iniciar sesión"}
            </Button>
            <Button type="button" variant="link" className="w-full" onClick={() => setIsSignUp(!isSignUp)}>
              {isSignUp ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
