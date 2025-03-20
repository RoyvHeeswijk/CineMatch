import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { WishlistProvider } from '@/context/WishlistContext';
import { WatchedProvider } from '@/context/WatchedContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WishlistProvider>
      <WatchedProvider>
        <Component {...pageProps} />
      </WatchedProvider>
    </WishlistProvider>
  );
}
