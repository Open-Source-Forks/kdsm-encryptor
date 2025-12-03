import BubbleMenu from "@/components/ui/BubbleMenu";
import { Button } from "@/components/ui/button";
import HyperSpeed from "@/components/ui/HyperSpeed";
import MagicBento from "@/components/ui/MagicBento";
import RotatingText from "@/components/ui/RotatingText";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function page() {
  return (
    <div className="bg-black min-h-screen flex flex-col items-center justify-center text-white text-4xl font-bold w-full h-full overflow-x-hidden">
      <BubbleMenu logo="/icons/1.png" useFixedPosition={true} />
      <section className="relative w-full h-screen overflow-hidden" id="home">
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-primary/2 pointer-events-none">
          <Image
            src="/icons/4.png"
            alt="KDSM Encryptor"
            width={240}
            height={240}
            className="object-contain pointer-events-none"
          />
          <div className="flex items-center justify-center text-2xl sm:text-3xl md:text-4xl font-extrabold gap-4 font-tomorrow">
            <span>Super</span>
            <RotatingText
              texts={["Secure", "Fast", "Reliable", "Cool!"]}
              mainClassName="px-2 sm:px-2 md:px-3 bg-secondary py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
              staggerFrom={"first"}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
              transition={{ type: "ease", damping: 30, stiffness: 400 }}
              rotationInterval={2000}
            />
          </div>
          <div className="mt-6 flex flex-row justify-center items-center flex-wrap pointer-events-auto">
            <Button size="lg" className="m-2" asChild={true}>
              <Link href="/encryptor">Encrypt Message</Link>
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="m-2"
              asChild={true}
            >
              <Link href="/auth/login">Get Started</Link>
            </Button>
          </div>
          <div className="mt-4 text-center text-sm md:text-base text-white/70 max-w-md px-4">
            Securely encrypt and decrypt your messages with KDSM Encryptor,
            ensuring your privacy and data protection with cutting-edge
            technology.
          </div>
        </div>
        <HyperSpeed />
      </section>
      <section className="w-full h-screen flex justify-center items-center overflow-hidden" id="about">
        <MagicBento
          textAutoHide={true}
          enableStars={false}
          enableSpotlight={true}
          enableBorderGlow={true}
          enableTilt={false}
          enableMagnetism={false}
          clickEffect={false}
          spotlightRadius={300}
          particleCount={0}
          glowColor="220, 38, 38"
        />
      </section>
    </div>
  );
}
