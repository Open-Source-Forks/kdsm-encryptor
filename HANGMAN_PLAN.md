# ✅ OVERALL ARCHITECTURE (Big Picture)

You will build Hangman using **3 core systems**:

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
  "battery_core"
];
```

✅ This supports:

* Easy → 6 parts
* Medium → 8 parts
* Hard → 10 parts

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

Zero drama. Zero bugs. Zero meetings with your debugger at 3 AM.

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

* Works perfectly in **Next.js App Router**
* Is **resolution independent**
* Is **animation-ready later**

---

# ✅ STEP 6: Using This in Your Game Page

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

      <button onClick={() => setFailedAttempts(f => f + 1)}>
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
