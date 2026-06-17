// src/lib/passwordStrength.ts
// Feature #27 — Password Strength & Entropy Validation
//
// This utility MIRRORS the backend PasswordStrengthValidator so the UI gives
// instant feedback without a network round-trip.
//
// The same scoring algorithm is used on both sides:
//   entropy = length × log₂(charsetSize)
//   penalties for sequential runs (abc/123) and repeated chars (aaa/111)
//
// Score bands:
//   0 → VERY_WEAK   (< 28 bits)   — rejected by backend
//   1 → WEAK        (28–35 bits)  — rejected by backend
//   2 → FAIR        (36–45 bits)  — minimum accepted
//   3 → STRONG      (46–59 bits)
//   4 → VERY_STRONG (≥ 60 bits)

export type StrengthScore = 0 | 1 | 2 | 3 | 4;

export interface PasswordStrengthResult {
  score:         StrengthScore;
  label:         string;        // "Very Weak" | "Weak" | "Fair" | "Strong" | "Very Strong"
  color:         string;        // hex colour for the strength bar
  acceptable:    boolean;       // score >= 2 (FAIR)
  feedback:      string;        // one-sentence improvement tip
  entropyBits:   number;        // informational
  isCommon:      boolean;
  checks: {
    minLength:    boolean;       // ≥ 8 chars
    hasUpper:     boolean;       // at least one A–Z
    hasLower:     boolean;       // at least one a–z
    hasDigit:     boolean;       // at least one 0–9
    hasSymbol:    boolean;       // at least one special char
    noCommon:     boolean;       // not in blacklist
  };
}

// ── Common-password blacklist (subset — mirrors backend set) ──────────────────

const COMMON_PASSWORDS = new Set([
  "password","password1","password123","123456","12345678","123456789",
  "1234567890","qwerty","qwerty123","abc123","iloveyou","admin","letmein",
  "welcome","monkey","dragon","master","sunshine","princess","shadow",
  "superman","michael","football","baseball","soccer","hockey","tennis",
  "batman","trustno1","whatever","hello","charlie","donald","jessica",
  "password2","pass@123","pass1234","pass123","test","test123","111111",
  "1111111","11111111","000000","1234","12345","654321","987654321",
  "qwertyuiop","asdfghjkl","zxcvbnm","qazwsx","1q2w3e","1q2w3e4r",
  "zaq1zaq1","passw0rd","p@ssword","p@ss123","p@ssw0rd","p@$$word","pa$$word",
  "secret","secret1","secret123","hunter2","qwerty1","q1w2e3r4","abcd1234",
  "abc1234","aaa111","aaaaaa","aaaaaaaa","111222","112233","123321","321321",
  "696969","777777","888888","999999","101010","121212","131313","161616",
  "abcabc","abcdef","abcdefg","abcdefgh","password11","password12","password0",
  "love","lovely","loveyou","ilove","iloveu","lover","darling","sweetheart",
  "india","india123","india@123","cricket","cricket123","iloveindia","bharat123",
  "ram123","shiva","hanuman","ganesh","lakshmi","krishna","vishnu",
  "superman1","batman1","spiderman","ironman","thor","captain","avengers",
  "minecraft","fortnite","roblox","pubg","valorant","freef1re",
  "welcome1","welcome123","hello123","hello1","letmein1","newpass","newpassword",
  "oldpassword","mypassword1","temppass","temp1234","changeme","default",
  "admin123","root","toor","guest","user","test1","testing","test1234",
]);

// ── Helpers ───────────────────────────────────────────────────────────────────

function hasSequentialRun(pw: string): boolean {
  for (let i = 0; i < pw.length - 2; i++) {
    const a = pw.charCodeAt(i), b = pw.charCodeAt(i + 1), c = pw.charCodeAt(i + 2);
    if (b - a === 1 && c - b === 1) return true; // ascending
    if (a - b === 1 && b - c === 1) return true; // descending
  }
  return false;
}

function hasRepeatedRun(pw: string): boolean {
  for (let i = 0; i < pw.length - 2; i++) {
    if (pw[i] === pw[i + 1] && pw[i + 1] === pw[i + 2]) return true;
  }
  return false;
}

function charsetSize(pw: string): number {
  let size = 0;
  if (/[a-z]/.test(pw)) size += 26;
  if (/[A-Z]/.test(pw)) size += 26;
  if (/[0-9]/.test(pw)) size += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) size += 32;
  return size;
}

// ── Main export ───────────────────────────────────────────────────────────────

export function checkPasswordStrength(password: string): PasswordStrengthResult {
  const empty: PasswordStrengthResult = {
    score: 0, label: "", color: "transparent", acceptable: false,
    feedback: "", entropyBits: 0, isCommon: false,
    checks: { minLength: false, hasUpper: false, hasLower: false,
              hasDigit: false, hasSymbol: false, noCommon: true },
  };
  if (!password) return empty;

  const isCommon = COMMON_PASSWORDS.has(password.toLowerCase());

  const csz     = charsetSize(password);
  let entropy   = csz > 0 ? password.length * Math.log2(csz) : 0;
  if (hasSequentialRun(password)) entropy *= 0.85;
  if (hasRepeatedRun(password))   entropy *= 0.75;
  // common password hard-penalty
  if (isCommon) entropy = Math.min(entropy, 20);

  const rawScore: StrengthScore =
    entropy < 28 ? 0 :
    entropy < 36 ? 1 :
    entropy < 46 ? 2 :
    entropy < 60 ? 3 : 4;

  const LABELS  = ["Very Weak", "Weak",    "Fair",    "Strong",  "Very Strong"];
  const COLORS  = ["#ef4444",  "#f97316", "#eab308", "#22c55e", "#10b981"    ];
  const FEEDBACKS: Record<StrengthScore, string> = {
    0: "Too short or too simple — use at least 8 characters.",
    1: "Add uppercase letters, numbers or special characters.",
    2: "Acceptable — consider adding symbols or more length.",
    3: "Good password. You're well protected.",
    4: "Excellent! Very difficult to crack.",
  };
  const commonFeedback = "This is one of the most commonly guessed passwords — please choose something unique.";

  const checks = {
    minLength: password.length >= 8,
    hasUpper:  /[A-Z]/.test(password),
    hasLower:  /[a-z]/.test(password),
    hasDigit:  /[0-9]/.test(password),
    hasSymbol: /[^a-zA-Z0-9]/.test(password),
    noCommon:  !isCommon,
  };

  return {
    score:       rawScore,
    label:       LABELS[rawScore],
    color:       COLORS[rawScore],
    acceptable:  rawScore >= 2 && !isCommon,
    feedback:    isCommon ? commonFeedback : FEEDBACKS[rawScore],
    entropyBits: Math.round(entropy * 10) / 10,
    isCommon,
    checks,
  };
}
