import React, { useState } from 'react';
import { PreventiveMaintenance } from '../types';

interface PreventiveListProps {
    preventives: PreventiveMaintenance[];
}

const PreventiveList: React.FC<PreventiveListProps> = ({ preventives }) => {
    const [filter, setFilter] = useState('');

    const filteredPreventives = preventives.filter(p => 
        p.equipment.toLowerCase().includes(filter.toLowerCase()) ||
        p.collaborator.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-estapar-dark-green mb-4">Relatório de Manutenções Preventivas</h2>
            
            <div className="mb-6">
                 <input
                    type="text"
                    placeholder="Filtrar por equipamento ou colaborador..."
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-estapar-green bg-white text-gray-900"
                />
            </div>

            <div className="space-y-4">
                {filteredPreventives.length > 0 ? filteredPreventives.map(p => (
                    <div key={p.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col md:flex-row gap-4">
                        <img src={p.photo} alt={`Preventiva em ${p.equipment}`} className="w-full md:w-48 h-32 object-cover rounded-md shadow-sm"/>
                        <div className="flex-grow">
                            <p className="font-bold text-lg text-estapar-dark-green">{p.equipment}</p>
                            <p className="text-gray-600">
                                Realizada por: <span className="font-semibold">{p.collaborator}</span>
                            </p>
                            <p className="text-gray-600">
                                Data: <span className="font-semibold">{new Date(p.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                            </p>
                        </div>
                    </div>
                )) : (
                    <p className="text-center text-gray-500 py-8">Nenhuma manutenção preventiva encontrada.</p>
                )}
            </div>
        </div>
    );
};

export default PreventiveList;