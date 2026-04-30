const blobs = [
  {
    className:
      "h-[320px] w-[320px] bg-[radial-gradient(circle,_rgba(233,197,186,0.52)_0%,_rgba(233,197,186,0.14)_45%,_transparent_75%)]",
    style: { top: "6%", left: "-6%", animationDelay: "0s", animationDuration: "16s" },
  },
  {
    className:
      "h-[420px] w-[420px] bg-[radial-gradient(circle,_rgba(91,31,70,0.18)_0%,_rgba(91,31,70,0.08)_40%,_transparent_75%)]",
    style: { top: "12%", right: "-8%", animationDelay: "2s", animationDuration: "22s" },
  },
  {
    className:
      "h-[300px] w-[300px] bg-[radial-gradient(circle,_rgba(243,221,214,0.55)_0%,_rgba(243,221,214,0.12)_45%,_transparent_75%)]",
    style: { top: "48%", left: "10%", animationDelay: "4s", animationDuration: "18s" },
  },
  {
    className:
      "h-[360px] w-[360px] bg-[radial-gradient(circle,_rgba(199,150,93,0.22)_0%,_rgba(199,150,93,0.08)_45%,_transparent_75%)]",
    style: { top: "60%", right: "8%", animationDelay: "1s", animationDuration: "20s" },
  },
  {
    className:
      "h-[280px] w-[280px] bg-[radial-gradient(circle,_rgba(122,49,93,0.18)_0%,_rgba(122,49,93,0.06)_45%,_transparent_75%)]",
    style: { bottom: "6%", left: "32%", animationDelay: "3s", animationDuration: "17s" },
  },
];

const sparkles = [
  { top: "12%", left: "20%", delay: "0s" },
  { top: "20%", left: "72%", delay: "1.4s" },
  { top: "35%", left: "50%", delay: "0.7s" },
  { top: "58%", left: "16%", delay: "2.2s" },
  { top: "70%", left: "82%", delay: "1.1s" },
  { top: "82%", left: "58%", delay: "2.8s" },
  { top: "40%", left: "88%", delay: "1.8s" },
  { top: "88%", left: "26%", delay: "0.5s" },
];

export default function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.55),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(243,221,214,0.35),transparent_26%)]" />

      <div className="animated-mesh absolute inset-0 opacity-70" />

      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(91,31,70,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(91,31,70,0.22)_1px,transparent_1px)] [background-size:42px_42px]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_52%,rgba(255,255,255,0.18)_100%)]" />

      {blobs.map((blob, index) => (
        <div
          key={index}
          className={`absolute rounded-full blur-3xl animate-float-luxury ${blob.className}`}
          style={blob.style}
        />
      ))}

      {sparkles.map((sparkle, index) => (
        <span
          key={index}
          className="absolute animate-twinkle-luxury rounded-full bg-white/80 shadow-[0_0_20px_rgba(255,255,255,0.9)]"
          style={{
            top: sparkle.top,
            left: sparkle.left,
            width: index % 2 === 0 ? "7px" : "4px",
            height: index % 2 === 0 ? "7px" : "4px",
            animationDelay: sparkle.delay,
          }}
        />
      ))}

      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white/20 to-transparent" />
      <div className="luxury-noise absolute inset-0 opacity-[0.07]" />
    </div>
  );
}