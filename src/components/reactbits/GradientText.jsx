export default function GradientText({ children, gradient = "linear-gradient(135deg,#F26522,#ff9a6c)", className = "", style = {} }) {
  return (
    <span
      className={className}
      style={{
        background: gradient,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        display: "inline-block",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
