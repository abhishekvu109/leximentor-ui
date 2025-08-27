import "../styles/globals.css";
import Script from "next/script";

function App({Component, pageProps}) {
    return (<>
        <Script
            src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" strategy="beforeInteractive"
        />
        <Script
            src="https://cdn.jsdelivr.net/npm/flowbite@3.1.2/dist/flowbite.min.js" strategy="beforeInteractive"
        />
        <Script
            src="https://cdn.jsdelivr.net/npm/apexcharts@3.46.0/dist/apexcharts.min.js" strategy="beforeInteractive"
        />
        <Component {...pageProps} />
    </>);
}

export default App;
