import React from 'react';
import { HomeIcon } from './icons';
import { AppView, User } from '../types';

interface HeaderProps {
    onSetView: (view: AppView) => void;
    user: User | null;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSetView, user, onLogout }) => {
    return (
        <header className="bg-estapar-dark-green shadow-lg fixed top-0 left-0 right-0 z-20">
            <div className="px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                     {user && (
                        <span className="text-white text-sm">
                           Bem-vindo, <span className="font-bold">{user.name}</span>
                        </span>
                    )}
                </div>
                <div className="flex items-center space-x-4">
                     <button
                        onClick={() => onSetView(AppView.REPORT)}
                        className="flex items-center space-x-2 text-white hover:text-estapar-light-green transition-colors duration-200"
                        aria-label="Home"
                    >
                        <HomeIcon className="w-6 h-6" />
                        <span className="hidden md:inline">Principal</span>
                    </button>
                    {user && (
                         <button
                            onClick={onLogout}
                            className="text-white hover:text-estapar-light-green transition-colors duration-200"
                        >
                            Sair
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;