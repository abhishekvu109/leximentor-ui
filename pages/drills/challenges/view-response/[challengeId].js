import { useEffect } from "react";
import { useRouter } from "next/router";

const RedirectPage = () => {
    const router = useRouter();
    const { challengeId } = router.query;

    useEffect(() => {
        if (challengeId) {
            router.replace(`/drill_challenges/${challengeId}`);
        }
    }, [challengeId, router]);

    return (
        <div className="flex items-center justify-center min-h-screen font-bold text-gray-400">
            Redirecting to new challenge view...
        </div>
    );
};

export default RedirectPage;
