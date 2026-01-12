"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = () => {
    switch (error) {
      case "AccessDenied":
        return "Your email domain is not authorized. Only @purevpn.com, @puresquare.com, and @disrupt.com emails are allowed.";
      case "CredentialsSignin":
        return "Invalid username or password. Please try again.";
      case "Configuration":
        return "There is a problem with the server configuration.";
      case "Verification":
        return "The verification token has expired or has already been used.";
      default:
        return "An authentication error occurred. Please try again.";
    }
  };

  return (
    <div 
      className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `url('https://assets.science.nasa.gov/content/dam/science/missions/hubble/nebulae/emission/STScI-01EVT1JXFVNW9X54XA378CCK1P.png/jcr:content/renditions/1024x361.png')`,
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" />
      
      <div className="relative z-10 text-center space-y-6 px-4 max-w-md">
        <div className="flex justify-center">
          <AlertCircle className="h-16 w-16 text-red-400" />
        </div>
        <h1 className="text-3xl font-bold text-white">Authentication Error</h1>
        <p className="text-white/90 text-lg">
          {getErrorMessage()}
        </p>
        <Link href="/auth/signin">
          <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
            Try Again
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: `url('https://assets.science.nasa.gov/content/dam/science/missions/hubble/nebulae/emission/STScI-01EVT1JXFVNW9X54XA378CCK1P.png/jcr:content/renditions/1024x361.png')` }}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" />
        <div className="relative z-10 text-center space-y-6 px-4 max-w-md">
          <div className="flex justify-center"><AlertCircle className="h-16 w-16 text-red-400" /></div>
          <h1 className="text-3xl font-bold text-white">Loading...</h1>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
