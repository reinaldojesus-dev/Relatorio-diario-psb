import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { allEquipment } from '../constants';
import { EquipmentLogEntry } from '../types';
import { XIcon } from './icons';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    logs: EquipmentLogEntry[];
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, logs }) => {
    const [selectedEquipment, setSelectedEquipment] = useState<string>('');

    const filteredLogs = useMemo(() => {
        if (!selectedEquipment) return [];
        return logs
            .filter(log => log.equipment === selectedEquipment)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [selectedEquipment, logs]);

    const chartData = useMemo(() => {
        if (filteredLogs.length === 0) return [];
        const defectCounts: { [key: string]: number } = {};
        filteredLogs.forEach(log => {
            defectCounts[log.description] = (defectCounts[log.description] || 0) + 1;
        });

        return Object.entries(defectCounts)
            .map(([name, count]) => ({ name, 'Ocorrências': count }))
            .sort((a, b) => b['Ocorrências'] - a['Ocorrências']);
    }, [filteredLogs]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white p-5 border-b flex justify-between items-center z-10">
                    <h2 className="text-2xl font-bold text-estapar-dark-green">Filtrar Equipamento e Histórico</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <XIcon className="w-7 h-7" />
                    </button>
                </div>
                
                <div className="p-6">
                    <div className="mb-6">
                        <label htmlFor="equipment-select" className="block text-gray-700 font-semibold mb-2">Selecione o Equipamento</label>
                        <select
                            id="equipment-select"
                            value={selectedEquipment}
                            onChange={(e) => setSelectedEquipment(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-estapar-green bg-white text-gray-900"
                        >
                            <option value="">-- Selecione --</option>
                            {allEquipment.map(eq => <option key={eq} value={eq}>{eq}</option>)}
                        </select>
                    </div>

                    {selectedEquipment && (
                        <div>
                            <div className="mb-8">
                                <h3 className="text-xl font-semibold mb-3 text-gray-800">Log de Problemas (Mais Recente)</h3>
                                {filteredLogs.length > 0 ? (
                                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                        {filteredLogs.map(log => (
                                            <div key={log.id} className="bg-gray-100 p-3 rounded-md border-l-4 border-estapar-teal">
                                                <p className="font-semibold text-gray-700">{log.description}</p>
                                                <p className="text-sm text-gray-500">{new Date(log.date).toLocaleString('pt-BR')}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">Nenhum problema registrado para este equipamento.</p>
                                )}
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold mb-4 text-gray-800">Gráfico de Defeitos Recorrentes</h3>
                                {chartData.length > 0 ? (
                                    <div style={{ width: '100%', height: 300 }}>
                                        <ResponsiveContainer>
                                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-20} textAnchor="end" height={60} />
                                                <YAxis allowDecimals={false} />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="Ocorrências" fill="#3c8c5a" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">Não há dados suficientes para gerar o gráfico.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FilterModal;