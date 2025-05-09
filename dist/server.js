import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './db/connection.js';
import jetRoutes from './routes/jetRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const swaggerDocument = YAML.load(path.join(__dirname, '../openapi.yaml'));
const app = express();
const PORT = process.env.PORT || 3000;
const MCP_PORT = process.env.MCP_PORT || 3001;
const OFFICIAL_MCP_PORT = process.env.OFFICIAL_MCP_PORT || 3005;
// Middleware
app.use(cors());
app.use(express.json());
// Connect to MongoDB
connectDB();
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jets', jetRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// Root route
app.get('/', (req, res) => {
    res.send('JetKeep API is running. Visit <a href="/api-docs">API Documentation</a>');
});
// Create admin user if not exists
import User from './db/models/User.js';
const createAdminUser = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@jetkeep.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (!existingAdmin) {
            console.log('Creating default admin user...');
            const admin = new User({
                username: adminUsername,
                email: adminEmail,
                password: adminPassword,
                role: 'admin'
            });
            await admin.save();
            console.log('Admin user created successfully');
        }
    }
    catch (error) {
        console.error('Error creating admin user:', error);
    }
};
// Start main server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
    // Create admin user after server starts
    createAdminUser();
});
export default app;
//# sourceMappingURL=server.js.map