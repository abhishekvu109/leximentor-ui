'use client';

import {useState, useMemo, useEffect} from 'react';
import { Trash2 } from 'lucide-react';

export default function EditableTable({ tableHeader='',columns = [], data = [], onChange }) {
    const [rows, setRows] = useState(data);
    useEffect(() => {
        setRows(data);  // ✅ Always update rows when `data` changes from parent
    }, [data]);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState(null);
    const [sortAsc, setSortAsc] = useState(true);

    const filteredRows = useMemo(() => {
        return rows.filter(row =>
            columns.some(col =>
                String(row[col.key] || '')
                    .toLowerCase()
                    .includes(search.toLowerCase())
            )
        );
    }, [search, rows, columns]);

    const sortedRows = useMemo(() => {
        if (!sortBy) return filteredRows;
        return [...filteredRows].sort((a, b) => {
            const aVal = a[sortBy] || '';
            const bVal = b[sortBy] || '';
            return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        });
    }, [filteredRows, sortBy, sortAsc]);

    const updateCell = (rowIndex, key, value) => {
        const updated = [...rows];
        updated[rowIndex][key] = value;
        setRows(updated);
        if (onChange) onChange(updated);
    };

    const removeRow = (index) => {
        const updated = [...rows];
        updated.splice(index, 1);
        setRows(updated);
        if (onChange) onChange(updated);
    };

    const handleSort = (key) => {
        if (sortBy === key) {
            setSortAsc(!sortAsc);
        } else {
            setSortBy(key);
            setSortAsc(true);
        }
    };

    return (
        <div className="max-w-full overflow-x-auto bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">📋 {tableHeader}</h3>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="border border-gray-300 focus:ring-2 focus:ring-blue-500 rounded-md px-4 py-2 text-sm shadow-sm"
                />
            </div>
            <table className="min-w-full divide-y divide-gray-200 text-xs border border-1">
                <thead className="bg-gray-100 text-gray-700">
                <tr>
                    {columns.map(col => (
                        <th
                            key={col.key}
                            onClick={() => handleSort(col.key)}
                            className="px-4 py-3 text-center font-semibold cursor-pointer hover:text-blue-600 select-none border border-1"
                        >
                            {col.label} {sortBy === col.key ? (sortAsc ? '↑' : '↓') : ''}
                        </th>
                    ))}
                    <th className="px-4 py-3 text-center font-semibold">Action</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {sortedRows.map((row, i) => (
                    <tr key={i} className="hover:bg-blue-50 transition">
                        {columns.map((col) => {
                            const isEditable = col.editable !== false;
                            return (
                                <td key={col.key} className="px-4 py-3 text-center border border-1">
                                    {isEditable ? (
                                        col.type === 'select' && Array.isArray(col.options) ? (
                                            <select
                                                value={row[col.key] || ''}
                                                onChange={(e) => updateCell(i, col.key, e.target.value)}
                                                className="w-full bg-white border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            >
                                                <option value="">Select</option>
                                                {col.options.map((opt, idx) => (
                                                    <option key={idx} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type={col.type || 'text'}
                                                value={row[col.key] || ''}
                                                onChange={(e) => updateCell(i, col.key, e.target.value)}
                                                className="w-full bg-white border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 shadow-sm"
                                            />
                                        )
                                    ) : (
                                        <span className="text-gray-700">{row[col.key]}</span>
                                    )}
                                </td>
                            );
                        })}
                        <td className="px-4 py-3 text-center">
                            <button
                                onClick={() => removeRow(i)}
                                className="text-red-500 hover:text-red-600 p-1 rounded-full hover:bg-red-100 transition"
                            >
                                <Trash2 size={16} />
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
