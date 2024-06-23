import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
    LineController,
    BarController
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import AuthenticationService from "../game/Api/AuthenticationService";

// Register scales and elements
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
    LineController,
    BarController
);

interface TopScore {
    id: number;
    name: string;
    difficulty: string;
    score: number;
    player: string;
}

interface TopGame {
    id: number;
    name: string;
    difficulty: string;
    count: number;
}

const StatisticsTab: React.FC = () => {
    const [topScoresData, setTopScoresData] = useState<TopScore[]>([]);
    const [topGamesData, setTopGamesData] = useState<TopGame[]>([]);
    const authService = new AuthenticationService();
    useEffect(() => {
        authService.init();
    }, []);
    useEffect(() => {
        axios.get('https://rutold.onrender.com/:10000/gameData/TopScores', {
            headers: {
                'Authorization': `Bearer ${authService.getToken()}`
            }
        })
            .then(response => {
                setTopScoresData(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the top scores!', error);
            });

        axios.get('https://rutold.onrender.com/:10000/gameData/TopGames', {
            headers: {
                'Authorization': `Bearer ${authService.getToken()}`
            }
        })
            .then(response => {
                setTopGamesData(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the top games!', error);
            });
    }, []);
    const gameNames = [...new Set(topScoresData.map(score => score.name))];
    const players = [...new Set(topScoresData.map(score => score.player))]; 
    const datasets = gameNames.map(name => {
        return {
            label: name,
            data: players.map(player => {
                const scoreEntry = topScoresData.find(score => score.name === name && score.player === player);
                return scoreEntry ? scoreEntry.score : 0; 
            }),
            backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`,
            borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`,
            borderWidth: 2,
        };
    });

    const topScoresChartData = {
        labels: players,
        datasets: datasets
    };

    const topGamesChartData = {
        labels: topGamesData.map(game => `${game.name} (${game.difficulty})`),
        datasets: [
            {
                label: 'Top Games',
                data: topGamesData.map(game => game.count),
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
            },
        ],
    };

    return (
        <div>
            <h3>Top Scores</h3>
            <div style={{width: '80vw', height: '40vh'}}>
                <Bar data={topScoresChartData}/>
            </div>
            <h3>Top Games</h3>
            <div style={{width: '80vw', height: '40vh'}}>
                <Line data={topGamesChartData}/>
            </div>
        </div>
    );
};

export default StatisticsTab;
