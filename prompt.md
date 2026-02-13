urved connectors and column-level lineage tracking
text

# MASTER PROMPT: ERD Designer Application - Complete Implementation

Generate a fully functional Entity-Relationship Diagram (ERD) designer web application with the following comprehensive specifications:

---

## 🎯 CORE REQUIREMENTS

### Technology Stack
- **Framework**: React 18 with TypeScript + Vite
- **Diagram Library**: ReactFlow (for nodes, edges, and curved connections)
- **State Management**: Zustand with Immer middleware
- **Styling**: Tailwind CSS v3
- **Icons**: Lucide React
- **Storage**: localForage (localStorage + IndexedDB fallback)
- **Export**: 
  - Images: html2canvas + dom-to-image
  - PDF: jsPDF
  - SVG: Native ReactFlow export
  - ZIP: JSZip
- **Build Tool**: Vite with PWA plugin
- **Type Safety**: Full TypeScript support

---

## 🎨 UI LAYOUT & DESIGN

### Layout Structure (3-Column Responsive)
```
┌──────────────┬────────────────────────────┬──────────────────┐
│   TOOLBAR    │                            │   PROPERTIES     │
│   (Left)     │        CANVAS              │   PANEL          │
│              │      (ReactFlow)           │   (Right)        │
│ - Add Table  │                            │                  │
│ - Tools      │  [Table: Users]            │  Selected:       │
│ - Data Types │  ┌────────────────┐        │  Table: Users    │
│ - Export     │  │ 🔑 id: INT     │        │  ┌─────────────┐ │
│              │  │ 📧 email: TEXT │───╮    │  │ Field Editor│ │
│              │  │ 👤 name: TEXT  │   │    │  │ - Name      │ │
│              │  └────────────────┘   │    │  │ - Type      │ │
│              │                       │    │  │ - PK/FK     │ │
│              │  [Table: Orders]      │    │  │ - Required  │ │
│              │  ┌────────────────┐   │    │  └─────────────┘ │
│              │  │ 🔑 id: INT     │   │    │                  │
│              │  │ 🔗 user_id ────┼───╯    │  [Relationships] │
│              │  │ 💰 total       │        │  user.id →       │
│              │  └────────────────┘        │  orders.user_id  │
└──────────────┴────────────────────────────┴──────────────────┘
│                     STATUS BAR                                │
│ Entities: 12 | Relationships: 8 | Auto-save: ON | Zoom: 100% │
└──────────────────────────────────────────────────────────────┘
```

### Visual Design Requirements
1. **Dark Mode Default** with light mode toggle
2. **Curved Connectors**: Use ReactFlow's bezier/smooth step edges
3. **Animated Connections**: Smooth transitions when dragging
4. **Grid Background**: Dotted or lined grid (toggleable)
5. **Minimap**: Small overview in bottom-right corner
6. **Controls**: Zoom, fit view, lock/unlock buttons

---

## 🔄 CURVED CONNECTORS & LINEAGE TRACKING

### Connection Types
```typescript
type EdgeType = 'bezier' | 'smoothstep' | 'step' | 'straight';

interface ColumnConnection {
  id: string;
  type: EdgeType; // Default: 'bezier' for curved lines
  source: string; // Entity ID
  sourceHandle: string; // Column/field ID
  target: string; // Entity ID
  targetHandle: string; // Column/field ID
  label?: string; // Relationship label (1:1, 1:N, etc.)
  animated?: boolean; // Animated flow direction
  style?: {
    stroke: string; // Line color
    strokeWidth: number;
    strokeDasharray?: string; // Dashed lines
  };
  data: {
    relationshipType: '1:1' | '1:N' | 'N:1' | 'N:N';
    onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
    onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
  };
}
```

### Column-Level Lineage Features
1. **Visual Connectors**: Draw from specific column handles (small dots on each field)
2. **Hover Effects**: Highlight all related columns when hovering over a field
3. **Path Highlighting**: Show full lineage path (upstream and downstream)
4. **Multiple Connections**: One column can connect to multiple targets
5. **Color Coding**: Different colors for PK→FK, FK→FK, regular relationships
6. **Connection Labels**: Show cardinality and constraint info on hover

### Implementation Details for ReactFlow
```typescript
// Each table entity has handles for each field
const EntityNode = ({ data }) => {
  return (
    <div className="entity-node">
      <div className="entity-header">{data.name}</div>
      {data.fields.map((field, index) => (
        <div key={field.id} className="field-row">
          {/* Left handle for incoming connections */}
          <Handle
            type="target"
            position={Position.Left}
            id={`${data.id}-${field.id}-in`}
            style={{ top: calculateHandlePosition(index) }}
          />
          
          {/* Field display */}
          <span>{field.icon} {field.name}: {field.type}</span>
          
          {/* Right handle for outgoing connections */}
          <Handle
            type="source"
            position={Position.Right}
            id={`${data.id}-${field.id}-out`}
            style={{ top: calculateHandlePosition(index) }}
          />
        </div>
      ))}
    </div>
  );
};

// Connection configuration
const edgeTypes = {
  bezier: BezierEdge, // Smooth curved lines
  smoothstep: SmoothStepEdge, // Step-like curves
  custom: CustomColumnEdge, // Custom with labels
};

const defaultEdgeOptions = {
  type: 'bezier',
  animated: false,
  style: { stroke: '#3b82f6', strokeWidth: 2 },
  markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
};
```

---

## 📊 DATA MODEL

