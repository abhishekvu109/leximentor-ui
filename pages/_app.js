import "../styles/globals.css";
import 'react-quill/dist/quill.snow.css';
import 'katex/dist/katex.min.css';
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
