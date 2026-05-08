import Navbar from "@/components/Navbar";
import Footer from "@/components/footer";
import {
  ProfileProvider,
} from "@/contexts/ProfileContext";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProfileProvider>
      <div
        suppressHydrationWarning
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Navbar />
        <main
          id="main-content"
          style={{
            paddingTop: 0,
            flex: 1,
            background: "var(--bg)",
          }}
        >
          {children}
        </main>
        <Footer />
      </div>
    </ProfileProvider>
  );
}
