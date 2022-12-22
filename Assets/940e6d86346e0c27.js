/*
@plugin #plugin
@version
@author Yami Sama
@link https://space.bilibili.com/124952089
@desc #desc

@attribute-key currentKey
@alias #currentKey
@filter actor

@attribute-key maximumKey
@alias #maximumKey
@filter actor

@string format
@alias #format
@default '{current}/{maximum}'

@lang en
#plugin Menu - Fractional Attributes
#desc Show the Fractional attributes for the main menu actor
#currentKey current Value
#maximumKey maximum Value
#format Format

@lang zh
#plugin 主菜单 - 分数属性
#desc 显示主菜单角色分数属性
#currentKey 当前值属性
#maximumKey 最大值属性
#format 格式

*/

export default class FractionalAttributeScript {
  onStart(element) {
    const mainWindow = UI.get('016c09707e098490')
    if (!(element instanceof TextElement) || !mainWindow || !this.currentKey || !this.maximumKey) {
      return this.update = Function.empty
    }
    this.manager = mainWindow.script.MainScript
    this.element = element
    this.update()
  }

  update() {
    const actor = this.manager.actor
    const curValue = Math.floor(actor.attributes[this.currentKey])
    const maxValue = actor.attributes[this.maximumKey]
    const diff = this.getDiffWithSelection()
    if ((this.curValue !== curValue || this.maxValue !== maxValue || this.diff !== diff) &&
      Number.isFinite(curValue) && Number.isFinite(maxValue)) {
      this.curValue = curValue
      this.maxValue = maxValue
      this.diff = diff
      if (diff !== 0) {
        const color = diff > 0 ? this.manager.attrIncreaseColor : this.manager.attrDecreaseColor
        const preview = maxValue + diff
        this.element.content = `${maxValue} - <color:${color}>${preview}</color>`
      } else {
        this.element.content = this.format.replace('{current}', curValue).replace('{maximum}', maxValue)
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
          diff -= current?.attributes[this.maximumKey] ?? 0
          diff += manager.info.target.attributes[this.maximumKey] ?? 0
        }
      }
    }
    return diff
  }
}