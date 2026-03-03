import { useState } from "react";
import { useLocation } from "wouter";
import {
  Infinity as InfinityIcon,
  ArrowRight,
  Loader2,
  Play,
  Mic,
  QrCode,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { useLogin, useRegister } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import clsx from "clsx";
import { SiLinkedin, SiInstagram, SiWhatsapp } from "react-icons/si";
import peralaLogo from "@/assets/logo.png";

type AuthMode = "login" | "register";

const CARDS = [
  {
    id: 1,
    title: "Networking",
    name: "Collaborate",
    subname: "Connect",
    color: "from-blue-500 to-blue-600",
    bgStack1: "bg-blue-900/40",
    bgStack2: "bg-indigo-900/40",
  },
  {
    id: 2,
    title: "Startup Expo",
    name: "Pitch",
    subname: "Growth",
    color: "from-purple-500 to-purple-600",
    bgStack1: "bg-purple-900/40",
    bgStack2: "bg-fuchsia-900/40",
  },
  {
    id: 3,
    title: "Marketing",
    name: "Exposure",
    subname: "Reach",
    color: "from-emerald-500 to-emerald-600",
    bgStack1: "bg-emerald-900/40",
    bgStack2: "bg-teal-900/40",
  },
  {
    id: 4,
    title: "AI Analysis",
    name: "Insights",
    subname: "Strategy",
    color: "from-orange-500 to-orange-600",
    bgStack1: "bg-orange-900/40",
    bgStack2: "bg-amber-900/40",
  },
  {
    id: 5,
    title: "Persona Hub",
    name: "Digital",
    subname: "Identity",
    color: "from-rose-500 to-rose-600",
    bgStack1: "bg-rose-900/40",
    bgStack2: "bg-rose-900/40",
  },
];

interface SwipeCardProps {
  card: {
    title: string;
    name: string;
    subname: string;
    color: string;
    bgStack1: string;
    bgStack2: string;
  };
  currentIndex: number;
  totalCards: number;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

const SwipeCardContent = ({
  card,
  currentIndex,
  onSwipeLeft,
  onSwipeRight,
}: SwipeCardProps) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  return (
    <motion.div
      key={currentIndex}
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={(_, info) => {
        if (info.offset.x < -80) onSwipeLeft();
        else if (info.offset.x > 80) onSwipeRight();
      }}
      initial={{ scale: 0.9, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{
        x: x.get() < 0 ? -400 : 400,
        opacity: 0,
        scale: 0.5,
        rotate: x.get() < 0 ? -45 : 45,
        transition: { duration: 0.4, ease: "easeIn" },
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 0.8,
      }}
      className={clsx(
        "absolute inset-0 bg-gradient-to-b rounded-[24px] p-4 shadow-2xl cursor-grab active:cursor-grabbing overflow-hidden group transition-colors duration-500",
        card.color,
      )}
    >
      {/* Card Content mimicking the image */}
      <div className="flex flex-col h-full items-center justify-between relative z-10">
        <div className="flex items-center gap-1.5">
          <span className="text-white/90 text-[9px] font-bold tracking-[0.2em] uppercase">
            {card.title}
          </span>
          <Mic className="w-3.5 h-3.5 text-white/90" />
        </div>

        <div className="text-center space-y-0.5">
          <h3 className="text-white text-2xl font-bold leading-tight">
            {card.name}
          </h3>
          <h3 className="text-white text-2xl font-bold leading-tight">
            {card.subname}
          </h3>
        </div>

        <div className="w-full">
          <button
            type="button"
            className="w-full bg-white text-black rounded-full py-3 flex items-center justify-center gap-2 font-bold shadow-xl hover:scale-105 transition-transform text-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Play Now
          </button>
        </div>
      </div>

      {/* Decorative circle from image */}
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
    </motion.div>
  );
};

const SwipeCard = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipeLeft = () => {
    setCurrentIndex((prev) => (prev + 1) % CARDS.length);
  };

  const handleSwipeRight = () => {
    setCurrentIndex((prev) => (prev - 1 + CARDS.length) % CARDS.length);
  };

  // Get the cards for the stack: current, next, and next-next
  const currentCard = CARDS[currentIndex];
  const nextCard = CARDS[(currentIndex + 1) % CARDS.length];
  const nextNextCard = CARDS[(currentIndex + 2) % CARDS.length];

  return (
    <div className="relative w-full max-w-[240px] aspect-[3/4] mx-auto perspective-1000">
      {/* Background stack effect - fixed positions */}
      <div
        key={`stack2-${(currentIndex + 2) % CARDS.length}`}
        className={clsx(
          "absolute inset-0 translate-y-4 translate-x-2 rounded-[24px] -z-20 transition-all duration-700 opacity-40 scale-95",
          nextNextCard.bgStack2,
        )}
      />
      <div
        key={`stack1-${(currentIndex + 1) % CARDS.length}`}
        className={clsx(
          "absolute inset-0 translate-y-2 translate-x-1 rounded-[24px] -z-10 transition-all duration-700 opacity-70 scale-[0.98]",
          nextCard.bgStack1,
        )}
      />

      <AnimatePresence mode="popLayout" initial={false}>
        <SwipeCardContent
          key={currentIndex}
          card={currentCard}
          currentIndex={currentIndex}
          totalCards={CARDS.length}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
        />
      </AnimatePresence>
    </div>
  );
};

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [mode, setMode] = useState<AuthMode>("login");

  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        toast({
          title: "Welcome back",
          description: "Successfully logged into Persona.",
        });
      } else {
        await registerMutation.mutateAsync(data);
        toast({
          title: "Welcome to Persona",
          description: "Your account has been created.",
        });
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
    <div className="min-h-screen bg-[#050505] overflow-hidden relative">
      {/* Menu Background Layer */}
      <div className="absolute inset-0 flex flex-col justify-end items-end p-12 pb-20 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isMenuOpen ? 1 : 0, y: isMenuOpen ? 0 : 20 }}
          className="text-right space-y-4 max-w-[240px] pointer-events-auto"
        >
          <p className="text-white/40 text-[10px] leading-relaxed uppercase tracking-widest text-center">
            copyright : persona UI/UX is inspired by
          </p>

          <div className="space-y-3">
            <a
              href="https://perala.in"
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <img
                src={peralaLogo}
                alt="Perala"
                className="w-full h-auto opacity-80 group-hover:opacity-100 transition-opacity rounded-lg"
              />
            </a>
          </div>
        </motion.div>
      </div>
      {/* Main Content Layer */}
      <motion.div
        animate={{
          x: isMenuOpen ? "-80%" : "0%",
          scale: isMenuOpen ? 0.9 : 1,
          borderRadius: isMenuOpen ? "40px" : "0px",
        }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        onClick={() => isMenuOpen && setIsMenuOpen(false)}
        className={clsx(
          "min-h-screen bg-mesh flex flex-col items-center justify-center p-4 shadow-2xl relative z-20",
          isMenuOpen ? "cursor-pointer select-none" : "",
        )}
      >
        <div
          className="absolute inset-0 bg-black/20 pointer-events-none opacity-0 transition-opacity duration-500"
          style={{ opacity: isMenuOpen ? 1 : 0 }}
        ></div>
        {/* Menu Toggle Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="absolute top-8 right-8 z-50 p-2 group"
        >
          {isMenuOpen ? (
            <div className="text-white/80 hover:text-white transition-colors">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 items-end">
              <div className="w-8 h-1 bg-white rounded-full transition-all group-hover:w-6"></div>
              <div className="w-5 h-1 bg-white rounded-full transition-all group-hover:w-8"></div>
            </div>
          )}
        </button>

        {/* Floating Action Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 transition-all hover:shadow-[0_8px_30px_rgb(255,255,255,0.2)]"
        >
          <QrCode className="w-6 h-6 text-black" strokeWidth={2.5} />
        </motion.button>

        {/* Top Branding Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md text-center mb-6 z-10"
        >
          <div className="flex items-center justify-center gap-2 mb-1 text-white">
            <h1 className="text-2xl font-display font-bold tracking-widest uppercase">
              PERSONA
            </h1>
          </div>
          <p className="text-[10px] tracking-[0.3em] text-white/50 font-medium mb-6 flex items-center justify-center gap-2">
            CONNECT . COLLABORATE . EXPOSE
            <InfinityIcon
              className="w-3.5 h-3.5 text-purple-500/50"
              strokeWidth={2.5}
            />
          </p>

          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
            Networking & Exposure
          </h2>
          <p className="text-white/70 text-base mb-4 max-w-sm mx-auto">
            Persona: Your Digital Identity & Collaboration Hub.
          </p>

          <div className="flex items-center justify-center gap-4 text-xs font-medium text-green-500/90">
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>{" "}
              Smart Networking
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>{" "}
              Startup Exposure
            </span>
          </div>
        </motion.div>
        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md bg-card border border-white/10 rounded-[20px] shadow-2xl shadow-purple-900/10 p-5 sm:p-6 z-10 relative overflow-hidden"
        >
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

          {/* Tab Switcher */}
          <div className="flex p-1 bg-white/10 rounded-lg mb-6 relative">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={clsx(
                "flex-1 py-2 text-sm font-semibold rounded-md z-10 transition-colors duration-200",
                mode === "login"
                  ? "text-white"
                  : "text-white/50 hover:text-white/80",
              )}
            >
              Persona
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={clsx(
                "flex-1 py-2 text-sm font-semibold rounded-md z-10 transition-colors duration-200",
                mode === "register"
                  ? "text-white"
                  : "text-white/50 hover:text-white/80",
              )}
            >
              Mini-Cards
            </button>
            <motion.div
              layoutId="activeTab"
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white/20 rounded-md shadow-sm"
              initial={false}
              animate={{
                left: mode === "login" ? "4px" : "calc(50%)",
              }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          </div>

          {/* Form */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                {mode === "login" ? (
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <div className="flex flex-col items-center text-center space-y-4 py-2">
                      {/* Persona Identity Section */}
                      <div className="space-y-1">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-blue-400 mx-auto flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-purple-500/20">
                          R
                        </div>
                        <h3 className="text-xl font-bold text-white tracking-tight">
                          Networking Profile
                        </h3>
                        <p className="text-white/40 text-xs">
                          Collaborate & Grow your Startup
                        </p>
                      </div>

                      {/* Social/Business Links Row */}
                      <div className="flex items-center justify-center gap-3 w-full pt-1">
                        <button
                          type="button"
                          className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 hover:text-white transition-all duration-200 group"
                          title="LinkedIn"
                        >
                          <SiLinkedin className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 hover:text-white transition-all duration-200"
                          title="Instagram"
                        >
                          <SiInstagram className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 hover:text-white transition-all duration-200"
                          title="WhatsApp"
                        >
                          <SiWhatsapp className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="pt-1">
                      <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-primary hover:bg-purple-500 active:bg-purple-700 text-white rounded-lg py-3 font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-purple-600/20 disabled:opacity-50 disabled:cursor-not-allowed group"
                      >
                        {isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            View Collaboration Portal
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="py-2">
                      <SwipeCard />
                      <div className="text-center mt-4 space-y-0.5">
                        <p className="text-xs font-semibold text-white">
                          Swipe to explore
                        </p>
                        <p className="text-[10px] text-white/40">
                          Left to back • Right to next
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10"></span>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-card px-2 text-white/40 font-bold">
                  FREE
                </span>
              </div>
            </div>

            <button
              type="button"
              className="w-full bg-white text-black hover:bg-white/90 rounded-lg py-3 font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-lg"
            >
              Create your persona
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
