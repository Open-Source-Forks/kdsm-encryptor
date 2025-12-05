# ✅ OVERALL ARCHITECTURE (Big Picture)

The game of Hangman is built around a few key systems that work together to create an engaging experience. Here's a high-level overview of the architecture:

1. **Game State Management**
   - Tracks the current state of the game including:
     - The secret pin to be guessed (the "actual_key" which is a column returned from Appwrite by getSharedMessage(slug) function)
     - The number of tries left
     - The letters guessed so far
     - The current display state of the pin (with revealed letters and dashes)
   - Manages transitions between game states (e.g., ongoing, won, lost).

## The hint system is simple:
- By default if hangman is enabled, the pin character length is shown with dashes.
- And if the character length is greater than or equal to 6, one random character is revealed as a hint.
- And as time goes on depending on the expire_seconds when the time reaches 10%, 30%, 50%, 70%, 90%, more characters are revealed until all are shown at expiration (This is also directly linked to the number of characters the actual_key has like if it is just 3 characters long not much hint is given).
- And another type of hint is shown based on time limit when it reaches 25%, 50%, 75% of expire time. It is that it shows the hint of the type of characters used in the pin (like "includes special characters", "includes numbers", "includes uppercase", "includes lowercase", etc).

## When tries is -1:

- **Time depletion → Robot Assembly Mapping**

You will build Hangman using **3 core systems** When tries is not -1:

1. **Difficulty System (6–10 tries)**
2. **Dynamic Robot Body System (SVG-based)**
3. **Failure → Robot Assembly Mapping**

Each **wrong guess adds one robot part** visually.

---

# ✅ STEP 1: Define the Universal Robot Parts (Max = 10)

This is your **master robot assembly order**:

```js
export const ALL_ROBOT_PARTS = [
  "head",
  "torso",
  "left_arm",
  "right_arm",
  "left_leg",
  "right_leg",
  "left_eye",
  "right_eye",
  "antenna",
  "battery_core",
];
```

✅ This supports:

- Hard → 6 parts
- Medium → 8 parts
- Easy → 10 parts

---

# ✅ STEP 2: Difficulty → Active Robot Parts

This gives you **scalable difficulty without rewriting logic**:

```js
export function getActiveRobotParts(difficulty) {
  return ALL_ROBOT_PARTS.slice(0, difficulty); // difficulty = 6–10
}
```

---

# ✅ STEP 3: Failed Attempts → Visible Robot Parts

This is your **core rendering logic**:

```js
export function getVisibleRobotParts(difficulty, failedAttempts) {
  const activeParts = getActiveRobotParts(difficulty);
  return activeParts.slice(0, failedAttempts);
}
```

✅ Example:

```js
difficulty = 8
failedAttempts = 5

→ visible = ["head", "torso", "left_arm", "right_arm", "left_leg"]
```

---

# ✅ STEP 4: Game Over Logic

```js
const isGameOver = failedAttempts >= difficulty;
```

---

# ✅ STEP 5: Robot Hangman SVG Component (Next.js / React)

Kinda like this:

```
/components/RobotHangman.jsx
```

```jsx
export default function RobotHangman({ visibleParts }) {
  return (
    <svg width="220" height="300" viewBox="0 0 220 300">

      {/* Head */}
      {visibleParts.includes("head") && (
        // appropriate SVG for the part
      )}

      {/* Torso */}
      {visibleParts.includes("torso") && (
        // appropriate SVG for the part
      )}

      {/* Left Arm */}
      {visibleParts.includes("left_arm") && (
        // appropriate SVG for the part
      )}

      {/* Right Arm */}
      {visibleParts.includes("right_arm") && (
        // appropriate SVG for the part
      )}

      {/* Left Leg */}
      {visibleParts.includes("left_leg") && (
        // appropriate SVG for the part
      )}

      {/* Right Leg */}
      {visibleParts.includes("right_leg") && (
        // appropriate SVG for the part
      )}

      {/* Left Eye */}
      {visibleParts.includes("left_eye") && (
        // appropriate SVG for the part
      )}

      {/* Right Eye */}
      {visibleParts.includes("right_eye") && (
        // appropriate SVG for the part
      )}

      {/* Antenna */}
      {visibleParts.includes("antenna") && (
        // appropriate SVG for the part
      )}

      {/* Battery Core (Final Death Part 😄) */}
      {visibleParts.includes("battery_core") && (
        // appropriate SVG for the part
      )}

    </svg>
  );
}
```

✅ This:

- Works perfectly in **Next.js App Router**
- Is **resolution independent**
- Is **animation-ready later**

---

# ✅ STEP 6: Using This in Your Game Page Kinda Like This:

```jsx
import { useState } from "react";
import { getVisibleRobotParts } from "@/lib/robotLogic";
import RobotHangman from "@/components/RobotHangman";

export default function Game() {
  const [difficulty, setDifficulty] = useState(8);
  const [failedAttempts, setFailedAttempts] = useState(0);

  const visibleParts = getVisibleRobotParts(difficulty, failedAttempts);

  return (
    <div>
      <RobotHangman visibleParts={visibleParts} />

      <button onClick={() => setFailedAttempts((f) => f + 1)}>
        Wrong Guess
      </button>
    </div>
  );
}
```

---

# ✅ WHY THIS SYSTEM IS POWERFUL

✅ Works with **any difficulty**
✅ Clean React logic
✅ No asset mess
✅ Easy animations
✅ Expandable beyond 10 parts
✅ Future-proof for mobile & desktop
