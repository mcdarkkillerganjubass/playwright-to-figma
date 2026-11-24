import fs from 'node:fs';

/** Browser function: keep self-contained for Playwright serialization. */
export function detect(rules = []) {
    const result = {};
    const candidates = new Map();
    for (const rule of rules) {
        try {
            for (const element of document.querySelectorAll(rule.selector)) {
                const matches = candidates.get(element) || new Set();
                matches.add(rule.component);
                candidates.set(element, matches);
            }
        } catch { /* Angular-only selectors may not be valid browser CSS. */ }
    }
    for (const element of document.querySelectorAll('button[tuiButton], a[tuiButton], tui-icon')) {
        if (!candidates.has(element)) candidates.set(element, new Set());
    }
    for (const [element, matches] of candidates) {
        const indices = [];
        for (let node = element; node.parentElement; node = node.parentElement) {
            indices.unshift(Array.from(node.parentElement.children).indexOf(node));
        }
        const semantic = {};
        if (matches.size === 1) semantic.component = [...matches][0];
        if (element.matches('button[tuiButton], a[tuiButton]')) {
            semantic.component = 'tuiButton';
            semantic.props = {};
            const size = element.getAttribute('data-size') || element.getAttribute('size');
            const appearance = element.getAttribute('data-appearance') || element.getAttribute('appearance');
            if (size) semantic.props.size = size;
            if (appearance) semantic.props.appearance = appearance;
        }
        const icon = element.getAttribute('icon');
        if (element.localName === 'tui-icon' && icon) semantic.icon = icon;
        if (Object.keys(semantic).length) result[indices.join('/')] = semantic;
    }
    return result;
}

const profile = JSON.parse(fs.readFileSync(new URL('../proprietary-taiga-ui-angular.json', import.meta.url), 'utf8'));
const catalog = JSON.parse(fs.readFileSync(new URL('../proprietary-taiga-ui-angular.catalog.json', import.meta.url), 'utf8'));
const rules = Object.entries(catalog.components).flatMap(([id, entry]) => {
    const component = Object.hasOwn(profile.components, id) ? id :
        Object.hasOwn(profile.components, entry.symbol) ? entry.symbol : null;
    return component ? entry.selectors.map(selector => ({selector, component})) : [];
});

export default {
    version: 1,
    id: 'proprietary-taiga-ui-angular',
    detect,
    rules,
    profile,
};
