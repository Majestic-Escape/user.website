import { Bell } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function NotificationsPage() {
  const notifications= [] // Empty array for now

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 py-20 md:py-24">
      <Card className="w-full max-w-5xl mx-auto border-none shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bricolage text-absoluteDark font-semibold">Notifications</CardTitle>
            <Button variant="outline" size="sm">
              Mark all as read
            </Button>
          </div>
          <CardDescription>Stay updated on your activities</CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No new notifications</h3>
              <p className="text-muted-foreground max-w-sm">
                When you have notifications, they'll show up here. Check back later for updates.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Notification items would go here */}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

