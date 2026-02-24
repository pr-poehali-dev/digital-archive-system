import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Icon from "@/components/ui/icon"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  free: { label: "Бесплатный", color: "secondary" },
  standard: { label: "Стандарт", color: "default" },
  premium: { label: "Премиум", color: "destructive" },
}

export default function Profile() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) navigate("/")
  }, [user, loading, navigate])

  if (loading) {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="botmarket-theme">
        <div className="min-h-screen flex items-center justify-center">
          <Icon name="Loader2" className="animate-spin text-muted-foreground" size={40} />
        </div>
      </ThemeProvider>
    )
  }

  if (!user) return null

  const planInfo = PLAN_LABELS[user.plan] ?? { label: user.plan, color: "secondary" }
  const joinDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString("ru-RU", { year: "numeric", month: "long", day: "numeric" })
    : "—"

  return (
    <ThemeProvider defaultTheme="dark" storageKey="botmarket-theme">
      <SiteHeader />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container max-w-2xl px-4 md:px-6">
          <h1 className="text-3xl font-heading font-bold mb-8">Личный профиль</h1>

          <Card className="glassmorphic-card mb-6">
            <CardHeader className="flex flex-row items-center gap-4 pb-4">
              <img
                src={user.avatar_url}
                alt={user.username}
                className="w-20 h-20 rounded-full border-2 border-border"
              />
              <div className="flex flex-col gap-1">
                <CardTitle className="text-xl">{user.username}</CardTitle>
                <Badge variant={planInfo.color as "secondary" | "default" | "destructive"}>
                  {planInfo.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Steam ID</span>
                  <span className="font-mono">{user.steam_id}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Дата регистрации</span>
                  <span>{joinDate}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={user.profile_url} target="_blank" rel="noopener noreferrer">
                    <Icon name="ExternalLink" size={14} className="mr-1" />
                    Профиль Steam
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => { logout(); navigate("/") }}
                >
                  <Icon name="LogOut" size={14} className="mr-1" />
                  Выйти
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphic-card">
            <CardHeader>
              <CardTitle className="text-base">Мои боты</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground gap-3">
                <Icon name="Bot" size={40} className="opacity-30" />
                <p className="text-sm">У тебя пока нет активных ботов.</p>
                <Button size="sm" onClick={() => navigate("/")}>
                  Перейти в каталог
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </ThemeProvider>
  )
}