### Complete TypeScript Interfaces
```typescript
// Main application state
interface ERDProject {
  version: string; // '2.0'
  metadata: {
    id: string;
    name: string;
    description?: string;
    author?: string;
    created: Date;
    modified: Date;
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
    entityColors: Record<string, string>; // Entity-specific colors
  };
  
  settings: {
    autoSave: boolean;
    autoSaveInterval: number; // milliseconds
    defaultDataType: string;
    connectionStyle: 'bezier' | 'smoothstep' | 'step' | 'straight';
  };
}

// Entity (Table) definition
interface Entity {
  id: string; // UUID
  name: string;
  position: { x: number; y: number };
  fields: Field[];
  collapsed: boolean; // Show/hide fields
  color?: string; // Custom background color
  notes?: string; // Developer notes
  metadata?: {
    schemaName?: string; // e.g., 'public', 'auth'
    tablespace?: string;
    indexes?: Index[];
  };
}

// Field (Column) definition
interface Field {
  id: string; // UUID
  name: string;
  type: DataType;
  length?: number; // VARCHAR(length)
  precision?: number; // DECIMAL(precision, scale)
  scale?: number;
  
  constraints: {
    primaryKey: boolean;
    foreignKey?: ForeignKey;
    unique: boolean;
    notNull: boolean;
    autoIncrement: boolean;
    defaultValue?: string | number | boolean;
    check?: string; // CHECK constraint SQL
  };
  
  ui: {
    order: number; // Display order in table
    icon?: string; // Custom icon
    color?: string; // Highlight color
  };
}

// Foreign key relationship
interface ForeignKey {
  targetEntity: string; // Entity ID
  targetField: string; // Field ID
  onDelete: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
  onUpdate: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
}

// Relationship (visual connection)
interface Relationship {
  id: string;
  type: '1:1' | '1:N' | 'N:1' | 'N:N';
  
  source: {
    entityId: string;
    fieldId: string; // Specific column
  };
  
  target: {
    entityId: string;
    fieldId: string; // Specific column
  };
  
  visual: {
    edgeType: 'bezier' | 'smoothstep' | 'step' | 'straight';
    animated: boolean;
    color?: string;
    label?: string;
    labelPosition?: number; // 0.0 to 1.0 along edge
  };
  
  foreignKey?: ForeignKey; // Associated FK constraint
}

// Data types
type DataType = 
  | 'INT' | 'BIGINT' | 'SMALLINT' | 'TINYINT'
  | 'VARCHAR' | 'CHAR' | 'TEXT' | 'MEDIUMTEXT' | 'LONGTEXT'
  | 'DECIMAL' | 'FLOAT' | 'DOUBLE'
  | 'DATE' | 'DATETIME' | 'TIMESTAMP' | 'TIME'
  | 'BOOLEAN' | 'BIT'
  | 'BINARY' | 'VARBINARY' | 'BLOB'
  | 'JSON' | 'JSONB'
  | 'UUID'
  | 'ENUM';

// Index definition
interface Index {
  name: string;
  fields: string[]; // Field IDs
  type: 'BTREE' | 'HASH' | 'FULLTEXT' | 'SPATIAL';
  unique: boolean;
}
```

---

## ✨ CORE FEATURES

### 1. Entity Management
- **Create**: Click "Add Table" button or drag from toolbar
- **Edit**: Double-click entity or select and edit in properties panel
- **Delete**: Select and press Delete key or use context menu
- **Duplicate**: Ctrl+D on selected entity
- **Move**: Drag anywhere on the canvas
- **Resize**: Auto-resize based on field count
- **Collapse/Expand**: Toggle field visibility
- **Color**: Custom color picker for each entity
- **Notes**: Add markdown-formatted notes

### 2. Field Management (Column-Level)
- **Add Field**: Click "+" button in entity or properties panel
- **Edit Field**: Click on field in properties panel
- **Reorder**: Drag-and-drop fields to reorder
- **Delete**: Click "-" button next to field
- **Bulk Edit**: Select multiple fields and edit simultaneously
- **Quick Types**: Click data type to see common options
- **Constraints**: Toggle PK, FK, Unique, Not Null, Auto-increment
- **Default Values**: Set default values for fields

### 3. Relationship Creation (Column-to-Column)
```
Method 1: Drag from Handle
1. Hover over a field to reveal connection handles
2. Click and drag from right handle (source column)
3. Drag to left handle of target column
4. Release to create curved connection
5. Auto-detect relationship type based on constraints

Method 2: Properties Panel
1. Select source entity
2. Click field to edit
3. Check "Foreign Key" checkbox
4. Select target table and column from dropdown
5. Connection auto-created with bezier curve

Method 3: Quick Connect
1. Select two entities (Ctrl+Click)
2. Click "Create Relationship" button
3. Choose source and target columns from modal
4. Set cardinality and constraints
5. Curved connection appears
```

### 4. Visual Lineage Tracking
- **Hover Mode**: Hover over any field to highlight:
  - Direct relationships (immediate connections)
  - Upstream lineage (where data comes from)
  - Downstream lineage (where data flows to)
  - Path shown with different colors/intensities
  
- **Selection Mode**: Click field to lock highlight
  - Shows lineage panel with table/column list
  - Tree view of dependencies
  - Option to navigate to related entities
  
- **Visual Indicators**:
  - 🔑 Primary Key (gold icon)
  - 🔗 Foreign Key (blue icon with link)
  - ⚡ Indexed field (lightning icon)
  - 🔒 Unique constraint (lock icon)
  - ⚠️ Required/Not Null (red asterisk)

### 5. Canvas Interactions
- **Pan**: Click and drag on empty space OR hold Space + drag
- **Zoom**: Mouse wheel OR Ctrl+Plus/Minus OR pinch gesture
- **Select**: Click entity OR drag selection box
- **Multi-Select**: Ctrl+Click OR drag selection box
- **Fit View**: Zoom to fit all entities in viewport
- **Reset View**: Return to default zoom and position
- **Grid Snap**: Toggle snap-to-grid (10px, 20px, or 50px)
- **Alignment**: Align selected entities (left, right, top, bottom, center)

