"use client";

import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface ActionItem {
    label: string;
    icon?: IconDefinition;
    onClick: () => void;
    variant?: "default" | "danger" | "success" | "warning";
    disabled?: boolean;
    description?: string;
}

interface ActionDropdownProps {
    items: ActionItem[];
    className?: string;
    buttonClassName?:  string;
    dropdownClassName?: string;
    position?: "left" | "right";
    triggerIcon?: IconDefinition;
    size?: "sm" | "md" | "lg";
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({
    items,
    className = "",
    buttonClassName = "",
    dropdownClassName = "",
    position = "left",
    triggerIcon = faEllipsisVertical,
    size = "md",
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Size configurations
    const sizeConfig = {
        sm: {
            button: "w-7 h-7",
            icon: "w-3 h-3",
            dropdown: "min-w-[140px]",
            item: "px-3 py-1.5 text-xs",
            itemIcon: "w-3 h-3",
        },
        md: {
            button: "w-9 h-9",
            icon:  "w-4 h-4",
            dropdown: "min-w-[180px]",
            item: "px-4 py-2. 5 text-sm",
            itemIcon: "w-4 h-4",
        },
        lg: {
            button: "w-11 h-11",
            icon:  "w-5 h-5",
            dropdown: "min-w-[220px]",
            item: "px-5 py-3 text-base",
            itemIcon:  "w-5 h-5",
        },
    };

    const currentSize = sizeConfig[size];

    // Variant styles
    const getVariantStyles = (variant: ActionItem["variant"], isActive: boolean) => {
        const baseStyles = "transition-all duration-200 ease-in-out";
        
        switch (variant) {
            case "danger":
                return `${baseStyles} ${
                    isActive
                        ? "bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-300"
                        :  "text-error-600 hover: bg-error-50 dark:text-error-400 dark:hover:bg-error-500/10"
                }`;
            case "success":
                return `${baseStyles} ${
                    isActive
                        ?  "bg-success-50 text-success-700 dark: bg-success-500/15 dark: text-success-300"
                        :  "text-success-600 hover:bg-success-50 dark:text-success-400 dark: hover:bg-success-500/10"
                }`;
            case "warning": 
                return `${baseStyles} ${
                    isActive
                        ? "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-300"
                        : "text-warning-600 hover:bg-warning-50 dark: text-warning-400 dark:hover: bg-warning-500/10"
                }`;
            default:
                return `${baseStyles} ${
                    isActive
                        ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                        : "text-gray-700 hover: bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
                }`;
        }
    };

    const getIconVariantStyles = (variant: ActionItem["variant"]) => {
        switch (variant) {
            case "danger": 
                return "text-error-500 dark:text-error-400";
            case "success":
                return "text-success-500 dark: text-success-400";
            case "warning":
                return "text-warning-500 dark:text-warning-400";
            default: 
                return "text-gray-400 group-hover:text-brand-500 dark: text-gray-500 dark:group-hover: text-brand-400";
        }
    };

    // Click outside để đóng dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef. current.contains(event.target as Node)) {
                setIsOpen(false);
                setActiveIndex(null);
            }
        };

