
import React from 'react';
import { ChangeLogEntry } from '../types';

interface ChangeLogProps {
    logs: ChangeLogEntry[];
}

const ChangeLog: React.FC<ChangeLogProps> = ({ logs }) => {
    return (
        <div className="mt-12 p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-estapar-dark-green mb-4">Últimas Alterações</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {logs.map((log, index) => (
                    <div key={index} className="bg-gray-100 p-3 rounded-md border-l-4 border-estapar-green">
                        <p className="text-sm text-gray-800"><span className="font-semibold">{log.user}</span> {log.change}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(log.date).toLocaleString('pt-BR')}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChangeLog;
