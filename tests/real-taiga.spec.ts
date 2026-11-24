import {test, expect} from '@playwright/test';
import {capturePageDesign} from '../assets/page-design';
import {applyDesignSystemPackage} from '../assets/design-system-adapter.mjs';
import {resolveDesignSystem} from '../assets/design-system-mapping.mjs';
import {mkdir, writeFile} from 'node:fs/promises';
test('real edit-draft-info external capture', async ({page}) => {
    const {default: ds} = await new Function('return import("file:///Users/n.kostyukov/Desktop/playwright-to-figma/profiles/proprietary-taiga-ui-angular/package.mjs")')();
    await page.clock.setFixedTime('2026-01-15T09:00:00Z');
    const directory = 'artifacts/real-taiga-export';
    await mkdir(directory, {recursive: true});
    async function capture(id: string) {
        const design = await applyDesignSystemPackage(page, await capturePageDesign(page), ds);
        const mapping = resolveDesignSystem(design, ds.profile);
        await writeFile(`${directory}/${id}.json`, JSON.stringify({design, mapping}));
        await page.screenshot({path: `${directory}/${id}.png`, animations: 'disabled'});
        console.log(id, JSON.stringify({detected: design.layers.filter(l=>l.semantic).length, mapped: Object.values(mapping.layers).filter((l:any)=>l.component).length, warnings: mapping.warnings.length}));
    }
    await page.goto('/app-create');
    await page.getByRole('textbox', {name:'Название',exact:true}).fill('Flow map demo');
    await page.getByRole('textbox', {name:'Уникальный код',exact:true}).fill('flow-map-demo');
    for (const [env,host] of [['preprod','twork-preprod.tcsbank.ru'],['prod','twork.tbank.ru']]) {
        const input=page.locator(`[data-env="${env}"] input[tuiComboBox]`);
        await input.focus(); await input.selectText(); await input.press('Backspace'); await input.pressSequentially(host); await input.press('Escape'); await input.press('Tab');
    }
    await page.getByRole('button',{name:'Создать',exact:true}).click();
    await expect(page).toHaveURL(/\/editor$/);
    await page.getByRole('button',{name:'Зарелизить',exact:true}).click();
    await page.getByRole('button',{name:'Запустить релиз',exact:true}).click();
    await page.getByRole('button',{name:'Новый черновик',exact:true}).click();
    await capture('state-1');
    const info=page.getByRole('button',{name:'Информация о черновике'});
    await info.click();
    const description=page.getByRole('textbox',{name:'Описание',exact:true});
    await expect(description).toBeVisible(); await capture('state-2');
    await description.fill('Описание сценария'); await expect(description).toHaveValue('Описание сценария'); await capture('state-3');
    await info.click(); await expect(description).not.toBeVisible(); await capture('state-4');
    await page.getByRole('button',{name:/^Черновики и релизы:/}).click();
    await expect(page.locator('tui-dropdown .release-description').filter({hasText:'Описание сценария'})).toBeVisible();
    await capture('updated-description-history');
});
