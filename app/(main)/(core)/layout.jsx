import LetterGlitch from "@/components/ui/LetterGlitch";

export const metadata = {
  title: "Encryption Tools - KDSM Encryptor",
  description:
    "Access powerful encryption tools including message encryption/decryption and secure password generation with KDSM Encryptor",
  keywords: [
    "KDSM",
    "encryption",
    "decryption",
    "password generator",
    "security",
    "message encryption",
    "cryptography",
    "secure passwords",
    "encryption tools",
    "javascript",
    "react",
    "nextjs",
    "messaging",
    "privacy",
  ],
  openGraph: {
    title: "Encryption Tools - KDSM Encryptor",
    description:
      "Secure your messages and generate strong passwords with KDSM Encryptor's powerful encryption tools",
    url: "https://kdsm.tech/encryptor",
    siteName: "KDSM Encryptor",
    images: [
      {
        url: "https://kdsm.tech/icons/encryptor.webp",
        width: 1200,
        height: 630,
        alt: "KDSM Encryptor Tools",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};
export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen h-full flex-col items-center justify-between p-4 md:p-24">
      <LetterGlitch />
      {children}
    </div>
  );
}
