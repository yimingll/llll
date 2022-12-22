/*
@plugin #plugin
@version
@author Yami Sama
@link https://space.bilibili.com/124952089
@desc

@attribute-key name
@alias #name
@filter actor

@file seConfirm
@alias #seConfirm
@filter audio

@lang en
#plugin Dialog Box
#name Actor Name
#seConfirm SE Confirm

@lang zh
#plugin 对话框
#name 角色名称
#seConfirm 确定音效
*/

// 对话窗口脚本实例
class Manager {}

// 对话窗口脚本
class DialogWindowScript {
  constructor() {
    Manager = this
  }

  // 加载对话
  loadDialog(event) {
    this.onStart()
    this.state = 'dialog'
    this.event = event
    this.actor = event.targetActor
    this.content = Command.textContent

    // 加载角色名称和对话内容
    if (this.actor) {
      const name = Command.getParameter('name', 'string')
      this.dialogName.content = name ?? this.actor.attributes[this.name] ?? ''
      this.dialogContent.content = this.content
    }

    // 开关显示角色头像，并调整对话内容元素宽度
    if (this.actor?.portrait) {
      this.dialogPortraitContainer.show()
      this.dialogPortrait.setImageClip(this.actor.portrait, this.actor.clip)
      this.dialogFlexBox.set({width: this.dialogFlexBox.initialWidth})
    } else {
      this.dialogPortraitContainer.hide()
      this.dialogFlexBox.set({width: 0})
    }
  }

  // 加载选项
  loadChoices(event) {
    if (Command.choiceContents.length === 0) return
    this.onStart()
    this.state = 'option'
    this.event = event
    let i = 0
    const optionWindow = UI.createElement('171af282bea9fd02')
    for (const content of Command.choiceContents) {
      if (!content) continue
      const option = UI.createElement('43a657a56bfca9ad')
      const optionText = UI.get('084971b56664230e')
      option.script.add(new OptionScript())
      option.set({y: i * 44})
      option.value = i
      optionText.content = content
      optionWindow.appendChild(option)
      i++
    }
    let y = this.dialogContent.printEndY + 36
    if (this.dialogContent.content !== '') {
      y += 44
    }
    let width = optionWindow.transform.width
    // 如果对话框头像可见，调整选项窗口的位置
    if (this.dialogPortraitContainer.isVisible()) {
      const portraitContainer = UI.get('160a1022ff4fe004')
      width -= portraitContainer.transform.width
    }
    const height = i * 44
    optionWindow.set({y, width, height})
    this.dialogWindow.appendChild(optionWindow)
  }

  onStart() {
    if (!this.state) {
      Scene.preventInput()
      this.state = 'ready'
      this.maskElement = new ContainerElement()
      this.maskElement.set({width2: 1, height2: 1})
      this.dialogWindow = UI.get('c92fbe4db0564e36')
      this.dialogPortraitContainer = UI.get('160a1022ff4fe004').hide()
      this.dialogPortrait = UI.get('61d96b11c05a4cbd')
      this.dialogFlexBox = UI.get('f0c069d4d87d22f0')
      this.dialogFlexBox.initialWidth = this.dialogFlexBox.transform.width
      this.dialogName = UI.get('10690485e8c42dc1')
      this.dialogName.content = ''
      this.dialogContent = UI.get('02521df5ae008089')
      this.dialogContent.content = ''
      this.dialogPointer = UI.get('c8d0cec964b9620a')
      this.dialogPointer.hide()

      // 插入遮罩元素到对话框窗口的前面(用来阻止指针事件)
      this.dialogWindow.parent.insertBefore(this.maskElement, this.dialogWindow)

      // 侦听事件
      Input.on('keydown', this.onKeyDown, true)
      Input.on('mousedown', this._onMouseDown, true)
    }
  }

  update() {
    if (Input.keys.ControlLeft === 1 || Input.keys.ControlRight === 1) {
      this.continue()
    }
  }

  // 继续下一步
  continue() {
    if (this.state === 'dialog') {
      switch (this.dialogContent.state) {
        case 'updating':
          return this.dialogContent.printImmediately()
        case 'waiting':
          return this.dialogContent.printNextPage()
        case 'complete':
          return this.readyToClose()
      }
    }
  }

  // 准备关闭
  async readyToClose() {
    this.event.continue()
    this.state = 'inactive'
    // 等待一帧
    await Promise.resolve()
    Callback.push(() => {
      if (this.state === 'inactive') {
        this.dialogWindow.destroy()
      }
    })
  }

  // 销毁元素事件
  onDestroy() {
    Scene.restoreInput()
    Manager = null
    this.maskElement.destroy()
    Input.off('keydown', this.onKeyDown)
    Input.off('mousedown', this._onMouseDown)
  }

  // 键盘按下事件
  onKeyDown = () => {
    switch (Input.event.code) {
      case 'Enter':
        this.continue()
        break
    }
    Input.bubbles.stop()
  }

  // 鼠标按下事件
  _onMouseDown = () => {
    if (this.state === 'dialog') {
      switch (Input.event.button) {
        case 0:
          this.continue()
          break
      }
      Input.bubbles.stop()
    }
  }

  // 播放确定音效
  playConfirmSE() {
    AudioManager.se.play(this.seConfirm)
  }
}

// 对话选项脚本
class OptionScript {
  onClick(element) {
    Command.choiceIndex = element.value
    element.parent.destroy()
    Manager.playConfirmSE()
    Manager.readyToClose()
  }
}

export default DialogWindowScript