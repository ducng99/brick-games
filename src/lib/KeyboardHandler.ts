const keysDown = new Set<string>();

window.addEventListener('keydown', (event) => {
    keysDown.add(event.code);
});

window.addEventListener('keyup', (event) => {
    keysDown.delete(event.code);
});

export function isKeydown(key: string): boolean {
    return keysDown.has(key);
}
