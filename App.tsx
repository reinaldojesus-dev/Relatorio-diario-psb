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
import { db, auth } from './firebaseConfig';

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
    const [reports, setReports] = useState<Report[]>([]);
    const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>([]);
    const [preventives, setPreventives] = useState<PreventiveMaintenance[]>([]);
    const [equipmentLogs, setEquipmentLogs] = useState<EquipmentLogEntry[]>([]);
    const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([]);
    const [isRegistrationLocked, setRegistrationLocked] = useState<boolean>(false);

    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [currentReportData, setCurrentReportData] = useState<ReportData>(createInitialReportData());
    const [stagedReportData, setStagedReportData] = useState<ReportData>(createInitialReportData());

    const [currentView, setCurrentView] = useState<AppView>(AppView.REPORT);
    const [isLoginModalOpen, setLoginModalOpen] = useState<boolean>(true);
    const [isFilterModalOpen, setFilterModalOpen] = useState<boolean>(false);
    
    // --- Firebase Data Listeners ---
    useEffect(() => {
        // Auth state listener
        const unsubscribeAuth = auth.onAuthStateChanged(firebaseUser => {
            if (firebaseUser) {
                setUser({ email: firebaseUser.email!, name: firebaseUser.displayName || firebaseUser.email! });
                setLoginModalOpen(false);
            } else {
                setUser(null);
                setLoginModalOpen(true);
            }
        });

        // Firestore listeners
        const unsubscribeReports = db.collection('reports').onSnapshot(snapshot => {
            const reportsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report));
            setReports(reportsData);
        });

        const unsubscribeChangeLog = db.collection('changeLog').orderBy('date', 'desc').limit(50).onSnapshot(snapshot => {
            const logData = snapshot.docs.map(doc => doc.data() as ChangeLogEntry);
            setChangeLog(logData);
        });

        const unsubscribePreventives = db.collection('preventives').orderBy('date', 'desc').onSnapshot(snapshot => {
            const preventiveData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PreventiveMaintenance));
            setPreventives(preventiveData);
        });
        
        const unsubscribeEquipmentLogs = db.collection('equipmentLogs').orderBy('date', 'desc').onSnapshot(snapshot => {
            const logData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EquipmentLogEntry));
            setEquipmentLogs(logData);
        });

        const unsubscribeLoginHistory = db.collection('loginHistory').orderBy('date', 'desc').limit(50).onSnapshot(snapshot => {
            const historyData = snapshot.docs.map(doc => doc.data() as LoginHistoryEntry);
            setLoginHistory(historyData);
        });

        const unsubscribeSettings = db.collection('settings').doc('appSettings').onSnapshot(doc => {
            if (doc.exists) {
                setRegistrationLocked(doc.data()?.isRegistrationLocked ?? false);
            }
        });

        return () => {
            unsubscribeAuth();
            unsubscribeReports();
            unsubscribeChangeLog();
            unsubscribePreventives();
            unsubscribeEquipmentLogs();
            unsubscribeLoginHistory();
            unsubscribeSettings();
        };
    }, []);
    
    // Sync staged data when the main data source changes (e.g., on date change)
    useEffect(() => {
        const reportForDate = reports.find(r => r.id === selectedDate);
        const dataForSelectedDate = reportForDate ? reportForDate.data : createInitialReportData();
        setCurrentReportData(dataForSelectedDate);
        setStagedReportData(dataForSelectedDate);
    }, [selectedDate, reports]);

    const handleLogin = async (credentials: {email: string, password: string}) => {
        try {
            await auth.signInWithEmailAndPassword(credentials.email, credentials.password);
            const newLoginEntry: LoginHistoryEntry = {
                user: auth.currentUser?.displayName || credentials.email,
                email: credentials.email,
                date: new Date().toISOString(),
            };
            db.collection('loginHistory').add(newLoginEntry);
        } catch (error) {
            alert('Acesso negado. E-mail ou senha incorretos.');
        }
    };
    
    const handleRegister = async (newUser: User) => {
        if (isRegistrationLocked) {
            alert('O cadastro de novos usuários está temporariamente bloqueado pelo administrador.');
            return;
        }
        if (!newUser.email.endsWith('@estapar.com.br')) {
            alert('Acesso negado. Por favor, use um e-mail @estapar.com.br para se registrar.');
            return;
        }
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(newUser.email, newUser.password!);
            await userCredential.user?.updateProfile({ displayName: newUser.name });
            db.collection('users').doc(userCredential.user!.uid).set({ name: newUser.name, email: newUser.email });
             const newLoginEntry: LoginHistoryEntry = {
                user: newUser.name,
                email: newUser.email,
                date: new Date().toISOString(),
            };
            db.collection('loginHistory').add(newLoginEntry);
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                alert('Este e-mail já está cadastrado.');
            } else {
                alert('Erro ao registrar. Tente novamente.');
            }
        }
    };

    const handleViewAsGuest = () => {
        setLoginModalOpen(false); // Allows viewing, but user will be null
    };
    
    const addChangeLog = useCallback(async (change: string) => {
        if (!user) return;
        const newEntry: ChangeLogEntry = {
            user: user.name,
            email: user.email,
            date: new Date().toISOString(),
            change,
        };
        await db.collection('changeLog').add(newEntry);
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
    
    const handleSaveChanges = async () => {
        if (!user) {
            alert('Faça login para salvar as alterações.');
            return;
        }
        const batch = db.batch();

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
                        const newLog = {
                            equipment: `${section.title} - ${item}`,
                            date: new Date().toISOString(),
                            description: newState.observation
                        };
                        const logRef = db.collection('equipmentLogs').doc();
                        batch.set(logRef, newLog);
                    }
                }
            });
        });
        
        const reportRef = db.collection('reports').doc(selectedDate);
        const reportPayload: Report = {
            id: selectedDate,
            date: new Date(selectedDate).toISOString(),
            collaborator: user.name,
            data: stagedReportData
        };

        batch.set(reportRef, reportPayload, { merge: true });

        try {
            await batch.commit();
            alert('Alterações salvas com sucesso!');
        } catch (error) {
            console.error("Error saving changes: ", error);
            alert('Falha ao salvar. Tente novamente.');
        }
    };

    const hasUnsavedChanges = useMemo(() => {
        return JSON.stringify(currentReportData) !== JSON.stringify(stagedReportData);
    }, [currentReportData, stagedReportData]);
    
    const handleSavePreventive = async (preventive: Omit<PreventiveMaintenance, 'id' | 'collaborator'>) => {
        if(!user) return;
        const newPreventive: Omit<PreventiveMaintenance, 'id'> = {
            ...preventive,
            collaborator: `${user.name} (${user.email})`,
        };
        await db.collection('preventives').add(newPreventive);
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
    
    const isMasterUser = user?.email === 'admin@estapar.com.br'; // Example admin email

    const toggleRegistrationLock = async (lock: boolean) => {
        try {
            await db.collection('settings').doc('appSettings').set({ isRegistrationLocked: lock }, { merge: true });
        } catch (error) {
            console.error("Failed to update registration lock status:", error);
            alert("Não foi possível alterar o status do cadastro.");
        }
    };

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
                                onClick={() => toggleRegistrationLock(true)}
                                disabled={isRegistrationLocked}
                                className="bg-red-500 text-white font-semibold py-1 px-4 rounded-md hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors text-sm"
                            >
                                Bloquear Cadastro
                            </button>
                            <button
                                onClick={() => toggleRegistrationLock(false)}
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