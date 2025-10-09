// 调试菜单：用于快速查看/切换规则开关（中文注释）

import { gmRegisterMenu } from '../storage/gm';
import { getRuleFlags, setRuleEnabled } from '../storage/settings';

export function registerRuleDebugMenus(label: string = '[discourse-new-tab]') {
  gmRegisterMenu('【调试】查看规则开关', async () => {
    const flags = await getRuleFlags();
    console.log(`${label} 规则开关：`, flags);
  });

  gmRegisterMenu('【调试】切换：主题帖-任意页打开主题=新标签', async () => {
    const flags = await getRuleFlags();
    const id = 'topic:open-new-tab';
    const next = !flags[id];
    await setRuleEnabled(id, next);
    console.log(`${label} 规则[${id}] → ${next ? '启用' : '关闭'}`);
  });

  gmRegisterMenu('【调试】切换：主题内-点击其他链接=新标签', async () => {
    const flags = await getRuleFlags();
    const id = 'topic:in-topic-open-other';
    const next = !flags[id];
    await setRuleEnabled(id, next);
    console.log(`${label} 规则[${id}] → ${next ? '启用' : '关闭'}`);
  });

  gmRegisterMenu('【调试】切换：同一主题楼层跳转=保留原生', async () => {
    const flags = await getRuleFlags();
    const id = 'topic:same-topic-keep-native';
    const next = !flags[id];
    await setRuleEnabled(id, next);
    console.log(`${label} 规则[${id}] → ${next ? '启用' : '关闭'}`);
  });
}

