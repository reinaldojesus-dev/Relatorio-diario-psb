

import React from 'react';
import ReportItem from './ReportItem';
import { ReportSectionData } from '../types';

interface ReportSectionProps {
    title: string;
    items: string[];
    data: ReportSectionData;
    onItemChange: (item: string, status: 'ok' | 'issue', observation: string) => void;
    isAuthorized: boolean;
}

const ReportSection: React.FC<ReportSectionProps> = ({ title, items, data, onItemChange, isAuthorized }) => {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
            <h3 className="text-xl font-bold text-white bg-estapar-dark-green p-4">{title}</h3>
            <div className="p-4">
                {items.map(item => (
                    <ReportItem
                        key={item}
                        name={item}
                        data={data[item] || { status: 'ok', observation: '' }}
                        onChange={(status, observation) => onItemChange(item, status, observation)}
                        isAuthorized={isAuthorized}
                    />
                ))}
            </div>
        </div>
    );
};

export default ReportSection;