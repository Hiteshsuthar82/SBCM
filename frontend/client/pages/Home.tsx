import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/hooks/useAuth";
import { APP_ROUTES } from "@/lib/constants";
import {
  MessageSquare,
  Search,
  Megaphone,
  Trophy,
  Star,
  TrendingUp,
  Users,
  Award,
  Phone,
  Mail,
  MapPin,
  User,
} from "lucide-react";

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  const quickActions = [
    {
      title: "Report Issue",
      description: "Submit a new complaint about BRTS services",
      icon: MessageSquare,
      href: APP_ROUTES.CREATE_COMPLAINT,
      color: "bg-red-500",
    },
    {
      title: "Track Complaint",
      description: "Check the status of your complaint",
      icon: Search,
      href: APP_ROUTES.TRACK_COMPLAINT,
      color: "bg-blue-500",
    },
    {
      title: "Latest News",
      description: "View announcements and updates",
      icon: Megaphone,
      href: APP_ROUTES.ANNOUNCEMENTS,
      color: "bg-green-500",
    },
    {
      title: "Leaderboard",
      description: "See top contributors",
      icon: Trophy,
      href: APP_ROUTES.LEADERBOARDS,
      color: "bg-yellow-500",
      requireAuth: true,
    },
  ];

  const stats = [
    { label: "Total Complaints", value: "2,847", icon: MessageSquare },
    { label: "Resolved Issues", value: "2,156", icon: Star },
    { label: "Active Users", value: "1,234", icon: Users },
    { label: "Satisfaction Rate", value: "94%", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Demo Notice */}
      <div className="bg-blue-50 dark:bg-blue-950 border-b border-blue-200 dark:border-blue-800">
        <div className="container max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-2 text-center">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Demo Mode Active - Use mobile:{" "}
              <span className="font-mono">9876543210</span> & OTP:{" "}
              <span className="font-mono">123456</span>
            </p>
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-r from-blue-600 to-green-600 flex items-center justify-center mb-6">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Surat BRTS
              <span className="block text-2xl md:text-3xl text-muted-foreground font-normal mt-2">
                Complaint Management System
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Help us improve the BRTS experience. Report issues, track
              complaints, and earn rewards for making our public transport
              better.
            </p>
          </div>

          {isAuthenticated && user ? (
            <div className="mb-8">
              <Card className="inline-block text-left">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Welcome back, {user.name}!</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Award className="h-4 w-4" />
                      <span>{user.points} points earned</span>
                      <Badge variant="secondary" className="ml-2">
                        {Math.floor(user.progress)}% Complete
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" asChild>
                <Link to={APP_ROUTES.REGISTER}>Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to={APP_ROUTES.LOGIN}>Sign In</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 px-4">
        <div className="container max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => {
              if (action.requireAuth && !isAuthenticated) return null;

              return (
                <Card
                  key={action.title}
                  className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <CardHeader className="text-center pb-4">
                    <div
                      className={`h-12 w-12 mx-auto rounded-lg ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pt-0">
                    <p className="text-sm text-muted-foreground mb-4">
                      {action.description}
                    </p>
                    <Button asChild className="w-full">
                      <Link to={action.href}>
                        {action.title === "Report Issue" ? "Report Now" : "Go"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Impact</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <stat.icon className="h-8 w-8 mx-auto text-primary mb-4" />
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {stat.value}
                  </h3>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="container max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Use SBCMS?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 mx-auto rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-6">
                <Star className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Earn Rewards</h3>
              <p className="text-muted-foreground">
                Get points for every complaint you submit and cash them out when
                resolved.
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 mx-auto rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-6">
                <Search className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Track Progress</h3>
              <p className="text-muted-foreground">
                Monitor your complaint status in real-time with detailed
                timeline updates.
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 mx-auto rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Community Impact</h3>
              <p className="text-muted-foreground">
                Join thousands of users working together to improve public
                transport.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Need Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Phone className="h-8 w-8 mx-auto text-primary mb-4" />
                <h3 className="font-semibold mb-2">Call Us</h3>
                <p className="text-sm text-muted-foreground">
                  +91 261 222 3333
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Mail className="h-8 w-8 mx-auto text-primary mb-4" />
                <h3 className="font-semibold mb-2">Email Us</h3>
                <p className="text-sm text-muted-foreground">
                  support@suratbrts.com
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="h-8 w-8 mx-auto text-primary mb-4" />
                <h3 className="font-semibold mb-2">Visit Us</h3>
                <p className="text-sm text-muted-foreground">
                  BRTS Office, Surat
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
