/*
@plugin #plugin
@version 1.0
@author Yami Sama
@link https://space.bilibili.com/124952089

@element gridWindow
@alias #gridWindow

@number sensitivity
@alias #sensitivity
@clamp 10 500
@default 64

@lang en
#plugin Add Vertical Scrollbar
#gridWindow Binding Grid Window
#sensitivity Sensitivity

@lang zh
#plugin 添加垂直滚动条
#gridWindow 绑定窗口元素
#sensitivity 灵敏度
*/

export default class MainScript {
  onStart(scrollBarContainer) {
    // 创建滚动条，放入容器
    if (this.gridWindow instanceof WindowElement) {
      const scrollBar = UI.createElement('a2ce8411f3d6f2ed')
      scrollBar.script.call('bindGridWindow', this.gridWindow)
      scrollBar.script.call('setSensitivity', this.sensitivity)
      scrollBarContainer.appendChild(scrollBar)
    }
  }
}