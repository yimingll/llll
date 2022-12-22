/*
@plugin #plugin
@version
@author Yami Sama
@link https://space.bilibili.com/124952089
@desc #desc

@attribute-key key
@alias #key
@filter actor

@string format
@alias #format
@default '{attr-value}'

@lang en
#plugin Menu - Common Attribute
#desc Show the attribute for the main menu actor
#key Attribute
#format Format

@lang zh
#plugin 主菜单 - 通用属性
#desc 显示主菜单角色属性
#key 属性
#format 格式

*/

export default class StringAttributeScript {
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
    const value = this.manager.actor.attributes[this.key]
    if (this.value !== value) {
      this.value = value
      this.element.content = this.format.replace('{attr-value}', value)
    }
  }
}