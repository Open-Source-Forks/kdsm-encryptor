import Link from "next/link";

const ShinyText = ({
  text,
  disabled = false,
  speed = 5,
  className = "",
  link = false,
}) => {
  const animationDuration = `${speed}s`;

  return (
    <div
      className={`shiny-text ${disabled ? "disabled" : ""} ${className}`}
      style={{ animationDuration }}
    >
      {link ? <Link href={"https://idrisvohra.me/"} target="_blank">{text}</Link> : text}
    </div>
  );
};

export default ShinyText;
