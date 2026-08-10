// Calculate area of a polygon using the Shoelace formula
export function calculatePolygonArea(points) {
    if (!points || points.length < 3) return 0;

    let area = 0;
    const n = points.length;

    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        area += points[i].x * points[j].y;
        area -= points[j].x * points[i].y;
    }

    area = Math.abs(area) / 2.0;

    // Conversion scale assumption: pixels to square meters/feet (e.g., scale factor ratio)
    const SCALE_RATIO = 0.05; // Adjustable scale factor for architectural blueprints
    return parseFloat((area * SCALE_RATIO).toFixed(2));
}