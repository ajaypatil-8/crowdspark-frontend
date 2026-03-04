"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCursor } from "@/hooks/usecursor";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

gsap.registerPlugin(ScrollTrigger);

/* ══════════════════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════════════════ */
const STATS = [
  { num: "12,400+",   label: "Projects funded" },
  { num: "₹98M",      label: "Raised total"    },
  { num: "3,40,000+", label: "Active backers"  },
  { num: "94%",       label: "Success rate"    },
];

const FEATURES = [
  { icon: "⚡", title: "Lightning fast setup",  desc: "Launch your campaign in under 5 minutes. No paperwork, no gatekeepers."       },
  { icon: "🔒", title: "Secure & transparent",  desc: "Funds held in escrow, released on milestones. Full audit trail for every ₹."  },
  { icon: "🌍", title: "Built for India",         desc: "UPI, NetBanking, wallet support. GST-compliant invoicing out of the box."    },
  { icon: "📊", title: "Real-time analytics",    desc: "Live dashboards tracking backers, conversions, and traffic in one place."     },
  { icon: "🤝", title: "Community first",         desc: "A network of verified backers who actively discover campaigns daily."        },
  { icon: "🎯", title: "Smart matching",          desc: "AI surfaces your project to people who genuinely care about your category."  },
];

const PROJECTS = [
  { title: "AgroSense IoT",     cat: "AgriTech",       raised: "₹18.4L", pct: 92, days: 4,  backers: 1240, clr: "#00f5d4" },
  { title: "Svara Music App",   cat: "Music & Art",    raised: "₹9.2L",  pct: 92, days: 11, backers: 873,  clr: "#a78bfa" },
  { title: "CleanSip Purifier", cat: "CleanTech",      raised: "₹24.8L", pct: 99, days: 2,  backers: 3102, clr: "#34d399" },
  { title: "Rethread Fashion",  cat: "Sustainability", raised: "₹6.1L",  pct: 51, days: 19, backers: 540,  clr: "#f59e0b" },
];

