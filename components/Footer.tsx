import React from "react";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#080b16] px-6 py-8 text-center text-gray-300">
      <div className="mb-4 flex justify-center gap-5 text-xl">
        <FaFacebook className="text-cyan-300" />
        <FaInstagram className="text-cyan-300" />
        <FaTwitter className="text-cyan-300" />
      </div>

      <p className="text-sm text-gray-400">
        © 2025 <span className="font-bold text-cyan-300">PixelRent</span>. All
        rights reserved.
      </p>
    </footer>
  );
}