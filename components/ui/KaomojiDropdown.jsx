import { KAOMOJIS } from "@/utils/constants";
import { Sticker } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./button";
export default function KaomojiDropdown({
  Icon = Sticker,
  onSelectKaomoji = () => {},
  text = null,
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
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
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[450px] sm:w-[600px] md:w-[700px] lg:w-[800px] max-h-96 overflow-y-auto">
        <div className="p-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-1">
            {KAOMOJIS.map((kaomoji, index) => (
              <button
                key={index}
                onClick={() => onSelectKaomoji(kaomoji)}
                className="p-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-center min-h-[2rem] flex items-center justify-center text-nowrap"
                title={kaomoji}
              >
                {kaomoji}
              </button>
            ))}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
