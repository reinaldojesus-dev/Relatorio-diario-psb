
import React from 'react';
import { FilterIcon, WhatsAppIcon, WrenchScrewdriverIcon } from './icons';
import { AppView, ReportData } from '../types';
import { reportStructure } from '../constants';

interface ActionBarProps {
    onSetView: (view: AppView) => void;
    reportData: ReportData;
    reportDate: string;
    onOpenFilter: () => void;
}

const ActionBar: React.FC<ActionBarProps> = ({ onSetView, reportData, reportDate, onOpenFilter }) => {
    
    const handleExportWhatsApp = () => {
        let message = `*Relatório Diário PSB Bahia & Mercadão - ${new Date(reportDate).toLocaleDateString('pt-BR')}*\n\n`;

        reportStructure.forEach(section => {
            message += `*${section.title.toUpperCase()}*\n`;
            section.items.forEach(item => {
                const itemData = reportData[section.title]?.[item];
                if (itemData) {
                    if (itemData.status === 'ok') {
                        message += `✅ ${item}: OK\n`;
                    } else {
                        message += `❌ ${item}: ${itemData.observation || 'Observação'}\n`;
                    }
                }
            });
            message += '\n';
        });

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-8 sticky top-0 z-10">
            <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                    onClick={() => onOpenFilter()}
                    className="flex items-center space-x-2 bg-blue-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                >
                    <FilterIcon className="w-5 h-5" />
                    <span>Filtrar Equipamento</span>
                </button>
                <button
                    onClick={handleExportWhatsApp}
                    className="flex items-center space-x-2 bg-green-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
                >
                    <WhatsAppIcon className="w-5 h-5" />
                    <span>Exportar para WhatsApp</span>
                </button>
                <button
                    onClick={() => onSetView(AppView.PREVENTIVE_FORM)}
                    className="flex items-center space-x-2 bg-estapar-teal text-white font-semibold py-2 px-4 rounded-md hover:bg-teal-600 transition-colors"
                >
                    <WrenchScrewdriverIcon className="w-5 h-5" />
                    <span>Realizar Preventiva</span>
                </button>
                 <button
                    onClick={() => onSetView(AppView.PREVENTIVE_LIST)}
                    className="flex items-center space-x-2 bg-gray-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                >
                    <WrenchScrewdriverIcon className="w-5 h-5" />
                    <span>Ver Preventivas</span>
                </button>
            </div>
        </div>
    );
};

export default ActionBar;
