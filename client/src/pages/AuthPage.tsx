import { useState } from "react";
import { useLocation } from "wouter";
import { Infinity as InfinityIcon, Eye, EyeOff, QrCode, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { useLogin, useRegister } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import clsx from "clsx";

type AuthMode = "login" | "register";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const isPending = loginMutation.isPending || registerMutation.isPending;

  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: InsertUser) => {
    try {
      if (mode === "login") {
        await loginMutation.mutateAsync(data);
        toast({ title: "Welcome back", description: "Successfully logged into Persona." });
      } else {
        await registerMutation.mutateAsync(data);
        toast({ title: "Welcome to Persona", description: "Your account has been created." });
      }
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Authentication Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex flex-col items-center justify-center p-4 md:p-6 overflow-hidden relative selection:bg-purple-500/30">
      {/* Top Branding Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md text-center mb-8 z-10"
      >
        <div className="flex items-center justify-center gap-2 mb-2 text-white">
          <h1 className="text-3xl font-display font-bold tracking-widest uppercase">PERSONA</h1>
          <InfinityIcon className="w-8 h-8 text-purple-500" strokeWidth={2.5} />
        </div>
        <p className="text-xs tracking-[0.3em] text-white/50 font-medium mb-12">
          RETHINK . REINVEST . ∞
        </p>

        <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
          Get Early Access
        </h2>
        <p className="text-white/70 text-lg mb-6 max-w-sm mx-auto">
          Persona: Your Advanced Tracking & Performance Hub.
        </p>
        
        <div className="flex items-center justify-center gap-6 text-sm font-medium text-green-500/90">
          <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span> Daily Tracking</span>
          <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span> AI Analysis</span>
        </div>
      </motion.div>
      {/* Main Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-md bg-card/80 backdrop-blur-xl border border-white/10 rounded-[24px] shadow-2xl shadow-purple-900/10 p-6 sm:p-8 z-10 relative overflow-hidden"
      >
        {/* Subtle inner glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>

        {/* Segmented Control */}
        <div className="flex p-1 bg-white/5 rounded-xl mb-8 relative">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={clsx(
              "flex-1 py-2.5 text-sm font-semibold rounded-lg z-10 transition-colors duration-200",
              mode === "login" ? "text-white" : "text-white/50 hover:text-white/80"
            )}
          >
            Persona
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={clsx(
              "flex-1 py-2.5 text-sm font-semibold rounded-lg z-10 transition-colors duration-200",
              mode === "register" ? "text-white" : "text-white/50 hover:text-white/80"
            )}
          >
            Sign Up
          </button>
          <motion.div
            layoutId="activeTab"
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white/10 rounded-lg shadow-sm"
            initial={false}
            animate={{
              left: mode === "login" ? "4px" : "calc(50%)",
            }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {mode === "login" ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white/80 pl-1">Email</label>
                    <input
                      {...form.register("email")}
                      type="email"
                      placeholder="Enter your email"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                      disabled={isPending}
                    />
                    {form.formState.errors.email && (
                      <p className="text-red-400 text-xs pl-1 mt-1">{form.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5 relative">
                    <div className="flex justify-between items-center pl-1 pr-1">
                      <label className="text-sm font-medium text-white/80">Password</label>
                    </div>
                    <div className="relative">
                      <input
                        {...form.register("password")}
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                        disabled={isPending}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {form.formState.errors.password && (
                      <p className="text-red-400 text-xs pl-1 mt-1">{form.formState.errors.password.message}</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 space-y-4">
                  <div className="bg-white p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] transform hover:scale-[1.02] transition-transform duration-300 group cursor-pointer relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <QrCode className="w-32 h-32 text-black relative z-10" strokeWidth={1.5} />
                    
                    <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-black/20"></div>
                    <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-black/20"></div>
                    <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-black/20"></div>
                    <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-black/20"></div>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-semibold text-white">Scan to setup via App</p>
                    <p className="text-xs text-white/40">QR code is valid for 10 minutes</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending || mode === "register"}
              className="w-full bg-primary hover:bg-purple-500 active:bg-purple-700 text-white rounded-xl py-3.5 font-semibold text-[15px] flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-purple-600/20 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Create our persona" : "Scan to Create"} 
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
          
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-white/40 font-bold">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            className="w-full bg-white text-black hover:bg-white/90 rounded-xl py-3.5 font-semibold text-[15px] flex items-center justify-center gap-2 transition-all duration-200 shadow-lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>
          
        {mode === "login" && (
          <div className="mt-4 flex justify-between items-center px-1">
            <span className="text-sm text-green-500 font-medium">Free</span>
            <a href="#" className="text-sm text-white/40 hover:text-white transition-colors">
              Forgot password?
            </a>
          </div>
        )}
      </form>
    </motion.div>
    </div>
  );
}
