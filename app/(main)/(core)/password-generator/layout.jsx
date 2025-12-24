export const metadata = {
  title: "Password Generator - KDSM Encryptor",
  description:
    "Generate strong, cryptographically secure passwords with customizable options. Create passwords with uppercase, lowercase, numbers, and special characters.",
  keywords: [
    "KDSM",
    "password generator",
    "secure passwords",
    "strong passwords",
    "random password",
    "cryptography",
    "password security",
    "security tools",
    "password strength",
  ],
  openGraph: {
    title: "Password Generator - KDSM Encryptor",
    description:
      "Generate strong, cryptographically secure passwords with customizable options. Create passwords with uppercase, lowercase, numbers, and special characters.",
    url: "https://kdsm.tech/password-generator",
    siteName: "KDSM Encryptor",
    images: [
      {
        url: "https://kdsm.tech/icons/encryptor.webp",
        width: 1200,
        height: 630,
        alt: "KDSM Password Generator",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function PasswordGeneratorLayout({ children }) {
  return children;
}
