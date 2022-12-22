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

@lang en
#plugin Menu - Progress Bar
#desc Synchronize the character's attribute ratio to the progress bar
#currentKey Current Attribute
#maximumKey Maximum Attribute

@lang zh
#plugin 主菜单 - 进度条
#desc 同步角色的属性比值到进度条
#currentKey 当前值属性
#maximumKey 最大值属性

*/

export default class ProgressBarScript {
  onStart(element) {
    const mainWindow = UI.get('016c09707e098490')
    if (!(element instanceof ProgressBarElement) || !mainWindow || !this.currentKey || !this.maximumKey) {
      return this.update = Function.empty
    }
    this.manager = mainWindow.script.MainScript
    this.element = element
    this.update()
  }

  update() {
    const actor = this.manager.actor
    const curValue = actor.attributes[this.currentKey]
    const maxValue = actor.attributes[this.maximumKey]
    const progress = curValue / maxValue
    if (this.progress !== progress && Number.isFinite(progress)) {
      this.progress = progress
      this.element.progress = progress
    }
  }
}