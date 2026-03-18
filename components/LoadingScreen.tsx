export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-blue-600 px-4">
      <div className="text-center">
        {/* Spinner animé */}
        <div className="flex justify-center mb-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-white opacity-30"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin"></div>
          </div>
        </div>

        {/* Texte */}
        <h2 className="text-white text-xl font-semibold mb-2">
          StudyTrack
        </h2>
        <p className="text-white text-opacity-75 text-sm">
          Préparation de votre espace d&apos;étude...
        </p>

        {/* Points animés */}
        <div className="flex justify-center gap-1 mt-6">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
        </div>
      </div>
    </div>
  );
}
