import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import 'gitalk/dist/gitalk.css';
import GitalkComponent from 'gitalk/dist/gitalk-component';
import { auth, googleProvider, twitterProvider, githubProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

// ==========================================
// 0. 全局配置 (CONFIG)
// ==========================================
// 打字机效果循环开关：true 为开启循环，false 为只打字一次
const ENABLE_TYPEWRITER_LOOP = true;

// ==========================================
// 1. 模拟数据与常量 (MOCK DATA & CONSTANTS)
// ==========================================
const POSTS = [
  {
    id: 1,
    title: "A Quiet Morning in Kyoto",
    excerpt: "Finding peace in the subtle details of traditional architecture and the gentle morning mist.",
    content: "The morning mist settled over the Kamo River as I walked towards the temple. The sound of gravel underfoot was the only break in the silence.\n\nIn Kyoto, minimalism isn't just an aesthetic choice; it's a way of life. The wooden structures, aged by centuries of rain and sun, stand as a testament to wabi-sabi—finding beauty in imperfection and transience.\n\nI spent hours just sitting on the engawa (veranda), watching the shadows shift across the moss garden. It's in these quiet moments that you realize how much noise we carry with us every day. The pixelated memories of this place will stay with me forever.",
    date: "2026-04-06",
    image: "https://picsum.photos/seed/kyoto/800/600",
    category: "Travel"
  },
  {
    id: 2,
    title: "The Art of Blank Space",
    excerpt: "How emptiness creates room for thought in both design and our daily lives. Less is truly more.",
    content: "We are terrified of empty space. We fill our rooms with furniture, our schedules with meetings, and our designs with elements. But what if we stopped?\n\nWhite space, or negative space, is the breathing room that allows the important things to stand out. In UI design, it guides the eye. In life, it guides the mind.\n\nBy intentionally leaving areas blank, we create a canvas for imagination. This pixel-art blog itself is an experiment in balancing hard edges with soft, empty spaces.",
    date: "2026-03-28",
    image: "https://picsum.photos/seed/minimalist/800/600",
    category: "Design"
  },
  {
    id: 3,
    title: "Brewing the Perfect Matcha",
    excerpt: "A meditative approach to the morning ritual, focusing on temperature, tools, and the whisking technique.",
    content: "It starts with the water. Not boiling, but just below—around 80°C (175°F). Too hot, and the matcha becomes bitter. Too cold, and it won't froth.\n\nThe chasen (bamboo whisk) is an extension of your arm. The motion isn't stirring; it's a rapid 'W' or 'M' shape, aerating the vibrant green powder until a thick, jade foam forms on top.\n\nDrinking it is the final step of the meditation. You don't just consume caffeine; you consume intention.",
    date: "2026-03-15",
    image: "https://picsum.photos/seed/matcha/800/600",
    category: "Lifestyle"
  },
  {
    id: 4,
    title: "Sustainable Wardrobe",
    excerpt: "Curating a collection of timeless linen and cotton pieces that age gracefully with wear and time.",
    content: "Fast fashion is a glitch in our societal matrix. We buy, we wear once, we discard. \n\nI've spent the last year reducing my wardrobe to 30 essential pieces. Heavyweight cotton tees, raw denim that fades to match my movements, and linen shirts that wrinkle with character.\n\nWhen you own less, you appreciate more. Each item becomes a trusted companion rather than a disposable commodity.",
    date: "2026-02-22",
    image: "https://picsum.photos/seed/linen/800/600",
    category: "Life"
  },
  {
    id: 5,
    title: "像素与现实的边界",
    excerpt: "在这个由方块构成的世界里，寻找真实的情感与记忆。中文字体的测试与展示。",
    content: "当我们凝视屏幕上的像素时，我们看到的不仅是发光的方块，更是想象力的延伸。\n\n这篇博客使用 Zpix 字体来展示中文。在复古的 RPG 游戏中，文字往往承载着最重要的剧情和情感。每一个像素点都经过精心雕琢，为了在有限的分辨率下传达最多的信息。\n\n在这个白色的海洋里，文字像粒子一样漂浮，它们是记忆的碎片，等待着被重新组合。你可以尝试用鼠标去吸引它们，感受那种奇妙的物理交互。",
    date: "2026-04-06",
    image: "https://picsum.photos/seed/pixel/800/600",
    category: "Thoughts"
  }
];

// ==========================================
// 2. 全局状态与特效 (CONTEXT & EFFECTS)
// ==========================================
interface User {
  uid: string;
  displayName: string;
  provider: string;
}

const AppContext = createContext<any>(null);

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [isMagneticMode, setIsMagneticMode] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [readPosts, setReadPosts] = useState<number[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Load state from localStorage
  useEffect(() => {
    const savedReads = localStorage.getItem('pixel_reads');
    if (savedReads) setReadPosts(JSON.parse(savedReads));
    
    // Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          displayName: currentUser.displayName || 'User',
          provider: currentUser.providerData[0]?.providerId || 'Unknown'
        });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('pixel_reads', JSON.stringify(readPosts));
  }, [readPosts]);

  const markPostAsRead = (postId: number) => {
    if (!readPosts.includes(postId)) {
      setReadPosts(prev => [...prev, postId]);
    }
  };

  const login = async (providerName: string) => {
    let provider;
    if (providerName === 'Google') provider = googleProvider;
    else if (providerName === 'X') provider = twitterProvider;
    else if (providerName === 'GitHub') provider = githubProvider;
    
    if (provider) {
      try {
        await signInWithPopup(auth, provider);
        setAuthModalOpen(false);
      } catch (error) {
        console.error("Login failed:", error);
        alert("Login failed. Please check console for details. (Make sure Firebase is configured in .env)");
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // 磁性文字效果核心逻辑 (优化版：针对单个文字)
  useEffect(() => {
    if (!isMagneticMode) {
      document.querySelectorAll('.magnetic').forEach((el: any) => {
        el.style.transform = 'translate(0px, 0px)';
      });
      return;
    }

    let animationFrameId: number;
    let mouseX = -1000;
    let mouseY = -1000;
    let cachedRects: { el: any, centerX: number, centerY: number }[] = [];
    let needsCacheUpdate = true;

    // 缓存所有单个文字的位置，避免在 mousemove 中频繁读取 DOM 导致卡顿
    const updateCache = () => {
      cachedRects = [];
      document.querySelectorAll('.magnetic').forEach((el: any) => {
        const rect = el.getBoundingClientRect();
        cachedRects.push({
          el,
          centerX: rect.left + rect.width / 2,
          centerY: rect.top + rect.height / 2
        });
      });
      needsCacheUpdate = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleScrollOrResize = () => {
      needsCacheUpdate = true;
    };

    const updateMagneticElements = () => {
      if (needsCacheUpdate) {
        updateCache();
      }

      const updates: { el: any, transform: string }[] = [];
      const radius = 80; // 吸引半径缩小，因为现在是针对单个文字

      cachedRects.forEach(({ el, centerX, centerY }) => {
        const distX = mouseX - centerX;
        const distY = mouseY - centerY;
        const distance = Math.sqrt(distX * distX + distY * distY);
        
        if (distance < radius) {
          // 计算拉力，距离越近拉力越大
          const pullX = (distX / distance) * (radius - distance) * 0.4;
          const pullY = (distY / distance) * (radius - distance) * 0.4;
          updates.push({ el, transform: `translate(${pullX}px, ${pullY}px)` });
        } else {
          // 只有当元素有偏移时才重置，减少不必要的 DOM 写入
          if (el.style.transform && el.style.transform !== 'translate(0px, 0px)') {
            updates.push({ el, transform: `translate(0px, 0px)` });
          }
        }
      });

      // 批量写入 DOM
      updates.forEach(({ el, transform }) => {
        el.style.transform = transform;
      });

      animationFrameId = requestAnimationFrame(updateMagneticElements);
    };

    // 监听 DOM 变化 (例如打字机效果新增了文字)，自动更新缓存
    const observer = new MutationObserver(() => {
      needsCacheUpdate = true;
    });
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    
    // 初始化
    setTimeout(updateCache, 100);
    animationFrameId = requestAnimationFrame(updateMagneticElements);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMagneticMode]);

  return (
    <AppContext.Provider value={{ 
      isMagneticMode, setIsMagneticMode,
      user, login, logout, authModalOpen, setAuthModalOpen,
      readPosts, markPostAsRead
    }}>
      {children}
    </AppContext.Provider>
  );
};

// ==========================================
// 3. 共享组件 (SHARED COMPONENTS)
// ==========================================

const AuthModal = () => {
  const { authModalOpen, setAuthModalOpen, login } = useContext(AppContext);

  if (!authModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-slate-800/80 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setAuthModalOpen(false)}>
      <div className="pixel-dialog w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold mb-6 uppercase"><MagneticText text="Select Login Provider" /></h3>
        <div className="flex flex-col gap-4">
          <button className="pixel-btn w-full hover:bg-slate-200" onClick={() => login('Google')}>
            <MagneticText text="Login with Google" />
          </button>
          <button className="pixel-btn w-full hover:bg-slate-200" onClick={() => login('X')}>
            <MagneticText text="Login with X" />
          </button>
          <button className="pixel-btn w-full hover:bg-slate-200" onClick={() => login('GitHub')}>
            <MagneticText text="Login with GitHub" />
          </button>
        </div>
        <button className="mt-6 text-xs text-slate-500 underline" onClick={() => setAuthModalOpen(false)}>Cancel</button>
      </div>
    </div>
  );
};

/**
 * 磁性文字组件 (MagneticText)
 * 将一整段文本拆分为单个字符，并为每个字符添加 .magnetic 类
 * 同时保留单词的换行特性，防止单词在中间被截断
 */
const MagneticText = ({ text, className = "" }: { text: string, className?: string }) => {
  return (
    <span className={className}>
      {text.split(/(\s+)/).map((word, wordIndex) => {
        if (word.match(/^\s+$/)) {
          // 保留空格和换行
          return <span key={wordIndex} style={{ whiteSpace: 'pre-wrap' }}>{word}</span>;
        }
        // 检查是否包含中日韩字符，如果有，则不使用 inline-block 和 whitespace-nowrap，允许其自然换行
        const isCJK = /[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/.test(word);
        return (
          <span key={wordIndex} className={isCJK ? "" : "inline-block whitespace-nowrap"}>
            {word.split('').map((char, charIndex) => (
              <span key={charIndex} className="magnetic inline-block">
                {char}
              </span>
            ))}
          </span>
        );
      })}
    </span>
  );
};

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [specialMenuOpen, setSpecialMenuOpen] = useState(false);
  
  const { isMagneticMode, setIsMagneticMode, user, setAuthModalOpen, logout } = useContext(AppContext);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      navigate(`/journal?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FAFAFA] border-b-4 border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between w-full max-w-5xl mx-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center hover:opacity-70 transition-opacity">
            <span className="text-xl font-bold tracking-widest text-slate-800 uppercase">
              <MagneticText text="> Akihiro_" />
            </span>
          </Link>

          {/* 桌面端菜单 */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/journal" className="pixel-btn text-sm">
              <MagneticText text="[ Journal ]" />
            </Link>
            <Link to="/gallery" className="pixel-btn text-sm">
              <MagneticText text="[ Gallery ]" />
            </Link>
            
            {/* 特殊功能下拉菜单 */}
            <div className="relative">
              <button 
                className="pixel-btn text-sm"
                onClick={() => setSpecialMenuOpen(!specialMenuOpen)}
              >
                <MagneticText text="[ Special ▼ ]" />
              </button>
              
              <AnimatePresence>
                {specialMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full right-0 mt-2 w-48 pixel-dialog p-2 z-50"
                  >
                    <div className="text-xs text-slate-500 font-bold mb-2 px-2 border-b-2 border-slate-200 pb-1">
                      <MagneticText text="-- EFFECTS --" />
                    </div>
                    <button 
                      className={`w-full text-left px-2 py-2 text-sm font-bold hover:bg-slate-100 ${isMagneticMode ? 'text-blue-600' : 'text-slate-800'}`}
                      onClick={() => {
                        setIsMagneticMode(!isMagneticMode);
                        setSpecialMenuOpen(false);
                      }}
                    >
                      <MagneticText text={isMagneticMode ? '☑ Magnetic Text' : '☐ Magnetic Text'} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 搜索按钮 */}
            <button 
              className="pixel-btn text-sm hover:bg-slate-200"
              onClick={() => setSearchOpen(true)}
            >
              <MagneticText text="SEARCH" />
            </button>

            {/* 登录/用户信息 */}
            {user ? (
              <button className="pixel-btn text-sm border-blue-600 text-blue-600 hover:bg-blue-50" onClick={logout}>
                <MagneticText text={`[ ${user.displayName} ]`} />
              </button>
            ) : (
              <button className="pixel-btn text-sm hover:bg-slate-200" onClick={() => setAuthModalOpen(true)}>
                <MagneticText text="LOGIN" />
              </button>
            )}
          </div>

          {/* 移动端菜单按钮 */}
          <button 
            className="md:hidden pixel-btn text-sm"
            onClick={() => setMobileMenuOpen(true)}
          >
            <MagneticText text="[ MENU ]" />
          </button>
        </div>
      </nav>

      {/* 搜索模态框 */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-slate-800/80 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setSearchOpen(false)}
          >
            <div 
              className="pixel-dialog w-full max-w-lg p-6"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4 uppercase"><MagneticText text="Search Inventory" /></h3>
              <form onSubmit={handleSearch} className="flex gap-2">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter keyword..." 
                  className="flex-grow border-4 border-slate-800 px-4 py-2 font-bold focus:outline-none focus:bg-slate-100"
                  autoFocus
                />
                <button type="submit" className="pixel-btn hover:bg-slate-200">
                  <MagneticText text="GO" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 移动端菜单遮罩层 */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[60] bg-[#FAFAFA] border-b-4 border-slate-800 flex flex-col p-6 h-fit pb-10"
          >
            <div className="flex justify-end">
              <button 
                className="pixel-btn text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                <MagneticText text="[ X ] CLOSE" />
              </button>
            </div>
            <div className="flex flex-col items-center justify-center gap-6 mt-10 text-xl">
              <Link to="/" className="pixel-btn w-full text-center" onClick={() => setMobileMenuOpen(false)}><MagneticText text="Home" /></Link>
              <Link to="/journal" className="pixel-btn w-full text-center" onClick={() => setMobileMenuOpen(false)}><MagneticText text="Journal" /></Link>
              <Link to="/gallery" className="pixel-btn w-full text-center" onClick={() => setMobileMenuOpen(false)}><MagneticText text="Gallery" /></Link>
              <button 
                className="pixel-btn w-full text-center hover:bg-slate-200"
                onClick={() => {
                  setSearchOpen(true);
                  setMobileMenuOpen(false);
                }}
              >
                <MagneticText text="Search" />
              </button>
              <button 
                className={`pixel-btn w-full text-center ${isMagneticMode ? 'border-blue-500 text-blue-600' : ''}`}
                onClick={() => {
                  setIsMagneticMode(!isMagneticMode);
                  setMobileMenuOpen(false);
                }}
              >
                <MagneticText text={`Toggle Magnetic: ${isMagneticMode ? 'ON' : 'OFF'}`} />
              </button>
              {user ? (
                <button className="pixel-btn w-full text-center border-blue-600 text-blue-600" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                  <MagneticText text={`Logout (${user.displayName})`} />
                </button>
              ) : (
                <button className="pixel-btn w-full text-center" onClick={() => { setAuthModalOpen(true); setMobileMenuOpen(false); }}>
                  <MagneticText text="Login" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Footer = () => {
  const { readPosts } = useContext(AppContext);
  
  return (
    <footer className="border-t-4 border-slate-800 bg-slate-200 mt-auto">
      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <span className="text-lg font-bold uppercase tracking-widest block mb-1">
            <MagneticText text="Akihiro_" />
          </span>
          <span className="text-xs text-slate-500">
            <MagneticText text={`LEVEL ${Math.floor(readPosts.length / 2) + 1} | EXP: ${readPosts.length * 100}`} />
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-sm font-bold">
          <a href="#" className="pixel-btn text-xs"><MagneticText text="TWITTER" /></a>
          <a href="#" className="pixel-btn text-xs"><MagneticText text="GITHUB" /></a>
        </div>
      </div>
    </footer>
  );
};

// ==========================================
// 4. 页面组件 (PAGES)
// ==========================================

const Home = () => {
  const fullText = "Hello, traveler. Welcome to my digital garden.\n\nI document life, design, and the quiet moments in between. Stay a while and listen.";
  const [displayedText, setDisplayedText] = useState("");
  
  // 打字机效果逻辑
  useEffect(() => {
    let i = 0;
    let isDeleting = false;
    let timeout: NodeJS.Timeout;

    const type = () => {
      if (!isDeleting) {
        // 正在打字
        const char = fullText.charAt(i);
        setDisplayedText(fullText.substring(0, i + 1));
        i++;
        if (i === fullText.length) {
          // 打字完成
          if (ENABLE_TYPEWRITER_LOOP) {
            isDeleting = true;
            timeout = setTimeout(type, 3000); // 停顿 3 秒后开始删除
          }
        } else {
          // 模拟人类打字的自然停顿 (非线性节奏)
          let delay = 30 + Math.random() * 50; // 基础随机速度 30-80ms
          if (char === '.' || char === '。' || char === '\n') {
            delay = 400 + Math.random() * 200; // 句号或换行停顿较长
          } else if (char === ',' || char === '，') {
            delay = 150 + Math.random() * 100; // 逗号停顿中等
          } else if (char === ' ') {
            delay = 60 + Math.random() * 40; // 空格稍微停顿
          }
          timeout = setTimeout(type, delay);
        }
      } else {
        // 正在删除
        setDisplayedText(fullText.substring(0, i - 1));
        i--;
        if (i === 0) {
          isDeleting = false;
          timeout = setTimeout(type, 500); // 删完后停顿 0.5 秒重新开始
        } else {
          timeout = setTimeout(type, 15 + Math.random() * 10); // 删除速度也加入微小随机
        }
      }
    };

    timeout = setTimeout(type, 500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="pt-32 pb-20">
      <section className="px-6 max-w-4xl mx-auto mb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="pixel-dialog p-6 md:p-10 text-left relative"
        >
          <div className="absolute -top-5 left-6 bg-slate-800 text-white px-4 py-1 border-2 border-slate-800 text-sm tracking-widest uppercase">
            Akihiro
          </div>
          
          <p className="text-lg md:text-2xl leading-relaxed text-slate-700 whitespace-pre-wrap min-h-[120px]">
            <MagneticText text={displayedText} />
            <motion.span 
              animate={{ opacity: [1, 0] }} 
              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
              className="inline-block w-4 h-6 bg-slate-800 align-middle ml-2 -mt-1"
            />
          </p>

          <div className="mt-8 flex justify-end gap-4">
            <Link to="/journal" className="pixel-btn text-sm"><MagneticText text="▶ Start Journey" /></Link>
          </div>
        </motion.div>
      </section>

      <section className="px-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-end mb-10 border-b-4 border-slate-800 pb-4">
          <h2 className="text-3xl font-bold uppercase tracking-widest">
            <span className="text-slate-400 mr-2"><MagneticText text="#" /></span>
            <MagneticText text="Recent Items" />
          </h2>
          <Link to="/journal" className="pixel-btn text-xs md:text-sm">
            <MagneticText text="View All >>" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {POSTS.slice(0, 2).map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="pixel-card flex flex-col p-4"
            >
              <div className="border-2 border-slate-800 mb-4 overflow-hidden bg-slate-200 aspect-video">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="pixel-tag">{post.category}</span>
                <span className="text-xs text-slate-500 font-bold">{post.date}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 leading-tight uppercase">
                <MagneticText text={post.title} />
              </h3>
              <p className="text-sm text-slate-600 line-clamp-3 mb-6 flex-grow">
                <MagneticText text={post.excerpt} />
              </p>
              <div className="mt-auto flex justify-end">
                <Link to={`/post/${post.id}`} className="pixel-btn text-xs hover:bg-slate-200">
                  <MagneticText text="READ >" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
};

const Journal = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const query = searchParams.get('search')?.toLowerCase() || "";

  const filteredPosts = POSTS.filter(post => 
    post.title.toLowerCase().includes(query) || 
    post.content.toLowerCase().includes(query) ||
    post.category.toLowerCase().includes(query)
  );

  return (
    <div className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
      <div className="mb-10 border-b-4 border-slate-800 pb-4">
        <h1 className="text-4xl font-bold uppercase tracking-widest">
          <span className="text-slate-400 mr-2"><MagneticText text="#" /></span>
          <MagneticText text="Inventory" />
        </h1>
        {query && (
          <p className="mt-2 text-slate-600 font-bold">
            Showing results for: "{query}"
          </p>
        )}
      </div>

      {filteredPosts.length === 0 ? (
        <div className="pixel-dialog p-10 text-center">
          <p className="text-xl font-bold text-slate-600"><MagneticText text="No items found matching your query." /></p>
          <Link to="/journal" className="pixel-btn mt-6 inline-block"><MagneticText text="Clear Search" /></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredPosts.map((post) => (
            <article key={post.id} className="pixel-card flex flex-col p-4">
              <div className="border-2 border-slate-800 mb-4 overflow-hidden bg-slate-200 aspect-video">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="pixel-tag">{post.category}</span>
                <span className="text-xs text-slate-500 font-bold">{post.date}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 leading-tight uppercase">
                <MagneticText text={post.title} />
              </h3>
              <p className="text-sm text-slate-600 line-clamp-3 mb-6 flex-grow">
                <MagneticText text={post.excerpt} />
              </p>
              <div className="mt-auto flex justify-end">
                <Link to={`/post/${post.id}`} className="pixel-btn text-xs hover:bg-slate-200">
                  <MagneticText text="READ >" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

const PostDetail = () => {
  const { id } = useParams();
  const post = POSTS.find(p => p.id === Number(id));
  const { markPostAsRead } = useContext(AppContext);

  useEffect(() => {
    if (post) {
      markPostAsRead(post.id);
    }
  }, [post, markPostAsRead]);

  if (!post) {
    return (
      <div className="pt-40 pb-20 px-6 text-center">
        <h1 className="text-4xl font-bold mb-6"><MagneticText text="404 - Item Not Found" /></h1>
        <Link to="/journal" className="pixel-btn"><MagneticText text="Return to Inventory" /></Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <Link to="/journal" className="pixel-btn text-xs hover:bg-slate-200">
          <MagneticText text="< BACK" />
        </Link>
        <span className="text-slate-400 text-sm font-bold tracking-widest uppercase hidden md:inline-block">
          <MagneticText text="[ Reading Mode ]" />
        </span>
      </div>
      
      <article className="pixel-dialog p-6 md:p-12 relative mb-12">
        <div className="flex items-center gap-2 mb-6">
          <span className="pixel-tag">{post.category}</span>
          <span className="text-sm text-slate-500 font-bold">{post.date}</span>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-bold text-slate-800 mb-8 uppercase leading-tight">
          <MagneticText text={post.title} />
        </h1>
        
        <div className="border-4 border-slate-800 mb-10 overflow-hidden bg-slate-200">
          <img src={post.image} alt={post.title} className="w-full h-auto" referrerPolicy="no-referrer" />
        </div>
        
        <div className="prose prose-slate max-w-none font-bold text-lg leading-relaxed whitespace-pre-wrap break-words">
          <MagneticText text={post.content} />
        </div>
      </article>

      {/* Gitalk 评论区 */}
      <div className="pixel-dialog p-6 md:p-12">
        <h3 className="text-2xl font-bold mb-6 uppercase border-b-4 border-slate-800 pb-2"><MagneticText text="Comments" /></h3>
        {import.meta.env.VITE_GITALK_CLIENT_ID ? (
          <GitalkComponent options={{
            clientID: import.meta.env.VITE_GITALK_CLIENT_ID,
            clientSecret: import.meta.env.VITE_GITALK_CLIENT_SECRET,
            repo: import.meta.env.VITE_GITALK_REPO,
            owner: import.meta.env.VITE_GITALK_OWNER,
            admin: [import.meta.env.VITE_GITALK_ADMIN || import.meta.env.VITE_GITALK_OWNER],
            id: `post_${post.id}`,
            title: post.title,
            distractionFreeMode: false
          }} />
        ) : (
          <div className="text-center py-10 border-4 border-dashed border-slate-300 bg-slate-50">
            <p className="text-slate-500 font-bold mb-2">Gitalk is not configured.</p>
            <p className="text-xs text-slate-400">Please set VITE_GITALK_CLIENT_ID and other variables in your .env file.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Gallery = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setDimensions({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (dimensions.width === 0) return null;

  return (
    <div className="pt-24 pb-0 px-0 w-full">
      <div className="relative w-full h-[80vh] overflow-hidden bg-[#FAFAFA] border-y-4 border-slate-800">
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5 select-none">
          <h1 className="text-[15vw] font-bold uppercase tracking-widest">Ocean</h1>
        </div>
        
        {/* 帖子粒子 */}
        {POSTS.map((post, i) => {
          // 随机初始位置 (限制在中心区域，避免一开始就超出边界)
          const left = 20 + Math.random() * 60; 
          const top = 20 + Math.random() * 60;
          
          // 随机漂浮范围
          const driftX = (Math.random() - 0.5) * 100;
          const driftY = (Math.random() - 0.5) * 100;

          return (
            <motion.div
              key={post.id}
              className="absolute z-10"
              style={{ left: `${left}%`, top: `${top}%` }}
              animate={{
                x: [0, driftX, 0],
                y: [0, driftY, 0],
              }}
              transition={{
                duration: 15 + Math.random() * 15,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Link to={`/post/${post.id}`} className="block group p-2">
                <div className="text-sm md:text-base font-bold text-slate-400 group-hover:text-slate-800 transition-colors whitespace-nowrap drop-shadow-sm">
                  <MagneticText text={`[ ${post.title} ]`} />
                </div>
              </Link>
            </motion.div>
          );
        })}
        
        {/* 装饰性小粒子 */}
        {Array.from({ length: 30 }).map((_, i) => {
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          const chars = ['+', '-', '*', '.', 'o', 'x', '✧', '✦'];
          const char = chars[Math.floor(Math.random() * chars.length)];
          
          return (
            <motion.div
              key={`particle-${i}`}
              className="absolute text-slate-300 text-xs pointer-events-none"
              style={{ left: `${left}%`, top: `${top}%` }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.1, 0.6, 0.1]
              }}
              transition={{
                duration: 4 + Math.random() * 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 5
              }}
            >
              <MagneticText text={char} />
            </motion.div>
          )
        })}
      </div>
    </div>
  );
};

// ==========================================
// 5. 根组件 (ROOT)
// ==========================================
export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <AuthModal />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/post/:id" element={<PostDetail />} />
              <Route path="/gallery" element={<Gallery />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