/* ══════════════════════════════════════════════════════════════
   PHOENIX CANVAS — sits in right half of hero
══════════════════════════════════════════════════════════════ */
function PhoenixCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    /* ── wait one frame so the DOM has laid out and el has real dimensions ── */
    let rafSetup: number;
    let cleanup: (() => void) | undefined;

    rafSetup = requestAnimationFrame(() => {
      const W = el.clientWidth  || window.innerWidth  * 0.5;
      const H = el.clientHeight || window.innerHeight;

      /* ── renderer ── */
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace    = THREE.SRGBColorSpace;
      renderer.toneMapping         = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.4;
      el.appendChild(renderer.domElement);

      /* ── scene & camera ── */
      const scene  = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, W / H, 0.01, 1000);
      camera.position.set(0, 0, 6);
      camera.lookAt(0, 0, 0);

      /* ── lights ── */
      scene.add(new THREE.AmbientLight(0xffffff, 5.0));

      const key = new THREE.DirectionalLight(0xffffff, 6.0);
      key.position.set(2, 4, 5);
      scene.add(key);

      const fill = new THREE.DirectionalLight(0x88eeff, 3.0);
      fill.position.set(-4, 1, 3);
      scene.add(fill);

      const back = new THREE.DirectionalLight(0xffffff, 2.0);
      back.position.set(0, 2, -5);
      scene.add(back);

      const teal   = new THREE.PointLight(0x00f5d4, 10, 30);
      teal.position.set(-2, 2, 4);
      scene.add(teal);

      const purple = new THREE.PointLight(0x7b2fff, 7, 25);
      purple.position.set(3, -1, -2);
      scene.add(purple);

      const ember  = new THREE.PointLight(0xff6020, 5, 15);
      ember.position.set(0, -4, 2);
      scene.add(ember);

      /* ── particles ── */
      const PC  = 220;
      const pos = new Float32Array(PC * 3);
      for (let i = 0; i < PC; i++) {
        pos[i*3]   = (Math.random()-0.5)*14;
        pos[i*3+1] = (Math.random()-0.5)*14;
        pos[i*3+2] = (Math.random()-0.5)*8;
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
        color:0x00f5d4, size:0.06, transparent:true, opacity:0.55,
        sizeAttenuation:true, blending:THREE.AdditiveBlending, depthWrite:false,
      }));
      scene.add(particles);

      /* ── orbit rings ── */
      const makeRing = (r:number,tube:number,col:number,op:number) => {
        const m = new THREE.Mesh(
          new THREE.TorusGeometry(r,tube,16,128),
          new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op,
            blending:THREE.AdditiveBlending,depthWrite:false})
        );
        scene.add(m); return m;
      };
      const ring1 = makeRing(2.0, 0.014, 0x00f5d4, 0.55);
      const ring2 = makeRing(2.8, 0.009, 0x7b2fff, 0.40);
      const ring3 = makeRing(3.5, 0.006, 0x00f5d4, 0.22);
      ring1.rotation.x = Math.PI/2;
      ring2.rotation.x = Math.PI/2.3; ring2.rotation.z = 0.4;
      ring3.rotation.x = Math.PI/1.8; ring3.rotation.z = -0.3;

      /* ── spinning placeholder while GLB loads ── */
      const placeholder = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.2, 2),
        new THREE.MeshStandardMaterial({
          color:0x00f5d4, emissive:new THREE.Color(0x00f5d4),
          emissiveIntensity:0.9, wireframe:true, side:THREE.DoubleSide,
        })
      );
      scene.add(placeholder);

      /* ── load GLB ── */
      let model: THREE.Object3D | null = null;
      let modelBaseScale = 1;

      console.log("[Phoenix] Loading /phoenix.glb …");
      const loader = new GLTFLoader();
      loader.load("/phoenix.glb",
        (gltf) => {
          scene.remove(placeholder);
          model = gltf.scene;

          /*
           * MODEL IS A SKINNED MESH ~911×316×963 local units (exported in cm).
           * We compute bounds from raw geometry (not bones) then scale to fit.
           */
          let mnX= 1e9,mnY= 1e9,mnZ= 1e9;
          let mxX=-1e9,mxY=-1e9,mxZ=-1e9;

          model.updateMatrixWorld(true);
          model.traverse((child) => {
            const mesh = child as THREE.Mesh;
            if (!(mesh as THREE.Mesh).isMesh) return;
            mesh.geometry.computeBoundingBox();
            const box = mesh.geometry.boundingBox!.clone().applyMatrix4(mesh.matrixWorld);
            mnX=Math.min(mnX,box.min.x); mnY=Math.min(mnY,box.min.y); mnZ=Math.min(mnZ,box.min.z);
            mxX=Math.max(mxX,box.max.x); mxY=Math.max(mxY,box.max.y); mxZ=Math.max(mxZ,box.max.z);
          });

          const sX=mxX-mnX, sY=mxY-mnY, sZ=mxZ-mnZ;
          const maxDim = Math.max(sX, sY, sZ);
          /* scale model so its largest dimension = 3.5 scene units */
          modelBaseScale = maxDim > 0 ? 3.5 / maxDim : 1;

          const cx=(mnX+mxX)/2, cy=(mnY+mxY)/2, cz=(mnZ+mxZ)/2;
          model.scale.setScalar(modelBaseScale);
          model.position.set(-cx*modelBaseScale, -cy*modelBaseScale, -cz*modelBaseScale);

          console.log(`[Phoenix] bounds=${sX.toFixed(0)}×${sY.toFixed(0)}×${sZ.toFixed(0)} → scale=${modelBaseScale.toFixed(5)} → renders as ${(maxDim*modelBaseScale).toFixed(2)} units`);

          /* Fix materials: both are alphaMode=BLEND (transparent feathers).
           * Force visible: transparent=false, DoubleSide, add emissive glow. */
          model.traverse((child) => {
            const mesh = child as THREE.Mesh;
            if (!mesh.isMesh) return;
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach((mat) => {
              const m = mat as THREE.MeshStandardMaterial;
              m.transparent   = false;
              m.opacity       = 1;
              m.alphaTest     = 0;
              m.side          = THREE.DoubleSide;
              m.depthWrite    = true;
              if (m.emissive)        { m.emissive.set(0x00b89c); m.emissiveIntensity = 0.2; }
              if ("roughness" in m)    m.roughness  = 0.45;
              if ("metalness" in m)    m.metalness  = 0.25;
              m.needsUpdate   = true;
            });
          });

          scene.add(model);
          console.log("[Phoenix] Model added. Anims:", gltf.animations.length);
        },
        (prog) => console.log(`[Phoenix] Loading ${Math.round(prog.loaded/prog.total*100)}%`),
        (err)  => console.error("[Phoenix] Error:", err)
      );

      /* ── input ── */
      let mx=0, my=0, scrollY=0;
      const onMouse  = (e:MouseEvent) => {
        mx = (e.clientX/window.innerWidth -0.5)*2;
        my = (e.clientY/window.innerHeight-0.5)*2;
      };
      const onScroll = () => { scrollY = window.scrollY; };
      const onResize = () => {
        const w=el.clientWidth, h=el.clientHeight;
        if (!w||!h) return;
        camera.aspect=w/h; camera.updateProjectionMatrix();
        renderer.setSize(w,h);
      };
      window.addEventListener("mousemove", onMouse,  {passive:true});
      window.addEventListener("scroll",    onScroll, {passive:true});
      window.addEventListener("resize",    onResize);

      /* ── render loop ── */
      let rafId=0, prevT=performance.now(), elapsed=0;
      let tgtRX=0, tgtRY=0;

      const tick = () => {
        rafId = requestAnimationFrame(tick);
        const now=performance.now(), dt=Math.min((now-prevT)/1000,0.05);
        prevT=now; elapsed+=dt;
        const t=elapsed;

        /* placeholder spin */
        placeholder.rotation.y += 0.018;
        placeholder.rotation.x += 0.007;

        /* mouse rotation */
        tgtRY = mx * 0.5;
        tgtRX = my * 0.22;

        if (model) {
          model.rotation.y += (tgtRY - model.rotation.y) * 0.06;
          model.rotation.x += (tgtRX - model.rotation.x) * 0.06;
          /* float */
          model.position.y += (Math.sin(t*0.8)*0.15 - model.position.y) * 0.04;
          /* scroll fade */
          const sp = Math.min(scrollY/(window.innerHeight*0.8), 1);
          model.scale.setScalar(modelBaseScale * (1-sp*0.6));
          renderer.domElement.style.opacity = String(Math.max(0, 1-sp*1.5));
        }

        /* pulse lights */
        teal.intensity   = 9   + Math.sin(t*1.6)*4;
        purple.intensity = 6   + Math.cos(t*1.1)*2.5;
        ember.intensity  = 4.5 + Math.sin(t*2.0)*2;

        /* spin rings */
        ring1.rotation.z+=0.005; ring2.rotation.z-=0.003;
        ring3.rotation.z+=0.002; ring1.rotation.y+=0.002;

        /* drift particles */
        particles.rotation.y+=0.0008;
        particles.rotation.x = Math.sin(t*0.2)*0.07;

        renderer.render(scene, camera);
      };
      tick();

      cleanup = () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener("mousemove", onMouse);
        window.removeEventListener("scroll",    onScroll);
        window.removeEventListener("resize",    onResize);
        renderer.dispose();
        if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      };
    });

    return () => {
      cancelAnimationFrame(rafSetup);
      cleanup?.();
    };
  }, []);

  return (
    <div ref={mountRef} style={{ position:"absolute", inset:0 }} />
  );
}




