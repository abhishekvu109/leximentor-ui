import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export { RouteGuard };

function RouteGuard({ children }) {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        authCheck(router.asPath);

        const hideContent = () => setAuthorized(false);
        router.events.on('routeChangeStart', hideContent);
        router.events.on('routeChangeComplete', authCheck)

        return () => {
            router.events.off('routeChangeStart', hideContent);
            router.events.off('routeChangeComplete', authCheck);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, loading]);

    function authCheck(url) {
        const publicPaths = ['/auth/login', '/', '/register'];
        const path = url.split('?')[0];

        if (loading) {
            setAuthorized(false);
            return;
        }

        if (!user && !publicPaths.includes(path)) {
            setAuthorized(false);
            router.push({
                pathname: '/auth/login',
                query: { returnUrl: router.asPath }
            });
        } else {
            setAuthorized(true);
        }
    }

    // Show loader if not authorized and not on a public path
    if (!authorized && !['/auth/login', '/', '/register'].includes(router.pathname)) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black italic shadow-lg animate-pulse text-2xl">L</div>
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Verifying Session</p>
            </div>
        );
    }

    return children;
}
