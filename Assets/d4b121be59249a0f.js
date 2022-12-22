/*
@plugin #plugin
@version
@author Yami Sama
@link https://space.bilibili.com/124952089
@desc 

@attribute-key key
@alias #key
@filter actor

@lang en
#plugin Menu - Integer Attribute
#desc Show the Integer attribute for the main menu actor
#key Attribute

@lang zh
#plugin 主菜单 - 整数属性
#desc 显示主菜单角色整数属性
#key 属性

*/

export default class IntegerAttributeScript {
  onStart(element) {
    const mainWindow = UI.get('016c09707e098490')
    if (!(element instanceof TextElement) || !mainWindow || !this.key) {
      return this.update = Function.empty
    }
    this.manager = mainWindow.script.MainScript
    this.element = element
    this.update()
  }

  update() {
    const actor = this.manager.actor
    const value = actor.attributes[this.key]
    const diff = this.getDiffWithSelection()
    if ((this.value !== value || this.diff !== diff) && Number.isFinite(value)) {
      this.value = value
      this.diff = diff
      if (diff !== 0) {
        const color = diff > 0 ? this.manager.attrIncreaseColor : this.manager.attrDecreaseColor
        const preview = value + diff
        this.element.content = `${value} - <color:${color}>${preview}</color>`
      } else {
        this.element.content = value
      }
    }
  }

  // 获取与选中装备的属性差异
  getDiffWithSelection() {
    let diff = 0
    const manager = this.manager
    if (manager.info.target instanceof Equipment) {
      const slotAttr = manager.equipSlot?.key ?? ''
      const slot = manager.info.target.attributes[slotAttr]
      if (typeof slot === 'string') {
        const current = manager.actor.equipmentManager.get(slot)
        if (current !== manager.info.target) {
          diff -= current?.attributes[this.key] ?? 0
          diff += manager.info.target.attributes[this.key] ?? 0
        }
      }
    }
    return diff
  }
}