import "../styles/globals.css";
import Script from "next/script";
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from '../context/AuthContext';
import { RouteGuard } from '../components/auth/RouteGuard';

const queryClient = new QueryClient();

function App({ Component, pageProps }) {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>

                <RouteGuard>
                    <Component {...pageProps} />
                </RouteGuard>
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;