### 6. Auto-Layout Algorithms
```typescript
interface LayoutOptions {
  algorithm: 'force' | 'hierarchical' | 'circular' | 'grid';
  direction?: 'TB' | 'LR' | 'BT' | 'RL'; // Top-bottom, Left-right, etc.
  spacing: { x: number; y: number };
  animate: boolean; // Smooth transition
}

// Example layouts:
const layouts = {
  force: {
    // D3 force-directed layout
    // Good for: Complex schemas with many relationships
    strength: 0.5,
    distance: 200,
    iterations: 100
  },
  
  hierarchical: {
    // Layered layout (Sugiyama)
    // Good for: Parent-child relationships
    direction: 'TB',
    levelSeparation: 150,
    nodeSeparation: 100
  },
  
  circular: {
    // Circular layout
    // Good for: Showing equal importance
    radius: 300,
    startAngle: 0
  },
  
  grid: {
    // Grid layout
    // Good for: Many small tables
    columns: 4,
    spacing: { x: 250, y: 200 }
  }
};
```

### 7. Export Options
```typescript
interface ExportOptions {
  // 1. Image Exports
  png: {
    quality: 0.95,
    backgroundColor: '#ffffff' | 'transparent',
    scale: 1 | 2 | 3, // Retina support
    padding: number,
    includeOnlySelected: boolean
  };
  
  svg: {
    includeStyles: boolean,
    embedFonts: boolean,
    viewBox: boolean
  };
  
  pdf: {
    orientation: 'portrait' | 'landscape',
    format: 'a4' | 'letter' | 'a3',
    margin: number,
    title: string,
    author: string
  };
  
  // 2. Data Exports
  json: {
    pretty: boolean, // Formatted JSON
    includeMetadata: boolean,
    version: string
  };
  
  // 3. Code Generation
  sql: {
    dialect: 'postgres' | 'mysql' | 'sqlite' | 'mssql' | 'oracle',
    includeDropStatements: boolean,
    includeComments: boolean,
    includeIndexes: boolean
  };
  
  typescript: {
    style: 'interface' | 'type' | 'class',
    includeValidation: boolean, // Zod/Yup schemas
    includeComments: boolean
  };
  
  prisma: {
    includeRelations: boolean,
    datasourceProvider: 'postgresql' | 'mysql' | 'sqlite'
  };
  
  // 4. Package Export (.erdpkg as ZIP)
  package: {
    includePreview: boolean, // PNG preview image
    includeSQL: boolean,
    includeDocumentation: boolean, // Auto-generated MD
    includeViewer: boolean // Standalone HTML viewer
  };
  
  // 5. Shareable Link
  shareableLink: {
    compress: boolean, // LZ-string compression
    expiryDays?: number, // Optional expiry
    password?: string // Optional password protection
  };
}
```

### 8. Import Options
- **JSON**: Import .json or .erdpkg files
- **SQL**: Reverse-engineer from CREATE TABLE statements
- **CSV**: Import schema from CSV (table_name, column_name, data_type)
- **URL**: Import from shareable link (hash-based)
- **Clipboard**: Paste JSON or SQL

### 9. Keyboard Shortcuts
```typescript
const shortcuts = {
  // File operations
  'Ctrl+N': 'New diagram',
  'Ctrl+O': 'Open file',
  'Ctrl+S': 'Save/Export',
  'Ctrl+Shift+S': 'Save as...',
  
  // Edit operations
  'Ctrl+Z': 'Undo',
  'Ctrl+Y': 'Redo',
  'Ctrl+C': 'Copy selected',
  'Ctrl+X': 'Cut selected',
  'Ctrl+V': 'Paste',
  'Ctrl+D': 'Duplicate selected',
  'Delete': 'Delete selected',
  'Ctrl+A': 'Select all',
  
  // View operations
  'Ctrl+0': 'Reset zoom (100%)',
  'Ctrl++': 'Zoom in',
  'Ctrl+-': 'Zoom out',
  'Ctrl+F': 'Find entity/field',
  'Ctrl+G': 'Toggle grid',
  'Ctrl+M': 'Toggle minimap',
  
  // Entity operations
  'Ctrl+E': 'Add new entity',
  'Ctrl+R': 'Add relationship',
  'F2': 'Rename selected',
  'Ctrl+L': 'Auto-layout',
  
  // Navigation
  'Space+Drag': 'Pan canvas',
  'Arrow keys': 'Move selected entity',
  'Shift+Arrow': 'Move selected 10px',
  
  // Tools
  'Ctrl+/': 'Show keyboard shortcuts',
  'Ctrl+,': 'Settings',
  'Escape': 'Deselect all / Close panels'
};
```

---

## 🎛️ UI COMPONENTS BREAKDOWN

### Left Sidebar - Tools Panel
```tsx
<ToolsPanel>
  {/* Quick Actions */}
  <Section title="Quick Actions">
    <Button icon={Plus} onClick={addEntity}>Add Table</Button>
    <Button icon={Link} onClick={addRelationship}>Add Relationship</Button>
    <Button icon={Layout} onClick={autoLayout}>Auto Layout</Button>
  </Section>
  
  {/* Data Types Quick Reference */}
  <Section title="Data Types" collapsible>
    {dataTypes.map(type => (
      <DataTypeItem 
        key={type} 
        name={type} 
        draggable 
        onDragStart={handleDragDataType}
      />
    ))}
  </Section>
  
  {/* Templates */}
  <Section title="Templates" collapsible>
    <TemplateItem name="E-commerce" onClick={loadTemplate} />
    <TemplateItem name="Blog" onClick={loadTemplate} />
    <TemplateItem name="Social Media" onClick={loadTemplate} />
    <TemplateItem name="CRM" onClick={loadTemplate} />
  </Section>
  
  {/* Export */}
  <Section title="Export">
    <ExportButton format="json" icon={FileJson} />
    <ExportButton format="png" icon={Image} />
    <ExportButton format="pdf" icon={FileText} />
    <ExportButton format="sql" icon={Database} />
    <ExportButton format="package" icon={Package} />
  </Section>
</ToolsPanel>
```

