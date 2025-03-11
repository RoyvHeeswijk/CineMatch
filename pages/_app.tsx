import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { WishlistProvider } from '@/context/WishlistContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WishlistProvider>
      <Component {...pageProps} />
    </WishlistProvider>
  );
}
