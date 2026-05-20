/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Compass, 
  Map, 
  User, 
  Home, 
  Sparkles, 
  MapPin, 
  AlertTriangle, 
  Thermometer, 
  Sun, 
  Wind, 
  Heart, 
  ChevronRight, 
  Download, 
  Share2, 
  Volume2, 
  Settings, 
  X, 
  ArrowLeft, 
  Play, 
  Award, 
  CheckCircle,
  HelpCircle,
  Star,
  Search,
  Check,
  Send,
  Loader
} from "lucide-react";
import { IMAGES, DEFAULT_HIGHLIGHTS, LUXURY_STAYS, CURATED_TOURS, LEADERBOARD, DEFAULT_PLAN } from "./data";
import { TourPlan, ChatMessage, WeatherCondition, LandmarkDetails } from "./types";

export default function App() {
  // Splash Screen Intro Onboarding State
  const [hasBegun, setHasBegun] = useState(false);
  
  // Tab Routing: "home" | "explore" | "chat" | "journey" | "profile"
  const [activeTab, setActiveTab] = useState<"home" | "explore" | "chat" | "journey" | "profile">("home");
  const [language, setLanguage] = useState<"en" | "ar">("en");
  
  // Live Current Location State: "Luxor" | "Giza" | "Aswan"
  const [location, setLocation] = useState<"Luxor" | "Giza" | "Aswan">("Luxor");
  const [conditions, setConditions] = useState<WeatherCondition>({
    location: "Luxor",
    temp: "38°C",
    humidity: "21%",
    uvIndex: 9,
    uvLevel: "VERY HIGH",
    uvTip: "Apply sunscreen, seek shade 12–3pm.",
    aqi: 54,
    aqiStatus: "Moderate",
    heatStatus: "EXTREME"
  });

  // Weather Loading state
  const [isLoadingConditions, setIsLoadingConditions] = useState(false);

  // Home Screen States
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [claimedDailyStreak, setClaimedDailyStreak] = useState(false);
  const [questProgress, setQuestProgress] = useState(60); // 3 of 5 clues (60%)
  const [activeSiteContext, setActiveSiteContext] = useState("Giza Necropolis");

  // Explore Tab States: "scanner" | "deepdive"
  const [exploreMode, setExploreMode] = useState<"scanner" | "deepdive">("scanner");
  const [scanLandmark, setScanLandmark] = useState<"Luxor Temple" | "Karnak Temple" | "Valley of the Kings">("Luxor Temple");
  const [detectedLandmark, setDetectedLandmark] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showScannerToast, setShowScannerToast] = useState(true);
  const [landmarksHistory, setLandmarksHistory] = useState<string[]>(["Giza Pyramids", "Karnak Portal"]);
  const [deepDiveTab, setDeepDiveTab] = useState<"Story" | "Ra's Guide" | "Hidden Gems" | "Practical Info">("Story");
  const [playingAudioTour, setPlayingAudioTour] = useState(false);

  // Chat Tab States
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "m1",
      sender: "ra",
      text: `Ah, an excellent question! The ancient Egyptians aligned the pyramids with <b class="text-secondary">Thuban</b>, the North Star of that era. They believed this alignment created a gateway for the Pharaoh's soul to join the <i class="text-tertiary">Imperishable Stars</i> in the northern sky.`,
      time: "10:42 AM"
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [raIsThinking, setRaIsThinking] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Journey Itinerary Planner States
  const [itineraryDays, setItineraryDays] = useState(3);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["Archaeology", "Cruising"]);
  const [tourPlan, setTourPlan] = useState<TourPlan>(DEFAULT_PLAN);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [optimizeForInterests, setOptimizeForInterests] = useState(true);
  const [bookedTicket, setBookedTicket] = useState(false);
  const [claimedXPMonument, setClaimedXPMonument] = useState(false);

  // Profile preferences States
  const [isVoiceActive, setIsVoiceActive] = useState(true);
  const [detailDepth, setDetailDepth] = useState("Scholarly");
  const [isLuxorPackDownloaded, setIsLuxorPackDownloaded] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch Weather & Conditions
  useEffect(() => {
    async function fetchWeather() {
      setIsLoadingConditions(true);
      try {
        const res = await fetch(`/api/conditions?location=${location}`);
        if (res.ok) {
          const data = await res.json();
          setConditions(data);
        }
      } catch (err) {
        console.error("Error reading conditions:", err);
      } finally {
        setIsLoadingConditions(false);
      }
    }
    fetchWeather();
  }, [location]);

  // Scroll to bottom on chats
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, raIsThinking]);

  // Auto detect landmark trigger
  useEffect(() => {
    if (exploreMode === "scanner") {
      setIsScanning(true);
      const timer = setTimeout(async () => {
        setIsScanning(false);
        try {
          const res = await fetch("/api/gemini/identify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ landmarkName: scanLandmark })
          });
          if (res.ok) {
            const data = await res.json();
            setDetectedLandmark(data);
          }
        } catch (err) {
          console.error("Monument identification error:", err);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [exploreMode, scanLandmark]);

  // Handle Voice download simulation
  useEffect(() => {
    let interval: any;
    if (isDownloading) {
      interval = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 100) {
            setIsDownloading(false);
            setIsLuxorPackDownloaded(true);
            return 100;
          }
          return prev + 25;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isDownloading]);

  // Trigger Plan Generator
  const handleGenerateItinerary = async () => {
    setIsGeneratingPlan(true);
    try {
      const res = await fetch("/api/gemini/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          days: itineraryDays,
          departureCity: location,
          interests: selectedInterests.join(", "),
          name: "Ahmed"
        })
      });
      if (res.ok) {
        const data = await res.json();
        setTourPlan(data);
      }
    } catch (err) {
      console.error("Itinerary gen error:", err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Submit Chat Message
  const handleSendChatMessage = async (term?: string) => {
    const textToSend = term || chatInput;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!term) setChatInput("");
    setRaIsThinking(true);

    try {
      const chatHistory = chatMessages.concat(userMsg).map((m) => ({ text: m.text }));
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatHistory,
          siteContext: activeSiteContext
        })
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            sender: "ra",
            text: data.text,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ]);
      }
    } catch (err) {
      console.error("Error talking to Ra:", err);
    } finally {
      setRaIsThinking(false);
    }
  };

  // Trigger Quick Action chat redirection
  const handleQuickChatContext = (contextName: string, query: string) => {
    setActiveSiteContext(contextName);
    setActiveTab("chat");
    setChatMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        sender: "user",
        text: query,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
    setRaIsThinking(true);
    setTimeout(async () => {
      try {
        const res = await fetch("/api/gemini/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ text: query }],
            siteContext: contextName
          })
        });
        if (res.ok) {
          const data = await res.json();
          setChatMessages((prev) => [
            ...prev,
            {
              id: Math.random().toString(),
              sender: "ra",
              text: data.text,
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            }
          ]);
        }
      } catch (err) {
        console.error("AI error:", err);
      } finally {
        setRaIsThinking(false);
      }
    }, 1000);
  };

  // Interest selector switch helper
  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  // -----------------------------------------------------------------
  // RENDER: SPLASH ONBOARDING GATE
  // -----------------------------------------------------------------
  if (!hasBegun) {
    return (
      <div className="relative min-h-screen bg-[#061423] text-[#d6e4f9] overflow-hidden flex flex-col items-center justify-center font-sans">
        {/* Cinematic Backdrop */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 40px)", backgroundSize: "80px 80px" }}></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#b5c4ff]/5 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#e6c364]/5 rounded-full blur-[120px] animate-pulse"></div>
          {/* Central Radiance */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#e6c364]/10 rounded-full blur-[90px] animate-slow-pulse"></div>
        </div>

        {/* Minimal Hieroglyphic Screen Border Frame */}
        <div className="absolute inset-6 pointer-events-none border border-[#e6c364]/15 z-10 m-4">
          <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#061423] px-3 text-[#e6c364]/40 font-serif text-[18px]">waves</span>
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-[#061423] px-3 text-[#e6c364]/40 font-serif text-[18px]">visibility</span>
          <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-[#061423] py-2 text-[#e6c364]/40 font-serif text-[18px]">flare</span>
          <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-[#061423] py-2 text-[#e6c364]/40 font-serif text-[18px]">adjust</span>
        </div>

        {/* Core Splash Canvas */}
        <div className="relative z-20 flex flex-col items-center justify-center text-center px-6 max-w-xl">
          {/* Animated Ra Eagle Mascot */}
          <div className="relative mb-8 group cursor-pointer">
            <div className="absolute inset-0 bg-[#e6c364]/20 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-1000"></div>
            <img 
              id="splash_ra_mascot"
              alt="Ra Mascot" 
              className="w-56 md:w-64 h-auto animate-float drop-shadow-[0_0_25px_rgba(230,195,100,0.35)] relative z-10" 
              src={IMAGES.raMascot} 
            />
          </div>

          {/* Titles */}
          <div className="space-y-4">
            <h1 className="font-serif text-5xl md:text-6xl tracking-tight text-[#d6e4f9] flex items-center justify-center gap-4">
              <span className="text-[#e6c364] font-bold">Rihla</span>
              <span className="text-[#45464f] text-4xl">|</span>
              <span className="font-normal text-3xl">رحلة</span>
            </h1>
            <p className="font-sans text-[#c5c6d1] text-lg max-w-sm mx-auto leading-relaxed">
              Your AI Companion Through 5,000 Years of Egyptian History
            </p>
          </div>

          {/* Splash Language Bar */}
          <div className="mt-8">
            <nav className="flex flex-wrap justify-center gap-2">
              <button 
                id="lang_en_btn"
                onClick={() => setLanguage("en")}
                className={`text-sm px-3 py-1 font-semibold tracking-wide rounded-md transition-all ${language === 'en' ? 'text-[#e6c364] shadow-[0_0_10px_rgba(230,195,100,0.4)]' : 'text-[#8f909a] hover:text-[#d6e4f9]'}`}
              >
                EN
              </button>
              <button 
                id="lang_ar_btn"
                onClick={() => setLanguage("ar")}
                className={`text-sm px-3 py-1 font-semibold tracking-wide rounded-md transition-all ${language === 'ar' ? 'text-[#e6c364] shadow-[0_0_10px_rgba(230,195,100,0.4)]' : 'text-[#8f909a] hover:text-[#d6e4f9]'}`}
              >
                عربي
              </button>
              <button className="text-sm px-3 py-1 text-[#8f909a] hover:text-[#d6e4f9]">FR</button>
              <button className="text-sm px-3 py-1 text-[#8f909a] hover:text-[#d6e4f9]">DE</button>
              <button className="text-sm px-3 py-1 text-[#8f909a] hover:text-[#d6e4f9]">ZH</button>
              <button className="text-sm px-3 py-1 text-[#8f909a] hover:text-[#d6e4f9]">ES</button>
            </nav>
          </div>

          {/* Onboarding Trigger Button */}
          <button 
            id="begin_journey_btn"
            onClick={() => setHasBegun(true)}
            className="mt-10 relative overflow-hidden bg-[#e6c364] text-[#3d2e00] px-10 py-4 rounded-xl font-serif text-xl tracking-widest font-semibold hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(230,195,100,0.3)] cursor-pointer"
          >
            BEGIN YOUR JOURNEY
          </button>

          {/* Interactive Navigation Prompt */}
          <div className="mt-8 flex flex-col items-center gap-1 opacity-50">
            <span className="text-xs uppercase tracking-[0.2em] font-medium">Step into the sun</span>
            <span className="material-symbols-outlined animate-bounce text-[#e6c364] text-lg">expand_more</span>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // MAIN APP BAR HEADER AND SHELL IN obsidian background
  // -----------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#061423] text-[#d6e4f9] font-sans pb-28 relative overflow-x-hidden">
      
      {/* Dynamic ambient nebulas in background */}
      <div className="absolute top-10 left-12 w-64 h-64 bg-[#b5c4ff]/5 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-1/3 right-10 w-96 h-96 bg-[#e6c364]/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* FIXED TOP NAVIGATION BAR */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#061423]/80 backdrop-blur-xl border-b border-[#e6c364]/20 shadow-[0_4px_30px_rgba(230,195,100,0.1)] py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full overflow-hidden border border-[#e6c364]/40 relative group cursor-pointer"
            onClick={() => setActiveTab("profile")}
          >
            <img 
              alt="Ra Mascot Icon" 
              className="w-full h-full object-cover animate-float" 
              src={IMAGES.raMascot} 
            />
            <div className="absolute inset-0 bg-[#e6c364]/10 group-hover:bg-transparent transition-colors"></div>
          </div>
          <h1 
            onClick={() => setActiveTab("home")} 
            className="font-serif text-2xl tracking-widest text-[#e6c364] cursor-pointer hover:opacity-95"
          >
            RIHLA
          </h1>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2">
          {/* Quick Location switcher */}
          <div className="bg-[#132030] border border-[#e6c364]/20 rounded-md px-2 py-1 flex items-center gap-1.5 text-xs text-[#e6c364] font-medium">
            <MapPin className="w-3.5 h-3.5" />
            <select 
              id="global_location_select"
              value={location}
              onChange={(e) => setLocation(e.target.value as any)}
              className="bg-transparent border-none text-[#e6c364] focus:ring-0 cursor-pointer font-sans"
            >
              <option value="Luxor">Luxor</option>
              <option value="Giza">Giza Necropolis</option>
              <option value="Aswan">Aswan</option>
            </select>
          </div>

          <button 
            id="alerts_bell_btn"
            onClick={() => setQuestProgress((prev) => Math.min(prev + 20, 100))}
            className="w-10 h-10 flex items-center justify-center text-[#e6c364] rounded-full hover:bg-[#132030]/60 active:scale-95 transition-transform cursor-pointer relative"
          >
            <span className="material-symbols-outlined text-2xl">notifications</span>
            {questProgress < 100 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#ffb4ab] animate-pulse"></span>
            )}
          </button>
        </div>
      </header>

      {/* CORE SCREEN CANVAS */}
      <main className="pt-24 px-6 max-w-xl mx-auto flex flex-col gap-8 pb-10">

        {/* -----------------------------------------------------------
            TAB 1: HOME SCREEN
            ----------------------------------------------------------- */}
        {activeTab === "home" && (
          <div className="flex flex-col gap-6 fade-in whitespace-normal">
            
            {/* Custom Welcome Banner */}
            <section className="flex flex-col gap-1.5" id="welcome_back_header">
              <span className="text-xs uppercase tracking-widest text-[#c5c6d1]/60">Marhaban,</span>
              <h2 className="font-serif text-3xl font-bold gold-gradient-text">Welcome back, Ahmed 👋</h2>
            </section>

            {/* Weather + UV Strip */}
            <section className="glass-card rounded-2xl p-4 flex items-center justify-between gap-4 relative overflow-hidden" id="weather_strip_card">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#e6c364]/5 rounded-full blur-xl pointer-events-none"></div>
              
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#e6c364] text-3xl animate-spin-slow" style={{ fontVariationSettings: "'FILL' 1" }}>light_mode</span>
                <div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-xl font-bold text-[#d6e4f9]">{conditions.temp}</p>
                    <span className="text-xs text-[#c5c6d1]/60">{conditions.location}</span>
                  </div>
                  <p className="text-[10px] text-[#ffb4ab] font-bold tracking-wider uppercase">
                    UV INDEX: {conditions.uvIndex} ({conditions.uvLevel})
                  </p>
                </div>
              </div>
              
              <div className="h-10 w-px bg-[#e6c364]/20"></div>
              
              <div className="flex-1 max-w-[170px]">
                <p className="text-xs text-[#c5c6d1] leading-tight font-medium">
                  {conditions.uvTip}
                </p>
              </div>
            </section>

            {/* Current Active Location Card with parallax landscape */}
            <section className="flex flex-col gap-3" id="current_location_selection">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#e6c364] text-[18px]">location_on</span>
                <span className="text-xs font-bold tracking-[0.2em] text-[#e6c364]/70 uppercase">CURRENT LOCATION</span>
              </div>

              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] glass-card group border border-[#e6c364]/20 shadow-xl">
                <div className="absolute inset-0 z-0">
                  <img 
                    alt="Active location backdrop" 
                    className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-1000"
                    src={location === 'Luxor' ? IMAGES.luxorGoldenHour : (location === 'Giza' ? IMAGES.pyramidShaded : IMAGES.luxorDuskSpires)} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#061423] via-transparent to-transparent"></div>
                </div>

                {/* You Are Here Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-[#e6c364]/20 backdrop-blur-md border border-[#e6c364]/40 px-3 py-1 rounded-full flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#e6c364] animate-pulse"></span>
                    <span className="text-[10px] font-extrabold text-[#e6c364] uppercase tracking-widest">YOU ARE HERE</span>
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <h3 className="font-serif text-2xl font-bold text-[#d6e4f9]">
                    {location === 'Luxor' ? 'Valley of the Kings' : (location === 'Giza' ? 'Pyramids of Giza' : 'Aswan Temple Cliffs')}
                  </h3>
                  <p className="text-xs text-[#c5c6d1]">
                    {location === 'Luxor' ? 'Luxor, West Bank' : (location === 'Giza' ? 'Giza Plateau, Cairo' : 'Granite Banks of the Nile')}
                  </p>
                </div>
              </div>
            </section>

            {/* Interactive Actions Grid */}
            <section className="grid grid-cols-2 gap-4" id="home_quick_actions">
              <button 
                id="action_ask_ra"
                onClick={() => {
                  setActiveTab("chat");
                  setActiveSiteContext(location === 'Luxor' ? "Luxor Temple" : (location === 'Giza' ? "Giza Necropolis" : "Philae Island"));
                }}
                className="glass-card p-5 rounded-2xl flex flex-col gap-3 hover:border-[#e6c364]/50 group text-left transition-all active:scale-95 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-[#785d00]/30 flex items-center justify-center text-[#e6c364]">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
                </div>
                <span className="text-sm font-semibold tracking-wide text-[#d6e4f9] group-hover:text-[#e6c364] transition-colors">Ask Ra</span>
              </button>

              <button 
                id="action_scanner"
                onClick={() => {
                  setScanLandmark(location === 'Luxor' ? "Luxor Temple" : (location === 'Giza' ? "Valley of the Kings" : "Karnak Temple"));
                  setActiveTab("explore");
                  setExploreMode("scanner");
                }}
                className="glass-card p-5 rounded-2xl flex flex-col gap-3 hover:border-[#e6c364]/50 group text-left transition-all active:scale-95 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-[#785d00]/30 flex items-center justify-center text-[#e6c364]">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
                </div>
                <span className="text-sm font-semibold tracking-wide text-[#d6e4f9] group-hover:text-[#e6c364] transition-colors">Identify Monument</span>
              </button>

              <button 
                id="action_plan_tour"
                onClick={() => setActiveTab("journey")}
                className="glass-card p-5 rounded-2xl flex flex-col gap-3 hover:border-[#e6c364]/50 group text-left transition-all active:scale-95 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-[#785d00]/30 flex items-center justify-center text-[#e6c364]">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>explore</span>
                </div>
                <span className="text-sm font-semibold tracking-wide text-[#d6e4f9] group-hover:text-[#e6c364] transition-colors">Plan My Tour</span>
              </button>

              <button 
                id="action_safety"
                onClick={() => setShowSafetyModal(true)}
                className="glass-card p-5 rounded-2xl flex flex-col gap-3 hover:border-[#ffb4ab]/40 group text-left transition-all active:scale-95 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-[#93000a]/20 flex items-center justify-center text-[#ffb4ab]">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                </div>
                <span className="text-sm font-semibold tracking-wide text-[#d6e4f9] group-hover:text-[#ffb4ab] transition-colors">Safety Status</span>
              </button>
            </section>

            {/* Active Quest Panel */}
            <section className="glass-card p-6 rounded-3xl border border-[#e6c364]/30 relative overflow-hidden" id="active_quest_section">
              <div className="absolute top-0 right-0 p-3 opacity-15">
                <span className="material-symbols-outlined text-[#e6c364] text-5xl">auto_awesome</span>
              </div>
              
              <div className="flex flex-col gap-4 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e6c364]">ACTIVE QUEST</span>
                  <div className="h-px flex- grow bg-[#e6c364]/20 flex-1"></div>
                </div>

                <h3 className="font-serif text-xl font-bold leading-snug text-[#d6e4f9]">
                  Discover the Secrets of Karnak Temple
                </h3>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-widest text-[#e6c364]/80">
                    <span>{questProgress === 100 ? "5/5 Clues Found" : "3/5 Clues Found"}</span>
                    <span>{questProgress}% COMPLETE</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#1e2b3b] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#e6c364] transition-all duration-700 shadow-[0_0_10px_#e6c364]"
                      style={{ width: `${questProgress}%` }}
                    ></div>
                  </div>
                </div>

                <button 
                  id="quest_continue_journey"
                  onClick={() => {
                    setScanLandmark("Karnak Temple");
                    setActiveTab("explore");
                    setExploreMode("scanner");
                  }}
                  className="mt-2 py-3 px-6 bg-[#e6c364] text-[#061423] text-xs font-bold uppercase tracking-wider rounded-full text-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  Continue Journey
                </button>
              </div>
            </section>

            {/* Today's Highlights Section */}
            <section className="flex flex-col gap-4" id="todays_highlights_shelf">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-bold text-[#d6e4f9]">Today's Highlights</h3>
                <button 
                  id="view_all_highlights_btn"
                  onClick={() => {
                    setActiveTab("journey");
                    window.scrollTo({ top: 300, behavior: "smooth" });
                  }}
                  className="text-xs font-semibold text-[#e6c364] hover:underline"
                >
                  View all
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {DEFAULT_HIGHLIGHTS.map((h) => (
                  <div 
                    key={h.id} 
                    className="glass-card rounded-2xl overflow-hidden flex h-32 hover:border-[#e6c364]/30 transition-all cursor-pointer"
                    onClick={() => handleQuickChatContext(h.category, `Tell me more about the ${h.title}`)}
                  >
                    <div className="w-1/3 h-full overflow-hidden relative">
                      <img alt={h.title} className="w-full h-full object-cover" src={h.image} />
                      <div className="absolute inset-0 bg-[#061423]/10"></div>
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-center gap-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#e6c364] uppercase tracking-wider">
                        <span className="material-symbols-outlined text-xs">{h.icon}</span>
                        {h.category}
                      </div>
                      <h4 className="text-sm font-semibold text-[#d6e4f9]">{h.title}</h4>
                      <p className="text-[11px] text-[#c5c6d1]/70">{h.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Decorative Divider */}
            <div className="flex items-center gap-4 py-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#e6c364]/30"></div>
              <span className="material-symbols-outlined text-[#e6c364]/40 text-xl font-serif">temple_hindu</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#e6c364]/30"></div>
            </div>

          </div>
        )}

        {/* -----------------------------------------------------------
            TAB 2: EXPLORE TAB (Camera Viewfinder Scan + Deep Dive Story)
            ----------------------------------------------------------- */}
        {activeTab === "explore" && (
          <div className="flex flex-col gap-6 fade-in whitespace-normal text-left">
            
            {/* Mode A: Simulated Scanner camera viewfinder */}
            {exploreMode === "scanner" && (
              <div className="flex flex-col gap-4">
                
                {/* Header context */}
                <div className="flex justify-between items-center bg-[#132030] p-3 rounded-xl border border-[#e6c364]/10">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-[#c5c6d1]/60 tracking-wider">Select target for camera</p>
                    <p className="text-xs font-bold text-[#e6c364]">{scanLandmark} Preset</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => setScanLandmark("Luxor Temple")}
                      className={`text-[10px] font-bold px-2 py-1 rounded ${scanLandmark === 'Luxor Temple' ? 'bg-[#e6c364] text-[#061423]' : 'bg-[#1e2b3b] text-[#c5c6d1]'}`}
                    >
                      Luxor
                    </button>
                    <button 
                      onClick={() => setScanLandmark("Karnak Temple")}
                      className={`text-[10px] font-bold px-2 py-1 rounded ${scanLandmark === 'Karnak Temple' ? 'bg-[#e6c364] text-[#061423]' : 'bg-[#1e2b3b] text-[#c5c6d1]'}`}
                    >
                      Karnak
                    </button>
                    <button 
                      onClick={() => setScanLandmark("Valley of the Kings")}
                      className={`text-[10px] font-bold px-2 py-1 rounded ${scanLandmark === 'Valley of the Kings' ? 'bg-[#e6c364] text-[#061423]' : 'bg-[#1e2b3b] text-[#c5c6d1]'}`}
                    >
                      Kings
                    </button>
                  </div>
                </div>

                {/* Simulated Lens Viewfinder Area */}
                <div 
                  className="relative overflow-hidden aspect-[4/3] rounded-3xl border border-[#e6c364]/30 shadow-2xl flex items-center justify-center bg-cover bg-center"
                  style={{ backgroundImage: `url(${scanLandmark === 'Luxor Temple' ? IMAGES.scanningPylon : (scanLandmark === 'Karnak Temple' ? IMAGES.karnakColumns : IMAGES.luxorDuskSpires)})` }}
                >
                  <div className="absolute inset-0 bg-[#061423]/15"></div>

                  {/* Laser brackets scan grid overlay */}
                  <div className="relative w-48 h-48 border border-[#e6c364]/10 rounded-2xl flex items-center justify-center">
                    {/* Corners */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#e6c364]/90 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#e6c364]/90 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#e6c364]/90 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#e6c364]/90 rounded-br-lg"></div>
                    
                    {/* Vertical sweep scanning neon laser lines */}
                    <div className="absolute w-full h-0.5 bg-[#e6c364] opacity-80 left-0 right-0 shadow-[0_0_15px_#e6c364] animate-bounce"></div>
                  </div>

                  {/* Overlays on frame: TOP Left: Live scanner flag, Right: Confidence meter */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
                    <div className="bg-[#93000a]/80 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 border border-[#ffb4ab]/30">
                      <span className="w-2 h-2 rounded-full bg-[#ffb4ab] animate-pulse"></span>
                      <span className="text-[9px] font-bold text-[#ffdad6] uppercase tracking-wider">LIVE IDENTIFICATION</span>
                    </div>

                    <div className="bg-[#132030]/80 backdrop-blur-md border border-[#e6c364]/30 px-3 py-1 rounded-full text-[9px] font-bold text-[#e6c364]">
                      AI CONFIDENCE: 97%
                    </div>
                  </div>

                  {/* Scanning Status overlay indicator */}
                  {isScanning && (
                    <div className="absolute inset-0 bg-[#061423]/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                      <Loader className="w-8 h-8 text-[#e6c364] animate-spin" />
                      <span className="text-xs uppercase tracking-widest font-semibold text-[#e6c364]">Analyzing artifact structure...</span>
                    </div>
                  )}

                  {/* Floating toast widget: +50 XP Reward notification */}
                  {showScannerToast && !isScanning && (
                    <div 
                      onClick={() => {
                        setClaimedXPMonument(true);
                        setShowScannerToast(false);
                      }}
                      className="absolute top-16 bg-[#785d00] text-[#ffe08f] border border-[#e6c364]/50 px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold shadow-lg animate-bounce cursor-pointer hover:brightness-110 active:scale-95 transition-transform"
                    >
                      <span className="material-symbols-outlined text-[#e6c364] text-sm font-bold">stars</span>
                      <span>{claimedXPMonument ? "+50 XP Claimed! Perfect" : "TAP TO CLAIM: +50 XP DISCOVERED!"}</span>
                      <X className="w-3 h-3 text-[#ffe08f]/60 hover:text-white" onClick={(e) => { e.stopPropagation(); setShowScannerToast(false); }} />
                    </div>
                  )}
                </div>

                {/* Identified Monument Slide-Up card summary */}
                <section className="glass-card rounded-[2rem] p-6 shadow-2xl relative overflow-hidden mt-4 border border-[#e6c364]/40">
                  <div className="absolute inset-0 hieroglyphic-pattern pointer-events-none opacity-30"></div>
                  
                  <div className="relative z-10 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-[#e6c364] font-bold tracking-widest uppercase mb-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>ANCIENT THEBES</span>
                        </div>
                        <h3 className="font-serif text-2xl font-bold text-[#d6e4f9]">
                          {detectedLandmark ? detectedLandmark.name : "Luxor Temple Pylon"}
                        </h3>
                        <p className="text-xs text-[#c5c6d1]/80 italic mt-0.5">
                          {detectedLandmark ? detectedLandmark.era : "Built by Ramesses II, 1279 BCE"}
                        </p>
                      </div>

                      <div className="w-12 h-12 bg-[#e6c364]/10 rounded-full flex items-center justify-center border border-[#e6c364]/30">
                        <span className="material-symbols-outlined text-[#e6c364]">history_edu</span>
                      </div>
                    </div>

                    {/* Companion speech bubble */}
                    <div className="bg-[#0f1c2c]/80 p-4 rounded-2xl border-l-4 border-[#e6c364] flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-[#e6c364]/30 bg-[#061423]">
                        <img alt="companion thumbnail" src={IMAGES.raMascot} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-xs font-semibold leading-relaxed text-[#d6e4f9] italic">
                        {detectedLandmark ? detectedLandmark.guideTip : `"You're looking at one of Egypt's finest examples of New Kingdom architecture!"`}
                      </p>
                    </div>

                    {/* Action grid links */}
                    <div className="grid grid-cols-2 gap-3 mt-1">
                      <button 
                        id="btn_audio_tour"
                        onClick={() => {
                          setPlayingAudioTour(!playingAudioTour);
                          if (!playingAudioTour) {
                            alert("Simulating Audio Tour: 'Welcome noble explorer to the great sanctuary built under the cosmic gaze of Amun...' Use the Volume indicators below!");
                          }
                        }}
                        className={`flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-transform active:scale-95 cursor-pointer shadow-md ${playingAudioTour ? 'bg-[#93000a] text-white border border-red-400' : 'bg-gradient-to-r from-[#e6c364] to-[#ffe08f] text-[#061423]'}`}
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>{playingAudioTour ? "Stop Audio Tour" : "Start Audio Tour"}</span>
                      </button>

                      <button 
                        id="btn_learn_more"
                        onClick={() => setExploreMode("deepdive")}
                        className="flex items-center justify-center gap-2 bg-[#1e2b3b]/50 border border-[#e6c364]/40 text-[#e6c364] py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-transform active:scale-95 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">menu_book</span>
                        <span>Learn More</span>
                      </button>
                    </div>

                    <button 
                      id="btn_add_journey"
                      onClick={() => {
                        alert(`Successfully integrated ${scanLandmark} as unlocked in your soul timeline database!`);
                        setQuestProgress(100);
                        if (!landmarksHistory.includes(scanLandmark)) {
                          setLandmarksHistory([...landmarksHistory, scanLandmark]);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-[#061423]/40 border border-[#c5c6d1]/20 text-[#d6e4f9] py-3 rounded-xl text-xs font-bold hover:bg-[#061423]/60 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">add_task</span>
                      <span>Add to Journey History</span>
                    </button>
                  </div>
                </section>

              </div>
            )}

            {/* Mode B: Full-Scope Detail Deep Dive of Luxor Temple */}
            {exploreMode === "deepdive" && (
              <div className="flex flex-col gap-6 fade-in pt-2">
                <div className="flex items-center justify-between">
                  <button 
                    id="deepdive_back_btn"
                    onClick={() => setExploreMode("scanner")}
                    className="bg-[#132030] text-[#e6c364] border border-[#e6c364]/30 px-3 py-1.5 rounded-xl flex items-center gap-1 text-xs font-semibold cursor-pointer active:scale-95"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Lens Scanner</span>
                  </button>
                  <span className="text-[10px] tracking-widest font-extrabold uppercase text-[#e6c364]/70">EXPLORE DATABASE</span>
                </div>

                {/* Grand Header Image overlay */}
                <div className="relative rounded-2xl overflow-hidden aspect-[16/10] shadow-2xl border border-[#e6c364]/30">
                  <img alt="Hero Deep" className="w-full h-full object-cover transition-transform" src={IMAGES.luxorGoldenHour} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#061423] via-[#061423]/40 to-transparent"></div>
                  
                  <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col gap-1">
                    <h2 className="font-serif text-3xl font-extrabold text-[#e6c364]">Luxor Temple</h2>
                    <div className="flex justify-between items-center text-sm text-[#ffe08f]/80">
                      <span className="font-serif italic text-base">معبد الأقصر</span>
                      <span className="text-xs uppercase font-extrabold font-sans">Thebes • 1400 BCE</span>
                    </div>
                  </div>
                </div>

                {/* Dynamic Inner Tabs: Story, Ra's Guide, Hidden Gems, Practical Info */}
                <div className="flex gap-1.5 border-b border-[#e6c364]/20 overflow-x-auto pb-1 no-scrollbar select-none" id="deepdive_sub_navigation">
                  {(["Story", "Ra's Guide", "Hidden Gems", "Practical Info"] as any[]).map((tabName) => (
                    <button
                      key={tabName}
                      onClick={() => setDeepDiveTab(tabName)}
                      className={`text-xs font-bold px-3 py-2 border-b-2 tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${deepDiveTab === tabName ? 'text-[#e6c364] border-[#e6c364]' : 'text-[#8f909a] border-transparent hover:text-white'}`}
                    >
                      {tabName}
                    </button>
                  ))}
                </div>

                {/* Sub Tab Content Container */}
                <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 text-xs tracking-wide leading-relaxed">
                  {deepDiveTab === "Story" && (
                    <div className="flex flex-col gap-4">
                      <p className="font-serif text-[#d6e4f9] italic text-sm border-l-2 border-[#e6c364] pl-3 leading-relaxed">
                        "Step where pharaohs were crowned. Luxor Temple is not just a structure; it's a living conduit between the mortal and the divine."
                      </p>
                      <p className="text-[#c5c6d1]">
                        Unlike other temples in Thebes, Luxor was not dedicated to a cult god or a deified king in death. Instead, it was dedicated to the rejuvenation of kingship; it may have been where many of the kings of Egypt were actually crowned.
                      </p>
                      <p className="text-[#c5c6d1]">
                        The temple is a masterpiece of architectural layering. Amenhotep III built the inner sanctum, while Ramesses II added the massive pylon and outer courtyard, flanking the entrance with the towering obelisks that once whispered to the stars.
                      </p>
                    </div>
                  )}

                  {deepDiveTab === "Ra's Guide" && (
                    <div className="flex flex-col gap-3">
                      <h4 className="font-serif text-sm text-[#e6c364] font-bold">Divine Alignments & Astronomical Calculations</h4>
                      <p className="text-[#c5c6d1]">
                        The axis of Luxor Temple is subtly aligned to match solar trajectories during astronomical festivals, signaling the rising of the Nile flooding waters.
                      </p>
                      <p className="text-[#ffe08f] italic bg-[#132030]/50 p-2.5 rounded border border-[#e6c364]/20 font-medium">
                        ✦ Ra's Secret: Watch the sunset rays fall directly over the sanctum entrance around early autumn. We recommend standing near the secondary court.
                      </p>
                    </div>
                  )}

                  {deepDiveTab === "Hidden Gems" && (
                    <div className="flex flex-col gap-3">
                      <h4 className="font-serif text-sm text-[#e6c364] font-bold">The Lost Relics & Hieroglyphic Enigmas</h4>
                      <ul className="list-disc pl-4 space-y-1 text-[#c5c6d1]">
                        <li><b>Alexander's Recessed Cell:</b> Tucked behind the main corridor, where Alexander the Great had hieroglyphs carved mimicking a Pharaoh.</li>
                        <li><b>Avenue of Sphinxes:</b> A grand 3km track linking Luxor to Karnak, originally flanked by 1,350 quartzite sphinx statues.</li>
                      </ul>
                    </div>
                  )}

                  {deepDiveTab === "Practical Info" && (
                    <div className="grid grid-cols-2 gap-3 text-[#c5c6d1]">
                      <div className="bg-[#132030] p-2 rounded">
                        <p className="font-bold text-[#e6c364]">Entrance Tickets</p>
                        <p>Adult: EGP 300</p>
                        <p>Student: EGP 150</p>
                      </div>
                      <div className="bg-[#132030] p-2 rounded">
                        <p className="font-bold text-[#e6c364]">Opening Hours</p>
                        <p>Hours: 06:00 AM - 10:00 PM</p>
                        <p>Best visit: Night lights (08:00 PM)</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Timeline slide track: Echoes of Time */}
                <section className="flex flex-col gap-3">
                  <h3 className="font-serif text-lg font-bold text-[#e6c364]">Echoes of Time</h3>
                  <div className="relative overflow-x-auto custom-scrollbar py-4 flex gap-4 no-scrollbar">
                    
                    <div className="flex-shrink-0 w-64 glass-card p-5 rounded-xl relative">
                      <span className="absolute -top-3 left-4 px-3 py-1 bg-[#e6c364] text-[#061423] rounded-full text-[10px] font-bold uppercase">1400 BCE</span>
                      <h4 className="font-serif text-sm text-[#e6c364] mt-2 mb-1">Amenhotep III</h4>
                      <p className="text-[11px] text-[#c5c6d1]">The core temple is constructed, dedicated to the rejuvenation of kingship.</p>
                    </div>

                    <div className="flex-shrink-0 w-64 glass-card p-5 rounded-xl relative">
                      <span className="absolute -top-3 left-4 px-3 py-1 bg-[#e6c364] text-[#061423] rounded-full text-[10px] font-bold uppercase">1250 BCE</span>
                      <h4 className="font-serif text-sm text-[#e6c364] mt-2 mb-1">Ramesses II</h4>
                      <p className="text-[11px] text-[#c5c6d1]">The Great Pylon and the seated statues are added to the temple entrance.</p>
                    </div>

                    <div className="flex-shrink-0 w-64 glass-card p-5 rounded-xl relative">
                      <span className="absolute -top-3 left-4 px-3 py-1 bg-[#e6c364] text-[#061423] rounded-full text-[10px] font-bold uppercase">332 BCE</span>
                      <h4 className="font-serif text-sm text-[#e6c364] mt-2 mb-1">Alexander Great</h4>
                      <p className="text-[11px] text-[#c5c6d1]">The sanctuary is rebuilt by the conqueror to legitimize his rule in the Nile.</p>
                    </div>
                  </div>
                </section>

                {/* Gallery Bento Grid layout: Visual Relics */}
                <section className="flex flex-col gap-3">
                  <h3 className="font-serif text-lg font-bold text-[#e6c364]">Visual Relics</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative rounded-2xl overflow-hidden shadow-lg border border-[#e6c364]/20 group">
                      <img alt="Relic 1" src={IMAGES.relicHieroglyphs} className="w-full h-32 object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-[#061423]/10"></div>
                    </div>
                    <div className="relative rounded-2xl overflow-hidden shadow-lg border border-[#e6c364]/20 group">
                      <img alt="Relic 2" src={IMAGES.relicNocturnal} className="w-full h-32 object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-[#061423]/10"></div>
                    </div>
                    <div className="relative rounded-2xl overflow-hidden shadow-lg border border-[#e6c364]/20 group">
                      <img alt="Relic 3" src={IMAGES.relicSeatedColossus} className="w-full h-32 object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-[#061423]/10"></div>
                    </div>
                    <div className="relative rounded-2xl overflow-hidden shadow-lg border border-[#e6c364]/20 group">
                      <img alt="Relic 4" src={IMAGES.relicAmenhotepColonnade} className="w-full h-32 object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-[#061423]/10"></div>
                    </div>
                  </div>
                </section>

                {/* Floating Ra Button portal to Chat Tab */}
                <div className="py-4">
                  <button 
                    id="ask_ra_about_site_btn"
                    onClick={() => {
                      handleQuickChatContext("Luxor Temple", "What are the celestial mysteries hidden within the pillars of Luxor Temple?");
                    }}
                    className="w-full bg-gradient-to-r from-[#e6c364] to-[#785d00] text-[#061423] font-bold py-4 rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-lg cursor-pointer"
                  >
                    <span>Ask Ra about this site</span>
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-white/20 p-0.5">
                      <img alt="Ra profile small" src={IMAGES.raMascot} className="w-full h-full object-contain" />
                    </div>
                  </button>
                </div>

              </div>
            )}

          </div>
        )}

        {/* -----------------------------------------------------------
            TAB 3: RA CHAT (Gemini Dynamic Chat interface)
            ----------------------------------------------------------- */}
        {activeTab === "chat" && (
          <div className="flex flex-col gap-6 fade-in whitespace-normal text-left" id="chat_tab_screen">
            
            {/* Context Pill Indicator */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 relative overflow-hidden bg-gradient-to-tr from-[#132030] to-[#e6c364]/30 rounded-full p-1 animate-float shadow-xl border border-[#e6c364]/35">
                <img alt="Ra Mascot Avatar larger" className="w-full h-full object-cover" src={IMAGES.raMascot} />
              </div>

              <div className="px-4 py-1.5 glass-pill text-xs font-bold text-[#e6c364] flex items-center gap-2 tracking-wide shadow-lg">
                <span className="w-2 h-2 bg-[#e6c364] rounded-full animate-pulse"></span>
                <span>Discussing: {location} Ruins</span>
              </div>
            </div>

            {/* Simulated/Real chat window bubble list container */}
            <div className="bg-[#132030]/40 rounded-3xl p-5 border border-[#e6c364]/25 flex flex-col gap-5 max-h-[460px] overflow-y-auto no-scrollbar shadow-inner">
              {chatMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div 
                    className={`p-4 rounded-2xl max-w-[85%] shadow-xl leading-relaxed text-xs border ${msg.sender === 'user' ? 'bg-gradient-to-br from-[#1a2b5e] to-[#0f1c2c] border-[#b5c4ff]/30 text-white rounded-br-sm' : 'bg-gradient-to-tr from-[#132030] to-[#0f1c2c]/80 border-[#e6c364]/30 text-[#d6e4f9] rounded-bl-sm'}`}
                    dangerouslySetInnerHTML={{ __html: msg.text }}
                  />
                  <span className="text-[10px] text-[#c5c6d1]/40 mt-1 px-1">{msg.time}</span>
                </div>
              ))}

              {/* Loader visual if waiting for backend reply */}
              {raIsThinking && (
                <div className="flex items-center gap-2 mt-2 pl-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[#e6c364] rounded-full animate-bounce [animation-delay:0s]"></span>
                    <span className="w-1.5 h-1.5 bg-[#e6c364] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-[#e6c364] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span className="text-xs text-[#c5c6d1]/40 italic">Ra is consulting the celestial archives...</span>
                </div>
              )}
              
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 text-xs font-bold leading-relaxed whitespace-nowrap">
              <button 
                onClick={() => handleSendChatMessage("What are the hidden celestial secrets of Karnak Temple?")}
                className="bg-[#1e2b3b] border border-[#e6c364]/30 text-[#e6c364] px-3.5 py-1.5 rounded-full hover:bg-[#e6c364]/10 active:scale-95 transition-all text-xs font-semibold cursor-pointer"
              >
                Reveal Karnak secrets 🔮
              </button>
              <button 
                onClick={() => handleSendChatMessage("How did the ancient Egyptians carve hard granite stones?")}
                className="bg-[#1e2b3b] border border-[#e6c364]/30 text-[#e6c364] px-3.5 py-1.5 rounded-full hover:bg-[#e6c364]/10 active:scale-95 transition-all text-xs font-semibold cursor-pointer"
              >
                How did they carve granite? ⛏️
              </button>
              <button 
                onClick={() => handleSendChatMessage("What is the official entry ticket price for Giza Pyramids?")}
                className="bg-[#1e2b3b] border border-[#e6c364]/30 text-[#e6c364] px-3.5 py-1.5 rounded-full hover:bg-[#e6c364]/10 active:scale-95 transition-all text-xs font-semibold cursor-pointer"
              >
                Entrance prices? 🎫
              </button>
            </div>

            {/* Absolute Text Message input slot */}
            <div className="bg-[#132030] border border-[#e6c364]/35 rounded-full p-2 flex items-center gap-2 mt-2">
              <button 
                onClick={() => handleSendChatMessage("Simulated Image Analysis Request! Identifing standard scarab inscriptions...")}
                className="w-10 h-10 flex items-center justify-center text-[#e6c364]/80 hover:text-[#e6c364] hover:bg-[#0f1c2c] rounded-full transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">photo_camera</span>
              </button>
              <input 
                id="chat_text_input"
                type="text"
                placeholder="Speak to Ra or ask travel lore..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                className="flex-1 bg-transparent border-none text-sm text-white focus:outline-none focus:ring-0 placeholder-[#c5c6d1]/40 font-sans"
              />
              <button 
                id="audio_listen_mic_btn"
                onClick={() => {
                  alert("Listening... Say: 'What built Luxor Temple?' or 'Is Luxor hot today?'");
                  setChatInput("What built Luxor Temple?");
                }}
                className="w-10 h-10 rounded-full bg-[#1c2d60] border border-[#b5c4ff]/30 text-[#b5c4ff] flex items-center justify-center active:scale-95 transition-transform font-bold mr-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">mic</span>
              </button>
              <button 
                id="chat_send_button"
                onClick={() => handleSendChatMessage()}
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#785d00] to-[#e6c364] text-[#061423] flex items-center justify-center shadow-lg active:scale-90 transition-transform font-bold cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* -----------------------------------------------------------
            TAB 4: JOURNEY (Interactive Customized generator & Ticket sales)
            ----------------------------------------------------------- */}
        {activeTab === "journey" && (
          <div className="flex flex-col gap-6 fade-in whitespace-normal text-left" id="journey_itinerary_tab">
            
            {/* Header branding */}
            <section className="space-y-2">
              <h2 className="font-serif text-3xl font-extrabold text-[#e6c364]">The Pharaoh's Path</h2>
              <p className="text-xs text-[#c5c6d1]/90">
                Curate your customized Egyptian odyssey with premium transport, private guides, and elite escapes.
              </p>
            </section>

            {/* Planner config widget */}
            <section className="glass-card p-5 rounded-2xl border border-[#e6c364]/30 flex flex-col gap-4">
              <div className="flex justify-between items-center bg-[#132030] p-3 rounded-xl border border-[#e6c364]/10">
                <span className="text-xs font-bold text-[#e6c364] uppercase tracking-wider">Configure Voyage with Ra</span>
                <span className="text-[10px] text-emerald-400 font-bold">INTELLIGENT PLANNER</span>
              </div>

              {/* Number of days */}
              <div className="flex flex-col gap-1.5 text-xs">
                <span className="text-[#c5c6d1]/70 font-semibold uppercase">How many days?</span>
                <div className="flex gap-2">
                  {[2, 3, 5].map((d) => (
                    <button
                      key={d}
                      id={`day_button_${d}`}
                      onClick={() => setItineraryDays(d)}
                      className={`flex-1 py-2 rounded-lg font-bold text-xs uppercase ${itineraryDays === d ? 'bg-[#e6c364] text-[#061423]' : 'bg-[#1e2b3b] text-[#c5c6d1]'}`}
                    >
                      {d} Days
                    </button>
                  ))}
                </div>
              </div>

              {/* Travel Interests */}
              <div className="flex flex-col gap-1.5 text-xs">
                <span className="text-[#c5c6d1]/70 font-semibold uppercase">Travel Focus / Interests</span>
                <div className="flex flex-wrap gap-2">
                  {["Archaeology", "Cruising", "Balloon Flights", "Culinary", "Local Souks"].map((interest) => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${selectedInterests.includes(interest) ? 'bg-[#e6c364]/20 border-[#e6c364] text-[#e6c364]' : 'bg-[#1e2b3b] border-transparent text-[#c5c6d1]'}`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optimize Selector Toggler */}
              <div className="flex items-center justify-between bg-[#132030]/60 p-3 rounded-xl border border-[#e6c364]/10">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#e6c364] text-lg font-bold">tune</span>
                  <span className="text-xs font-bold">Optimize for my interests</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={optimizeForInterests}
                    onChange={(e) => setOptimizeForInterests(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-[#283646] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#e6c364] after:border-[#e6c364] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e6c364]/30"></div>
                </label>
              </div>

              {/* Generate CTA Button */}
              <button 
                id="generate_itinerary_btn"
                onClick={handleGenerateItinerary}
                disabled={isGeneratingPlan}
                className="w-full py-4 rounded-xl font-serif text-sm bg-[#e6c364] text-[#061423] font-bold uppercase tracking-widest shadow-lg shadow-[#e6c364]/20 hover:scale-[1.02] active:scale-95 transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                {isGeneratingPlan ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin text-[#061423]" />
                    <span>Ra is engraving scrolls...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#061423]" />
                    <span>GENERATE LUXURY PLAN</span>
                  </>
                )}
              </button>
            </section>

            {/* Displaying Current Itinerary timeline flow */}
            <div className="relative border-l border-[#e6c364]/20 pl-6 space-y-8 mt-4">
              <div className="absolute top-0 bottom-0 left-0 w-pxTimeline bg-gradient-to-b from-[#e6c364] to-transparent"></div>
              
              <div className="flex items-center gap-2 bg-[#132030] p-3 rounded-lg border border-[#e6c364]/25 max-w-sm mb-4">
                <span className="text-xs uppercase font-extrabold text-[#e6c364]">ACTIVE TIMELINE:</span>
                <span className="text-xs font-bold text-white">{tourPlan.title}</span>
              </div>

              {tourPlan.days.slice(0, itineraryDays).map((dayPlan) => (
                <div key={dayPlan.id} className="relative z-10">
                  {/* Glowing vertical node */}
                  <div className="absolute -left-[30px] top-1 w-3 h-3 rounded-full bg-[#e6c364] shadow-[0_0_8px_#e6c364]" />
                  
                  <h3 className="font-serif text-lg font-extrabold text-[#e6c364] mb-3">
                    {dayPlan.title}
                  </h3>

                  <div className="flex flex-col gap-4">
                    {dayPlan.items.map((item, index) => (
                      <div key={index} className="glass-card p-4 rounded-xl border border-[#e6c364]/15 hover:border-[#e6c364]/35 transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-bold text-[#ffe08f]">{item.time}</span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: item.rating }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-[#e6c364] text-[#e6c364]" />
                            ))}
                          </div>
                        </div>

                        <h4 className="text-sm font-semibold text-white mb-2">{item.title}</h4>
                        
                        {item.imgUrl && (
                          <div className="rounded-lg overflow-hidden h-36 w-full mb-3 border border-[#e6c364]/15">
                            <img alt={item.title} src={item.imgUrl} className="w-full h-full object-cover" />
                          </div>
                        )}

                        <p className="text-xs text-[#c5c6d1] leading-relaxed mb-3">
                          {item.description}
                        </p>

                        <div className="flex gap-4 text-[10px] uppercase font-bold text-[#e6c364]/70">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">schedule</span> {item.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">directions_car</span> {item.transport}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive transportation catalog */}
            <section className="space-y-4 pt-4" id="transport_catalog">
              <div className="flex justify-between items-end">
                <h3 className="font-serif text-xl font-bold text-[#e6c364]">Transportation</h3>
                <span className="text-[10px] font-bold text-[#e6c364]/70 uppercase tracking-widest">Across the Nile</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card rounded-xl p-4 flex flex-col gap-3 group active:scale-95 transition-transform border border-[#e6c364]/15 hover:border-[#e6c364]/40 cursor-pointer">
                  <div className="flex justify-between items-start text-[#e6c364]">
                    <span className="material-symbols-outlined text-2xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>directions_car</span>
                    <span className="text-xs font-bold font-sans">EGP 45</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Careem</p>
                    <p className="text-[10px] text-[#c5c6d1]/60">Reliable local ride</p>
                  </div>
                </div>

                <div className="glass-card rounded-xl p-4 flex flex-col gap-3 group active:scale-95 transition-transform border border-[#e6c364]/15 hover:border-[#e6c364]/40 cursor-pointer">
                  <div className="flex justify-between items-start text-[#e6c364]">
                    <span className="material-symbols-outlined text-2xl font-bold">local_taxi</span>
                    <span className="text-xs font-bold font-sans">Varies</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Local Taxi</p>
                    <p className="text-[10px] text-[#c5c6d1]/60">Street hailing</p>
                  </div>
                </div>

                <div className="glass-card rounded-xl p-4 flex flex-col gap-3 group active:scale-95 transition-transform border border-[#e6c364]/15 hover:border-[#e6c364]/40 cursor-pointer">
                  <div className="flex justify-between items-start text-[#e6c364]">
                    <span className="material-symbols-outlined text-2xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>airport_shuttle</span>
                    <span className="text-xs font-bold font-sans">EGP 5</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Microbus</p>
                    <p className="text-[10px] text-[#c5c6d1]/60">Local transit</p>
                  </div>
                </div>

                <div className="glass-card rounded-xl p-4 flex flex-col gap-3 group active:scale-95 transition-transform border border-[#e6c364]/15 hover:border-[#e6c364]/40 cursor-pointer">
                  <div className="flex justify-between items-start text-[#e6c364]">
                    <span className="material-symbols-outlined text-2xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>directions_boat</span>
                    <span className="text-xs font-bold font-sans">EGP 15</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Nile Ferry</p>
                    <p className="text-[10px] text-[#c5c6d1]/60">Scenic crossing</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Stays & Accommodations */}
            <section className="space-y-4 pt-4" id="luxury_escapes_slider">
              <div className="flex justify-between items-end">
                <h3 className="font-serif text-xl font-bold text-[#e6c364]">Luxury Stays</h3>
                <span className="text-[10px] text-[#ffe08f]/80 font-semibold font-sans">via Booking.com</span>
              </div>

              <div className="flex overflow-x-auto gap-4 pb-2 no-scrollbar custom-scrollbar">
                {LUXURY_STAYS.map((stay) => (
                  <div key={stay.id} className="min-w-[240px] glass-card rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                    <div className="h-32 w-full relative">
                      <img alt={stay.name} src={stay.imgUrl} className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 bg-[#061423]/70 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-bold text-[#e6c364]">
                        {stay.rating}
                      </div>
                    </div>
                    <div className="p-3.5 flex flex-col gap-1 flex-1 justify-between text-xs">
                      <div>
                        <h4 className="font-serif font-bold text-white leading-tight">{stay.name}</h4>
                        <p className="text-[10px] text-[#c5c6d1]">{stay.location}</p>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-[#e6c364]/10">
                        <span className="font-bold text-[#e6c364]">{stay.price}</span>
                        <Heart className="w-4 h-4 text-[#e6c364] hover:fill-[#e6c364] cursor-pointer" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Official Entrance Pass ticketing section */}
            <section className="glass-card rounded-2xl p-6 relative overflow-hidden border-2 border-[#e6c364]/30 mt-4" id="official_passes_checkout">
              <div className="absolute -right-6 -top-6 opacity-5 pointer-events-none">
                <span className="material-symbols-outlined text-[100px] text-[#e6c364]">confirmation_number</span>
              </div>

              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1 text-[#e6c364]">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#e6c364]">OFFICIAL EXPEDITION ENTRY</span>
                  </div>
                  <h3 className="font-serif text-xl font-extrabold text-white">Karnak Temple Entrance</h3>
                  <p className="text-xs text-[#c5c6d1]/80 leading-relaxed">
                    Ensure secure entrance without queuing under the blinding afternoon chariot of Ra. Includes access to Amun Temple.
                  </p>
                </div>

                <div className="flex justify-between items-center border-t border-[#e6c364]/20 pt-4 mt-2">
                  <div>
                    <span className="text-[10px] text-[#c5c6d1]/50 uppercase block font-medium">Standard ticket</span>
                    <span className="font-bold text-lg text-[#e6c364] font-sans">EGP 360</span>
                  </div>

                  <button
                    id="buy_ticket_btn"
                    onClick={() => {
                      setBookedTicket(true);
                      alert("Simulating Transaction: EGP 360 processed through secure gateway. Your official PDF pass is synced to Rihla Pro wallet!");
                    }}
                    className="bg-[#e6c364] text-[#061423] font-bold text-xs px-6 py-3 rounded-lg shadow-lg shadow-[#e6c364]/20 active:scale-95 transition-all text-center cursor-pointer"
                  >
                    {bookedTicket ? "TICKET PURCHASED ✔" : "Buy Ticket"}
                  </button>
                </div>
              </div>
            </section>

            {/* Divine Tip Floating Box */}
            <section className="flex items-center gap-3 bg-[#132030] p-4 rounded-xl border border-[#e6c364]/30">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#e6c364] p-0.5">
                <img alt="Ra guide" src={IMAGES.raMascot} className="w-full h-full object-cover rounded-full" />
              </div>
              <div className="flex-1 leading-normal text-xs text-[#c5c6d1]">
                "Book your Karnak ticket now to skip the midday sun queues, traveler."
              </div>
              <div className="w-2 h-2 bg-[#e6c364] rounded-full animate-pulse"></div>
            </section>

          </div>
        )}

        {/* -----------------------------------------------------------
            TAB 5: PROFILE HUB & ACHIEVEMENTS LEVEL METRICS
            ----------------------------------------------------------- */}
        {activeTab === "profile" && (
          <div className="flex flex-col gap-6 fade-in whitespace-normal text-left" id="profile_tab_screen">
            
            {/* Header Profile Info section */}
            <section className="flex flex-col items-center gap-4 text-center">
              <div className="relative mb-2">
                <div className="w-24 h-24 rounded-full border-2 border-[#e6c364] p-1 shadow-2xl">
                  <img alt="user portrait" className="w-full h-full rounded-full object-cover" src={IMAGES.alexanderVance} />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#e6c364] to-[#785d00] text-[#061423] px-3.5 py-0.5 rounded-full shadow-lg text-[9px] font-extrabold uppercase whitespace-nowrap tracking-wider">
                  Explorer Level 7
                </div>
              </div>

              <div>
                <h2 className="font-serif text-2xl font-extrabold text-white">Alexander Vance</h2>
                <div className="flex justify-center mt-1">
                  <div className="glass-pill px-3 py-1 flex items-center gap-1 text-[10px] gold-gradient-text tracking-wide border border-[#e6c364]/40 shadow-inner">
                    <span className="material-symbols-outlined text-[#e6c364] text-xs">workspace_premium</span>
                    <span>Rihla Pro — Active</span>
                  </div>
                </div>
              </div>
            </section>

            {/* VIP Level Progress metrics bar */}
            <section className="glass-card p-5 rounded-2xl border border-[#e6c364]/30 flex flex-col gap-3">
              <div className="flex justify-between text-xs">
                <span className="text-[#ffe08f]/80 font-bold tracking-wider">Soul-Discovery XP</span>
                <span className="font-sans font-bold text-white">1,240 / 1,500 XP</span>
              </div>

              <div className="w-full h-2.5 bg-[#132030] rounded-full overflow-hidden border border-[#e6c364]/20 relative">
                <div 
                  className="h-full bg-[#e6c364] shadow-[0_0_8px_#e6c364]"
                  style={{ width: "82%" }}
                ></div>
              </div>

              <p className="text-[10px] text-[#c5c6d1]/60 leading-normal text-center">
                Unlocks level 8 <b className="text-secondary font-semibold">"PHARAOH'S CHRONICLER"</b> at 1,500 XP points.
              </p>
            </section>

            {/* Stats Bento Grid layout */}
            <section className="grid grid-cols-2 gap-4">
              <div className="glass-card p-5 rounded-xl aspect-square flex flex-col justify-between hover:border-[#e6c364]/45 transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[#e6c364] text-3xl">temple_hindu</span>
                <div>
                  <h4 className="text-3xl font-extrabold text-[#d6e4f9] font-sans">14</h4>
                  <p className="text-[10px] text-[#c5c6d1]/80 font-bold uppercase tracking-wider">Sites Visited</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="glass-card p-4 rounded-xl flex-1 flex flex-col justify-between hover:border-[#e6c364]/45 transition-colors">
                  <div className="flex justify-between items-start">
                    <span className="material-symbols-outlined text-[#e6c364] text-xl">chat_bubble</span>
                    <span className="text-[9px] font-sans text-[#e6c364]/80">87 Questions</span>
                  </div>
                  <p className="text-[11px] text-[#c5c6d1]/60 font-semibold uppercase">Ra Chat Activity</p>
                </div>

                <div className="glass-card p-4 rounded-xl flex-1 flex flex-col justify-between border-[#e6c364]/40 bg-[#e6c364]/5">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xl font-bold font-sans text-[#e6c364]">4,230</h4>
                    <span className="material-symbols-outlined text-[#e6c364] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
                  </div>
                  <p className="text-[11px] text-[#c5c6d1]/60 font-semibold uppercase">Total XP</p>
                </div>
              </div>
            </section>

            {/* Explorer Leaderboard snippet */}
            <section className="flex flex-col gap-3">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-serif text-lg font-bold text-[#e6c364]">Global Explorers</h3>
                <span className="text-[10px] text-[#ffe08f]/80 tracking-widest font-extrabold uppercase">Live Ranks</span>
              </div>

              <div className="bg-[#132030]/80 rounded-2xl overflow-hidden border border-[#e6c364]/25">
                <div className="divide-y divide-[#e6c364]/10 text-xs">
                  {LEADERBOARD.map((user) => (
                    <div 
                      key={user.rank}
                      className={`px-4 py-3 flex items-center justify-between ${user.isUser ? 'bg-[#e6c364]/10 text-[#e6c364] font-bold border-l-4 border-[#e6c364]' : 'text-[#c5c6d1]'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-sans font-extrabold text-[#c5c6d1]/50 w-6">{user.rank}</span>
                        <span>{user.name}</span>
                      </div>
                      <span className="font-sans">{user.xp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Profile Preferences Widget selection pane */}
            <section className="flex flex-col gap-4">
              <h3 className="font-serif text-lg font-bold text-[#e6c364] uppercase tracking-wider">Preferences</h3>
              
              <div className="flex flex-col gap-3 text-xs leading-normal">
                {/* Languages EN AR switch */}
                <div className="flex items-center justify-between p-4 glass-card rounded-xl border border-[#e6c364]/15">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#c5c6d1]">language</span>
                    <span className="font-semibold text-white">App Navigation Language</span>
                  </div>
                  
                  <div className="flex bg-[#283646] rounded-full p-0.5 border border-[#e6c364]/20">
                    <button 
                      onClick={() => setLanguage("en")}
                      className={`px-4 py-1 rounded-full font-bold text-[10px] uppercase transition-all ${language === 'en' ? 'bg-[#e6c364] text-[#061423] shadow-md' : 'text-[#c5c6d1]'}`}
                    >
                      EN
                    </button>
                    <button 
                      onClick={() => setLanguage("ar")}
                      className={`px-4 py-1 rounded-full font-bold text-[10px] uppercase transition-all ${language === 'ar' ? 'bg-[#e6c364] text-[#061423] shadow-md' : 'text-[#c5c6d1]'}`}
                    >
                      AR
                    </button>
                  </div>
                </div>

                {/* Voice toggle switch */}
                <div className="flex items-center justify-between p-4 glass-card rounded-xl border border-[#e6c364]/15">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#c5c6d1]">record_voice_over</span>
                    <span className="font-semibold text-white">Ra's AI Audio Guide Voice</span>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isVoiceActive}
                      onChange={(e) => setIsVoiceActive(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-[#283646] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#e6c364] after:border-[#e6c364] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e6c364]/30 border border-[#e6c364]/30"></div>
                  </label>
                </div>

                {/* Tour Detail depth levels selected */}
                <div className="flex items-center justify-between p-4 glass-card rounded-xl border border-[#e6c364]/15">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#c5c6d1]">menu_book</span>
                    <span className="font-semibold text-white">Tour Depth Level</span>
                  </div>

                  <select 
                    id="tour_depth_preference"
                    value={detailDepth}
                    onChange={(e) => setDetailDepth(e.target.value)}
                    className="bg-[#132030] text-[#e6c364] border border-[#e6c364]/30 font-bold rounded-lg text-[10px] py-1 px-3 focus:outline-none focus:ring-0 uppercase tracking-wide font-sans cursor-pointer"
                  >
                    <option value="Scholarly">Scholarly (Deep Egyptology)</option>
                    <option value="Explorer">Explorer (Adventure Stories)</option>
                    <option value="Quick Link">Quick Story (Light Highlights)</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Offline manager card downloads */}
            <section className="flex flex-col gap-4">
              <h3 className="font-serif text-lg font-bold text-[#e6c364] uppercase tracking-wider">Offline Map Packs</h3>
              
              <div className="relative overflow-hidden glass-card rounded-2xl group border border-[#e6c364]/20">
                <div className="absolute inset-0 bg-gradient-to-r from-[#061423]/90 via-[#061423]/30 to-transparent z-10"></div>
                <img className="w-full h-32 object-cover scale-110 group-hover:scale-100 transition-transform duration-[1200ms]" src={IMAGES.luxorDuskSpires} alt="Luxor offline pack" />
                
                <div className="absolute inset-0 z-20 p-4 flex flex-col justify-center text-xs">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-serif text-lg font-extrabold text-white">Luxor Pack</h4>
                      <p className="text-xs text-[#c5c6d1]/80">Offline full audio & vector maps (1.2 GB)</p>
                    </div>

                    <button 
                      id="luxor_pack_download_btn"
                      disabled={isDownloading || isLuxorPackDownloaded}
                      onClick={() => setIsDownloading(true)}
                      className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#ffe08f] to-[#e6c364] flex items-center justify-center text-[#061423] shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      {isDownloading ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : isLuxorPackDownloaded ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Download className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {isDownloading && (
                    <div className="mt-3 w-full bg-[#132030]/80 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#e6c364] h-full transition-all" style={{ width: `${downloadProgress}%` }}></div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Extra profile triggers */}
            <section className="flex flex-col gap-2 pt-2 border-t border-[#e6c364]/10 text-xs font-semibold uppercase tracking-wider">
              <button onClick={() => alert("Redirecting to premium secure payment link portal...")} className="flex justify-between items-center p-3 text-[#c5c6d1] hover:text-[#e6c364] transition-colors cursor-pointer text-left">
                <span>Payment Methods</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={() => alert("Opening secure end-to-end telemetry lock logs...")} className="flex justify-between items-center p-3 text-[#c5c6d1] hover:text-[#e6c364] transition-colors cursor-pointer text-left">
                <span>Privacy & Security</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              
              <button 
                id="reset_onboarding_btn"
                onClick={() => setHasBegun(false)}
                className="flex justify-between items-center p-3 text-[#ffe08f]/80 hover:text-white transition-colors cursor-pointer text-left"
              >
                <span>Re-visit Welcome Splash Screen</span>
                <span className="material-symbols-outlined text-xs">restart_alt</span>
              </button>

              <button 
                id="sign_out_btn" 
                onClick={() => {
                  alert("Noble Friend Alexander, you are logging off safely. May the warmth of Ra guide you back to the Nile!");
                  setHasBegun(false);
                }}
                className="flex items-center justify-between p-3 text-[#ffdad6] hover:text-[#ffb4ab] transition-colors mt-6 cursor-pointer text-left font-bold"
              >
                <span>Sign Out</span>
                <span className="material-symbols-outlined text-sm font-bold text-[#ffb4ab]">logout</span>
              </button>
            </section>

          </div>
        )}

      </main>

      {/* FLOATING ACTION PROMPT OVERLAY BUTTON FOR RA CHAT REDIRECTION */}
      {activeTab !== "chat" && (
        <div className="fixed bottom-24 right-6 z-40">
          <button 
            id="floating_ai_prompt_bubble"
            onClick={() => setActiveTab("chat")}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#785d00] to-[#e6c364] text-[#061423] flex items-center justify-center shadow-[0_4px_25px_rgba(230,195,100,0.55)] border border-[#e6c364]/40 hover:scale-110 active:scale-90 transition-transform cursor-pointer relative animate-pulse"
          >
            <span className="material-symbols-outlined text-3xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
          </button>
        </div>
      )}

      {/* CURVED GLASSMORPHIC BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-[#020f1e]/40 backdrop-blur-2xl border-t border-[#e6c364]/30 shadow-[0_-15px_45px_rgba(0,0,0,0.65)] flex justify-around items-center h-20 px-4 pb-safe select-none">
        
        {/* Tab 1: Home */}
        <button 
          id="tab_home_btn"
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center justify-center transition-all cursor-pointer ${activeTab === 'home' ? 'text-[#e6c364] font-bold font-serif shadow-inner' : 'text-[#c5c6d1]/60 hover:text-[#e6c364]'}`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'home' ? "'FILL' 1" : "'FILL' 0" }}>home</span>
          <span className="text-[10px] tracking-wide font-sans mt-0.5">Home</span>
          {activeTab === 'home' && <span className="w-1 h-1 bg-[#e6c364] rounded-full mt-0.5"></span>}
        </button>

        {/* Tab 2: Explore */}
        <button 
          id="tab_explore_btn"
          onClick={() => {
            setActiveTab("explore");
            setExploreMode("scanner");
          }}
          className={`flex flex-col items-center justify-center transition-all cursor-pointer ${activeTab === 'explore' ? 'text-[#e6c364] font-bold font-serif shadow-inner' : 'text-[#c5c6d1]/60 hover:text-[#e6c364]'}`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'explore' ? "'FILL' 1" : "'FILL' 0" }}>explore</span>
          <span className="text-[10px] tracking-wide font-sans mt-0.5">Explore</span>
          {activeTab === 'explore' && <span className="w-1 h-1 bg-[#e6c364] rounded-full mt-0.5"></span>}
        </button>

        {/* Tab 3: Ra Chat */}
        <button 
          id="tab_chat_btn"
          onClick={() => setActiveTab("chat")}
          className={`flex flex-col items-center justify-center transition-all cursor-pointer ${activeTab === 'chat' ? 'text-[#e6c364] font-bold font-serif shadow-inner' : 'text-[#c5c6d1]/60 hover:text-[#e6c364]'}`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'chat' ? "'FILL' 1" : "'FILL' 0" }}>auto_awesome</span>
          <span className="text-[10px] tracking-wide font-sans mt-0.5">Ra Chat</span>
          {activeTab === 'chat' && <span className="w-1 h-1 bg-[#e6c364] rounded-full mt-0.5"></span>}
        </button>

        {/* Tab 4: Journey */}
        <button 
          id="tab_journey_btn"
          onClick={() => setActiveTab("journey")}
          className={`flex flex-col items-center justify-center transition-all cursor-pointer ${activeTab === 'journey' ? 'text-[#e6c364] font-bold font-serif shadow-inner' : 'text-[#c5c6d1]/60 hover:text-[#e6c364]'}`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'journey' ? "'FILL' 1" : "'FILL' 0" }}>map</span>
          <span className="text-[10px] tracking-wide font-sans mt-0.5">Journey</span>
          {activeTab === 'journey' && <span className="w-1 h-1 bg-[#e6c364] rounded-full mt-0.5"></span>}
        </button>

        {/* Tab 5: Profile */}
        <button 
          id="tab_profile_btn"
          onClick={() => setActiveTab("profile")}
          className={`flex flex-col items-center justify-center transition-all cursor-pointer ${activeTab === 'profile' ? 'text-[#e6c364] font-bold font-serif shadow-inner' : 'text-[#c5c6d1]/60 hover:text-[#e6c364]'}`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'profile' ? "'FILL' 1" : "'FILL' 0" }}>person</span>
          <span className="text-[10px] tracking-wide font-sans mt-0.5">Profile</span>
          {activeTab === 'profile' && <span className="w-1 h-1 bg-[#e6c364] rounded-full mt-0.5"></span>}
        </button>
      </nav>

      {/* SAFETY ADVISORY / EMERGENCY DETAILED MODAL OVERLAY */}
      {showSafetyModal && (
        <div className="fixed inset-0 z-[100] bg-[#061423]/95 backdrop-blur-md flex items-center justify-center p-6 text-left whitespace-normal">
          <div className="glass-card max-w-sm rounded-[2rem] p-6 flex flex-col gap-5 border border-[#e6c364]/30 relative animate-float">
            <button 
              onClick={() => setShowSafetyModal(false)}
              className="absolute top-4 right-4 text-[#ffe08f]/80 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#ffb4ab] text-3xl">warning</span>
              <div>
                <h3 className="text-xl font-bold font-serif text-[#ffe08f]">Safety Intelligence</h3>
                <p className="text-[10px] uppercase font-bold text-[#c5c6d1]/60">Egypt Travel Advisory</p>
              </div>
            </div>

            {/* Travel advisories list */}
            <div className="divide-y divide-[#e6c364]/10 text-xs flex flex-col gap-3">
              <div className="flex flex-col gap-1 border-l-2 border-green-500 pl-2.5 mt-2">
                <span className="font-extrabold text-[#ffe08f]">CURRENT LUXOR STATUS:</span>
                <span className="text-green-400">● SECURE & STABLE</span>
                <p className="text-[11px] text-[#c5c6d1]/80">No active alerts for Luxor Governorate</p>
              </div>

              <div className="flex flex-col gap-1.5 pt-3 border-l-2 border-[#ffb4ab] pl-2.5">
                <span className="font-extrabold text-[#ffe08f]">CURRENT CONDITIONS:</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <p>Ambient Heat: <b className="text-[#ffb4ab]">{conditions.temp}</b></p>
                  <p>UV Index: <b className="text-[#ffb4ab]">10 (Extreme)</b></p>
                  <p className="col-span-2">Air Quality: <b className="text-[#b5c4ff]">Moderate (AQI 54)</b></p>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-3 border-l-2 border-[#e6c364]/55 pl-2.5">
                <span className="font-extrabold text-[#ffe08f]">EMERGENCY PROTOCOLS:</span>
                <div className="flex items-center justify-between text-[11px] bg-[#132030] p-2 rounded border border-[#e6c364]/20">
                  <span>Tourist Police:</span>
                  <a href="tel:126" className="text-[#e6c364] font-bold">📞 126</a>
                </div>
                <div className="flex items-center justify-between text-[11px] bg-[#132030] p-2 rounded border border-[#e6c364]/20">
                  <span>Ambulance Services:</span>
                  <a href="tel:123" className="text-[#e6c364] font-bold">📞 123</a>
                </div>
              </div>
            </div>

            {/* RIHLA SOS TRIGGER BUTTON */}
            <button 
              onClick={() => {
                alert("EMERGENCY BROADCAST TRIGERRED: Sending secure location telemetry (Latitude: 25.6872, Longitude: 32.6396) and current ticket metrics to local Tourist Police. Keep calm traveler!");
                setShowSafetyModal(false);
              }}
              className="w-full py-4 rounded-xl sos-gradient-bg text-white font-serif tracking-widest font-extrabold uppercase hover:brightness-110 active:scale-95 transition-all text-center flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-500/20"
            >
              <span className="material-symbols-outlined text-white text-xl">emergency_share</span>
              <span>RIHLA SOS</span>
            </button>
            <p className="text-[10px] text-center text-[#ffdad6]/60 leading-normal">
              One-tap emergency broadcast to Rihla agents and local authorities.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
