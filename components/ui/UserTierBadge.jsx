import { Crown, Shield, Zap } from "lucide-react";
import { Badge } from "./badge";

export default function UserTierBadge({ tier }) {
  const getTierIcon = (tier) => {
    switch (tier) {
      case "admin":
        return <Shield className="w-4 h-4 text-red-500" />;
      case "premium":
        return <Crown className="w-4 h-4 text-yellow-500" />;
      default:
        return <Zap className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "premium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };
  return (
    <Badge
      className={`${getTierColor(
        tier
      )} flex items-center gap-1 capitalize font-tomorrow`}
    >
      {getTierIcon(tier)}
      <span className="hidden sm:block">{tier}</span>
    </Badge>
  );
}
