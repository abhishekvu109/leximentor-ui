import Script from "next/script";
import Head from "next/head";
import Link from "next/link";
import { useEffect } from "react";
import NewSidebar from "./NewSidebar";

const Layout = ({ content }) => {
    useEffect(() => {
        if (typeof window !== "undefined" && window.initFlowbite) {
            window.initFlowbite();
        }
    }, []);
    return <>
        {/*<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"></script>*/}
        {/*<script src="https://cdn.jsdelivr.net/npm/flowbite@3.1.2/dist/flowbite.min.js"></script>*/}
        {/*<script src="https://cdn.jsdelivr.net/npm/apexcharts@3.46.0/dist/apexcharts.min.js"></script>*/}
        {/*<Script*/}
        {/*    src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"*/}
        {/*/>*/}
        {/*<Script*/}
        {/*    src="https://cdn.jsdelivr.net/npm/flowbite@3.1.2/dist/flowbite.min.js"*/}
        {/*/>*/}
        {/*<Script*/}
        {/*    src="https://cdn.jsdelivr.net/npm/apexcharts@3.46.0/dist/apexcharts.min.js"*/}
        {/*/>*/}

        {/*<Head>*/}
        {/*    <Link href="https://cdn.jsdelivr.net/npm/flowbite@3.1.2/dist/flowbite.min.css" rel="stylesheet"/>*/}
        {/*    <Link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"/>*/}
        {/*</Head>*/}
        <nav
            className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="px-3 py-3 lg:px-5 lg:pl-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center justify-start rtl:justify-end">
                        <button data-drawer-target="logo-sidebar" data-drawer-toggle="logo-sidebar"
                            aria-controls="logo-sidebar" type="button"
                            className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
                            <span className="sr-only">Open sidebar</span>
                            <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg">
                                <path clipRule="evenodd" fillRule="evenodd"
                                    d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
                            </svg>
                        </button>
                        <a href="https://flowbite.com" className="flex ms-2 md:me-24">
                            <img src="https://flowbite.com/docs/images/logo.svg" className="h-8 me-3"
                                alt="FlowBite Logo" />
                            <span
                                className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">Flowbite</span>
                        </a>
                    </div>
                    <div className="flex items-center">
                        <div className="flex items-center ms-3">
                            <div>
                                <button type="button"
                                    className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                                    aria-expanded="false" data-dropdown-toggle="dropdown-user">
                                    <span className="sr-only">Open user menu</span>
                                    <img className="w-8 h-8 rounded-full"
                                        src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                                        alt="user photo" />
                                </button>
                            </div>
                            <div
                                className="z-50 hidden my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-sm shadow-sm dark:bg-gray-700 dark:divide-gray-600"
                                id="dropdown-user">
                                <div className="px-4 py-3" role="none">
                                    <p className="text-sm text-gray-900 dark:text-white" role="none">
                                        Neil Sims
                                    </p>
                                    <p className="text-sm font-medium text-gray-900 truncate dark:text-gray-300"
                                        role="none">
                                        neil.sims@flowbite.com
                                    </p>
                                </div>
                                <ul className="py-1" role="none">
                                    <li>
                                        <a href="#"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                                            role="menuitem">Dashboard</a>
                                    </li>
                                    <li>
                                        <a href="#"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                                            role="menuitem">Settings</a>
                                    </li>
                                    <li>
                                        <a href="#"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                                            role="menuitem">Earnings</a>
                                    </li>
                                    <li>
                                        <a href="#"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                                            role="menuitem">Sign out</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        <NewSidebar />

        <div className="p-4 sm:ml-64">
            <div
                className="p-4  border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">
                {content}
                {/*<div className="grid grid-cols-3 gap-4 mb-4">*/}
                {/*    <div className="flex items-center justify-center h-24 rounded-sm bg-gray-50 dark:bg-gray-800">*/}
                {/*        <p className="text-2xl text-gray-400 dark:text-gray-500">*/}
                {/*            <svg className="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"*/}
                {/*                 fill="none" viewBox="0 0 18 18">*/}
                {/*                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"*/}
                {/*                      strokeWidth="2" d="M9 1v16M1 9h16"/>*/}
                {/*            </svg>*/}
                {/*        </p>*/}
                {/*    </div>*/}
                {/*    <div className="flex items-center justify-center h-24 rounded-sm bg-gray-50 dark:bg-gray-800">*/}
                {/*        <p className="text-2xl text-gray-400 dark:text-gray-500">*/}
                {/*            <svg className="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"*/}
                {/*                 fill="none" viewBox="0 0 18 18">*/}
                {/*                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"*/}
                {/*                      strokeWidth="2" d="M9 1v16M1 9h16"/>*/}
                {/*            </svg>*/}
                {/*        </p>*/}
                {/*    </div>*/}
                {/*    <div className="flex items-center justify-center h-24 rounded-sm bg-gray-50 dark:bg-gray-800">*/}
                {/*        <p className="text-2xl text-gray-400 dark:text-gray-500">*/}
                {/*            <svg className="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"*/}
                {/*                 fill="none" viewBox="0 0 18 18">*/}
                {/*                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"*/}
                {/*                      strokeWidth="2" d="M9 1v16M1 9h16"/>*/}
                {/*            </svg>*/}
                {/*        </p>*/}
                {/*    </div>*/}
                {/*</div>*/}
                {/*<div className="flex items-center justify-center h-48 mb-4 rounded-sm bg-gray-50 dark:bg-gray-800">*/}
                {/*    <p className="text-2xl text-gray-400 dark:text-gray-500">*/}
                {/*        <svg className="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"*/}
                {/*             viewBox="0 0 18 18">*/}
                {/*            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"*/}
                {/*                  d="M9 1v16M1 9h16"/>*/}
                {/*        </svg>*/}
                {/*    </p>*/}
                {/*</div>*/}
                {/*<div className="grid grid-cols-2 gap-4 mb-4">*/}
                {/*    <div className="flex items-center justify-center rounded-sm bg-gray-50 h-28 dark:bg-gray-800">*/}
                {/*        <p className="text-2xl text-gray-400 dark:text-gray-500">*/}
                {/*            <svg className="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"*/}
                {/*                 fill="none" viewBox="0 0 18 18">*/}
                {/*                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"*/}
                {/*                      strokeWidth="2" d="M9 1v16M1 9h16"/>*/}
                {/*            </svg>*/}
                {/*        </p>*/}
                {/*    </div>*/}
                {/*    <div className="flex items-center justify-center rounded-sm bg-gray-50 h-28 dark:bg-gray-800">*/}
                {/*        <p className="text-2xl text-gray-400 dark:text-gray-500">*/}
                {/*            <svg className="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"*/}
                {/*                 fill="none" viewBox="0 0 18 18">*/}
                {/*                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"*/}
                {/*                      strokeWidth="2" d="M9 1v16M1 9h16"/>*/}
                {/*            </svg>*/}
                {/*        </p>*/}
                {/*    </div>*/}
                {/*    <div className="flex items-center justify-center rounded-sm bg-gray-50 h-28 dark:bg-gray-800">*/}
                {/*        <p className="text-2xl text-gray-400 dark:text-gray-500">*/}
                {/*            <svg className="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"*/}
                {/*                 fill="none" viewBox="0 0 18 18">*/}
                {/*                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"*/}
                {/*                      strokeWidth="2" d="M9 1v16M1 9h16"/>*/}
                {/*            </svg>*/}
                {/*        </p>*/}
                {/*    </div>*/}
                {/*    <div className="flex items-center justify-center rounded-sm bg-gray-50 h-28 dark:bg-gray-800">*/}
                {/*        <p className="text-2xl text-gray-400 dark:text-gray-500">*/}
                {/*            <svg className="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"*/}
                {/*                 fill="none" viewBox="0 0 18 18">*/}
                {/*                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"*/}
                {/*                      strokeWidth="2" d="M9 1v16M1 9h16"/>*/}
                {/*            </svg>*/}
                {/*        </p>*/}
                {/*    </div>*/}
                {/*</div>*/}
                {/*<div className="flex items-center justify-center h-48 mb-4 rounded-sm bg-gray-50 dark:bg-gray-800">*/}
                {/*    <p className="text-2xl text-gray-400 dark:text-gray-500">*/}
                {/*        <svg className="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"*/}
                {/*             viewBox="0 0 18 18">*/}
                {/*            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"*/}
                {/*                  d="M9 1v16M1 9h16"/>*/}
                {/*        </svg>*/}
                {/*    </p>*/}
                {/*</div>*/}
                {/*<div className="grid grid-cols-2 gap-4">*/}
                {/*    <div className="flex items-center justify-center rounded-sm bg-gray-50 h-28 dark:bg-gray-800">*/}
                {/*        <p className="text-2xl text-gray-400 dark:text-gray-500">*/}
                {/*            <svg className="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"*/}
                {/*                 fill="none" viewBox="0 0 18 18">*/}
                {/*                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"*/}
                {/*                      strokeWidth="2" d="M9 1v16M1 9h16"/>*/}
                {/*            </svg>*/}
                {/*        </p>*/}
                {/*    </div>*/}
                {/*    <div className="flex items-center justify-center rounded-sm bg-gray-50 h-28 dark:bg-gray-800">*/}
                {/*        <p className="text-2xl text-gray-400 dark:text-gray-500">*/}
                {/*            <svg className="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"*/}
                {/*                 fill="none" viewBox="0 0 18 18">*/}
                {/*                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"*/}
                {/*                      strokeWidth="2" d="M9 1v16M1 9h16"/>*/}
                {/*            </svg>*/}
                {/*        </p>*/}
                {/*    </div>*/}
                {/*    <div className="flex items-center justify-center rounded-sm bg-gray-50 h-28 dark:bg-gray-800">*/}
                {/*        <p className="text-2xl text-gray-400 dark:text-gray-500">*/}
                {/*            <svg className="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"*/}
                {/*                 fill="none" viewBox="0 0 18 18">*/}
                {/*                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"*/}
                {/*                      strokeWidth="2" d="M9 1v16M1 9h16"/>*/}
                {/*            </svg>*/}
                {/*        </p>*/}
                {/*    </div>*/}
                {/*    <div className="flex items-center justify-center rounded-sm bg-gray-50 h-28 dark:bg-gray-800">*/}
                {/*        <p className="text-2xl text-gray-400 dark:text-gray-500">*/}
                {/*            <svg className="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"*/}
                {/*                 fill="none" viewBox="0 0 18 18">*/}
                {/*                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"*/}
                {/*                      strokeWidth="2" d="M9 1v16M1 9h16"/>*/}
                {/*            </svg>*/}
                {/*        </p>*/}
                {/*    </div>*/}
                {/*</div>*/}
            </div>
        </div>
    </>
};

export default Layout;