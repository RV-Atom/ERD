import React from 'react';
import { useERDStore } from './store/useERDStore';
import Header from './components/Header/Header';
import PropertiesPanel from './components/PropertiesPanel';
import Canvas from './components/Canvas';
// import StatusBar from './components/StatusBar'; // Removing StatusBar for now if not used, or keep it

function App() {
    const theme = useERDStore((state: any) => state.project.theme.mode);
    const inspectingEntityId = useERDStore((state: any) => state.inspectingEntityId);

    return (
        <div className={`h-screen w-screen flex flex-col overflow-hidden bg-background text-foreground ${theme === 'dark' ? 'dark' : ''}`}>
            <Header />
            <div className="flex-1 flex overflow-hidden relative">
                <main className={`flex-1 relative h-full transition-all duration-300 ${inspectingEntityId ? 'mr-80' : ''}`}>
                    <Canvas />
                </main>
                {inspectingEntityId && (
                    <aside className="w-80 h-full border-l border-border bg-card/50 backdrop-blur-xl absolute right-0 top-0 z-10 shadow-xl overflow-hidden glass-panel animate-in slide-in-from-right duration-300">
                        <PropertiesPanel />
                    </aside>
                )}
            </div>
        </div>
    );
}

export default App;
