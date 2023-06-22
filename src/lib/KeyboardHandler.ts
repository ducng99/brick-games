const keysDown = new Set();

window.addEventListener('keydown', (event) => {
    keysDown.add(event.key);
});

window.addEventListener('keyup', (event) => {
    keysDown.delete(event.key);
});

export function isKeydown(key: string): boolean {
    return keysDown.has(key);
}
