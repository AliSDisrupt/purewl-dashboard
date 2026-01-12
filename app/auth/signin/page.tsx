"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TypingEffect } from "@/components/auth/TypingEffect";
import { Chrome, Lock, User as UserIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SignInPage() {
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTypingComplete(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleLocalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid username or password");
      } else if (result?.ok) {
        window.location.href = "/";
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `url('https://assets.science.nasa.gov/content/dam/science/missions/hubble/nebulae/emission/STScI-01EVT1JXFVNW9X54XA378CCK1P.png/jcr:content/renditions/1024x361.png')`,
      }}
    >
      {/* Overlay - reduced blur for clearer background */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Content */}
      <div className="relative z-10 text-center space-y-8 px-4 max-w-2xl w-full">
        {/* Typing Effect */}
        <div className="min-h-[120px] flex items-center justify-center">
          <TypingEffect text="Welcome to Orion" speed={100} />
        </div>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-white/90 font-light">
          Analytics Dashboard
        </p>

        {/* Login Options */}
        <div 
          className={`transition-all duration-1000 ${
            isTypingComplete 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-4"
          }`}
        >
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl">Sign In</CardTitle>
              <CardDescription>
                Choose your preferred sign-in method
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="google" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="google">
                    <Chrome className="h-4 w-4 mr-2" />
                    Google
                  </TabsTrigger>
                  <TabsTrigger value="local">
                    <Lock className="h-4 w-4 mr-2" />
                    Local
                  </TabsTrigger>
                </TabsList>

                {/* Google OAuth Tab */}
                <TabsContent value="google" className="space-y-4 mt-6">
                  <Button
                    onClick={() => signIn("google", { callbackUrl: "/" })}
                    size="lg"
                    className="w-full bg-white text-gray-900 hover:bg-gray-100 border-2 border-gray-200"
                  >
                    <Chrome className="mr-3 h-5 w-5" />
                    Sign in with Google
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Access restricted to @purevpn.com, @puresquare.com, and @disrupt.com
                  </p>
                </TabsContent>

                {/* Local Login Tab */}
                <TabsContent value="local" className="space-y-4 mt-6">
                  <form onSubmit={handleLocalLogin} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="username" className="text-sm font-medium text-left block">
                        Username
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="username"
                          type="text"
                          placeholder="Enter username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="pl-10"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-medium text-left block">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Sign In
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
