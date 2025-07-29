import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Complaint } from "@/lib/types";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  RotateCcw,
  Crown,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
} from "lucide-react";

interface AdminComplaintActionsProps {
  complaint: Complaint;
  onUpdate: (complaint: Complaint) => void;
  canApprove: boolean;
}

export default function AdminComplaintActions({
  complaint,
  onUpdate,
  canApprove,
}: AdminComplaintActionsProps) {
  const { admin } = useAuth();
  const { toast } = useToast();
  const [revertReason, setRevertReason] = useState("");
  const [actionReason, setActionReason] = useState("");

  const isSuperAdmin = admin?.role === "super_admin";
  const isAlreadyProcessed =
    complaint.status === "approved" || complaint.status === "rejected";

  const handleApprove = async () => {
    try {
      const updatedComplaint: Complaint = {
        ...complaint,
        status: "approved",
        timeline: [
          ...complaint.timeline,
          {
            action: "Approved",
            status: "approved",
            description: actionReason || "Complaint approved by admin",
            adminId: admin?.id || "",
            adminName: admin?.name || "",
            timestamp: new Date().toISOString(),
          },
        ],
      };
      onUpdate(updatedComplaint);
      toast({
        title: "Complaint Approved",
        description: "The complaint has been approved successfully",
      });
      setActionReason("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve complaint",
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    try {
      const updatedComplaint: Complaint = {
        ...complaint,
        status: "rejected",
        reason: actionReason,
        timeline: [
          ...complaint.timeline,
          {
            action: "Rejected",
            status: "rejected",
            reason: actionReason,
            description: `Complaint rejected: ${actionReason}`,
            adminId: admin?.id || "",
            adminName: admin?.name || "",
            timestamp: new Date().toISOString(),
          },
        ],
      };
      onUpdate(updatedComplaint);
      toast({
        title: "Complaint Rejected",
        description: "The complaint has been rejected",
      });
      setActionReason("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject complaint",
        variant: "destructive",
      });
    }
  };

  const handleRevertDecision = async () => {
    if (!isSuperAdmin || !revertReason.trim()) return;

    try {
      const updatedComplaint: Complaint = {
        ...complaint,
        status: "under_review",
        reason: undefined,
        timeline: [
          ...complaint.timeline,
          {
            action: "Decision Reverted",
            status: "under_review",
            reason: revertReason,
            description: `Super Admin reverted previous decision: ${revertReason}`,
            adminId: admin?.id || "",
            adminName: admin?.name || "Super Admin",
            timestamp: new Date().toISOString(),
          },
        ],
      };
      onUpdate(updatedComplaint);
      toast({
        title: "Decision Reverted",
        description: "The complaint decision has been reverted by Super Admin",
      });
      setRevertReason("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revert decision",
        variant: "destructive",
      });
    }
  };

  const handleEscalate = async () => {
    try {
      const updatedComplaint: Complaint = {
        ...complaint,
        status: "under_review",
        timeline: [
          ...complaint.timeline,
          {
            action: "Escalated",
            status: "under_review",
            description: `Escalated to higher authority: ${actionReason}`,
            adminId: admin?.id || "",
            adminName: admin?.name || "",
            timestamp: new Date().toISOString(),
          },
        ],
      };
      onUpdate(updatedComplaint);
      toast({
        title: "Complaint Escalated",
        description: "The complaint has been escalated to higher authority",
      });
      setActionReason("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to escalate complaint",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* View Details */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Complaint Details - {complaint.token}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Type
                </label>
                <p className="font-medium">{complaint.type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <Badge className="ml-2">{complaint.status}</Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Description
              </label>
              <p>{complaint.description}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Timeline
              </label>
              <div className="space-y-2 mt-2">
                {complaint.timeline.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-muted rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{event.action}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {event.description}
                        </p>
                      )}
                      {event.adminName && (
                        <p className="text-xs text-muted-foreground mt-1">
                          By: {event.adminName}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Regular Admin Actions */}
      {canApprove && !isAlreadyProcessed && (
        <>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Approve Complaint</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="Add approval notes (optional)..."
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <DialogTrigger asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogTrigger>
                  <Button onClick={handleApprove}>Approve Complaint</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-red-600">
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reject Complaint</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="Reason for rejection (required)..."
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <DialogTrigger asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogTrigger>
                  <Button
                    onClick={handleReject}
                    disabled={!actionReason.trim()}
                    variant="destructive"
                  >
                    Reject Complaint
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-orange-600">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Escalate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Escalate Complaint</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="Reason for escalation..."
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <DialogTrigger asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogTrigger>
                  <Button onClick={handleEscalate}>
                    Escalate to Higher Authority
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}

      {/* Super Admin Special Powers */}
      {isSuperAdmin && (
        <>
          {isAlreadyProcessed && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-purple-600">
                  <Crown className="h-4 w-4 mr-1" />
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Revert
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-purple-600" />
                    Super Admin: Revert Decision
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will revert the complaint back to "under review"
                    status. This is a Super Admin privilege and should be used
                    for exceptional cases only.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="my-4">
                  <Textarea
                    placeholder="Reason for reverting decision (required)..."
                    value={revertReason}
                    onChange={(e) => setRevertReason(e.target.value)}
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleRevertDecision}
                    disabled={!revertReason.trim()}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Shield className="h-4 w-4 mr-1" />
                    Revert Decision
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {!isAlreadyProcessed && (
            <Button variant="outline" size="sm" className="text-purple-600">
              <Crown className="h-4 w-4 mr-1" />
              Super Admin Override
            </Button>
          )}
        </>
      )}
    </div>
  );
}
