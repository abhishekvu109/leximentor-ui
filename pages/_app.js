import "../styles/globals.css";
import Script from "next/script";
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

function App({Component, pageProps}) {
    return (
        <QueryClientProvider client={queryClient}>
            <Script
                src="https://cdn.jsdelivr.net/npm/apexcharts@3.46.0/dist/apexcharts.min.js" strategy="beforeInteractive"
            />
            <Component {...pageProps} />
        </QueryClientProvider>
    );
}

export default App;
