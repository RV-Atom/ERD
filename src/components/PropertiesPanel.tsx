import React, { useRef, useEffect } from 'react';
import { useERDStore } from '../store/useERDStore';
import { Settings, Info, Plus, Trash2, Hash, Type, ChevronRight, LayoutPanelTop, X, FileJson, ArrowDownRight } from 'lucide-react';

const PropertiesPanel = () => {
    const project = useERDStore((state: any) => state.project);
    const inspectingEntityId = useERDStore((state: any) => state.inspectingEntityId);
    const setInspectingEntityId = useERDStore((state: any) => state.setInspectingEntityId);
    const updateEntity = useERDStore((state: any) => state.updateEntity);
    const deleteEntity = useERDStore((state: any) => state.deleteEntity);
    const addField = useERDStore((state: any) => state.addField);
    const updateField = useERDStore((state: any) => state.updateField);
    const deleteField = useERDStore((state: any) => state.deleteField);

    const scrollRef = useRef<HTMLDivElement>(null);
    const selectedEntity = project.entities.find((e: any) => e.id === inspectingEntityId);

    // Auto-scroll to bottom when fields are added
    // Auto-scroll logic is handled in handleAddField

    if (!selectedEntity) {
        return (
            <aside className="w-96 bg-card/80 backdrop-blur-xl border-l h-full flex items-center justify-center p-8 text-center select-none shadow-2xl">
                <div className="space-y-6">
                    <div className="relative mx-auto w-24 h-24">
                        <div className="absolute inset-0 bg-primary/20 rounded-[2rem] rotate-12 animate-pulse" />
                        <div className="absolute inset-0 bg-card border border-primary/20 rounded-[2rem] shadow-2xl flex items-center justify-center -rotate-6 transition-transform hover:rotate-0 duration-500">
                            <ArrowDownRight className="w-10 h-10 text-primary/40 animate-bounce" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h3 className="font-bold text-lg text-foreground tracking-tight">Select an Entity</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed px-6 opacity-70">
                            Click on any table in the workspace to view and edit its properties, fields, and schema definition.
                        </p>
                    </div>
                </div>
            </aside>
        );
    }

    const handleAddField = () => {
        addField(selectedEntity.id, {
            name: `column_${selectedEntity.fields.length + 1}`,
            type: 'VARCHAR'
        });
        // Small delay to allow react to render the new field before scrolling
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
            }
        }, 100);
    };

    return (
        <aside className="w-96 bg-card/90 backdrop-blur-2xl border-l h-full flex flex-col overflow-hidden shadow-2xl z-20 transition-all duration-300">
            {/* Header */}
            <div className="p-6 border-b bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3" style={{ backgroundColor: selectedEntity.color || 'var(--primary)', color: '#fff' }}>
                        <Hash className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="font-extrabold text-base tracking-tight text-foreground leading-none mb-1">Inspector</h2>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: selectedEntity.color || 'var(--primary)' }} />
                            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{selectedEntity.name}</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setInspectingEntityId(null)}
                    className="p-2.5 hover:bg-destructive/10 hover:text-destructive rounded-xl text-muted-foreground transition-all duration-200"
                    title="Close Inspector"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Scrollable Content */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-10 scroll-smooth custom-scrollbar">

                {/* Section: Identity */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-4 bg-primary rounded-full" />
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">General Identity</label>
                    </div>

                    <div className="space-y-4">
                        <div className="group relative">
                            <label className="absolute -top-2 left-3 px-1 bg-card text-[9px] font-bold text-primary z-10">TABLE NAME</label>
                            <input
                                type="text"
                                value={selectedEntity.name}
                                placeholder="users, orders, etc..."
                                onChange={(e) => updateEntity(selectedEntity.id, { name: e.target.value })}
                                className="w-full px-4 py-3 bg-background/50 border border-border group-hover:border-primary/40 focus:border-primary rounded-xl text-sm font-bold text-foreground focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm"
                            />
                        </div>

                        <div className="group relative">
                            <label className="absolute -top-2 left-3 px-1 bg-card text-[9px] font-bold text-primary z-10">THEME COLOR</label>
                            <div className="flex gap-3">
                                <div
                                    className="w-12 h-12 rounded-xl shadow-lg border-2 border-background cursor-pointer relative overflow-hidden shrink-0 transform transition-transform hover:scale-105 active:scale-95"
                                    style={{ backgroundColor: selectedEntity.color || 'var(--primary)' }}
                                >
                                    <input
                                        type="color"
                                        value={selectedEntity.color || '#3b82f6'}
                                        onChange={(e) => updateEntity(selectedEntity.id, { color: e.target.value })}
                                        className="absolute inset-0 opacity-0 cursor-pointer scale-150"
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={selectedEntity.color || '#3b82f6'}
                                    onChange={(e) => updateEntity(selectedEntity.id, { color: e.target.value })}
                                    className="flex-1 px-4 py-3 bg-background/50 border border-border group-hover:border-primary/40 focus:border-primary rounded-xl text-xs font-mono font-bold text-foreground outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section: Fields */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-4 bg-primary rounded-full" />
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Data Columns</label>
                        </div>
                        <button
                            onClick={handleAddField}
                            className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg transition-all text-[10px] font-black uppercase tracking-tighter shadow-sm active:scale-95"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Add Column
                        </button>
                    </div>

                    <div className="space-y-4">
                        {selectedEntity.fields.map((field: any, idx: number) => (
                            <div
                                key={field.id}
                                className="group p-4 border border-border bg-card hover:border-primary/40 rounded-2xl transition-all shadow-sm hover:shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden relative"
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                {/* Active indicator */}
                                <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 mr-2">
                                            <input
                                                type="text"
                                                value={field.name}
                                                onChange={(e) => updateField(selectedEntity.id, field.id, { name: e.target.value })}
                                                className="w-full bg-transparent border-none p-0 text-sm font-extrabold text-foreground focus:ring-0 outline-none placeholder:text-muted-foreground/30"
                                                placeholder="Column name"
                                            />
                                        </div>
                                        <button
                                            onClick={() => deleteField(selectedEntity.id, field.id)}
                                            className="p-2 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all duration-200"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 relative group/select">
                                            <select
                                                value={field.type}
                                                onChange={(e) => updateField(selectedEntity.id, field.id, { type: e.target.value })}
                                                className="w-full pl-8 pr-4 py-2 bg-muted/30 border border-transparent focus:border-primary/20 rounded-lg text-[11px] font-bold text-foreground appearance-none outline-none transition-all cursor-pointer"
                                            >
                                                <option value="INT">INT</option>
                                                <option value="BIGINT">BIGINT</option>
                                                <option value="VARCHAR">VARCHAR</option>
                                                <option value="TEXT">TEXT</option>
                                                <option value="BOOLEAN">BOOLEAN</option>
                                                <option value="DATE">DATE</option>
                                                <option value="DATETIME">DATETIME</option>
                                                <option value="JSON">JSON</option>
                                                <option value="UUID">UUID</option>
                                                <option value="DECIMAL">DECIMAL</option>
                                            </select>
                                            <Type className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                        </div>

                                        <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/10 rounded-lg">
                                            <button
                                                onClick={() => updateField(selectedEntity.id, field.id, { constraints: { ...field.constraints, primaryKey: !field.constraints.primaryKey } })}
                                                className={`text-[9px] font-black uppercase tracking-widest transition-colors ${field.constraints.primaryKey ? 'text-amber-500' : 'text-muted-foreground/40 hover:text-muted-foreground'}`}
                                            >
                                                PK
                                            </button>
                                            <div className="w-px h-3 bg-border" />
                                            <button
                                                onClick={() => updateField(selectedEntity.id, field.id, { constraints: { ...field.constraints, notNull: !field.constraints.notNull } })}
                                                className={`text-[9px] font-black uppercase tracking-widest transition-colors ${field.constraints.notNull ? 'text-blue-500' : 'text-muted-foreground/40 hover:text-muted-foreground'}`}
                                            >
                                                NN
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Secondary Add Button at the bottom to avoid scrolling fix */}
                        <button
                            onClick={handleAddField}
                            className="w-full py-4 border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5 rounded-2xl flex items-center justify-center gap-3 text-muted-foreground hover:text-primary transition-all group active:scale-[0.98]"
                        >
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                            <span className="text-sm font-bold">Append New Column</span>
                        </button>
                    </div>
                </section>

                {/* Section: Advanced Actions */}
                <section className="pt-10 border-t border-border mt-auto space-y-4 pb-4">
                    <button
                        onClick={() => {
                            if (confirm("Are you sure you want to delete this table?")) {
                                deleteEntity(selectedEntity.id);
                                setInspectingEntityId(null);
                            }
                        }}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 text-sm font-black uppercase tracking-widest text-destructive/80 hover:text-white border border-destructive/20 hover:bg-destructive hover:border-destructive rounded-2xl transition-all shadow-sm active:scale-95"
                    >
                        <Trash2 className="w-4 h-4" />
                        Destroy Entity
                    </button>
                </section>
            </div>
        </aside>
    );
};

export default PropertiesPanel;