/* ══════════════════════════════════════════════════════════════
   HOME PAGE
══════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const { cursorRef, followerRef } = useCursor();

  const badgeRef  = useRef<HTMLDivElement>(null);
  const h1Ref     = useRef<HTMLHeadingElement>(null);
  const subRef    = useRef<HTMLParagraphElement>(null);
  const ctaRef    = useRef<HTMLDivElement>(null);
  const hintRef   = useRef<HTMLDivElement>(null);
  const statsRef  = useRef<HTMLDivElement>(null);
  const featRef   = useRef<HTMLDivElement>(null);
  const projRef   = useRef<HTMLDivElement>(null);
  const ctaBanRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      gsap.fromTo(
        [badgeRef.current, h1Ref.current, subRef.current, ctaRef.current],
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.12, ease: "power3.out", delay: 0.4 }
      );

      gsap.fromTo(hintRef.current,
        { opacity: 0, y: 8 },
        { opacity: 0.5, y: 0, duration: 0.9, delay: 2.2, ease: "power2.out",
          yoyo: true, repeat: -1, repeatDelay: 0.8 }
      );

      gsap.fromTo(
        statsRef.current?.querySelectorAll(".stat-item") ?? [],
        { y: 36, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, stagger: 0.1, ease: "power2.out",
          scrollTrigger: { trigger: statsRef.current, start: "top 82%" } }
      );

      gsap.fromTo(
        featRef.current?.querySelectorAll(".feat-card") ?? [],
        { y: 55, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 0.65, stagger: 0.08, ease: "back.out(1.3)",
          scrollTrigger: { trigger: featRef.current, start: "top 76%" } }
      );

      gsap.fromTo(
        projRef.current?.querySelectorAll(".proj-card") ?? [],
        { y: 55, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, stagger: 0.1, ease: "power2.out",
          scrollTrigger: { trigger: projRef.current, start: "top 78%" } }
      );

      projRef.current?.querySelectorAll<HTMLElement>(".prog-fill").forEach(bar => {
        ScrollTrigger.create({
          trigger: bar, start: "top 88%", once: true,
          onEnter: () => gsap.to(bar, { width: `${bar.dataset.pct}%`, duration: 1.4, ease: "power2.out" }),
        });
      });

      gsap.fromTo(ctaBanRef.current,
        { scale: 0.92, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.5)",
          scrollTrigger: { trigger: ctaBanRef.current, start: "top 84%" } }
      );

      gsap.utils.toArray<HTMLElement>(".sec-head").forEach(el =>
        gsap.fromTo(el,
          { x: -28, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.65, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 87%" } }
        )
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", overflowX: "hidden" }}>
      <div ref={cursorRef}   className="cursor" />
      <div ref={followerRef} className="cursor-follower" />
      <div className="dot-grid" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* ════ HERO — TWO COLUMN LAYOUT ══════════════════════════════════════ */}
      <section style={{
        position:       "relative",
        minHeight:      "100vh",
        display:        "flex",
        alignItems:     "stretch",  /* both cols fill full height */
        overflow:       "hidden",
      }}>

        {/* ── LEFT: text ────────────────────────────────────────── */}
        <div style={{
          flex:            "0 0 50%",
          display:         "flex",
          alignItems:      "center",
          padding:         "120px 0 80px 48px",
          position:        "relative",
          zIndex:          2,
        }}>
          <div style={{ maxWidth: 540 }}>

            {/* badge */}
            <div ref={badgeRef} style={{
              display:      "inline-flex",
              alignItems:   "center",
              gap:          8,
              padding:      "6px 16px",
              borderRadius: 999,
              border:       "1px solid var(--card-border)",
              background:   "var(--accent-dim)",
              marginBottom: 28,
              opacity:      0,
            }}>
              <span style={{ fontSize: 10, fontFamily: "Syne, sans-serif", fontWeight: 700, color: "var(--accent)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                Live now
              </span>
              <span style={{ width: 1, height: 12, background: "var(--card-border)" }} />
              <span style={{ fontSize: 13, color: "var(--text-sub)", fontFamily: "DM Sans, sans-serif" }}>
                12,400+ campaigns funded
              </span>
            </div>

            {/* h1 */}
            <h1 ref={h1Ref} style={{
              fontFamily:    "Syne, sans-serif",
              fontWeight:    800,
              fontSize:      "clamp(40px, 4.5vw, 72px)",
              lineHeight:    1.06,
              letterSpacing: "-0.03em",
              color:         "var(--text)",
              marginBottom:  24,
              opacity:       0,
            }}>
              Where{" "}
              <span className="hero-gradient">bold ideas</span>
              <br />
              find their{" "}
              <span style={{ color: "var(--accent)", textShadow: "0 0 40px rgba(0,245,212,0.4)" }}>
                spark.
              </span>
            </h1>

            {/* subtitle */}
            <p ref={subRef} style={{
              fontSize:     "clamp(15px, 1.6vw, 18px)",
              color:        "var(--text-muted)",
              fontFamily:   "DM Sans, sans-serif",
              lineHeight:   1.75,
              maxWidth:     420,
              marginBottom: 40,
              opacity:      0,
            }}>
              India's most trusted crowdfunding platform — built for creators, innovators, and everyone who believes in them.
            </p>

            {/* CTAs */}
            <div ref={ctaRef} style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 56, opacity: 0 }}>
              <Link href="/register" style={{
                display:        "flex",
                alignItems:     "center",
                gap:            8,
                padding:        "14px 30px",
                borderRadius:   12,
                background:     "linear-gradient(135deg, var(--accent), var(--accent-h))",
                color:          "var(--icon-clr)",
                fontFamily:     "Syne, sans-serif",
                fontWeight:     700,
                fontSize:       15,
                textDecoration: "none",
                boxShadow:      "0 4px 24px var(--accent-glow)",
                transition:     "transform 0.18s, box-shadow 0.18s",
              }}
                onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.transform = "translateY(-2px)"; a.style.boxShadow = "0 8px 32px var(--accent-glow)"; }}
                onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.transform = "translateY(0)";    a.style.boxShadow = "0 4px 24px var(--accent-glow)"; }}
              >
                Start your campaign
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>

              <Link href="/explore" style={{
                display:        "flex",
                alignItems:     "center",
                gap:            8,
                padding:        "14px 26px",
                borderRadius:   12,
                background:     "var(--bg-ghost)",
                border:         "1px solid var(--border)",
                color:          "var(--text)",
                fontFamily:     "DM Sans, sans-serif",
                fontWeight:     600,
                fontSize:       15,
                textDecoration: "none",
                transition:     "border-color 0.18s, color 0.18s",
              }}
                onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.borderColor = "var(--accent)"; a.style.color = "var(--accent)"; }}
                onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.borderColor = "var(--border)"; a.style.color = "var(--text)"; }}
              >
                Explore projects
              </Link>
            </div>

            {/* social proof */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex" }}>
                {["#00c9a7","#a78bfa","#f59e0b","#34d399","#f87171"].map((c, i) => (
                  <div key={i} style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: c,
                    border: "2px solid var(--bg)",
                    marginLeft: i > 0 ? -10 : 0,
                    zIndex: 5 - i,
                    position: "relative",
                  }} />
                ))}
              </div>
              <p style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif" }}>
                <strong style={{ color: "var(--text)" }}>3,40,000+</strong> backers already here
              </p>
            </div>
          </div>
        </div>

        {/* ── RIGHT: 3D canvas ──────────────────────────────────── */}
        <div style={{
          flex:     "0 0 50%",
          position: "relative",
          zIndex:   2,
          height:   "100vh",      /* explicit height so position:absolute child fills it */
          minHeight:"100vh",
          alignSelf:"stretch",
        }}>
          {/* subtle radial bg behind the model so it's always visible */}
          <div style={{
            position:   "absolute",
            inset:      0,
            background: "radial-gradient(ellipse 70% 60% at 55% 50%, rgba(0,200,160,0.08) 0%, transparent 75%)",
            pointerEvents: "none",
            zIndex:     0,
          }} />

          <PhoenixCanvas />

          {/* left edge fade into text column */}
          <div style={{
            position:      "absolute",
            top: 0, bottom: 0, left: 0,
            width:         100,
            background:    "linear-gradient(to right, var(--bg), transparent)",
            pointerEvents: "none",
            zIndex:        3,
          }} />
        </div>

        {/* ── bottom fade into stats section ── */}
        <div style={{
          position:      "absolute",
          bottom:        0, left: 0, right: 0,
          height:        160,
          background:    "linear-gradient(to top, var(--bg) 0%, transparent 100%)",
          zIndex:        4,
          pointerEvents: "none",
        }} />

        {/* scroll hint */}
        <div ref={hintRef} style={{
          position:      "absolute",
          bottom:        32,
          left:          "50%",
          transform:     "translateX(-50%)",
          zIndex:        5,
          display:       "flex",
          flexDirection: "column",
          alignItems:    "center",
          gap:           6,
          opacity:       0,
          pointerEvents: "none",
        }}>
          <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", letterSpacing: "0.18em", textTransform: "uppercase" }}>
            Scroll
          </span>
          <svg width="18" height="26" viewBox="0 0 18 26" fill="none">
            <rect x="1" y="1" width="16" height="24" rx="8" stroke="var(--border)" strokeWidth="1.5" />
            <rect x="7.5" y="5" width="3" height="6" rx="1.5" fill="var(--accent)" />
          </svg>
        </div>
      </section>

      {/* ════ STATS ═════════════════════════════════════════════════════════ */}
      <section ref={statsRef} style={{
        padding:      "72px 48px",
        borderTop:    "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        background:   "var(--card-bg)",
        position:     "relative", zIndex: 1,
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24 }}>
          {STATS.map(s => (
            <div key={s.label} className="stat-item" style={{ textAlign: "center", opacity: 0 }}>
              <div className="stat-num">{s.num}</div>
              <p style={{ fontSize: 14, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", marginTop: 6 }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ════ FEATURES ══════════════════════════════════════════════════════ */}
      <section ref={featRef} style={{ padding: "96px 48px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="sec-head" style={{ marginBottom: 52 }}>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: "0.26em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 12 }}>
              Why CrowdSpark
            </p>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(32px,4vw,48px)", color: "var(--text)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              Everything you need<br />to launch and grow
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
            {FEATURES.map(f => (
              <div key={f.title} className="feat-card" style={{
                padding: 28, borderRadius: 18, background: "var(--card-bg)",
                border: "1px solid var(--card-border)",
                transition: "transform 0.22s, border-color 0.22s, box-shadow 0.22s",
                cursor: "default", opacity: 0,
              }}
                onMouseEnter={e => { const d = e.currentTarget as HTMLDivElement; d.style.transform = "translateY(-4px)"; d.style.borderColor = "var(--accent)"; d.style.boxShadow = "0 12px 36px rgba(0,0,0,0.2)"; }}
                onMouseLeave={e => { const d = e.currentTarget as HTMLDivElement; d.style.transform = "translateY(0)"; d.style.borderColor = "var(--card-border)"; d.style.boxShadow = "none"; }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--accent-dim)", border: "1px solid var(--card-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 18 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 17, color: "var(--text)", marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ PROJECTS ══════════════════════════════════════════════════════ */}
      <section ref={projRef} style={{ padding: "80px 48px", background: "var(--card-bg)", borderTop: "1px solid var(--border)", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 44, flexWrap: "wrap", gap: 16 }}>
            <div className="sec-head">
              <p style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: "0.26em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 12 }}>
                Trending now
              </p>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(28px,3.5vw,42px)", color: "var(--text)", letterSpacing: "-0.02em" }}>
                Campaigns to back today
              </h2>
            </div>
            <Link href="/explore" style={{ display: "flex", alignItems: "center", gap: 6, padding: "11px 22px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-ghost)", color: "var(--text)", fontFamily: "DM Sans, sans-serif", fontSize: 14, fontWeight: 600, textDecoration: "none", transition: "border-color 0.15s, color 0.15s" }}
              onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.borderColor = "var(--accent)"; a.style.color = "var(--accent)"; }}
              onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.borderColor = "var(--border)"; a.style.color = "var(--text)"; }}
            >
              View all
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
            {PROJECTS.map(p => (
              <div key={p.title} className="proj-card" style={{ borderRadius: 18, overflow: "hidden", background: "var(--bg)", border: "1px solid var(--card-border)", cursor: "pointer", transition: "transform 0.22s, box-shadow 0.22s", opacity: 0 }}
                onMouseEnter={e => { const d = e.currentTarget as HTMLDivElement; d.style.transform = "translateY(-5px)"; d.style.boxShadow = "0 16px 40px rgba(0,0,0,0.2)"; }}
                onMouseLeave={e => { const d = e.currentTarget as HTMLDivElement; d.style.transform = "translateY(0)"; d.style.boxShadow = "none"; }}
              >
                <div style={{ height: 148, background: `linear-gradient(135deg,${p.clr}20,${p.clr}06)`, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, color: p.clr, opacity: 0.4, textAlign: "center", padding: "0 12px" }}>{p.title}</span>
                  <div style={{ position: "absolute", top: 10, left: 10, padding: "4px 10px", borderRadius: 999, background: `${p.clr}22`, border: `1px solid ${p.clr}44`, fontSize: 11, color: p.clr, fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{p.cat}</div>
                </div>
                <div style={{ padding: "18px 18px 20px" }}>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 12 }}>{p.title}</h3>
                  <div style={{ height: 5, borderRadius: 3, background: "var(--border)", marginBottom: 8, overflow: "hidden" }}>
                    <div className="prog-fill" data-pct={p.pct} style={{ height: "100%", borderRadius: 3, background: `linear-gradient(90deg,${p.clr},${p.clr}99)`, width: "0%" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{p.raised}</span>
                    <span style={{ fontSize: 12, fontFamily: "DM Sans, sans-serif", fontWeight: 600, color: p.clr }}>{p.pct}%</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif" }}>{p.backers.toLocaleString("en-IN")} backers</span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif" }}>{p.days}d left</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ CTA ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "80px 48px 120px", position: "relative", zIndex: 1 }}>
        <div ref={ctaBanRef} style={{ maxWidth: 820, margin: "0 auto", opacity: 0 }}>
          <div className="glow-pulse" style={{ borderRadius: 28, padding: "80px 56px", textAlign: "center", background: "var(--card-bg)", border: "1px solid var(--card-border)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,var(--orb1) 0%,transparent 70%)", pointerEvents: "none" }} />
            <p style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: "0.26em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 18, position: "relative" }}>
              Ready to launch?
            </p>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(30px,4vw,54px)", color: "var(--text)", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 18, position: "relative" }}>
              Your idea deserves<br />
              <span style={{ color: "var(--accent)", textShadow: "0 0 40px rgba(0,200,160,0.4)" }}>a real shot.</span>
            </h2>
            <p style={{ fontSize: 16, color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", lineHeight: 1.7, maxWidth: 460, margin: "0 auto 40px", position: "relative" }}>
              Join 12,000+ creators who have already made their vision a reality on CrowdSpark.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", position: "relative" }}>
              <Link href="/register" style={{ display: "flex", alignItems: "center", gap: 8, padding: "15px 36px", borderRadius: 12, background: "linear-gradient(135deg,var(--accent),var(--accent-h))", color: "var(--icon-clr)", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, textDecoration: "none", boxShadow: "0 4px 24px var(--accent-glow)", transition: "transform 0.18s, box-shadow 0.18s" }}
                onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.transform = "translateY(-2px)"; a.style.boxShadow = "0 8px 32px var(--accent-glow)"; }}
                onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.transform = "translateY(0)"; a.style.boxShadow = "0 4px 24px var(--accent-glow)"; }}
              >
                Create free account
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
              <Link href="/explore" style={{ display: "flex", alignItems: "center", gap: 8, padding: "15px 28px", borderRadius: 12, background: "var(--bg-ghost)", border: "1px solid var(--border)", color: "var(--text)", fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 15, textDecoration: "none", transition: "border-color 0.18s, color 0.18s" }}
                onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.borderColor = "var(--accent)"; a.style.color = "var(--accent)"; }}
                onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.borderColor = "var(--border)"; a.style.color = "var(--text)"; }}
              >
                Browse campaigns
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* responsive: stack on mobile */}
      <style>{`
        @media (max-width: 768px) {
          section:first-of-type { flex-direction: column !important; }
          section:first-of-type > div:first-child {
            flex: none !important;
            padding: 100px 24px 40px !important;
          }
          section:first-of-type > div:last-child {
            flex: none !important;
            min-height: 50vh !important;
          }
        }
      `}</style>
    </div>
  );
}