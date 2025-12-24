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
      {/* SEO-optimized screen reader content */}
      <h1 className="sr-only">
        KDSM Encryptor - Military-Grade Message Encryption and Secure Password Generator
      </h1>
      <div className="sr-only">
        <h2>What is KDSM Encryptor?</h2>
        <p>
          KDSM Encryptor is a free, open-source encryption platform that provides military-grade security 
          for your messages and communications. Our KDSM encryption algorithm ensures your data remains 
          private and secure with end-to-end encryption.
        </p>
        
        <h2>Key Features of KDSM Encryptor</h2>
        <ul>
          <li>Military-grade KDSM encryption algorithm for maximum security</li>
          <li>Secure password generator with cryptographic strength</li>
          <li>Shareable encrypted message links with auto-expiration</li>
          <li>Real-time end-to-end encrypted chat rooms</li>
          <li>Zero-knowledge architecture - your data never stored in plain text</li>
          <li>Open-source and transparent codebase for community trust</li>
          <li>Free to use with premium options for extended features</li>
        </ul>
        
        <h2>How to Encrypt Messages with KDSM</h2>
        <p>
          Encrypt your messages in three simple steps: Enter your message, generate or provide an encryption key, 
          and click encrypt. Share the encrypted message and key separately for maximum security. Recipients can 
          decrypt the message using the same key on our platform.
        </p>
        
        <h2>Secure Password Generation</h2>
        <p>
          Generate strong, cryptographically secure passwords with customizable options including uppercase letters, 
          lowercase letters, numbers, and special characters. Adjust password length from 8 to 128 characters for 
          maximum security.
        </p>
        
        <h2>Privacy and Security Commitment</h2>
        <p>
          At KDSM Encryptor, we prioritize your privacy. We implement zero-knowledge encryption, meaning we cannot 
          access your encrypted messages or keys. All encryption happens client-side in your browser before any 
          data transmission.
        </p>
        
        <h2>Open Source Encryption Software</h2>
        <p>
          KDSM Encryptor is fully open source on GitHub, allowing developers and security researchers to audit 
          our code. We believe in transparency and community-driven development for trustworthy encryption software.
        </p>
      </div>
      
      <BubbleMenu logo="/icons/encryptor.webp" useFixedPosition={true} />
      <section className="relative w-full h-screen overflow-hidden" id="home" aria-label="Hero section">
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-primary/2 pointer-events-none">
          <Image
            src="/icons/docs.webp"
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
      
      <section className="w-full flex justify-center items-center overflow-hidden relative pt-20" id="about" aria-label="Features section">
        <h2 className="sr-only">KDSM Encryptor Features and Capabilities</h2>
        {/* Centered Gold Gradient Blur */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] rounded-full bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 opacity-40 blur-[100px] pointer-events-none z-0" />
        
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
