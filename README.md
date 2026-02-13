# ERD Designer

A fully functional Entity-Relationship Diagram (ERD) designer web application.

## Features
- **Table Management**: Create, edit, and delete tables.
- **Field Management**: Add fields with types and constraints (PK, FK, etc.).
- **Visual Relationships**: Column-level connections using ReactFlow.
- **Dark Mode**: Default dark theme with light mode toggle.
- **Canvas Controls**: Zoom, pan, minimap, and grid snapping.
- **Persistence**: Auto-save to local storage.

## Tech Stack
- React 18 + TypeScript + Vite
- ReactFlow for diagrams
- Zustand for state management
- Tailwind CSS for styling
- Lucide React for icons

## Getting Started

### Local Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

### Docker Compose (Recommended)
The easiest way to run the application is using Docker Compose:

**Production Mode (Served by Nginx):**
```bash
docker-compose up erd-designer
```
The app will be available at `http://localhost:8080`.

**Development Mode (Hot Reloading):**
```bash
docker-compose up erd-designer-dev
```
The app will be available at `http://localhost:5173`.

## Shortcuts
- `Ctrl + Click`: Multi-select
- `Delete`: Delete selected entity
- `Space + Drag`: Pan canvas
