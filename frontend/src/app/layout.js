import Navbar from "@/components/Navbar";
import "./globals.css";
import Footer from "@/components/Footer";

export const metadata = {
  title: "LeetPath",
  description: "Leetcode Practice, Simplified.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">

      <body className='font-montserrat'>
        <Navbar/>
        {children}
        <Footer/>
      </body>
    </html>
  );
}
