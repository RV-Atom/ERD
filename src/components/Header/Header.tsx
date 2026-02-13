import React, { useRef, useState, useEffect } from 'react';
import {
    Plus,
    LayoutTemplate,
    Search,
    Download,
    Upload,
    ChevronDown,
    Image as ImageIcon,
    FileCode,
    Moon,
    Sun,
    Database,
    Network,
    FileJson,
    FolderOpen,
    Clock
} from 'lucide-react';
import { useERDStore } from '../../store/useERDStore';
import * as htmlToImage from 'html-to-image';
import { generateSQL } from '../../lib/sqlGenerator';

const Header = () => {
    const { addEntity, project, importProject, updateProjectMetadata, autoLayout, setTheme, loadProject } = useERDStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [savedProjects, setSavedProjects] = useState<any[]>([]);

    // Stats
    const totalEntities = project.entities.length;
    const totalRelationships = project.relationships.length;

    useEffect(() => {
        if (isMenuOpen) {
            fetchProjects();
        }
    }, [isMenuOpen]);

    const fetchProjects = async () => {
        try {
            const response = await fetch('http://localhost:8085/api/projects');
            if (response.ok) {
                const data = await response.json();
                setSavedProjects(data);
            }
        } catch (err) {
            console.error('Failed to fetch projects:', err);
        }
    };

    const handleAddTable = () => {
        addEntity({
            name: `table_${totalEntities + 1}`,
            position: { x: 100 + Math.random() * 50, y: 100 + Math.random() * 50 },
            fields: [
                {
                    id: crypto.randomUUID(),
                    name: 'id',
                    type: 'INT',
                    constraints: { primaryKey: true, unique: true, notNull: true, autoIncrement: true },
                    ui: { order: 0 }
                }
            ]
        });
    };

    const handleExportJSON = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        const fileName = (project.metadata.name || 'Untitled_Project').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        downloadAnchorNode.setAttribute("download", `${fileName}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        setIsMenuOpen(false);
    };

    const handleExportSQL = () => {
        const sql = generateSQL(project);
        const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(sql);
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        const fileName = (project.metadata.name || 'Untitled_Project').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        downloadAnchorNode.setAttribute("download", `${fileName}.sql`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        setIsMenuOpen(false);
    };

    const handleExportPNG = async () => {
        const canvasElement = document.querySelector('.react-flow__viewport') as HTMLElement;
        if (!canvasElement) return;

        try {
            const dataUrl = await htmlToImage.toPng(canvasElement, {
                backgroundColor: project.theme.mode === 'dark' ? '#09090b' : '#ffffff',
                style: {
                    transform: 'scale(1)',
                }
            });

            const fileName = (project.metadata.name || 'Untitled_Project').replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataUrl);
            downloadAnchorNode.setAttribute("download", `${fileName}.png`);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            setIsMenuOpen(false);
        } catch (error) {
            console.error('Export PNG failed:', error);
            alert('Failed to export PNG. Please try again.');
        }
    };

    const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                importProject(json);
                setIsMenuOpen(false);
            } catch (err) {
                alert("Failed to parse JSON file. Please ensure it's a valid ERD backup.");
            }
        };
        reader.readAsText(file);
    };

    const toggleTheme = () => {
        setTheme(project.theme.mode === 'dark' ? 'light' : 'dark');
    };

    return (
        <header className="h-14 bg-card/80 backdrop-blur-md border-b flex items-center justify-between px-4 z-20 shadow-sm relative shrink-0">
            {/* Left: Logo & Title & Stats */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.location.reload()}>
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 transform -rotate-3 transition-transform group-hover:rotate-0">
                        <div className="text-primary-foreground font-black text-xs">ERD</div>
                    </div>
                    <span className="font-extrabold text-lg tracking-tight hidden lg:block">Designer</span>
                </div>

                <div className="h-6 w-px bg-border hidden sm:block" />

                <div className="flex items-center gap-4">
                    {/* Project Name */}
                    <input
                        type="text"
                        value={project.metadata.name}
                        onChange={(e) => updateProjectMetadata({ name: e.target.value })}
                        placeholder="Project Name..."
                        className="bg-transparent hover:bg-muted/50 focus:bg-muted border border-transparent focus:border-primary/20 rounded-md px-3 py-1 text-sm font-bold outline-none transition-all w-48 truncate"
                    />

                    {/* Stats */}
                    <div className="hidden md:flex items-center gap-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                        <div className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-md border border-border/50">
                            <Database className="w-3 h-3 text-primary" />
                            <span>{totalEntities} <span className="opacity-50">Tables</span></span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-md border border-border/50">
                            <Network className="w-3 h-3 text-emerald-500" />
                            <span>{totalRelationships} <span className="opacity-50">Relations</span></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Tools */}
            <div className="flex items-center gap-2">
                <button
                    onClick={handleAddTable}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-xs font-bold transition-all shadow-md shadow-primary/20 active:scale-95"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">New Table</span>
                </button>

                <button
                    onClick={autoLayout}
                    className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition-colors"
                    title="Auto Layout"
                >
                    <LayoutTemplate className="w-4 h-4" />
                </button>

                <button
                    onClick={toggleTheme}
                    className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition-colors"
                    title="Toggle Theme"
                >
                    {project.theme.mode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                <div className="h-6 w-px bg-border mx-1" />

                {/* File Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`flex items-center gap-2 px-3 py-1.5 border border-border hover:bg-muted/50 rounded-md text-xs font-medium transition-all ${isMenuOpen ? 'bg-muted' : ''}`}
                    >
                        <span>Projects</span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isMenuOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setIsMenuOpen(false)}
                            />
                            <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-lg shadow-xl z-20 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 uppercase tracking-tighter">
                                <div className="px-3 py-2 text-[10px] font-black text-muted-foreground/50 border-b border-border/50 mb-1">
                                    Saved In /Projects
                                </div>
                                <div className="max-h-48 overflow-y-auto px-1">
                                    {savedProjects.length === 0 ? (
                                        <div className="px-3 py-4 text-center text-[10px] text-muted-foreground italic">
                                            No projects found in projects/ folder
                                        </div>
                                    ) : (
                                        savedProjects.map((p) => (
                                            <button
                                                key={p.name}
                                                onClick={() => {
                                                    loadProject(p.name);
                                                    setIsMenuOpen(false);
                                                }}
                                                className="w-full text-left px-3 py-2 hover:bg-primary/10 rounded-md text-xs flex flex-col gap-0.5 transition-colors group"
                                            >
                                                <div className="flex items-center gap-2 font-bold group-hover:text-primary">
                                                    <FolderOpen className="w-3 h-3" />
                                                    <span className="truncate">{p.name.replace('.json', '')}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
                                                    <Clock className="w-2.5 h-2.5" />
                                                    <span>{new Date(p.modified).toLocaleString()}</span>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>

                                <div className="px-3 py-2 text-[10px] font-black text-muted-foreground/50 border-y border-border/50 my-1">
                                    Local Operations
                                </div>
                                <button
                                    onClick={handleExportJSON}
                                    className="w-full text-left px-4 py-2 hover:bg-primary/10 hover:text-primary text-xs flex items-center gap-3 transition-colors"
                                >
                                    <FileJson className="w-4 h-4 opacity-70" />
                                    <span>Download JSON <span className="opacity-50 ml-auto">.json</span></span>
                                </button>

                                <label className="w-full text-left px-4 py-2 hover:bg-primary/10 hover:text-primary text-xs flex items-center gap-3 transition-colors cursor-pointer">
                                    <Upload className="w-4 h-4 opacity-70" />
                                    <span>Upload JSON <span className="opacity-50 ml-auto">.json</span></span>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".json"
                                        onChange={handleImportJSON}
                                        className="hidden"
                                    />
                                </label>

                                <div className="px-3 py-2 text-[10px] font-black text-muted-foreground/50 border-y border-border/50 my-1">
                                    Export & Generate
                                </div>

                                <button
                                    onClick={handleExportSQL}
                                    className="w-full text-left px-4 py-2 hover:bg-primary/10 hover:text-primary text-xs flex items-center gap-3 transition-colors font-semibold"
                                >
                                    <FileCode className="w-4 h-4 text-emerald-500" />
                                    <span>Export SQL <span className="opacity-50 ml-auto text-[9px]">DDL</span></span>
                                </button>

                                <button
                                    onClick={handleExportPNG}
                                    className="w-full text-left px-4 py-2 hover:bg-primary/10 hover:text-primary text-xs flex items-center gap-3 transition-colors"
                                >
                                    <ImageIcon className="w-4 h-4 text-indigo-500" />
                                    <span>Export Image <span className="opacity-50 ml-auto text-[9px]">.png</span></span>
                                </button>

                                <div className="h-px bg-border my-1" />

                                <div className="px-4 py-2 flex items-center justify-between text-[10px] text-muted-foreground font-mono font-bold">
                                    <span>Designer v2.0</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
