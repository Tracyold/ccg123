import React from "react";

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

function Bubble({ message }: { message: SmsMessage }) {
  const incoming = message.type === "incoming";
  return (
    <div style={{ display: "flex", justifyContent: incoming ? "flex-start" : "flex-end", marginBottom: "8px" }}>
      <div style={{
        maxWidth: "75%",
        padding: "9px 13px",
        borderRadius: incoming ? "18px 18px 18px 4px" : "18px 18px 4px 18px",
        whiteSpace: "pre-wrap",
        fontFamily: "-apple-system, 'SF Pro Text', 'Helvetica Neue', sans-serif",
        fontSize: "13px",
        lineHeight: 1.5,
        background: incoming ? "#1c1c1e" : "#2c6bed",
        color: incoming ? "#e5e5ea" : "#ffffff",
      }}>
        {message.text}
        {message.time && (
          <div style={{ marginTop: "4px", fontSize: "10px", opacity: 0.5, textAlign: incoming ? "left" : "right" }}>
            {message.time}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SmsPreview({ examples }: Props) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 340px))", gap: "32px", marginBottom: "32px" }}>
      {examples.map((example) => (
        <div key={example.title}>
          {/* label */}
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(212,175,55,0.6)", marginBottom: "12px" }}>{example.title}</p>

          {/* phone shell */}
          <div style={{
            background: "#1a1a1a",
            borderRadius: "44px",
            padding: "12px",
            border: "2px solid #2e2e2e",
            boxShadow: "0 0 0 1px #111, 0 2px 6px rgba(0,0,0,0.4), inset 0 0 0 1px var(--border), 0 20px 60px rgba(0,0,0,0.6)",
            position: "relative",
          }}>
            {/* side buttons */}
            <div style={{ position: "absolute", left: "-3px", top: "80px", width: "3px", height: "28px", background: "#2a2a2a", borderRadius: "2px 0 0 2px" }} />
            <div style={{ position: "absolute", left: "-3px", top: "118px", width: "3px", height: "48px", background: "#2a2a2a", borderRadius: "2px 0 0 2px" }} />
            <div style={{ position: "absolute", left: "-3px", top: "176px", width: "3px", height: "48px", background: "#2a2a2a", borderRadius: "2px 0 0 2px" }} />
            <div style={{ position: "absolute", right: "-3px", top: "130px", width: "3px", height: "64px", background: "#2a2a2a", borderRadius: "0 2px 2px 0" }} />

            {/* screen */}
            <div style={{
              background: "#000",
              borderRadius: "34px",
              overflow: "hidden",
              minHeight: "420px",
              display: "flex",
              flexDirection: "column",
            }}>
              {/* status bar */}
              <div style={{ padding: "14px 20px 6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "-apple-system, sans-serif", fontSize: "12px", fontWeight: 600, color: "#fff" }}>9:41</span>
                <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                  <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                    <rect x="0" y="3" width="3" height="9" rx="1" fill="white" opacity="0.4"/>
                    <rect x="4.5" y="2" width="3" height="10" rx="1" fill="white" opacity="0.6"/>
                    <rect x="9" y="0.5" width="3" height="11.5" rx="1" fill="white" opacity="0.8"/>
                    <rect x="13.5" y="0" width="2.5" height="12" rx="1" fill="white"/>
                  </svg>
                  <svg width="15" height="11" viewBox="0 0 15 11" fill="white" opacity="0.9">
                    <path d="M7.5 2.2C9.8 2.2 11.9 3.1 13.4 4.6L14.8 3.2C12.9 1.2 10.3 0 7.5 0C4.7 0 2.1 1.2 0.2 3.2L1.6 4.6C3.1 3.1 5.2 2.2 7.5 2.2Z"/>
                    <path d="M7.5 5.5C9 5.5 10.3 6.1 11.3 7L12.7 5.6C11.3 4.3 9.5 3.5 7.5 3.5C5.5 3.5 3.7 4.3 2.3 5.6L3.7 7C4.7 6.1 6 5.5 7.5 5.5Z"/>
                    <circle cx="7.5" cy="10" r="1.5"/>
                  </svg>
                  <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                    <div style={{ width: "22px", height: "11px", border: "1px solid rgba(255,255,255,0.35)", borderRadius: "3px", padding: "1px", display: "flex" }}>
                      <div style={{ width: "75%", background: "#4cd964", borderRadius: "2px" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* dynamic island */}
              <div style={{ width: "110px", height: "32px", background: "#000", borderRadius: "20px", margin: "0 auto 8px", border: "1px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <div style={{ width: "10px", height: "10px", background: "#1c1c1e", borderRadius: "50%" }} />
                <div style={{ width: "40px", height: "6px", background: "#1c1c1e", borderRadius: "4px" }} />
              </div>

              {/* messages header */}
              <div style={{ padding: "4px 16px 10px", textAlign: "center", borderBottom: "1px solid var(--border)" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #2c6bed, #1a4fb0)", margin: "0 auto 6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "16px" }}>💎</span>
                </div>
                <p style={{ fontFamily: "-apple-system, sans-serif", fontSize: "13px", fontWeight: 600, color: "#fff", margin: 0 }}>Cutting Corners Gems</p>
                <p style={{ fontFamily: "-apple-system, sans-serif", fontSize: "11px", color: "var(--text-muted)", margin: "2px 0 0" }}>Business Messages</p>
              </div>

              {/* messag
              
              
              e thread */}
              <div style={{ height: "280px", padding: "16px 12px 8px", overflowY: "scroll", scrollbarWidth: "none" } as React.CSSProperties}>
                {example.messages.map((msg) => (
                  <Bubble key={msg.id} message={msg} />
                ))}
              </div>

              {/* input bar */}
              <div style={{ padding: "8px 12px 16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ flex: 1, background: "#1c1c1e", borderRadius: "18px", padding: "8px 14px", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <span style={{ fontFamily: "-apple-system, sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.25)" }}>iMessage</span>
                </div>
                <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#2c6bed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                    <path d="M6 1L6 11M6 1L2 5M6 1L10 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
