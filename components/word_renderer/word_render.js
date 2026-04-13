import Head from "next/head";
import Script from "next/script";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import leximentorService from "../../services/leximentor.service";

const WordRenderer = () => {
    const router = useRouter();
    const { wordRefId } = router.query;
    const [wordData, setWordData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!wordRefId) return;

        const loadWordData = async () => {
            setLoading(true);
            try {
                const data = await leximentorService.getWordDetails(wordRefId);
                setWordData(data);
            } catch (error) {
                console.error("Error fetching word data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadWordData();
    }, [wordRefId]);

    if (loading) return <div className="p-10 text-center text-slate-500 font-bold animate-pulse">Loading word details...</div>;
    if (!wordData || !wordData.data) return <div className="p-10 text-center text-red-500 font-bold">Word not found.</div>;

    return (<>
        <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"></Script>

        <Head>
            <title>Word Details - {wordData.data.word}</title>
        </Head>

        <div className="flex flex-row m-4">
            <div className="basis-1/12">
                <button type="button"
                    className="btn btn-primary dropdown-toggle hover:bg-primary-700 bg-amber-300 text-black font-semibold"
                    data-bs-toggle="dropdown">Sources
                </button>
                <div className="dropdown-menu">
                    <a href="#" className="dropdown-item">Action</a>
                    <a href="#" className="dropdown-item">Another action</a>
                </div>
            </div>
            <div className="basis-11/12"></div>
        </div>
        <div className="flex flex-row">
            <div className="basis-2/4 bg-gray-200">
                <div className="m-2">
                    <label htmlFor="wordId"
                        className="form-label font-semibold">WordId</label>
                    <input className="form-control" id="wordId" type="text"
                        disabled={false}
                        value={wordData.data.refId}></input>
                </div>
                <div className="m-2">
                    <label htmlFor="word"
                        className="form-label font-semibold">Word</label>
                    <input className="form-control" id="word" type="text"
                        disabled={false}
                        value={wordData.data.word}></input>
                </div>
                <div className="m-2">
                    <label htmlFor="source"
                        className="form-label font-semibold">Source</label>
                    <input className="form-control" id="source" type="text"
                        disabled={false}
                        value={wordData.data.source}></input>
                </div>
                <div className="m-2">
                    <label htmlFor="language"
                        className="form-label font-semibold">Language</label>
                    <input className="form-control" id="language" type="text"
                        disabled={false}
                        value={wordData.data.language}></input>
                </div>
                <div className="m-2">
                    <label htmlFor="pronunciation"
                        className="form-label font-semibold">Pronunciation</label>
                    <input className="form-control" id="pronunciation" type="text"
                        disabled={false}
                        value={wordData.data.pronunciation}></input>
                </div>
                <div className="m-2">
                    <label htmlFor="meanings" className="form-label font-semibold">Meanings</label>
                    <div>
                        <select className="form-select">
                            {wordData.data.meanings.map((m) => (
                                <option key={m.refId} className="font-semibold">{m.meaning}</option>))}
                        </select>
                    </div>
                </div>

                {wordData.data.synonyms && wordData.data.synonyms.length > 0 && (
                    <div className="m-2">
                        <label htmlFor="synonyms"
                            className="form-label font-semibold">Synonyms</label>
                        <div>
                            {wordData.data.synonyms.map((syn) => (
                                <span key={syn.refId} className="badge bg-primary m-1">{syn.synonym}</span>))}
                        </div>
                    </div>
                )}

                {wordData.data.antonyms && wordData.data.antonyms.length > 0 && (
                    <div className="m-2">
                        <label htmlFor="antonyms"
                            className="form-label font-semibold">Antonyms</label>
                        <div>
                            {wordData.data.antonyms.map((ant) => (
                                <span key={ant.refId} className="badge bg-primary m-1">{ant.antonym}</span>))}
                        </div>
                    </div>
                )}

                {wordData.data.examples && wordData.data.examples.length > 0 && (
                    <div className="m-2">
                        <label htmlFor="examples" className="form-label font-semibold">Examples</label>
                        <div>
                            <select className="form-select">
                                {wordData.data.examples.map((ex) => (
                                    <option key={ex.refId} className="font-semibold">{ex.example}</option>))}
                            </select>
                        </div>
                    </div>
                )}

                {wordData.data.partsOfSpeeches && wordData.data.partsOfSpeeches.length > 0 && (
                    <div className="m-2">
                        <label htmlFor="partsOfSpeeches"
                            className="form-label font-semibold">POS</label>
                        <div>
                            {wordData.data.partsOfSpeeches.map((pos) => (
                                <span key={pos.refId} className="badge bg-primary m-1">{pos.pos}</span>))}
                        </div>
                    </div>
                )}


            </div>
            <div className="basis-2/4 bg-gray-400">
                <div className="m-2">
                    <label htmlFor="wordJson" className="form-label font-semibold">JSON Data</label>
                    <textarea className="form-control font-mono text-sm antialiased text-red-700" id="wordJson"
                        rows="25"
                        readOnly
                        value={JSON.stringify(wordData, null, 2)}></textarea>
                </div>
            </div>
        </div>
        <div className="container object-center">
            <div className="flex flex-row m-2 items-center">
                <nav>
                    <ul className="pagination">
                        <li className="page-item disabled">
                            <a href="#" className="page-link" tabIndex="-1">
                                Previous
                            </a>
                        </li>
                        <li className="page-item active">
                            <a href="#" className="page-link">
                                1
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    </>);
}
export default WordRenderer;
