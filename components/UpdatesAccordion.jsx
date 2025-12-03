import { Info } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export default function UpdatesAccordion() {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem
        value="faq"
        className="mx-4 px-3 bg-primary/20 py-2 rounded-md border border-black/30 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
      >
        <AccordionTrigger className="flex items-center justify-center hover:no-underline">
          <div className="flex items-center gap-5 cursor-pointer">
            <Info className="w-6 h-6 text-blue-500 drop-shadow-[0_0_12px_rgba(59,130,246,0.9)] animate-pulse" />
            <span className="text-lg sm:text-md font-medium no-underline drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
              Latest Updates!
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="bg-secondary/30 p-4 rounded-2xl font-tomorrow">
            <ul className="list-disc list-inside space-y-2 text-md sm:text-sm">
              <li>
                Shareable Encrypted Messages - Easily share encrypted messages
                with auto-expiring links for enhanced security and privacy.
              </li>
              <li>
                CryptoPass Delivery (Coming Soon!) - Granularly control your new
                auto-generated generated password for your applications while
                receiving it securely via encrypted email (Only you can crack it
                via your private key).
              </li>
            </ul>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
