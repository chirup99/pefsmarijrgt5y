import { QRCodeSVG } from "qrcode.react";
import * as htmlToImage from "html-to-image";
import { BrowserMultiFormatReader } from "@zxing/library";

// ... existing imports
import { useState, useMemo, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import {
  Infinity as InfinityIcon,
  ArrowRight,
  Loader2,
  Play,
  Mic,
  QrCode,
  Instagram,
  Linkedin,
  MessageCircle,
  Globe,
  Save,
  Check,
  ChevronDown,
  Plus,
  X,
  Trash2,
  TrendingUp,
  Video,
  Package,
  FileText,
  User,
  Pencil,
  Palette,
  Layout,
  Mail,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  insertUserSchema,
  type InsertUser,
  type CardData,
} from "@shared/schema";
import { useLogin, useRegister, useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import clsx from "clsx";
import { SiInstagram, SiWhatsapp } from "react-icons/si";
import peralaLogo from "@/assets/logo.png";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

type AuthMode = "login" | "register" | "customize" | "swipe";

const CARD_TYPES = [
  {
    type: "pitch",
    label: "Elevated Pitch",
    icon: FileText,
    color: "from-blue-500 to-blue-600",
  },
  {
    type: "reel",
    label: "Reel / Short",
    icon: Video,
    color: "from-purple-500 to-purple-600",
  },
  {
    type: "revenue",
    label: "Revenue / Sales",
    icon: TrendingUp,
    color: "from-emerald-500 to-emerald-600",
  },
  {
    type: "product",
    label: "Product Show",
    icon: Package,
    color: "from-orange-500 to-orange-600",
  },
];

const ROLES = [
  { value: "founder", label: "Founder" },
  { value: "co-founder", label: "Co-Founder" },
  { value: "ceo", label: "CEO" },
  { value: "cto", label: "CTO" },
  { value: "cmo", label: "CMO" },
  { value: "coo", label: "COO" },
  { value: "cfo", label: "CFO" },
  { value: "director", label: "Director" },
  { value: "investor", label: "Investor" },
  { value: "vc", label: "VC (Venture Capitalist)" },
  { value: "angel-investor", label: "Angel Investor" },
  { value: "advisor", label: "Advisor" },
  { value: "consultant", label: "Consultant" },
  { value: "lawyer", label: "Lawyer" },
  { value: "mentor", label: "Mentor" },
  { value: "product-manager", label: "Product Manager" },
  { value: "software-engineer", label: "Software Engineer" },
  { value: "designer", label: "UI/UX Designer" },
  { value: "marketing-specialist", label: "Marketing Specialist" },
  { value: "sales-executive", label: "Sales Executive" },
  { value: "hr-manager", label: "HR Manager" },
  { value: "student", label: "Student" },
  { value: "intern", label: "Intern" },
  { value: "employee", label: "Employee" },
  { value: "startup-enthusiast", label: "Startup Enthusiast" },
  { value: "business-owner", label: "Business Owner" },
  { value: "freelancer", label: "Freelancer" },
  { value: "other", label: "Other" },
];

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
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
    </motion.div>
  );
};

