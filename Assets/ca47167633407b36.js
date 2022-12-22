/*
@plugin #plugin
@version
@author Yami Sama
@link https://space.bilibili.com/124952089
@desc #desc

@number velocityX
@alias #velocityX
@default 10

@number velocityY
@alias #velocityY
@default 0

@lang en
#plugin Image - Scroll
#desc Automatic image scrolling
#velocityX Velocity X
#velocityY Velocity Y

@lang zh
#plugin 图像 - 滚动效果
#desc 自动滚动图像
#velocityX 水平速度
#velocityY 垂直速度
*/

export default class Script {
  onStart(element) {
    if (element instanceof ImageElement) {
      this.imageElement = element
    } else {
      this.update = Function.empty
    }
  }

  update(deltaTime) {
    this.imageElement.shiftX += this.velocityX * deltaTime / 1000
    this.imageElement.shiftY += this.velocityY * deltaTime / 1000
  }
}