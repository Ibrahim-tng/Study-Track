"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [displayChildren, setDisplayChildren] = useState(children);
    const [transitionStage, setTransitionStage] = useState("fade-in");

    useEffect(() => {
        setTransitionStage("fade-out");
        const timer = setTimeout(() => {
            setDisplayChildren(children);
            setTransitionStage("fade-in");
        }, 200); // Durée de la transition out
        return () => clearTimeout(timer);
    }, [pathname, children]);

    return (
        <div
            className={`transition-all duration-300 transform ${transitionStage === "fade-in"
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
        >
            {displayChildren}
        </div>
    );
}
