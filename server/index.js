
import fs from 'fs';
import path from 'path';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8085;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '../dist')));

// Ensure projects directory exists
const projectRoot = path.join(__dirname, '..');
const saveDir = path.join(projectRoot, 'projects');

if (!fs.existsSync(saveDir)) {
    fs.mkdirSync(saveDir, { recursive: true });
}

// List all projects
app.get('/api/projects', (req, res) => {
    try {
        const files = fs.readdirSync(saveDir)
            .filter(file => file.endsWith('.json'))
            .map(file => {
                const stats = fs.statSync(path.join(saveDir, file));
                return {
                    name: file,
                    modified: stats.mtime,
                    size: stats.size
                };
            });
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: 'Failed to list projects' });
    }
});

// Get a specific project
app.get('/api/projects/:name', (req, res) => {
    try {
        const filePath = path.join(saveDir, req.params.name);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Project not found' });
        }
        const data = fs.readFileSync(filePath, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: 'Failed to load project' });
    }
});

// Auto-save endpoint
app.post('/api/save', (req, res) => {
    try {
        const { project, fileName } = req.body;

        if (!project) {
            return res.status(400).json({ error: 'Missing project data' });
        }

        const name = fileName || `project_${project.metadata?.id || 'default'}.json`;
        const filePath = path.join(saveDir, name);

        fs.writeFileSync(filePath, JSON.stringify(project, null, 2));

        console.log(`[Save] Saved to ${filePath}`);
        res.json({ success: true, path: filePath });
    } catch (error) {
        console.error('Save Error:', error);
        res.status(500).json({ error: 'Failed to save file' });
    }
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Serving static files from ${path.join(__dirname, '../dist')}`);
    console.log(`Auto-saves will be stored in ${saveDir}`);
});
