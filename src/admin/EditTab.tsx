import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AuthenticationService from "../game/Api/AuthenticationService";

interface CharacterEntity {
    id: number;
    name: string;
    walkSpeed: number;
    health: number;
    abilities: any[];
    damageMultiplier: number;
    cooldownReduction: number;
    imageUrl: string;
    atlasJsonUrl: string;
    cost: number;
}

const EditTab: React.FC = () => {
    const [characters, setCharacters] = useState<CharacterEntity[]>([]);
    const [selectedCharacter, setSelectedCharacter] = useState<CharacterEntity | null>(null);
    let authService = new AuthenticationService();
    authService.init();
    useEffect(() => {
        axios.get('https://rutold.onrender.com//gameData/characters', {
            headers: {
                'Authorization': `Bearer ${authService.getToken()}`
            }
        })
            .then(response => {
                setCharacters(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the characters!', error);
            });
    }, []);

    const handleCharacterSelect = (character: CharacterEntity) => {
        setSelectedCharacter(character);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (selectedCharacter) {
            setSelectedCharacter({
                ...selectedCharacter,
                [e.target.name]: e.target.value
            });
        }
    };
    const handleSubmit = () => {
        if (selectedCharacter) {
            axios.post('https://rutold.onrender.com//gameData/character/edit', selectedCharacter , {
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`
                }
            })
                .then(response => {
                    console.log('Character updated successfully');
                })
                .catch(error => {
                    console.error('There was an error updating the character!', error);
                });
        }
    };

    return (
        <div>
            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Walk Speed</th>
                    <th>Health</th>
                    <th className="ability">Abilities</th>
                    <th>Damage Multiplier</th>
                    <th>Cooldown Reduction</th>
                    <th>Image URL</th>
                    <th>Atlas JSON URL</th>
                    <th>Cost</th>
                </tr>
                </thead>
                <tbody>
                {characters.map(character => (
                    <tr key={character.id} onClick={() => handleCharacterSelect(character)}>
                        <td>{character.id}</td>
                        <td>{character.name}</td>
                        <td>{character.walkSpeed}</td>
                        <td>{character.health}</td>
                        <td>{character.abilities.map(ability => ability.name).join(', ')}</td>
                        <td>{character.damageMultiplier}</td>
                        <td>{character.cooldownReduction}</td>
                        <td>{character.imageUrl}</td>
                        <td>{character.atlasJsonUrl}</td>
                        <td>{character.cost}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            {selectedCharacter && (
                
                <div>
                    <h3>Edit Character</h3>
                    <input type="text" name="name" value={selectedCharacter.name} onChange={handleInputChange}/>
                    <input type="number" name="walkSpeed" value={selectedCharacter.walkSpeed} onChange={handleInputChange}/>
                    <input type="number" name="health" value={selectedCharacter.health} onChange={handleInputChange}/>
                    <input type="text" name="abilities" value={selectedCharacter.abilities.map(ability => ability.name).join(', ')} onChange={handleInputChange}/>
                    <input type="number" name="damageMultiplier" value={selectedCharacter.damageMultiplier} onChange={handleInputChange}/>
                    <input type="number" name="cooldownReduction" value={selectedCharacter.cooldownReduction} onChange={handleInputChange}/>
                    <input type="text" name="imageUrl" value={selectedCharacter.imageUrl} onChange={handleInputChange}/>
                    <input type="text" name="atlasJsonUrl" value={selectedCharacter.atlasJsonUrl} onChange={handleInputChange}/>
                    <input type="number" name="cost" value={selectedCharacter.cost} onChange={handleInputChange}/>
                    <button onClick={handleSubmit}>Submit</button>
                </div>
            )}
        </div>
    );
};

export default EditTab;
