"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Signup() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 relative py-12 px-4">
            <Link href="/" className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowLeft size={18} />
                Back to Home
            </Link>
            <div className="bg-white text-gray-500 max-w-sm w-full md:p-8 p-6 text-center text-sm rounded-2xl shadow-[0px_0px_20px_0px] shadow-black/5 border border-gray-100">
                <h2 className="text-2xl font-bold mb-2 text-gray-900">Welcome to FixForge</h2>
                <p className="mb-8 text-gray-500">Log in or sign up to automate your bug fixes.</p>
                
                {/* Google Sign In Only */}
                <button type="button" className="w-full flex items-center gap-3 justify-center bg-white border border-gray-300 hover:bg-gray-50 transition-colors py-3 rounded-xl text-gray-800 font-medium cursor-pointer">
                    <img className="h-4 w-4" src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/login/googleFavicon.png" alt="Google" />
                    Continue with Google
                </button>

                <p className="text-center mt-6 text-xs text-gray-400">
                    By continuing, you agree to our <Link href="#" className="underline hover:text-gray-600 transition-colors">Terms of Service</Link> and <Link href="#" className="underline hover:text-gray-600 transition-colors">Privacy Policy</Link>.
                </p>
            </div>
        </div>
    );
}