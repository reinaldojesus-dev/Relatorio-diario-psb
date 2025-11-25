import React, { useState, useEffect, useCallback } from 'react';
import { reportStructure } from './constants';
import { ReportData, Report, PreventiveMaintenance, ChangeLogEntry, User, AppView, EquipmentLogEntry, ReportItemState, LoginHistoryEntry } from './types';
import Header from './components/Header';
import LoginModal from './components/LoginModal';
import ReportSection from './components/ReportSection';
import ActionBar from './components/ActionBar';
import ChangeLog from './components/ChangeLog';
import PreventiveForm from './components/PreventiveForm';
import PreventiveList from './components/PreventiveList';
import FilterModal from './components/FilterModal';
import LoginHistory from './components/LoginHistory';

// Mock Data
const createInitialReportData = (): ReportData => {
  const data: ReportData = {};
  reportStructure.forEach(section => {
    data[section.title] = {};
    section.items.forEach(item => {
      data[section.title][item] = { status: 'ok', observation: '' };
    });
  });
  return data;
};

const MOCK_PREVENTIVES: PreventiveMaintenance[] = [
    { id: 'prev1', equipment: 'DOCAS - Entrada 01', date: new Date(2024, 6, 20).toISOString(), collaborator: 'Carlos Souza (carlos.souza@estapar.com.br)', photo: 'https://picsum.photos/400/300?random=1' },
    { id: 'prev2', equipment: 'TERMINAIS - Epa Petz', date: new Date(2024, 6, 18).toISOString(), collaborator: 'Ana Pereira (ana.pereira@estapar.com.br)', photo: 'https://picsum.photos/400/300?random=2' },
];