### Center Canvas - ReactFlow
```tsx
<ReactFlow
  nodes={nodes}
  edges={edges}
  onNodesChange={onNodesChange}
  onEdgesChange={onEdgesChange}
  onConnect={onConnect}
  nodeTypes={nodeTypes}
  edgeTypes={edgeTypes}
  defaultEdgeOptions={defaultEdgeOptions}
  connectionMode="loose"
  snapToGrid={snapToGrid}
  snapGrid={[gridSize, gridSize]}
  fitView
  attributionPosition="bottom-right"
>
  <Background 
    variant={showGrid ? 'dots' : 'lines'} 
    gap={gridSize} 
    size={1}
    color={theme === 'dark' ? '#374151' : '#e5e7eb'}
  />
  
  <Controls 
    showZoom 
    showFitView 
    showInteractive
    position="top-right"
  />
  
  {showMinimap && (
    <MiniMap 
      position="bottom-right"
      nodeColor={node => node.data.color || '#3b82f6'}
      maskColor="rgba(0,0,0,0.1)"
    />
  )}
  
  <Panel position="top-left">
    <SearchBox placeholder="Search entities..." />
  </Panel>
</ReactFlow>
```

### Right Sidebar - Properties Panel
```tsx
<PropertiesPanel>
  {selectedNode ? (
    <>
      {/* Entity Properties */}
      <Section title="Table Properties">
        <Input 
          label="Table Name" 
          value={selectedNode.name}
          onChange={updateEntityName}
        />
        <ColorPicker 
          label="Color" 
          value={selectedNode.color}
          onChange={updateEntityColor}
        />
        <Textarea 
          label="Notes" 
          value={selectedNode.notes}
          placeholder="Add documentation..."
        />
      </Section>
      
      {/* Fields List */}
      <Section title="Fields">
        <FieldsList 
          fields={selectedNode.fields}
          onReorder={handleReorder}
          onEdit={handleEditField}
          onDelete={handleDeleteField}
        />
        <Button icon={Plus} onClick={addField}>Add Field</Button>
      </Section>
      
      {/* Relationships */}
      <Section title="Relationships" collapsible>
        <RelationshipsList 
          relationships={getEntityRelationships(selectedNode.id)}
          onEdit={editRelationship}
          onDelete={deleteRelationship}
        />
      </Section>
      
      {/* Indexes */}
      <Section title="Indexes" collapsible>
        <IndexesList indexes={selectedNode.metadata?.indexes} />
        <Button icon={Plus} onClick={addIndex}>Add Index</Button>
      </Section>
    </>
  ) : (
    <EmptyState 
      icon={Pointer}
      message="Select a table to edit properties"
    />
  )}
</PropertiesPanel>
```

### Field Editor Modal (for detailed editing)
```tsx
<FieldEditorModal field={editingField} onSave={saveField}>
  <Input label="Field Name" value={field.name} />
  
  <Select label="Data Type" value={field.type}>
    {dataTypes.map(type => <option key={type}>{type}</option>)}
  </Select>
  
  {/* Length/Precision for VARCHAR, DECIMAL */}
  {needsLength && (
    <Input label="Length" type="number" value={field.length} />
  )}
  
  {needsPrecision && (
    <>
      <Input label="Precision" type="number" value={field.precision} />
      <Input label="Scale" type="number" value={field.scale} />
    </>
  )}
  
  {/* Constraints */}
  <CheckboxGroup label="Constraints">
    <Checkbox label="Primary Key" checked={field.constraints.primaryKey} />
    <Checkbox label="Unique" checked={field.constraints.unique} />
    <Checkbox label="Not Null" checked={field.constraints.notNull} />
    <Checkbox label="Auto Increment" checked={field.constraints.autoIncrement} />
  </CheckboxGroup>
  
  {/* Foreign Key */}
  <ForeignKeyEditor 
    value={field.constraints.foreignKey}
    entities={entities}
    onChange={updateForeignKey}
  />
  
  {/* Default Value */}
  <Input label="Default Value" value={field.constraints.defaultValue} />
  
  {/* Check Constraint */}
  <Textarea 
    label="Check Constraint (SQL)" 
    value={field.constraints.check}
    placeholder="e.g., age >= 18"
  />
</FieldEditorModal>
```

---

## 🔧 PERSISTENCE & STATE

