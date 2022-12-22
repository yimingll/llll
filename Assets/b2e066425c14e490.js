/*
@plugin #plugin
@version
@author Yami Sama
@link https://space.bilibili.com/124952089
@desc

@attribute-key name
@alias #name
@filter actor

@number offsetY
@alias #offsetY
@default -20

@lang en
#plugin Chat Box
#name Actor Name
#offsetY Offset Y

@lang zh
#plugin 聊天框
#name 角色名称
#offsetY 垂直偏移距离
*/

// 文本区域大小计算元素
let SizeCalculator

export default class ChatWindowScript {
  // 加载聊天内容
  loadChat(event) {
    this.onStart()
    this.state = 'active'
    this.event = event
    this.actor = event.targetActor
    this.content = Command.textContent
    this.elapsed = 0

    // 加载角色名称和对话内容
    if (this.actor) {
      this.chatName.content = this.actor.attributes[this.name] ?? ''
      this.chatContent.content = this.content
    }

    // 计算聊天框持续时间
    const duration = Command.getParameter('duration', 'number')
    if (duration > 0) {
      this.duration = duration
    } else {
      this.duration = this.chatContent.content.length * 200 + 2000
    }

    // 调整对话内容元素宽高
    SizeCalculator.content = this.chatContent.content
    SizeCalculator.update()
    const {textWidth, textHeight} = SizeCalculator
    this.chatContent.set({width: textWidth, height: textHeight})
    this.chatWindow.set({width: textWidth + 30, height: textHeight + 20})
  }

  onStart() {
    if (!this.state) {
      this.state = 'ready'
      this.chatWindow = UI.get('32cdd80fab0e9fff')
      this.chatWindow.pointerEvents = 'disabled'
      this.chatWindow.moveToIndex(0)
      this.chatName = UI.get('8b9bc5b6b8de8aa7')
      this.chatContent = UI.get('b7920709de9817a7')
      if (!SizeCalculator) {
        SizeCalculator = UI.createElement('8ad8ba7d0d47c7b7')
        SizeCalculator.width = this.chatContent.transform.width
      }
    }
  }

  // 更新
  update(deltaTime) {
    const actor = this.actor
    if ((this.elapsed += deltaTime) >= this.duration || actor.destroyed || actor.parent !== Scene.actors) {
      return this.chatWindow.destroy()
    }

    // 锁定聊天框相对于角色的位置
    const {x, y} = Camera.convertToScreenCoords(actor)
    if (this.lastX !== x || this.lastY !== y) {
      this.lastX = x
      this.lastY = y
      this.chatWindow.set({
        x: Math.round(x),
        y: Math.round(y + this.offsetY * Camera.zoom),
      })
    }
  }
}