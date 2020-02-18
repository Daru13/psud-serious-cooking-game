export function emptyElement(element: HTMLElement): void {
    while (element.firstChild !== null) {
        element.removeChild(element.lastChild);
    }
}