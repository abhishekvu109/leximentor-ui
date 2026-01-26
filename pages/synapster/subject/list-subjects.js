import Layout from "@/components/layout/Layout";
import { SubjectTable } from "../../../components/synapster/SubjectTable";
import Link from "next/link";
import { PlusIcon, AcademicCapIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

const ListSubjects = () => {
    return (
        <Layout content={
            <div className="min-h-screen bg-slate-50 pb-20 font-sans">
                {/* Header Section */}
                <div className="bg-white border-b border-slate-200">
                    <div className="max-w-6xl mx-auto px-6 py-10">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Link href="/dashboard/dashboard" className="text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1 text-sm font-medium">
                                        <ArrowLeftIcon className="w-4 h-4" />
                                        Back to Dashboard
                                    </Link>
                                </div>
                                <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                                    <div className="bg-indigo-100 p-2 rounded-2xl">
                                        <AcademicCapIcon className="w-8 h-8 text-indigo-600" />
                                    </div>
                                    Synapster Subjects
                                </h1>
                                <p className="text-slate-500 mt-2 text-lg">
                                    Manage your academic subjects and topics inventory.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <Link href="/synapster/subject/subject">
                                    <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 transition-all hover:scale-105 active:scale-95">
                                        <PlusIcon className="w-5 h-5" />
                                        Create New Subject
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <main className="max-w-6xl mx-auto px-6 py-10">
                    <SubjectTable />
                </main>
            </div>
        } />
    );
};

export default ListSubjects;
