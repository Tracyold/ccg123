"use client";

import React from "react";
import { MessageSquare } from "lucide-react";

type SmsMessage = {
  id: string;
  type: "incoming" | "outgoing";
  text: string;
  time?: string;
};

type SmsExample = {
  title: string;
  messages: SmsMessage[];
};

interface Props {
  examples: SmsExample[];
}

/* ---------- Styles ---------- */

const wrapperStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
  gap: "40px",
};

const titleStyle: React.CSSProperties = {
  fontFamily: "'Oranienbaum', serif",
  fontSize: "22px",
  fontWeight: 400,
  color: "#FAFAFA",
  marginBottom: "16px",
};

const phoneStyle: React.CSSProperties = {
  maxWidth: "420px",
  background: "#000",
  borderRadius: "26px",
  border: "1px solid rgba(255,255,255,0.12)",
  padding: "18px",
};

const phoneHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginBottom: "14px",
  paddingBottom: "10px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
};

const phoneNameStyle: React.CSSProperties = {
  fontFamily: "'Montserrat', sans-serif",
  fontSize: "11px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.18em",
  color: "#d4af37",
};

const threadStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

/* ---------- Bubble ---------- */

function Bubble({ message }: { message: SmsMessage }) {
  const incoming = message.type === "incoming";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: incoming ? "flex-start" : "flex-end",
      }}
    >
      <div
        style={{
          maxWidth: "80%",
          padding: "12px 14px",
          borderRadius: "18px",
          whiteSpace: "pre-wrap",
          fontFamily: "'Comfortaa', sans-serif",
          fontSize: "13px",
          lineHeight: 1.6,
          background: incoming
            ? "rgba(255,255,255,0.08)"
            : "rgba(45,212,191,1)",
          color: incoming ? "#FAFAFA" : "#0A0A0A",
          border: incoming ? "1px solid rgba(255,255,255,0.08)" : "none",
        }}
      >
        {message.text}

        {message.time && (
          <div
            style={{
              marginTop: "6px",
              fontSize: "10px",
              opacity: 0.6,
              textAlign: "right",
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            {message.time}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Component ---------- */

export default function SmsPreview({ examples }: Props) {
  return (
    <div style={wrapperStyle}>
      {examples.map((example) => (
        <div key={example.title}>
          <h3 style={titleStyle}>{example.title}</h3>

          <div style={phoneStyle}>
            <div style={phoneHeaderStyle}>
              <MessageSquare size={16} color="#d4af37" />
              <div style={phoneNameStyle}>Cutting Corners Gems</div>
            </div>

            <div style={threadStyle}>
              {example.messages.map((msg) => (
                <Bubble key={msg.id} message={msg} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}