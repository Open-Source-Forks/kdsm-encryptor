/**
 * Robot Hangman Logic
 * Manages the hangman game mechanics with robot assembly
 */

// Master robot assembly order (max 10 parts)
export const ALL_ROBOT_PARTS = [
  "head",
  "torso",
  "left-arm",
  "right-arm",
  "left-leg",
  "right-leg",
  "left-eye",
  "right-eye",
  "antenna",
  "battery",
];

/**
 * Get active robot parts based on difficulty (tries)
 * @param {number} difficulty - Number of tries (6-10)
 * @returns {string[]} Array of active robot part names
 */
export function getActiveRobotParts(difficulty) {
  return ALL_ROBOT_PARTS.slice(0, difficulty);
}

/**
 * Get visible robot parts based on failed attempts
 * @param {number} difficulty - Number of tries (6-10)
 * @param {number} failedAttempts - Number of wrong guesses
 * @returns {string[]} Array of visible robot part names
 */
export function getVisibleRobotParts(difficulty, failedAttempts) {
  const activeParts = getActiveRobotParts(difficulty);
  return activeParts.slice(0, failedAttempts);
}

/**
 * Check if game is over (lost)
 * @param {number} difficulty - Number of tries
 * @param {number} failedAttempts - Number of wrong guesses
 * @returns {boolean} True if game is lost
 */
export function isGameLost(difficulty, failedAttempts) {
  return failedAttempts >= difficulty;
}

/**
 * Generate hint display with dashes and revealed characters
 * @param {string} actualKey - The secret key
 * @param {string[]} revealedChars - Array of revealed character objects {char, index}
 * @returns {string} Display string with dashes and revealed chars
 */
export function generateHintDisplay(actualKey, revealedChars = []) {
  const chars = actualKey.split("");
  return chars
    .map((char, index) => {
      const revealed = revealedChars.find((r) => r.index === index);
      return revealed ? char : "_";
    })
    .join(" ");
}

/**
 * Get initial hint (one random character if length >= 6)
 * @param {string} actualKey - The secret key
 * @returns {Array} Array with one revealed character object {char, index}
 */
export function getInitialHint(actualKey) {
  if (actualKey.length < 6) return [];
  
  const randomIndex = Math.floor(Math.random() * actualKey.length);
  return [{ char: actualKey[randomIndex], index: randomIndex }];
}

/**
 * Get time-based hint reveals based on time percentage
 * @param {string} actualKey - The secret key
 * @param {number} timePercentage - Percentage of time elapsed (0-100)
 * @param {Array} currentRevealed - Currently revealed characters
 * @returns {Array} Updated array of revealed characters
 */
export function getTimeBasedHints(actualKey, timePercentage, currentRevealed = []) {
  const keyLength = actualKey.length;
  const revealedIndices = new Set(currentRevealed.map((r) => r.index));
  
  // Calculate how many additional characters to reveal based on time
  let targetReveals = currentRevealed.length;
  
  if (timePercentage >= 90) {
    // Reveal all at 90%+
    targetReveals = keyLength;
  } else if (timePercentage >= 70) {
    targetReveals = Math.max(targetReveals, Math.ceil(keyLength * 0.7));
  } else if (timePercentage >= 50) {
    targetReveals = Math.max(targetReveals, Math.ceil(keyLength * 0.5));
  } else if (timePercentage >= 30) {
    targetReveals = Math.max(targetReveals, Math.ceil(keyLength * 0.3));
  } else if (timePercentage >= 10) {
    targetReveals = Math.max(targetReveals, Math.ceil(keyLength * 0.2));
  }
  
  // Reveal additional random characters
  const newRevealed = [...currentRevealed];
  while (newRevealed.length < targetReveals && newRevealed.length < keyLength) {
    const availableIndices = [];
    for (let i = 0; i < keyLength; i++) {
      if (!revealedIndices.has(i)) {
        availableIndices.push(i);
      }
    }
    
    if (availableIndices.length === 0) break;
    
    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    newRevealed.push({ char: actualKey[randomIndex], index: randomIndex });
    revealedIndices.add(randomIndex);
  }
  
  return newRevealed;
}

/**
 * Get character type hints based on time percentage
 * @param {string} actualKey - The secret key
 * @param {number} timePercentage - Percentage of time elapsed (0-100)
 * @returns {string[]} Array of hint strings
 */
export function getCharacterTypeHints(actualKey, timePercentage) {
  const hints = [];
  
  if (timePercentage >= 25) {
    if (/[a-z]/.test(actualKey)) hints.push("includes lowercase letters");
    if (/[A-Z]/.test(actualKey)) hints.push("includes uppercase letters");
  }
  
  if (timePercentage >= 50) {
    if (/[0-9]/.test(actualKey)) hints.push("includes numbers");
  }
  
  if (timePercentage >= 75) {
    if (/[^a-zA-Z0-9]/.test(actualKey)) hints.push("includes special characters");
  }
  
  return hints;
}
