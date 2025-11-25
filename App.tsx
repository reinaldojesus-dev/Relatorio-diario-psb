import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    
    const [reports, setReports] = useState<Report[]>(() => {
        try {
            const stored = localStorage.getItem('estapar_reports');
            return stored ? JSON.parse(stored) : [{ id: '1', date: new Date().toISOString(), collaborator: 'Sistema', data: createInitialReportData() }];
        } catch {
            return [{ id: '1', date: new Date().toISOString(), collaborator: 'Sistema', data: createInitialReportData() }];
        }
    });

    const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>(() => {
        try {
            const stored = localStorage.getItem('estapar_changeLog');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    const [preventives, setPreventives] = useState<PreventiveMaintenance[]>(() => {
        try {
            const stored = localStorage.getItem('estapar_preventives');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    const [equipmentLogs, setEquipmentLogs] = useState<EquipmentLogEntry[]>(() => {
        try {
            const stored = localStorage.getItem('estapar_equipmentLogs');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    
    const [currentReportData, setCurrentReportData] = useState<ReportData>(() => {
        const reportForDate = reports.find(r => r.date.split('T')[0] === selectedDate);
        return reportForDate ? reportForDate.data : createInitialReportData();
    });

    const [stagedReportData, setStagedReportData] = useState<ReportData>(currentReportData);

    const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>(() => {
        try {
            const storedHistory = localStorage.getItem('estapar_login_history');
            return storedHistory ? JSON.parse(storedHistory) : [];
        } catch {
            return [];
        }
    });

    const [currentView, setCurrentView] = useState<AppView>(AppView.REPORT);
    const [isLoginModalOpen, setLoginModalOpen] = useState<boolean>(true);
    const [isFilterModalOpen, setFilterModalOpen] = useState<boolean>(false);
    
    const [isRegistrationLocked, setRegistrationLocked] = useState<boolean>(() => {
        try {
            const storedValue = localStorage.getItem('estapar_registration_locked');
            return storedValue ? JSON.parse(storedValue) : false;
        } catch {
            return false;
        }
    });

    // --- Data Persistence Effects ---
    useEffect(() => { localStorage.setItem('estapar_reports', JSON.stringify(reports)); }, [reports]);
    useEffect(() => { localStorage.setItem('estapar_changeLog', JSON.stringify(changeLog)); }, [changeLog]);
    useEffect(() => { localStorage.setItem('estapar_preventives', JSON.stringify(preventives)); }, [preventives]);
    useEffect(() => { localStorage.setItem('estapar_equipmentLogs', JSON.stringify(equipmentLogs)); }, [equipmentLogs]);
    useEffect(() => { localStorage.setItem('estapar_registration_locked', JSON.stringify(isRegistrationLocked)); }, [isRegistrationLocked]);
    useEffect(() => { localStorage.setItem('estapar_login_history', JSON.stringify(loginHistory)); }, [loginHistory]);
    useEffect(() => { localStorage.setItem('estapar_users', JSON.stringify(users)); }, [users]);

     useEffect(() => {
        try {
            const storedUsers = localStorage.getItem('estapar_users');
            let usersList: User[] = storedUsers ? JSON.parse(storedUsers) : [];

            const masterUserExists = usersList.some(u => u.email === 'admin');
            if (!masterUserExists) {
                const masterUser: User = { name: 'Admin Master', email: 'admin', password: 'estaparti' };
                usersList.push(masterUser);
            }
            setUsers(usersList);

        } catch (error) {
            console.error("Failed to parse users from localStorage", error);
        }
    }, []);
    
    // Sync staged data when the main data source changes (e.g., on date change)
    useEffect(() => {
        const reportForDate = reports.find(r => r.date.split('T')[0] === selectedDate);
        const dataForSelectedDate = reportForDate ? reportForDate.data : createInitialReportData();
        setCurrentReportData(dataForSelectedDate);
        setStagedReportData(dataForSelectedDate);
    }, [selectedDate, reports]);

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
        
        setUsers(prev => [...prev, newUser]);
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
        setStagedReportData(prev => {
            const newData = JSON.parse(JSON.stringify(prev));
            if (!newData[section]) newData[section] = {};
            newData[section][item] = { status, observation };
            return newData;
        });
    }, [user]);
    
    const handleSaveChanges = () => {
        if (!user) {
            alert('Faça login para salvar as alterações.');
            return;
        }
        const newLogs: EquipmentLogEntry[] = [];

        reportStructure.forEach(section => {
            section.items.forEach(item => {
                const oldState = currentReportData[section.title]?.[item] ?? { status: 'ok', observation: '' };
                const newState = stagedReportData[section.title]?.[item] ?? { status: 'ok', observation: '' };

                if (oldState.status !== newState.status || oldState.observation !== newState.observation) {
                    const changeDescription = newState.status === 'issue' && newState.observation
                        ? `Alterou ${item} em ${section.title} para 'Observação': "${newState.observation}"`
                        : `Alterou ${item} em ${section.title} para 'OK'`;
                    
                    addChangeLog(changeDescription);

                    if (newState.status === 'issue' && newState.observation && oldState.status !== 'issue') {
                        newLogs.push({
                            id: `log-${Date.now()}-${item}`,
                            equipment: `${section.title} - ${item}`,
                            date: new Date().toISOString(),
                            description: newState.observation
                        });
                    }
                }
            });
        });

        if (newLogs.length > 0) {
            setEquipmentLogs(prev => [...newLogs, ...prev]);
        }

        const reportIndex = reports.findIndex(r => r.date.split('T')[0] === selectedDate);
        let updatedReports = [...reports];
        
        if (reportIndex > -1) {
            updatedReports[reportIndex] = {
                ...updatedReports[reportIndex],
                data: stagedReportData,
                collaborator: user.name,
            };
        } else {
            updatedReports.push({
                id: `${Date.now()}`,
                date: new Date(selectedDate).toISOString(),
                collaborator: user.name,
                data: stagedReportData
            });
        }
        setReports(updatedReports);
        alert('Alterações salvas com sucesso!');
    };

    const hasUnsavedChanges = useMemo(() => {
        return JSON.stringify(currentReportData) !== JSON.stringify(stagedReportData);
    }, [currentReportData, stagedReportData]);
    
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
                            reportData={stagedReportData} 
                            reportDate={selectedDate} 
                            onOpenFilter={() => setFilterModalOpen(true)}
                            onSaveChanges={handleSaveChanges}
                            hasUnsavedChanges={hasUnsavedChanges}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 md:p-6">
                            {reportStructure.map(section => (
                                <ReportSection
                                    key={section.title}
                                    title={section.title}
                                    items={section.items}
                                    data={stagedReportData[section.title] || {}}
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