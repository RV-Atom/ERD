import React from 'react';
import { Handle, Position } from 'reactflow';
import { Key, Link, Hash, Type, Star, MoreVertical } from 'lucide-react';
import { Field } from '../types';

interface EntityNodeProps {
    data: {
        name: string;
        fields: Field[];
        color?: string;
        collapsed?: boolean;
    };
    id: string;
    selected?: boolean;
}

const EntityNode = ({ data, id, selected }: EntityNodeProps) => {
    return (
        <div className={`
      relative min-w-[220px] bg-card border rounded-xl shadow-xl transition-all duration-200
      ${selected ? 'ring-2 ring-primary border-primary shadow-primary/20' : 'border-border'}
    `}>
            {/* Accent strip */}
            <div
                className="absolute top-0 left-0 right-0 h-1.5 rounded-t-xl"
                style={{ backgroundColor: data.color || 'var(--primary)' }}
            />

            <div className="entity-header flex justify-between items-center p-3 pt-4 border-b bg-muted/20">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color || 'var(--primary)' }} />
                    <span className="font-bold text-sm tracking-tight text-foreground">{data.name}</span>
                </div>
                <button className="p-1 hover:bg-muted rounded text-muted-foreground transition-colors">
                    <MoreVertical className="w-3.5 h-3.5" />
                </button>
            </div>

            {!data.collapsed && (
                <div className="py-2">
                    {data.fields.map((field) => (
                        <div key={field.id} className="field-row group relative px-3 py-1.5 flex items-center justify-between hover:bg-muted/50 transition-colors">
                            {/* Target Handle (Left) */}
                            <Handle
                                type="target"
                                position={Position.Left}
                                id={`${id}-${field.id}-in`}
                                className="!bg-primary transition-transform hover:!bg-foreground z-10"
                            />

                            <div className="flex items-center gap-3 overflow-hidden">
                                {field.constraints.primaryKey ? (
                                    <Key className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                ) : field.constraints.foreignKey ? (
                                    <Link className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                ) : (
                                    <Hash className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                                )}

                                <span className="truncate text-sm font-semibold text-foreground">{field.name}</span>
                            </div>

                            <div className="flex items-center gap-2 pl-2 text-right shrink-0">
                                <span className="text-[10px] font-mono text-foreground/90 bg-muted/80 px-1.5 py-0.5 rounded uppercase font-bold border border-border/50">
                                    {field.type}
                                </span>

                                {/* Source Handle (Right) */}
                                <Handle
                                    type="source"
                                    position={Position.Right}
                                    id={`${id}-${field.id}-out`}
                                    className="!bg-primary transition-transform hover:!bg-foreground z-10"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {data.fields.length === 0 && !data.collapsed && (
                <div className="p-6 text-center text-xs text-muted-foreground/60 italic">
                    No fields defined
                </div>
            )}

            {/* Connection Indicator when Selected */}
            {selected && (
                <div className="absolute -inset-1 border border-primary/30 rounded-[13px] -z-10 animate-pulse" />
            )}
        </div>
    );
};

export default EntityNode;
