import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    Panel,
    Node,
    Edge,
    OnNodesChange,
    OnEdgesChange,
    Connection,
    XYPosition,
    BackgroundVariant,
} from 'reactflow';
import { useERDStore } from '../store/useERDStore';
import EntityNode from './EntityNode';

const nodeTypes = {
    entity: EntityNode,
};

const Canvas = () => {
    const project = useERDStore((state: any) => state.project);
    const selectedNodes = useERDStore((state: any) => state.selectedNodes);
    const selectedEdges = useERDStore((state: any) => state.selectedEdges);
    const setSelectedNodes = useERDStore((state: any) => state.setSelectedNodes);
    const setSelectedEdges = useERDStore((state: any) => state.setSelectedEdges);
    const updateEntity = useERDStore((state: any) => state.updateEntity);
    const addRelationship = useERDStore((state: any) => state.addRelationship);
    const deleteRelationship = useERDStore((state: any) => state.deleteRelationship);
    const deleteEntity = useERDStore((state: any) => state.deleteEntity);

    const setInspectingEntityId = useERDStore((state: any) => state.setInspectingEntityId);

    const nodes: Node[] = useMemo(() => project.entities.map((entity: any) => ({
        id: entity.id,
        type: 'entity',
        position: entity.position,
        selected: selectedNodes.includes(entity.id),
        dragHandle: '.entity-header',
        data: {
            name: entity.name,
            fields: entity.fields,
            color: entity.color,
            collapsed: entity.collapsed
        },
    })), [project.entities, selectedNodes]);

    const edges: Edge[] = useMemo(() => project.relationships.map((rel: any) => ({
        id: rel.id,
        source: rel.source.entityId,
        target: rel.target.entityId,
        sourceHandle: `${rel.source.entityId}-${rel.source.fieldId}-out`,
        targetHandle: `${rel.target.entityId}-${rel.target.fieldId}-in`,
        type: rel.visual.edgeType,
        animated: rel.visual.animated,
        label: rel.visual.label,
        selected: selectedEdges.includes(rel.id),
        style: { stroke: rel.visual.color || '#3b82f6', strokeWidth: 2 },
    })), [project.relationships, selectedEdges]);

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        setInspectingEntityId(node.id);
    }, [setInspectingEntityId]);

    const onSelectionChange = useCallback(
        ({ nodes, edges }: { nodes: Node[], edges: Edge[] }) => {
            setSelectedNodes(nodes.map(n => n.id));
            setSelectedEdges(edges.map(e => e.id));
        },
        [setSelectedNodes, setSelectedEdges]
    );

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => {
            changes.forEach(change => {
                if (change.type === 'position' && change.position) {
                    updateEntity(change.id, { position: change.position as XYPosition });
                } else if (change.type === 'remove') {
                    deleteEntity(change.id);
                }
            });
        },
        [updateEntity, deleteEntity]
    );


    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => {
            changes.forEach(change => {
                if (change.type === 'remove') {
                    deleteRelationship(change.id);
                }
            });
        },
        [deleteRelationship]
    );

    const onConnect = useCallback(
        (params: Connection) => {
            if (!params.source || !params.target || !params.sourceHandle || !params.targetHandle) return;

            // Extract Field IDs robustly. 
            // Handle format: "${EntityID}-${FieldID}-${Type}"
            // We know EntityID comes from params.source/target.
            // We know Type is 'in' or 'out'.

            const getFieldId = (handleId: string, entityId: string) => {
                if (!handleId.startsWith(entityId + '-')) return null;
                // Remove prefix "EntityID-"
                const suffix = handleId.slice(entityId.length + 1);
                // Remove suffix "-in" or "-out"
                const lastDash = suffix.lastIndexOf('-');
                if (lastDash === -1) return null;
                return suffix.substring(0, lastDash);
            };

            const sourceFieldId = getFieldId(params.sourceHandle, params.source);
            const targetFieldId = getFieldId(params.targetHandle, params.target);

            if (!sourceFieldId || !targetFieldId) {
                console.error("Could not parse field IDs from handles", params);
                return;
            }

            addRelationship({
                source: {
                    entityId: params.source,
                    fieldId: sourceFieldId,
                    cardinality: '1'
                },
                target: {
                    entityId: params.target,
                    fieldId: targetFieldId,
                    cardinality: 'N'
                },
                visual: {
                    edgeType: 'bezier',
                    animated: true,
                    color: '#3b82f6'
                }
            });
        },
        [addRelationship]
    );

    return (
        <div className="w-full h-full" tabIndex={0}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onSelectionChange={onSelectionChange}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                fitView
                deleteKeyCode={['Backspace', 'Delete']}
            >
                <Background
                    variant={project.canvas.showGrid ? (project.theme.mode === 'dark' ? BackgroundVariant.Dots : BackgroundVariant.Lines) : BackgroundVariant.Dots}
                    gap={project.canvas.gridSize}
                />
                <Controls />
                {project.canvas.showMinimap && <MiniMap />}
            </ReactFlow>
        </div>
    );
};

export default Canvas;