        const handleEscape = (event:  KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false);
                setActiveIndex(null);
            }
        };

        document. addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    const handleItemClick = (item: ActionItem) => {
        if (! item.disabled) {
            item.onClick();
            setIsOpen(false);
            setActiveIndex(null);
        }
    };

    return (
        <div ref={containerRef} className={`relative inline-block ${className}`}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(! isOpen)}
                className={`
                    group
                    flex items-center justify-center 
                    ${currentSize.button}
                    rounded-xl
                    border border-gray-200 
                    bg-white 
                    text-gray-500 
                    shadow-sm
                    hover: bg-gray-50 
                    hover:text-gray-700 
                    hover:border-gray-300
                    hover:shadow-md
                    focus:outline-none 
                    focus: ring-2 
                    focus:ring-brand-500/30
                    focus:border-brand-400
                    active:scale-95
                    transition-all 
                    duration-200 
                    ease-in-out
                    dark:border-gray-700 
                    dark:bg-gray-800 
                    dark:text-gray-400 
                    dark:hover:bg-gray-700 
                    dark:hover:text-gray-200
                    dark:hover:border-gray-600
                    dark:focus:ring-brand-500/20
                    dark:focus:border-brand-500
                    ${isOpen ? "bg-gray-50 border-gray-300 shadow-md dark:bg-gray-700 dark:border-gray-600" : ""}
                    ${buttonClassName}
                `}
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <FontAwesomeIcon 
                    icon={triggerIcon} 
                    className={`
                        ${currentSize.icon} 
                        transition-transform 
                        duration-200
                        ${isOpen ? "rotate-90" : ""}
                    `} 
                />
            </button>

            {/* Dropdown Menu */}
            <div
                className={`
                    absolute z-50 mt-2
                    ${currentSize.dropdown}
                    rounded-xl 
                    border border-gray-200 
                    bg-white 
                    shadow-xl
                    shadow-gray-200/50
                    backdrop-blur-sm
                    transform
                    transition-all
                    duration-200
                    ease-out
                    origin-top
                    dark:border-gray-700 
                    dark:bg-gray-900/95
                    dark:shadow-gray-900/50
                    ${position === "left" ? "right-0" : "left-0"}
                    ${isOpen 
                        ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" 
                        :  "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                    }
                    ${dropdownClassName}
                `}
            >
                {/* Arrow indicator */}
                <div 
                    className={`
                        absolute -top-2 ${position === "left" ?  "right-3" : "left-3"}
                        w-4 h-4 
                        bg-white 
                        border-l border-t border-gray-200
                        transform rotate-45
                        dark:bg-gray-900
                        dark:border-gray-700
                    `}
                />
                
                {/* Menu Items */}
                <div className="relative py-2 rounded-xl overflow-hidden">
                    {items.map((item, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleItemClick(item)}
                            onMouseEnter={() => setActiveIndex(index)}
                            onMouseLeave={() => setActiveIndex(null)}
                            disabled={item.disabled}
                            className={`
                                group
                                w-full 
                                flex items-center gap-3 
                                ${currentSize.item}
                                text-left 
                                font-medium
                                ${item.disabled
                                    ? "cursor-not-allowed opacity-40"
                                    : getVariantStyles(item.variant, activeIndex === index)
                                }
                            `}
                        >
                            {/* Icon container with background */}
                            {item.icon && (
                                <span 
                                    className={`
                                        flex items-center justify-center
                                        w-8 h-8
                                        rounded-lg
                                        bg-gray-100
                                        transition-all
                                        duration-200
                                        group-hover:scale-110
                                        dark:bg-gray-800
                                        ${item.variant === "danger" ? "bg-error-100 dark:bg-error-500/20" : ""}
                                        ${item.variant === "success" ? "bg-success-100 dark:bg-success-500/20" :  ""}
                                        ${item.variant === "warning" ?  "bg-warning-100 dark:bg-warning-500/20" : ""}
                                    `}
                                >
                                    <FontAwesomeIcon
                                        icon={item.icon}
                                        className={`
                                            ${currentSize. itemIcon}
                                            transition-colors
                                            duration-200
                                            ${getIconVariantStyles(item.variant)}
                                        `}
                                    />
                                </span>
                            )}
                            
                            {/* Label and description */}
                            <div className="flex-1 min-w-0">
                                <span className="block truncate">{item. label}</span>
                                {item.description && (
                                    <span className="block text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                                        {item. description}
                                    </span>
                                )}
                            </div>

                            {/* Hover indicator arrow */}
                            <FontAwesomeIcon
                                icon={faChevronRight}
                                className={`
                                    w-3 h-3
                                    text-gray-300
                                    transition-all
                                    duration-200
                                    dark:text-gray-600
                                    ${activeIndex === index && ! item.disabled
                                        ? "opacity-100 translate-x-0"
                                        : "opacity-0 -translate-x-2"
                                    }
                                `}
                            />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ActionDropdown;