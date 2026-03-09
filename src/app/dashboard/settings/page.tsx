"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useProfile } from "../layout";
import { authApi, creatorApi, type KycStatusResponse, type KycSubmitRequest, type KycStatus } from "@/lib/api";

/* ── toast ── */
function Toast({ msg, type, onClose }: { msg:string; type:"success"|"error"|"info"; onClose:()=>void }) {
  const c = { success:{bg:"rgba(52,211,153,0.12)",border:"rgba(52,211,153,0.3)",text:"#34d399"}, error:{bg:"rgba(239,68,68,0.12)",border:"rgba(239,68,68,0.3)",text:"#ef4444"}, info:{bg:"rgba(0,245,212,0.1)",border:"rgba(0,245,212,0.25)",text:"#00f5d4"} }[type];
  return (
    <div style={{ position:"fixed",bottom:28,right:28,zIndex:9999,padding:"12px 18px",borderRadius:14,backdropFilter:"blur(20px)",background:c.bg,border:`1px solid ${c.border}`,color:c.text,fontFamily:"DM Sans, sans-serif",fontWeight:500,fontSize:13.5,display:"flex",alignItems:"center",gap:10,maxWidth:360,boxShadow:`0 8px 32px ${c.border}`,animation:"slideUp 0.28s cubic-bezier(0.16,1,0.3,1)" }}>
      <span style={{ width:20,height:20,borderRadius:"50%",border:`1.5px solid ${c.text}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,flexShrink:0 }}>{{success:"✓",error:"✕",info:"ℹ"}[type]}</span>
      <span style={{ flex:1 }}>{msg}</span>
      <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:c.text,padding:0,fontSize:18,opacity:0.6,lineHeight:1 }}>×</button>
    </div>
  );
}

/* ── section ── */
function Section({ title, icon, subtitle, children }: { title:string; icon:string; subtitle?:string; children:React.ReactNode }) {
  const { isDark } = useTheme();
  return (
    <div style={{ borderRadius:20,overflow:"hidden",marginBottom:16,background:isDark?"linear-gradient(145deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))":"linear-gradient(145deg,rgba(255,255,255,0.95),rgba(255,255,255,0.8))",border:isDark?"1px solid rgba(255,255,255,0.07)":"1px solid rgba(0,0,0,0.06)",boxShadow:isDark?"inset 0 1px 0 rgba(255,255,255,0.05)":"0 2px 16px rgba(0,0,0,0.04)" }}>
      <div style={{ padding:"14px 20px",borderBottom:isDark?"1px solid rgba(255,255,255,0.05)":"1px solid rgba(0,0,0,0.04)",display:"flex",alignItems:"center",gap:10,background:isDark?"rgba(255,255,255,0.015)":"rgba(0,0,0,0.01)",position:"relative",overflow:"hidden" }}>
        <div style={{ position:"absolute",top:0,left:"10%",right:"10%",height:1,background:"linear-gradient(90deg,transparent,rgba(255,140,0,0.4),transparent)" }} />
        <span style={{ fontSize:16 }}>{icon}</span>
        <div>
          <p style={{ fontFamily:"Syne, sans-serif",fontWeight:700,fontSize:13.5,color:"var(--text)",margin:0 }}>{title}</p>
          {subtitle && <p style={{ fontFamily:"DM Sans, sans-serif",fontSize:12,color:"var(--text-muted)",margin:"1px 0 0" }}>{subtitle}</p>}
        </div>
      </div>
      <div style={{ padding:"20px" }}>{children}</div>
    </div>
  );
}

/* ── input ── */
function Input({ label, value, onChange, placeholder, type="text", maxLength, disabled, hint }: {
  label:string; value:string; onChange?:(v:string)=>void; placeholder?:string; type?:string; maxLength?:number; disabled?:boolean; hint?:string;
}) {
  const { isDark } = useTheme();
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"block",fontFamily:"DM Sans, sans-serif",fontWeight:600,fontSize:11.5,color:"var(--text-muted)",marginBottom:6,letterSpacing:"0.06em",textTransform:"uppercase" }}>{label}</label>
      <input type={type} value={value} maxLength={maxLength} disabled={disabled} placeholder={placeholder}
        onChange={e=>onChange?.(e.target.value)}
        style={{ width:"100%",padding:"10px 13px",borderRadius:11,boxSizing:"border-box",border:isDark?"1px solid rgba(255,255,255,0.1)":"1px solid rgba(0,0,0,0.1)",background:disabled?(isDark?"rgba(255,255,255,0.02)":"rgba(0,0,0,0.02)"):(isDark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.025)"),color:disabled?"var(--text-muted)":"var(--text)",fontFamily:"DM Sans, sans-serif",fontSize:14,outline:"none",transition:"border-color 0.15s,box-shadow 0.15s",cursor:disabled?"not-allowed":"text" }}
        onFocus={e=>{if(!disabled){e.target.style.borderColor="var(--accent)";e.target.style.boxShadow="0 0 0 3px rgba(255,107,0,0.1)";}}}
        onBlur={e=>{e.target.style.borderColor=isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.1)";e.target.style.boxShadow="none";}}
      />
      {hint && <p style={{ fontSize:11.5,color:"var(--text-muted)",fontFamily:"DM Sans, sans-serif",margin:"4px 0 0" }}>{hint}</p>}
    </div>
  );
}

/* ── fire button ── */
function Btn({ label, onClick, loading, disabled, variant="fire" }: {
  label:string; onClick?:()=>void; loading?:boolean; disabled?:boolean; variant?:"fire"|"outline"|"danger";
}) {
  const s = { fire:{background:"linear-gradient(135deg,#ff6b00,#ffcc00)",color:"#fff",border:"none",boxShadow:"0 0 18px rgba(255,100,0,0.35)"}, outline:{background:"transparent",color:"var(--text)",border:"1px solid var(--border)",boxShadow:"none"}, danger:{background:"rgba(239,68,68,0.08)",color:"#ef4444",border:"1px solid rgba(239,68,68,0.2)",boxShadow:"none"} }[variant];
  return (
    <button onClick={disabled||loading?undefined:onClick} style={{ padding:"10px 22px",borderRadius:11,fontFamily:"Syne, sans-serif",fontWeight:700,fontSize:13.5,cursor:disabled||loading?"not-allowed":"pointer",transition:"all 0.18s",position:"relative",overflow:"hidden",display:"inline-flex",alignItems:"center",gap:7,opacity:disabled?0.5:1,...s }}
      onMouseEnter={e=>{if(!disabled&&!loading&&variant==="fire"){const b=e.currentTarget as HTMLButtonElement;b.style.boxShadow="0 0 28px rgba(255,100,0,0.6)";b.style.transform="translateY(-1px)";}}}
      onMouseLeave={e=>{if(variant==="fire"){const b=e.currentTarget as HTMLButtonElement;b.style.boxShadow="0 0 18px rgba(255,100,0,0.35)";b.style.transform="translateY(0)";}}}
    >
      {variant==="fire"&&!loading && <span style={{ position:"absolute",inset:0,background:"linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.25) 50%,transparent 70%)",animation:"shimmer 2.4s ease-in-out infinite" }} />}
      <span style={{ position:"relative",display:"flex",alignItems:"center",gap:7 }}>
        {loading ? <><span style={{ width:14,height:14,borderRadius:"50%",border:"2px solid currentColor",borderTopColor:"transparent",animation:"spin 0.7s linear infinite",display:"inline-block" }} />{label}</> : label}
      </span>
    </button>
  );
}

/* ── doc card ── */
function DocCard({ label, sublabel, file, url, onFile, uploading }: { label:string; sublabel:string; file:File|null; url:string; onFile:(f:File)=>void; uploading:boolean }) {
  const { isDark } = useTheme();
  const ref = useRef<HTMLInputElement>(null);
  const has = !!url;
  return (
    <div onClick={()=>ref.current?.click()} style={{ padding:"14px",borderRadius:14,cursor:"pointer",background:isDark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.02)",border:has?"1px solid rgba(52,211,153,0.3)":isDark?"1px dashed rgba(255,255,255,0.1)":"1px dashed rgba(0,0,0,0.1)",transition:"all 0.18s" }}
      onMouseEnter={e=>{if(!has)(e.currentTarget as HTMLDivElement).style.borderColor="rgba(255,107,0,0.4)";}}
      onMouseLeave={e=>{if(!has)(e.currentTarget as HTMLDivElement).style.borderColor=isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.1)";}}
    >
      <input ref={ref} type="file" accept="image/*,application/pdf" style={{ display:"none" }} onChange={e=>{if(e.target.files?.[0])onFile(e.target.files[0]);}} />
      <div style={{ display:"flex",alignItems:"center",gap:12 }}>
        <div style={{ width:40,height:40,borderRadius:10,flexShrink:0,background:has?"rgba(52,211,153,0.1)":isDark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)",border:has?"1px solid rgba(52,211,153,0.25)":"none",display:"flex",alignItems:"center",justifyContent:"center" }}>
          {uploading ? <div style={{ width:18,height:18,borderRadius:"50%",border:"2px solid var(--accent)",borderTopColor:"transparent",animation:"spin 0.7s linear infinite" }} />
            : has ? <svg width="18" height="18" fill="none" stroke="#34d399" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            : <svg width="18" height="18" fill="none" stroke="var(--text-muted)" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>}
        </div>
        <div style={{ flex:1,minWidth:0 }}>
          <p style={{ fontFamily:"Syne, sans-serif",fontWeight:600,fontSize:13,color:"var(--text)",margin:"0 0 2px" }}>{label}</p>
          <p style={{ fontSize:11.5,color:has?"#34d399":"var(--text-muted)",fontFamily:"DM Sans, sans-serif",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
            {has?(file?.name??"Uploaded ✓"):sublabel}
          </p>
        </div>
        {!has&&!uploading&&<span style={{ fontSize:11,color:"#ff8800",fontFamily:"Syne, sans-serif",fontWeight:700,flexShrink:0 }}>Upload</span>}
      </div>
    </div>
  );
}

/* ── step dots ── */
function StepDots({ current, total }: { current:number; total:number }) {
  return (
    <div style={{ display:"flex",gap:6,alignItems:"center",marginBottom:20 }}>
      {Array.from({length:total}).map((_,i)=>(
        <div key={i} style={{ height:4,borderRadius:2,width:i===current?24:8,background:i<=current?"linear-gradient(90deg,#ff6b00,#ffcc00)":i<current?"rgba(255,107,0,0.3)":"rgba(255,255,255,0.1)",transition:"all 0.3s" }} />
      ))}
      <span style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"DM Sans, sans-serif",marginLeft:4 }}>Step {current+1}/{total}</span>
    </div>
  );
}

/* ── otp input ── */
function OtpInput({ value, onChange }: { value:string; onChange:(v:string)=>void }) {
  const { isDark } = useTheme();
  const digits = Array.from({length:6}).map((_,i)=>value[i]??"");
  const refs = Array.from({length:6}).map(()=>useRef<HTMLInputElement>(null));
  const handle = (i:number, v:string) => {
    if (!/^\d?$/.test(v)) return;
    const next = value.split("");
    next[i] = v;
    onChange(next.join("").slice(0,6));
    if (v && i<5) refs[i+1]?.current?.focus();
  };
  const handleKey = (i:number, e:React.KeyboardEvent) => {
    if (e.key==="Backspace"&&!value[i]&&i>0) refs[i-1]?.current?.focus();
  };
  return (
    <div style={{ display:"flex",gap:8,marginBottom:20 }}>
      {digits.map((d,i)=>(
        <input key={i} ref={refs[i]} type="tel" inputMode="numeric" maxLength={1} value={d}
          onChange={e=>handle(i,e.target.value)} onKeyDown={e=>handleKey(i,e)}
          style={{ width:44,height:52,textAlign:"center",borderRadius:12,border:isDark?"1px solid rgba(255,255,255,0.12)":"1px solid rgba(0,0,0,0.12)",background:isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.03)",color:"var(--text)",fontFamily:"Syne, sans-serif",fontWeight:700,fontSize:20,outline:"none",transition:"all 0.15s",boxShadow:d?"0 0 0 2px rgba(255,107,0,0.3)":"none" }}
          onFocus={e=>{e.target.style.borderColor="var(--accent)";e.target.style.boxShadow="0 0 0 3px rgba(255,107,0,0.12)";}}
          onBlur={e=>{e.target.style.borderColor=isDark?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.12)";e.target.style.boxShadow=d?"0 0 0 2px rgba(255,107,0,0.3)":"none";}}
        />
      ))}
    </div>
  );
}

/* ── become creator wizard ── */
type WizardStep = "intro"|"otp-sent"|"otp-verified"|"kyc-form"|"submitted"|"approved"|"rejected";

function BecomeCreatorWizard() {
  const { user, refetch } = useProfile();
  const { isDark } = useTheme();
  const [toast, setToast] = useState<{msg:string;type:"success"|"error"|"info"}|null>(null);
  const show = (msg:string, type:"success"|"error"|"info"="success", ms=3500) => { setToast({msg,type}); setTimeout(()=>setToast(null),ms); };

  const isCreator = user?.roles?.includes("CREATOR");
  const kycStatus = (user?.kycStatus??"NOT_SUBMITTED") as KycStatus;
  const [kycData, setKycData] = useState<KycStatusResponse|null>(null);
  const [step, setStep] = useState<WizardStep>("intro");
  const [otp, setOtp] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [panNumber, setPanNumber] = useState(""); const [aadhaarNum, setAadhaarNum] = useState("");
  const [acHolder, setAcHolder] = useState(""); const [acNumber, setAcNumber] = useState("");
  const [ifsc, setIfsc] = useState(""); const [bankName, setBankName] = useState("");
  const [branch, setBranch] = useState(""); const [upiId, setUpiId] = useState("");
  const [panUrl, setPanUrl] = useState(""); const [panPid, setPanPid] = useState(""); const [panFile, setPanFile] = useState<File|null>(null);
  const [afUrl, setAfUrl] = useState(""); const [afPid, setAfPid] = useState(""); const [afFile, setAfFile] = useState<File|null>(null);
  const [abUrl, setAbUrl] = useState(""); const [abPid, setAbPid] = useState(""); const [abFile, setAbFile] = useState<File|null>(null);
  const [uploadingDoc, setUploadingDoc] = useState<"pan"|"af"|"ab"|null>(null);

  useEffect(() => {
    if (kycStatus==="APPROVED") setStep("approved");
    else if (kycStatus==="PENDING_APPROVAL") setStep("submitted");
    else if (kycStatus==="REJECTED") setStep("rejected");
    else if (kycStatus==="PENDING_SUBMISSION") setStep("otp-verified");
    else setStep("intro");
  }, [kycStatus]);

  useEffect(() => { if (isCreator) creatorApi.kycStatus().then(setKycData).catch(()=>{}); }, [isCreator]);
  useEffect(() => { if (cooldown<=0) return; const t=setTimeout(()=>setCooldown(c=>c-1),1000); return()=>clearTimeout(t); }, [cooldown]);

  const sendOtp = async () => {
    setOtpSending(true);
    try { await creatorApi.sendOtp(); show("OTP sent to your email","success"); setStep("otp-sent"); setCooldown(60); }
    catch (e:any) { show(e.message??"Failed to send OTP","error"); }
    finally { setOtpSending(false); }
  };

  const verifyOtp = async () => {
    if (otp.length!==6) { show("Enter the 6-digit OTP","error"); return; }
    setOtpVerifying(true);
    try { await creatorApi.verifyOtp(otp); show("Phone verified! Now submit KYC docs.","success"); await refetch(); setStep("otp-verified"); }
    catch (e:any) { show(e.message??"Invalid OTP","error"); }
    finally { setOtpVerifying(false); }
  };

  const uploadDoc = async (file:File, type:"pan"|"af"|"ab") => {
    setUploadingDoc(type);
    try {
      const r = await creatorApi.uploadKycDoc(file);
      if (type==="pan"){ setPanUrl(r.secure_url);setPanPid(r.public_id);setPanFile(file); }
      if (type==="af") { setAfUrl(r.secure_url); setAfPid(r.public_id); setAfFile(file); }
      if (type==="ab") { setAbUrl(r.secure_url); setAbPid(r.public_id); setAbFile(file); }
      show(`${type==="pan"?"PAN":type==="af"?"Aadhaar Front":"Aadhaar Back"} uploaded!`,"success");
    } catch (e:any) { show(e.message??"Upload failed","error"); }
    finally { setUploadingDoc(null); }
  };

  const submitKyc = async () => {
    if (!panUrl||!afUrl||!abUrl) { show("Upload all 3 documents first","error"); return; }
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) { show("Invalid PAN (e.g. ABCDE1234F)","error"); return; }
    if (!/^\d{4}-\d{4}-\d{4}$/.test(aadhaarNum))         { show("Aadhaar must be XXXX-XXXX-XXXX","error"); return; }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc))            { show("Invalid IFSC","error"); return; }
    if (!/^[\w.\-_]+@[a-zA-Z]+$/.test(upiId))            { show("Invalid UPI ID","error"); return; }
    setSubmitting(true);
    try {
      const data = await creatorApi.submitKyc({ panNumber,panCardImageUrl:panUrl,panCardImagePublicId:panPid,aadhaarNumber:aadhaarNum,aadhaarFrontImageUrl:afUrl,aadhaarFrontPublicId:afPid,aadhaarBackImageUrl:abUrl,aadhaarBackPublicId:abPid,bankAccountHolderName:acHolder,bankAccountNumber:acNumber,bankIfscCode:ifsc,bankName,bankBranchName:branch,upiId });
      setKycData(data); await refetch(); show("KYC submitted! Review takes 24–48 hours.","success",5000); setStep("submitted");
    } catch (e:any) { show(e.message??"Submission failed","error"); }
    finally { setSubmitting(false); }
  };

  if (step==="approved") return (
    <div style={{ textAlign:"center",padding:"12px 0" }}>
      <div style={{ width:64,height:64,borderRadius:20,background:"rgba(52,211,153,0.1)",border:"1px solid rgba(52,211,153,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 16px" }}>⚡</div>
      <p style={{ fontFamily:"Syne, sans-serif",fontWeight:800,fontSize:18,color:"#34d399",margin:"0 0 6px" }}>Verified Creator</p>
      <p style={{ fontSize:13,color:"var(--text-muted)",fontFamily:"DM Sans, sans-serif",margin:"0 0 20px" }}>Your KYC is approved. You can now launch campaigns.</p>
      {kycData && (
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,textAlign:"left" }}>
          {([["PAN",kycData.panNumber],["Bank",kycData.bankName],["Account",kycData.maskedBankAccount],["IFSC",kycData.bankIfscCode],["UPI",kycData.upiId]] as [string,string|undefined][]).filter(([,v])=>v).map(([k,v])=>(
            <div key={k} style={{ padding:"10px 12px",borderRadius:12,background:isDark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)",border:isDark?"1px solid rgba(255,255,255,0.07)":"1px solid rgba(0,0,0,0.06)" }}>
              <p style={{ fontSize:10,color:"var(--text-muted)",fontFamily:"DM Sans, sans-serif",margin:"0 0 3px",textTransform:"uppercase",letterSpacing:"0.1em" }}>{k}</p>
              <p style={{ fontSize:13,color:"var(--text)",fontFamily:"Syne, sans-serif",fontWeight:600,margin:0 }}>{v}</p>
            </div>
          ))}
        </div>
      )}
      {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    </div>
  );

  if (step==="submitted") return (
    <div style={{ textAlign:"center",padding:"12px 0" }}>
      <div style={{ width:64,height:64,borderRadius:20,background:"rgba(167,139,250,0.1)",border:"1px solid rgba(167,139,250,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 16px" }}>🕐</div>
      <p style={{ fontFamily:"Syne, sans-serif",fontWeight:800,fontSize:18,color:"#a78bfa",margin:"0 0 8px" }}>Under Review</p>
      <p style={{ fontSize:13,color:"var(--text-muted)",fontFamily:"DM Sans, sans-serif",margin:"0 auto",maxWidth:320,lineHeight:1.7 }}>Our team is verifying your documents. Usually 24–48 hours. You'll get an email when approved.</p>
      {kycData?.submittedAt && <p style={{ fontSize:12,color:"var(--text-muted)",fontFamily:"DM Sans, sans-serif",marginTop:12 }}>Submitted: {new Date(kycData.submittedAt).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}</p>}
    </div>
  );

  if (step==="rejected") return (
    <div>
      <div style={{ padding:"14px",borderRadius:14,background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.2)",marginBottom:16 }}>
        <p style={{ fontFamily:"Syne, sans-serif",fontWeight:700,fontSize:14,color:"#ef4444",margin:"0 0 4px" }}>❌ KYC Rejected</p>
        <p style={{ fontSize:13,color:"var(--text-muted)",fontFamily:"DM Sans, sans-serif",margin:0 }}>Reason: <span style={{ color:"#ef4444" }}>{kycData?.rejectionReason??"Contact support."}</span></p>
      </div>
      <Btn label="Resubmit KYC" onClick={()=>setStep("kyc-form")} />
      {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    </div>
  );

  if (step==="intro") return (
    <div>
      <div style={{ padding:"20px",borderRadius:16,marginBottom:20,background:"linear-gradient(135deg,rgba(255,107,0,0.07),rgba(167,139,250,0.05))",border:"1px solid rgba(255,107,0,0.15)",position:"relative",overflow:"hidden" }}>
        <div style={{ position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,rgba(255,140,0,0.4),transparent)" }} />
        <div style={{ display:"flex",gap:16,alignItems:"flex-start" }}>
          <span style={{ fontSize:36,flexShrink:0 }}>🚀</span>
          <div>
            <p style={{ fontFamily:"Syne, sans-serif",fontWeight:700,fontSize:16,color:"var(--text)",margin:"0 0 6px" }}>Become a Creator</p>
            <p style={{ fontSize:13,color:"var(--text-muted)",fontFamily:"DM Sans, sans-serif",margin:"0 0 16px",lineHeight:1.7 }}>Launch campaigns, raise funds from thousands of backers, and turn your ideas into reality.</p>
            <div style={{ display:"flex",gap:20,flexWrap:"wrap" }}>
              {[["📧","Verify OTP"],["📄","Submit KYC"],["✅","Get approved"]].map(([e,t])=>(
                <div key={t} style={{ display:"flex",alignItems:"center",gap:6 }}>
                  <span style={{ fontSize:14 }}>{e}</span>
                  <span style={{ fontSize:12,color:"var(--text-muted)",fontFamily:"DM Sans, sans-serif" }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Btn label="🔥 Get started" onClick={sendOtp} loading={otpSending} />
      {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    </div>
  );

  if (step==="otp-sent") return (
    <div>
      <StepDots current={0} total={3} />
      <div style={{ padding:"14px",borderRadius:14,background:isDark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.025)",border:isDark?"1px solid rgba(255,255,255,0.07)":"1px solid rgba(0,0,0,0.06)",marginBottom:20 }}>
        <p style={{ fontFamily:"Syne, sans-serif",fontWeight:700,fontSize:13,color:"var(--text)",margin:"0 0 4px" }}>📧 Check your inbox</p>
        <p style={{ fontSize:13,color:"var(--text-muted)",fontFamily:"DM Sans, sans-serif",margin:0 }}>6-digit OTP sent to <strong style={{ color:"var(--text)" }}>{user?.email}</strong>. Valid 10 min.</p>
      </div>
      <OtpInput value={otp} onChange={setOtp} />
      <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
        <Btn label="Verify OTP" onClick={verifyOtp} loading={otpVerifying} />
        <Btn label={cooldown>0?`Resend in ${cooldown}s`:"Resend OTP"} onClick={cooldown>0?undefined:sendOtp} loading={otpSending} disabled={cooldown>0} variant="outline" />
      </div>
      {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    </div>
  );

  if (step==="otp-verified") return (
    <div>
      <div style={{ padding:"12px 16px",borderRadius:12,background:"rgba(52,211,153,0.07)",border:"1px solid rgba(52,211,153,0.2)",marginBottom:20,display:"flex",alignItems:"center",gap:10 }}>
        <svg width="18" height="18" fill="none" stroke="#34d399" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <p style={{ fontFamily:"DM Sans, sans-serif",fontSize:13,color:"#34d399",margin:0 }}>Email verified! Submit your KYC documents to complete creator setup.</p>
      </div>
      <Btn label="📄 Submit KYC Documents" onClick={()=>setStep("kyc-form")} />
      {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    </div>
  );

  if (step==="kyc-form") return (
    <div>
      <StepDots current={1} total={3} />
      <p style={{ fontFamily:"Syne, sans-serif",fontWeight:700,fontSize:13,color:"var(--text)",margin:"0 0 10px" }}>1. Upload documents</p>
      <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:20 }}>
        <DocCard label="PAN Card"      sublabel="Front side — JPG, PNG or PDF" file={panFile} url={panUrl} uploading={uploadingDoc==="pan"} onFile={f=>uploadDoc(f,"pan")} />
        <DocCard label="Aadhaar Front" sublabel="Front of Aadhaar card"        file={afFile}  url={afUrl}  uploading={uploadingDoc==="af"}  onFile={f=>uploadDoc(f,"af")}  />
        <DocCard label="Aadhaar Back"  sublabel="Back of Aadhaar card"         file={abFile}  url={abUrl}  uploading={uploadingDoc==="ab"}  onFile={f=>uploadDoc(f,"ab")}  />
      </div>
      <p style={{ fontFamily:"Syne, sans-serif",fontWeight:700,fontSize:13,color:"var(--text)",margin:"0 0 10px" }}>2. Identity details</p>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20 }} className="kyc-grid">
        <Input label="PAN Number"     value={panNumber}  onChange={setPanNumber}  placeholder="ABCDE1234F"      maxLength={10} hint="Format: ABCDE1234F" />
        <Input label="Aadhaar Number" value={aadhaarNum} onChange={setAadhaarNum} placeholder="XXXX-XXXX-XXXX" maxLength={14} hint="Format: XXXX-XXXX-XXXX" />
      </div>
      <p style={{ fontFamily:"Syne, sans-serif",fontWeight:700,fontSize:13,color:"var(--text)",margin:"0 0 10px" }}>3. Bank details</p>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20 }} className="kyc-grid">
        <Input label="Account Holder" value={acHolder}  onChange={setAcHolder}  placeholder="Full name on account" />
        <Input label="Account Number" value={acNumber}  onChange={setAcNumber}  placeholder="Your account number" type="password" />
        <Input label="IFSC Code"      value={ifsc}      onChange={setIfsc}      placeholder="HDFC0001234" maxLength={11} />
        <Input label="Bank Name"      value={bankName}  onChange={setBankName}  placeholder="HDFC Bank" />
        <Input label="Branch Name"    value={branch}    onChange={setBranch}    placeholder="Andheri West" />
        <Input label="UPI ID"         value={upiId}     onChange={setUpiId}     placeholder="yourname@upi" hint="Format: name@upi" />
      </div>
      <div style={{ display:"flex",gap:10,flexWrap:"wrap",marginBottom:16 }}>
        <Btn label={submitting?"Submitting…":"Submit KYC"} onClick={submitKyc} loading={submitting} disabled={!panUrl||!afUrl||!abUrl||!panNumber||!aadhaarNum||!acHolder||!acNumber||!ifsc||!bankName||!upiId} />
        <Btn label="← Back" onClick={()=>setStep("otp-verified")} variant="outline" />
      </div>
      <p style={{ fontSize:11.5,color:"var(--text-muted)",fontFamily:"DM Sans, sans-serif",lineHeight:1.6 }}>🔒 Documents are encrypted and stored securely. Used only for identity verification.</p>
      {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    </div>
  );

  return null;
}

/* ── email verification ── */
function EmailVerification() {
  const { user } = useProfile();
  const [toast, setToast] = useState<{msg:string;type:"success"|"error"|"info"}|null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  useEffect(()=>{ if(cooldown<=0)return; const t=setTimeout(()=>setCooldown(c=>c-1),1000); return()=>clearTimeout(t); },[cooldown]);

  const send = async () => {
    setSending(true);
    try { await authApi.sendVerificationEmail(); setToast({msg:"Verification email sent!",type:"success"}); setTimeout(()=>setToast(null),3500); setSent(true); setCooldown(60); }
    catch (e:any) { setToast({msg:e.message??"Failed","type":"error"} as any); setTimeout(()=>setToast(null),3500); }
    finally { setSending(false); }
  };

  if (user?.emailVerified) return (
    <div style={{ display:"flex",alignItems:"center",gap:12 }}>
      <div style={{ width:40,height:40,borderRadius:12,background:"rgba(52,211,153,0.1)",border:"1px solid rgba(52,211,153,0.25)",display:"flex",alignItems:"center",justifyContent:"center" }}>
        <svg width="18" height="18" fill="none" stroke="#34d399" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      </div>
      <div>
        <p style={{ fontFamily:"Syne, sans-serif",fontWeight:600,fontSize:14,color:"#34d399",margin:0 }}>Email verified</p>
        <p style={{ fontSize:12.5,color:"var(--text-muted)",fontFamily:"DM Sans, sans-serif",margin:"2px 0 0" }}>{user.email}</p>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:16 }}>
        <div style={{ width:40,height:40,borderRadius:12,background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.25)",display:"flex",alignItems:"center",justifyContent:"center" }}>
          <svg width="18" height="18" fill="none" stroke="#f59e0b" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
        </div>
        <div>
          <p style={{ fontFamily:"Syne, sans-serif",fontWeight:600,fontSize:14,color:"#f59e0b",margin:0 }}>Email not verified</p>
          <p style={{ fontSize:12.5,color:"var(--text-muted)",fontFamily:"DM Sans, sans-serif",margin:"2px 0 0" }}>{user?.email}</p>
        </div>
      </div>
      {sent && <div style={{ padding:"10px 14px",borderRadius:10,background:"rgba(0,245,212,0.07)",border:"1px solid rgba(0,245,212,0.2)",marginBottom:14 }}><p style={{ fontSize:13,color:"#00f5d4",fontFamily:"DM Sans, sans-serif",margin:0 }}>✓ Check your inbox at <strong>{user?.email}</strong> and click the verification link.</p></div>}
      <Btn label={cooldown>0?`Resend in ${cooldown}s`:sent?"Resend email":"Send verification email"} onClick={cooldown>0?undefined:send} loading={sending} disabled={cooldown>0} />
      {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    </div>
  );
}

/* ── account info table ── */
function AccountInfo() {
  const { user } = useProfile();
  const { isDark } = useTheme();
  if (!user) return null;
  const rows:[string,string][] = [
    ["User ID",`#${user.id}`],["Username",`@${user.username}`],["Email",user.email],
    ["Phone",user.phoneNumber??"—"],["Roles",(user.roles??[]).join(", ")],
    ["Account",user.accountStatus],["KYC",user.kycStatus],
    ["Member since",new Date(user.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})],
  ];
  return (
    <div>
      {rows.map(([k,v],i)=>(
        <div key={k} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderBottom:i<rows.length-1?(isDark?"1px solid rgba(255,255,255,0.04)":"1px solid rgba(0,0,0,0.04)"):"none" }}>
          <span style={{ fontSize:13,color:"var(--text-muted)",fontFamily:"DM Sans, sans-serif" }}>{k}</span>
          <span style={{ fontSize:13,color:"var(--text)",fontFamily:"Syne, sans-serif",fontWeight:600,maxWidth:"55%",textAlign:"right",wordBreak:"break-all" }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

/* ── page ── */
export default function SettingsPage() {
  const { user, loading } = useProfile();
  const [mounted, setMounted] = useState(false);
  useEffect(()=>{const t=setTimeout(()=>setMounted(true),50);return()=>clearTimeout(t);},[]);

  if (loading) return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"100vh" }}>
      <div style={{ width:40,height:40,borderRadius:"50%",border:"3px solid var(--accent)",borderTopColor:"transparent",animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const isCreator = user?.roles?.includes("CREATOR");

  return (
    <div style={{ maxWidth:760,margin:"0 auto",padding:"36px 24px 60px",
      opacity:mounted?1:0,transform:mounted?"translateY(0)":"translateY(12px)",
      transition:"opacity 0.5s ease,transform 0.5s cubic-bezier(0.16,1,0.3,1)",
    }}>
      <div style={{ marginBottom:32 }}>
        <h1 style={{ fontFamily:"Syne, sans-serif",fontWeight:800,fontSize:"clamp(24px,3vw,34px)",color:"var(--text)",letterSpacing:"-0.03em",margin:"0 0 6px" }}>Settings</h1>
        <p style={{ fontSize:13.5,color:"var(--text-muted)",fontFamily:"DM Sans, sans-serif",margin:0 }}>Manage verification, creator status, and account details.</p>
      </div>

      <Section title="Email Verification" icon="📧" subtitle="Verify your email to unlock all features (+15% completion)">
        <EmailVerification />
      </Section>

      <Section title={isCreator?"Creator Status":"Become a Creator"} icon="🚀" subtitle={isCreator?"Your KYC verification details":"3-step process to start launching campaigns"}>
        <BecomeCreatorWizard />
      </Section>

      <Section title="Account Information" icon="🪪" subtitle="Your account details and current status">
        <AccountInfo />
      </Section>

      <Section title="Danger Zone" icon="⚠️">
        <div style={{ padding:"16px",borderRadius:14,background:"rgba(239,68,68,0.04)",border:"1px solid rgba(239,68,68,0.15)" }}>
          <p style={{ fontFamily:"Syne, sans-serif",fontWeight:700,fontSize:14,color:"#ef4444",margin:"0 0 4px" }}>Deactivate account</p>
          <p style={{ fontSize:13,color:"var(--text-muted)",fontFamily:"DM Sans, sans-serif",margin:"0 0 14px",lineHeight:1.6 }}>This will suspend your account. Contact support to reactivate at any time.</p>
          <Btn label="Deactivate my account" variant="danger" onClick={()=>alert("Contact support@crowdspark.in to deactivate your account.")} />
        </div>
      </Section>

      <style>{`
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes shimmer { 0%{transform:translateX(-100%)} 60%{transform:translateX(200%)} 100%{transform:translateX(200%)} }
        @keyframes slideUp { from{transform:translateY(12px);opacity:0} to{transform:translateY(0);opacity:1} }
        @media(max-width:580px){.kyc-grid{grid-template-columns:1fr!important}}
      `}</style>
    </div>
  );
}