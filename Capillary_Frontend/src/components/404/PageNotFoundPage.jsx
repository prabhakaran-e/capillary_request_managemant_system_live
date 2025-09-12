import React from "react";
import { Home, ArrowLeft } from "lucide-react";

const PageNotFoundPage = () => {
  return (
    <div className="min-h-screen bg-primary/5 flex flex-col items-center justify-center px-6 animate-fade-in">
      <div className="text-center max-w-xl">
        <div className="relative">
          <h1 className="text-9xl font-bold text-primary animate-slide-up hover:scale-105 transition-transform duration-300 cursor-default">
            404
          </h1>
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-primary/10 rounded-full animate-pulse" />
          <div className="absolute -bottom-4 -left-8 w-16 h-16 bg-primary/20 rounded-full animate-bounce delay-300" />
        </div>

        <h2 className="mt-4 text-3xl font-semibold text-gray-800 animate-slide-up delay-150">
          Page not found
        </h2>
        <p className="mt-4 text-lg text-gray-600 animate-slide-up delay-300">
          Sorry, we couldn't find the page you're looking for. Please check the
          URL or return home.
        </p>

        <div className="mt-8 space-y-4 animate-slide-up delay-450">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg 
                     hover:bg-primary/90 hover:scale-105 hover:gap-3 active:scale-95
                     transition-all duration-300 ease-in-out group"
          >
            <Home className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            Back to Home
            <ArrowLeft className="w-0 h-5 opacity-0 group-hover:w-5 group-hover:opacity-100 transition-all duration-300" />
          </a>
        </div>

        <p className="mt-8 text-sm text-black hover:text-primary transition-colors duration-300 cursor-help animate-slide-up delay-600">
          If you believe this is a mistake, please contact our support team.
        </p>
      </div>
    </div>
  );
};

const style = document.createElement("style");
style.textContent = `
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slide-up {
    from { 
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in {
    animation: fade-in 0.5s ease-out forwards;
  }
  
  .animate-slide-up {
    animation: slide-up 0.5s ease-out forwards;
  }
  
  .delay-150 {
    animation-delay: 150ms;
  }
  
  .delay-300 {
    animation-delay: 300ms;
  }
  
  .delay-450 {
    animation-delay: 450ms;
  }
  
  .delay-600 {
    animation-delay: 600ms;
  }
`;
document.head.appendChild(style);

export default PageNotFoundPage;
