import {readFile, writeFile} from 'node:fs/promises';

const [profilePath, catalogPath, outputPath] = process.argv.slice(2);
if (!profilePath || !catalogPath || !outputPath) throw new Error('Usage: node report_taiga_mapping.mjs <profile> <catalog> <output>');
const profile = JSON.parse(await readFile(profilePath, 'utf8'));
const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
const mapped = value => value && value.status !== 'unresolved' && typeof value.key === 'string';
const evidence = value => value.evidence === 'inspected' ? 'проверено по макету' : 'точное совпадение имени';
const escape = value => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
const table = (headers, rows) => [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map(row => `| ${row.map(escape).join(' | ')} |`),
].join('\n');
const family = (name, category) => {
    if (category === 'icons') {
        const parts = name.split('.');
        if (['fancy', 'pragmatic', 'solid', 'illustrations'].includes(parts[1])) return parts.slice(0, 3).join('.');
        if (['fixed', 'logo'].includes(parts[1]) && parts.length > 3) return parts.slice(0, 3).join('.');
        if (['emoji', 'flags', 'service'].includes(parts[1])) return parts.slice(0, 2).join('.');
        return '@tui.common-without-ds-namespace';
    }
    if (name.startsWith('--tui-')) return name.slice(6).split('-').slice(0, 2).join('-');
    return name.split(':')[0];
};
const groupCoverage = (names, category, lookup) => {
    const groups = new Map();
    for (const name of names) {
        const key = family(name, category);
        const row = groups.get(key) || {total: 0, mapped: 0};
        row.total++;
        if (mapped(lookup(name))) row.mapped++;
        groups.set(key, row);
    }
    return [...groups].sort((a, b) => b[1].total - a[1].total || a[0].localeCompare(b[0]));
};

const visualIds = new Set(profile.visualSourceComponentIds || Object.keys(catalog.components));
const sourceComponents = Object.entries(catalog.components).filter(([identity]) => visualIds.has(identity));
const componentRows = sourceComponents.map(([identity, source]) => [identity, source, profile.components[identity]]);
const mappedComponents = componentRows.filter(([, , target]) => mapped(target));
const missingComponents = componentRows.filter(([, , target]) => !mapped(target));
const iconNames = Object.keys(catalog.icons);
const tokenNames = Object.keys(catalog.tokens);
const tokenTarget = name => profile.tokens[name] || profile.textStyles[name];
const mappedTokens = tokenNames.filter(name => mapped(tokenTarget(name)));
const iconExamples = [];
const iconExampleCounts = new Map();
for (const name of iconNames.filter(name => mapped(profile.icons[name]))) {
    const group = family(name, 'icons');
    const count = iconExampleCounts.get(group) || 0;
    if (count < 3) {
        iconExamples.push(name);
        iconExampleCounts.set(group, count + 1);
    }
}
const inspected = Object.entries(profile).flatMap(([category, values]) =>
    ['components', 'icons', 'tokens', 'textStyles'].includes(category)
        ? Object.entries(values).filter(([, value]) => value.evidence === 'inspected').map(([name, value]) => ({category, name, value}))
        : []);

