"use client";

import MetroTiles, { MetroTile } from "@/components/ui/MetroTiles";
import { 
  Mail, 
  Calendar, 
  Image, 
  Music, 
  Video, 
  FileText,
  Settings,
  User,
  Cloud,
  MessageSquare,
  Camera,
  Heart
} from "lucide-react";

/**
 * Example usage of MetroTiles component
 * Demonstrates Windows 8.1-style tile UI with various configurations
 */

// Metallic color palette
const METAL_COLORS = {
  silver: "bg-gradient-to-br from-gray-500 via-gray-400 to-gray-600",
  copper: "bg-gradient-to-br from-orange-700 via-amber-600 to-orange-800",
  gold: "bg-gradient-to-br from-yellow-600 via-yellow-500 to-amber-700",
  bronze: "bg-gradient-to-br from-amber-700 via-orange-800 to-amber-900",
  iron: "bg-gradient-to-br from-slate-600 via-slate-500 to-slate-700",
  platinum: "bg-gradient-to-br from-zinc-500 via-stone-400 to-zinc-600",
  tungsten: "bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900",
  roseGold: "bg-gradient-to-br from-pink-400 via-orange-300 to-amber-400",
  aluminum: "bg-gradient-to-br from-slate-400 via-gray-400 to-slate-500",
  brass: "bg-gradient-to-br from-yellow-700 via-amber-600 to-yellow-800",
  gunmetal: "bg-gradient-to-br from-zinc-600 via-slate-600 to-zinc-700",
  pewter: "bg-gradient-to-br from-stone-500 via-gray-500 to-stone-600",
  titanium: "bg-gradient-to-br from-slate-500 via-zinc-400 to-slate-600",
};

export default function MetroTilesDemo() {
  const tileData = [
    {
      id: "mail",
      icon: Mail,
      title: "Mail",
      subtitle: "5 new messages",
      color: METAL_COLORS.silver,
      size: "medium",
      backContent: (
        <div className="space-y-1">
          <p className="font-bold">Inbox</p>
          <p className="text-sm">5 unread emails</p>
        </div>
      ),
      onClick: () => console.log("Mail clicked"),
    },
    {
      id: "calendar",
      icon: Calendar,
      title: "Calendar",
      subtitle: "3 events today",
      color: METAL_COLORS.copper,
      size: "medium",
      backContent: (
        <div className="space-y-1">
          <p className="font-bold">Today</p>
          <p className="text-sm">Team Meeting 2PM</p>
        </div>
      ),
      onClick: () => console.log("Calendar clicked"),
    },
    {
      id: "photos",
      icon: Image,
      title: "Photos",
      subtitle: "1,234 items",
      color: METAL_COLORS.gold,
      size: "large",
      backContent: (
        <div className="space-y-1">
          <p className="font-bold">Gallery</p>
          <p className="text-sm">Recent: 24 photos</p>
        </div>
      ),
      onClick: () => console.log("Photos clicked"),
    },
    {
      id: "music",
      icon: Music,
      title: "Music",
      subtitle: "Now Playing",
      color: METAL_COLORS.bronze,
      size: "medium",
      backContent: (
        <div className="space-y-1">
          <p className="font-bold text-sm">♫ Currently Playing</p>
          <p className="text-xs">Artist - Song Title</p>
        </div>
      ),
      onClick: () => console.log("Music clicked"),
    },
    {
      id: "video",
      icon: Video,
      title: "Video",
      subtitle: "Watch later",
      color: METAL_COLORS.iron,
      size: "medium",
      backContent: (
        <div className="space-y-1">
          <p className="font-bold">Library</p>
          <p className="text-sm">12 videos</p>
        </div>
      ),
      onClick: () => console.log("Video clicked"),
    },
    {
      id: "documents",
      icon: FileText,
      title: "Documents",
      subtitle: "Recent files",
      color: METAL_COLORS.platinum,
      size: "tall",
      backContent: (
        <div className="space-y-2">
          <p className="font-bold">Recent</p>
          <div className="text-xs space-y-1">
            <p>• Report.pdf</p>
            <p>• Notes.txt</p>
            <p>• Presentation.pptx</p>
          </div>
        </div>
      ),
      onClick: () => console.log("Documents clicked"),
    },
    {
      id: "settings",
      icon: Settings,
      title: "Settings",
      subtitle: "Customize",
      color: METAL_COLORS.tungsten,
      size: "medium",
      backContent: (
        <div className="space-y-1">
          <p className="font-bold">System</p>
          <p className="text-sm">Preferences</p>
        </div>
      ),
      onClick: () => console.log("Settings clicked"),
    },
    {
      id: "profile",
      icon: User,
      title: "Profile",
      color: METAL_COLORS.roseGold,
      size: "xs",
      iconOnly: true,
      onClick: () => console.log("Profile clicked"),
    },
    {
      id: "cloud",
      icon: Cloud,
      title: "Cloud",
      color: METAL_COLORS.aluminum,
      size: "xs",
      iconOnly: true,
      onClick: () => console.log("Cloud clicked"),
    },
    {
      id: "messages",
      icon: MessageSquare,
      title: "Messages",
      subtitle: "2 unread",
      color: METAL_COLORS.brass,
      size: "medium",
      backContent: (
        <div className="space-y-1">
          <p className="font-bold">Inbox</p>
          <p className="text-sm">2 new messages</p>
        </div>
      ),
      onClick: () => console.log("Messages clicked"),
    },
    {
      id: "camera",
      icon: Camera,
      title: "Camera",
      color: METAL_COLORS.gunmetal,
      size: "xs",
      iconOnly: true,
      onClick: () => console.log("Camera clicked"),
    },
    {
      id: "favorites",
      icon: Heart,
      title: "Favorites",
      color: METAL_COLORS.pewter,
      size: "xs",
      iconOnly: true,
      onClick: () => console.log("Favorites clicked"),
    },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-tomorrow font-bold text-white mb-2">
            Metro Dashboard
          </h1>
          <p className="text-gray-400 font-tomorrow">
            Windows 8.1-style tile interface
          </p>
        </div>

        {/* Metro Tiles Grid */}
        <MetroTiles tiles={tileData} />

        {/* Individual Tile Example */}
        <div className="mt-12">
          <h2 className="text-2xl font-tomorrow font-bold text-white mb-4">
            Individual Tile Example
          </h2>
          <div className="max-w-sm">
            <MetroTile
              icon={Settings}
              title="Custom Tile"
              subtitle="Standalone example"
              color={METAL_COLORS.titanium}
              size="large"
              backContent={
                <div className="space-y-2">
                  <p className="font-bold text-lg">Custom Back</p>
                  <p className="text-sm">You can put anything here!</p>
                </div>
              }
              onClick={() => alert("Custom tile clicked!")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
