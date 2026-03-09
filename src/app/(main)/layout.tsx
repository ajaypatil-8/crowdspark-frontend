import Navbar from "@/components/Navbar";
import Footer from "@/components/footer";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 68 }}>
        {children}
      </main>
      <Footer />
    </>
  );
}