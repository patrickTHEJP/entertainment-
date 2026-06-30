"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Create portal to render modal at document body level
  if (typeof document !== "undefined") {
    return createPortal(
      <div
        className="fixed inset-0 z-[999] bg-black/30 backdrop-blur-[2px] flex items-center justify-center p-4"
        onClick={onClose}
        style={{ pointerEvents: isOpen ? "auto" : "none" }}
      >
        <div
          className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {title && (
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            </div>
          )}
          <div className="p-6">{children}</div>
        </div>
      </div>,
      document.body
    );
  }

  return null;
};

export default Modal;