### Zustand Store Structure
```typescript
import create from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';

interface ERDStore {
  // Current project
  project: ERDProject;
  
  // UI state
  selectedNodes: string[];
  selectedEdges: string[];
  clipboard: { nodes: Node[]; edges: Edge[] } | null;
  
  // History for undo/redo
  history: {
    past: ERDProject[];
    future: ERDProject[];
  };
  
  // Actions
  addEntity: (entity: Partial<Entity>) => void;
  updateEntity: (id: string, updates: Partial<Entity>) => void;
  deleteEntity: (id: string) => void;
  
  addField: (entityId: string, field: Partial<Field>) => void;
  updateField: (entityId: string, fieldId: string, updates: Partial<Field>) => void;
  deleteField: (entityId: string, fieldId: string) => void;
  reorderFields: (entityId: string, oldIndex: number, newIndex: number) => void;
  
  addRelationship: (relationship: Partial<Relationship>) => void;
  updateRelationship: (id: string, updates: Partial<Relationship>) => void;
  deleteRelationship: (id: string) => void;
  
  // Canvas
  setZoom: (zoom: number) => void;
  setCenter: (x: number, y: number) => void;
  fitView: () => void;
  
  // Selection
  selectNode: (id: string, multi: boolean) => void;
  deselectAll: () => void;
  
  // History
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  
  // Persistence
  saveProject: () => Promise<void>;
  loadProject: (project: ERDProject) => void;
  exportProject: (format: ExportFormat) => Promise<Blob>;
  importProject: (file: File) => Promise<void>;
}

const useERDStore = create<ERDStore>()(
  persist(
    immer((set, get) => ({
      // Initial state
      project: createEmptyProject(),
      selectedNodes: [],
      selectedEdges: [],
      clipboard: null,
      history: { past: [], future: [] },
      
      // Implementation of actions...
      addEntity: (entity) => set((state) => {
        const newEntity = {
          id: generateId(),
          name: entity.name || 'New Table',
          position: entity.position || { x: 100, y: 100 },
          fields: entity.fields || [],
          collapsed: false,
          ...entity
        };
        state.project.entities.push(newEntity);
        state.saveToHistory();
      }),
      
      // ... more actions
    })),
    {
      name: 'erd-designer-storage',
      storage: localforage, // Uses IndexedDB
      partialize: (state) => ({
        project: state.project,
        // Don't persist UI state
      })
    }
  )
);
```

### Auto-Save Implementation
```typescript
// Auto-save hook
const useAutoSave = () => {
  const project = useERDStore(state => state.project);
  const saveProject = useERDStore(state => state.saveProject);
  
  useEffect(() => {
    const interval = setInterval(() => {
      saveProject();
      console.log('Auto-saved at', new Date().toLocaleTimeString());
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [project, saveProject]);
};
```

---

## 🎨 STYLING & THEMING

### Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        entity: {
          light: '#ffffff',
          dark: '#1f2937',
        }
      },
      animation: {
        'flow': 'flow 2s ease-in-out infinite',
      },
      keyframes: {
        flow: {
          '0%, 100%': { strokeDashoffset: '0' },
          '50%': { strokeDashoffset: '20' },
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
  ]
}
```

### Custom Entity Styles
```css
/* Entity node styling */
.entity-node {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2;
  min-width: 200px;
  max-width: 400px;
}

.entity-node.selected {
  @apply border-blue-500 ring-4 ring-blue-400 ring-opacity-50;
}

.entity-header {
  @apply bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-t-md font-semibold;
}

.field-row {
  @apply px-4 py-2 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer relative;
}

.field-row:last-child {
  @apply border-b-0;
}

/* Connection handle styling */
.react-flow__handle {
  @apply w-3 h-3 bg-blue-500 border-2 border-white dark:border-gray-800;
  opacity: 0;
  transition: opacity 0.2s;
}

.entity-node:hover .react-flow__handle,
.react-flow__handle.connecting {
  opacity: 1;
}

/* Curved edge styling */
.react-flow__edge path {
  @apply stroke-current;
  stroke-width: 2;
  transition: stroke-width 0.2s, stroke 0.2s;
}

.react-flow__edge.selected path,
.react-flow__edge:hover path {
  stroke-width: 3;
  @apply stroke-blue-600 dark:stroke-blue-400;
}

/* Animated flow */
.react-flow__edge.animated path {
  stroke-dasharray: 5;
  animation: flow 2s linear infinite;
}

/* Lineage highlighting */
.field-row.lineage-source {
  @apply bg-green-100 dark:bg-green-900;
}

.field-row.lineage-target {
  @apply bg-blue-100 dark:bg-blue-900;
}

.field-row.lineage-path {
  @apply bg-yellow-100 dark:bg-yellow-900;
}
```

---

## 📦 CODE GENERATION EXAMPLES

### SQL Generation
```typescript
function generateSQL(project: ERDProject, dialect: SQLDialect): string {
  const { entities, relationships } = project;
  
  const createTables = entities.map(entity => {
    const fields = entity.fields.map(field => {
      const parts = [field.name, field.type];
      
      if (field.length) parts[1] += `(${field.length})`;
      if (field.precision) parts[1] += `(${field.precision},${field.scale})`;
      
      if (field.constraints.primaryKey) parts.push('PRIMARY KEY');
      if (field.constraints.autoIncrement) parts.push('AUTO_INCREMENT');
      if (field.constraints.unique) parts.push('UNIQUE');
      if (field.constraints.notNull) parts.push('NOT NULL');
      if (field.constraints.defaultValue !== undefined) {
        parts.push(`DEFAULT ${formatDefaultValue(field.constraints.defaultValue)}`);
      }
      
      return '  ' + parts.join(' ');
    });
    
    // Add foreign keys
    const foreignKeys = entity.fields
      .filter(f => f.constraints.foreignKey)
      .map(f => {
        const fk = f.constraints.foreignKey!;
        const targetEntity = entities.find(e => e.id === fk.targetEntity);
        const targetField = targetEntity?.fields.find(f => f.id === fk.targetField);
        
        return `  FOREIGN KEY (${f.name}) REFERENCES ${targetEntity?.name}(${targetField?.name})
    ON DELETE ${fk.onDelete}
    ON UPDATE ${fk.onUpdate}`;
      });
    
    const allFields = [...fields, ...foreignKeys].join(',\n');
    
    return `CREATE TABLE ${entity.name} (\n${allFields}\n);`;
  });
  
  return createTables.join('\n\n');
}
```

### TypeScript Interface Generation
```typescript
function generateTypeScript(project: ERDProject): string {
  return project.entities.map(entity => {
    const fields = entity.fields.map(field => {
      const tsType = mapSQLTypeToTypeScript(field.type);
      const optional = !field.constraints.notNull ? '?' : '';
      return `  ${field.name}${optional}: ${tsType};`;
    });
    
    return `export interface ${entity.name} {
${fields.join('\n')}
}`;
  }).join('\n\n');
}

