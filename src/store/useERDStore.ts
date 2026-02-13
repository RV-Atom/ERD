import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { ERDProject, Entity, Field, Relationship } from '../types';
import { calculateLayout } from '../lib/layoutEngine';

interface ERDStore {
    project: ERDProject;
    selectedNodes: string[];
    selectedEdges: string[];
    inspectingEntityId: string | null;

    // Entity Actions
    addEntity: (entity?: Partial<Entity>) => void;
    updateEntity: (id: string, updates: Partial<Entity>) => void;
    deleteEntity: (id: string) => void;

    // Field Actions
    addField: (entityId: string, field: Partial<Field>) => void;
    updateField: (entityId: string, fieldId: string, updates: Partial<Field>) => void;
    deleteField: (entityId: string, fieldId: string) => void;

    // Relationship Actions
    addRelationship: (rel: Partial<Relationship>) => void;
    deleteRelationship: (id: string) => void;

    // UI/Project Actions
    setTheme: (mode: 'light' | 'dark') => void;
    setSelectedNodes: (ids: string[]) => void;
    setSelectedEdges: (ids: string[]) => void;
    setInspectingEntityId: (id: string | null) => void;
    autoLayout: () => void;
    importProject: (project: ERDProject) => void;
    // Server Actions
    saveProject: () => Promise<void>;
    loadProject: (name: string) => Promise<void>;
    updateProjectMetadata: (metadata: Partial<ERDProject['metadata']>) => void;
}

const createEmptyProject = (): ERDProject => ({
    version: '2.0',
    metadata: {
        id: 'default',
        name: 'Untitled Project',
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
    },
    canvas: {
        zoom: 1,
        centerX: 0,
        centerY: 0,
        snapToGrid: true,
        gridSize: 20,
        showMinimap: true,
        showGrid: true,
    },
    entities: [],
    relationships: [],
    theme: {
        mode: 'dark',
        primaryColor: '#3b82f6',
        entityColors: {},
    },
    settings: {
        autoSave: true,
        autoSaveInterval: 30000,
        defaultDataType: 'INT',
        connectionStyle: 'bezier',
    },
});

