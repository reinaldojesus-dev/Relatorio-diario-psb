import React, { useState, useEffect } from 'react';
import { ReportItemState } from '../types';
import { CheckIcon, XIcon } from './icons';

interface ReportItemProps {
    name: string;
    data: ReportItemState;
    onChange: (status: 'ok' | 'issue', observation: string) => void;
    isAuthorized: boolean;
}

const ReportItem: React.FC<ReportItemProps> = ({ name, data, onChange, isAuthorized }) => {
    const [status, setStatus] = useState<'ok' | 'issue'>(data.status);
    const [observation, setObservation] = useState(data.observation);

    useEffect(() => {
        setStatus(data.status);
        setObservation(data.observation);
    }, [data]);
    
    const handleStatusChange = (newStatus: 'ok' | 'issue') => {
        if (!isAuthorized) return;
        const finalObservation = newStatus === 'ok' ? '' : observation;
        setStatus(newStatus);
        onChange(newStatus, finalObservation);
    };

    const handleObservationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isAuthorized) return;
        setObservation(e.target.value);
    };
    
    const handleObservationBlur = () => {
        if (!isAuthorized) return;
        onChange(status, observation);
    };

    return (
        <div className="py-3 border-b border-gray-200 last:border-b-0">
            <div className="flex items-center justify-between">
                <span className="text-gray-700 flex-grow">{name}</span>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => handleStatusChange('ok')}
                        disabled={!isAuthorized}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                            status === 'ok' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400 hover:bg-green-100'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        aria-label={`Marcar ${name} como OK`}
                    >
                        <CheckIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => handleStatusChange('issue')}
                        disabled={!isAuthorized}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                            status === 'issue' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-400 hover:bg-red-100'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        aria-label={`Marcar ${name} com um problema`}
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            {status === 'issue' && (
                 <div className="mt-2 pl-2 space-y-2">
                    <div>
                        <input
                            type="text"
                            value={observation}
                            onChange={handleObservationChange}
                            onBlur={handleObservationBlur}
                            readOnly={!isAuthorized}
                            placeholder="Descreva a observação..."
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-estapar-green text-sm bg-white text-gray-900"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportItem;