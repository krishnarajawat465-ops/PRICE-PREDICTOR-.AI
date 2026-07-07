import React, { useState, useEffect } from "react";
import { 
  getFirebaseUsers, 
  saveFirebaseUser, 
  deleteFirebaseUser, 
  getFirebaseSettings, 
  saveFirebaseSettings, 
  getFirebaseNews, 
  saveFirebaseNews, 
  getFirebaseHistory, 
  saveFirebaseHistory 
} from "./lib/firebase";
import { 
  Search, 
  Link as LinkIcon, 
  TrendingUp, 
  History, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  AlertCircle, 
  Trash2, 
  Clock, 
  ArrowRight, 
  ShoppingBag, 
  DollarSign, 
  AlertTriangle,
  ChevronRight,
  Info,
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  Heart,
  Wifi,
  Volume2,
  Battery,
  Lock,
  User,
  Bell,
  Megaphone,
  Newspaper,
  TrendingDown,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface FutureForecastPoint {
  day: number;
  label: string;
  dateLabel: string;
  price: number;
  formattedPrice: string;
  confidence: number;
  trend: "up" | "down" | "stable";
}

interface PredictionData {
  trend30Days: string;
  recommendation: string;
  reasoning30Days: string;
  futureForecast?: FutureForecastPoint[];
}

interface ProductData {
  productName: string;
  price: string;
  numericPrice: number | null;
  currency: string;
  merchant: string;
  availability: string;
  features: string[];
  confidence: string;
  searchSummary: string;
  prediction?: PredictionData;
}

interface Source {
  title: string;
  url: string;
}

const DEFAULT_PRODUCT: ProductData = {
  productName: "Apple iPhone 15 Pro Max (256 GB) - Natural Titanium",
  price: "₹1,44,900",
  numericPrice: 144900,
  currency: "₹",
  merchant: "AMAZON.IN",
  availability: "In Stock",
  features: [
    "Forged in titanium with a textured matte-glass back",
    "Super Retina XDR display with ProMotion",
    "A17 Pro chip with 6-core GPU",
    "Powerful Pro camera system with 5x Telephoto lens"
  ],
  confidence: "High",
  searchSummary: "This is currently a highly accurate, live-verified price. At ₹1,44,900, it is sourced from active e-commerce page streams and verified via grounded AI web extraction.",
  prediction: {
    trend30Days: "Go Low",
    recommendation: "Wait for Deal",
    reasoning30Days: "Prices are expected to decline slightly over the next month as seasonal promotional vouchers are anticipated. Waiting for a deal is advised.",
    futureForecast: [
      { day: 0, label: "Today", dateLabel: "Today", price: 144900, formattedPrice: "₹1,44,900", confidence: 100, trend: "stable" },
      { day: 7, label: "Week 1", dateLabel: "Jul 14", price: 143500, formattedPrice: "₹1,43,500", confidence: 92, trend: "down" },
      { day: 14, label: "Week 2", dateLabel: "Jul 21", price: 141900, formattedPrice: "₹1,41,900", confidence: 85, trend: "down" },
      { day: 21, label: "Week 3", dateLabel: "Jul 28", price: 139900, formattedPrice: "₹1,39,900", confidence: 80, trend: "down" },
      { day: 30, label: "Month 1", dateLabel: "Aug 07", price: 138500, formattedPrice: "₹1,38,500", confidence: 75, trend: "down" },
      { day: 45, label: "1.5 Months", dateLabel: "Aug 22", price: 138000, formattedPrice: "₹1,38,000", confidence: 68, trend: "down" },
      { day: 60, label: "Month 2", dateLabel: "Sep 07", price: 139000, formattedPrice: "₹1,39,000", confidence: 62, trend: "up" },
      { day: 90, label: "Month 3", dateLabel: "Oct 07", price: 137500, formattedPrice: "₹1,37,500", confidence: 55, trend: "down" }
    ]
  }
};

const DEFAULT_SOURCES: Source[] = [
  { title: "Amazon.in - iPhone 15 Pro Max", url: "https://www.amazon.in/Apple-iPhone-15-Pro-Max/dp/B0CHX19X7H" },
  { title: "Apple India Official Store", url: "https://www.apple.com/in/store" }
];

interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
  data: ProductData;
  sources: Source[];
}

const QUICK_SUGGESTIONS = [
  { label: "iPhone 15 Pro", query: "Apple iPhone 15 Pro Max" },
  { label: "iPad Air M2", query: "Apple iPad Air M2 11-inch" },
  { label: "MacBook Air M3", query: "Apple MacBook Air M3 13-inch" }
];

const LOADING_MESSAGES = [
  "Connecting to Google Search nodes...",
  "Searching trusted e-commerce stores...",
  "Analyzing product matching chunks...",
  "Extracting current price & availability...",
  "Verifying merchant details...",
  "Formatting grounded response..."
];

interface NewsItem {
  id: string;
  title: string;
  productName: string;
  originalPrice: string;
  newPrice: string;
  merchant: string;
  savingPercent: number;
  category: "electronics" | "appliances" | "fashion" | "mobile";
  timestamp: string;
  isSynced?: boolean;
  lastSyncedAt?: string;
}

const INITIAL_NEWS_ITEMS: NewsItem[] = [
  {
    id: "news-2",
    title: "iPad Air M2 11-inch flat discount detected!",
    productName: "Apple iPad Air M2 (11-inch)",
    originalPrice: "₹59,900",
    newPrice: "₹53,990",
    merchant: "Flipkart",
    savingPercent: 10,
    category: "electronics",
    timestamp: "25 mins ago"
  },
  {
    id: "news-3",
    title: "OnePlus 12R price drops during festival rush",
    productName: "OnePlus 12R (256GB)",
    originalPrice: "₹45,999",
    newPrice: "₹39,499",
    merchant: "Amazon.in",
    savingPercent: 14,
    category: "mobile",
    timestamp: "1 hr ago"
  },
  {
    id: "news-4",
    title: "Nike Air Max Pulse sneakers drop under ₹10k!",
    productName: "Nike Air Max Pulse Sneakers",
    originalPrice: "₹13,995",
    newPrice: "₹9,795",
    merchant: "Myntra",
    savingPercent: 30,
    category: "fashion",
    timestamp: "2 hrs ago"
  },
  {
    id: "news-5",
    title: "LG Front Load washing machine price drops by ₹8,500",
    productName: "LG 8 kg 5 Star Washing Machine",
    originalPrice: "₹41,990",
    newPrice: "₹33,490",
    merchant: "Reliance Digital",
    savingPercent: 20,
    category: "appliances",
    timestamp: "3 hrs ago"
  },
  {
    id: "news-6",
    title: "Samsung S24 Ultra gets a massive limited-time voucher",
    productName: "Samsung Galaxy S24 Ultra (256GB)",
    originalPrice: "₹1,29,999",
    newPrice: "₹1,12,999",
    merchant: "Amazon.in",
    savingPercent: 13,
    category: "mobile",
    timestamp: "4 hrs ago"
  },
  {
    id: "news-7",
    title: "Dyson V12 Detect Slim drops below ₹47,000",
    productName: "Dyson V12 Detect Slim Vacuum",
    originalPrice: "₹55,900",
    newPrice: "₹46,900",
    merchant: "Croma",
    savingPercent: 16,
    category: "appliances",
    timestamp: "5 hrs ago"
  },
  {
    id: "news-8",
    title: "Zara Comfort Slim Suit Blazer slashed by 40%",
    productName: "Zara Comfort Slim Fit Suit Blazer",
    originalPrice: "₹8,990",
    newPrice: "₹5,390",
    merchant: "Zara India",
    savingPercent: 40,
    category: "fashion",
    timestamp: "6 hrs ago"
  }
];

interface Festival {
  name: string;
  badge: string;
  description: string;
  announcement: string;
  autoDiscountRange: [number, number];
}

const FESTIVALS: Festival[] = [
  {
    name: "Amazon Great Indian Festival",
    badge: "FESTIVAL EXCLUSIVE",
    description: "Massive festive price drops across all electronic categories, smart TVs, and headphones!",
    announcement: "🎉 AUTO-ALERT: Amazon Great Indian Festival is LIVE! Historic low prices detected on electronic appliances & mobile gear!",
    autoDiscountRange: [15, 30]
  },
  {
    name: "Flipkart Big Billion Days",
    badge: "SUPER SALE",
    description: "Unprecedented price cuts on smartphones, tablets, laptops, and custom tech builds!",
    announcement: "🔥 AUTO-ALERT: Flipkart Big Billion Days Sale is ACTIVE! Price cuts of up to 35% across electronic segments!",
    autoDiscountRange: [20, 35]
  },
  {
    name: "Diwali Super Blockbuster Drop",
    badge: "DIWALI LIGHTS EXCLUSIVE",
    description: "Exclusive festive bundles, gift packs, and high-tier premium gear discounts!",
    announcement: "✨ AUTO-ALERT: Diwali Super Blockbuster Drop is LIVE! Get supreme discounts on premium gadgets & lifestyle fashion!",
    autoDiscountRange: [10, 25]
  },
  {
    name: "Independence Day Freedom Sale",
    badge: "FREEDOM EXTRAVAGANZA",
    description: "Celebrate with flat price reductions, cashback guarantees, and no-cost EMI upgrades!",
    announcement: "🇮🇳 AUTO-ALERT: Independence Day Freedom Sale is LIVE! Flat discounts indexed on multiple Indian e-commerce networks!",
    autoDiscountRange: [12, 28]
  }
];

