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

// Helper hook for localStorage
const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(error);
        }
    };

    return [storedValue, setValue];
};

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [users, setUsers] = useLocalStorage<User[]>('users', []);
    const [reports, setReports] = useLocalStorage<Report[]>('reports', []);
    const [changeLog, setChangeLog] = useLocalStorage<ChangeLogEntry[]>('changeLog', []);
    const [preventives, setPreventives] = useLocalStorage<PreventiveMaintenance[]>('preventives', []);
    const [equipmentLogs, setEquipmentLogs] = useLocalStorage<EquipmentLogEntry[]>('equipmentLogs', []);
    const [loginHistory, setLoginHistory] = useLocalStorage<LoginHistoryEntry[]>('loginHistory', []);

    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [currentReportData, setCurrentReportData] = useState<ReportData>(createInitialReportData());
    const [stagedReportData, setStagedReportData] = useState<ReportData>(createInitialReportData());

    const [currentView, setCurrentView] = useState<AppView>(AppView.REPORT);
    const [isLoginModalOpen, setLoginModalOpen] = useState<boolean>(true);
    const [isFilterModalOpen, setFilterModalOpen] = useState<boolean>(false);
    
    useEffect(() => {
        const reportForDate = reports.find(r => r.id === selectedDate);
        const dataForSelectedDate = reportForDate ? reportForDate.data : createInitialReportData();
        setCurrentReportData(dataForSelectedDate);
        setStagedReportData(dataForSelectedDate);
    }, [selectedDate, reports]);
    
    const addLoginHistory = useCallback((loggedInUser: User) => {
        setLoginHistory(prev => [{
            user: loggedInUser.name,
            email: loggedInUser.email,
            date: new Date().toISOString(),
        }, ...prev].slice(0, 50));
    }, [setLoginHistory]);

    const handleLogin = async (credentials: { email: string; password: string }) => {
        const foundUser = users.find(u => u.email === credentials.email && u.password === credentials.password);
        if (foundUser) {
            setUser(foundUser);
            addLoginHistory(foundUser);
            setLoginModalOpen(false);
        } else {
            alert('Credenciais inválidas. Verifique seu e-mail e senha.');
        }
    };

    const handleRegister = async (newUser: User) => {
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
        addLoginHistory(newUser);
        setLoginModalOpen(false);
    };
    
    const handleLogout = () => {
        setUser(null);
        setLoginModalOpen(true);
    };

    const handleViewAsGuest = () => {
        setUser(null);
        setLoginModalOpen(false);
    };
    
    const addChangeLog = useCallback((change: string) => {
        if (!user) return;
        setChangeLog(prev => [{
            user: user.name,
            email: user.email,
            date: new Date().toISOString(),
            change,
        }, ...prev].slice(0, 50));
    }, [user, setChangeLog]);

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
    
    const handleSaveChanges = async () => {
        if (!user) {
            alert('Faça login para salvar as alterações.');
            return;
        }
        
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
                         setEquipmentLogs(prev => [{
                            id: Date.now().toString(),
                            equipment: `${section.title} - ${item}`,
                            date: new Date().toISOString(),
                            description: newState.observation
                         }, ...prev]);
                    }
                }
            });
        });
        
        setReports(prev => {
            const existingReportIndex = prev.findIndex(r => r.id === selectedDate);
            const newReport: Report = {
                id: selectedDate,
                date: new Date(selectedDate).toISOString(),
                collaborator: user.name,
                data: stagedReportData
            };
            if (existingReportIndex > -1) {
                const updatedReports = [...prev];
                updatedReports[existingReportIndex] = newReport;
                return updatedReports;
            }
            return [...prev, newReport];
        });

        alert('Alterações salvas com sucesso!');
    };

    const hasUnsavedChanges = useMemo(() => {
        return JSON.stringify(currentReportData) !== JSON.stringify(stagedReportData);
    }, [currentReportData, stagedReportData]);
    
    const handleSavePreventive = async (preventive: Omit<PreventiveMaintenance, 'id' | 'collaborator' | 'photo'>, photo: string) => {
        if(!user) return;

        const newPreventive: PreventiveMaintenance = {
            id: Date.now().toString(),
            ...preventive,
            photo,
            collaborator: `${user.name} (${user.email})`,
        };
        
        setPreventives(prev => [newPreventive, ...prev]);
        addChangeLog(`Registrou nova manutenção preventiva para ${preventive.equipment}.`);
        setCurrentView(AppView.REPORT);
        alert('Manutenção preventiva registrada com sucesso!');
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

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
            {isLoginModalOpen && user === null && <LoginModal onLogin={handleLogin} onRegister={handleRegister} onViewAsGuest={handleViewAsGuest} />}
             <FilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setFilterModalOpen(false)}
                logs={equipmentLogs}
            />
            <Header onSetView={setCurrentView} user={user} onLogout={handleLogout} />
            
            <div className="pt-20">
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