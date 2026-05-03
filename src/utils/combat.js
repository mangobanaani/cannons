export function calculateDamage(impactX, impactY, targetX, targetY, blastRadius, maxDamage) {
    const dx = impactX - targetX;
    const dy = impactY - targetY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance >= blastRadius) return 0;

    const factor = 1 - (distance / blastRadius);
    return Math.round(maxDamage * factor);
}
