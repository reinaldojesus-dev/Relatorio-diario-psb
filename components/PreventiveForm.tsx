import React, { useState } from 'react';
import { allEquipment } from '../constants';
import { PreventiveMaintenance } from '../types';

interface PreventiveFormProps {
    onSave: (preventive: Omit<PreventiveMaintenance, 'id' | 'collaborator' | 'photo'>, photo: string) => void;
    onCancel: () => void;
}

const PreventiveForm: React.FC<PreventiveFormProps> = ({ onSave, onCancel }) => {
    const [equipment, setEquipment] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [photo, setPhoto] = useState<string>('');

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!equipment || !date || !photo) {
            alert('Por favor, preencha todos os campos e selecione uma foto.');
            return;
        }
        onSave({ equipment, date }, photo);
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-estapar-dark-green mb-6">Registrar Manutenção Preventiva</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="equipment" className="block text-gray-700 font-semibold mb-2">Equipamento / Terminal</label>
                    <select
                        id="equipment"
                        value={equipment}
                        onChange={(e) => setEquipment(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-estapar-green bg-white text-gray-900"
                        required
                    >
                        <option value="">Selecione um equipamento</option>
                        {allEquipment.map(eq => <option key={eq} value={eq}>{eq}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="date" className="block text-gray-700 font-semibold mb-2">Data da Manutenção</label>
                    <input
                        type="date"
                        id="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-estapar-green bg-white text-gray-900 [color-scheme:light]"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="photo" className="block text-gray-700 font-semibold mb-2">Foto do Trabalho Finalizado</label>
                    <input
                        type="file"
                        id="photo"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="w-full text-sm text-gray-900 bg-white
                                   file:mr-4 file:py-2 file:px-4
                                   file:rounded-full file:border-0
                                   file:text-sm file:font-semibold
                                   file:bg-estapar-green file:text-white
                                   hover:file:bg-green-700"
                        required
                    />
                    {photo && <img src={photo} alt="Preview" className="mt-4 rounded-md shadow-sm max-h-60" />}
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                    <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-md hover:bg-gray-300 transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" className="bg-estapar-green text-white font-bold py-2 px-6 rounded-md hover:bg-green-700 transition-colors">
                        Salvar Preventiva
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PreventiveForm;