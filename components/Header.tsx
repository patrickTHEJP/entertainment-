"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "../app/providers";
import { useAuth } from "../hooks/useAuth";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import PetshoppeLogo from "./icons/PetshoppeLogo";
import CartIcon from "./icons/CartIcon";
import ClockIcon from "./icons/ClockIcon";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { user } = useAuth();

  interface AuthUser {
    email: string;
    role: string;
  }
  const typedUser = user as AuthUser | null;

  const linkStyle =
    "text-[#0d1b12] text-sm font-medium leading-normal hover:text-[#4c9a66] transition-colors";
  const activeLinkStyle = "text-[#13ec5b]";

  const isActive = (path: string) => pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#f8fcf9]/80 backdrop-blur-sm border-b-2 border-solid border-b-gray-300">
      <div className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7f3eb] px-4 sm:px-10 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-4 text-[#0d1b12]">
          <PetshoppeLogo width="24" height="24" color="#0d1b12" />
          <h2 className="text-[#0d1b12] text-lg font-bold leading-tight tracking-[-0.015em]">
            Petshoppe
          </h2>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
          <div className="flex items-center">
            <div className="w-24 text-center">
              <Link
                href="/"
                className={`${linkStyle} ${
                  isActive("/") ? activeLinkStyle : ""
                }`}
              >
                Home
              </Link>
            </div>

            {typedUser && (
              <div className="w-24 text-center">
                <Link
                  href="/services"
                  className={`${linkStyle} ${
                    isActive("/services") ? activeLinkStyle : ""
                  }`}
                >
                  Services
                </Link>
              </div>
            )}

            {typedUser && typedUser.role === "ADMIN" && (
              <div className="w-24 text-center">
                <Link
                  href="/admin"
                  className={`${linkStyle} ${
                    isActive("/admin") ? activeLinkStyle : ""
                  }`}
                >
                  Admin
                </Link>
              </div>
            )}

            <div className="w-24 text-center">
              <Link
                href="/products"
                className={`${linkStyle} ${
                  isActive("/products") ? activeLinkStyle : ""
                }`}
              >
                Products
              </Link>
            </div>
          </div>
        </nav>

        {/* Right Side Buttons */}
        <div className="flex items-center gap-2">
          {/* User Auth */}
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#0d1b12] hidden sm:block">
                Welcome, {user.email}
              </span>
              <button
                onClick={async () => {
                  try {
                    await fetch("/api/auth/logout", {
                      method: "POST",
                      credentials: "include",
                    });
                    window.location.reload();
                  } catch (err) {
                    console.error("Logout error:", err);
                  }
                }}
                className="bg-[#0d1b12] text-white text-sm font-medium leading-normal hover:bg-[#4c9a66] transition-colors px-4 py-2 rounded"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="bg-[#13ec5b] text-[#0d1b12] text-sm font-medium leading-normal hover:bg-[#0d1b12] hover:text-white transition-colors mr-2 px-4 py-2 rounded"
              >
                Login
              </button>
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                className="bg-[#0d1b12] text-white text-sm font-medium leading-normal hover:bg-[#4c9a66] hover:text-white transition-colors mr-4 px-4 py-2 rounded"
              >
                Register
              </button>
            </>
          )}

          {/* ORDER HISTORY */}
          {user && (
            <Link
              href="/history"
              className="relative flex max-w-[480px] cursor-pointer items-center justify-center rounded-lg h-10 bg-[#e7f3eb] text-[#0d1b12] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-4 mr-1 overflow-visible"
            >
              <ClockIcon width="20" height="20" color="#0d1b12" />
            </Link>
          )}

          {/* CART ICON */}
          <div className="relative">
            <Link
              href="/checkout"
              className="relative flex max-w-[480px] cursor-pointer items-center justify-center rounded-lg h-10 bg-[#e7f3eb] text-[#0d1b12] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-4 overflow-visible"
            >
              <CartIcon width="20" height="20" color="#0d1b12" />

              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-[#13ec5b] text-xs font-bold text-[#0d1b12]">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-[#e7f3eb] text-[#0d1b12] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-4"
          >
            {isMenuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#f8fcf9] border-b border-solid border-b-[#e7f3eb] py-4 px-10">
          <nav className="flex flex-col items-start gap-4">
            <Link
              href="/"
              className={`${linkStyle} ${isActive("/") ? activeLinkStyle : ""}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>

            {typedUser && (
              <Link
                href="/services"
                className={`${linkStyle} ${
                  isActive("/services") ? activeLinkStyle : ""
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
            )}

            {typedUser && typedUser.role === "ADMIN" && (
              <Link
                href="/admin"
                className={`${linkStyle} ${
                  isActive("/admin") ? activeLinkStyle : ""
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Admin
              </Link>
            )}

            <Link
              href="/products"
              className={`${linkStyle} ${
                isActive("/products") ? activeLinkStyle : ""
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>

            {/* Mobile Auth Buttons */}
            {typedUser ? (
              <div className="flex flex-col gap-2">
                <span className="text-sm text-[#0d1b12]">
                  Welcome, {typedUser.email}
                </span>
                <Link
                  href="/history"
                  className="bg-[#e7f3eb] text-[#0d1b12] text-sm font-medium leading-normal hover:bg-[#4c9a66] hover:text-white transition-colors px-4 py-2 rounded w-full text-center flex items-center justify-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ClockIcon width="16" height="16" color="#0d1b12" />
                  Order History
                </Link>
                <button
                  onClick={async () => {
                    try {
                      await fetch("/api/auth/logout", {
                        method: "POST",
                        credentials: "include",
                      });
                      window.location.reload();
                    } catch (err) {
                      console.error("Logout error:", err);
                    }
                  }}
                  className="bg-[#0d1b12] text-white text-sm font-medium leading-normal hover:bg-[#4c9a66] transition-colors px-4 py-2 rounded w-full text-center"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsLoginModalOpen(true);
                  }}
                  className="bg-[#13ec5b] text-[#0d1b12] text-sm font-medium leading-normal hover:bg-[#0d1b12] hover:text-white transition-colors mr-2 px-4 py-2 rounded w-full text-center"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsRegisterModalOpen(true);
                  }}
                  className="bg-[#0d1b12] text-white text-sm font-medium leading-normal hover:bg-[#4c9a66] hover:text-white transition-colors mr-2 px-4 py-2 rounded w-full text-center"
                >
                  Register
                </button>
              </>
            )}
          </nav>
        </div>
      )}

      {/* Auth Modals */}
      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onSwitchToRegister={() => {
            setIsLoginModalOpen(false);
            setIsRegisterModalOpen(true);
          }}
        />
      )}

      {isRegisterModalOpen && (
        <RegisterModal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          onSwitchToLogin={() => {
            setIsRegisterModalOpen(false);
            setIsLoginModalOpen(true);
          }}
        />
      )}
    </header>
  );
};

export default Header;
