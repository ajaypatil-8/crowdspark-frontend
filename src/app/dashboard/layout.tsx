"use client";
import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ProfileProvider, useProfile } from "@/contexts/ProfileContext";
import { useTheme } from "@/contexts/ThemeContext";
import { authApi, isLoggedIn } from "@/lib/api";

const IcGrid = ({ s=16 }:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IcUser = ({ s=16 }:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcGear = ({ s=16 }:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
const IcHeart = ({ s=16 }:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>;
const IcBookmark = ({ s=16 }:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>;
const IcZap = ({ s=16 }:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IcRocket = ({ s=16 }:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/></svg>;
const IcLogout = ({ s=16 }:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IcSun = ({ s=15 }:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
const IcMoon = ({ s=15 }:{s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>;

function DashboardInner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useProfile();
  const { isDark, toggle } = useTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => { if (!loading && !isLoggedIn()) router.replace("/login"); }, [loading, router]);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 50); return () => clearTimeout(t); }, []);

  const handleLogout = async () => { await authApi.logout(); router.push("/login"); };

  const isCreator = user?.roles?.includes("CREATOR");
  const initials = user?.name?.split(" ").map((w:string) => w[0]).slice(0,2).join("").toUpperCase() ?? "?";

  const navItems = [
    { href: "/dashboard",                 label: "Overview",       icon: <IcGrid s={15}/> },
    { href: "/dashboard/profile",         label: "Profile",        icon: <IcUser s={15}/> },
    { href: "/dashboard/settings",        label: "Settings",       icon: <IcGear s={15}/> },
    { href: "/dashboard/backed",          label: "Backed",         icon: <IcHeart s={15}/> },
    { href: "/dashboard/saved",           label: "Saved",          icon: <IcBookmark s={15}/> },
    isCreator
      ? { href: "/dashboard/my-campaigns",  label: "My Campaigns",   icon: <IcZap s={15}/> }
      : { href: "/dashboard/become-creator",label: "Become Creator", icon: <IcRocket s={15}/> },
  ];

  const sidebarBg  = isDark ? "#0e0e0e" : "#ffffff";
  const sidebarBdr = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const pageBg     = isDark ? "#0a0a0a" : "#f6f6f5";
  const mutedColor = isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.38)";

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:pageBg }}>
      <aside style={{ width:228, borderRight:`1px solid ${sidebarBdr}`, display:"flex", flexDirection:"column", flexShrink:0, background:sidebarBg, position:"sticky", top:0, height:"100vh", overflowY:"auto", transform:visible?"translateX(0)":"translateX(-20px)", opacity:visible?1:0, transition:"transform 0.4s cubic-bezier(.22,.68,0,1.2), opacity 0.3s", boxShadow:isDark?"none":"2px 0 24px rgba(0,0,0,0.04)" }}>

        <div style={{ padding:"24px 18px 20px", borderBottom:`1px solid ${sidebarBdr}` }}>
          <Link href="/" style={{ textDecoration:"none" }}>
            <span style={{ fontFamily:"Syne, sans-serif", fontSize:18, fontWeight:800, background:"linear-gradient(135deg,#ff6b00,#ffcc00)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>CrowdSpark</span>
          </Link>
        </div>

        {user && (
          <div style={{ padding:"16px 18px 16px", borderBottom:`1px solid ${sidebarBdr}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:"50%", flexShrink:0, overflow:"hidden", border:"2px solid rgba(255,107,0,0.3)" }}>
                {user.profileImageUrl
                  ? <img src={user.profileImageUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                  : <div style={{ width:"100%", height:"100%", background:"linear-gradient(135deg,#ff6b00,#ffcc00)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:13 }}>{initials}</div>
                }
              </div>
              <div style={{ minWidth:0 }}>
                <p style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:13, color:"var(--text)", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.name}</p>
                <p style={{ fontSize:11, color:"var(--text-muted)", margin:"1px 0 0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>@{user.username}</p>
              </div>
            </div>
            {isCreator && (
              <div style={{ marginTop:9, display:"inline-flex", alignItems:"center", gap:5, padding:"3px 8px", borderRadius:6, background:"rgba(255,107,0,0.1)", border:"1px solid rgba(255,107,0,0.2)" }}>
                <div style={{ width:5, height:5, borderRadius:"50%", background:"#ff8800" }}/>
                <span style={{ fontSize:9.5, fontFamily:"DM Sans, sans-serif", fontWeight:700, color:"#ff8800", letterSpacing:"0.08em", textTransform:"uppercase" }}>Creator</span>
              </div>
            )}
          </div>
        )}

        <nav style={{ flex:1, padding:"12px 10px", overflowY:"auto" }}>
          {navItems.map((item) => {
            const exact = item.href === "/dashboard";
            const active = exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}
                style={{ display:"flex", alignItems:"center", gap:9, padding:"9px 10px", borderRadius:10, color:active?"#ff8800":mutedColor, textDecoration:"none", fontSize:13.5, fontWeight:active?600:500, transition:"all 0.15s", marginBottom:2, background:active?(isDark?"rgba(255,107,0,0.09)":"rgba(255,107,0,0.07)"):"transparent", borderLeft:`2px solid ${active?"#ff8800":"transparent"}` }}>
                <span style={{ opacity:active?1:0.7 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding:"10px 10px 14px", borderTop:`1px solid ${sidebarBdr}` }}>
          <button onClick={toggle}
            style={{ display:"flex", alignItems:"center", gap:9, width:"100%", padding:"9px 12px", borderRadius:10, background:"none", border:"none", color:mutedColor, cursor:"pointer", fontSize:13.5, fontFamily:"DM Sans, sans-serif", transition:"color 0.15s", marginBottom:2 }}>
            <span style={{ opacity:0.7 }}>{isDark ? <IcSun s={15}/> : <IcMoon s={15}/>}</span>
            {isDark ? "Light mode" : "Dark mode"}
          </button>
          <button onClick={handleLogout}
            style={{ display:"flex", alignItems:"center", gap:9, width:"100%", padding:"9px 12px", borderRadius:10, background:"none", border:"none", color:mutedColor, cursor:"pointer", fontSize:13.5, fontFamily:"DM Sans, sans-serif", transition:"color 0.15s" }}>
            <span style={{ opacity:0.7 }}><IcLogout s={15}/></span>
            Logout
          </button>
        </div>
      </aside>

      <main style={{ flex:1, overflow:"auto", minWidth:0 }}>{children}</main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProfileProvider>
      <DashboardInner>{children}</DashboardInner>
    </ProfileProvider>
  );
}