const lines = [
    '# Сводка маппинга Proprietary Taiga UI Angular → Figma',
    '',
    `Профиль: \`${profile.id}\`. Пакеты: ${Object.entries(profile.sourcePackages).map(([name, version]) => `\`${name}@${version}\``).join(', ')}. Пакеты \`@taiga-ui/addon-*\` исключены.`,
    '',
    'Область Figma: TUI Desktop, TUI Assets и TUI Foundations. Nitro-компоненты и другие библиотеки сюда не входят.',
    '',
    '## Главное',
    '',
    table(['Категория', 'Найдено в коде', 'Есть точная пара', 'Без точной пары'], [
        ['Визуальные Angular-компоненты и директивы', sourceComponents.length, mappedComponents.length, missingComponents.length],
        ['Иконки', iconNames.length, iconNames.filter(name => mapped(profile.icons[name])).length, iconNames.filter(name => !mapped(profile.icons[name])).length],
        ['Токены, включая типографику', tokenNames.length, mappedTokens.length, tokenNames.length - mappedTokens.length],
    ]),
    '',
    '«Точная пара» означает либо ручную проверку на реальном макете, либо единственное точное совпадение имени в выбранных Figma-библиотеках. Совпадение имени ещё не является визуальной проверкой всех вариантов.',
    '',
    'Если пара не найдена или неоднозначна, экран продолжает рендериться нативными слоями по измеренным DOM-параметрам. Компонент Figma не подставляется, а literal-значения цвета и типографики сохраняются.',
    '',
    '## Проверенные вручную соответствия',
    '',
    table(['Тип', 'В коде', 'В Figma', 'Библиотека'], inspected.map(({category, name, value}) => [category, `\`${name}\``, value.figmaName, value.library])),
    '',
    `## Компоненты: удалось сопоставить ${mappedComponents.length} из ${sourceComponents.length}`,
    '',
    table(['Angular identity', 'Символ', 'Компонент Figma', 'Основание'], mappedComponents.map(([identity, source, target]) => [
        `\`${identity}\``, source.symbol, target.figmaName, evidence(target),
    ])),
    '',
    `## Компоненты: не удалось сопоставить ${missingComponents.length}`,
    '',
    'Служебные и невизуальные директивы сюда не включены. Для перечисленных визуальных компонентов в выбранных библиотеках нет единственного точного совпадения имени.',
    '',
    table(['Angular identity', 'Символ', 'Селекторы'], missingComponents.map(([identity, source]) => [
        `\`${identity}\``, source.symbol, source.selectors.join(', '),
    ])),
    '',
    '## Иконки по семействам',
    '',
    table(['Семейство', 'В коде', 'Сопоставлено', 'Без пары'], groupCoverage(iconNames, 'icons', name => profile.icons[name]).map(([name, row]) => [name, row.total, row.mapped, row.total - row.mapped])),
    '',
    'Примеры сопоставленных иконок:',
    '',
    table(['В коде', 'В Figma', 'Основание'], iconExamples.map(name => [
        `\`${name}\``, profile.icons[name].figmaName, evidence(profile.icons[name]),
    ])),
    '',
    'Полный перечень всех иконок и статусов находится в JSON-профиле; в этот отчёт выведено агрегирование по семействам, чтобы он оставался читаемым.',
    '',
    '## Токены по группам',
    '',
    table(['Группа', 'В коде', 'Сопоставлено', 'Без пары'], groupCoverage(tokenNames, 'tokens', tokenTarget).map(([name, row]) => [name, row.total, row.mapped, row.total - row.mapped])),
    '',
    'Сопоставленные токены:',
    '',
    table(['Токен кода', 'Переменная/стиль Figma', 'Библиотека', 'Основание'], mappedTokens.map(name => {
        const target = tokenTarget(name);
        return [`\`${name}\``, target.figmaName, target.library, evidence(target)];
    })),
    '',
    '## Ограничения отчёта',
    '',
    '- Варианты Figma сохранены в исходных снапшотах, но не каждый вариант и component property проверен вручную.',
    '- `exact-name-convention` означает детерминированное совпадение имени, а не доказанную визуальную эквивалентность.',
    '- Несколько одноимённых кандидатов считаются неоднозначностью и не используются автоматически.',
    '- Неопубликованный или недоступный для импорта asset во время рендера должен перейти на нативный fallback.',
    `- Исключено невизуальных или несопоставленных служебных директив: ${Object.keys(profile.excludedSourceComponents || {}).length}.`,
    '- Полный машинный каталог: `profiles/proprietary-taiga-ui-angular.json`.',
    '',
];
await writeFile(outputPath, lines.join('\n'));
console.log(JSON.stringify({components: {mapped: mappedComponents.length, total: sourceComponents.length},
    icons: {mapped: iconNames.filter(name => mapped(profile.icons[name])).length, total: iconNames.length},
    tokens: {mapped: mappedTokens.length, total: tokenNames.length}}));
