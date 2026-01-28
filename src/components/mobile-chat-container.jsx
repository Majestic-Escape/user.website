"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Mobile-optimized chat container that handles virtual keyboard properly.
 * Uses a simpler approach that works reliably across iOS and Android.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.className - Additional CSS classes
 * @param {function} props.onKeyboardChange - Callback when keyboard state changes (open: boolean)
 */
export default function MobileChatContainer({ 
  children, 
  className = "",
  onKeyboardChange,
}) {
  const containerRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState("100%");
  const initialViewportHeight = useRef(null);
  const isKeyboardOpenRef = useRef(false);
  const inputFocusedRef = useRef(false);
  const onKeyboardChangeRef = useRef(onKeyboardChange);

  // Keep callback ref updated without triggering effect re-run
  useEffect(() => {
    onKeyboardChangeRef.current = onKeyboardChange;
  }, [onKeyboardChange]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if mobile
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    // Store initial viewport height only once
    if (initialViewportHeight.current === null) {
      initialViewportHeight.current = window.visualViewport?.height || window.innerHeight;
    }

    // Function to update container height based on visual viewport
    const updateContainerHeight = () => {
      if (window.visualViewport) {
        // Use visualViewport height which accounts for keyboard
        const height = window.visualViewport.height;
        setContainerHeight(`${height}px`);
        
        // Also update CSS custom property for other elements to use
        document.documentElement.style.setProperty('--mobile-vh', `${height}px`);

        // Detect keyboard state
        const heightDiff = initialViewportHeight.current - height;
        const keyboardNowOpen = heightDiff > 150;
        const wasKeyboardOpen = isKeyboardOpenRef.current;

        if (keyboardNowOpen !== wasKeyboardOpen) {
          isKeyboardOpenRef.current = keyboardNowOpen;
          // Notify parent of keyboard state change
          onKeyboardChangeRef.current?.(keyboardNowOpen);
        }
      } else {
        // Fallback to window.innerHeight
        setContainerHeight(`${window.innerHeight}px`);
      }
    };

    // Backup: Use focus/blur events for keyboard detection
    const handleFocusIn = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        inputFocusedRef.current = true;
        setTimeout(() => {
          if (inputFocusedRef.current && !isKeyboardOpenRef.current) {
            isKeyboardOpenRef.current = true;
            onKeyboardChangeRef.current?.(true);
          }
        }, 300);
      }
    };

    const handleFocusOut = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        inputFocusedRef.current = false;
        setTimeout(() => {
          if (!inputFocusedRef.current && isKeyboardOpenRef.current) {
            isKeyboardOpenRef.current = false;
            onKeyboardChangeRef.current?.(false);
          }
        }, 300);
      }
    };

    // Initial height
    updateContainerHeight();

    // Listen for viewport changes (keyboard open/close)
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", updateContainerHeight);
      window.visualViewport.addEventListener("scroll", updateContainerHeight);
    }
    
    // Also listen for window resize as fallback
    window.addEventListener("resize", updateContainerHeight);
    
    // Focus/blur listeners
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);

    // Lock body scroll
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.overflow = "hidden";

    return () => {
      // Cleanup listeners
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", updateContainerHeight);
        window.visualViewport.removeEventListener("scroll", updateContainerHeight);
      }
      window.removeEventListener("resize", updateContainerHeight);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);

      // Restore body scroll
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, []); // Empty dependency array - only run once on mount

  return (
    <div
      ref={containerRef}
      className={`flex flex-col bg-white ${className}`}
      style={{
        height: containerHeight,
        maxHeight: containerHeight,
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
      }}
    >
      {children}
    </div>
  );
}
