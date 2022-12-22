/*
@plugin #plugin
@version
@author Yami Sama
@link https://space.bilibili.com/124952089
@desc

@string saveTitle
@alias #saveTitle
@default 'Save'

@string loadTitle
@alias #loadTitle
@default 'Load'

@number quantity
@alias #quantity
@clamp 1 20
@default 8

@string firstSaveName
@alias #firstSaveName
@default 'AUTOSAVE'

@string saveNameFormat
@alias #saveNameFormat
@default 'SAVE{index}'

@string dateFormat
@alias #dateFormat
@default '{Y}-{M}-{D} {h}:{m}:{s}'

@file seConfirm
@alias #seConfirm
@filter audio

@file seCancel
@alias #seCancel
@filter audio

@file seSave
@alias #seSave
@filter audio

@file seError
@alias #seError
@filter audio

@lang en
#plugin Save & Load
#saveTitle Save Title
#loadTitle Load Title
#quantity Save Quantity
#firstSaveName First Save Name
#saveNameFormat Save Name Format
#dateFormat Date Format
#seConfirm SE Confirm
#seCancel SE Cancel
#seSave SE Save
#seError SE Error

@lang zh
#plugin 保存 & 读取
#saveTitle 保存模式标题
#loadTitle 读取模式标题
#quantity 存档数量
#firstSaveName 首个存档名称
#saveNameFormat 存档名称格式
#dateFormat 日期格式
#seConfirm 确定音效
#seCancel 取消音效
#seSave 保存音效
#seError 错误音效
*/

class Manager {}

let MainWindow
let TitleText
let CloseButton
let GridWindow

let Mode = ''

export default class MainScript {
  // 在保存模式中打开
  openInSaveMode() {
    Mode = 'save'
    this.initialize()
  }

  // 在读取模式中打开
  openInLoadMode() {
    Mode = 'load'
    this.initialize()
  }

  initialize() {
    Manager = this

    // 隐藏主界面
    this.hideMainUI()

    // 获取元素
    MainWindow = UI.get('54c90b1029d916cf')
    TitleText = UI.get('c75aeaa66e6948c9')
    CloseButton = UI.get('f99d95a8d09d2389')
    CloseButton.script.add(new CloseButtonScript())
    GridWindow = UI.get('ad40507b3c91d2a4')

    // 设置标题内容
    this.setTitle()

    // 创建存档项目
    this.createItems()
  }

  onStart() {
    // 暂停场景
    Scene.pause()

    // 侦听事件
    Input.on('keydown', this.onKeyDown, true)
  }

  onDestroy() {
    Manager = null
    Scene.continue()
    this.restoreMainUI()
    this.playCancelSE()
    Input.off('keydown', this.onKeyDown)
  }

  onKeyDown() {
    switch (Input.event.code) {
      case 'Escape':
        MainWindow.destroy()
        break
    }
    Input.bubbles.stop()
  }

  // 设置标题内容
  setTitle() {
    switch (Mode) {
      case 'save':
        TitleText.content = this.saveTitle
        break
      case 'load':
        TitleText.content = this.loadTitle
        break
    }
  }

  // 创建存档项目
  createItems() {
    Data.loadSaveMeta().then(list => {
      GridWindow.clear()
      let index = 0
      for (const meta of list) {
        const {name, data} = meta
        const number = parseInt(name.slice(4))
        const end = Math.min(number, this.quantity)
        // 创建空存档卡
        while (index < end) {
          this.createItem(index++)
        }
        if (index === this.quantity) return
        // 创建当前存档卡
        const saveCard = this.createItem(index++)
        saveCard.elScreenshot.loadBase64(data.screenshot)
        saveCard.blank = false
        saveCard.elDate = UI.createElement('6b509e4dab0eb969')
        saveCard.elDate.content = Time.parseDateTimestamp(data.timestamp, this.dateFormat)
        saveCard.elClose = UI.createElement('c04c3e2fedd5a20d')
        saveCard.elClose.script.add(new SaveCardCloseButtonScript())
        saveCard.appendChild(saveCard.elClose)
        saveCard.appendChild(saveCard.elDate)
      }
      // 创建空存档卡(尾部)
      while (index < this.quantity) {
        this.createItem(index++)
      }
    })
  }

