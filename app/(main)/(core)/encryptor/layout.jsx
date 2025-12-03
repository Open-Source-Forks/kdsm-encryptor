export const metadata = {
  title: "Message Encryptor - KDSM Encryptor",
  description:
    "Encrypt and decrypt your messages securely using the KDSM encryption algorithm. Share encrypted messages with auto-expiring links.",
  keywords: [
    "KDSM",
    "encryption",
    "decryption",
    "message encryption",
    "secure messaging",
    "cryptography",
    "end-to-end encryption",
    "shareable links",
    "privacy",
    "security",
  ],
  openGraph: {
    title: "Message Encryptor - KDSM Encryptor",
    description:
      "Encrypt and decrypt your messages securely using the KDSM encryption algorithm. Share encrypted messages with auto-expiring links.",
    url: "https://kdsm.tech/encryptor",
    siteName: "KDSM Encryptor",
    images: [
      {
        url: "https://kdsm.tech/icons/1.png",
        width: 1200,
        height: 630,
        alt: "KDSM Message Encryptor",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function EncryptorLayout({ children }) {
  return children;
}
