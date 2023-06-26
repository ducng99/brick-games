interface GameInfo {
    id: string;
    name: string;
    loader: () => Promise<any>;
}

const GamesList: GameInfo[] = [
    {
        id: 'car-racing',
        name: 'Car Racing',
        loader: () => import('./car-racing')
    }
];

export default GamesList;
