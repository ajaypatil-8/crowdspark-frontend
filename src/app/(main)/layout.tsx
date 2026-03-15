import Navbar from "@/components/Navbar";
import Footer from "@/components/footer";
import { ProfileProvider } from "@/contexts/ProfileContext";

const NAVBAR_HEIGHT = 64;

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfileProvider>
      <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh" }}>
        <Navbar />
        <main id="main-content" style={{ paddingTop: NAVBAR_HEIGHT, flex: 1 }}>
          {children}
        </main>
        <Footer />
      </div>
    </ProfileProvider>
  );
}