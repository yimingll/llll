/*
@plugin #plugin
@version 1.0
@author Yami Sama
@link https://space.bilibili.com/124952089
@desc #desc

@lang en
#plugin Trigger - Bind Caster
#desc Always in the same position as the skill casting actor

@lang zh
#plugin 触发器 - 绑定技能施放角色
#desc 总是和技能施放角色处于同一个位置
*/

export default class Script {
  constructor(trigger) {
    this.trigger = trigger
  }

  update() {
    const trigger = this.trigger
    const caster = trigger.caster
    trigger.x = caster.x
    trigger.y = caster.y
  }
}