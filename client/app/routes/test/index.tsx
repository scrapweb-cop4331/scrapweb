import { useRef } from "react";

export default function StyleLogger() {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    if (buttonRef.current) {
      const styles = window.getComputedStyle(buttonRef.current);
      // Logging the entire CSSStyleDeclaration object
      console.log("Button Computed Styles:", styles);
      
      // Example of logging a specific property
      console.log("Background Color:", styles.backgroundColor);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <button
        ref={buttonRef}
        onClick={handleClick}
        style={{
          padding: "10px 20px",
          backgroundColor: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "16px"
        }}
      >
        Log My Styles
      </button>
    </div>
  );
}
