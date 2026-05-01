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
  "Paste the suspicious message, link, or file hash.",
  "Kill Switch checks it safely.",
  "You get a clear answer and next step.",
];

const inputModes = [
  "Email text",
  "Screenshot upload",
  "PDF or file upload",
  "QR code scan",
  "Website screenshot",
  "Current tab scan",
];

export function TriageWorkbench() {
  const resultRef = useRef<HTMLDivElement | null>(null);
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [prompt, setPrompt] = useState(
    "I got an email asking me to urgently update payroll details through a link. Is it safe?",
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
    "Paste something suspicious and click Check Now. The result will explain whether it looks safe, suspicious, or likely phishing.",
  );
  const [evidencePoints, setEvidencePoints] = useState<string[]>([]);
  const [recommendedActions, setRecommendedActions] = useState([
    "Paste a message, link, screenshot, PDF, or QR code.",
    "Click Check Now to analyze it.",
    "Read the result and follow the suggested next steps.",
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
          : "Something went wrong during analysis.",
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
    if (!file) {
      return;
    }

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
      setQrStatus("QR code decoded successfully. You can now analyze it.");
    } catch (caughtError) {
      setQrStatus(
        caughtError instanceof Error
          ? caughtError.message
          : "QR image could not be decoded.",
      );
    }
  }

  async function handleScreenshotUpload(file: File | undefined) {
    if (!file) {
      return;
    }

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
      setOcrStatus("Screenshot text extracted successfully. You can now analyze it.");
    } catch (caughtError) {
      setOcrStatus(
        caughtError instanceof Error
          ? caughtError.message
          : "Screenshot OCR failed.",
      );
    }
  }

  async function handlePdfUpload(file: File | undefined) {
    if (!file) {
      return;
    }

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
      setPdfStatus("PDF text extracted successfully. You can now analyze it.");
    } catch (caughtError) {
      setPdfStatus(
        caughtError instanceof Error
          ? caughtError.message
          : "PDF could not be processed.",
      );
    }
  }

  async function copyShareCard() {
    const text =
      language === "hi"
        ? `Kill Switch Alert\nResult: ${translateVerdict(verdict)}\nRisk Score: ${riskScore}\nSummary: ${getDisplaySummary()}\nNext: ${getDisplayActions()
            .map((item) => `- ${item}`)
            .join("\n")}`
        : `Kill Switch Alert\nResult: ${verdict}\nRisk Score: ${riskScore}\nSummary: ${getDisplaySummary()}\nNext: ${getDisplayActions()
            .map((item) => `- ${item}`)
            .join("\n")}`;

    try {
      await navigator.clipboard.writeText(text);
      setShareMessage(
        language === "hi"
          ? "Share card clipboard me copy ho gaya."
          : "Share card copied to clipboard.",
      );
    } catch {
      setShareMessage(
        language === "hi"
          ? "Clipboard access fail ho gaya."
          : "Clipboard access failed.",
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
          : "Evidence will appear here after analysis runs.",
      ];

  return (
    <section className="simple-workbench">
      <div className="panel simple-input-panel">
        <div className="panel-sheen" />
        <div className="simple-header">
          <div className="section-topline">
            <span className="eyebrow">Command Center</span>
            <span className="section-pill">Multi-input Security Check</span>
          </div>
          <h2>Paste it here. We will tell you if it looks risky.</h2>
          <p className="simple-copy">
            Made for non-technical users. No jargon. Just a clear answer and what
            to do next.
          </p>
        </div>

        <div className="simple-steps">
          {simpleSteps.map((step, index) => (
            <article className="simple-step" key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </article>
          ))}
        </div>

        <div className="input-mode-shell">
          <p className="input-mode-label">Choose what you want to inspect</p>
          <div className="input-modes">
          {inputModes.map((modeOption) => (
            <button
              className={`mode-chip ${selectedMode === modeOption ? "mode-chip-active" : ""}`}
              key={modeOption}
              onClick={() => setSelectedMode(modeOption)}
              type="button"
            >
              {modeOption}
            </button>
          ))}
        </div>
        </div>

        <div className="simple-composer">
          <div className="composer-topline">
            <div>
          <label className="composer-label" htmlFor="triage-input">
            {selectedMode === "Email text" || selectedMode === "Current tab scan"
              ? "Paste email text, a link, or a file hash"
              : "Add the suspicious file, screenshot, or QR asset"}
          </label>
              <p className="composer-subtext">The analyzer looks for urgency, suspicious links, financial requests, login cues, and impersonation pressure.</p>
            </div>
            <span className="section-pill subtle-pill">{selectedMode}</span>
          </div>
          <textarea
            id="triage-input"
            className="composer-textarea"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Paste suspicious content here..."
          />

          <div className="upload-grid">
            <label className="upload-card">
              <input
                className="hidden-input"
                onChange={(event) =>
                  void handleScreenshotUpload(event.target.files?.[0])
                }
                type="file"
                accept="image/*"
              />
              <strong>Upload screenshot</strong>
              <p>PNG, JPG, or a captured phishing screen.</p>
            </label>

            <label className="upload-card">
              <input
                className="hidden-input"
                onChange={(event) =>
                  void handlePdfUpload(event.target.files?.[0])
                }
                type="file"
                accept=".pdf,application/pdf"
              />
              <strong>Upload PDF or file</strong>
              <p>Invoices, attachments, or suspicious documents.</p>
            </label>

            <label className="upload-card">
              <input
                className="hidden-input"
                onChange={(event) =>
                  void handleQrUpload(event.target.files?.[0])
                }
                type="file"
                accept="image/*"
              />
              <strong>Upload QR image</strong>
              <p>Scan QR posters, payment requests, or login codes.</p>
            </label>

            <article className="upload-card extension-card">
              <strong>Scan current tab</strong>
              <p>Extension-ready flow for checking the page you are on.</p>
            </article>
          </div>

          {selectedFileName ? (
            <p className="helper-text">Selected file: {selectedFileName}</p>
          ) : (
            <p className="helper-text">
              You can check email text, screenshots, PDFs, files, QR images, website screenshots, and browser tab content.
            </p>
          )}

          {ocrStatus ? <p className="helper-text">{ocrStatus}</p> : null}
          {qrStatus ? <p className="helper-text">{qrStatus}</p> : null}
          {pdfStatus ? <p className="helper-text">{pdfStatus}</p> : null}

          {screenshotPreviewUrl ? (
            <div className="qr-preview">
              <img alt="Uploaded screenshot preview" src={screenshotPreviewUrl} />
              <div className="qr-preview-copy">
                <strong>Extracted screenshot text</strong>
                <p>{ocrText || "Reading screenshot text..."}</p>
              </div>
            </div>
          ) : null}

          {qrImageUrl ? (
            <div className="qr-preview">
              <img alt="Uploaded QR preview" src={qrImageUrl} />
              <div className="qr-preview-copy">
                <strong>Decoded QR content</strong>
                <p>{decodedQrText || "Waiting for QR content..."}</p>
              </div>
            </div>
          ) : null}

          {pdfPreviewText ? (
            <div className="pdf-preview">
              <div className="pdf-preview-copy">
                <strong>Extracted PDF text</strong>
                <p>{pdfPreviewText}</p>
              </div>
            </div>
          ) : null}

          <div className="prompt-group">
            <p className="input-mode-label">Quick prompts</p>
          <div className="prompt-row">
            {prompts.map((presetPrompt) => (
              <button
                className="prompt-chip"
                key={presetPrompt}
                onClick={() => {
                  setPrompt(presetPrompt);
                  void runAnalysis(presetPrompt);
                }}
                type="button"
              >
                {presetPrompt}
              </button>
            ))}
          </div>
          </div>

          {error ? <p className="error-text">{error}</p> : null}

          <button
            className="primary-button simple-submit"
            disabled={loading}
            onClick={() => void runAnalysis()}
            type="button"
          >
            {loading ? "Checking..." : "Check Now"}
          </button>
        </div>
      </div>

      <div className={`panel simple-result-panel ${hasAnalyzed ? "result-live" : ""}`} ref={resultRef}>
        <div className="panel-sheen" />
        <div className="result-heading">
          <div className="section-topline">
            <span className="eyebrow">Analysis Brief</span>
            <span className="section-pill">
              {loading ? "Analyzing" : hasAnalyzed ? "Ready" : "Waiting"}
            </span>
          </div>
          <p>
            {hasAnalyzed
              ? `Checked: ${lastCheckedText}`
              : "Your answer will appear here after you click Check Now."}
          </p>
        </div>

        <div className="result-topline">
          <div className="result-hero">
            <span
              className={`result-badge ${
                !hasAnalyzed
                  ? "result-neutral"
                  : verdict.toLowerCase().includes("phish")
                    ? "result-danger"
                    : verdict.toLowerCase().includes("suspicious")
                      ? "result-warning"
                      : "result-safe"
              }`}
            >
              {language === "hi" ? translateVerdict(verdict) : verdict}
            </span>
            <div className="score-orb">
              <strong>{riskScore}</strong>
              <span>Risk score</span>
            </div>
          </div>
          <div className="result-controls">
            <div className="language-toggle">
              <button
                className={language === "en" ? "toggle-active" : ""}
                onClick={() => setLanguage("en")}
                type="button"
              >
                EN
              </button>
              <button
                className={language === "hi" ? "toggle-active" : ""}
                onClick={() => setLanguage("hi")}
                type="button"
              >
                HI
              </button>
            </div>
            <span className="status-pill">
              {mode === "armoriq-live" ? "ArmorIQ Live" : "Demo Mode"}
            </span>
          </div>
        </div>

        <h3>{loading ? "Checking..." : language === "hi" ? "Iska matlab" : "What this means"}</h3>
        <p className="result-summary">{getDisplaySummary()}</p>

        <div className="result-grid">
          <div className="breakdown-panel">
            <strong>{language === "hi" ? "Risk kyu laga" : "Why it looks risky"}</strong>
            <div className="breakdown-list">
              {riskBreakdown.map((item) => (
                <article className="breakdown-item" key={item}>
                  <span />
                  <div>
                    <p>{item}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="next-actions">
            <strong>{language === "hi" ? "Ab kya karna chahiye" : "What you should do next"}</strong>
            <div className="action-list">
              {getDisplayActions().map((action) => (
                <article className="action-item" key={action}>
                  <span />
                  <p>{action}</p>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="share-card">
          <div className="share-topline">
            <strong>{language === "hi" ? "Shareable update" : "Shareable update"}</strong>
            <button className="secondary-button share-button" onClick={copyShareCard} type="button">
              {language === "hi" ? "Copy Card" : "Copy Card"}
            </button>
          </div>
          <p>
            {language === "hi"
              ? "Team ya manager ke saath share karne ke liye ready summary."
              : "A ready summary you can share with your manager or team."}
          </p>
          {shareMessage ? <p className="share-message">{shareMessage}</p> : null}
        </div>
      </div>
    </section>
  );
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image could not be loaded."));
    image.src = source;
  });
}
