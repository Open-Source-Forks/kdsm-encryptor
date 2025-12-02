import { NextResponse } from "next/server";
import { generateKey } from "@/utils/kdsm";
import { getWordsByLength } from "@/utils/constants";

// Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

// GET endpoint for simple integration via query params
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lengthParam = parseInt(searchParams.get("length") || "0", 10);
  
  // Get additional options
  const useCustomWord = searchParams.get("useCustomWord") === "true";
  const useReadablePassword = searchParams.get("useReadablePassword") === "true";
  const customWord = searchParams.get("customWord") || "";
  
  const options = {
    includeNumbers: searchParams.get("includeNumbers") === "true",
    includeSpecialChars: searchParams.get("includeSpecialChars") === "true",
    includeUppercase: searchParams.get("includeUppercase") === "true",
    includeLowercase: searchParams.get("includeLowercase") === "true",
    excludeSimilar: searchParams.get("excludeSimilar") === "true",
  };
  
  if (isNaN(lengthParam) || lengthParam <= 0) {
    return NextResponse.json(
      { error: "Invalid length parameter" },
      { status: 400, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
  
  // Validate custom word if provided
  if (useCustomWord && (!customWord || customWord.length < 3 || customWord.length > 14)) {
    return NextResponse.json(
      { error: "Custom word must be between 3 and 14 characters" },
      { status: 400, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
  
  // Determine word prefix
  let wordToUse = "";
  
  if (useReadablePassword) {
    // Formula: word_character_count = (password_length / 2) - 1
    const targetWordLength = Math.floor(lengthParam / 2) - 1;
    const clampedLength = Math.max(3, Math.min(14, targetWordLength));
    
    // Get words of the calculated length
    const wordsOfLength = getWordsByLength(clampedLength);
    
    if (wordsOfLength && wordsOfLength.length > 0) {
      wordToUse = wordsOfLength[Math.floor(Math.random() * wordsOfLength.length)];
    } else {
      // Fallback to closest available length
      let closestLength = clampedLength;
      let minDiff = Infinity;
      
      for (let len = 3; len <= 14; len++) {
        const words = getWordsByLength(len);
        if (words && words.length > 0) {
          const diff = Math.abs(len - clampedLength);
          if (diff < minDiff) {
            minDiff = diff;
            closestLength = len;
          }
        }
      }
      
      const fallbackWords = getWordsByLength(closestLength);
      wordToUse = fallbackWords[Math.floor(Math.random() * fallbackWords.length)];
    }
  } else if (useCustomWord && customWord) {
    wordToUse = customWord;
  }
  
  // Add word to options if present
  if (wordToUse) {
    options.customWorded = wordToUse;
  }
  
  const password = await generateKey(lengthParam, options);
  return NextResponse.json(
    { password },
    { status: 200, headers: { "Access-Control-Allow-Origin": "*" } }
  );
}

// POST endpoint for sending JSON body with options
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      length,
      includeNumbers,
      includeSpecialChars,
      includeUppercase,
      includeLowercase,
      excludeSimilar,
      useCustomWord,
      useReadablePassword,
      customWord,
    } = body;
    
    const lengthNum = typeof length === "number" ? length : parseInt(length, 10);
    if (isNaN(lengthNum) || lengthNum <= 0) {
      return NextResponse.json(
        { error: "Invalid length" },
        { status: 400, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }
    
    // Validate custom word if provided
    if (useCustomWord && (!customWord || customWord.length < 3 || customWord.length > 14)) {
      return NextResponse.json(
        { error: "Custom word must be between 3 and 14 characters" },
        { status: 400, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }
    
    // Determine word prefix
    let wordToUse = "";
    
    if (useReadablePassword) {
      // Formula: word_character_count = (password_length / 2) - 1
      const targetWordLength = Math.floor(lengthNum / 2) - 1;
      const clampedLength = Math.max(3, Math.min(14, targetWordLength));
      
      // Get words of the calculated length
      const wordsOfLength = getWordsByLength(clampedLength);
      
      if (wordsOfLength && wordsOfLength.length > 0) {
        wordToUse = wordsOfLength[Math.floor(Math.random() * wordsOfLength.length)];
      } else {
        // Fallback to closest available length
        let closestLength = clampedLength;
        let minDiff = Infinity;
        
        for (let len = 3; len <= 14; len++) {
          const words = getWordsByLength(len);
          if (words && words.length > 0) {
            const diff = Math.abs(len - clampedLength);
            if (diff < minDiff) {
              minDiff = diff;
              closestLength = len;
            }
          }
        }
        
        const fallbackWords = getWordsByLength(closestLength);
        wordToUse = fallbackWords[Math.floor(Math.random() * fallbackWords.length)];
      }
    } else if (useCustomWord && customWord) {
      wordToUse = customWord;
    }
    
    const options = {
      includeNumbers,
      includeSpecialChars,
      includeUppercase,
      includeLowercase,
      excludeSimilar,
    };
    
    // Add word to options if present
    if (wordToUse) {
      options.customWorded = wordToUse;
    }
    
    const password = await generateKey(lengthNum, options);
    return NextResponse.json(
      { password },
      { status: 200, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  } catch (error) {
    return NextResponse.json(
      { error: (error).message || "Internal error" },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}
