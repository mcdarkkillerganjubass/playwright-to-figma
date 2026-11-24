/** Pure mapping step: no Figma access, file loading, or application-specific rules. */
export function resolveDesignSystem(design, profile) {
    if (!design || !Array.isArray(design.layers)) throw new Error('Expected design layers');
    if (profile?.version !== 1 || typeof profile.id !== 'string' || !profile.id) throw new Error('Invalid mapping profile');
    const categories = ['components', 'icons', 'tokens', 'textStyles'];
    for (const category of categories) {
        const entries = profile[category];
        if (!entries || typeof entries !== 'object' || Array.isArray(entries)) throw new Error(`Invalid ${category}`);
        for (const asset of Object.values(entries)) {
            if (asset?.status === 'unresolved') {
                if (asset.key) throw new Error(`Unresolved asset has a key in ${category}`);
                continue;
            }
            if (!asset || !['component', 'component_set', 'variable', 'text_style', 'paint_style', 'effect_style'].includes(asset.type) ||
                !/^[a-f0-9]{40}$/.test(asset.key || '')) throw new Error(`Invalid asset in ${category}`);
            const allowed = category === 'components' ? ['component', 'component_set'] : category === 'tokens' ?
                ['variable', 'paint_style', 'effect_style'] : [category === 'icons' ? 'component' : 'text_style'];
            if (!allowed.includes(asset.type)) throw new Error(`Wrong asset type in ${category}`);
        }
    }
    const layers = {}, warnings = [], keys = new Set();
    for (const layer of design.layers) {
        if (typeof layer.key !== 'string' || !layer.key || keys.has(layer.key)) throw new Error('Missing or duplicate layer key');
        keys.add(layer.key);
        // Semantic identities come from the host adapter, never nearest-color guessing.
        const semantic = layer.semantic;
        if (!semantic) continue;
        const resolved = {fallback: 'native'};
        function lookup(category, name) {
            if (typeof name !== 'string' || !name) throw new Error(`Invalid ${category} identity`);
            if (!Object.hasOwn(profile[category], name)) {
                warnings.push({layerKey: layer.key, category, name});
                return null;
            }
            const asset = profile[category][name];
            if (asset.status === 'unresolved') {
                warnings.push({layerKey: layer.key, category, name, reason: asset.reason || 'No verified Figma counterpart'});
                return null;
            }
            return structuredClone(asset);
        }
        if (semantic.component) {
            const component = lookup('components', semantic.component);
            if (component) {
                const props = {...(component.props || {})};
                let complete = true;
                for (const [name, value] of Object.entries(semantic.props || {})) {
                    const rule = component.properties?.[name];
                    if (!rule || (rule.values && !Object.hasOwn(rule.values, String(value)))) {
                        warnings.push({layerKey: layer.key, category: 'properties', name, value});
                        complete = false;
                    } else props[rule.name] = rule.values ? rule.values[String(value)] : value;
                }
                // An unsupported appearance must not silently become the default variant.
                if (complete) resolved.component = {type: component.type, key: component.key, props};
            }
        }
        if (semantic.icon) resolved.icon = lookup('icons', semantic.icon);
        if (semantic.textStyle) resolved.textStyle = lookup('textStyles', semantic.textStyle);
        if (semantic.tokens) {
            resolved.tokens = {};
            for (const [property, name] of Object.entries(semantic.tokens)) {
                const token = lookup('tokens', name);
                if (token) resolved.tokens[property] = token;
            }
        }
        layers[layer.key] = resolved;
    }
    return {version: 1, profileId: profile.id, layers, warnings};
}
