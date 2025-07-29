import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { quickTourAPI } from "@/lib/services/api";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  MessageSquare,
  Bell,
  Award,
  Users,
  Settings,
  Sparkles,
  BarChart3,
  Wallet,
  FileText,
  Shield,
} from "lucide-react";

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  target?: string; // CSS selector for element to highlight
  action?: {
    text: string;
    href: string;
  };
}

interface QuickTourProps {
  isOpen: boolean;
  onClose: () => void;
  userType: "user" | "admin" | "sub_admin" | "super_admin";
}

export default function QuickTour({
  isOpen,
  onClose,
  userType,
}: QuickTourProps) {
  const { user, admin } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [tourSteps, setTourSteps] = useState<TourStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [tourId, setTourId] = useState<string | null>(null);

  // Icon mapping for dynamic icon assignment
  const iconMap: { [key: string]: any } = {
    Sparkles,
    MessageSquare,
    Bell,
    Award,
    Users,
    Settings,
    BarChart3,
    Wallet,
    FileText,
    Shield,
    CheckCircle,
  };

  // Default fallback tour steps
  const getDefaultTourSteps = (type: string): TourStep[] => {
    const userSteps: TourStep[] = [
      {
        id: "welcome",
        title: "Welcome to Surat BRTS!",
        description:
          "Get ready to improve your commute experience and earn rewards by helping us make BRTS better for everyone.",
        icon: Sparkles,
      },
      {
        id: "complaints",
        title: "Submit Complaints",
        description:
          "Report issues like bus delays, overcrowding, or driver behavior. Each verified complaint earns you reward points!",
        icon: MessageSquare,
        action: {
          text: "File a Complaint",
          href: "/complaint/create",
        },
      },
      {
        id: "points",
        title: "Earn Reward Points",
        description:
          "Get points for submitting complaints, completing your profile, and helping improve the system. Redeem points for cash!",
        icon: Award,
        action: {
          text: "View Points History",
          href: "/points",
        },
      },
    ];

    const adminSteps: TourStep[] = [
      {
        id: "admin-welcome",
        title: "Welcome to Admin Panel",
        description:
          "Manage the entire Surat BRTS complaint system efficiently and help improve public transportation.",
        icon: Settings,
      },
      {
        id: "admin-complaints",
        title: "Manage Complaints",
        description:
          "Review, approve, or reject user complaints. Follow the approval hierarchy and provide feedback to users.",
        icon: MessageSquare,
        action: {
          text: "Manage Complaints",
          href: "/admin/complaints",
        },
      },
      {
        id: "admin-analytics",
        title: "Analytics & Insights",
        description:
          "Monitor system performance, track complaint trends, and generate reports for decision making.",
        icon: BarChart3,
        action: {
          text: "View Analytics",
          href: "/admin/analytics",
        },
      },
    ];

    return type === "user" ? userSteps : adminSteps;
  };

  // Load tour steps from backend based on role
  useEffect(() => {
    const loadTourSteps = async () => {
      if (!isOpen) return;

      setLoading(true);
      try {
        const response = await quickTourAPI.getAll();
        const roleTours = response.data.filter(
          (tour: any) => tour.targetRoles.includes(userType) && tour.enabled,
        );

        if (roleTours.length > 0) {
          // Use the first matching tour for this role
          const tour = roleTours[0];
          setTourId(tour.id);

          // Transform API steps to component format
          const transformedSteps = tour.steps.map((step: any) => ({
            ...step,
            icon: iconMap[step.iconName] || Sparkles,
          }));

          setTourSteps(transformedSteps);
        } else {
          // Use default steps as fallback
          setTourSteps(getDefaultTourSteps(userType));
        }
      } catch (error) {
        console.error("Failed to load tour steps:", error);
        // Use default steps as fallback
        setTourSteps(getDefaultTourSteps(userType));
      } finally {
        setLoading(false);
      }
    };

    loadTourSteps();
  }, [isOpen, userType]);

  const steps = tourSteps;
  const currentTourStep = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Track completion in backend if tour ID is available
      if (tourId && (user || admin)) {
        await quickTourAPI.assign(tourId, {
          roles: [userType],
          completed: true,
          userId: user?.id || admin?.id,
        });
      }

      // Mark tour as completed in localStorage as backup
      localStorage.setItem(`quickTour_${userType}_completed`, "true");
      onClose();
    } catch (error) {
      console.error("Failed to track tour completion:", error);
      // Still mark as completed locally
      localStorage.setItem(`quickTour_${userType}_completed`, "true");
      onClose();
    }
  };

  const handleSkip = () => {
    localStorage.setItem(`quickTour_${userType}_skipped`, "true");
    onClose();
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Sparkles className="h-8 w-8 text-primary animate-pulse mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading tour...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (steps.length === 0) {
    return null;
  }

  if (!currentTourStep) return null;

  const progress = ((currentStep + 1) / steps.length) * 100;
  const IconComponent = currentTourStep.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <IconComponent className="h-5 w-5 text-primary" />
              Quick Tour
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <Badge variant="outline">
                {currentStep + 1} of {steps.length}
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          <Card>
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <IconComponent className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {currentTourStep.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {currentTourStep.description}
                </p>
              </div>

              {currentTourStep.action && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.location.href = currentTourStep.action!.href;
                    handleComplete();
                  }}
                  className="mb-4"
                >
                  {currentTourStep.action.text}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <Button variant="ghost" size="sm" onClick={handleSkip}>
              Skip Tour
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button size="sm" onClick={handleComplete}>
                <CheckCircle className="h-4 w-4 mr-1" />
                Get Started
              </Button>
            ) : (
              <Button size="sm" onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook to manage tour visibility with enhanced role-based logic
export function useQuickTour(
  userType: "user" | "admin" | "sub_admin" | "super_admin",
) {
  const { user, admin } = useAuth();
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const checkTourStatus = async () => {
      try {
        // Check if user has already completed this role's tour
        const tourCompleted = localStorage.getItem(
          `quickTour_${userType}_completed`,
        );
        const tourSkipped = localStorage.getItem(
          `quickTour_${userType}_skipped`,
        );

        // Check if this is a first visit for this role
        const isFirstVisit = !localStorage.getItem(`firstVisit_${userType}`);

        // For admin users, also check if they have a different role now
        const lastSeenRole = localStorage.getItem("lastSeenRole");
        const currentUserId = user?.id || admin?.id;
        const lastUserId = localStorage.getItem("lastUserId");

        // Show tour if:
        // 1. First visit for this role, OR
        // 2. User changed roles, OR
        // 3. Different user logged in
        const shouldShowTour =
          (isFirstVisit && !tourCompleted && !tourSkipped) ||
          (lastSeenRole && lastSeenRole !== userType && !tourCompleted) ||
          (lastUserId && lastUserId !== currentUserId && !tourCompleted);

        if (shouldShowTour) {
          localStorage.setItem(`firstVisit_${userType}`, "true");
          localStorage.setItem("lastSeenRole", userType);
          if (currentUserId) {
            localStorage.setItem("lastUserId", currentUserId);
          }

          // Show tour after a brief delay
          setTimeout(() => setShowTour(true), 1500);
        }
      } catch (error) {
        console.error("Failed to check tour status:", error);
      }
    };

    if (userType && (user || admin)) {
      checkTourStatus();
    }
  }, [userType, user, admin]);

  const startTour = () => setShowTour(true);
  const closeTour = () => setShowTour(false);

  const resetTour = () => {
    localStorage.removeItem(`quickTour_${userType}_completed`);
    localStorage.removeItem(`quickTour_${userType}_skipped`);
    setShowTour(true);
  };

  return { showTour, startTour, closeTour, resetTour };
}
