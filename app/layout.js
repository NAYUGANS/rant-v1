import "./globals.css";

export const metadata = {
  title: "RANT v1 Alpha",
  description: "Personal Visual Taste Engine experiment"
};

export default function RootLayout({ children }) {
  return <html lang="id"><body>{children}</body></html>;
}