function mapSQLTypeToTypeScript(sqlType: DataType): string {
  const mapping: Record<string, string> = {
    'INT': 'number',
    'BIGINT': 'number',
    'VARCHAR': 'string',
    'TEXT': 'string',
    'BOOLEAN': 'boolean',
    'DATE': 'Date',
    'TIMESTAMP': 'Date',
    'JSON': 'unknown',
    // ... more mappings
  };
  
  return mapping[sqlType] || 'unknown';
}
```

### Prisma Schema Generation
```typescript
function generatePrismaSchema(project: ERDProject): string {
  const models = project.entities.map(entity => {
    const fields = entity.fields.map(field => {
      const parts = [field.name];
      
      // Type
      parts.push(mapSQLTypeToPrisma(field.type));
      
      // Modifiers
      const modifiers = [];
      if (field.constraints.primaryKey) modifiers.push('@id');
      if (field.constraints.autoIncrement) modifiers.push('@default(autoincrement())');
      if (field.constraints.unique) modifiers.push('@unique');
      if (!field.constraints.notNull) parts[1] += '?';
      
      if (modifiers.length) parts.push(modifiers.join(' '));
      
      return '  ' + parts.join(' ');
    });
    
    // Add relations
    const relations = project.relationships
      .filter(r => r.source.entityId === entity.id || r.target.entityId === entity.id)
      .map(r => {
        // Generate relation field
        const isSource = r.source.entityId === entity.id;
        const otherEntity = isSource ? 
          project.entities.find(e => e.id === r.target.entityId) :
          project.entities.find(e => e.id === r.source.entityId);
        
        const relationType = r.type === 'N:N' ? '[]' : '';
        return `  ${otherEntity?.name.toLowerCase()}${relationType} ${otherEntity?.name}${relationType}`;
      });
    
    const allFields = [...fields, ...relations].join('\n');
    
    return `model ${entity.name} {
${allFields}
}`;
  });
  
  return `// Prisma Schema
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

${models.join('\n\n')}`;
}
```

---

## 🚀 PWA CONFIGURATION

### manifest.json
```json
{
  "name": "ERD Designer - Entity Relationship Diagram Tool",
  "short_name": "ERD Designer",
  "description": "Create, edit, and export database schemas visually",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#111827",
  "theme_color": "#3b82f6",
  "orientation": "any",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "share_target": {
    "action": "/import",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url",
      "files": [
        {
          "name": "diagram",
          "accept": [".json", ".erd.json", ".erdpkg", "application/json"]
        }
      ]
    }
  },
  "file_handlers": [
    {
      "action": "/open",
      "accept": {
        "application/json": [".erd.json"],
        "application/zip": [".erdpkg"]
      }
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/desktop.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshots/mobile.png",
      "sizes": "750x1334",
      "type": "image/png"
    }
  ],
  "categories": ["productivity", "developer tools"],
  "shortcuts": [
    {
      "name": "New Diagram",
      "short_name": "New",
      "description": "Create a new ERD",
      "url": "/?action=new",
      "icons": [{ "src": "/icons/new.png", "sizes": "96x96" }]
    },
    {
      "name": "Open Recent",
      "short_name": "Recent",
      "description": "Open recent diagrams",
      "url": "/?action=recent",
      "icons": [{ "src": "/icons/recent.png", "sizes": "96x96" }]
    }
  ]
}
```

### Service Worker (vite-plugin-pwa)
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
      manifest: {
        // ... manifest config above
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      }
    })
  ]
});
```

---

## 📁 PROJECT STRUCTURE

