import React from 'react';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import AppRoutes from './routes/AppRoutes';

// Импорт глобальных стилей
import './assets/styles/global.css';
import './assets/styles/components/buttons.css';
import './assets/styles/components/forms.css';
import './assets/styles/components/modals.css';
import './assets/styles/components/cards.css';

function App() {
    return (
        <AuthProvider>
            <Layout>
                <AppRoutes />
            </Layout>
        </AuthProvider>
    );
}

export default App;