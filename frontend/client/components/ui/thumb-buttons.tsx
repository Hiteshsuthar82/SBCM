import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface ThumbButtonsProps {
  initialLikes?: number;
  initialDislikes?: number;
  userLiked?: boolean;
  userDisliked?: boolean;
  onLike?: () => void;
  onDislike?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

export function ThumbButtons({
  initialLikes = 0,
  initialDislikes = 0,
  userLiked = false,
  userDisliked = false,
  onLike,
  onDislike,
  className,
  size = "md",
  disabled = false,
}: ThumbButtonsProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [isLiked, setIsLiked] = useState(userLiked);
  const [isDisliked, setIsDisliked] = useState(userDisliked);

  const handleLike = () => {
    if (disabled) return;

    if (isLiked) {
      // Unlike
      setLikes(likes - 1);
      setIsLiked(false);
    } else {
      // Like (and remove dislike if exists)
      if (isDisliked) {
        setDislikes(dislikes - 1);
        setIsDisliked(false);
      }
      setLikes(likes + 1);
      setIsLiked(true);
    }
    onLike?.();
  };

  const handleDislike = () => {
    if (disabled) return;

    if (isDisliked) {
      // Remove dislike
      setDislikes(dislikes - 1);
      setIsDisliked(false);
    } else {
      // Dislike (and remove like if exists)
      if (isLiked) {
        setLikes(likes - 1);
        setIsLiked(false);
      }
      setDislikes(dislikes + 1);
      setIsDisliked(true);
    }
    onDislike?.();
  };

  const sizeClasses = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-11 w-11",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-1">
        <Button
          variant={isLiked ? "default" : "outline"}
          size="sm"
          className={cn(
            sizeClasses[size],
            "p-0",
            isLiked
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "text-green-600 hover:text-green-700 hover:bg-green-50",
          )}
          onClick={handleLike}
          disabled={disabled}
        >
          <ThumbsUp className={iconSizes[size]} />
        </Button>
        <span
          className={cn(
            "text-sm font-medium min-w-[20px] text-center",
            isLiked ? "text-green-600" : "text-muted-foreground",
          )}
        >
          {likes}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant={isDisliked ? "destructive" : "outline"}
          size="sm"
          className={cn(
            sizeClasses[size],
            "p-0",
            isDisliked
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "text-red-600 hover:text-red-700 hover:bg-red-50",
          )}
          onClick={handleDislike}
          disabled={disabled}
        >
          <ThumbsDown className={iconSizes[size]} />
        </Button>
        <span
          className={cn(
            "text-sm font-medium min-w-[20px] text-center",
            isDisliked ? "text-red-600" : "text-muted-foreground",
          )}
        >
          {dislikes}
        </span>
      </div>
    </div>
  );
}
