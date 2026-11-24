/** Runs an external DS package without changing the application DOM. */
export async function applyDesignSystemPackage(page, design, dsPackage) {
    if (dsPackage?.version !== 1 || typeof dsPackage.detect !== 'function' || !dsPackage.profile) {
        throw new Error('Expected a version-1 DS package with detect and profile');
    }
    const detected = await page.evaluate(dsPackage.detect, dsPackage.rules);
    return {...design, layers: design.layers.map(layer => {
        const semantic = detected[layer.source?.path];
        // Only element frames represent component boundaries; text/pseudos share source paths.
        return semantic && layer.kind === 'frame' && !layer.source?.pseudo
            ? {...layer, semantic: {...semantic, ...layer.semantic}} : layer;
    })};
}
