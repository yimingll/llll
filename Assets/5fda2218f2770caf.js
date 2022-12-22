/*
@plugin #plugin
@version 1.0
@author Yami Sama
@link https://space.bilibili.com/124952089
@desc #desc

@option actor {'trigger', 'caster', 'local', 'global'}
@alias #actor {#actor-trigger, #actor-caster, #actor-local, #actor-global}

@string localActorKey
@alias #localActorKey
@cond actor {'local'}

@variable globalActorKey
@alias #globalActorKey
@cond actor {'global'}

@option style {0, 1, 2, 3, 4, 5}
@alias #style

@string damageKey
@alias #damageKey

@lang en
#plugin Popup Damage Number
#desc A Command for Damage Number Plugin
#actor Target Actor
#actor-trigger Trigger Actor
#actor-caster Skill Caster
#actor-local Local Variable
#actor-global Global Variable
#localActorKey Actor Variable
#globalActorKey Actor Variable
#style Style
#damageKey Damage Variable

@lang zh
#plugin 弹出伤害数字
#desc 伤害数字插件的相关指令
#actor 目标角色
#actor-trigger 事件触发角色
#actor-caster 技能施放角色
#actor-local 本地角色变量
#actor-global 全局角色变量
#localActorKey 角色变量
#globalActorKey 角色变量
#style 样式
#damageKey 伤害变量
*/

export default class PopupDamageNumber {
  call() {
    let actor
    switch (this.actor) {
      case 'trigger':
        actor = Event.triggerActor
        break
      case 'caster':
        actor = Event.casterActor
        break
      case 'local':
        actor = Event.attributes[this.localActorKey]
        break
      case 'global':
        actor = Variable.get(this.globalActorKey)
        break
    }
    const damage = Event.attributes[this.damageKey]
    if (actor instanceof Actor && typeof damage === 'number') {
      PluginManager.DamageNumber?.popup(actor, this.style, damage)
    }
  }
}