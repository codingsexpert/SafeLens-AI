"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import Tesseract from "tesseract.js";
import type { AnalysisResponse } from "@/lib/types";

const prompts = [
  "Is this email safe?",
  "Check this URL before I open it.",
  "Explain this in simple words.",
];

const simpleSteps = [
  {
    step: 1,
    title: "Paste or Upload",
    description: "Add suspicious message, link, screenshot, or file",
  },
  {
    step: 2,
    title: "AI Analysis",
    description: "Our AI checks it for threats safely",
  },
  {
    step: 3,
    title: "Get Verdict",
    description: "Clear answer with recommended actions",
  },
];

const inputModes = [
  "Email text",
  "Screenshot",
  "PDF upload",
  "QR code",
  "Website scan",
  "Tab scan",
];

export function TriageWorkbench() {
  const resultRef = useRef<HTMLDivElement | null>(null);
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [prompt, setPrompt] = useState(
    "I got an email asking me to urgently update payroll details through a link. Is it safe?"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedMode, setSelectedMode] = useState("Email text");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [screenshotPreviewUrl, setScreenshotPreviewUrl] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [ocrStatus, setOcrStatus] = useState("");
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [decodedQrText, setDecodedQrText] = useState("");
  const [qrStatus, setQrStatus] = useState("");
  const [pdfPreviewText, setPdfPreviewText] = useState("");
  const [pdfStatus, setPdfStatus] = useState("");
  const [verdict, setVerdict] = useState("Not checked yet");
  const [riskScore, setRiskScore] = useState("--");
  const [mode, setMode] = useState<AnalysisResponse["mode"]>("demo");
  const [executiveSummary, setExecutiveSummary] = useState(
    "Paste something suspicious and click Analyze. The result will explain whether it looks safe, suspicious, or likely phishing."
  );
  const [evidencePoints, setEvidencePoints] = useState<string[]>([]);
  const [recommendedActions, setRecommendedActions] = useState([
    "Paste a message, link, screenshot, PDF, or QR code.",
    "Click Analyze to check it.",
    "Follow the recommended next steps.",
  ]);
  const [shareMessage, setShareMessage] = useState("");
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [lastCheckedText, setLastCheckedText] = useState("");

  async function runAnalysis(nextPrompt?: string) {
    const activePrompt = (nextPrompt ?? prompt).trim();

    if (!activePrompt) {
      setError("Paste a message, URL, domain, IP, or hash first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: activePrompt }),
      });

      if (!response.ok) {
        throw new Error("Analysis could not be completed.");
      }

      const data = (await response.json()) as AnalysisResponse;
      setPrompt(activePrompt);
      setVerdict(data.verdict);
      setRiskScore(data.riskScore);
      setMode(data.mode);
      setExecutiveSummary(data.executiveSummary);
      setEvidencePoints(data.evidence.slice(0, 4));
      setRecommendedActions(data.recommendedActions.slice(0, 3));
      setHasAnalyzed(true);
      setLastCheckedText(activePrompt.slice(0, 140));
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong during analysis."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (hasAnalyzed) {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [hasAnalyzed, verdict, executiveSummary]);

  async function handleQrUpload(file: File | undefined) {
    if (!file) return;

    setSelectedFileName(file.name);
    setQrStatus("");
    setDecodedQrText("");

    const fileUrl = URL.createObjectURL(file);
    setQrImageUrl(fileUrl);

    try {
      const image = await loadImage(fileUrl);
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Canvas is not supported in this browser.");
      }

      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const result = jsQR(imageData.data, imageData.width, imageData.height);

      if (!result?.data) {
        setQrStatus("No QR code was detected in this image.");
        return;
      }

      setDecodedQrText(result.data);
      setPrompt(result.data);
      setQrStatus("QR code decoded successfully. Ready to analyze.");
    } catch (caughtError) {
      setQrStatus(
        caughtError instanceof Error
          ? caughtError.message
          : "QR image could not be decoded."
      );
    }
  }

  async function handleScreenshotUpload(file: File | undefined) {
    if (!file) return;

    setSelectedFileName(file.name);
    setOcrStatus("");
    setOcrText("");

    const fileUrl = URL.createObjectURL(file);
    setScreenshotPreviewUrl(fileUrl);

    try {
      const result = await Tesseract.recognize(file, "eng");
      const extractedText = result.data.text.trim();

      if (!extractedText) {
        setOcrStatus("No readable text was found in this screenshot.");
        return;
      }

      setOcrText(extractedText.slice(0, 1200));
      setPrompt(extractedText.slice(0, 4000));
      setOcrStatus("Screenshot text extracted. Ready to analyze.");
    } catch (caughtError) {
      setOcrStatus(
        caughtError instanceof Error
          ? caughtError.message
          : "Screenshot OCR failed."
      );
    }
  }

  async function handlePdfUpload(file: File | undefined) {
    if (!file) return;

    setSelectedFileName(file.name);
    setPdfStatus("");
    setPdfPreviewText("");

    try {
      const pdfjs = await import("pdfjs-dist");
      const workerModule = await import("pdfjs-dist/build/pdf.worker.min.mjs");

      pdfjs.GlobalWorkerOptions.workerSrc = workerModule.default;

      const buffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: buffer }).promise;

      let extractedText = "";

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ");

        extractedText += `${pageText}\n`;
      }

      const cleanText = extractedText.trim();

      if (!cleanText) {
        setPdfStatus("No readable text was found in this PDF.");
        return;
      }

      setPdfPreviewText(cleanText.slice(0, 1200));
      setPrompt(cleanText.slice(0, 4000));
      setPdfStatus("PDF text extracted. Ready to analyze.");
    } catch (caughtError) {
      setPdfStatus(
        caughtError instanceof Error
          ? caughtError.message
          : "PDF could not be processed."
      );
    }
  }

  async function copyShareCard() {
    const text =
      language === "hi"
        ? `SafeLens AI Alert\nResult: ${translateVerdict(verdict)}\nRisk Score: ${riskScore}\nSummary: ${getDisplaySummary()}\nNext: ${getDisplayActions()
            .map((item) => `- ${item}`)
            .join("\n")}`
        : `SafeLens AI Alert\nResult: ${verdict}\nRisk Score: ${riskScore}\nSummary: ${getDisplaySummary()}\nNext: ${getDisplayActions()
            .map((item) => `- ${item}`)
            .join("\n")}`;

    try {
      await navigator.clipboard.writeText(text);
      setShareMessage(
        language === "hi"
          ? "Share card clipboard me copy ho gaya."
          : "Share card copied to clipboard."
      );
    } catch {
      setShareMessage(
        language === "hi"
          ? "Clipboard access fail ho gaya."
          : "Clipboard access failed."
      );
    }
  }

  function translateVerdict(value: string) {
    if (value.toLowerCase().includes("not checked")) {
      return "Abhi check nahi hua";
    }

    if (value.toLowerCase().includes("phish")) {
      return "Yeh phishing jaisa lag raha hai";
    }

    if (value.toLowerCase().includes("safe")) {
      return "Yeh safe lag raha hai";
    }

    return "Yeh suspicious lag raha hai";
  }

  function getDisplaySummary() {
    if (language === "en") {
      return executiveSummary;
    }

    return "Yeh message risky lag raha hai. Isme urgency hai, sensitive information maangi ja rahi hai, aur link suspicious lag raha hai.";
  }

  function getDisplayActions() {
    if (language === "en") {
      return recommendedActions;
    }

    return [
      "Link par click mat karo.",
      "Koi personal ya banking detail share mat karo.",
      "Is message ko apne manager ya security team ko report karo.",
    ];
  }

  const riskBreakdown = evidencePoints.length
    ? evidencePoints
    : [
        language === "hi"
          ? "Result yahan analysis ke baad dikhaya jayega."
          : "Evidence will appear here after analysis.",
      ];

  const getVerdictStyle = () => {
    if (!hasAnalyzed) return "bg-secondary text-muted-foreground";
    if (verdict.toLowerCase().includes("phish"))
      return "bg-destructive/20 text-destructive border border-destructive/30";
    if (verdict.toLowerCase().includes("suspicious"))
      return "bg-warning/20 text-warning border border-warning/30";
    return "bg-primary/20 text-primary border border-primary/30";
  };

  return (
    <section id="workbench" className="relative py-24 px-6">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] rounded-full bg-primary/5 blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-sm text-primary uppercase tracking-widest mb-4">
            Security Workbench
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-balance">
            Analyze any suspicious content
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg text-pretty">
            Paste text, upload files, or scan QR codes. Get instant AI-powered
            threat analysis with clear verdicts.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {simpleSteps.map((step) => (
            <div
              key={step.step}
              className="flex items-start gap-4 p-5 rounded-2xl glass"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                {step.step}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Workbench */}
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
          {/* Input Panel */}
          <div className="rounded-2xl glass-strong p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <span className="text-xs text-primary uppercase tracking-widest">
                  Command Center
                </span>
                <h3 className="text-xl font-semibold text-foreground mt-2">
                  What do you want to check?
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Our AI analyzes for urgency, suspicious links, financial
                  requests, and impersonation.
                </p>
              </div>
              <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
                Multi-input
              </span>
            </div>

            {/* Input Mode Selector */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-3">Input type</p>
              <div className="flex flex-wrap gap-2">
                {inputModes.map((modeOption) => (
                  <button
                    key={modeOption}
                    onClick={() => setSelectedMode(modeOption)}
                    className={`px-4 py-2 text-sm rounded-lg transition-all ${
                      selectedMode === modeOption
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-white/10"
                    }`}
                  >
                    {modeOption}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <div className="mb-6">
              <label
                htmlFor="triage-input"
                className="block text-sm font-medium text-foreground mb-2"
              >
                {selectedMode === "Email text" || selectedMode === "Tab scan"
                  ? "Paste email text, link, or file hash"
                  : "Upload your file below"}
              </label>
              <textarea
                id="triage-input"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Paste suspicious content here..."
                className="w-full h-40 px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
            </div>

            {/* Upload Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <label className="group flex flex-col gap-2 p-4 rounded-xl bg-secondary/50 border border-border cursor-pointer hover:border-primary/30 hover:bg-secondary transition-all">
                <input
                  className="hidden"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    void handleScreenshotUpload(e.target.files?.[0])
                  }
                />
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      Screenshot
                    </span>
                    <p className="text-xs text-muted-foreground">PNG, JPG</p>
                  </div>
                </div>
              </label>

              <label className="group flex flex-col gap-2 p-4 rounded-xl bg-secondary/50 border border-border cursor-pointer hover:border-primary/30 hover:bg-secondary transition-all">
                <input
                  className="hidden"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => void handlePdfUpload(e.target.files?.[0])}
                />
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      PDF File
                    </span>
                    <p className="text-xs text-muted-foreground">Documents</p>
                  </div>
                </div>
              </label>

              <label className="group flex flex-col gap-2 p-4 rounded-xl bg-secondary/50 border border-border cursor-pointer hover:border-primary/30 hover:bg-secondary transition-all">
                <input
                  className="hidden"
                  type="file"
                  accept="image/*"
                  onChange={(e) => void handleQrUpload(e.target.files?.[0])}
                />
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                      />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      QR Code
                    </span>
                    <p className="text-xs text-muted-foreground">Scan codes</p>
                  </div>
                </div>
              </label>

              <div className="flex flex-col gap-2 p-4 rounded-xl bg-secondary/30 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/20 text-muted">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                      />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Tab Scan
                    </span>
                    <p className="text-xs text-muted">Extension only</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Messages */}
            {selectedFileName && (
              <p className="text-sm text-muted-foreground mb-4">
                Selected: {selectedFileName}
              </p>
            )}
            {ocrStatus && (
              <p className="text-sm text-primary mb-4">{ocrStatus}</p>
            )}
            {qrStatus && (
              <p className="text-sm text-primary mb-4">{qrStatus}</p>
            )}
            {pdfStatus && (
              <p className="text-sm text-primary mb-4">{pdfStatus}</p>
            )}

            {/* Preview Cards */}
            {screenshotPreviewUrl && (
              <div className="flex gap-4 p-4 rounded-xl bg-secondary/50 border border-border mb-6">
                <img
                  src={screenshotPreviewUrl}
                  alt="Screenshot preview"
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Extracted text
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                    {ocrText || "Processing..."}
                  </p>
                </div>
              </div>
            )}

            {qrImageUrl && (
              <div className="flex gap-4 p-4 rounded-xl bg-secondary/50 border border-border mb-6">
                <img
                  src={qrImageUrl}
                  alt="QR preview"
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Decoded QR
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                    {decodedQrText || "Processing..."}
                  </p>
                </div>
              </div>
            )}

            {pdfPreviewText && (
              <div className="p-4 rounded-xl bg-secondary/50 border border-border mb-6">
                <p className="text-sm font-medium text-foreground mb-2">
                  PDF text preview
                </p>
                <p className="text-sm text-muted-foreground max-h-32 overflow-auto whitespace-pre-wrap">
                  {pdfPreviewText}
                </p>
              </div>
            )}

            {/* Quick Prompts */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-3">
                Quick prompts
              </p>
              <div className="flex flex-wrap gap-2">
                {prompts.map((presetPrompt) => (
                  <button
                    key={presetPrompt}
                    onClick={() => {
                      setPrompt(presetPrompt);
                      void runAnalysis(presetPrompt);
                    }}
                    className="px-4 py-2 text-sm rounded-lg bg-secondary text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all"
                  >
                    {presetPrompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-destructive mb-4">{error}</p>
            )}

            {/* Submit Button */}
            <button
              disabled={loading}
              onClick={() => void runAnalysis()}
              className="w-full py-4 text-base font-medium text-primary-foreground gradient-accent rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Analyzing...
                </span>
              ) : (
                "Analyze Now"
              )}
            </button>
          </div>

          {/* Result Panel */}
          <div
            ref={resultRef}
            className={`rounded-2xl glass-strong p-6 lg:p-8 lg:sticky lg:top-24 lg:self-start transition-all ${
              hasAnalyzed ? "ring-1 ring-primary/20" : ""
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <span className="text-xs text-primary uppercase tracking-widest">
                  Analysis Brief
                </span>
                <p className="text-sm text-muted-foreground mt-2">
                  {hasAnalyzed
                    ? `Checked: ${lastCheckedText.slice(0, 60)}...`
                    : "Results will appear after analysis"}
                </p>
              </div>
              <span
                className={`px-3 py-1.5 text-xs font-medium rounded-full ${
                  loading
                    ? "bg-warning/20 text-warning"
                    : hasAnalyzed
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {loading ? "Analyzing" : hasAnalyzed ? "Ready" : "Waiting"}
              </span>
            </div>

            {/* Verdict & Score */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <span
                className={`px-4 py-2 text-sm font-semibold rounded-lg ${getVerdictStyle()}`}
              >
                {language === "hi" ? translateVerdict(verdict) : verdict}
              </span>
              <div className="flex flex-col items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
                <span className="text-xl font-bold text-foreground">
                  {riskScore}
                </span>
                <span className="text-xs text-muted-foreground">Risk</span>
              </div>
            </div>

            {/* Language & Mode Toggle */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary">
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                    language === "en"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage("hi")}
                  className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                    language === "hi"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  HI
                </button>
              </div>
              <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-secondary text-muted-foreground">
                {mode === "armoriq-live" ? "Live Mode" : "Demo Mode"}
              </span>
            </div>

            {/* Summary */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-foreground mb-2">
                {loading
                  ? "Analyzing..."
                  : language === "hi"
                  ? "Iska matlab"
                  : "What this means"}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {getDisplaySummary()}
              </p>
            </div>

            {/* Evidence & Actions Grid */}
            <div className="grid grid-cols-1 gap-4 mb-6">
              {/* Risk Breakdown */}
              <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                <h5 className="text-sm font-medium text-foreground mb-3">
                  {language === "hi" ? "Risk kyu laga" : "Why it looks risky"}
                </h5>
                <div className="space-y-2">
                  {riskBreakdown.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-warning shrink-0" />
                      <p className="text-sm text-muted-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Actions */}
              <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                <h5 className="text-sm font-medium text-foreground mb-3">
                  {language === "hi"
                    ? "Ab kya karna chahiye"
                    : "What to do next"}
                </h5>
                <div className="space-y-2">
                  {getDisplayActions().map((action, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                      <p className="text-sm text-muted-foreground">{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Share Card */}
            <div className="p-4 rounded-xl bg-secondary/50 border border-border">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-medium text-foreground">
                  Share Report
                </h5>
                <button
                  onClick={copyShareCard}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-secondary text-foreground hover:bg-white/10 transition-all"
                >
                  Copy Card
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                {language === "hi"
                  ? "Team ya manager ke saath share karne ke liye ready."
                  : "Ready to share with your team or manager."}
              </p>
              {shareMessage && (
                <p className="text-sm text-primary mt-2">{shareMessage}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}
