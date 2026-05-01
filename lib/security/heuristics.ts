type HeuristicResult = {
  verdict: string;
  riskScore: string;
  executiveSummary: string;
  evidence: string[];
  recommendedActions: string[];
};

const suspiciousKeywords = [
  "urgent",
  "immediately",
  "asap",
  "verify",
  "suspend",
  "password",
  "bank",
  "payroll",
  "gift card",
  "wire transfer",
  "crypto",
  "login",
  "click here",
  "confirm",
  "otp",
  "invoice",
];

const benignKeywords = [
  "unsubscribe",
  "newsletter",
  "thanks for subscribing",
  "receipt",
  "welcome",
  "tutorial",
  "learning",
  "service",
];

export function analyzePromptHeuristics(prompt: string): HeuristicResult {
  const normalized = prompt.toLowerCase();

  let score = 1;
  const evidence: string[] = [];

  const suspiciousMatches = suspiciousKeywords.filter((keyword) =>
    normalized.includes(keyword),
  );

  const benignMatches = benignKeywords.filter((keyword) =>
    normalized.includes(keyword),
  );

  if (suspiciousMatches.length > 0) {
    score += Math.min(5, suspiciousMatches.length);
    evidence.push(
      `Suspicious language found: ${suspiciousMatches.slice(0, 4).join(", ")}.`,
    );
  }

  if (normalized.includes("http://") || normalized.includes("https://")) {
    score += 2;
    evidence.push("A link is present, which should be treated carefully.");
  }

  if (
    normalized.includes("bank") ||
    normalized.includes("payroll") ||
    normalized.includes("financial")
  ) {
    score += 2;
    evidence.push("The message references financial or payroll-related actions.");
  }

  if (
    normalized.includes("password") ||
    normalized.includes("otp") ||
    normalized.includes("verify account")
  ) {
    score += 2;
    evidence.push("It asks for account verification, password, or OTP-style action.");
  }

  if (normalized.includes("ceo") || normalized.includes("manager")) {
    score += 1;
    evidence.push("It may be trying to use authority or impersonation pressure.");
  }

  if (normalized.includes("unsubscribe") && benignMatches.length > 0) {
    score -= 1;
  }

  if (benignMatches.length >= 2 && suspiciousMatches.length === 0) {
    score = Math.max(1, score - 2);
    evidence.push("The content also contains signs of a normal subscription or informational message.");
  }

  const boundedScore = Math.max(1, Math.min(10, score));

  if (boundedScore >= 7) {
    return {
      verdict: "Likely phishing",
      riskScore: `${boundedScore}.0/10`,
      executiveSummary:
        "This content looks risky. It contains pressure, sensitive requests, or suspicious links that are commonly seen in phishing or scam attempts.",
      evidence:
        evidence.length > 0
          ? evidence
          : ["The content has multiple suspicious patterns."],
      recommendedActions: [
        "Do not click links or open attachments yet.",
        "Do not share passwords, OTPs, or financial details.",
        "Report it to your manager or security contact.",
      ],
    };
  }

  if (boundedScore >= 4) {
    return {
      verdict: "Suspicious - review carefully",
      riskScore: `${boundedScore}.0/10`,
      executiveSummary:
        "This content is not clearly malicious, but it has enough warning signs that you should review it carefully before taking any action.",
      evidence:
        evidence.length > 0
          ? evidence
          : ["The content shows a few warning signs and needs verification."],
      recommendedActions: [
        "Verify the sender or source through a trusted channel.",
        "Avoid clicking links until you confirm it is legitimate.",
        "Ask a manager or security contact if you are unsure.",
      ],
    };
  }

  return {
    verdict: "Looks mostly safe",
    riskScore: `${boundedScore}.0/10`,
    executiveSummary:
      "This content does not show strong phishing signals right now, but you should still use normal caution before clicking unknown links or sharing private details.",
    evidence:
      evidence.length > 0
        ? evidence
        : ["No strong phishing indicators were detected in the pasted content."],
    recommendedActions: [
      "If you trust the sender, continue with normal caution.",
      "Still avoid sharing sensitive information unless necessary.",
      "If anything feels unusual, verify it before responding.",
    ],
  };
}