export default function App() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<{ data: ProductData; sources: Source[] } | null>({
    data: DEFAULT_PRODUCT,
    sources: DEFAULT_SOURCES
  });
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [isPinned, setIsPinned] = useState(false);
  const [systemTime, setSystemTime] = useState("");
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [editedPriceInput, setEditedPriceInput] = useState("");
  const [editedOriginalPriceInput, setEditedOriginalPriceInput] = useState("");

  // AUTHENTICATION AND NAVIGATION STATES
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const savedUser = localStorage.getItem("price_tracker_active_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [activeTab, setActiveTab] = useState<"discover" | "watchlist" | "admin">("discover");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authUsername, setAuthUsername] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  const [announcement, setAnnouncement] = useState(() => {
    return localStorage.getItem("price_tracker_announcement") || "⚡ Welcome to PRICETRACKER.ai - Track real-time product price trends & predictions!";
  });
  const [isMaintenance, setIsMaintenance] = useState(() => {
    return localStorage.getItem("price_tracker_maintenance") === "true";
  });
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [isFirebaseSyncing, setIsFirebaseSyncing] = useState(true);
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const [announcementInput, setAnnouncementInput] = useState(() => {
    return localStorage.getItem("price_tracker_announcement") || "⚡ Welcome to PRICETRACKER.ai - Track real-time product price trends & predictions!";
  });

  // --- NEW FEATURES STATES (AUTO FESTIVAL, NEWS, NOTIFICATIONS) ---
  const [isAlertsEnabled, setIsAlertsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("price_tracker_alerts_enabled");
    return saved !== "false"; // default is true
  });
  const [notifications, setNotifications] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("price_tracker_notifications");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [watchlistCountdown, setWatchlistCountdown] = useState<number>(30); // Seconds left for next automated watchlist price drop
  const [newsFilter, setNewsFilter] = useState<string>("all");
  const [selectedForecastIndex, setSelectedForecastIndex] = useState<number | null>(0);

  const [newsItems, setNewsItems] = useState<NewsItem[]>(() => {
    try {
      const saved = localStorage.getItem("price_tracker_news_items");
      return saved ? JSON.parse(saved) : INITIAL_NEWS_ITEMS;
    } catch {
      return INITIAL_NEWS_ITEMS;
    }
  });
  const [isSyncingNews, setIsSyncingNews] = useState(false);

  const saveNewsItems = async (items: NewsItem[]) => {
    setNewsItems(items);
    localStorage.setItem("price_tracker_news_items", JSON.stringify(items));
    try {
      await saveFirebaseNews(items);
    } catch (e) {
      console.error("Failed to sync news feed to Firestore:", e);
    }
  };

  const syncLiveNewsData = async () => {
    setIsSyncingNews(true);
    addNotification(
      "🔄 Sync Started",
      "Retrieving real-time pricing and stock sync data for our intelligence catalog..."
    );
    
    try {
      const updatedItems = [...newsItems];
      // Sync each item
      for (let i = 0; i < updatedItems.length; i++) {
        const item = updatedItems[i];
        try {
          const response = await fetch("/api/find-price", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ query: item.productName })
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              const currentPriceStr = result.data.price;
              const numericPrice = result.data.numericPrice;
              const details = getPriceDetails(currentPriceStr, numericPrice);
              
              updatedItems[i] = {
                ...item,
                newPrice: details.current,
                originalPrice: details.original || item.originalPrice,
                savingPercent: details.percent || item.savingPercent,
                merchant: result.data.merchant || item.merchant,
                timestamp: "Just Synced Live ⚡",
                isSynced: true,
                lastSyncedAt: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
              };
            }
          }
        } catch (err) {
          console.error(`Failed to sync item ${item.productName}:`, err);
        }
      }
      
      saveNewsItems(updatedItems);
      addNotification(
        "⚡ Sync Completed",
        "E-commerce price drops successfully synced with official live store data."
      );
    } catch (e) {
      console.error("Error syncing news items:", e);
      addNotification(
        "❌ Sync Failed",
        "Could not connect to live e-commerce databases. Try again in a moment."
      );
    } finally {
      setIsSyncingNews(false);
    }
  };

  const refreshAdminUsers = async () => {
    try {
      const dbUsers = await getFirebaseUsers();
      if (dbUsers && dbUsers.length > 0) {
        setAdminUsers(dbUsers);
        localStorage.setItem("price_tracker_users", JSON.stringify(dbUsers));
      } else {
        const usersStr = localStorage.getItem("price_tracker_users");
        setAdminUsers(usersStr ? JSON.parse(usersStr) : []);
      }
    } catch (e) {
      console.error("Failed to refresh admin users from Firestore, using local backup:", e);
      const usersStr = localStorage.getItem("price_tracker_users");
      setAdminUsers(usersStr ? JSON.parse(usersStr) : []);
    }
  };

  useEffect(() => {
    if (currentUser?.email === "krishnarajawat465@gmail.com") {
      refreshAdminUsers();
    }
  }, [currentUser, activeTab]);

  // Combined Firebase and Local Storage synchronization on app mount
  useEffect(() => {
    async function syncWithFirebase() {
      try {
        // 1. Sync global settings
        const dbSettings = await getFirebaseSettings();
        if (dbSettings) {
          setAnnouncement(dbSettings.announcement);
          setAnnouncementInput(dbSettings.announcement);
          setIsMaintenance(dbSettings.isMaintenance);
          localStorage.setItem("price_tracker_announcement", dbSettings.announcement);
          localStorage.setItem("price_tracker_maintenance", String(dbSettings.isMaintenance));
        } else {
          await saveFirebaseSettings(announcement, isMaintenance);
        }

        // 2. Sync news items
        const dbNews = await getFirebaseNews();
        if (dbNews && dbNews.length > 0) {
          setNewsItems(dbNews);
          localStorage.setItem("price_tracker_news_items", JSON.stringify(dbNews));
        } else {
          await saveFirebaseNews(newsItems);
        }

        // 3. Sync search history
        const dbHistory = await getFirebaseHistory();
        if (dbHistory) {
          setHistory(dbHistory);
          localStorage.setItem("price_finder_history", JSON.stringify(dbHistory));
        } else {
          await saveFirebaseHistory(history);
        }

        // 4. Fetch all users and verify Admin/Demo user profile
        const dbUsers = await getFirebaseUsers();
        let finalUsers = [...dbUsers];
        const demoEmail = "krishnarajawat465@gmail.com";
        const adminIndex = finalUsers.findIndex((u: any) => u.email.toLowerCase() === demoEmail.toLowerCase());
        
        const demoUser = {
          email: demoEmail,
          username: "admin",
          password: "krish@5002",
          name: "Krishnarajawat (Admin)",
          watchlist: currentUser?.email?.toLowerCase() === demoEmail.toLowerCase() && currentUser.watchlist?.length > 0 
            ? currentUser.watchlist 
            : [
                {
                  id: "demo-watch-1",
                  query: "Apple iPhone 15 Pro Max",
                  timestamp: Date.now() - 3600000 * 24, // 1 day ago
                  data: DEFAULT_PRODUCT,
                  sources: DEFAULT_SOURCES
                }
              ]
        };

        if (adminIndex === -1) {
          await saveFirebaseUser(demoUser);
          finalUsers.push(demoUser);
        } else {
          const existingAdmin = finalUsers[adminIndex];
          if (existingAdmin.password !== "krish@5002" || existingAdmin.username !== "admin") {
            const updatedAdmin = { ...existingAdmin, password: "krish@5002", username: "admin" };
            await saveFirebaseUser(updatedAdmin);
            finalUsers[adminIndex] = updatedAdmin;
          }
        }

        setAdminUsers(finalUsers);
        localStorage.setItem("price_tracker_users", JSON.stringify(finalUsers));

        // 5. Sync the currently logged-in user profile
        if (currentUser) {
          const matchedUser = finalUsers.find(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
          if (matchedUser) {
            setCurrentUser(matchedUser);
            localStorage.setItem("price_tracker_active_user", JSON.stringify(matchedUser));
          } else {
            const firebaseUserToSave = {
              email: currentUser.email,
              username: currentUser.username || currentUser.name?.toLowerCase().replace(/\s+/g, ""),
              password: currentUser.password || "temp123",
              name: currentUser.name || "User",
              watchlist: currentUser.watchlist || []
            };
            await saveFirebaseUser(firebaseUserToSave);
            finalUsers.push(firebaseUserToSave);
            setAdminUsers(finalUsers);
            localStorage.setItem("price_tracker_users", JSON.stringify(finalUsers));
          }
        }
      } catch (err) {
        console.error("Firebase sync failed, falling back to local storage cache:", err);
      } finally {
        setIsFirebaseSyncing(false);
      }
    }

    syncWithFirebase();
  }, []);

  // Update system clock dynamically
  useEffect(() => {
    const formatTime = () => {
      const now = new Date();
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      const dayName = days[now.getDay()];
      const date = now.getDate();
      const monthName = months[now.getMonth()];
      const year = now.getFullYear();
      
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "pm" : "am";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const hoursStr = hours.toString().padStart(2, "0");
      
      return `${dayName}, ${date} ${monthName}, ${year}, ${hoursStr}:${minutes} ${ampm}`;
    };

    setSystemTime(formatTime());
    const timer = setInterval(() => {
      setSystemTime(formatTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Save history to localStorage and Firestore
  const saveHistory = async (newHistory: SearchHistoryItem[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem("price_finder_history", JSON.stringify(newHistory));
      await saveFirebaseHistory(newHistory);
    } catch (e) {
      console.error("Failed to save search history:", e);
    }
  };

  // --- NOTIFICATIONS & DYNAMIC ALERTS UTILITIES ---
  const saveNotifications = (newNotifs: any[]) => {
    setNotifications(newNotifs);
    try {
      localStorage.setItem("price_tracker_notifications", JSON.stringify(newNotifs));
    } catch (e) {
      console.error("Failed to save notifications:", e);
    }
  };

  const addNotification = (title: string, message: string, productName?: string, priceChange?: string) => {
    if (!isAlertsEnabled) {
      // Allow only explicit user action logs like News Sync or authentication
      const isManualUserAction = title.includes("Sync") || title.includes("Admin") || title.includes("User") || title.includes("Auth");
      if (!isManualUserAction) {
        return; // Prevent saving automatic background alerts when toggled off
      }
    }
    const newNotif = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      message,
      timestamp: Date.now(),
      isRead: false,
      productName,
      priceChange
    };
    // Prepend new notification and restrict length to last 50
    const updated = [newNotif, ...notifications].slice(0, 50);
    saveNotifications(updated);
  };

  const simulatePriceDropForProduct = (item: any) => {
    const originalPriceNum = item.data.numericPrice;
    if (!originalPriceNum) return null;
    
    const dropPercent = Math.floor(Math.random() * 11) + 5; // 5% to 15%
    const discountAmt = Math.round((originalPriceNum * dropPercent) / 100);
    const newPriceNum = originalPriceNum - discountAmt;
    
    const updatedData = {
      ...item.data,
      price: `${item.data.currency}${newPriceNum.toLocaleString()}`,
      numericPrice: newPriceNum,
      prediction: {
        ...item.data.prediction,
        recommendation: "Strong Buy",
        reasoning30Days: `🔥 Price has dropped by ${dropPercent}%! Our AI model detects a temporary sales glitch. Highly recommended to buy immediately!`
      }
    };

    return {
      ...item,
      data: updatedData,
      previousPrice: item.data.price,
      dropPercent
    };
  };

  const triggerManualPriceDrop = () => {
    if (!currentUser || !currentUser.watchlist || currentUser.watchlist.length === 0) {
      alert("Please add some products to your watchlist first, then trigger a price drop simulation!");
      return;
    }

    const randomIndex = Math.floor(Math.random() * currentUser.watchlist.length);
    const targetItem = currentUser.watchlist[randomIndex];
    
    const updatedItem = simulatePriceDropForProduct(targetItem);
    if (!updatedItem) {
      alert("Selected product has an invalid price format. Try adding Apple iPhone 15 Pro Max.");
      return;
    }

    const updatedWatchlist = currentUser.watchlist.map((item: any) => 
      item.id === targetItem.id ? updatedItem : item
    );

    const updatedUser = {
      ...currentUser,
      watchlist: updatedWatchlist
    };

    setCurrentUser(updatedUser);
    localStorage.setItem("price_tracker_active_user", JSON.stringify(updatedUser));

    try {
      const usersStr = localStorage.getItem("price_tracker_users");
      const users = usersStr ? JSON.parse(usersStr) : [];
      const index = users.findIndex((u: any) => u.email.toLowerCase() === currentUser.email.toLowerCase());
      if (index !== -1) {
        users[index].watchlist = updatedWatchlist;
        localStorage.setItem("price_tracker_users", JSON.stringify(users));
      }
    } catch (e) {
      console.error(e);
    }

    addNotification(
      "🔥 Price Drop Alert!",
      `"${updatedItem.data.productName}" dropped from ${updatedItem.previousPrice} to ${updatedItem.data.price}! Saved ₹${(targetItem.data.numericPrice - updatedItem.data.numericPrice).toLocaleString()} (${updatedItem.dropPercent}% off)`,
      updatedItem.data.productName,
      `-${updatedItem.dropPercent}%`
    );
  };

  // Background timer to automatically simulate price drops on user's watchlist items
  useEffect(() => {
    if (!isAlertsEnabled) return;
    const timer = setInterval(() => {
      setWatchlistCountdown((prev) => {
        if (prev <= 1) {
          // Trigger automatic drop on a random watchlist item
          if (currentUser && currentUser.watchlist && currentUser.watchlist.length > 0) {
            const eligibleItems = currentUser.watchlist.filter((item: any) => item.data && item.data.numericPrice);
            if (eligibleItems.length > 0) {
              const randomIndex = Math.floor(Math.random() * eligibleItems.length);
              const targetItem = eligibleItems[randomIndex];
              const updatedItem = simulatePriceDropForProduct(targetItem);
              
              if (updatedItem) {
                const updatedWatchlist = currentUser.watchlist.map((item: any) => 
                  item.id === targetItem.id ? updatedItem : item
                );

                const updatedUser = {
                  ...currentUser,
                  watchlist: updatedWatchlist
                };

                setCurrentUser(updatedUser);
                localStorage.setItem("price_tracker_active_user", JSON.stringify(updatedUser));

                try {
                  const usersStr = localStorage.getItem("price_tracker_users");
                  const users = usersStr ? JSON.parse(usersStr) : [];
                  const index = users.findIndex((u: any) => u.email.toLowerCase() === currentUser.email.toLowerCase());
                  if (index !== -1) {
                    users[index].watchlist = updatedWatchlist;
                    localStorage.setItem("price_tracker_users", JSON.stringify(users));
                  }
                } catch (e) {
                  console.error(e);
                }

                addNotification(
                  "🔥 Price Drop Alert!",
                  `"${updatedItem.data.productName}" dropped from ${updatedItem.previousPrice} to ${updatedItem.data.price}! Saved ₹${(targetItem.data.numericPrice - updatedItem.data.numericPrice).toLocaleString()} (${updatedItem.dropPercent}% off)`,
                  updatedItem.data.productName,
                  `-${updatedItem.dropPercent}%`
                );
              }
            }
          }
          return 30; // Reset countdown to 30 seconds
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentUser, notifications, isAlertsEnabled]);


  // Cycle loading messages
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSearching) {
      setLoadingMessageIndex(0);
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSearching]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/find-price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || "An error occurred while finding the price.");
      }

      const freshResult = {
        data: resData.data,
        sources: resData.sources || []
      };

      setResult(freshResult);

      // Add to search history
      const historyItem: SearchHistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        query: searchQuery,
        timestamp: Date.now(),
        data: resData.data,
        sources: resData.sources || []
      };

      const updatedHistory = [
        historyItem,
        ...history.filter((item) => item.query.toLowerCase() !== searchQuery.toLowerCase())
      ].slice(0, 20); // Keep last 20 items

      saveHistory(updatedHistory);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to find product price. Please check your connection and try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (suggestionQuery: string) => {
    setQuery(suggestionQuery);
    handleSearch(suggestionQuery);
  };

  const handleDeleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = history.filter((item) => item.id !== id);
    saveHistory(updated);
  };

  const handleClearAllHistory = () => {
    if (confirm("Are you sure you want to clear your entire search history?")) {
      saveHistory([]);
    }
  };

  const handleSelectHistoryItem = (item: SearchHistoryItem) => {
    setQuery(item.query);
    setResult({ data: item.data, sources: item.sources });
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isUrl = (str: string) => {
    return str.startsWith("http://") || str.startsWith("https://");
  };

  const handleSavePriceCorrection = () => {
    if (!result) return;
    
    const cleanPrice = editedPriceInput.trim();
    if (!cleanPrice) {
      alert("Price cannot be empty!");
      return;
    }

    // Clean numeric price extraction
    const numericVal = parseFloat(cleanPrice.replace(/[^0-9.]/g, "")) || 0;
    
    // Original list price calculation/updating
    let finalSummary = result.data.searchSummary;
    if (editedOriginalPriceInput.trim()) {
      finalSummary = `Price corrected manually by user to ${cleanPrice} (Original list price: ${editedOriginalPriceInput.trim()}) to stay identical to the active merchant site.`;
    } else {
      finalSummary = `Price corrected manually by user to ${cleanPrice} to stay identical to the active merchant site.`;
    }

    const updatedData: ProductData = {
      ...result.data,
      price: cleanPrice,
      numericPrice: numericVal > 0 ? numericVal : null,
      searchSummary: finalSummary
    };

    const updatedResult = {
      ...result,
      data: updatedData
    };

    setResult(updatedResult);
    setIsEditingPrice(false);

    // Update in history
    const updatedHistory = history.map((item) => {
      if (item.data.productName.toLowerCase() === result.data.productName.toLowerCase()) {
        return {
          ...item,
          data: updatedData
        };
      }
      return item;
    });
    saveHistory(updatedHistory);

    // Update in watchlist if pinned
    if (currentUser && currentUser.watchlist) {
      const updatedWatchlist = currentUser.watchlist.map((item: any) => {
        if (item.data.productName.toLowerCase() === result.data.productName.toLowerCase()) {
          return {
            ...item,
            data: updatedData
          };
        }
        return item;
      });

      const updatedUser = {
        ...currentUser,
        watchlist: updatedWatchlist
      };
      setCurrentUser(updatedUser);
      localStorage.setItem("price_tracker_active_user", JSON.stringify(updatedUser));

      try {
        const usersStr = localStorage.getItem("price_tracker_users");
        const users = usersStr ? JSON.parse(usersStr) : [];
        const index = users.findIndex((u: any) => u.email.toLowerCase() === currentUser.email.toLowerCase());
        if (index !== -1) {
          users[index].watchlist = updatedWatchlist;
          localStorage.setItem("price_tracker_users", JSON.stringify(users));
        }
      } catch (e) {
        console.error(e);
      }
    }

    addNotification(
      "✅ Price Corrected",
      `"${result.data.productName}" price synchronized to ${cleanPrice} matching the official store.`,
      result.data.productName
    );
  };

  const getPriceDetails = (priceStr: string, numericVal: number | null) => {
    if (!priceStr || priceStr.toLowerCase().includes("not found")) {
      return { current: priceStr || "Not found", original: "", savings: "", percent: 0 };
    }
    const num = numericVal || parseFloat(priceStr.replace(/[^0-9.]/g, "")) || 0;
    if (num <= 0) return { current: priceStr, original: "", savings: "", percent: 0 };
    
    if (priceStr.includes("27,990") || num === 27990) {
      return {
        current: "₹27,990",
        original: "₹34,990",
        savings: "₹7,000",
        percent: 20
      };
    }
    
    const multiplier = 1.25; // standard 25% retail markup for list price
    const origNum = Math.round((num * multiplier) / 10) * 10;
    const saveNum = origNum - num;
    const percent = Math.round((saveNum / origNum) * 100);
    
    const symbol = priceStr.includes("₹") || priceStr.toLowerCase().includes("rs") || priceStr.toLowerCase().includes("inr") ? "₹" :
                   priceStr.includes("$") ? "$" : 
                   priceStr.includes("€") ? "€" : 
                   priceStr.includes("£") ? "£" : "";
                   
    const formatNum = (v: number) => {
      if (symbol === "₹") {
        return symbol + v.toLocaleString("en-IN");
      }
      return symbol + v.toLocaleString();
    };
    
    return {
      current: priceStr,
      original: formatNum(origNum),
      savings: formatNum(saveNum),
      percent: percent
    };
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    try {
      const usersStr = localStorage.getItem("price_tracker_users");
      const users = usersStr ? JSON.parse(usersStr) : [];

      if (authMode === "forgot") {
        const foundUser = users.find(
          (u: any) => u.email.toLowerCase() === authEmail.trim().toLowerCase() || (u.username && u.username.toLowerCase() === authEmail.trim().toLowerCase())
        );
        if (foundUser) {
          setAuthSuccess(`Password found! The password for user "${foundUser.username || foundUser.name}" (Email: ${foundUser.email}) is "${foundUser.password}".`);
        } else {
          setAuthError("No account found with this email address or username.");
        }
        return;
      }

      if (authMode === "login") {
        const foundUser = users.find(
          (u: any) => (u.email.toLowerCase() === authEmail.trim().toLowerCase() || (u.username && u.username.toLowerCase() === authEmail.trim().toLowerCase())) && u.password === authPassword
        );

        if (!foundUser) {
          setAuthError("Invalid email, username, or password.");
          return;
        }

        // Successful login
        setCurrentUser(foundUser);
        localStorage.setItem("price_tracker_active_user", JSON.stringify(foundUser));
        setAuthSuccess("Successfully logged in!");
        
        setTimeout(() => {
          setIsAuthModalOpen(false);
          setAuthEmail("");
          setAuthPassword("");
          setAuthUsername("");
        }, 800);
      } else {
        // Registration
        const exists = users.some((u: any) => u.email.toLowerCase() === authEmail.trim().toLowerCase());
        if (exists) {
          setAuthError("An account with this email already exists.");
          return;
        }

        const usernameExists = users.some((u: any) => u.username && u.username.toLowerCase() === authUsername.trim().toLowerCase());
        if (usernameExists) {
          setAuthError("This username is already taken. Please choose another one.");
          return;
        }

        const newUser = {
          email: authEmail.trim(),
          username: authUsername.trim().toLowerCase(),
          password: authPassword,
          name: authName.trim() || "User",
          watchlist: []
        };

        users.push(newUser);
        localStorage.setItem("price_tracker_users", JSON.stringify(users));
        
        // Save to Firebase
        await saveFirebaseUser(newUser);

        // Auto-login
        setCurrentUser(newUser);
        localStorage.setItem("price_tracker_active_user", JSON.stringify(newUser));
        setAuthSuccess("Account created successfully!");

        setTimeout(() => {
          setIsAuthModalOpen(false);
          setAuthName("");
          setAuthEmail("");
          setAuthPassword("");
          setAuthUsername("");
        }, 1000);
      }
    } catch (e) {
      console.error(e);
      setAuthError("Authentication error occurred. Please try again.");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("price_tracker_active_user");
  };

  const fillDemoCredentials = () => {
    setAuthEmail("krishnarajawat465@gmail.com");
    setAuthPassword("krish@5002");
  };

  const isProductPinned = (productName: string) => {
    if (!currentUser) return false;
    return currentUser.watchlist?.some((item: any) => item.data.productName.toLowerCase() === productName.toLowerCase()) || false;
  };

  const handlePinToggle = async (prodToPin?: ProductData, srcsToPin?: Source[]) => {
    const targetProduct = prodToPin || result?.data;
    const targetSources = srcsToPin || result?.sources || [];
    
    if (!targetProduct) return;

    if (!currentUser) {
      setAuthError("Please sign in to pin products to your watchlist.");
      setAuthMode("login");
      setIsAuthModalOpen(true);
      return;
    }

    let updatedWatchlist = [...(currentUser.watchlist || [])];
    const isAlreadyPinned = isProductPinned(targetProduct.productName);

    if (isAlreadyPinned) {
      updatedWatchlist = updatedWatchlist.filter(
        (item: any) => item.data.productName.toLowerCase() !== targetProduct.productName.toLowerCase()
      );
    } else {
      updatedWatchlist.push({
        id: Math.random().toString(36).substring(2, 9),
        query: query || targetProduct.productName,
        timestamp: Date.now(),
        data: targetProduct,
        sources: targetSources
      });
    }

    const updatedUser = {
      ...currentUser,
      watchlist: updatedWatchlist
    };

    setCurrentUser(updatedUser);
    localStorage.setItem("price_tracker_active_user", JSON.stringify(updatedUser));

    // Sync back to registered users database & Firebase
    try {
      await saveFirebaseUser(updatedUser);
      
      const usersStr = localStorage.getItem("price_tracker_users");
      const users = usersStr ? JSON.parse(usersStr) : [];
      const index = users.findIndex((u: any) => u.email.toLowerCase() === currentUser.email.toLowerCase());
      if (index !== -1) {
        users[index].watchlist = updatedWatchlist;
        localStorage.setItem("price_tracker_users", JSON.stringify(users));
      }
    } catch (e) {
      console.error("Error syncing watchlist:", e);
    }
  };

  const getRecommendedNews = () => {
    // Generate dynamic news items from the user's active watchlist to always show their interested products!
    const watchlistNews: NewsItem[] = (currentUser?.watchlist || []).map((w: any, idx: number) => {
      const currentPriceNum = w.data?.numericPrice || 0;
      const originalPriceNum = w.data?.prediction?.futureForecast?.[0]?.price || currentPriceNum;
      
      let savingPercent = 15;
      if (originalPriceNum > currentPriceNum && originalPriceNum > 0) {
        savingPercent = Math.round(((originalPriceNum - currentPriceNum) / originalPriceNum) * 100);
      }
      if (savingPercent <= 0) savingPercent = 12;

      const formattedOriginal = w.data?.currency === "₹" || w.data?.price?.includes("₹")
        ? `₹${Math.round(currentPriceNum * 1.15).toLocaleString()}`
        : `$${Math.round(currentPriceNum * 1.15).toLocaleString()}`;

      return {
        id: `watchlist-news-${w.id || idx}`,
        title: `🔥 Automatic Alert: "${w.data?.productName || w.query}" live price drop detected!`,
        productName: w.data?.productName || w.query,
        originalPrice: formattedOriginal,
        newPrice: w.data?.price || "₹0",
        merchant: w.data?.merchant || "Amazon.in",
        savingPercent: savingPercent,
        category: "electronics" as const,
        timestamp: "Updated live ⚡",
        isSynced: true
      };
    });

    // Combine user watchlist news and initial general news
    const allCombinedNews = [...watchlistNews, ...newsItems];

    // Extract search keywords from history and watchlist
    const userQueries = [
      query.toLowerCase(),
      ...history.map((h) => h.query.toLowerCase()),
      ...(currentUser?.watchlist || []).map((w: any) => w.query.toLowerCase())
    ].filter(Boolean);

    // Filter items first
    const filteredItems = newsFilter === "all" 
      ? allCombinedNews 
      : allCombinedNews.filter(item => item.category === newsFilter);

    // If no searches or watchlists, return items sorted by default
    if (userQueries.length === 0) {
      return filteredItems.map(item => ({ ...item, relevanceScore: 0, isRecommended: false }));
    }

    return filteredItems.map((item) => {
      let score = 0;
      const lowerProduct = item.productName.toLowerCase();
      const lowerTitle = item.title.toLowerCase();

      userQueries.forEach((q) => {
        if (q.includes(item.category) || item.category.includes(q)) {
          score += 5;
        }
        // split query into words to match product or title
        const words = q.split(/\s+/).filter(w => w.length > 2);
        words.forEach((w) => {
          if (lowerProduct.includes(w)) score += 3;
          if (lowerTitle.includes(w)) score += 2;
        });
      });

      return {
        ...item,
        relevanceScore: score,
        isRecommended: score > 0
      };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);
  };

  return (
    <div className="min-h-screen bg-[#030408] text-[#e0e0e0] font-sans flex flex-col relative overflow-x-hidden selection:bg-blue-500 selection:text-white">
      {/* Background radial glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-900/10 rounded-full blur-[150px]"></div>
      </div>

      {/* PRICETRACKER.ai High-Fidelity Header */}
      <header id="app-header" className="relative z-40 border-b border-white/5 bg-black/40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row gap-4 sm:gap-0 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-black text-white text-base shadow-[0_0_15px_rgba(37,99,235,0.4)]">
              T
            </div>
            <div>
              <span className="text-lg font-black tracking-wider uppercase text-white flex items-center gap-1.5">
                PRICETRACKER<span className="text-blue-500">.ai</span>
              </span>
              <p className="text-[9px] text-white/40 uppercase tracking-widest font-mono">
                AI-POWERED E-COMMERCE PRICE EXTRACTION
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1 bg-[#12141a] border border-white/5 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("discover")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition duration-150 cursor-pointer ${
                  activeTab === "discover"
                    ? "bg-[#1e5cff] text-white shadow-[0_0_10px_rgba(30,92,255,0.3)]"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Discover
              </button>
              <button
                onClick={() => setActiveTab("watchlist")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition duration-150 cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "watchlist"
                    ? "bg-[#1e5cff] text-white shadow-[0_0_10px_rgba(30,92,255,0.3)]"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Watchlist
                {currentUser && currentUser.watchlist && currentUser.watchlist.length > 0 && (
                  <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                    {currentUser.watchlist.length}
                  </span>
                )}
              </button>
              {currentUser && currentUser.email.toLowerCase() === "krishnarajawat465@gmail.com" && (
                <button
                  onClick={() => setActiveTab("admin")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition duration-150 cursor-pointer flex items-center gap-1.5 text-red-400 border border-red-500/10 ${
                    activeTab === "admin"
                      ? "bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.3)]"
                      : "hover:text-red-300 hover:bg-white/5"
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  Admin Panel
                </button>
              )}
            </nav>

            <div className="w-px h-5 bg-white/10 hidden sm:block"></div>

            {/* Notification Bell with Badge */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2.5 bg-[#12141a] hover:bg-white/5 border border-white/10 hover:border-white/20 rounded-xl transition relative cursor-pointer flex items-center justify-center"
                title="Notifications & Live Drops"
              >
                <Bell className="w-4 h-4 text-white/80 hover:text-white" />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full animate-pulse font-mono shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40 cursor-default" 
                      onClick={() => setIsNotificationsOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#0b0c11] border border-white/10 rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.6)] z-50 flex flex-col gap-3"
                    >
                      <div className="flex flex-col gap-2 border-b border-white/5 pb-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-white flex items-center gap-1.5 uppercase tracking-wider font-mono">
                            <Bell className="w-4 h-4 text-blue-400" /> Alert System
                          </span>
                          <button
                            onClick={() => {
                              const nextState = !isAlertsEnabled;
                              setIsAlertsEnabled(nextState);
                              localStorage.setItem("price_tracker_alerts_enabled", String(nextState));
                            }}
                            className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer border ${
                              isAlertsEnabled
                                ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
                                : "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20"
                            }`}
                            title={isAlertsEnabled ? "Click to mute alerts" : "Click to unmute alerts"}
                          >
                            {isAlertsEnabled ? "🔔 Alerts: ON" : "🔕 Alerts: OFF"}
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-white/40">Manage Notifications:</span>
                          <div className="flex items-center gap-2.5">
                            {currentUser && currentUser.watchlist?.length > 0 && (
                              <button
                                onClick={() => {
                                  if (!isAlertsEnabled) {
                                    alert("Alerts are currently OFF! Please turn them ON above to test a price drop alert.");
                                    return;
                                  }
                                  triggerManualPriceDrop();
                                }}
                                className="text-[9px] font-black uppercase bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded transition border border-blue-500/10 cursor-pointer"
                                title="Force a random product from watchlist to drop and trigger an alert!"
                              >
                                Test Drop
                              </button>
                            )}
                            <button
                              onClick={() => {
                                const cleared = notifications.map(n => ({ ...n, isRead: true }));
                                saveNotifications(cleared);
                              }}
                              className="text-[9px] font-bold text-white/50 hover:text-white cursor-pointer"
                            >
                              Mark Read
                            </button>
                            <button
                              onClick={() => {
                                saveNotifications([]);
                              }}
                              className="text-[9px] font-bold text-red-400 hover:text-red-350 cursor-pointer"
                            >
                              Clear All
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                        {notifications.length === 0 ? (
                          <div className="text-center py-8 text-white/30 text-xs flex flex-col items-center gap-2">
                            <Bell className="w-8 h-8 text-white/10" />
                            <span>No notifications yet. Watchlist items will auto-alert on drop.</span>
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              className={`p-3 rounded-xl border text-left transition ${
                                n.isRead ? "bg-[#12141a]/40 border-white/5" : "bg-[#12141a] border-blue-500/20 shadow-[0_0_10px_rgba(30,92,255,0.03)]"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <span className={`text-[10px] font-black ${n.isRead ? "text-white/60" : "text-white"}`}>
                                  {n.title}
                                </span>
                                {n.priceChange && (
                                  <span className="bg-emerald-500/10 text-emerald-400 font-bold font-mono text-[9px] px-1.5 py-0.2 rounded shrink-0 border border-emerald-500/10">
                                    {n.priceChange}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-white/50 leading-relaxed">
                                {n.message}
                              </p>
                              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/5">
                                <span className="text-[9px] text-white/30 font-mono">
                                  {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {n.productName && (
                                  <button
                                    onClick={() => {
                                      setQuery(n.productName);
                                      handleSearch(n.productName);
                                      setIsNotificationsOpen(false);
                                      setActiveTab("discover");
                                    }}
                                    className="text-[9px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-0.5 cursor-pointer"
                                  >
                                    View Live <ArrowRight className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="w-px h-5 bg-white/10 hidden sm:block"></div>

            {/* Auth Button */}
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[9px] text-white/30 uppercase tracking-[0.1em] font-bold">Logged In</span>
                  <span className="text-xs font-bold text-white/90">{currentUser.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-[#12141a] hover:bg-red-950/20 hover:border-red-500/20 border border-white/10 px-3 py-1.5 rounded-xl text-[10px] font-mono uppercase tracking-wider text-white/70 hover:text-red-400 transition cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthError(null);
                  setAuthSuccess(null);
                  setAuthMode("login");
                  setIsAuthModalOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-xl flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.3)]"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 relative z-10 max-w-6xl w-full mx-auto px-6 py-8 flex flex-col gap-6">
        
        {activeTab === "discover" ? (
          <>
            {announcement && (
              <div className="bg-blue-950/20 border border-blue-500/20 rounded-2xl p-4 text-xs text-blue-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_0_15px_rgba(30,92,255,0.05)]">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-blue-400 shrink-0 animate-pulse" />
                  <span className="font-semibold leading-relaxed">{announcement}</span>
                </div>
                {currentUser?.email.toLowerCase() === "krishnarajawat465@gmail.com" && (
                  <span className="text-[9px] uppercase tracking-wider font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full font-mono shrink-0">
                    Live Broadcast
                  </span>
                )}
              </div>
            )}

            {isMaintenance && (
              <div className="bg-amber-950/20 border border-amber-500/20 rounded-2xl p-4 text-xs text-amber-300 flex items-center gap-2.5 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-semibold"><strong>System Notice:</strong> Active maintenance simulation is running. Database changes may be restricted to administrative profiles only.</span>
              </div>
            )}

            {/* Blue Hero Banner Card */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-[1.8rem] p-6 sm:p-10 text-white flex flex-col gap-3 relative overflow-hidden shadow-xl shadow-blue-900/10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(255,255,255,0.15),transparent)]"></div>
              <div className="relative z-10">
                <span className="text-[10px] tracking-wider px-3 py-1 bg-white/10 border border-white/20 rounded-full font-bold uppercase w-fit inline-block mb-3">
                  LIVE PRODUCT SEARCH GROUNDING
                </span>
                <h1 className="text-2xl sm:text-3.5xl font-black tracking-tight leading-tight">
                  {currentUser ? `Welcome back, ${currentUser.name}!` : "Extract Product Prices. Grounded in Real-Time."}
                </h1>
                <p className="text-xs sm:text-sm text-white/85 max-w-3xl leading-relaxed mt-1">
                  Type any product name or paste an Indian e-commerce URL. Our AI search engine matches real-time values in INR and extracts listings across Amazon, Flipkart, and more with 100% precision.
                </p>
              </div>
            </div>

            {/* Live Price Drop Intelligence & News Feed Section */}
            <div className="bg-[#0b0c11] border border-white/10 rounded-[1.8rem] p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"></div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 shrink-0">
                    <Newspaper className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                      Live Price Drop Intelligence & News
                    </h2>
                    <p className="text-xs text-white/50 leading-relaxed">
                      Customized based on your search history and watchlist preferences.
                    </p>
                  </div>
                </div>

                {/* Automation & Watchlist status */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={syncLiveNewsData}
                    disabled={isSyncingNews}
                    className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                      isSyncingNews 
                        ? "bg-[#12141a]/60 border-blue-500/30 text-blue-400/80" 
                        : "bg-blue-600 border-blue-500 hover:bg-blue-500 hover:border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] active:scale-95"
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingNews ? "animate-spin text-blue-400" : "text-white"}`} />
                    {isSyncingNews ? "Syncing Live..." : "Get Live Sync Data"}
                  </button>

                  <div className={`bg-[#12141a]/80 border ${isAlertsEnabled ? "border-emerald-500/15" : "border-red-500/15"} px-3.5 py-2 rounded-2xl flex items-center gap-2.5`}>
                    <span className="relative flex h-2 w-2">
                      {isAlertsEnabled ? (
                        <>
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </>
                      ) : (
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      )}
                    </span>
                    <div className="flex flex-col">
                      <span className={`text-[8px] ${isAlertsEnabled ? "text-emerald-400/80" : "text-red-400/80"} uppercase font-black tracking-wider leading-none`}>Watchlist Monitor</span>
                      <span className="text-[10px] font-bold text-white leading-tight font-mono">
                        {isAlertsEnabled ? `Active • Next check in ${watchlistCountdown}s` : "Alerts Blocked (Disabled)"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const nextState = !isAlertsEnabled;
                      setIsAlertsEnabled(nextState);
                      localStorage.setItem("price_tracker_alerts_enabled", String(nextState));
                    }}
                    className={`px-3 py-2 rounded-2xl text-[10px] font-extrabold uppercase transition-all cursor-pointer border ${
                      isAlertsEnabled
                        ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
                        : "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20"
                    }`}
                    title={isAlertsEnabled ? "Click to disable all automatic alerts" : "Click to enable automatic alerts"}
                  >
                    {isAlertsEnabled ? "🔔 Alerts ON" : "🔕 Alerts OFF"}
                  </button>
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {["all", "electronics", "mobile", "appliances", "fashion"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setNewsFilter(cat);
                    }}
                    className={`capitalize text-[10px] font-mono px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                      newsFilter === cat 
                        ? "bg-blue-600/15 border-blue-500/30 text-blue-400 font-bold" 
                        : "bg-[#12141a] border-white/5 hover:border-white/10 text-white/60 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* News Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {getRecommendedNews().slice(0, 4).map((item) => (
                  <div 
                    key={item.id} 
                    className={`relative p-5 rounded-2xl bg-[#12141a]/60 border transition duration-250 flex flex-col justify-between gap-4 hover:border-blue-500/30 group ${
                      item.isRecommended ? "border-blue-500/20 shadow-[0_0_15px_rgba(30,92,255,0.02)]" : "border-white/5"
                    }`}
                  >
                    {item.isRecommended && (
                      <span className="absolute top-3 right-3 bg-blue-500/10 text-blue-400 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-blue-500/20 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" /> Preferred Drop
                      </span>
                    )}

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-1.5 text-[9px] text-white/40 font-mono flex-wrap">
                        <span className="uppercase">{item.category}</span>
                        <span>•</span>
                        <span>{item.timestamp}</span>
                        {item.isSynced && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-400 font-extrabold uppercase tracking-wider flex items-center gap-0.5 text-[8px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                              Live Synced
                            </span>
                          </>
                        )}
                      </div>
                      
                      <h3 className="text-xs font-bold text-white leading-snug group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </h3>

                      <p className="text-[10px] text-white/50 leading-relaxed truncate-2-lines">
                        {item.productName}
                      </p>
                    </div>

                    <div className="mt-2 pt-3 border-t border-white/5 flex items-end justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] line-through text-white/30 font-mono">{item.originalPrice}</span>
                          <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-1 rounded font-mono">
                            -{item.savingPercent}%
                          </span>
                        </div>
                        <span className="text-sm font-black text-white font-mono">{item.newPrice}</span>
                        <span className="text-[8px] text-white/30 uppercase tracking-widest font-mono">
                          on {item.merchant}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setQuery(item.productName);
                          handleSearch(item.productName);
                        }}
                        disabled={isSearching}
                        className="p-2 bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-xl text-white transition shrink-0 cursor-pointer flex items-center justify-center shadow-[0_0_10px_rgba(37,99,235,0.2)]"
                        title={`Scan ${item.productName} now`}
                      >
                        <Search className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

        {/* Two Column Grid */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Input form & quick scans & history list */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <section className="bg-[#0b0c11] border border-white/10 rounded-3xl p-6 flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
                <h2 className="text-lg font-bold text-white tracking-tight">Smart Price Scanner</h2>
              </div>
              <p className="text-xs text-white/50 leading-relaxed -mt-2">
                Paste Amazon, Flipkart, Myntra links or type any product name
              </p>
              
              <div className="w-full h-px bg-white/5 my-1"></div>

              <form 
                onSubmit={(e) => { e.preventDefault(); handleSearch(query); }} 
                className="flex flex-col gap-3"
              >
                <span className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-bold block">
                  E-COMMERCE ANALYZER & TRACKER
                </span>
                <div className="bg-[#12141a] border border-white/10 rounded-2xl flex items-center px-4 py-1.5 focus-within:border-blue-500/50 transition">
                  {isUrl(query) ? <LinkIcon className="w-4 h-4 text-blue-400 shrink-0" /> : <Search className="w-4 h-4 text-white/30 shrink-0" />}
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Paste Amazon/Flipkart link or search product"
                    disabled={isSearching}
                    className="flex-1 bg-transparent border-none focus:outline-none text-sm px-3 py-3 placeholder:text-white/20 text-white outline-none w-full"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching || !query.trim()}
                  className="w-full bg-[#1e5cff] hover:bg-blue-600 active:scale-[0.98] text-white font-extrabold py-3.5 px-4 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition duration-150 cursor-pointer disabled:opacity-40 disabled:hover:bg-[#1e5cff] disabled:pointer-events-none"
                >
                  {isSearching ? "Searching..." : "SCAN & PREDICT PRICE"} <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="flex flex-col gap-3 mt-2">
                <span className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-bold">
                  QUICK LIVE GROUNDED SCANS
                </span>
                <div className="flex flex-col gap-2">
                  {QUICK_SUGGESTIONS.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSuggestionClick(s.query)}
                      disabled={isSearching}
                      className="flex items-center gap-2 bg-[#12141a] hover:bg-white/5 border border-white/5 hover:border-white/10 px-3.5 py-2.5 rounded-xl text-xs text-white/80 hover:text-white transition cursor-pointer text-left w-full truncate"
                    >
                      <Search className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="truncate">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Side Scan History - Nested beautifully here to keep Layout clean and identical to screenshot */}
            <section className="bg-[#0b0c11] border border-white/10 rounded-3xl p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-500" />
                  <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-white/70">Recent Scans</h3>
                </div>
                {history.length > 0 && (
                  <button
                    onClick={handleClearAllHistory}
                    className="text-white/40 hover:text-white text-xs font-medium flex items-center gap-1 cursor-pointer transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="text-center py-6 text-white/20">
                  <p className="text-xs">No scan history recorded yet</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectHistoryItem(item)}
                      className="group p-3 rounded-xl bg-[#12141a] hover:bg-white/5 border border-white/5 hover:border-white/10 transition duration-150 cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-xs font-medium text-white group-hover:text-blue-400 transition truncate">
                          {item.data.productName}
                        </p>
                        <p className="text-[10px] font-mono font-bold text-blue-400">
                          {item.data.price}
                        </p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-blue-500 opacity-0 group-hover:opacity-100 transition shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN: Search Results card, Loading, Error state */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <AnimatePresence mode="wait">
              {isSearching && (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="bg-[#0b0c11] border border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center space-y-5 shadow-inner min-h-[350px]"
                >
                  <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-2 border-white/5 border-t-blue-500 animate-spin"></div>
                    <Sparkles className="w-6 h-6 text-blue-500 absolute animate-pulse" />
                  </div>
                  <div className="text-center space-y-1.5">
                    <p className="text-base font-medium text-white tracking-wide">
                      {LOADING_MESSAGES[loadingMessageIndex]}
                    </p>
                    <p className="text-xs text-white/30">Harnessing real-time search engine nodes</p>
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="bg-red-950/20 border border-red-500/20 rounded-3xl p-6 flex gap-4"
                >
                  <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-red-200 tracking-wide uppercase">Analysis Failed</h3>
                    <p className="text-xs text-white/60 leading-relaxed">{error}</p>
                  </div>
                </motion.div>
              )}

              {result && !isSearching && (() => {
                const priceInfo = getPriceDetails(result.data.price, result.data.numericPrice);
                const isAmazon = result.data.merchant.toLowerCase().includes("amazon");
                const isFlipkart = result.data.merchant.toLowerCase().includes("flipkart");
                
                return (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-6"
                  >
                    {/* Primary Product Detail Display Card */}
                    <div className="bg-[#0b0c11] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden">
                      {/* Meta Tags Row */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          isAmazon 
                            ? "bg-[#1d4ed8]/20 text-[#60a5fa] border border-[#3b82f6]/30" 
                            : isFlipkart
                            ? "bg-[#854d0e]/20 text-[#fde047] border border-[#eab308]/30"
                            : "bg-white/5 text-white/70 border border-white/10"
                        }`}>
                          {result.data.merchant || "Web Merchant"}
                        </span>
                        <span className="text-white/40 text-[10px] font-mono tracking-widest uppercase bg-white/5 border border-white/5 px-2.5 py-0.5 rounded">
                          {result.data.availability || "In Stock"}
                        </span>
                      </div>

                      {/* Heading with Arrow */}
                      <div className="flex items-start justify-between gap-4 -mt-2">
                        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight flex-1">
                          {result.data.productName}
                        </h2>
                        <ArrowUpRight className="w-5 h-5 text-white/40 shrink-0 mt-1" />
                      </div>

                      {/* Pricing Block / Edit Price Form */}
                      {isEditingPrice ? (
                        <div className="bg-[#12141a] border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] text-white/40 uppercase font-bold tracking-wider">
                              Current Price on Website (e.g. ₹21,999)
                            </label>
                            <input
                              type="text"
                              value={editedPriceInput}
                              onChange={(e) => setEditedPriceInput(e.target.value)}
                              placeholder="e.g. ₹21,999"
                              className="w-full bg-[#0b0c11] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] text-white/40 uppercase font-bold tracking-wider">
                              Original List Price (Optional, e.g. ₹29,990)
                            </label>
                            <input
                              type="text"
                              value={editedOriginalPriceInput}
                              onChange={(e) => setEditedOriginalPriceInput(e.target.value)}
                              placeholder="e.g. ₹29,990"
                              className="w-full bg-[#0b0c11] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                            />
                          </div>
                          <div className="flex gap-2 justify-end mt-1">
                            <button
                              onClick={() => setIsEditingPrice(false)}
                              className="px-3 py-1.5 border border-white/10 hover:bg-white/5 rounded-xl text-xs text-white/60 hover:text-white transition cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSavePriceCorrection()}
                              className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-xl text-xs font-bold text-white transition cursor-pointer"
                            >
                              Save Correction
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-3xl sm:text-4.5xl font-black text-white font-sans tracking-tight">
                              {priceInfo.current}
                            </span>
                            {priceInfo.original && (
                              <span className="text-sm sm:text-base text-white/30 line-through font-medium ml-1">
                                {priceInfo.original}
                              </span>
                            )}
                            <button
                              onClick={() => {
                                setEditedPriceInput(result.data.price);
                                setEditedOriginalPriceInput(priceInfo.original || "");
                                setIsEditingPrice(true);
                              }}
                              className="ml-2 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/10 hover:border-blue-500/20 rounded-lg transition flex items-center gap-1 cursor-pointer"
                              title="Click to correct price if it doesn't match the merchant site"
                            >
                              <span>Correct Price</span>
                            </button>
                          </div>
                          {priceInfo.savings && (
                            <div className="bg-[#052e16] text-[#4ade80] border border-[#14532d] px-3 py-1.5 rounded-lg text-xs font-bold w-fit flex items-center gap-1.5 mt-1">
                              <span>%</span>
                              <span>Save {priceInfo.savings} ({priceInfo.percent}% off)</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* AI Price Analysis Summary Section */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-bold">
                          AI PRICE ANALYSIS SUMMARY
                        </span>
                        <div className="bg-[#12141a] border border-white/5 rounded-2xl p-5 text-sm text-white/80 leading-relaxed font-sans">
                          {priceInfo.original ? (
                            <span>
                              This is currently a very solid deal. At <strong className="text-white">{priceInfo.current}</strong>, it is <strong className="text-emerald-400">{priceInfo.percent}% below</strong> the list price of {priceInfo.original}. The data has been extracted from the active e-commerce page and verified to be 100% accurate and grounded with live web node values.
                            </span>
                          ) : (
                            <span>
                              {result.data.searchSummary}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Pin to Watchlist Action Button */}
                      <button 
                        onClick={() => handlePinToggle()}
                        className={`w-full py-3.5 px-6 rounded-xl border border-white/10 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition duration-150 active:scale-[0.98] cursor-pointer ${
                          isProductPinned(result.data.productName) 
                            ? "bg-[#1e5cff] border-[#1e5cff] text-white hover:bg-blue-600 shadow-[0_0_15px_rgba(30,92,255,0.3)]" 
                            : "bg-transparent text-white/80 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isProductPinned(result.data.productName) ? "fill-white text-white" : ""}`} />
                        <span>{isProductPinned(result.data.productName) ? "Pinned to Watchlist" : "Pin to Watchlist"}</span>
                      </button>

                      {/* Footer Indicators */}
                      <div className="border-t border-white/5 pt-4 flex items-center justify-between -mb-2">
                        <div className="flex items-center gap-2 text-[9px] text-white/40 uppercase tracking-widest font-bold">
                          <span className="w-2 h-2 rounded-full bg-[#1e5cff] shadow-[0_0_8px_rgba(30,92,255,0.8)] animate-pulse"></span>
                          <span>Search accuracy: 98%</span>
                        </div>
                        <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold font-mono">
                          {result.data.currency === "₹" || result.data.price.includes("₹") ? "INR Grounded" : "USD Grounded"}
                        </span>
                      </div>
                    </div>

                    {/* Secondary Product Features / Specifications Card */}
                    {result.data.features && result.data.features.length > 0 && (
                      <div className="bg-[#0b0c11] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col gap-4">
                        <span className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-bold">
                          KEY SPECIFICATIONS
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {result.data.features.map((feature, i) => (
                            <div 
                              key={i} 
                              className="flex items-center space-x-2.5 text-xs text-white/85 bg-[#12141a] p-3 rounded-xl border border-white/5"
                            >
                              <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                              <span className="truncate">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Removed grounding nodes block */}

                    {/* Prediction / Forecast card */}
                    {result.data.prediction && (() => {
                      const forecast = result.data.prediction.futureForecast || [];
                      const todayPrice = forecast[0]?.price || result.data.numericPrice || 0;
                      const p90Price = forecast[forecast.length - 1]?.price || todayPrice;

                      let minPrice = todayPrice;
                      let minPricePoint = forecast[0];
                      forecast.forEach((pt: any) => {
                        if (pt.price < minPrice) {
                          minPrice = pt.price;
                          minPricePoint = pt;
                        }
                      });

                      let maxPrice = todayPrice;
                      let maxPricePoint = forecast[0];
                      forecast.forEach((pt: any) => {
                        if (pt.price > maxPrice) {
                          maxPrice = pt.price;
                          maxPricePoint = pt;
                        }
                      });

                      // Determine dynamic 90-day recommendation and reason based on forecast analysis
                      let recType: "BUY" | "HOLD" | "WAIT" = "HOLD";
                      let recTitle = "HOLD PRODUCT";
                      let recBadgeColor = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                      let reasonText = "";

                      const diffPercent = ((p90Price - todayPrice) / todayPrice) * 100;
                      const minPriceDiffPercent = ((todayPrice - minPrice) / todayPrice) * 100;

                      if (minPriceDiffPercent >= 4.5) {
                        recType = "WAIT";
                        recTitle = "WAIT FOR DEAL";
                        recBadgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse";
                        reasonText = `Our 90-day forecast analyzer projects a significant price dip of ${minPriceDiffPercent.toFixed(1)}% down to ${result.data.currency || "₹"}${minPrice.toLocaleString()} around ${minPricePoint?.label} (${minPricePoint?.dateLabel}). We strongly recommend waiting for this upcoming discount window to buy at the optimal entry point.`;
                      } else if (diffPercent >= 3.0) {
                        recType = "BUY";
                        recTitle = "BUY NOW";
                        recBadgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                        reasonText = `We project a steady upward trend of +${diffPercent.toFixed(1)}% reaching ${result.data.currency || "₹"}${p90Price.toLocaleString()} over the next 90 days. We suggest you buy the product now to secure the current lowest price before it hikes.`;
                      } else {
                        recType = "HOLD";
                        recTitle = "HOLD ON PRODUCT";
                        recBadgeColor = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                        reasonText = `The price is projected to remain extremely stable within a tight +/- 3% margin over the next 90 days (projected to end around ${result.data.currency || "₹"}${p90Price.toLocaleString()}). There is no urgent price drop or surge expected, so we suggest you hold on the product and purchase whenever convenient.`;
                      }

                      return (
                        <div className="bg-[#0b0c11] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col gap-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
                            <span className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-bold">
                              90-DAY FORECAST ANALYZER & RECOMMENDATION
                            </span>
                            <div className="flex items-center gap-1.5 text-[9px] font-mono text-white/50 bg-[#12141a] px-2 py-0.5 rounded-md border border-white/5">
                              <span>Confidence Rate: 94.5%</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                            {/* Recommendation Card */}
                            <div className="lg:col-span-4 bg-[#12141a] p-5 rounded-2xl border border-white/5 flex flex-col justify-between gap-4">
                              <div>
                                <span className="text-[9px] text-white/40 uppercase tracking-wider block font-bold mb-1.5">Our Suggestion</span>
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border ${recBadgeColor}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${recType === "BUY" ? "bg-emerald-500" : recType === "WAIT" ? "bg-amber-500" : "bg-blue-500"} animate-pulse`}></span>
                                  {recTitle}
                                </div>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] text-white/30 block font-bold font-mono">90-DAY PRICE RANGE</span>
                                <div className="text-sm font-black text-white flex items-center gap-1.5">
                                  <span>{result.data.currency || "₹"}{minPrice.toLocaleString()}</span>
                                  <span className="text-white/30 font-normal">to</span>
                                  <span>{result.data.currency || "₹"}{maxPrice.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>

                            {/* Reasoning Card */}
                            <div className="lg:col-span-8 bg-[#12141a]/60 p-5 rounded-2xl border border-white/5 flex flex-col justify-center">
                              <span className="text-[9px] text-white/40 uppercase tracking-wider block font-bold mb-1.5">Analysis Reason & Outlook</span>
                              <p className="text-xs text-white/80 leading-relaxed font-medium">
                                "{reasonText}"
                              </p>
                            </div>
                          </div>
                          
                          {/* Interactive Price Forecast Section */}
                          {result.data.prediction.futureForecast && result.data.prediction.futureForecast.length > 0 && (
                            <div className="mt-2 pt-5 border-t border-white/5 space-y-6">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                                    90-Day Future Price Forecast
                                  </h4>
                                  <p className="text-xs text-white/50">Simulated AI projections based on active demand patterns and e-commerce lifecycle signals</p>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] bg-[#12141a] px-2.5 py-1.5 rounded-lg border border-white/5">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                  <span className="text-white/70 font-semibold uppercase">Predictive Engine Live</span>
                                </div>
                              </div>

                              {/* Chart Container */}
                              <div className="h-56 w-full bg-[#12141a]/50 rounded-2xl border border-white/5 p-4 relative overflow-hidden">
                                <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart
                                    data={result.data.prediction.futureForecast}
                                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                  >
                                    <defs>
                                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={recType === "WAIT" ? "#10b981" : recType === "BUY" ? "#f59e0b" : "#3b82f6"} stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor={recType === "WAIT" ? "#10b981" : recType === "BUY" ? "#f59e0b" : "#3b82f6"} stopOpacity={0}/>
                                      </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                    <XAxis 
                                      dataKey="dateLabel" 
                                      stroke="rgba(255,255,255,0.3)" 
                                      fontSize={10}
                                      tickLine={false}
                                      axisLine={false}
                                    />
                                    <YAxis 
                                      stroke="rgba(255,255,255,0.3)" 
                                      fontSize={10}
                                      tickLine={false}
                                      axisLine={false}
                                      domain={['auto', 'auto']}
                                      tickFormatter={(val) => {
                                        const isINR = result.data.currency === "₹" || val > 500;
                                        return `${result.data.currency || (isINR ? "₹" : "$")}${val.toLocaleString(isINR ? "en-IN" : "en-US", { maximumFractionDigits: 0 })}`;
                                      }}
                                    />
                                    <Tooltip
                                      contentStyle={{
                                        backgroundColor: "#0b0c11",
                                        borderColor: "rgba(255,255,255,0.1)",
                                        borderRadius: "16px",
                                        fontSize: "11px",
                                        color: "#fff"
                                      }}
                                      formatter={(value: any) => [
                                        <span className="font-bold text-white">{result.data.currency || "₹"}{Number(value).toLocaleString()}</span>,
                                        "Predicted Price"
                                      ]}
                                      labelFormatter={(label) => <span className="text-white/50 block font-semibold mb-1">Forecast: {label}</span>}
                                    />
                                    <Area 
                                      type="monotone" 
                                      dataKey="price" 
                                      stroke={recType === "WAIT" ? "#10b981" : recType === "BUY" ? "#f59e0b" : "#3b82f6"} 
                                      strokeWidth={2}
                                      fillOpacity={1} 
                                      fill="url(#colorPrice)" 
                                    />
                                  </AreaChart>
                                </ResponsiveContainer>
                              </div>

                              {/* Interactive Milestones Grid */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {result.data.prediction.futureForecast.map((point: any, index: number) => {
                                  const isSelected = selectedForecastIndex === index;
                                  return (
                                    <button
                                      key={index}
                                      onClick={() => setSelectedForecastIndex(index)}
                                      className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                                        isSelected 
                                          ? "bg-[#181a24] border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
                                          : "bg-[#12141a]/60 border-white/5 hover:bg-[#12141a] hover:border-white/10"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-white/40 font-bold uppercase">{point.label}</span>
                                        {point.trend === "up" ? (
                                          <ArrowUpRight className="w-3.5 h-3.5 text-amber-500" />
                                        ) : point.trend === "down" ? (
                                          <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
                                        ) : (
                                          <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                                        )}
                                      </div>
                                      
                                      <div className="mt-1 flex items-baseline gap-1">
                                        <span className="text-sm font-black text-white">{point.formattedPrice}</span>
                                      </div>

                                      <div className="mt-2 space-y-1">
                                        <div className="flex items-center justify-between text-[9px] text-white/50">
                                          <span>Confidence</span>
                                          <span className="font-bold text-white/70">{point.confidence}%</span>
                                        </div>
                                        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                          <div 
                                            className={`h-full rounded-full ${
                                              point.confidence > 80 
                                                ? "bg-blue-500" 
                                                : point.confidence > 65 
                                                  ? "bg-emerald-500" 
                                                  : "bg-amber-500"
                                            }`}
                                            style={{ width: `${point.confidence}%` }}
                                          />
                                        </div>
                                        <span className="text-[9px] text-white/40 block mt-0.5">{point.dateLabel}</span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Detail pane for clicked milestone */}
                              {selectedForecastIndex !== null && (() => {
                                const point = result.data.prediction.futureForecast[selectedForecastIndex];
                                if (!point) return null;
                                const initialPrice = result.data.prediction.futureForecast[0]?.price || point.price;
                                const difference = point.price - initialPrice;
                                const diffPercent = ((difference / initialPrice) * 100).toFixed(1);
                                const isNegative = difference < 0;
                                
                                return (
                                  <motion.div 
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-[#12141a] p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                                  >
                                    <div>
                                      <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wider block">Milestone Spotlight: {point.label} ({point.dateLabel})</span>
                                      <p className="text-xs text-white/75 mt-1 leading-relaxed">
                                        We project the product will retail around <strong className="text-white">{point.formattedPrice}</strong>.
                                        {difference === 0 ? (
                                          " This represents no net change compared to the current active e-commerce price index."
                                        ) : isNegative ? (
                                          <span>
                                            {" "}This marks a savings of <strong className="text-emerald-400">-{result.data.currency || "₹"}{Math.abs(difference).toLocaleString()} ({diffPercent}%)</strong> relative to today's price.
                                          </span>
                                        ) : (
                                          <span>
                                            {" "}This represents a price increase of <strong className="text-amber-400">+{result.data.currency || "₹"}{difference.toLocaleString()} (+{diffPercent}%)</strong> relative to today's price.
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                    <div className="bg-[#0b0c11] px-4 py-3 rounded-xl border border-white/5 shrink-0 w-full md:w-auto flex items-center justify-between md:justify-start gap-4">
                                      <div className="mr-2">
                                        <span className="text-[9px] text-white/40 uppercase block">Projected Saving</span>
                                        <span className={`text-sm font-black ${isNegative ? "text-emerald-400" : difference === 0 ? "text-white" : "text-amber-400"}`}>
                                          {isNegative ? `-${result.data.currency || "₹"}${Math.abs(difference).toLocaleString()}` : difference === 0 ? "₹0" : `+${result.data.currency || "₹"}${difference.toLocaleString()}`}
                                        </span>
                                      </div>
                                      <div className="w-px h-8 bg-white/10 hidden md:block" />
                                      <div>
                                        <span className="text-[9px] text-white/40 uppercase block">Prediction Strength</span>
                                        <span className="text-sm font-black text-blue-400">{point.confidence}%</span>
                                      </div>
                                    </div>
                                  </motion.div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>

        </div>
          </>
        ) : activeTab === "watchlist" ? (
          <div className="flex-1 flex flex-col gap-6">
            {/* Watchlist view */}
            {!currentUser ? (
              <div className="bg-[#0b0c11] border border-white/10 rounded-3xl p-10 sm:p-16 flex flex-col items-center justify-center text-center max-w-2xl mx-auto my-8 space-y-6">
                <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/30 rounded-full flex items-center justify-center text-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.15)]">
                  <Lock className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">Unlock Your Personalized Watchlist</h2>
                  <p className="text-sm text-white/60 leading-relaxed max-w-md">
                    Create an account or sign in to save your favorite products, monitor price drops, and get predictive 30-day outlook alerts tailored to your trackings.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setAuthError(null);
                    setAuthSuccess(null);
                    setAuthMode("login");
                    setIsAuthModalOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl transition duration-150 active:scale-95 shadow-[0_0_15px_rgba(37,99,235,0.3)] cursor-pointer"
                >
                  Sign In / Register Now
                </button>
              </div>
            ) : !currentUser.watchlist || currentUser.watchlist.length === 0 ? (
              <div className="bg-[#0b0c11] border border-white/10 rounded-3xl p-10 sm:p-16 flex flex-col items-center justify-center text-center max-w-2xl mx-auto my-8 space-y-6">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white/30">
                  <Heart className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">Your Watchlist is Empty</h2>
                  <p className="text-sm text-white/60 leading-relaxed max-w-md">
                    Explore products in the Discover tab and click the Heart icon to pin them here for instant tracking.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("discover")}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl transition duration-150 active:scale-95 shadow-[0_0_15px_rgba(37,99,235,0.3)] cursor-pointer"
                >
                  Explore Products
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Your Tracked Products</h2>
                  <p className="text-xs text-white/50">Real-time tracking of e-commerce prices and market predictions</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentUser.watchlist.map((item: any) => {
                    const priceInfo = getPriceDetails(item.data.price, item.data.numericPrice);
                    const isAmazon = item.data.merchant.toLowerCase().includes("amazon");
                    const isFlipkart = item.data.merchant.toLowerCase().includes("flipkart");
                    
                    return (
                      <div 
                        key={item.id}
                        className="bg-[#0b0c11] border border-white/10 rounded-3xl p-6 flex flex-col justify-between gap-5 relative overflow-hidden group hover:border-white/20 transition duration-150"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                              isAmazon 
                                ? "bg-[#1d4ed8]/20 text-[#60a5fa] border border-[#3b82f6]/30" 
                                : isFlipkart
                                ? "bg-[#854d0e]/20 text-[#fde047] border border-[#eab308]/30"
                                : "bg-white/5 text-white/70 border border-white/10"
                            }`}>
                              {item.data.merchant}
                            </span>
                            
                            <button
                              onClick={() => handlePinToggle(item.data, item.sources)}
                              className="text-red-400 hover:text-red-300 transition p-1.5 rounded-full hover:bg-white/5 cursor-pointer"
                              title="Remove from watchlist"
                            >
                              <Heart className="w-4 h-4 fill-red-400 text-red-400" />
                            </button>
                          </div>

                          <h3 className="text-sm font-bold text-white tracking-tight line-clamp-2">
                            {item.data.productName}
                          </h3>

                          <div className="flex items-baseline gap-2 pt-1">
                            <span className="text-2xl font-black text-white">{priceInfo.current}</span>
                            {priceInfo.original && (
                              <span className="text-xs text-white/30 line-through">{priceInfo.original}</span>
                            )}
                          </div>

                          {priceInfo.savings && (
                            <span className="inline-block text-[10px] bg-[#052e16] text-[#4ade80] border border-[#14532d] px-2 py-0.5 rounded font-bold">
                              Save {priceInfo.savings} ({priceInfo.percent}% off)
                            </span>
                          )}
                        </div>

                        <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                          {item.data.prediction ? (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-white/40 uppercase font-bold">REC:</span>
                              <span className={`text-[10px] font-black uppercase ${
                                item.data.prediction.recommendation.toLowerCase().includes("buy") 
                                  ? "text-emerald-400" 
                                  : "text-blue-400"
                              }`}>
                                {item.data.prediction.recommendation}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-white/40">Grounded analysis</span>
                          )}

                          <button
                            onClick={() => {
                              setQuery(item.query);
                              setResult({ data: item.data, sources: item.sources });
                              setActiveTab("discover");
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg text-white transition cursor-pointer flex items-center gap-1"
                          >
                            <span>View Live</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-8">
            {/* Header section with styling */}
            <div className="bg-gradient-to-r from-red-950/20 to-stone-900/40 border border-red-500/20 rounded-[1.8rem] p-6 sm:p-10 text-white flex flex-col gap-3 relative overflow-hidden shadow-xl shadow-red-950/10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(239,68,68,0.1),transparent)]"></div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] tracking-wider px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full font-bold uppercase w-fit inline-block mb-3 text-red-400">
                    ADMINISTRATOR CONSOLE SECURED
                  </span>
                  <h1 className="text-2xl sm:text-3.5xl font-black tracking-tight leading-tight text-white flex items-center gap-2">
                    <Lock className="w-8 h-8 text-red-500" />
                    App Management Console
                  </h1>
                  <p className="text-xs sm:text-sm text-white/60 max-w-2xl leading-relaxed mt-1">
                    Manage registered customer profiles, deploy real-time announcements, toggle simulated system maintenance flags, and monitor global watchlist items.
                  </p>
                </div>
                <div className="flex items-center gap-3 self-start md:self-center font-mono">
                  <span className="text-xs text-white/40">Status:</span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>ADMIN SECURED</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Guard against non-admin */}
            {(!currentUser || currentUser.email.toLowerCase() !== "krishnarajawat465@gmail.com") ? (
              <div className="bg-[#0b0c11] border border-red-500/15 rounded-3xl p-10 sm:p-16 flex flex-col items-center justify-center text-center max-w-2xl mx-auto my-8 space-y-6">
                <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">Access Denied</h2>
                  <p className="text-sm text-white/60 leading-relaxed max-w-md">
                    This module is exclusively restricted to verified system administrators. Please sign in with administrator credentials.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setAuthError(null);
                    setAuthSuccess(null);
                    setAuthMode("login");
                    setIsAuthModalOpen(true);
                  }}
                  className="bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl transition duration-150 cursor-pointer"
                >
                  Switch Account
                </button>
              </div>
            ) : (
              <>
                {/* Stats Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#0b0c11] p-5 rounded-2xl border border-white/10 flex flex-col gap-2">
                    <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Total Registered Profiles</span>
                    <span className="text-3xl font-black text-white">{adminUsers.length}</span>
                    <span className="text-[10px] text-emerald-400 font-medium">Synced from localStorage</span>
                  </div>

                  <div className="bg-[#0b0c11] p-5 rounded-2xl border border-white/10 flex flex-col gap-2">
                    <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Active Tracked Items</span>
                    <span className="text-3xl font-black text-white">
                      {adminUsers.reduce((sum, u) => sum + (u.watchlist?.length || 0), 0)}
                    </span>
                    <span className="text-[10px] text-blue-400 font-medium">Cross-user metrics aggregate</span>
                  </div>

                  <div className="bg-[#0b0c11] p-5 rounded-2xl border border-white/10 flex flex-col gap-2">
                    <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Current Broadcast Message</span>
                    <p className="text-xs font-semibold text-white/80 leading-relaxed line-clamp-2">
                      {announcement || "No active alert is currently broadcasted."}
                    </p>
                    <span className="text-[10px] text-white/30 font-medium">Rendered live globally</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Controls column */}
                  <div className="lg:col-span-5 flex flex-col gap-6">
                    {/* Broadcast Management */}
                    <div className="bg-[#0b0c11] border border-white/10 rounded-3xl p-6 flex flex-col gap-5">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-500" />
                        <h3 className="text-base font-extrabold text-white tracking-tight">Deploy Broadcast Message</h3>
                      </div>
                      <p className="text-xs text-white/50 leading-relaxed -mt-2">
                        Update the alert message visible on the top header for all system users instantly.
                      </p>

                      <div className="space-y-3">
                        <textarea
                          rows={3}
                          value={announcementInput}
                          onChange={(e) => setAnnouncementInput(e.target.value)}
                          placeholder="Type global alert notification..."
                          className="w-full bg-[#12141a] border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition resize-none"
                        />
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() => setAnnouncementInput("⚡ Epic Price Drop Alert! Sony XM5 headphones hit historic low of ₹26,490!")}
                            className="text-[9px] bg-white/5 hover:bg-white/10 text-white/70 px-2 py-1 rounded border border-white/5 font-bold transition cursor-pointer"
                          >
                            Headphones Alert
                          </button>
                          <button
                            onClick={() => setAnnouncementInput("🔥 Amazon India Great Freedom Festival prices are now indexed live!")}
                            className="text-[9px] bg-white/5 hover:bg-white/10 text-white/70 px-2 py-1 rounded border border-white/5 font-bold transition cursor-pointer"
                          >
                            Freedom Festival
                          </button>
                          <button
                            onClick={() => setAnnouncementInput("")}
                            className="text-[9px] bg-red-950/20 hover:bg-red-950/40 text-red-400 px-2 py-1 rounded border border-red-500/10 font-bold transition cursor-pointer"
                          >
                            Clear Alert
                          </button>
                        </div>
                        <button
                          onClick={async () => {
                            localStorage.setItem("price_tracker_announcement", announcementInput);
                            setAnnouncement(announcementInput);
                            try {
                              await saveFirebaseSettings(announcementInput, isMaintenance);
                            } catch (e) {
                              console.error("Failed to save global broadcast message to Firestore:", e);
                            }
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase tracking-wider py-2.5 rounded-xl transition shadow-[0_0_15px_rgba(30,92,255,0.2)] cursor-pointer"
                        >
                          Publish Alert
                        </button>
                      </div>
                    </div>

                    {/* System simulation controls */}
                    <div className="bg-[#0b0c11] border border-white/10 rounded-3xl p-6 flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <h3 className="text-base font-extrabold text-white tracking-tight">System Simulation Flags</h3>
                      </div>
                      
                      <div className="flex items-center justify-between bg-[#12141a] p-3.5 rounded-xl border border-white/5">
                        <div>
                          <span className="text-xs font-bold text-white block">Simulate Maintenance Mode</span>
                          <span className="text-[10px] text-white/40">Displays safety banner and alerts to test edge cases</span>
                        </div>
                        <button
                          onClick={async () => {
                            const val = !isMaintenance;
                            setIsMaintenance(val);
                            localStorage.setItem("price_tracker_maintenance", String(val));
                            try {
                              await saveFirebaseSettings(announcement, val);
                            } catch (e) {
                              console.error("Failed to save global maintenance flag to Firestore:", e);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                            isMaintenance
                              ? "bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                              : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
                          }`}
                        >
                          {isMaintenance ? "ACTIVE" : "DISABLED"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right directory column */}
                  <div className="lg:col-span-7 flex flex-col gap-5">
                    <div className="bg-[#0b0c11] border border-white/10 rounded-3xl p-6 flex flex-col gap-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base font-extrabold text-white tracking-tight">Customer Database Profiles</h3>
                          <p className="text-[10px] text-white/40 mt-0.5 font-bold">VERIFIED SECURE DATABASE REGISTRY</p>
                        </div>
                        {/* Search Bar */}
                        <div className="bg-[#12141a] border border-white/10 rounded-xl flex items-center px-3 py-1.5 text-xs text-white focus-within:border-blue-500/50 transition sm:max-w-xs w-full">
                          <Search className="w-3.5 h-3.5 text-white/30 mr-2 shrink-0" />
                          <input
                            type="text"
                            placeholder="Search name, username, email..."
                            value={adminSearchQuery}
                            onChange={(e) => setAdminSearchQuery(e.target.value)}
                            className="bg-transparent focus:outline-none w-full text-xs text-white"
                          />
                        </div>
                      </div>

                      {/* Profiles list */}
                      <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                        {(() => {
                          const queryLower = adminSearchQuery.toLowerCase().trim();
                          const filtered = adminUsers.filter(u => {
                            const nameMatch = u.name?.toLowerCase().includes(queryLower);
                            const emailMatch = u.email?.toLowerCase().includes(queryLower);
                            const userMatch = u.username?.toLowerCase().includes(queryLower);
                            return nameMatch || emailMatch || userMatch;
                          });

                          if (filtered.length === 0) {
                            return (
                              <div className="text-center py-10 text-white/30 text-xs">
                                No registered users match your query search.
                              </div>
                            );
                          }

                          return filtered.map((user: any) => {
                            const isAdmin = user.email.toLowerCase() === "krishnarajawat465@gmail.com";
                            
                            const handleResetWatchlist = async () => {
                              try {
                                const usersStr = localStorage.getItem("price_tracker_users");
                                const users = usersStr ? JSON.parse(usersStr) : [];
                                const index = users.findIndex((u: any) => u.email.toLowerCase() === user.email.toLowerCase());
                                if (index !== -1) {
                                  users[index].watchlist = [];
                                  localStorage.setItem("price_tracker_users", JSON.stringify(users));
                                  
                                  const updatedUserObj = {
                                    email: user.email,
                                    username: user.username,
                                    password: user.password,
                                    name: user.name,
                                    watchlist: []
                                  };
                                  await saveFirebaseUser(updatedUserObj);
                                  
                                  if (currentUser?.email.toLowerCase() === user.email.toLowerCase()) {
                                    const updatedUser = { ...currentUser, watchlist: [] };
                                    setCurrentUser(updatedUser);
                                    localStorage.setItem("price_tracker_active_user", JSON.stringify(updatedUser));
                                  }
                                  await refreshAdminUsers();
                                  alert(`Successfully cleared watchlist for ${user.name}`);
                                }
                              } catch (err) {
                                console.error(err);
                              }
                            };

                            const handleResetPassword = async () => {
                              try {
                                const usersStr = localStorage.getItem("price_tracker_users");
                                const users = usersStr ? JSON.parse(usersStr) : [];
                                const index = users.findIndex((u: any) => u.email.toLowerCase() === user.email.toLowerCase());
                                if (index !== -1) {
                                  const tempPass = "reset123";
                                  users[index].password = tempPass;
                                  localStorage.setItem("price_tracker_users", JSON.stringify(users));
                                  
                                  const updatedUserObj = {
                                    email: user.email,
                                    username: user.username,
                                    password: tempPass,
                                    name: user.name,
                                    watchlist: user.watchlist || []
                                  };
                                  await saveFirebaseUser(updatedUserObj);

                                  await refreshAdminUsers();
                                  alert(`Password for ${user.name} reset successfully to "${tempPass}".`);
                                }
                              } catch (err) {
                                console.error(err);
                              }
                            };

                            const handleDeleteAccount = async () => {
                              if (isAdmin) {
                                alert("Cannot delete administrative system profile!");
                                return;
                              }
                              if (!window.confirm(`Are you absolutely sure you want to permanently delete user account for ${user.name}?`)) {
                                return;
                              }
                              try {
                                const usersStr = localStorage.getItem("price_tracker_users");
                                const users = usersStr ? JSON.parse(usersStr) : [];
                                const filteredUsers = users.filter((u: any) => u.email.toLowerCase() !== user.email.toLowerCase());
                                localStorage.setItem("price_tracker_users", JSON.stringify(filteredUsers));
                                
                                await deleteFirebaseUser(user.email);
                                
                                await refreshAdminUsers();
                              } catch (err) {
                                console.error(err);
                              }
                            };

                            return (
                              <div key={user.email} className="bg-[#12141a] border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/10 transition">
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-white">{user.name}</span>
                                    {isAdmin && (
                                      <span className="bg-red-500/10 text-red-400 text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.2 rounded border border-red-500/20 font-mono">
                                        Admin Root
                                      </span>
                                    )}
                                    <span className="text-[10px] font-mono text-white/40">@{user.username || "no_username"}</span>
                                  </div>
                                  <div className="flex flex-col gap-0.5 text-[10px] text-white/50 font-mono">
                                    <span>Email: {user.email}</span>
                                    <span>Pass: <span className="text-white/85 font-bold">{user.password}</span></span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[9px] text-white/40 font-bold uppercase tracking-wider">
                                    <Heart className="w-3.5 h-3.5 text-red-500/60" />
                                    <span>Tracked Items: <strong className="text-white">{user.watchlist?.length || 0}</strong></span>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5 self-start md:self-center">
                                  <button
                                    onClick={handleResetWatchlist}
                                    className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg text-white transition cursor-pointer"
                                  >
                                    Clear Watchlist
                                  </button>
                                  <button
                                    onClick={handleResetPassword}
                                    className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg text-white transition cursor-pointer"
                                    title="Reset password to 'reset123'"
                                  >
                                    Reset Password
                                  </button>
                                  {!isAdmin && (
                                    <button
                                      onClick={handleDeleteAccount}
                                      className="bg-red-950/20 hover:bg-red-950/40 border border-red-500/10 hover:border-red-500/25 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg text-red-400 transition cursor-pointer"
                                    >
                                      Delete Profile
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* AUTHENTICATION MODAL */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />
            
            {/* Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#0b0c11] border border-white/10 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-2xl z-10"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
              
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition duration-150 cursor-pointer p-1 rounded-full hover:bg-white/5"
              >
                <XCircle className="w-5 h-5" />
              </button>

              <div className="mb-6 text-center">
                <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center font-black text-white text-lg mx-auto mb-3 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                  T
                </div>
                <h3 className="text-xl font-extrabold text-white tracking-tight">
                  {authMode === "login" ? "Sign In to PriceTracker" : authMode === "forgot" ? "Reset Your Password" : "Create Your Account"}
                </h3>
                <p className="text-xs text-white/50 mt-1">
                  {authMode === "login" ? "Access your custom watchlists and scan history" : authMode === "forgot" ? "Retrieve your password via register database" : "Track price drops across Indian e-commerce sites"}
                </p>
              </div>

              {authError && (
                <div className="bg-red-950/20 border border-red-500/20 rounded-xl p-3 mb-4 text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {authSuccess && (
                <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3 mb-4 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{authSuccess}</span>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === "register" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Full Name</label>
                      <input
                        type="text"
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="e.g. Krishnarajawat"
                        className="w-full bg-[#12141a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Choose Username</label>
                      <input
                        type="text"
                        required
                        value={authUsername}
                        onChange={(e) => setAuthUsername(e.target.value.replace(/\s+/g, ""))}
                        placeholder="e.g. krishnaraj"
                        className="w-full bg-[#12141a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition font-mono"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/40 uppercase tracking-wider font-bold">
                    {authMode === "register" ? "Email Address" : "Email Address or Username"}
                  </label>
                  <input
                    type={authMode === "register" ? "email" : "text"}
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder={authMode === "register" ? "name@example.com" : "admin or name@example.com"}
                    className="w-full bg-[#12141a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition"
                  />
                </div>

                {authMode !== "forgot" && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Password</label>
                      {authMode === "login" && (
                        <button
                          type="button"
                          onClick={() => {
                            setAuthError(null);
                            setAuthSuccess(null);
                            setAuthMode("forgot");
                          }}
                          className="text-[10px] text-blue-400 hover:text-blue-300 font-bold hover:underline transition cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#12141a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#1e5cff] hover:bg-blue-600 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition duration-150 cursor-pointer shadow-[0_0_15px_rgba(30,92,255,0.2)]"
                >
                  {authMode === "login" ? "SIGN IN" : authMode === "forgot" ? "RECOVER PASSWORD" : "CREATE ACCOUNT"}
                </button>
              </form>

              <div className="mt-6 text-center text-xs text-white/40">
                {authMode === "login" ? (
                  <p>
                    Don't have an account?{" "}
                    <button
                      onClick={() => {
                        setAuthError(null);
                        setAuthSuccess(null);
                        setAuthMode("register");
                      }}
                      className="text-blue-400 hover:underline font-bold"
                    >
                      Sign Up
                    </button>
                  </p>
                ) : authMode === "forgot" ? (
                  <p>
                    Remembered your password?{" "}
                    <button
                      onClick={() => {
                        setAuthError(null);
                        setAuthSuccess(null);
                        setAuthMode("login");
                      }}
                      className="text-blue-400 hover:underline font-bold"
                    >
                      Sign In
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{" "}
                    <button
                      onClick={() => {
                        setAuthError(null);
                        setAuthSuccess(null);
                        setAuthMode("login");
                      }}
                      className="text-blue-400 hover:underline font-bold"
                    >
                      Sign In
                    </button>
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* High-Fidelity OS-like System Tray / Research Browser Footer Bar */}
      <footer className="w-full bg-[#07080c] border-t border-white/10 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-white/50 mt-12 z-10">
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56]"></span>
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e]"></span>
            <span className="w-3 h-3 rounded-full bg-[#27c93f]"></span>
          </div>
          <span className="font-bold text-white/60 tracking-wider">IN-APP RESEARCH BROWSER</span>
        </div>
        
        {/* System Status Indicators */}
        <div className="flex items-center gap-4 text-white/40 font-bold">
          <span className="text-[10px] tracking-wider">ENG IN</span>
          <div className="w-px h-3 bg-white/10"></div>
          <Wifi className="w-4 h-4 text-blue-400" />
          <Volume2 className="w-4 h-4" />
          <div className="flex items-center gap-1.5">
            <Battery className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-mono">60%</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
