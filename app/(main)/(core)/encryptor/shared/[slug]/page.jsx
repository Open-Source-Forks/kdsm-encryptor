"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { decrypt } from "@/utils/kdsm";
import VariableProximity from "@/components/ui/VariableProximity";
import ShinyText from "@/components/ui/ShinyText";
import DecryptedText from "@/components/ui/DecryptedText";
import Image from "next/image";
import {
  Check,
  Copy,
  ExternalLink,
  Shield,
  Loader2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import { getSharedMessage } from "@/lib/shareEncryptedMsgs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import RobotHangman from "@/components/RobotHangman";
import {
  getVisibleRobotParts,
  isGameLost,
  generateHintDisplay,
  getInitialHint,
  getTimeBasedHints,
  getCharacterTypeHints,
} from "@/lib/robotLogic";

const COPY_TIMEOUT = 2000;
// TODO: remaining Starter hint, Character type hints 
export default function Page() {
  const { slug } = useParams();
  const router = useRouter();

  // State management
  const [encryptedMessage, setEncryptedMessage] = useState("");
  const [userEnteredKey, setUserEnteredKey] = useState(""); // User's input
  const [decryptedResult, setDecryptedResult] = useState("");
  const [expiresAt, setExpiresAt] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [copyState, setCopyState] = useState(false);
  const [error, setError] = useState(null);

  // Hangman game state (consolidated)
  const [gameConfig, setGameConfig] = useState({
    hangmanEnabled: false,
    tries: -1,
    actualKey: "",
    expireSeconds: 0,
  });

  const [gameState, setGameState] = useState({
    failedAttempts: 0,
    revealedChars: [],
    gameWon: false,
    gameLost: false,
    characterTypeHints: [],
  });

  // Refs for DOM elements
  const containerRef = useRef(null);
  const timerRef = useRef(null);

  // LocalStorage key for game state
  const getStorageKey = useCallback(() => `hangman_game_${slug}`, [slug]);

  // Load game state from localStorage
  useEffect(() => {
    if (!slug) return;
    
    const savedState = localStorage.getItem(getStorageKey());
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setGameState(parsed.gameState);
        setDecryptedResult(parsed.decryptedResult || "");
      } catch (error) {
        console.error("Failed to parse saved game state:", error);
      }
    }
  }, [slug, getStorageKey]);

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    if (!slug || !gameConfig.hangmanEnabled) return;
    
    const stateToSave = {
      gameState,
      decryptedResult,
      timestamp: Date.now(),
    };
    
    localStorage.setItem(getStorageKey(), JSON.stringify(stateToSave));
  }, [gameState, decryptedResult, slug, gameConfig.hangmanEnabled, getStorageKey]);

  // Clear game state from localStorage when game ends
  const clearGameState = useCallback(() => {
    localStorage.removeItem(getStorageKey());
  }, [getStorageKey]);

  // Fetch shared message on component mount
  useEffect(() => {
    async function fetchMessage() {
      if (!slug) {
        setError("Invalid share link");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const result = await getSharedMessage(slug);

        setEncryptedMessage(result.encMessage);
        setExpiresAt(result.expiresAt);
        
        // Set game configuration from API
        setGameConfig({
          hangmanEnabled: result.hangman || false,
          tries: result.tries || -1,
          actualKey: result.actualKey,
          expireSeconds: result.expireSeconds || 300,
        });

        // Initialize hangman hints if enabled
        if (result.hangman) {
          const initialHints = getInitialHint(result.actualKey);
          setGameState(prev => ({
            ...prev,
            revealedChars: initialHints,
          }));

          toast.success("Hangman Mode Active!", {
            description: "Guess the encryption key to decrypt the message",
          });
        } else {
          toast.success("Message Loaded", {
            description: "Enter the encryption key to decrypt this message",
          });
        }
      } catch (error) {
        console.error("Failed to fetch shared message:", error);
        setError(error.message || "Failed to load the shared message");

        toast.error("Load Failed", {
          description: error.message || "Could not load the shared message",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchMessage();
  }, [slug]);

  // Real-time countdown timer
  useEffect(() => {
    if (!expiresAt) return;

    const updateCountdown = () => {
      const now = new Date();
      const expiry = new Date(expiresAt);
      const diff = expiry - now;

      if (diff <= 0) {
        // Message has expired
        clearInterval(timerRef.current);
        setTimeRemaining("Expired");

        // Show error UI (server-side cron will handle deletion)
        setError("Message has expired");
        toast.error("Message Expired", {
          description: "This message has expired and is no longer available",
        });
        return;
      }

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${seconds}s`);
      }

      // Update hangman hints based on time 
      if (gameConfig.hangmanEnabled && gameConfig.actualKey && gameConfig.expireSeconds > 0) {
        const totalTime = gameConfig.expireSeconds * 1000;
        const elapsed = totalTime - diff;
        const timePercentage = (elapsed / totalTime) * 100;

        // Update character reveals
        const updatedReveals = getTimeBasedHints(
          gameConfig.actualKey,
          timePercentage,
          gameState.revealedChars
        );
        if (updatedReveals.length !== gameState.revealedChars.length) {
          setGameState(prev => ({
            ...prev,
            revealedChars: updatedReveals,
          }));
        }

        // Update character type hints
        const typeHints = getCharacterTypeHints(gameConfig.actualKey, timePercentage);
        if (JSON.stringify(typeHints) !== JSON.stringify(gameState.characterTypeHints)) {
          setGameState(prev => ({
            ...prev,
            characterTypeHints: typeHints,
          }));
        }
      }
    };

    // Initial update
    updateCountdown();

    // Update every second
    timerRef.current = setInterval(updateCountdown, 1000);

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [expiresAt, gameConfig, gameState.revealedChars, gameState.characterTypeHints]);

  // Handle user key input change
  const handleKeyChange = useCallback((e) => {
    setUserEnteredKey(e.target.value);
  }, []);

  // Handle manual decryption with user-entered key
  const handleDecrypt = useCallback(async () => {
    if (!userEnteredKey.trim()) {
      toast.error("Missing Key", {
        description: "Please enter the encryption key to decrypt the message",
      });
      return;
    }

    setIsDecrypting(true);

    try {
      // Hangman mode: check if guess is correct
      if (gameConfig.hangmanEnabled) {
        if (userEnteredKey === gameConfig.actualKey) {
          // Correct guess - Win!
          setGameState(prev => ({ ...prev, gameWon: true }));
          const decryptedMessage = decrypt(encryptedMessage, userEnteredKey);
          setDecryptedResult(decryptedMessage);

          // Clear game state from localStorage on win
          clearGameState();

          toast.success("🎉 You Won!", {
            description: "Correct key! Message decrypted successfully!",
          });
        } else {
          // Wrong guess
          const newFailedAttempts = gameState.failedAttempts + 1;
          setGameState(prev => ({
            ...prev,
            failedAttempts: newFailedAttempts,
          }));

          // Check if game is lost (only for limited tries)
          if (gameConfig.tries !== -1 && isGameLost(gameConfig.tries, newFailedAttempts)) {
            setGameState(prev => ({ ...prev, gameLost: true }));
            
            // Clear game state from localStorage on loss
            clearGameState();
            
            toast.error("Game Over", {
              description: "Robot fully assembled. Message locked forever.",
            });
          } else {
            toast.error("Wrong Key", {
              description:
                gameConfig.tries === -1
                  ? "Try again! Use the hints."
                  : `Wrong! ${gameConfig.tries - newFailedAttempts} tries remaining.`,
            });
          }

          setUserEnteredKey(""); // Clear input
        }
      } else {
        // Normal mode (no hangman)
        const decryptedMessage = decrypt(encryptedMessage, userEnteredKey);
        setDecryptedResult(decryptedMessage);

        toast.success("Message Decrypted", {
          description: "The message has been decrypted successfully!",
        });
      }
    } catch (error) {
      console.error("Decryption error:", error);

      if (gameConfig.hangmanEnabled) {
        const newFailedAttempts = gameState.failedAttempts + 1;
        setGameState(prev => ({
          ...prev,
          failedAttempts: newFailedAttempts,
        }));

        if (gameConfig.tries !== -1 && isGameLost(gameConfig.tries, newFailedAttempts)) {
          setGameState(prev => ({ ...prev, gameLost: true }));
          
          // Clear game state from localStorage on loss
          clearGameState();
          
          toast.error("Game Over", {
            description: "Robot fully assembled. Message locked forever.",
          });
        } else {
          toast.error("Wrong Key", {
            description:
              gameConfig.tries === -1
                ? "Incorrect! Try again."
                : `Wrong! ${gameConfig.tries - newFailedAttempts} tries remaining.`,
          });
        }

        setUserEnteredKey("");
      } else {
        toast.error("Decryption Failed", {
          description: "The encryption key you entered is incorrect",
        });
      }
    } finally {
      setIsDecrypting(false);
    }
  }, [
    encryptedMessage,
    userEnteredKey,
    gameConfig.hangmanEnabled,
    gameConfig.actualKey,
    gameConfig.tries,
    gameState.failedAttempts,
    clearGameState,
  ]);

  // Copy decrypted message to clipboard
  const copyToClipboard = useCallback((text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopyState(true);
        setTimeout(() => {
          setCopyState(false);
        }, COPY_TIMEOUT);
        toast.success("Copied", {
          description: "Message copied to clipboard",
        });
      })
      .catch(() => {
        toast.error("Copy Failed", {
          description: "Could not copy to clipboard",
        });
      });
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-3xl relative z-20">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-md"
        >
          <Card className="w-full text-primary bg-primary/10">
            <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p className="text-lg text-muted-foreground">
                Loading encrypted message...
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-3xl relative z-20">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-md"
        >
          <Card className="w-full text-primary bg-primary/10">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold">Message Not Found</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <div className="text-center text-sm text-muted-foreground space-y-2">
                <p>This shared message may have:</p>
                <ul className="list-disc list-inside">
                  <li>Expired</li>
                  <li>Been deleted</li>
                  <li>Invalid share link</li>
                </ul>
              </div>
              <Button
                onClick={() => router.push("/encryptor")}
                className="w-full"
              >
                Go to Encryptor
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-3xl relative z-20">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 10,
          delay: 0.2,
        }}
        className="backdrop-blur-md"
      >
        <Card className="w-full text-primary bg-primary/10 gap-0">
          <CardHeader className="flex flex-col sm:flex-row-reverse items-center gap-3 sm:gap-4">
            <Image
              src="/icons/1.png"
              width={86}
              height={86}
              className="me-2 object-cover w-16 h-16 sm:w-20 sm:h-20 md:w-[86px] md:h-[86px]"
              alt="KDSM Logo"
            />
            <div
              ref={containerRef}
              className="flex-1 flex flex-col text-center sm:text-left space-y-2 sm:space-y-4"
            >
              <VariableProximity
                label={"Shared Encrypted Message"}
                className="text-lg sm:text-xl md:text-2xl"
                containerRef={containerRef}
                radius={50}
                falloff="linear"
              />
              <CardDescription>
                <VariableProximity
                  label={"Someone shared a secure message with you"}
                  className="text-sm sm:text-base"
                  containerRef={containerRef}
                  radius={50}
                  falloff="linear"
                />
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            {/* Expiry Timer Alert */}
            {expiresAt && timeRemaining && (
              <Alert className="bg-orange-500/10 border-orange-500/20">
                <Clock className="h-4 w-4 text-orange-500" />
                <AlertTitle className="text-orange-500">
                  Time Limited Message
                </AlertTitle>
                <AlertDescription className="text-orange-500/80">
                  This message expires in: <strong>{timeRemaining}</strong>
                </AlertDescription>
              </Alert>
            )}

            {/* Hangman Game Display */}
            {gameConfig.hangmanEnabled && !gameState.gameWon && !gameState.gameLost && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Robot Visual (only if tries !== -1) */}
                {gameConfig.tries !== -1 && (
                  <div className="flex flex-col items-center space-y-3 p-4 border rounded-md bg-muted/30">
                    <div className="text-sm font-medium text-center">
                      Robot Assembly Progress
                    </div>
                    <RobotHangman
                      visibleParts={getVisibleRobotParts(gameConfig.tries, gameState.failedAttempts)}
                    />
                    <div className="text-sm text-muted-foreground">
                      {gameConfig.tries - gameState.failedAttempts} tries remaining
                    </div>
                  </div>
                )}

                {/* Key Hint Display */}
                <div className="space-y-3 p-4 border rounded-md bg-primary/5">
                  <Label className="text-sm font-medium">Key Hint</Label>
                  <div className="text-2xl font-mono tracking-widest text-center p-4 bg-background rounded border">
                    {generateHintDisplay(gameConfig.actualKey, gameState.revealedChars)}
                  </div>
                  <div className="text-xs text-muted-foreground text-center">
                    {gameConfig.actualKey.length} characters total
                  </div>
                </div>

                {/* Character Type Hints */}
                {gameState.characterTypeHints.length > 0 && (
                  <Alert className="bg-blue-500/10 border-blue-500/20">
                    <AlertCircle className="h-4 w-4 text-blue-500" />
                    <AlertTitle className="text-blue-500">
                      Character Type Hints
                    </AlertTitle>
                    <AlertDescription className="text-blue-500/80">
                      <ul className="list-disc list-inside space-y-1 mt-2">
                        {gameState.characterTypeHints.map((hint, index) => (
                          <li key={index}>{hint}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </motion.div>
            )}

            {/* Game Lost State */}
            {gameState.gameLost && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Game Over!</AlertTitle>
                <AlertDescription>
                  The robot is fully assembled. The message remains locked
                  forever.
                </AlertDescription>
              </Alert>
            )}

            {/* Encrypted Message Display */}
            <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 border rounded-md bg-muted/30">
              <Label className="text-sm sm:text-base">Encrypted Message</Label>
              <div className="p-2 sm:p-3 bg-background rounded border break-all font-tomorrow text-xs sm:text-sm max-h-[200px] overflow-y-auto">
                {encryptedMessage}
              </div>
            </div>

            {/* Key Input Section - Always visible unless game is lost */}
            {!gameState.gameLost && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label
                    htmlFor="decryption-key"
                    className="text-sm sm:text-base"
                  >
                    {gameConfig.hangmanEnabled
                      ? "Guess the Encryption Key"
                      : "Enter Encryption Key"}
                  </Label>
                  <Input
                    id="decryption-key"
                    type="text"
                    placeholder={
                      gameConfig.hangmanEnabled
                        ? "Type your guess..."
                        : "Enter the key to decrypt the message..."
                    }
                    value={userEnteredKey}
                    onChange={handleKeyChange}
                    className={`w-full text-sm sm:text-base`}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    disabled={isDecrypting || gameState.gameWon}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isDecrypting && !gameState.gameWon) {
                        handleDecrypt();
                      }
                    }}
                    secured={true}
                  />
                </div>

                <Button
                  onClick={handleDecrypt}
                  disabled={isDecrypting || !userEnteredKey.trim() || gameState.gameWon}
                  className="w-full"
                >
                  {isDecrypting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {gameConfig.hangmanEnabled ? "Checking..." : "Decrypting..."}
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      {gameConfig.hangmanEnabled ? "Submit Guess" : "Decrypt Message"}
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {/* Decrypted Result */}
            {decryptedResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 sm:space-y-4 p-3 sm:p-4 border-2 border-primary-500/20 rounded-md bg-primary-500/5"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <Label className="text-sm sm:text-base flex items-center gap-2">
                    Decrypted Message
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(decryptedResult)}
                  >
                    {copyState ? (
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    )}
                  </Button>
                </div>
                <div className="p-2 sm:p-3 bg-background rounded border break-all font-tomorrow text-xs sm:text-sm">
                  <DecryptedText
                    text={decryptedResult}
                    animateOn="view"
                    revealDirection="start"
                    speed={200}
                    useOriginalCharsOnly={true}
                  />
                </div>
                {decryptedResult.includes("https://") && (
                  <div className="flex flex-row-reverse">
                    <Button
                      size="sm"
                      onClick={() => window.open(decryptedResult, "_blank")}
                      title="Open link in new tab"
                      className="text-xs sm:text-sm"
                    >
                      Open Link
                      <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 ml-2" />
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Try KDSM CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="pt-4"
            >
              <Button
                onClick={() => router.push("/encryptor")}
                className="w-full"
                variant="outline"
              >
                Try KDSM Encryptor Yourself
              </Button>
            </motion.div>
          </CardContent>
          <CardFooter className="flex-col">
            <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm text-muted-foreground w-full gap-2 sm:gap-0 mt-4">
              <ShinyText
                text="KDSM Encryptor by - Idris Vohra"
                disabled={false}
                speed={3}
                className="text-center"
                link
              />
              <ShinyText
                text="OP • Super Fast • One of a kind"
                disabled={false}
                speed={3}
                className="text-center"
              />
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
