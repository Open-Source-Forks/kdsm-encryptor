"use client";

import { KAOMOJIS } from "@/utils/constants";
import { Sticker } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "./button";
import { useState } from "react";

export default function KaomojiDrawer({
  Icon = Sticker,
  onSelectKaomoji = () => {},
  text = null,
}) {
  const [open, setOpen] = useState(false);

  const handleSelect = (kaomoji) => {
    onSelectKaomoji(kaomoji);
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size={text ? "default" : "icon"}
          className="p-2"
        >
          {text ? (
            <span className="text-primary">{text}</span>
          ) : (
            <Icon className="h-6 w-6" />
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Select Kaomoji</DrawerTitle>
          <DrawerDescription>
            Choose a kaomoji to add to your message
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {KAOMOJIS.map((kaomoji, index) => (
              <button
                key={index}
                onClick={() => handleSelect(kaomoji)}
                className="p-3 text-sm hover:bg-accent hover:text-accent-foreground rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-center min-h-[3rem] flex items-center justify-center border border-border"
                title={kaomoji}
              >
                {kaomoji}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4 border-t">
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Close
            </Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
