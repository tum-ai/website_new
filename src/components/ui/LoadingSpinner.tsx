interface LoadingSpinnerProps {
  text?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function LoadingSpinner({ 
  text = "Loading...", 
  size = "md",
  className = "" 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: {
      spinner: "w-4 h-4 border",
      text: "text-sm",
      logo: "h-8"
    },
    md: {
      spinner: "w-6 h-6 border-2",
      text: "text-base",
      logo: "h-12"
    },
    lg: {
      spinner: "w-8 h-8 border-2",
      text: "text-lg",
      logo: "h-16"
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      {/* TUM-AI Logo - only show for md and lg sizes */}
      {size !== "sm" && (
        <div className="mb-6">
          <img 
            src="/assets/logo_new_white_standard.png" 
            alt="TUM-AI Logo" 
            className={`${currentSize.logo} w-auto opacity-90`}
          />
        </div>
      )}
      
      {/* Loading Text and Spinner */}
      <div className="flex items-center space-x-3">
        <span className={`${currentSize.text} font-medium text-white`}>{text}</span>
        
        {/* Animated Loading Circle */}
        <div className="relative">
          <div className={`${currentSize.spinner} border-white/30 rounded-full`}></div>
          <div className={`absolute top-0 left-0 ${currentSize.spinner} border-white border-t-transparent rounded-full animate-spin`}></div>
        </div>
      </div>
    </div>
  );
}
