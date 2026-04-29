import React from "react";
import { Spinner } from "baseui/spinner";
import { useStyletron } from "baseui";

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  const [css] = useStyletron();
  return (
    <div
      className={css({
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px",
        gap: "16px",
      })}
    >
      <Spinner $size="large" />
      {message && (
        <p className={css({ color: "#666", margin: "0", fontSize: "14px" })}>
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
