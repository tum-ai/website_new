interface LoadingScreenProps {
  text?: string;
  className?: string;
}

export default function LoadingScreen({
  text = "Loading",
  className = "",
}: LoadingScreenProps) {
  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900 text-white ${className}`}
    >
      {/* TUM-AI Logo */}
      <div className="mb-8">
        <img
          src="/assets/logo_new_white_standard.png"
          alt="TUM-AI Logo"
          className="h-16 w-auto opacity-90"
        />
      </div>

      {/* Loading Text and Spinner */}
      <div className="flex items-center space-x-3">
        <span className="text-lg font-medium">{text}</span>

        {/* Animated Loading Circle */}
        <div className="relative">
          <div className="w-6 h-6 border-2 border-white/30 rounded-full"></div>
          <div className="absolute top-0 left-0 w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}
