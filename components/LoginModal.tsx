import React, { useState } from 'react';
import { User } from '../types';

interface LoginModalProps {
    onLogin: (credentials: {email: string, password: string}) => void;
    onRegister: (newUser: User) => void;
    onViewAsGuest: () => void;
    isRegistrationLocked: boolean;
}

const LoginModal: React.FC<LoginModalProps> = ({ onLogin, onRegister, onViewAsGuest, isRegistrationLocked }) => {
    const [view, setView] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email && password) {
            onLogin({ email, password });
        }
    };
    
    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && email && password) {
            onRegister({ name, email, password });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md mx-4">
                {view === 'login' ? (
                    <>
                        <h2 className="text-2xl font-bold text-estapar-dark-green mb-2">Acesso ao Sistema</h2>
                        <p className="text-gray-600 mb-6">Insira suas credenciais para editar o relatório.</p>
                        <form onSubmit={handleLoginSubmit}>
                             <div className="mb-4">
                                <label htmlFor="email-login" className="block text-gray-700 font-semibold mb-2">Email</label>
                                <input
                                    type="email"
                                    id="email-login"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-estapar-green bg-white text-gray-900"
                                    placeholder="seu.nome@estapar.com.br"
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label htmlFor="password-login" className="block text-gray-700 font-semibold mb-2">Senha</label>
                                <input
                                    type="password"
                                    id="password-login"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-estapar-green bg-white text-gray-900"
                                    placeholder="********"
                                    required
                                />
                            </div>
                            <div className="flex justify-end items-center">
                                <button
                                    type="submit"
                                    className="bg-estapar-green text-white font-bold py-2 px-6 rounded-md hover:bg-green-700 transition-colors duration-300"
                                >
                                    Entrar
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                     <>
                        <h2 className="text-2xl font-bold text-estapar-dark-green mb-2">Criar Nova Conta</h2>
                        <p className="text-gray-600 mb-6">Use seu e-mail corporativo para se registrar.</p>
                        <form onSubmit={handleRegisterSubmit}>
                            <div className="mb-4">
                                <label htmlFor="name-register" className="block text-gray-700 font-semibold mb-2">Nome Completo</label>
                                <input
                                    type="text"
                                    id="name-register"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-estapar-green bg-white text-gray-900"
                                    placeholder="Seu Nome"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="email-register" className="block text-gray-700 font-semibold mb-2">Email (@estapar.com.br)</label>
                                <input
                                    type="email"
                                    id="email-register"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-estapar-green bg-white text-gray-900"
                                    placeholder="seu.nome@estapar.com.br"
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label htmlFor="password-register" className="block text-gray-700 font-semibold mb-2">Senha</label>
                                <input
                                    type="password"
                                    id="password-register"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-estapar-green bg-white text-gray-900"
                                    placeholder="Crie uma senha forte"
                                    required
                                />
                            </div>
                            <div className="flex justify-end items-center">
                                <button
                                    type="submit"
                                    className="bg-estapar-green text-white font-bold py-2 px-6 rounded-md hover:bg-green-700 transition-colors duration-300"
                                >
                                    Cadastrar
                                </button>
                            </div>
                        </form>
                    </>
                )}
                <div className="mt-6 border-t pt-4 text-center">
                     {view === 'login' ? (
                        !isRegistrationLocked ? (
                            <button
                                type="button"
                                onClick={() => setView('register')}
                                className="text-blue-600 hover:underline font-semibold"
                            >
                                Não tem uma conta? Cadastre-se
                            </button>
                        ) : (
                            <p className="text-sm text-red-600 font-semibold">O cadastro de novos usuários está bloqueado.</p>
                        )
                    ) : (
                        <button
                            type="button"
                            onClick={() => setView('login')}
                            className="text-blue-600 hover:underline font-semibold"
                        >
                            Já tem uma conta? Faça login
                        </button>
                    )}

                     <p className="text-gray-500 text-sm mt-4">ou</p>
                     <button
                        type="button"
                        onClick={onViewAsGuest}
                        className="mt-2 text-gray-600 hover:text-black font-semibold"
                    >
                        Apenas visualizar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;