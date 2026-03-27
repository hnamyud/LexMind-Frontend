import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig, Audio } from "remotion";

export const Slide4Result: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slide-up animation for the chat bubble
  const bubbleY = spring({
    frame: frame,
    fps,
    config: { damping: 14, mass: 0.8 },
  });

  const contentOpacity = interpolate(frame, [20, 30], [0, 1], { extrapolateRight: "clamp" });

  const scale = interpolate(bubbleY, [0, 1], [0.95, 1], { extrapolateRight: "clamp" });
  const translateY = interpolate(bubbleY, [0, 1], [30, 0], { extrapolateRight: "clamp" });

  // Texts
  const text1 = " Người điều khiển xe mô tô, xe gắn máy (kể cả xe máy điện) không chấp hành hiệu lệnh của đèn tín hiệu giao thông (vượt đèn đỏ).";
  const typing1 = Math.floor(interpolate(frame, [30, 80], [0, text1.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));

  const text2A = "Phạt tiền từ ";
  const text2B = "4.000.000 đồng đến 6.000.000 đồng";
  const text2C = ".";
  const typing2 = Math.floor(interpolate(frame, [90, 130], [0, text2A.length + text2B.length + text2C.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));

  const cite2Opacity = interpolate(frame, [140, 150], [0, 1], { extrapolateRight: "clamp" });

  const text3A = "Bị trừ ";
  const text3B = "04 điểm";
  const text3C = " trên Giấy phép lái xe.";
  const typing3 = Math.floor(interpolate(frame, [160, 200], [0, text3A.length + text3B.length + text3C.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));

  const cite3Opacity = interpolate(frame, [210, 220], [0, 1], { extrapolateRight: "clamp" });

  const text4A = "Nếu hành vi không chấp hành hiệu lệnh của đèn tín hiệu giao thông mà ";
  const text4B = "gây tai nạn giao thông";
  const text4C = ", mức phạt tiền sẽ tăng lên từ ";
  const text4D = "10.000.000 đồng đến 14.000.000 đồng";
  const text4E = ".";
  const typing4 = Math.floor(interpolate(frame, [230, 280], [0, text4A.length + text4B.length + text4C.length + text4D.length + text4E.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));

  const cite4Opacity = interpolate(frame, [285, 295], [0, 1], { extrapolateRight: "clamp" });
  const warningBoxOpacity = interpolate(frame, [220, 230], [0, 1], { extrapolateRight: "clamp" });

  // Helper to split formatted text
  const renderTypedFormatted = (fullLen: number, segments: { text: string, style?: any }[]) => {
    let remaining = fullLen;
    return segments.map((seg, i) => {
      if (remaining <= 0) return null;
      const take = Math.min(remaining, seg.text.length);
      remaining -= take;
      return <span key={i} style={seg.style}>{seg.text.substring(0, take)}</span>;
    });
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "#050505", padding: "40px", justifyContent: "center", alignItems: "center" }}>
      <Audio src="/presentation/audio/slide_4.mp3" />
      <div
        style={{
          width: "100%", maxWidth: "1100px",
          padding: "30px 40px",
          backgroundColor: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.07)",
          borderRadius: "24px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
          transform: `translateY(${translateY}px) scale(${scale})`,
          opacity: bubbleY
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
          <div style={{
            width: "50px", height: "50px",
            background: "linear-gradient(135deg, rgba(0,210,235,0.2), rgba(0,180,200,0.1))",
            borderRadius: "12px",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginRight: "20px"
          }}>
            <span style={{ fontSize: "28px", fontFamily: "system-ui" }}>🤖</span>
          </div>
          <span style={{ fontSize: "22px", fontWeight: "bold", color: "#00f2ff", fontFamily: "system-ui" }}>LexMind AI</span>
        </div>

        <div style={{ opacity: contentOpacity, display: "flex", flexDirection: "column", gap: "16px" }}>
          <p style={{ fontSize: "26px", color: "#e2e8f0", lineHeight: "1.5", margin: 0, fontFamily: "system-ui, sans-serif" }}>
            <strong>Hành vi vi phạm:</strong>{text1.substring(0, typing1)}
            {typing1 > 0 && typing1 < text1.length && <span style={{ borderRight: "3px solid #00f2ff", marginLeft: "2px", animation: "blink 1s infinite" }}></span>}
          </p>

          <div style={{ margin: 0, opacity: frame >= 90 ? 1 : 0 }}>
            <div style={{ fontSize: "26px", color: "#e2e8f0", lineHeight: "1.5", margin: 0, fontFamily: "system-ui, sans-serif" }}>
              <strong>Hình phạt:</strong>
              <ul style={{ paddingLeft: "30px", margin: "8px 0" }}>
                <li>
                  {renderTypedFormatted(typing2, [
                    { text: text2A },
                    { text: text2B, style: { color: "#00f2ff", fontWeight: "bold" } },
                    { text: text2C }
                  ])}
                  {typing2 > 0 && typing2 < text2A.length + text2B.length + text2C.length && <span style={{ borderRight: "3px solid #00f2ff", marginLeft: "2px" }}></span>}
                </li>
                <li style={{ fontSize: "18px", color: "#64748b", listStyle: "none", marginLeft: "-20px", marginTop: "4px", opacity: cite2Opacity }}>[Điều 7, Khoản 7, Điểm c, Nghị định 168/2024/NĐ-CP]</li>
              </ul>
            </div>
          </div>

          <div style={{ margin: 0, opacity: frame >= 160 ? 1 : 0 }}>
            <div style={{ fontSize: "26px", color: "#e2e8f0", lineHeight: "1.5", margin: 0, fontFamily: "system-ui, sans-serif" }}>
              <strong>Hình phạt bổ sung:</strong>
              <ul style={{ paddingLeft: "30px", margin: "8px 0" }}>
                <li>
                  {renderTypedFormatted(typing3, [
                    { text: text3A },
                    { text: text3B, style: { color: "#ef4444", fontWeight: "bold" } },
                    { text: text3C }
                  ])}
                  {typing3 > 0 && typing3 < text3A.length + text3B.length + text3C.length && <span style={{ borderRight: "3px solid #ef4444", marginLeft: "2px" }}></span>}
                </li>
                <li style={{ fontSize: "18px", color: "#64748b", listStyle: "none", marginLeft: "-20px", marginTop: "4px", opacity: cite3Opacity }}>[Điều 7, Khoản 13, Điểm b, Nghị định 168/2024/NĐ-CP]</li>
              </ul>
            </div>
          </div>

          <div style={{ marginTop: "8px", opacity: warningBoxOpacity }}>
            <div style={{ fontSize: "22px", color: "#cbd5e1", lineHeight: "1.5", fontFamily: "system-ui, sans-serif", backgroundColor: "rgba(239, 68, 68, 0.08)", padding: "16px 20px", borderRadius: "12px", borderLeft: "4px solid #ef4444" }}>
              <strong style={{ color: "#f87171" }}>Lưu ý quan trọng:</strong>
              <ul style={{ paddingLeft: "24px", margin: "8px 0 0 0" }}>
                <li>
                  {renderTypedFormatted(typing4, [
                    { text: text4A },
                    { text: text4B, style: { fontWeight: "bold" } },
                    { text: text4C },
                    { text: text4D, style: { color: "#ef4444", fontWeight: "bold" } },
                    { text: text4E }
                  ])}
                  {typing4 > 0 && typing4 < (text4A.length + text4B.length + text4C.length + text4D.length + text4E.length) && <span style={{ borderRight: "3px solid #ef4444", marginLeft: "2px" }}></span>}
                </li>
                <li style={{ fontSize: "16px", color: "#64748b", listStyle: "none", marginLeft: "-20px", marginTop: "4px", opacity: cite4Opacity }}>[Điều 7, Khoản 10, Điểm b, Nghị định 168/2024/NĐ-CP]</li>
              </ul>
            </div>
          </div>
        </div>

      </div>

    </AbsoluteFill>
  );
};
