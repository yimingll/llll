/*
@plugin #plugin
@version
@author Yami Sama
@link https://space.bilibili.com/124952089
@desc

@lang en
#plugin Vertical Scroll Bar

#lang zh
#plugin 垂直滚动条

*/

export default class MainScript {
  sensitivity = 64

  // 绑定网格窗口
  bindGridWindow(gridWindow) {
    if (gridWindow instanceof WindowElement) {
      this.gridWindow = gridWindow
      gridWindow.script.add(new WindowMouseWheelScript(this))
    }
  }

  // 设置滚动灵敏度
  setSensitivity(sensitivity) {
    this.sensitivity = sensitivity
  }

  onStart(element) {
    this.decrementButton = UI.get('e1168760e27e0de1')
    this.incrementButton = UI.get('af0afec479d14156')
    this.scrollBarTrack = UI.get('b0c551937dd55aa9')
    this.scrollBarThumb = UI.get('4a1ba16b81eb1a75')
    if (this.decrementButton instanceof UIElement &&
      this.incrementButton instanceof UIElement &&
      this.scrollBarTrack instanceof UIElement &&
      this.scrollBarThumb instanceof UIElement) {
      this.scrollBar = element
      this.decrementButton.script.add(new ScrollButtonScript(this, -this.sensitivity))
      this.incrementButton.script.add(new ScrollButtonScript(this, this.sensitivity))
      this.scrollBarThumb.script.add(new ScrollThumbScript(this))
    } else {
      return this.update = Function.empty
    }
  }

  update() {
    if (this.scrollY !== this.gridWindow.scrollY || this.scrollHeight !== this.gridWindow.scrollHeight) {
      this.scrollY = this.gridWindow.scrollY
      this.scrollHeight = this.gridWindow.scrollHeight
      this.resizeScrollBar()
    }
  }

  // 重新调整滚动条
  resizeScrollBar() {
    const ratioY = this.gridWindow.scrollY / this.gridWindow.scrollHeight
    const ratioH = this.gridWindow.height / this.gridWindow.scrollHeight
    if (ratioH >= 1) return this.scrollBar.hide()
    this.scrollBarThumb.set({
      y: ratioY * this.scrollBarTrack.height,
      height: ratioH * this.scrollBarTrack.height,
    })
    this.scrollBar.show()
  }
}

// 滚动按钮脚本
class ScrollButtonScript {
  constructor(manager, sensitivity) {
    this.manager = manager
    this.sensitivity = sensitivity
  }

  onMouseDownLB() {
    this.manager.gridWindow.scrollY += this.sensitivity
  }
}

// 滚动滑块脚本
class ScrollThumbScript {
  constructor(manager) {
    this.gridWindow = manager.gridWindow
    this.scrollBarTrack = manager.scrollBarTrack
    this.mouseDownY = 0
    this.startScrollY = 0
  }

  onDestroy() {
    // 释放拖拽状态
    this.windowOnMouseUpLB()
  }

  onMouseDownLB() {
    this.mouseDownY = Input.mouse.screenY
    this.startScrollY = this.gridWindow.scrollY
    Input.on('mousemove', this.windowOnMouseMove, true)
    Input.on('mouseupLB', this.windowOnMouseUpLB, true)
  }

  windowOnMouseUpLB = () => {
    Input.off('mousemove', this.windowOnMouseMove)
    Input.off('mouseupLB', this.windowOnMouseUpLB)
    Input.bubbles.stop()
  }

  windowOnMouseMove = () => {
    const ratioY = this.gridWindow.scrollHeight / this.scrollBarTrack.height
    const deltaY = (Input.mouse.screenY - this.mouseDownY) * ratioY
    this.gridWindow.scrollY = this.startScrollY + deltaY
  }
}

// 窗口鼠标滚轮脚本
class WindowMouseWheelScript {
  constructor(manager) {
    this.manager = manager
    this.scrollTime = 0
    this.scrollTargetY = 0
  }

  onWheel() {
    const manager = this.manager
    const gridWindow = manager.gridWindow
    const sensitivity = manager.sensitivity
    const deltaY = Input.event.deltaY
    if (this.scrollTime <= 0) {
      this.scrollTargetY = gridWindow.scrollY
    }
    let scrollY = this.scrollTargetY
    // 向上滚动
    if (deltaY < 0) {
      scrollY = Math.max(scrollY - sensitivity, 0)
    }
    // 向下滚动
    if (deltaY > 0) {
      const maxScrollY = gridWindow.scrollHeight - gridWindow.height
      scrollY = Math.min(scrollY + sensitivity, maxScrollY)
    }
    // 检查滚动有效性
    if (gridWindow.scrollY !== scrollY) {
      this.scrollTime = 100
      this.scrollTargetY = scrollY
    }
  }

  update(deltaTime) {
    if (this.scrollTime > 0) {
      const gridWindow = this.manager.gridWindow
      const ratioY = Math.min(deltaTime / this.scrollTime, 1)
      const deltaY = (this.scrollTargetY - gridWindow.scrollY) * ratioY
      if ((this.scrollTime -= deltaTime) <= 0) {
        gridWindow.scrollY = this.scrollTargetY
      } else {
        gridWindow.scrollY += deltaY
      }
    }
  }
}