  // 创建单个存档项目
  createItem(index) {
    const saveCard = UI.createElement('9e72008e9379ef9d')
    saveCard.script.add(new SaveCardScript())
    saveCard.blank = true
    saveCard.index = index
    saveCard.elNumber = UI.get('392ba37874fa0354')
    saveCard.elNumber.content = index === 0 && Manager.firstSaveName
    ? Manager.firstSaveName
    : Manager.saveNameFormat.replace('{index}', index.toString().padStart(2, '0'))
    saveCard.elScreenshot = UI.get('efb29031882efbb6')
    GridWindow.appendChild(saveCard)
    return saveCard
  }

  // 隐藏主界面
  hideMainUI() {
    const mainUI = UI.get('ad479a00db708bd4')
    if (mainUI?.visible) {
      mainUI.hide()
      this.hiddenMainUI = mainUI
    }
  }

  // 恢复主界面
  restoreMainUI() {
    if (this.hiddenMainUI) {
      this.hiddenMainUI.show()
      this.hiddenMainUI = null
    }
  }

  // 播放确定音效
  playConfirmSE() {
    AudioManager.se.play(this.seConfirm)
  }

  // 播放取消音效
  playCancelSE() {
    AudioManager.se.play(this.seCancel)
  }

  // 播放保存音效
  playSaveSE() {
    AudioManager.se.play(this.seSave)
  }

  // 播放错误音效
  playErrorSE() {
    AudioManager.se.play(this.seError)
  }
}

// 存档卡片脚本
class SaveCardScript {
  onClick(saveCard) {
    switch (Mode) {
      case 'save': {
        Manager.playSaveSE()
        const timestamp = Date.now()
        const width = saveCard.elScreenshot.width
        const height = saveCard.elScreenshot.height
        const screenshot = GL.offscreen.current.toBase64(width, height)
        const meta = {timestamp, screenshot}
        Data.saveGameData(saveCard.index, meta).then(() => {
          Manager.createItems()
        })
        break
      }
      case 'load':
        if (!saveCard.blank) {
          const manager = Manager
          Callback.push(() => {
            manager.playSaveSE()
          })
          MainWindow.destroy()
          Data.loadGameData(saveCard.index)
        } else {
          Manager.playErrorSE()
        }
        break
    }
  }
}

// 存档卡关闭按钮脚本
class SaveCardCloseButtonScript {
  onClick(button) {
    // 打开存档删除确认窗口
    Manager.playConfirmSE()
    const saveCard = button.parent
    const window = UI.add('5649a01235f4fb64')
    window.script.add(new DeleteSaveWindowScript())
    window.index = saveCard.index
    window.confirm = UI.get('f86819ccaf1d2915')
    window.cancel = UI.get('7990f65d5af52118')
    window.confirm.script.add(new DeleteSaveConfirmScript())
    window.cancel.script.add(new DeleteSaveCancelScript())
    Input.bubbles.stop()
  }
}

// 删除存档窗口脚本
class DeleteSaveWindowScript {
  onAdd(element) {
    this.element = element
    Input.on('keydown', this.onKeyDown, true)
  }

  onDestroy() {
    Input.off('keydown', this.onKeyDown)
  }

  onKeyDown = () => {
    switch (Input.event.code) {
      case 'Escape':
        Manager.playCancelSE()
        this.element.destroy()
        break
    }
    Input.bubbles.stop()
  }
}

// 删除存档确认按钮脚本
class DeleteSaveConfirmScript {
  onClick(button) {
    Manager.playConfirmSE()
    const window = button.parent
    const index = window.index
    window.destroy()
    Data.deleteGameData(index).then(() => {
      Manager.createItems()
    })
  }
}

// 删除存档取消按钮脚本
class DeleteSaveCancelScript {
  onClick(button) {
    Manager.playConfirmSE()
    button.parent.destroy()
  }
}

// 关闭按钮脚本
class CloseButtonScript {
  onClick() {
    MainWindow.destroy()
  }
}