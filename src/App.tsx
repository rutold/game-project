import { useRef, useState } from 'react';
import { IRefPhaserGame, PhaserGame } from './game/PhaserGame';
import { MainMenu } from './game/scenes/MainMenu';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './admin/PrivateRoute.tsx';
import ProfilePage from './admin/ProfilePage.jsx';
import AdminPage from "./admin/AdminPage.tsx";
function App()
{

    const [canMoveSprite, setCanMoveSprite] = useState(true);


    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const [spritePosition, setSpritePosition] = useState({ x: 0, y: 0 });

    const changeScene = () => {

        if(phaserRef.current)
        {     
            const scene = phaserRef.current.scene as MainMenu;
            
            if (scene)
            {
                scene.changeScene();
            }
        }
    }

    const moveSprite = () => {

        if(phaserRef.current)
        {

            const scene = phaserRef.current.scene as MainMenu;

            if (scene && scene.scene.key === 'MainMenu')
            {

                scene.moveLogo(({ x, y }) => {

                    setSpritePosition({ x, y });

                });
            }
        }

    }

    const addSprite = () => {

        if (phaserRef.current)
        {
            const scene = phaserRef.current.scene;

            if (scene)
            {
                const x = Phaser.Math.Between(64, scene.scale.width - 64);
                const y = Phaser.Math.Between(64, scene.scale.height - 64);
                
                const star = scene.add.sprite(x, y, 'star');
    

                scene.add.tween({
                    targets: star,
                    duration: 500 + Math.random() * 1000,
                    alpha: 0,
                    yoyo: true,
                    repeat: -1
                });
            }
        }
    }
    
    const currentScene = (scene: Phaser.Scene) => {

        setCanMoveSprite(scene.scene.key !== 'MainMenu');
        
    }

    return (
        <div id="app">
            <Router>
            <Routes>
            <Route path='/' element={<> <PhaserGame ref={phaserRef} currentActiveScene={currentScene} /></>}/>
                <Route path='/admin' element={<><ProtectedRoute> <AdminPage /></ProtectedRoute></>}/>
            </Routes>
            </Router>
            <div>
            </div>
        </div>
    )
}

export default App
