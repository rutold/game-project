import React, { useState } from 'react';
import EditTab from './EditTab';
import StatisticsTab from './StatisticsTab';

const AdminPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('edit');

    return (
        <div>
            <div>
                <button onClick={() => setActiveTab('edit')}>Edit Characters</button>
                <button onClick={() => setActiveTab('statistics')}>Statistics</button>
            </div>
            {activeTab === 'edit' ? <EditTab /> : <StatisticsTab />}
        </div>
    );
};

export default AdminPage;
