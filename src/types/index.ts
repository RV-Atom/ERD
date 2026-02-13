export type EdgeType = 'bezier' | 'smoothstep' | 'step' | 'straight';

export type DataType =
    | 'INT' | 'BIGINT' | 'SMALLINT' | 'TINYINT'
    | 'VARCHAR' | 'CHAR' | 'TEXT' | 'MEDIUMTEXT' | 'LONGTEXT'
    | 'DECIMAL' | 'FLOAT' | 'DOUBLE'
    | 'DATE' | 'DATETIME' | 'TIMESTAMP' | 'TIME'
    | 'BOOLEAN' | 'BIT'
    | 'BINARY' | 'VARBINARY' | 'BLOB'
    | 'JSON' | 'JSONB'
    | 'UUID'
    | 'ENUM';

export interface ForeignKey {
    targetEntity: string;
    targetField: string;
    onDelete: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
    onUpdate: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
}

export interface Field {
    id: string;
    name: string;
    type: DataType;
    length?: number;
    precision?: number;
    scale?: number;

    constraints: {
        primaryKey: boolean;
        foreignKey?: ForeignKey;
        unique: boolean;
        notNull: boolean;
        autoIncrement: boolean;
        defaultValue?: string | number | boolean;
        check?: string;
    };

    ui: {
        order: number;
        icon?: string;
        color?: string;
    };
}

export interface Index {
    name: string;
    fields: string[];
    type: 'BTREE' | 'HASH' | 'FULLTEXT' | 'SPATIAL';
    unique: boolean;
}

export interface Entity {
    id: string;
    name: string;
    position: { x: number; y: number };
    fields: Field[];
    collapsed: boolean;
    color?: string;
    notes?: string;
    metadata?: {
        schemaName?: string;
        tablespace?: string;
        indexes?: Index[];
    };
}

export interface Relationship {
    id: string;
    type: '1:1' | '1:N' | 'N:1' | 'N:N';

    source: {
        entityId: string;
        fieldId: string;
        cardinality: '1' | 'N';
    };

    target: {
        entityId: string;
        fieldId: string;
        cardinality: '1' | 'N';
    };

    visual: {
        edgeType: EdgeType;
        animated: boolean;
        color?: string;
        label?: string;
        labelPosition?: number;
    };

    foreignKey?: ForeignKey;
}

export interface ERDProject {
    version: string;
    metadata: {
        id: string;
        name: string;
        description?: string;
        author?: string;
        created: string; // Using string for Date serialization
        modified: string;
        tags?: string[];
    };

    canvas: {
        zoom: number;
        centerX: number;
        centerY: number;
        snapToGrid: boolean;
        gridSize: number;
        showMinimap: boolean;
        showGrid: boolean;
    };

    entities: Entity[];
    relationships: Relationship[];

    theme: {
        mode: 'light' | 'dark';
        primaryColor: string;
        entityColors: Record<string, string>;
    };

    settings: {
        autoSave: boolean;
        autoSaveInterval: number;
        defaultDataType: DataType;
        connectionStyle: EdgeType;
    };
}