export const useERDStore = create<ERDStore>()(
    persist(
        immer((set, get) => ({
            project: createEmptyProject(),
            selectedNodes: [],
            selectedEdges: [],
            inspectingEntityId: null,

            addEntity: (entity) => set((state: ERDStore) => {
                const newEntity: Entity = {
                    id: entity?.id || crypto.randomUUID(),
                    name: entity?.name || 'NewTable',
                    position: entity?.position || { x: 100, y: 100 },
                    fields: entity?.fields || [],
                    collapsed: false,
                    ...entity
                } as Entity;
                state.project.entities.push(newEntity);
                state.project.metadata.modified = new Date().toISOString();
            }),

            updateEntity: (id, updates) => set((state: ERDStore) => {
                const entity = state.project.entities.find(e => e.id === id);
                if (entity) {
                    Object.assign(entity, updates);
                    state.project.metadata.modified = new Date().toISOString();
                }
            }),

            deleteEntity: (id) => set((state: ERDStore) => {
                state.project.entities = state.project.entities.filter(e => e.id !== id);
                state.project.relationships = state.project.relationships.filter(
                    r => r.source.entityId !== id && r.target.entityId !== id
                );
                if (state.inspectingEntityId === id) state.inspectingEntityId = null;
                state.project.metadata.modified = new Date().toISOString();
            }),

            addField: (entityId, field) => set((state: ERDStore) => {
                const entity = state.project.entities.find(e => e.id === entityId);
                if (entity) {
                    const newField: Field = {
                        id: field.id || crypto.randomUUID(),
                        name: field.name || 'new_column',
                        type: field.type || 'INT',
                        constraints: {
                            primaryKey: false,
                            unique: false,
                            notNull: false,
                            autoIncrement: false,
                            ...field.constraints
                        },
                        ui: {
                            order: entity.fields.length,
                            ...field.ui
                        },
                        ...field
                    } as Field;
                    entity.fields.push(newField);
                    state.project.metadata.modified = new Date().toISOString();
                }
            }),

            updateField: (entityId, fieldId, updates) => set((state: ERDStore) => {
                const entity = state.project.entities.find(e => e.id === entityId);
                if (entity) {
                    const field = entity.fields.find(f => f.id === fieldId);
                    if (field) {
                        Object.assign(field, updates);
                        state.project.metadata.modified = new Date().toISOString();
                    }
                }
            }),

            deleteField: (entityId, fieldId) => set((state: ERDStore) => {
                const entity = state.project.entities.find(e => e.id === entityId);
                if (entity) {
                    entity.fields = entity.fields.filter(f => f.id !== fieldId);
                    state.project.relationships = state.project.relationships.filter(
                        r => !(r.source.entityId === entityId && r.source.fieldId === fieldId) &&
                            !(r.target.entityId === entityId && r.target.fieldId === fieldId)
                    );
                    state.project.metadata.modified = new Date().toISOString();
                }
            }),

            addRelationship: (rel) => set((state: ERDStore) => {
                if (!rel.source || !rel.target) return;

                const exists = state.project.relationships.some(r =>
                    r.source.fieldId === rel.source?.fieldId &&
                    r.target.fieldId === rel.target?.fieldId
                );
                if (exists) return;

                const newRel: Relationship = {
                    id: rel.id || crypto.randomUUID(),
                    type: rel.type || '1:N',
                    source: rel.source!,
                    target: rel.target!,
                    visual: {
                        edgeType: 'bezier',
                        animated: false,
                        ...rel.visual
                    },
                    ...rel
                } as Relationship;
                state.project.relationships.push(newRel);
                state.project.metadata.modified = new Date().toISOString();
            }),

            deleteRelationship: (id) => set((state: ERDStore) => {
                state.project.relationships = state.project.relationships.filter(r => r.id !== id);
                state.project.metadata.modified = new Date().toISOString();
            }),

            setTheme: (mode) => set((state: ERDStore) => {
                state.project.theme.mode = mode;
                state.project.metadata.modified = new Date().toISOString();
            }),

            setSelectedNodes: (ids) => set((state: ERDStore) => {
                state.selectedNodes = ids;
            }),

            setSelectedEdges: (ids) => set((state: ERDStore) => {
                state.selectedEdges = ids;
            }),

            setInspectingEntityId: (id) => set((state: ERDStore) => {
                state.inspectingEntityId = id;
            }),

            autoLayout: () => set((state: ERDStore) => {
                state.project.entities = calculateLayout(state.project.entities, state.project.relationships);
                state.project.metadata.modified = new Date().toISOString();
            }),

            importProject: (newProject: ERDProject) => set((state: ERDStore) => {
                state.project = newProject;
                state.inspectingEntityId = null;
                state.selectedNodes = [];
                state.selectedEdges = [];
            }),

            loadProject: async (name: string) => {
                try {
                    const response = await fetch(`http://localhost:8085/api/projects/${name}`);
                    if (!response.ok) throw new Error('Failed to load project');
                    const json = await response.json();
                    set((state: ERDStore) => {
                        state.project = json;
                        state.inspectingEntityId = null;
                        state.selectedNodes = [];
                        state.selectedEdges = [];
                    });
                } catch (error) {
                    console.error('Load Error:', error);
                }
            },

            saveProject: async () => {
                const state = get();
                const fileName = `${state.project.metadata.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
                try {
                    const response = await fetch('http://localhost:8085/api/save', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            project: state.project,
                            fileName: fileName
                        }),
                    });
                    if (!response.ok) {
                        throw new Error('Failed to save project');
                    }
                    console.log(`Project saved via API as ${fileName}`);
                } catch (error) {
                    console.warn('Save unavailable:', error);
                }
            },

            updateProjectMetadata: (metadata) => set((state: ERDStore) => {
                Object.assign(state.project.metadata, metadata);
                state.project.metadata.modified = new Date().toISOString();
            }),
        })),
        {
            name: 'erd-storage',
            onRehydrateStorage: () => (state) => {
                // Initial save on load or setup interval could go here
                // For now we will trigger save on modification
            }
        }
    )
);

// Optional: subscriber for auto-save
useERDStore.subscribe((state: ERDStore, prevState: ERDStore) => {
    if (state.project.metadata.modified !== prevState.project.metadata.modified) {
        // Debounce logic could be added here, but for now simple trigger
        const now = Date.now();
        const lastSave = (useERDStore as any).lastSave || 0;
        if (now - lastSave > 2000) { // Throttle 2s
            (useERDStore as any).lastSave = now;
            state.saveProject();
        }
    }
});