const MOCK_LOGS: EquipmentLogEntry[] = [
    { id: 'log1', equipment: 'DOCAS - Entrada 01', date: new Date(2024, 6, 15).toISOString(), description: 'Cancela não abre remotamente.' },
    { id: 'log2', equipment: 'DOCAS - Entrada 01', date: new Date(2024, 5, 10).toISOString(), description: 'Leitor de ticket falhando.' },
    { id: 'log3', equipment: 'TERMINAIS - Epa Petz', date: new Date(2024, 6, 1).toISOString(), description: 'Impressora sem papel.' },
    { id: 'log4', equipment: 'DOCAS - Entrada 01', date: new Date(2024, 4, 20).toISOString(), description: 'Cancela não abre remotamente.' },
];

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [reports, setReports] = useState<Report[]>([
        { id: '1', date: new Date().toISOString(), collaborator: 'Sistema', data: createInitialReportData() }
    ]);
    const [currentReportData, setCurrentReportData] = useState<ReportData>(reports[0].data);
    const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>([]);
    const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>(() => {
        try {
            const storedHistory = localStorage.getItem('estapar_login_history');
            return storedHistory ? JSON.parse(storedHistory) : [];
        } catch {
            return [];
        }
    });
    const [currentView, setCurrentView] = useState<AppView>(AppView.REPORT);
    const [preventives, setPreventives] = useState<PreventiveMaintenance[]>(MOCK_PREVENTIVES);
    const [equipmentLogs, setEquipmentLogs] = useState<EquipmentLogEntry[]>(MOCK_LOGS);
    const [isLoginModalOpen, setLoginModalOpen] = useState<boolean>(true);
    const [isFilterModalOpen, setFilterModalOpen] = useState<boolean>(false);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [isRegistrationLocked, setRegistrationLocked] = useState<boolean>(() => {
        try {
            const storedValue = localStorage.getItem('estapar_registration_locked');
            return storedValue ? JSON.parse(storedValue) : false;
        } catch {
            return false;
        }
    });

    useEffect(() => {
        localStorage.setItem('estapar_registration_locked', JSON.stringify(isRegistrationLocked));
    }, [isRegistrationLocked]);

    useEffect(() => {
        localStorage.setItem('estapar_login_history', JSON.stringify(loginHistory));
    }, [loginHistory]);

     useEffect(() => {
        try {
            const storedUsers = localStorage.getItem('estapar_users');
            let usersList: User[] = storedUsers ? JSON.parse(storedUsers) : [];

            const masterUserExists = usersList.some(u => u.email === 'admin');
            if (!masterUserExists) {
                const masterUser: User = { name: 'Admin Master', email: 'admin', password: 'estaparti' };
                usersList.push(masterUser);
                localStorage.setItem('estapar_users', JSON.stringify(usersList));
            }
            setUsers(usersList);

        } catch (error) {
            console.error("Failed to parse users from localStorage", error);
        }
    }, []);

    const handleLogin = (credentials: {email: string, password: string}) => {
        const foundUser = users.find(u => u.email === credentials.email && u.password === credentials.password);
        if (foundUser) {
            setUser(foundUser);
            setLoginModalOpen(false);
            const newLoginEntry: LoginHistoryEntry = {
                user: foundUser.name,
                email: foundUser.email,
                date: new Date().toISOString(),
            };
            setLoginHistory(prev => [newLoginEntry, ...prev].slice(0, 50));
        } else {
            alert('Acesso negado. E-mail ou senha incorretos.');
        }
    };
    
    const handleRegister = (newUser: User) => {
        if (isRegistrationLocked) {
            alert('O cadastro de novos usuários está temporariamente bloqueado pelo administrador.');
            return;
        }
        if (!newUser.email.endsWith('@estapar.com.br')) {
            alert('Acesso negado. Por favor, use um e-mail @estapar.com.br para se registrar.');
            return;
        }
        if (users.some(u => u.email === newUser.email)) {
            alert('Este e-mail já está cadastrado.');
            return;
        }
        
        const newUsers = [...users, newUser];
        setUsers(newUsers);
        localStorage.setItem('estapar_users', JSON.stringify(newUsers));
        setUser(newUser);
        setLoginModalOpen(false);
        const newLoginEntry: LoginHistoryEntry = {
            user: newUser.name,
            email: newUser.email,
            date: new Date().toISOString(),
        };
        setLoginHistory(prev => [newLoginEntry, ...prev].slice(0, 50));
    };

    const handleViewAsGuest = () => {
        setUser(null);
        setLoginModalOpen(false);
    };
    
    const addChangeLog = useCallback((change: string) => {
        if (!user) return;
        const newEntry: ChangeLogEntry = {
            user: user.name,
            email: user.email,
            date: new Date().toISOString(),
            change,
        };
        setChangeLog(prev => [newEntry, ...prev]);
    }, [user]);

    const handleItemChange = useCallback((section: string, item: string, status: 'ok' | 'issue', observation: string) => {
        if (!user) {
            alert('Faça login com um e-mail @estapar.com.br para fazer alterações.');
            return;
        }
        setCurrentReportData(prev => {
            const newData = JSON.parse(JSON.stringify(prev));
            newData[section][item] = { ...newData[section][item], status, observation };
            return newData;
        });
        const changeDescription = observation 
            ? `Alterou ${item} em ${section} para 'Observação': ${observation}`
            : `Alterou ${item} em ${section} para 'OK'`;
        addChangeLog(changeDescription);

        if (status === 'issue' && observation) {
            setEquipmentLogs(prev => [{
                id: `log-${Date.now()}`,
                equipment: `${section} - ${item}`,
                date: new Date().toISOString(),
                description: observation
            }, ...prev]);
        }
    }, [user, addChangeLog]);
    
    const handleSavePreventive = (preventive: Omit<PreventiveMaintenance, 'id' | 'collaborator'>) => {
        if(!user) return;
        const newPreventive: PreventiveMaintenance = {
            ...preventive,
            id: `prev-${Date.now()}`,
            collaborator: `${user.name} (${user.email})`,
        };
        setPreventives(prev => [newPreventive, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        addChangeLog(`Registrou nova manutenção preventiva para ${preventive.equipment}.`);
        setCurrentView(AppView.REPORT);
    };

    const renderContent = () => {
        switch (currentView) {
            case AppView.PREVENTIVE_FORM:
                return <PreventiveForm onSave={handleSavePreventive} onCancel={() => setCurrentView(AppView.REPORT)} />;
            case AppView.PREVENTIVE_LIST:
                return <PreventiveList preventives={preventives} />;
            case AppView.REPORT:
            default:
                return (
                    <>
                        <ActionBar 
                            onSetView={setCurrentView} 
                            reportData={currentReportData} 
                            reportDate={selectedDate} 
                            onOpenFilter={() => setFilterModalOpen(true)}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 md:p-6">
                            {reportStructure.map(section => (
                                <ReportSection
                                    key={section.title}
                                    title={section.title}
                                    items={section.items}
                                    data={currentReportData[section.title] || {}}
                                    onItemChange={(item, status, observation) => handleItemChange(section.title, item, status, observation)}
                                    isAuthorized={!!user}
                                />
                            ))}
                        </div>
                    </>
                );
        }
    };
    
    const isMasterUser = user?.email === 'admin';

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
            {isLoginModalOpen && <LoginModal onLogin={handleLogin} onRegister={handleRegister} onViewAsGuest={handleViewAsGuest} isRegistrationLocked={isRegistrationLocked} />}
             <FilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setFilterModalOpen(false)}
                logs={equipmentLogs}
            />
            <Header onSetView={setCurrentView} />
            
            <div className="pt-12">
                {isMasterUser && (
                    <div className="bg-yellow-100 border-y border-yellow-300">
                        <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-4">
                            <span className="font-bold text-yellow-800">Painel do Administrador:</span>
                            <button
                                onClick={() => setRegistrationLocked(true)}
                                disabled={isRegistrationLocked}
                                className="bg-red-500 text-white font-semibold py-1 px-4 rounded-md hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors text-sm"
                            >
                                Bloquear Cadastro
                            </button>
                            <button
                                onClick={() => setRegistrationLocked(false)}
                                disabled={!isRegistrationLocked}
                                className="bg-green-500 text-white font-semibold py-1 px-4 rounded-md hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors text-sm"
                            >
                                Liberar Cadastro
                            </button>
                        </div>
                    </div>
                )}

                <main className="container mx-auto px-4 py-8">
                     <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-estapar-dark-green">Relatório Diário PSB Bahia & Mercadão</h1>
                        <div className="mt-2">
                          <input 
                            type="date" 
                            value={selectedDate} 
                            onChange={e => setSelectedDate(e.target.value)}
                            className="p-2 border rounded-md shadow-sm bg-white text-gray-900 [color-scheme:light]"
                          />
                        </div>
                    </div>
                    {renderContent()}
                    {user && changeLog.length > 0 && <ChangeLog logs={changeLog} />}
                    {user && loginHistory.length > 0 && <LoginHistory logs={loginHistory} />}
                </main>
            </div>
        </div>
    );
};

export default App;