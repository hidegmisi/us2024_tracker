export function calculateCoordinates(centerX: number, centerY: number, radius: number, angleInDegrees: number): { x: number; y: number } {
    const angleInRadians = (angleInDegrees - 90) * (Math.PI / 180);
    return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
    };
}

export function createPathD(centerX: number, centerY: number, radius: number, startDeg: number, endDeg: number): string {
    const startCoords = calculateCoordinates(centerX, centerY, radius, startDeg);
    const endCoords = calculateCoordinates(centerX, centerY, radius, endDeg);

    return `M ${startCoords.x},${startCoords.y} A ${radius} ${radius} 0 0 1 ${endCoords.x},${endCoords.y}`;
}

export function percToDeg(perc: number, gaugeRange: number): number {
    return (perc / gaugeRange) * 180;
}