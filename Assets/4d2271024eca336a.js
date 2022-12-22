/*
@plugin #plugin
@version
@author Yami Sama
@link https://space.bilibili.com/124952089
@desc #desc

@attribute attr
@alias #attr
@filter actor

@string format
@alias #format
@default '{enum-name}'

@lang en
#plugin Menu - Enum Attribute
#desc Show the Enum attribute for the main menu actor
#attr Attribute
#format Format

@lang zh
#plugin 主菜单 - 枚举属性
#desc 显示主菜单角色枚举属性
#attr 属性
#format 格式

*/

export default class StringAttributeScript {
  onStart(element) {
    const mainWindow = UI.get('016c09707e098490')
    const enumGroup = Enum.getGroup(this.attr?.enum ?? '')
    if (!(element instanceof TextElement) || !mainWindow || !enumGroup) {
      return this.update = Function.empty
    }
    this.key = this.attr.key
    this.enumGroup = enumGroup
    this.manager = mainWindow.script.MainScript
    this.element = element
    this.update()
  }

  update() {
    const value = this.manager.actor.attributes[this.key]
    if (this.value !== value) {
      this.value = value
      this.element.content = this.format.replace('{enum-name}', this.enumGroup[value])
    }
  }
}