import "../styles/globals.css";
import Script from "next/script";
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from '../context/AuthContext';

const queryClient = new QueryClient();

function App({ Component, pageProps }) {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>

                <Component {...pageProps} />
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;
