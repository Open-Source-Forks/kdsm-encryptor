import { motion } from "framer-motion";

/**
 * Robot Hangman Visual Component
 * Displays robot parts based on failed attempts
 */
export default function RobotHangman({ visibleParts = [] }) {
  const partAnimation = {
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1 },
    transition: { type: "spring", stiffness: 200, damping: 15 },
  };

  return (
    <div className="relative w-[200px] h-[400px] mx-auto">
      <svg
        width="200"
        height="400"
        viewBox="0 0 200 400"
        className="absolute inset-0"
      >
        {/* Antenna */}
        {visibleParts.includes("antenna") && (
          <motion.g {...partAnimation}>
            <image
              href="/assets/hangman/antenna.svg"
              width="200"
              height="200"
              x="0"
              y="0"
            />
          </motion.g>
        )}

        {/* Head */}
        {visibleParts.includes("head") && (
          <motion.g {...partAnimation}>
            <image
              href="/assets/hangman/head.svg"
              width="200"
              height="200"
              x="0"
              y="0"
            />
          </motion.g>
        )}

        {/* Left Eye */}
        {visibleParts.includes("left-eye") && (
          <motion.g {...partAnimation}>
            <image
              href="/assets/hangman/left-eye.svg"
              width="200"
              height="200"
              x="0"
              y="0"
            />
          </motion.g>
        )}

        {/* Right Eye */}
        {visibleParts.includes("right-eye") && (
          <motion.g {...partAnimation}>
            <image
              href="/assets/hangman/right-eye.svg"
              width="200"
              height="200"
              x="0"
              y="0"
            />
          </motion.g>
        )}

        {/* Torso */}
        {visibleParts.includes("torso") && (
          <motion.g {...partAnimation}>
            <image
              href="/assets/hangman/torso.svg"
              width="200"
              height="200"
              x="0"
              y="0"
            />
          </motion.g>
        )}

        {/* Battery Core */}
        {visibleParts.includes("battery") && (
          <motion.g {...partAnimation}>
            <image
              href="/assets/hangman/battery.svg"
              width="200"
              height="200"
              x="0"
              y="0"
            />
          </motion.g>
        )}

        {/* Left Arm */}
        {visibleParts.includes("left-arm") && (
          <motion.g {...partAnimation}>
            <image
              href="/assets/hangman/left-arm.svg"
              width="180"
              height="340"
              x="0"
              y="0"
            />
          </motion.g>
        )}

        {/* Right Arm */}
        {visibleParts.includes("right-arm") && (
          <motion.g {...partAnimation}>
            <image
              href="/assets/hangman/right-arm.svg"
              width="200"
              height="340"
              x="0"
              y="0"
            />
          </motion.g>
        )}

        {/* Left Leg */}
        {visibleParts.includes("left-leg") && (
          <motion.g {...partAnimation}>
            <image
              href="/assets/hangman/left-leg.svg"
              width="200"
              height="360"
              x="0"
              y="0"
            />
          </motion.g>
        )}

        {/* Right Leg */}
        {visibleParts.includes("right-leg") && (
          <motion.g {...partAnimation}>
            <image
              href="/assets/hangman/right-leg.svg"
              width="200"
              height="360"
              x="0"
              y="0"
            />
          </motion.g>
        )}
      </svg>
    </div>
  );
}