const SwipeCard = ({ cards }: { cards: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipeLeft = () => {
    setCurrentIndex((prev) => (prev + 1) % (cards.length || CARDS.length));
  };

  const handleSwipeRight = () => {
    setCurrentIndex(
      (prev) =>
        (prev - 1 + (cards.length || CARDS.length)) %
        (cards.length || CARDS.length),
    );
  };

  const displayCards =
    cards.length > 0
      ? cards.map((c) => {
          try {
            const card = JSON.parse(c);
            const typeInfo = CARD_TYPES.find((t) => t.type === card.type);
            return {
              title: card.title,
              name: card.type.toUpperCase(),
              subname: card.value || card.url || "Persona",
              color: typeInfo?.color || "from-gray-700 to-gray-800",
              bgStack1: "bg-black/20",
              bgStack2: "bg-black/10",
            };
          } catch (e) {
            return CARDS[0];
          }
        })
      : CARDS;

  const currentCard = displayCards[currentIndex];
  const nextCard = displayCards[(currentIndex + 1) % displayCards.length];
  const nextNextCard = displayCards[(currentIndex + 2) % displayCards.length];

  return (
    <div className="relative w-full max-w-[240px] aspect-[3/4] mx-auto perspective-1000">
      <div
        key={`stack2-${(currentIndex + 2) % displayCards.length}`}
        className={clsx(
          "absolute inset-0 translate-y-4 translate-x-2 rounded-[24px] -z-20 transition-all duration-700 opacity-40 scale-95",
          nextNextCard.bgStack2,
        )}
      />
      <div
        key={`stack1-${(currentIndex + 1) % displayCards.length}`}
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
          totalCards={displayCards.length}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
        />
      </AnimatePresence>
    </div>
  );
};

const MiniCard = ({
  idx,
  cardJson,
  onUpdate,
  onDelete,
}: {
  idx: number;
  cardJson?: string;
  onUpdate: (json: string) => void;
  onDelete: () => void;
}) => {
  const card: CardData | null = useMemo(() => {
    try {
      return cardJson ? JSON.parse(cardJson) : null;
    } catch (e) {
      return null;
    }
  }, [cardJson]);

  const [isEditing, setIsEditing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!card) return null;

  const handleSpeak = async (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find(
        (v) => v.name.includes("Google") && v.lang.startsWith("en"),
      ) ||
      voices.find((v) => v.lang.startsWith("en-GB")) ||
      voices.find((v) => v.lang.startsWith("en-US"));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.pitch = 1;
    utterance.rate = 0.9;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const cardTypeInfo = CARD_TYPES.find((t) => t.type === card.type);

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    const ytMatch = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:shorts\/|watch\?v=|v\/|embed\/))([\w-]{11})/,
    );
    if (ytMatch)
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&loop=1&playlist=${ytMatch[1]}`;
    const igMatch = url.match(
      /(?:instagram\.com\/(?:reels|reel|p)\/)([\w-]{11})/,
    );
    if (igMatch) return `https://www.instagram.com/reel/${igMatch[1]}/embed`;
    return null;
  };

  const embedUrl = card.type === "reel" ? getEmbedUrl((card as any).url) : null;

  return (
    <motion.div
      layoutId={`card-${idx}`}
      className={clsx(
        "h-full rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-xl bg-gradient-to-b",
        isPlaying && card.type === "reel" ? "p-0" : "p-4",
        cardTypeInfo?.color || "from-gray-700 to-gray-800",
      )}
    >
      {(!isPlaying || card.type !== "reel") && (
        <button
          type="button"
          onClick={onDelete}
          className="absolute top-2 right-2 p-1 bg-black/20 rounded-full text-white/60 hover:text-white transition-colors z-20"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {(!isPlaying || card.type !== "reel") && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">
            {card.type}
          </p>
          <h5 className="text-white font-bold text-lg leading-tight">
            {card.title}
          </h5>
        </div>
      )}

      <div
        className={clsx(
          "flex-1 flex items-center justify-center relative",
          isPlaying && card.type === "reel" ? "w-full h-full" : "",
        )}
      >
        {isEditing ? (
          <div className="w-full space-y-2 bg-black/40 p-3 rounded-xl backdrop-blur-sm z-10">
            <input
              className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white"
              placeholder="Title"
              defaultValue={card.title}
              onBlur={(e) => {
                onUpdate(JSON.stringify({ ...card, title: e.target.value }));
              }}
            />
            {card.type === "pitch" && (
              <textarea
                className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white h-20"
                placeholder="Pitch content"
                defaultValue={(card as any).content}
                onBlur={(e) => {
                  onUpdate(
                    JSON.stringify({ ...card, content: e.target.value }),
                  );
                }}
              />
            )}
            {card.type === "reel" && (
              <input
                className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white"
                placeholder="Reel/Short URL"
                defaultValue={(card as any).url}
                onBlur={(e) => {
                  onUpdate(JSON.stringify({ ...card, url: e.target.value }));
                }}
              />
            )}
            {card.type === "revenue" && (
              <div className="space-y-1">
                <input
                  className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white"
                  placeholder="Value (e.g. $10k)"
                  defaultValue={(card as any).value}
                  onBlur={(e) => {
                    onUpdate(
                      JSON.stringify({ ...card, value: e.target.value }),
                    );
                  }}
                />
                <input
                  className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-[10px] text-white"
                  placeholder="Image URL"
                  defaultValue={(card as any).imageUrl}
                  onBlur={(e) => {
                    onUpdate(
                      JSON.stringify({ ...card, imageUrl: e.target.value }),
                    );
                  }}
                />
              </div>
            )}
            {card.type === "product" && (
              <div className="space-y-1">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id={`product-image-${idx}`}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        onUpdate(
                          JSON.stringify({
                            ...card,
                            imageUrl: reader.result as string,
                          }),
                        );
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById(`product-image-${idx}`)?.click()
                  }
                  className="w-full bg-white/10 border border-white/20 rounded px-2 py-2 text-[10px] text-white flex items-center justify-center gap-2 hover:bg-white/20"
                >
                  <Plus className="w-3 h-3" />{" "}
                  {(card as any).imageUrl ? "Change Image" : "Upload Image"}
                </button>
                {(card as any).imageUrl && (
                  <div className="relative w-full aspect-video rounded overflow-hidden border border-white/10">
                    <img
                      src={(card as any).imageUrl}
                      className="w-full h-full object-cover"
                      alt="Product"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        onUpdate(JSON.stringify({ ...card, imageUrl: "" }))
                      }
                      className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="w-full bg-white text-black py-1 rounded text-[10px] font-bold"
            >
              Done
            </button>
          </div>
        ) : card.type === "reel" && isPlaying ? (
          <div className="w-full h-full relative group">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="text-white text-xs p-4 text-center">
                Invalid Video URL
              </div>
            )}
            <button
              onClick={() => setIsPlaying(false)}
              className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-30"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : card.type === "pitch" ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-2 overflow-hidden">
            <div className="w-full h-full overflow-y-auto custom-scrollbar flex items-center">
              <p
                onClick={() => setIsEditing(true)}
                className="text-white/90 text-sm text-center italic leading-relaxed cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors w-full"
              >
                "{(card as any).content || "No pitch content yet..."}"
              </p>
            </div>
          </div>
        ) : card.type === "product" ? (
          <div className="w-full h-full flex items-center justify-center p-2">
            {(card as any).imageUrl ? (
              <img
                src={(card as any).imageUrl}
                alt={card.title}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setIsEditing(true)}
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all group"
              >
                <Plus className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              </button>
            )}
          </div>
        ) : card.type === "revenue" && isPlaying ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-2">
            <div className="w-full h-24 relative overflow-visible">
              <svg
                className="w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <motion.path
                  d="M 10 90 L 90 10"
                  fill="none"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
                <motion.circle
                  cx="90"
                  cy="10"
                  r="5"
                  fill="white"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.5, duration: 0.3 }}
                />
              </svg>
              <motion.div
                className="absolute -top-2 right-0 text-white font-bold text-xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
              >
                {(card as any).value}
              </motion.div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all group"
          >
            <Plus className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          </button>
        )}
      </div>

      <div className="pt-2">
        {card.type === "reel" ? (
          <button className="w-full bg-white text-black rounded-full py-2 text-xs font-bold flex items-center justify-center gap-2">
            <Play className="w-3 h-3 fill-current" /> Play Now
          </button>
        ) : card.type === "pitch" ? (
          <button
            onClick={() => handleSpeak((card as any).content || "")}
            className={clsx(
              "w-full rounded-full py-2 text-xs font-bold flex items-center justify-center gap-2 transition-colors",
              isSpeaking ? "bg-red-500 text-white" : "bg-white text-black",
            )}
          >
            {isSpeaking ? (
              <>
                <X className="w-3 h-3" /> Stop Pitch
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" /> Play Pitch
              </>
            )}
          </button>
        ) : card.type === "revenue" ? (
          <div className="space-y-2">
            {!isPlaying && (
              <div className="text-white font-bold text-xl">
                {(card as any).value}
              </div>
            )}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-full bg-white text-black rounded-full py-2 text-xs font-bold flex items-center justify-center gap-2"
            >
              <Play className="w-3 h-3 fill-current" />{" "}
              {isPlaying ? "Reset" : "Play Projection"}
            </button>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
};

const CustomSwipeCard = ({ cards }: { cards: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipeLeft = () => {
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handleSwipeRight = () => {
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const parsedCards = useMemo(() => {
    return cards
      .map((c) => {
        try {
          const card = JSON.parse(c);
          const typeInfo = CARD_TYPES.find((t) => t.type === card.type);
          return {
            title: card.title,
            name: card.type.toUpperCase(),
            subname: card.value || card.url || "Persona",
            color: typeInfo?.color || "from-gray-700 to-gray-800",
            bgStack1: "bg-black/20",
            bgStack2: "bg-black/10",
          };
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);
  }, [cards]);

  if (parsedCards.length === 0) return null;

  const currentCard = parsedCards[currentIndex]!;
  const nextCard = parsedCards[(currentIndex + 1) % parsedCards.length]!;
  const nextNextCard = parsedCards[(currentIndex + 2) % parsedCards.length]!;

  return (
    <div className="relative w-full max-w-[240px] aspect-[3/4] mx-auto perspective-1000">
      <div
        key={`stack2-${(currentIndex + 2) % parsedCards.length}`}
        className={clsx(
          "absolute inset-0 translate-y-4 translate-x-2 rounded-[24px] -z-20 transition-all duration-700 opacity-40 scale-95",
          nextNextCard.bgStack2,
        )}
      />
      <div
        key={`stack1-${(currentIndex + 1) % parsedCards.length}`}
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
          totalCards={parsedCards.length}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
        />
      </AnimatePresence>
    </div>
  );
};

export default function AuthPage({ slug }: { slug?: string }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [mode, setMode] = useState<AuthMode>("login");
  const { user: authUser } = useAuth();
  const [localUser, setLocalUser] = useState<any>(() => {
    const saved = localStorage.getItem("persona_user");
    return saved ? JSON.parse(saved) : null;
  });
  const user = authUser || localUser;
  const [publicUser, setPublicUser] = useState<any>(null);

  useEffect(() => {
    if (slug) {
      fetch(`/api/user/slug/${slug}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.id) {
            setPublicUser(data);
            setMode("swipe");
            // If viewing a public profile, update form to show its data
            Object.entries(data).forEach(([key, value]) => {
              if (value !== null && value !== undefined && key !== 'password') {
                form.setValue(key as any, value);
              }
            });
            if (data.cards) {
              setSelectedCards(data.cards);
            }
          }
        });
    } else if (user && window.location.pathname === "/") {
      // If we are logged in but at root, go to our own slug
      if (user.uniqueSlug) {
        setLocation(`/${user.uniqueSlug}`);
      }
    }
  }, [slug, user, setLocation]);

  const onSubmit = async (values: InsertUser) => {
    try {
      console.log("Submitting values:", values, "Mode:", mode);
      let result;
      if (user?.id) {
        // If logged in, overwrite data
        const { id, password, createdAt, uniqueSlug, ...updateData } = values as any;
        const payload = {
          ...updateData,
          cards: selectedCards,
        };
        result = await updateProfileMutation.mutateAsync(payload);
        setMode("login");
      } else if (mode === "login") {
        result = await loginMutation.mutateAsync(values);
      } else if (mode === "register" || mode === "customize") {
        const payload = {
          ...values,
          cards: selectedCards,
        };
        console.log("Registration payload:", payload);
        result = await registerMutation.mutateAsync(payload);
      }

      if (result) {
        setLocalUser(result);
        localStorage.setItem("persona_user", JSON.stringify(result));
        localStorage.setItem("persona_user_id", result.id);
        
        // If it's a new registration or missing uniqueSlug, show the QR/Pin flow
        if (mode === "register" || !result.pin) {
          setShowHomeDialog(true);
        } else if (result.uniqueSlug) {
          setLocation(`/${result.uniqueSlug}`);
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const [selectedCards, setSelectedCards] = useState<string[]>(
    user?.cards || [],
  );

  useEffect(() => {
    if (publicUser) {
      setSelectedCards(publicUser.cards || []);
    } else if (user) {
      setSelectedCards(user.cards || []);
    }
  }, [publicUser, user]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingPin, setIsEditingPin] = useState(false);
  const [newPinValue, setNewPinValue] = useState("");

  const updatePinMutation = useMutation({
    mutationFn: async (newPin: string) => {
      const res = await apiRequest("PATCH", `/api/user/${user?.id}`, { pin: newPin });
      return res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["/api/user"], updatedUser);
      toast({
        title: "Success",
        description: "PIN updated successfully",
      });
      setIsEditingPin(false);
      setNewPinValue("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update PIN",
        variant: "destructive",
      });
    },
  });

  const handlePinUpdate = () => {
    if (newPinValue.length !== 5) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be exactly 5 digits",
        variant: "destructive",
      });
      return;
    }
    updatePinMutation.mutate(newPinValue);
  };
  const [qrColor, setQrColor] = useState("#000000");
  const [qrBgColor, setQrBgColor] = useState("#ffffff");
  const professionalAvatars = [
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop", // Woman 1
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop", // Woman 2
    "https://images.unsplash.com/photo-1567532939604-b6c5b0ad3804?w=400&h=400&fit=crop", // Woman 3
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop", // Man 1
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop", // Man 2
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop", // Man 3
  ];

  const [avatarUrl, setAvatarUrl] = useState(professionalAvatars[0]);
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);

  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      );
    }, 60000);
    return () => clearInterval(timer);
  }, []);
  const [qrLayout, setQrLayout] = useState<"standard" | "compact" | "minimal">(
    "standard",
  );

  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showScannerDialog, setShowScannerDialog] = useState(false);
  const [scannerTab, setScannerTab] = useState<"scan" | "code">("scan");
  const [activeTab, setActiveTab] = useState<"notes" | "events" | "connect">("notes");
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [slugValue, setSlugValue] = useState(user?.uniqueSlug || "");

  const [isSlugTaken, setIsSlugTaken] = useState(false);

  const checkSlugMutation = useMutation({
    mutationFn: async (slug: string) => {
      const res = await apiRequest("GET", `/api/user/check-slug/${slug}`);
      return res.json();
    },
    onSuccess: (data) => {
      setIsSlugTaken(data.taken);
    },
  });

  const updateSlugMutation = useMutation({
    mutationFn: async (newSlug: string) => {
      const res = await apiRequest("PATCH", "/api/user/slug", { 
        uniqueSlug: newSlug,
        userId: user?.id 
      });
      return res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["/api/user"], updatedUser);
      setIsEditingSlug(false);
      toast({
        title: "Success",
        description: "Persona code updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveSlug = async () => {
    if (slugValue === user?.uniqueSlug) {
      setIsEditingSlug(false);
      return;
    }
    try {
      await updateSlugMutation.mutateAsync(slugValue);
      setIsEditingSlug(false);
      setShowQRDialog(true);
    } catch (error) {
      console.error("Failed to update persona code:", error);
    }
  };
  const [notes, setNotes] = useState<{ id: string; text: string; completed: boolean; expiresAt: string }[]>([]);
  const [newNote, setNewNote] = useState("");

  // Sync notes from user object
  useEffect(() => {
    if (user?.notes) {
      setNotes(user.notes);
    }
  }, [user?.notes]);

  // Auto-expire notes
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setNotes(prev => {
        const filtered = prev.filter(note => new Date(note.expiresAt) > now);
        if (filtered.length !== prev.length && user) {
          updateProfileMutation.mutate({ notes: filtered });
        }
        return filtered;
      });
    }, 60000);
    return () => clearInterval(timer);
  }, [user]);

  const addNote = () => {
    if (!newNote.trim()) return;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const note = {
      id: Math.random().toString(36).substr(2, 9),
      text: newNote,
      completed: false,
      expiresAt
    };
    const updatedNotes = [...notes, note];
    setNotes(updatedNotes);
    setNewNote("");
    if (user) {
      updateProfileMutation.mutate({ notes: updatedNotes });
    }
  };

  const toggleNote = (id: string) => {
    const updatedNotes = notes.map((n) =>
      n.id === id ? { ...n, completed: !n.completed } : n
    );
    setNotes(updatedNotes);
    if (user) {
      updateProfileMutation.mutate({ notes: updatedNotes });
    }
  };

  const getTimerColor = (expiresAt: string) => {
    const hoursLeft = (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursLeft > 12) return "text-green-400";
    if (hoursLeft > 3) return "text-white";
    return "text-red-500 font-bold";
  };

  const formatTimeLeft = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };
  const [showHomeDialog, setShowHomeDialog] = useState(false);
  const [showPersonaDialog, setShowPersonaDialog] = useState(false);
  const [personaSlug, setPersonaSlug] = useState("");
  const [personaPin, setPersonaPin] = useState("");
  const [personaCode, setPersonaCode] = useState("");
  const [pin, setPin] = useState("");
  const [verifyPin, setVerifyPin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let controls: any = null;
    let isMounted = true;
    const codeReader = new BrowserMultiFormatReader();

    const startScanner = async () => {
      if (showScannerDialog && scannerTab === "scan" && videoRef.current) {
        try {
          const ctrl = await codeReader.decodeFromVideoDevice(
            null,
            videoRef.current,
            (result, err) => {
              if (result && isMounted) {
                const text = result.getText();
                const slug = text.includes("/") ? text.split("/").pop() : text;
                if (slug) {
                  setLocation(`/${slug}`);
                  setShowScannerDialog(false);
                  toast({
                    title: "QR Code Scanned",
                    description: `Loading persona: ${slug}`,
                  });
                }
              }
            },
          );
          
          if (!isMounted || !showScannerDialog || scannerTab !== "scan") {
            if (ctrl && typeof ctrl.stop === 'function') {
              ctrl.stop();
            }
          } else {
            controls = ctrl;
          }
        } catch (err) {
          console.error("Scanner error:", err);
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (controls) {
        if (typeof controls.stop === 'function') {
          controls.stop();
        }
      }
      codeReader.reset();
    };
  }, [showScannerDialog, scannerTab, setLocation, toast]);

  useEffect(() => {
    if (user && !publicUser) {
      Object.entries(user).forEach(([key, value]) => {
        if (value !== null && value !== undefined && key !== 'password') {
          form.setValue(key as any, value);
        }
      });
      if (user.cards) {
        setSelectedCards(user.cards);
      }
    }
  }, [user, publicUser]);

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const isPending = loginMutation.isPending || registerMutation.isPending;

  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      password: "",
      name: user?.name || "",
      role: user?.role || "founder",
      bio: user?.bio || "Collaborate & Grow your Startup",
      instagram: user?.instagram || "",
      linkedin: user?.linkedin || "",
      whatsapp: user?.whatsapp || "",
      website: user?.website || "",
      cards: user?.cards || [],
    },
  });

  const handleVerifyPersona = async () => {
    if (!personaSlug) {
      toast({
        title: "Error",
        description: "Please enter a persona code",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      // If no pin is provided, we're just loading public data
      if (!personaPin) {
        setLocation(`/${personaSlug}`);
        setShowScannerDialog(false);
        setShowPersonaDialog(false);
        return;
      }

      const res = await apiRequest("POST", "/api/auth/verify-persona", {
        slug: personaSlug,
        pin: personaPin,
      });
      const userData = await res.json();
      
      // Update local state and cache
      setLocalUser(userData);
      queryClient.setQueryData(["/api/me"], userData);
      
      localStorage.setItem("persona_user", JSON.stringify(userData));
      localStorage.setItem("persona_user_id", userData.id);
      
      toast({
        title: "Success",
        description: `Verified persona: ${userData.name}`,
      });
      setShowPersonaDialog(false);
      setShowScannerDialog(false);
      setLocation(`/${userData.uniqueSlug}`);
    } catch (err) {
      toast({
        title: "Verification failed",
        description: "Invalid persona code or pin",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };
  const logout = () => {
    localStorage.removeItem("persona_user");
    localStorage.removeItem("persona_user_id");
    setLocalUser(null);
    queryClient.setQueryData(["/api/me"], null);
    setLocation("/");
  };
  const downloadQR = async () => {
    const element = document.getElementById("qr-download-area");
    if (!element) {
      toast({
        title: "Error",
        description: "QR element not found",
        variant: "destructive",
      });
      return;
    }

    try {
      const dataUrl = await htmlToImage.toPng(element, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `persona-qr-${user?.uniqueSlug || "code"}.png`;
      link.href = dataUrl;
      link.click();
      toast({
        title: "Success",
        description: "QR Code downloaded successfully",
      });
    } catch (err) {
      console.error("Download error:", err);
      toast({
        title: "Download failed",
        description: "Could not generate the QR image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<InsertUser>) => {
      if (!user?.id) throw new Error("Not authenticated");
      const res = await apiRequest("PATCH", `/api/user/${user.id}`, data);
      return res.json();
    },
    onSuccess: (updatedUser, variables) => {
      queryClient.setQueryData(["/api/me"], updatedUser);
      setLocalUser(updatedUser);
      localStorage.setItem("persona_user", JSON.stringify(updatedUser));
      localStorage.setItem("persona_user_id", updatedUser.id);
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      
      // If we just set the pin, show QR
      if (updatedUser.pin && variables.pin) {
        setShowQRDialog(true);
      }
      
      // Silent update for notes or completed (checklist)
      const isSilentUpdate = 'notes' in variables || 'cards' in variables || 'completed' in variables;
      if (!isSilentUpdate) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      }
    },
    onError: (error: Error, variables) => {
      const isSilentUpdate = 'notes' in variables || 'cards' in variables;
      if (!isSilentUpdate) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  useEffect(() => {
    if (user && !publicUser) {
      Object.entries(user).forEach(([key, value]) => {
        if (value !== null && value !== undefined && key !== 'password') {
          form.setValue(key as any, value);
        }
      });
      if (user.cards) {
        setSelectedCards(user.cards);
      }
    }
  }, [user, publicUser]);

  const [isPersonaExpanded, setIsPersonaExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-[#050505] overflow-hidden relative">
      <div className="absolute inset-0 flex flex-col justify-start items-end p-12 pt-24 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: isMenuOpen ? 1 : 0, x: isMenuOpen ? 0 : 20 }}
          className="space-y-4 pointer-events-auto mb-8"
        >
          {user ? (
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={logout}
                className="flex items-center gap-4 p-1.5 pr-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white transition-all group ml-auto backdrop-blur-md"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10 group-hover:border-purple-500/30 transition-colors">
                  <User className="w-5 h-5 text-purple-400/80 group-hover:text-purple-400 transition-colors" />
                </div>
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm tracking-tight">
                      {user.name || "Persona User"}
                    </span>
                    <div className="w-3.5 h-3.5 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-black" strokeWidth={4} />
                    </div>
                  </div>
                  <span className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-bold">
                    Logout
                  </span>
                </div>
              </button>

              <div className="w-full mt-2">
                <button
                  onClick={() => setIsPersonaExpanded(!isPersonaExpanded)}
                  className="w-full flex items-center justify-between px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-purple-400" />
                    <span className="font-bold text-sm tracking-widest uppercase">
                      Persona
                    </span>
                  </div>
                  {isPersonaExpanded ? (
                    <ChevronDown className="w-4 h-4 text-white/40 rotate-180 transition-transform" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-white/40 transition-transform" />
                  )}
                </button>

                <AnimatePresence>
                  {isPersonaExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 p-6 bg-white/5 border border-white/10 rounded-2xl space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                            Persona Code
                          </label>
                          <div className="flex items-center justify-between group/item gap-2">
                            {isEditingSlug ? (
                              <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-2 py-1">
                                <input
                                  type="text"
                                  value={slugValue}
                                  onChange={(e) => {
                                    setSlugValue(e.target.value);
                                    if (e.target.value !== user.uniqueSlug) {
                                      checkSlugMutation.mutate(e.target.value);
                                    } else {
                                      setIsSlugTaken(false);
                                    }
                                  }}
                                  className="flex-1 bg-transparent border-none text-sm font-mono text-white focus:outline-none"
                                  autoFocus
                                />
                                <div className="flex flex-col items-end gap-1">
                                  <button
                                    onClick={handleSaveSlug}
                                    disabled={updateSlugMutation.isPending || isSlugTaken}
                                    className={clsx(
                                      "p-1 rounded-full transition-colors disabled:opacity-50",
                                      isSlugTaken ? "bg-red-500/20 text-red-400 cursor-not-allowed" : "bg-white/10 text-green-400 hover:text-green-300"
                                    )}
                                  >
                                    {updateSlugMutation.isPending ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : isSlugTaken ? (
                                      <X className="w-3.5 h-3.5" />
                                    ) : (
                                      <Check className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                  {isSlugTaken && (
                                    <span className="text-[8px] text-red-400 uppercase tracking-tighter font-bold">
                                      Taken
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <>
                                <span className="text-sm font-mono text-white">
                                  {user.uniqueSlug || "---"}
                                </span>
                                <button 
                                  onClick={() => {
                                    setSlugValue(user.uniqueSlug || "");
                                    setIsEditingSlug(true);
                                  }}
                                  className="p-1.5 bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors opacity-0 group-hover/item:opacity-100"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                            Change PIN
                          </label>
                          <div className="flex items-center justify-between group/item">
                            {isEditingPin ? (
                              <div className="flex items-center gap-2 w-full">
                                <input
                                  type="text"
                                  maxLength={5}
                                  value={newPinValue}
                                  onChange={(e) => setNewPinValue(e.target.value.replace(/\D/g, ""))}
                                  placeholder="New 5-digit PIN"
                                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500/50"
                                  autoFocus
                                />
                                <button
                                  onClick={handlePinUpdate}
                                  disabled={updatePinMutation.isPending}
                                  className="p-1.5 bg-purple-500/20 rounded-lg text-purple-400 hover:bg-purple-500/30 transition-colors disabled:opacity-50"
                                >
                                  {updatePinMutation.isPending ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    setIsEditingPin(false);
                                    setNewPinValue("");
                                  }}
                                  className="p-1.5 bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <span className="text-sm tracking-[0.3em] text-white/60">
                                  •••••
                                </span>
                                <button 
                                  onClick={() => setIsEditingPin(true)}
                                  className="p-1.5 bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors opacity-0 group-hover/item:opacity-100"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setShowPersonaDialog(true);
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-3 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white transition-all group ml-auto"
            >
              <User className="w-5 h-5 text-purple-400" />
              <span className="font-bold text-sm tracking-widest uppercase">
                My Persona
              </span>
            </button>
          )}
        </motion.div>
      </div>

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

        <AnimatePresence>
          {!showScannerDialog && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              exit={{ opacity: 0, scale: 0.5 }}
              onClick={() => setShowScannerDialog(true)}
              className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg border border-white/20"
            >
              <QrCode className="w-6 h-6 text-black" strokeWidth={2.5} />
            </motion.button>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center mb-6 z-10"
        >
          <h1 className="text-2xl font-display font-bold tracking-widest uppercase text-white">
            PERSONA
          </h1>
          <p className="text-[10px] tracking-[0.3em] text-white/50 font-medium mb-6 flex items-center justify-center gap-2">
            CONNECT . COLLABORATE . EXPOSE{" "}
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-card border border-white/10 rounded-[20px] shadow-2xl p-5 sm:p-6 z-10 relative overflow-hidden"
        >
          <div className="flex p-1 bg-white/10 rounded-lg mb-6 relative">
            <button
              onClick={() => setMode("login")}
              className={clsx(
                "flex-1 py-2 text-sm font-semibold rounded-md z-10 transition-colors",
                mode === "login" || mode === "register" || mode === "customize"
                  ? "text-white"
                  : "text-white/50",
              )}
            >
              Persona
            </button>
            <button
              onClick={() => setMode("swipe")}
              className={clsx(
                "flex-1 py-2 text-sm font-semibold rounded-md z-10 transition-colors",
                mode === "swipe" ? "text-white" : "text-white/50",
              )}
            >
              Mini-Cards
            </button>
            <motion.div
              layoutId="activeTab"
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white/20 rounded-md shadow-sm"
              animate={{ left: mode === "swipe" ? "calc(50%)" : "4px" }}
            />
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-3"
              >
                {mode === "login" ? (
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <div className="flex flex-col items-center text-center space-y-4 py-2">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-blue-400 mx-auto flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {form.watch("name")?.[0] || "P"}
                      </div>
                      <h3 className="text-xl font-bold text-white tracking-tight">
                        {form.watch("name") || "Networking Profile"}
                      </h3>
                      <p className="text-white/40 text-xs">
                        {ROLES.find((r) => r.value === form.watch("role"))
                          ?.label || "Founder"}
                      </p>
                      <p className="text-white/40 text-[10px] italic">
                        {form.watch("bio")}
                      </p>
                      <div className="flex items-center justify-center gap-3 w-full pt-1">
                        {form.watch("linkedin") && (
                          <a
                            href={form.watch("linkedin")}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2.5 bg-white/5 rounded-lg text-white/70 hover:text-white"
                          >
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}
                        {form.watch("instagram") && (
                          <a
                            href={form.watch("instagram")}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2.5 bg-white/5 rounded-lg text-white/70 hover:text-white"
                          >
                            <SiInstagram className="w-4 h-4" />
                          </a>
                        )}
                        {form.watch("whatsapp") && (
                          <a
                            href={form.watch("whatsapp")}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2.5 bg-white/5 rounded-lg text-white/70 hover:text-white"
                          >
                            <SiWhatsapp className="w-4 h-4" />
                          </a>
                        )}
                        {form.watch("email") && (
                          <a
                            href={`mailto:${form.watch("email")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2.5 bg-white/5 rounded-lg text-white/70 hover:text-white"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                    <a
                      href={form.watch("website") || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full bg-primary text-white rounded-lg py-3 font-semibold text-sm flex items-center justify-center gap-2 group no-underline"
                    >
                      View Collaboration Portal{" "}
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </a>
                    {user && (form.watch("cards")?.length ?? 0) > 0 && (
                      <div className="pt-4 border-t border-white/10">
                        {/* Tabs Navigation */}
                        <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl mb-4">
                          <button
                            type="button"
                            onClick={() => setActiveTab("notes")}
                            className={clsx(
                              "flex-1 py-2 text-[10px] font-bold rounded-lg transition-all uppercase tracking-wider",
                              activeTab === "notes" ? "bg-white/10 text-white shadow-lg" : "text-white/40 hover:text-white/60"
                            )}
                          >
                            Notes
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveTab("events")}
                            className={clsx(
                              "flex-1 py-2 text-[10px] font-bold rounded-lg transition-all uppercase tracking-wider",
                              activeTab === "events" ? "bg-white/10 text-white shadow-lg" : "text-white/40 hover:text-white/60"
                            )}
                          >
                            Upcoming Events
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveTab("connect")}
                            className={clsx(
                              "flex-1 py-2 text-[10px] font-bold rounded-lg transition-all uppercase tracking-wider flex items-center justify-center gap-1.5",
                              activeTab === "connect" ? "bg-white/10 text-white shadow-lg" : "text-white/40 hover:text-white/60"
                            )}
                          >
                            <div className="w-3 h-3 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/40">
                              <div className="w-1 h-1 rounded-full bg-blue-400 shadow-[0_0_4px_#60a5fa]" />
                            </div>
                            Connect
                          </button>
                        </div>

                        {/* Tab Content */}
                        <AnimatePresence mode="wait">
                          {activeTab === "notes" ? (
                            <motion.div
                              key="notes"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="space-y-3"
                            >
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={newNote}
                                  onChange={(e) => setNewNote(e.target.value)}
                                  onKeyPress={(e) => e.key === "Enter" && addNote()}
                                  placeholder="Add a quick note..."
                                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/20"
                                />
                                <button
                                  type="button"
                                  onClick={addNote}
                                  className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="space-y-2 max-h-[120px] overflow-y-auto custom-scrollbar">
                                {notes.map((note) => (
                                  <div key={note.id} className="flex items-center gap-3 group">
                                    <button
                                      type="button"
                                      onClick={() => toggleNote(note.id)}
                                      className={clsx(
                                        "w-4 h-4 rounded-full border transition-all flex items-center justify-center",
                                        note.completed ? "bg-purple-500 border-purple-500" : "border-white/20 hover:border-white/40"
                                      )}
                                    >
                                      {note.completed && <Check className="w-2.5 h-2.5 text-white" />}
                                    </button>
                                    <div className="flex flex-col flex-1">
                                      <span className={clsx(
                                        "text-xs transition-all",
                                        note.completed ? "text-white/20 line-through" : "text-white/70"
                                      )}>
                                        {note.text}
                                      </span>
                                      <span className={clsx("text-[8px] uppercase tracking-tighter", getTimerColor(note.expiresAt))}>
                                        Expires in {formatTimeLeft(note.expiresAt)}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                                {notes.length === 0 && (
                                  <p className="text-[10px] text-white/20 uppercase tracking-widest text-center py-4">No notes yet</p>
                                )}
                              </div>
                            </motion.div>
                          ) : activeTab === "events" ? (
                            <motion.div
                              key="events"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="h-[120px] flex items-center justify-center border border-dashed border-white/10 rounded-2xl"
                            >
                              <div className="text-center space-y-2">
                                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Upcoming Events</p>
                                <p className="text-xs text-white/20 font-medium">Coming Soon</p>
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="connect"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="h-[120px] flex items-center justify-center border border-dashed border-white/10 rounded-2xl bg-gradient-to-tr from-blue-500/5 to-purple-500/5"
                            >
                              <div className="text-center space-y-2">
                                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Exclusive Connect</p>
                                <p className="text-xs text-white/20 font-medium">Coming Soon</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </form>
                ) : mode === "register" ? (
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar"
                  >
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                        Name
                      </label>
                      <input
                        {...form.register("name")}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
                        placeholder="Your Name"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                        Role
                      </label>
                      <div className="relative">
                        <select
                          {...form.register("role")}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white appearance-none"
                        >
                          {ROLES.map((r) => (
                            <option
                              key={r.value}
                              value={r.value}
                              className="bg-[#1a1a1a]"
                            >
                              {r.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                        Industry
                      </label>
                      <div className="relative">
                        <select
                          {...form.register("industry")}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white appearance-none"
                        >
                          <option value="" className="bg-[#1a1a1a]">Select Industry</option>
                          {[
                            "Fintech", "Healthtech", "Edtech", "Ecommerce & Retail", 
                            "Agritech", "SaaS", "Cleantech & Greentech", "Logistics", 
                            "🌱 Sustainability & Energy (EVs)", "DeepTech", "Spacetech", 
                            "Robotics & Automation", "Cybersecurity", "AR/VR", "Media & Entertainment"
                          ].map((industry) => (
                            <option
                              key={industry}
                              value={industry}
                              className="bg-[#1a1a1a]"
                            >
                              {industry}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                        Startup / Business
                      </label>
                      <input
                        {...form.register("bio")}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                        placeholder="e.g. Collaborate & Grow your Startup"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                          Instagram
                        </label>
                        <input
                          {...form.register("instagram")}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                          placeholder="URL"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                          LinkedIn
                        </label>
                        <input
                          {...form.register("linkedin")}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                          placeholder="URL"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                          Email
                        </label>
                        <input
                          {...form.register("email")}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                          placeholder="Email"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                          WhatsApp
                        </label>
                        <input
                          {...form.register("whatsapp")}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                          placeholder="Number"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                        Portal URL
                      </label>
                      <input
                        {...form.register("website")}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                        placeholder="https://your-portal.com"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setMode("customize")}
                      className="w-full bg-white text-black rounded-lg py-3 font-bold text-sm flex items-center justify-center gap-2 mt-4"
                    >
                      Next <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : mode === "customize" ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Your Mini-Cards ({selectedCards.length}
                        /5)
                      </h4>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 px-1 custom-scrollbar snap-x">
                      {[0, 1, 2, 3, 4].map((idx) => (
                        <div
                          key={idx}
                          className="min-w-[220px] aspect-[3/4] snap-center"
                        >
                          {selectedCards[idx] ? (
                            <MiniCard
                              idx={idx}
                              cardJson={selectedCards[idx]}
                              onUpdate={(newJson) => {
                                const currentCards = [...selectedCards];
                                currentCards[idx] = newJson;
                                setSelectedCards(currentCards);
                              }}
                              onDelete={() => {
                                const currentCards = [...selectedCards];
                                currentCards.splice(idx, 1);
                                setSelectedCards(currentCards);
                              }}
                            />
                          ) : (
                            <div className="h-full border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-4">
                              <div className="grid grid-cols-2 gap-2 w-full">
                                {CARD_TYPES.map((t) => (
                                  <button
                                    key={t.type}
                                    type="button"
                                    onClick={() => {
                                      const currentCards = [...selectedCards];
                                      const newCard =
                                        t.type === "pitch"
                                          ? {
                                              type: "pitch",
                                              title: "New Pitch",
                                              content: "",
                                            }
                                          : t.type === "reel"
                                            ? {
                                                type: "reel",
                                                title: "New Reel",
                                                url: "",
                                              }
                                            : t.type === "revenue"
                                              ? {
                                                  type: "revenue",
                                                  title: "Monthly Sales",
                                                  value: "$0",
                                                  imageUrl: "",
                                                }
                                              : {
                                                  type: "product",
                                                  title: "Product",
                                                  imageUrls: ["", ""],
                                                };
                                      currentCards[idx] =
                                        JSON.stringify(newCard);
                                      setSelectedCards(currentCards);
                                    }}
                                    className="flex flex-col items-center gap-1 p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                                  >
                                    <t.icon className="w-5 h-5 text-white/60" />
                                    <span className="text-[8px] text-white/40 uppercase font-bold">
                                      {t.label}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      disabled={updateProfileMutation.isPending}
                      onClick={() => form.handleSubmit(onSubmit)()}
                      className="w-full bg-white text-black rounded-lg py-3 font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition-all"
                    >
                      {updateProfileMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Save All"
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="py-2">
                    <SwipeCard cards={selectedCards} />
                    <div className="text-center mt-4 space-y-0.5">
                      <p className="text-xs font-semibold text-white">
                        Swipe to explore
                      </p>
                      <p className="text-[10px] text-white/40">
                        Left to back • Right to next
                      </p>
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
                  {mode === "customize"
                    ? "EDITING"
                    : mode === "login"
                      ? "FREE"
                      : "FREE"}
                </span>
              </div>
            </div>

            {user && mode === "login" && (
              <button
                type="button"
                onClick={() => setMode("register")}
                className="w-full bg-white text-black hover:bg-white/90 rounded-lg py-3 font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg mt-2"
              >
                <Pencil className="w-4 h-4" /> Edit Persona
              </button>
            )}

            {!user && (
              <button
                type="button"
                onClick={() => {
                  if (mode === "login") {
                    setMode("register");
                  } else {
                    setMode("login");
                  }
                }}
                className="w-full bg-white text-black hover:bg-white/90 rounded-lg py-3 font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                {mode === "login" ? "create your persona" : "Back to Persona"}
              </button>
            )}
          </div>
        </motion.div>

        <AnimatePresence>
          {showScannerDialog && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowScannerDialog(false)}
                className="absolute inset-0 bg-black/95 backdrop-blur-xl"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
              >
                {/* Tabs */}
                <div className="flex p-2 bg-white/5 border-b border-white/10">
                  <button
                    onClick={() => setScannerTab("scan")}
                    className={clsx(
                      "flex-1 py-2.5 text-xs font-bold rounded-xl transition-all",
                      scannerTab === "scan"
                        ? "bg-white/10 text-white shadow-lg"
                        : "text-white/40 hover:text-white/60"
                    )}
                  >
                    Scan QR
                  </button>
                  <button
                    onClick={() => setScannerTab("code")}
                    className={clsx(
                      "flex-1 py-2.5 text-xs font-bold rounded-xl transition-all",
                      scannerTab === "code"
                        ? "bg-white/10 text-white shadow-lg"
                        : "text-white/40 hover:text-white/60"
                    )}
                  >
                    Persona Code
                  </button>
                </div>

                <div className="p-8 space-y-6">
                  {scannerTab === "scan" ? (
                    <div className="space-y-6 text-center">
                      <div className="relative aspect-square max-w-[200px] mx-auto bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center group overflow-hidden">
                        <video
                          ref={videoRef}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <QrCode className="w-12 h-12 text-white/20 relative z-10" />
                        <div className="absolute bottom-4 left-0 right-0">
                          <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">
                            Scanner Active
                          </p>
                        </div>
                        {/* Scanning Corners */}
                        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white/20 rounded-tl-lg" />
                        <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-white/20 rounded-tr-lg" />
                        <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-white/20 rounded-bl-lg" />
                        <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white/20 rounded-br-lg" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white tracking-tight">Scan to Connect</h3>
                        <p className="text-white/40 text-xs">Point your camera at a Persona QR code</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 text-center">
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white tracking-tight uppercase tracking-widest">Enter Code</h3>
                        <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Connect with a unique persona code</p>
                      </div>
                      
                      <div className="space-y-4 text-left">
                        <div className="space-y-2">
                          <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold ml-1">Persona Code</label>
                          <input
                            type="text"
                            placeholder="e.g. x8y2z"
                            value={personaSlug}
                            onChange={(e) => setPersonaSlug(e.target.value.toLowerCase())}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/20 transition-all font-mono"
                          />
                        </div>
                        <button
                          onClick={handleVerifyPersona}
                          className="w-full bg-white text-black rounded-xl py-4 font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition-all active:scale-95"
                        >
                          Preview Persona <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowScannerDialog(false)}
                  className="w-full py-4 text-[10px] text-white/20 hover:text-white/40 uppercase tracking-[0.3em] font-bold border-t border-white/5 transition-colors"
                >
                  Close Scanner
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showPersonaDialog && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowPersonaDialog(false)}
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-card border border-white/10 rounded-[24px] p-8 shadow-2xl z-10"
              >
                <button
                  onClick={() => setShowPersonaDialog(false)}
                  className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center space-y-2 mb-8">
                  <h3 className="text-2xl font-bold text-white uppercase tracking-widest">
                    Access Persona
                  </h3>
                  <p className="text-white/40 text-xs uppercase tracking-wider">
                    Enter your unique credentials
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold ml-1">
                      Persona Code
                    </label>
                    <input
                      type="text"
                      value={personaSlug}
                      onChange={(e) => setPersonaSlug(e.target.value)}
                      placeholder="e.g. x8y2z"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold ml-1">
                      PIN
                    </label>
                    <input
                      type="password"
                      maxLength={5}
                      value={personaPin}
                      onChange={(e) => setPersonaPin(e.target.value)}
                      placeholder="•••••"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-colors tracking-[0.5em]"
                    />
                  </div>

                  <button
                    onClick={handleVerifyPersona}
                    disabled={isVerifying}
                    className="w-full bg-white text-black rounded-xl py-4 font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition-all shadow-lg group"
                  >
                    {isVerifying ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Connect Persona
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showQRDialog && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-[240px] mx-auto"
              >
                {/* iPhone Frame - Ultra Compact & Minimalist */}
                <div className="relative aspect-[9/19.5] bg-[#050505] rounded-[42px] p-1.5 shadow-[0_0_0_1px_#1a1a1a,0_0_0_4px_#000,0_15px_40px_rgba(0,0,0,0.6)] overflow-hidden border-[1px] border-white/5">
                  {/* Tiny Dynamic Island */}
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-14 h-4 bg-black rounded-full z-50 flex items-center justify-end px-2.5">
                    <div className="w-0.5 h-0.5 rounded-full bg-blue-500/20 shadow-[0_0_2px_#3b82f6]" />
                  </div>

                  {/* iPhone Screen Content */}
                  <div className="w-full h-full bg-[#050505] rounded-[36px] relative overflow-hidden flex flex-col items-center p-4">
                    {/* Status Bar */}
                    <div className="w-full flex justify-between items-center px-6 pt-2 pb-1 z-50">
                      <span className="text-white text-[10px] font-medium">{currentTime}</span>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full border border-white/20" />
                        <div className="w-4 h-2 rounded-sm border border-white/20" />
                      </div>
                    </div>

                    <div className="flex flex-col items-center w-full space-y-4 mt-4">
                      {/* Profile Section */}
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative group">
                          <div className="w-16 h-16 rounded-full border-2 border-white/10 p-1 bg-white/5">
                            <img
                              src={avatarUrl}
                              alt="Avatar"
                              className="w-full h-full rounded-full object-cover"
                            />
                          </div>
                          <button 
                            onClick={() => setShowAvatarDialog(true)}
                            className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg border border-black/5 hover:scale-110 transition-transform"
                          >
                            <Pencil className="w-3 h-3 text-black" />
                          </button>
                        </div>
                        <div className="text-center space-y-0.5">
                          <h5 className="text-white text-lg font-bold tracking-tight">
                            {user?.name || "Founder Name"}
                          </h5>
                          <p className="text-white/40 text-[8px] uppercase tracking-[0.2em] font-black">
                            {user?.role || "FOUNDER"}
                          </p>
                          <p className="text-white/30 text-[8px] uppercase tracking-wider line-clamp-1 px-4">
                            {user?.bio || "COLLABORATE & GROW YOUR STARTUP"}
                          </p>
                        </div>
                      </div>

                      {/* QR Code Section - More Compact */}
                      <div id="qr-download-area" className="p-4 bg-white rounded-[24px] shadow-2xl">
                        <QRCodeSVG
                          value={window.location.origin + "/" + user?.uniqueSlug}
                          size={140}
                          level="H"
                          includeMargin={false}
                          fgColor={qrColor}
                          bgColor={qrBgColor}
                        />
                      </div>

                      <div className="text-center">
                        <p className="text-[8px] text-white/20 uppercase tracking-[0.3em] font-black">
                          Scan to Connect
                        </p>
                      </div>
                    </div>

                    {/* Home Indicator */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-white/10 rounded-full" />

                    {/* Avatar Selection Dialog */}
                    <AnimatePresence>
                      {showAvatarDialog && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="absolute inset-0 z-[60] flex items-center justify-center p-4"
                        >
                          <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl p-4 w-full max-w-[240px]">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-white text-[10px] font-bold uppercase tracking-widest">
                                Select Avatar
                              </span>
                              <button
                                onClick={() => setShowAvatarDialog(false)}
                              >
                                <X className="w-3 h-3 text-white/40" />
                              </button>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              <AnimatePresence>
                                {professionalAvatars.map((url, i) => (
                                  <motion.button
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                    animate={{ 
                                      opacity: 1, 
                                      scale: 1, 
                                      y: 0,
                                      transition: { delay: i * 0.05 } 
                                    }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                      setAvatarUrl(url);
                                      setShowAvatarDialog(false);
                                    }}
                                    className="aspect-square rounded-full border-2 border-white/10 overflow-hidden hover:border-white/60 transition-all"
                                  >
                                    <img
                                      src={url}
                                      className="w-full h-full object-cover"
                                      alt={`Avatar ${i + 1}`}
                                    />
                                  </motion.button>
                                ))}
                              </AnimatePresence>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Tiny Controls */}
                    <div className="w-full flex justify-between items-center px-3 opacity-30 mt-auto">
                      <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center">
                        <Save className="w-3 h-3 text-white" />
                      </div>
                      <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center">
                        <QrCode className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons Below iPhone - Compact */}
                <div className="mt-5 space-y-2 px-1">
                  <button
                    onClick={downloadQR}
                    className="w-full bg-white text-black rounded-xl py-3 font-bold text-[11px] flex items-center justify-center gap-2 hover:bg-white/90 transition-all shadow-lg active:scale-95"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Download
                  </button>
                  <button
                    onClick={() => {
                      setShowQRDialog(false);
                    }}
                    className="w-full text-white/30 hover:text-white/50 py-1.5 font-bold text-[9px] uppercase tracking-widest transition-all"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showHomeDialog && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/95 backdrop-blur-xl"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-[32px] p-6 shadow-2xl text-center space-y-6 overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 opacity-50" />

                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {form.getValues("name")}
                  </h3>
                  <p className="text-white/40 text-xs">
                    Your persona is live and ready.
                  </p>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2">
                  <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">
                    Persona Code
                  </p>
                  <div className="text-2xl font-mono font-black text-white tracking-[0.3em]">
                    {user?.uniqueSlug}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold ml-1">
                      Set Login PIN (5 Digits)
                    </label>
                    <div className="relative group">
                      <input
                        type="text"
                        maxLength={5}
                        placeholder="•••••"
                        value={pin}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          if (val.length <= 5) setPin(val);
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-xl font-mono tracking-[1em] text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-white/10"
                      />
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      if (pin.length === 5) {
                        try {
                          await updateProfileMutation.mutateAsync({ pin });
                          setShowHomeDialog(false);
                          setShowQRDialog(true);
                          toast({
                            title: "Security Updated",
                            description:
                              "Your 5-digit PIN has been set successfully.",
                          });
                        } catch (e) {
                          toast({
                            title: "Error",
                            description: "Failed to set PIN. Please try again.",
                            variant: "destructive",
                          });
                        }
                      } else {
                        toast({
                          title: "Invalid PIN",
                          description: "Please enter a 5-digit numeric PIN.",
                          variant: "destructive",
                        });
                      }
                    }}
                    className="w-full bg-white text-black rounded-xl py-3 font-bold text-sm hover:bg-white/90 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    {updateProfileMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Save & Continue"
                    )}
                  </button>
                </div>

                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showPersonaDialog && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowPersonaDialog(false)}
                className="absolute inset-0 bg-black/95 backdrop-blur-xl"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-[32px] p-8 shadow-2xl text-center space-y-6"
              >
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Access Persona
                  </h3>
                  <p className="text-white/40 text-sm">
                    Enter your code and PIN to continue.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold ml-1">
                      Persona Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. x1y2z"
                      value={personaCode}
                      onChange={(e) =>
                        setPersonaCode(e.target.value.toLowerCase())
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-all font-mono"
                    />
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold ml-1">
                      5-Digit PIN
                    </label>
                    <input
                      type="password"
                      maxLength={5}
                      placeholder="•••••"
                      value={verifyPin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        if (val.length <= 5) setVerifyPin(val);
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-xl font-mono tracking-[1em] text-white focus:outline-none focus:border-purple-500/50 transition-all"
                    />
                  </div>

                  <button
                    onClick={async () => {
                      if (personaCode && verifyPin.length === 5) {
                        try {
                          const res = await apiRequest(
                            "POST",
                            "/api/auth/verify-persona",
                            {
                              slug: personaCode,
                              pin: verifyPin,
                            },
                          );
                          const userData = await res.json();

                          // Set user and sync form
                          queryClient.setQueryData(["/api/me"], userData);
                          setLocalUser(userData);
                          setShowPersonaDialog(false);
                          form.reset({
                            email: userData.email || "",
                            name: userData.name || "",
                            role: userData.role || "founder",
                            bio: userData.bio || "",
                            instagram: userData.instagram || "",
                            linkedin: userData.linkedin || "",
                            whatsapp: userData.whatsapp || "",
                            website: userData.website || "",
                            cards: userData.cards || [],
                          });
                          setSelectedCards(userData.cards || []);
                          setMode("login");
                          setShowPersonaDialog(false);
                          toast({
                            title: "Welcome back!",
                            description: `Successfully loaded persona: ${userData.name}`,
                          });
                        } catch (e: any) {
                          toast({
                            title: "Access Denied",
                            description: "Invalid persona code or PIN.",
                            variant: "destructive",
                          });
                        }
                      }
                    }}
                    className="w-full bg-white text-black rounded-xl py-4 font-bold text-sm hover:bg-white/90 transition-all active:scale-95"
                  >
                    Load Persona
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
