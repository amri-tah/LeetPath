import Navbar from "@/components/Navbar";
import "./globals.css";
import Footer from "@/components/Footer";
import Recommendations from "@/components/Recommendations";

export const metadata = {
  title: "LeetPath",
  description: "Leetcode Practice, Simplified.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-montserrat">
        <Navbar />
        <Recommendations />
        {children}
        <Footer />
      </body>
    </html>
  );
}
