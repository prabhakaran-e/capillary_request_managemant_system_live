import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingOverlay = ({ 
    isVisible = true, 
    message = "Please wait...", 
    subMessage = null,
    showProgress = false,
    progress = 0,
    variant = "default" // "default", "processing", "uploading", "generating"
}) => {
    if (!isVisible) return null;

    const getVariantConfig = (variant) => {
        const configs = {
            default: {
                bgColor: "bg-black bg-opacity-50",
                cardBg: "bg-white",
                iconColor: "text-primary",
                message: "Please wait..."
            },
            processing: {
                bgColor: "bg-blue-900 bg-opacity-60",
                cardBg: "bg-white",
                iconColor: "text-blue-600",
                message: "Processing request..."
            },
            uploading: {
                bgColor: "bg-green-900 bg-opacity-60",
                cardBg: "bg-white",
                iconColor: "text-green-600",
                message: "Uploading file..."
            },
            generating: {
                bgColor: "bg-purple-900 bg-opacity-60",
                cardBg: "bg-white",
                iconColor: "text-purple-600",
                message: "Generating PDF..."
            }
        };
        return configs[variant] || configs.default;
    };

    const config = getVariantConfig(variant);
    const displayMessage = message || config.message;

    return (
        <div 
            className={`fixed inset-0 ${config.bgColor} flex items-center justify-center z-50 backdrop-blur-sm`}
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="loading-message"
        >
            <div className={`${config.cardBg} p-8 rounded-lg shadow-xl flex flex-col items-center max-w-sm mx-4 transform transition-all duration-300 scale-100`}>
                {/* Loading Spinner */}
                <div className="relative mb-4">
                    <Loader2 className={`h-12 w-12 animate-spin ${config.iconColor}`} />
                    {showProgress && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-xs font-bold ${config.iconColor}`}>
                                {Math.round(progress)}%
                            </span>
                        </div>
                    )}
                </div>

                {/* Main Message */}
                <p 
                    id="loading-message"
                    className="text-lg font-semibold text-gray-700 text-center mb-2"
                >
                    {displayMessage}
                </p>

                {/* Sub Message */}
                {subMessage && (
                    <p className="text-sm text-gray-500 text-center mb-4">
                        {subMessage}
                    </p>
                )}

                {/* Progress Bar */}
                {showProgress && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                        <div 
                            className={`${config.iconColor.replace('text-', 'bg-')} h-2 rounded-full transition-all duration-300 ease-out`}
                            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                        />
                    </div>
                )}

                {/* Loading Dots Animation */}
                <div className="flex space-x-1">
                    {[0, 1, 2].map((index) => (
                        <div
                            key={index}
                            className={`w-2 h-2 ${config.iconColor.replace('text-', 'bg-')} rounded-full animate-pulse`}
                            style={{
                                animationDelay: `${index * 0.15}s`,
                                animationDuration: '1s'
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LoadingOverlay;