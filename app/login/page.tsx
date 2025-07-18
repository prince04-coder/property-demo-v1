"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/ui/footer";

import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Building } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://property-demo-v1-backend.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }
      //store user data in local storage
      localStorage.setItem("user", JSON.stringify(data.user));
      console.log(JSON.stringify(data.user));
      // Store token in local storage
      localStorage.setItem("token", data.token);

      // Check user role
      if (data.user.role === "headoffice") {
        router.push("/dashboard");
        toast({
          title: "Login successfully",
          //  description: "Access restricted to head office only.",
          // variant: "destructive",
        });
      }
      if (data.user.role === "subordinate") {
        router.push("/subordinate-dashboard");
        toast({
          title: "Login successfully",
          //  description: "Access restricted to head office only.",
          // variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex h-[90vh] items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <Building className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl text-center">
              Property Management
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Username</Label>
                  <Input
                    id="email"
                    type="string"
                    placeholder="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {/* <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div> */}
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"} // This toggles between text and password
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10" // Add padding for the eye icon
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)} // Toggle the showPassword state
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500 focus:outline-none"
                      tabIndex={-1} // Prevent tab focus
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        // Show the "hide" icon when password is visible
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                          <line x1="2" x2="22" y1="2" y2="22"></line>
                        </svg>
                      ) : (
                        // Show the "show" icon when password is hidden
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            {/* <p className="text-sm text-muted-foreground">
              Head Office Management System
            </p> */}
          </CardFooter>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