```
erd-designer/
├── public/
│   ├── icons/
│   │   ├── icon-*.png
│   │   └── favicon.ico
│   ├── screenshots/
│   ├── manifest.json
│   └── robots.txt
│
├── src/
│   ├── components/
│   │   ├── Canvas/
│   │   │   ├── EntityNode.tsx
│   │   │   ├── CustomEdge.tsx
│   │   │   ├── CanvasControls.tsx
│   │   │   └── Minimap.tsx
│   │   │
│   │   ├── Panels/
│   │   │   ├── ToolsPanel.tsx
│   │   │   ├── PropertiesPanel.tsx
│   │   │   ├── FieldEditor.tsx
│   │   │   └── RelationshipEditor.tsx
│   │   │
│   │   ├── Toolbar/
│   │   │   ├── MainToolbar.tsx
│   │   │   ├── ExportMenu.tsx
│   │   │   └── LayoutControls.tsx
│   │   │
│   │   ├── Modals/
│   │   │   ├── FieldEditorModal.tsx
│   │   │   ├── ExportModal.tsx
│   │   │   ├── ImportModal.tsx
│   │   │   └── SettingsModal.tsx
│   │   │
│   │   └── UI/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Select.tsx
│   │       ├── Checkbox.tsx
│   │       └── ColorPicker.tsx
│   │
│   ├── stores/
│   │   ├── useERDStore.ts
│   │   ├── useUIStore.ts
│   │   └── useHistoryStore.ts
│   │
│   ├── hooks/
│   │   ├── useAutoSave.ts
│   │   ├── useKeyboardShortcuts.ts
│   │   ├── useLineageTracking.ts
│   │   └── useExport.ts
│   │
│   ├── utils/
│   │   ├── export/
│   │   │   ├── exportJSON.ts
│   │   │   ├── exportSQL.ts
│   │   │   ├── exportImage.ts
│   │   │   ├── exportPDF.ts
│   │   │   └── exportPackage.ts
│   │   │
│   │   ├── import/
│   │   │   ├── importJSON.ts
│   │   │   ├── importSQL.ts
│   │   │   └── parseSchema.ts
│   │   │
│   │   ├── codegen/
│   │   │   ├── generateTypeScript.ts
│   │   │   ├── generatePrisma.ts
│   │   │   └── generateSQL.ts
│   │   │
│   │   ├── layout/
│   │   │   ├── forceLayout.ts
│   │   │   ├── hierarchicalLayout.ts
│   │   │   └── gridLayout.ts
│   │   │
│   │   └── helpers/
│   │       ├── idGenerator.ts
│   │       ├── validators.ts
│   │       └── formatters.ts
│   │
│   ├── types/
│   │   ├── erd.types.ts
│   │   ├── export.types.ts
│   │   └── ui.types.ts
│   │
│   ├── constants/
│   │   ├── dataTypes.ts
│   │   ├── templates.ts
│   │   └── shortcuts.ts
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   ├── entity.css
│   │   └── edges.css
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── nginx.conf
│
├── docs/
│   ├── README.md
│   ├── USER_GUIDE.md
│   ├── API.md
│   └── DEPLOYMENT.md
│
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## 🎯 IMPLEMENTATION CHECKLIST

### Phase 1: Core Setup ✅
- [ ] Initialize Vite + React + TypeScript project
- [ ] Install dependencies (ReactFlow, Zustand, Tailwind, etc.)
- [ ] Set up Tailwind CSS with dark mode
- [ ] Create basic layout (3-column responsive)
- [ ] Set up Zustand store with persistence
- [ ] Create basic EntityNode component
- [ ] Implement canvas with ReactFlow

### Phase 2: Entity Management ✅
- [ ] Add entity creation (button + toolbar)
- [ ] Implement entity editing (properties panel)
- [ ] Field CRUD operations (add, edit, delete, reorder)
- [ ] Drag-and-drop entity positioning
- [ ] Entity selection and multi-select
- [ ] Copy, paste, duplicate functionality
- [ ] Delete entity with confirmation

### Phase 3: Relationships & Lineage ✅
- [ ] Create connection handles on each field
- [ ] Implement drag-to-connect from field to field
- [ ] Add curved bezier edges (ReactFlow)
- [ ] Relationship CRUD in properties panel
- [ ] Cardinality labels (1:1, 1:N, N:N)
- [ ] FK constraint configuration (ON DELETE, ON UPDATE)
- [ ] Hover effects for lineage highlighting
- [ ] Click to lock lineage view
- [ ] Show lineage path tree in panel

### Phase 4: Canvas Features ✅
- [ ] Pan (click-drag and Space+drag)
- [ ] Zoom (wheel, buttons, shortcuts)
- [ ] Grid background (toggleable)
- [ ] Snap-to-grid functionality
- [ ] Minimap component
- [ ] Fit view button
- [ ] Selection box drag
- [ ] Alignment tools (align left, right, etc.)

### Phase 5: Auto-Layout ✅
- [ ] Implement force-directed layout (D3)
- [ ] Implement hierarchical layout
- [ ] Implement circular layout
- [ ] Implement grid layout
- [ ] Layout animation/transition
- [ ] Layout settings modal

### Phase 6: Export Functionality ✅
- [ ] JSON export (pretty-printed)
- [ ] PNG export (html2canvas)
- [ ] SVG export (ReactFlow native)
- [ ] PDF export (jsPDF)
- [ ] SQL generation (multiple dialects)
- [ ] TypeScript interface generation
- [ ] Prisma schema generation
- [ ] Package export (.erdpkg ZIP file)
- [ ] Standalone HTML viewer export
- [ ] Shareable link generation

### Phase 7: Import Functionality ✅
- [ ] JSON import
- [ ] Package (.erdpkg) import
- [ ] SQL schema parsing and import
- [ ] CSV schema import
- [ ] URL hash import (shareable links)
- [ ] Drag-and-drop file import
- [ ] Validation and error handling

### Phase 8: UI Polish ✅
- [ ] Dark/light theme toggle
- [ ] Color customization per entity
- [ ] Icons for field types (PK, FK, etc.)
- [ ] Tooltips on all buttons
- [ ] Loading states
- [ ] Empty states
- [ ] Error messages and toasts
- [ ] Confirmation dialogs
- [ ] Context menus (right-click)

### Phase 9: Keyboard Shortcuts ✅
- [ ] Implement shortcut system
- [ ] File operations (Ctrl+N, Ctrl+O, Ctrl+S)
- [ ] Edit operations (Ctrl+Z, Ctrl+Y, Ctrl+C, etc.)
- [ ] View operations (Ctrl+0, Ctrl++, Ctrl+-)
- [ ] Navigation (Arrow keys, Space+drag)
- [ ] Shortcuts help modal (Ctrl+/)

### Phase 10: PWA & Performance ✅
- [ ] Add manifest.json
- [ ] Configure service worker (vite-plugin-pwa)
- [ ] Add app icons (multiple sizes)
- [ ] Test offline functionality
- [ ] Optimize bundle size
- [ ] Lazy load heavy components
- [ ] Virtual scrolling for large diagrams
- [ ] Debounce auto-save
- [ ] Performance profiling

### Phase 11: Templates & Examples ✅
- [ ] Create e-commerce template
- [ ] Create blog template
- [ ] Create social media template
- [ ] Create CRM template
- [ ] Template loader in UI
- [ ] Example diagrams in docs

### Phase 12: Documentation ✅
- [ ] README with quick start
- [ ] User guide with screenshots
- [ ] API documentation
- [ ] Deployment guide (Vercel, Netlify, Docker)
- [ ] Video tutorial (optional)
- [ ] FAQ section
- [ ] Changelog

### Phase 13: Testing & QA ✅
- [ ] Unit tests for utils
- [ ] Integration tests for store
- [ ] E2E tests with Playwright
- [ ] Cross-browser testing
- [ ] Mobile responsive testing
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Performance testing (Lighthouse)

### Phase 14: Deployment ✅
- [ ] Deploy to Vercel/Netlify
- [ ] Set up CI/CD pipeline
- [ ] Configure custom domain
- [ ] Set up analytics (optional)
- [ ] Create Docker image
- [ ] Publish to Docker Hub
- [ ] Write deployment docs

---

## 🔒 SECURITY & PRIVACY

- **No Backend**: All data stays in the browser
- **No Tracking**: No analytics without user consent
- **No Cloud Storage**: User controls their own data
- **Input Sanitization**: Prevent XSS in entity/field names
- **File Validation**: Validate imported files
- **Safe Exports**: Sanitize SQL and code generation

---

## 📊 SUCCESS CRITERIA

1. **Functionality**
   - ✅ Create entities with 20+ fields
   - ✅ Create column-to-column relationships
   - ✅ Curved, flexible connectors
   - ✅ Lineage tracking with highlighting
   - ✅ Export in 5+ formats
   - ✅ Import from JSON/SQL
   - ✅ Undo/redo 50+ steps
   - ✅ Auto-save every 30s

2. **Performance**
   - ✅ Initial load < 2 seconds
   - ✅ 60 FPS canvas interaction
   - ✅ Handle 100+ entities smoothly
   - ✅ Export < 5 seconds for large diagrams

3. **Usability**
   - ✅ Create first ERD in < 5 minutes
   - ✅ Connect two fields in < 3 clicks
   - ✅ Export diagram in < 2 clicks
   - ✅ Keyboard shortcuts for power users
   - ✅ Mobile responsive (view mode)

4. **Quality**
   - ✅ Zero data loss (auto-save)
   - ✅ WCAG 2.1 AA accessible
   - ✅ Works offline (PWA)
   - ✅ Cross-browser compatible
   - ✅ Clean, maintainable code

---

## 🎁 DELIVERABLES

1. **Source Code**
   - Complete React + TypeScript application
   - Well-structured, commented code
   - Git repository with meaningful commits
   - .gitignore and .env.example

2. **Documentation**
   - README.md with quick start
   - USER_GUIDE.md with screenshots
   - API.md for developers
   - DEPLOYMENT.md (Vercel, Netlify, Docker)
   - CHANGELOG.md

3. **Deployment**
   - Live demo URL (Vercel/Netlify)
   - Docker image (optional)
   - Docker Compose for self-hosting

4. **Assets**
   - App icons (multiple sizes)
   - Screenshots for PWA
   - Example ERD templates
   - Demo video (optional)

---

## 🚀 BONUS FEATURES (Optional)

1. **AI-Powered**
   - Generate ERD from natural language description
   - Suggest optimal indexes
   - Detect normalization issues
   - Auto-generate sample data

2. **Collaboration**
   - Generate shareable links (data in URL)
   - Export presentation mode (read-only viewer)
   - Comments on entities/fields
   - Version comparison

3. **Advanced Export**
   - Sequelize models
   - Django models
   - Rails migrations
   - GraphQL schema
   - Mermaid diagram

4. **Import Enhancement**
   - Import from PostgreSQL live database
   - Import from MySQL dump
   - Import from Excel spreadsheet
   - Import from Notion tables

5. **Visualization**
   - 3D view (optional)
   - Schema diff viewer
   - Data flow animation
   - ERD presentation mode

---

## 📝 NOTES FOR IMPLEMENTATION

1. **Use ReactFlow extensively** - It handles the heavy lifting for:
   - Node dragging
   - Edge routing (bezier curves)
   - Zoom/pan
   - Minimap
   - Selection
   - Connection validation

2. **Column-level connections** - Key implementation:
   ```tsx
   // Each field gets two handles (left=target, right=source)
   <Handle type="target" position={Position.Left} id={`field-${field.id}-in`} />
   <Handle type="source" position={Position.Right} id={`field-${field.id}-out`} />
   
   // Connect using specific handle IDs
   const edge = {
     source: 'entity-1',
     sourceHandle: 'field-123-out',
     target: 'entity-2',
     targetHandle: 'field-456-in',
     type: 'bezier' // Curved line
   };
   ```

3. **Lineage tracking** - Implement with:
   ```typescript
   function getLineage(fieldId: string) {
     const upstream = relationships
       .filter(r => r.target.fieldId === fieldId)
       .map(r => r.source);
     
     const downstream = relationships
       .filter(r => r.source.fieldId === fieldId)
       .map(r => r.target);
     
     return { upstream, downstream };
   }
   ```

4. **Auto-save** - Debounced persistence:
   ```typescript
   const debouncedSave = useMemo(
     () => debounce((project) => localforage.setItem('project', project), 2000),
     []
   );
   
   useEffect(() => {
     debouncedSave(project);
   }, [project]);
   ```

5. **Export quality** - For high-res exports:
   ```typescript
   const exportPNG = async (scale = 2) => {
     const canvas = await html2canvas(diagramRef.current, {
       scale,
       backgroundColor: theme === 'dark' ? '#111827' : '#ffffff'
     });
     return canvas.toBlob();
   };
   ```

---

## ✨ FINAL REQUIREMENTS SUMMARY

**MUST HAVE:**
- ✅ 100% Frontend (React + TypeScript + Vite)
- ✅ ReactFlow for canvas and curved connectors
- ✅ Column-to-column relationship tracking
- ✅ Bezier/curved edges between fields
- ✅ Lineage highlighting on hover/click
- ✅ Multiple export formats (JSON, PNG, PDF, SQL)
- ✅ Import from JSON/SQL
- ✅ Auto-save to localStorage/IndexedDB
- ✅ PWA with offline support
- ✅ Dark/light theme
- ✅ Keyboard shortcuts
- ✅ Undo/redo
- ✅ No backend, no server storage

**Generate the complete, production-ready code following this specification.**