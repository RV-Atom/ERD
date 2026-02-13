import dagre from 'dagre';
import { Entity, Relationship } from '../types';

export const calculateLayout = (entities: Entity[], relationships: Relationship[]) => {
    const g = new dagre.graphlib.Graph();

    // Set default edge label alignment and rank direction
    g.setGraph({
        rankdir: 'LR', // Left to right
        nodesep: 80,
        ranksep: 100,
        marginx: 50,
        marginy: 50,
    });

    g.setDefaultEdgeLabel(() => ({}));

    // Add nodes to the graph
    entities.forEach((entity) => {
        // We assume a base size for each entity node. 
        // In a real app we might measure the actual DOM element.
        const height = 100 + (entity.fields.length * 40);
        g.setNode(entity.id, { width: 250, height });
    });

    // Add edges to the graph
    relationships.forEach((rel) => {
        g.setEdge(rel.source.entityId, rel.target.entityId);
    });

    // Run layout algorithm
    dagre.layout(g);

    // Return updated positions
    return entities.map((entity) => {
        const node = g.node(entity.id);
        return {
            ...entity,
            position: {
                x: node.x - 125, // Center the node
                y: node.y - (50 + (entity.fields.length * 20)),
            },
        };
    });
};
