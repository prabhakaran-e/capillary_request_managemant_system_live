import React from 'react';
import { Package, Send, File } from 'lucide-react';

const SectionNavigation = ({ activeSection, setActiveSection }) => {
    const sections = [
        {
            key: "preview",
            icon: Package,
            label: "Request Preview",
            color: "text-primary hover:bg-primary/10",
            description: "View detailed request information"
        },
        {
            key: "chat",
            icon: Send,
            label: "Discussions",
            color: "text-primary hover:bg-primary/10",
            description: "Comments and discussions"
        },
        {
            key: "logs",
            icon: File,
            label: "Logs",
            color: "text-primary hover:bg-primary/10",
            description: "Approval timeline and history"
        },
    ];

    const handleSectionChange = (sectionKey) => {
        if (activeSection !== sectionKey) {
            setActiveSection(sectionKey);
        }
    };

    return (
        <div className="flex border-b bg-white shadow-sm">
            {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.key;
                
                return (
                    <button
                        key={section.key}
                        onClick={() => handleSectionChange(section.key)}
                        className={`
                            flex-1 p-4 flex items-center justify-center 
                            transition-all duration-300 ease-in-out
                            border-b-2 border-transparent
                            ${isActive 
                                ? "bg-primary/10 border-primary text-primary" 
                                : "hover:bg-gray-100 text-gray-600 hover:text-gray-800"
                            }
                            ${section.color}
                            focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset
                            relative group
                        `}
                        aria-label={`Switch to ${section.label}`}
                        role="tab"
                        aria-selected={isActive}
                    >
                        <div className="flex items-center space-x-2">
                            <Icon 
                                className={`
                                    transition-transform duration-200
                                    ${isActive ? "scale-110" : "group-hover:scale-105"}
                                `} 
                                size={20} 
                            />
                            <span className="font-semibold text-sm md:text-base">
                                {section.label}
                            </span>
                        </div>

                        {/* Active indicator */}
                        {isActive && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary transform scale-x-100 transition-transform duration-200" />
                        )}

                        {/* Tooltip for better UX */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                            {section.description}
                        </div>
                    </button>
                );
            })}
        </div>
    );
};

export default SectionNavigation;