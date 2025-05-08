"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

interface NavLinksProps {
  username: string;
}

export default function NavLinks({ username }: NavLinksProps) {
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              href="/"
              className="flex items-center text-xl font-bold text-indigo-600"
            >
              LinkHub
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href={`/${username}`}
              className="text-gray-600 hover:text-gray-900"
              target="_blank"
              rel="noopener noreferrer"
            >
              My Profile
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
