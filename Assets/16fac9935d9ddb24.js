/*
@plugin YAMI UI
@version 1.0
@author Yami Sama
@link https://space.bilibili.com/124952089
@desc #desc

@option operation {
  'open-main-ui',
  'close-main-ui',
  'open-menu-window',
  'open-dialog-window',
  'open-choice-window',
  'open-chat-window',
  'open-save-window',
  'open-load-window',
  'open-trade-window',
}
@alias #operation {
  #open-main-ui,
  #close-main-ui,
  #open-menu-window,
  #open-dialog-window,
  #open-choice-window,
  #open-chat-window,
  #open-save-window,
  #open-load-window,
  #open-trade-window,
}

@lang en
#desc A set of basic RPG interface
#operation Operation
#open-main-ui Open Main Interface
#close-main-ui Close Main Interface
#open-menu-window Open Menu Window
#open-dialog-window Open Dialog Window
#open-choice-window Open Choice Window
#open-chat-window Open Chat Window
#open-save-window Open Save Window
#open-load-window Open Load Window
#open-trade-window Open Trade Window

@lang zh
#desc 一套基础RPG界面
#operation 操作
#open-main-ui 打开主界面
#close-main-ui 关闭主界面
#open-menu-window 打开菜单
#open-dialog-window 打开对话框
#open-choice-window 打开选择框
#open-chat-window 打开气泡框
#open-save-window 打开保存窗口
#open-load-window 打开读取窗口
#open-trade-window 打开交易窗口
*/

export default class Plugin {
  call() {
    switch (this.operation) {
      case 'open-main-ui':
        return this.openMainUI()
      case 'close-main-ui':
        return this.closeMainUI()
      case 'open-menu-window':
        return this.openMenuWindow()
      case 'open-dialog-window':
        return this.openDialogWindow()
      case 'open-choice-window':
        return this.openChoiceWindow()
      case 'open-chat-window':
        return this.openChatWindow()
      case 'open-save-window':
        return this.openSaveWindow()
      case 'open-load-window':
        return this.openLoadWindow()
      case 'open-trade-window':
        return this.openTradeWindow()
    }
  }

  // 打开主界面
  openMainUI() {
    if (!UI.get('ad479a00db708bd4')) {
      UI.add('ad479a00db708bd4')
    }
  }

  // 关闭主界面
  closeMainUI() {
    UI.get('ad479a00db708bd4')?.destroy()
  }

  // 打开菜单窗口
  openMenuWindow() {
    if (!UI.get('016c09707e098490') && Party.player) {
      UI.add('016c09707e098490')
    }
  }

  // 打开对话窗口
  openDialogWindow() {
    let dialogWindow = UI.get('c92fbe4db0564e36')
    if (dialogWindow instanceof UIElement) {
      // 如果对话框正在使用，返回
      const script = dialogWindow.script.DialogWindowScript
      if (script.state !== 'inactive') return
    }
    if (!dialogWindow) {
      dialogWindow = UI.add('c92fbe4db0564e36')
    }
    if (dialogWindow instanceof UIElement) {
      dialogWindow.script.call('loadDialog', Event)
      return Event.pause()
    }
  }

  // 打开选择窗口
  openChoiceWindow() {
    let dialogWindow = UI.get('c92fbe4db0564e36')
    if (dialogWindow instanceof UIElement) {
      // 如果对话框正在使用，返回
      const script = dialogWindow.script.DialogWindowScript
      if (script.state !== 'inactive') return
    }
    if (!dialogWindow) {
      dialogWindow = UI.add('c92fbe4db0564e36')
    }
    if (dialogWindow instanceof UIElement) {
      dialogWindow.script.call('loadChoices', Event)
      return Event.pause()
    }
  }

  // 打开聊天窗口
  openChatWindow() {
    if (Scene.binding === null) return
    const actor = Event.targetActor
    if (actor instanceof Actor) {
      // 如果角色在屏幕中可见(过滤屏幕外角色)
      const {x, y} = Scene.convert(actor)
      if (x >= Camera.scrollLeft &&
        y >= Camera.scrollTop &&
        x < Camera.scrollRight &&
        y < Camera.scrollBottom) {
        let {_actorChatWindow} = actor
        // 如果不存在角色聊天框，创建并互相绑定
        if (!_actorChatWindow) {
          _actorChatWindow = UI.add('32cdd80fab0e9fff')
          _actorChatWindow.actor = actor
          _actorChatWindow.script.add({
            onDestroy() {
              delete actor._actorChatWindow
            }
          })
          actor._actorChatWindow = _actorChatWindow
        }
        _actorChatWindow.script.call('loadChat', Event)
      }
    }
  }

  // 打开保存窗口
  openSaveWindow() {
    if (!UI.get('54c90b1029d916cf')) {
      UI.add('54c90b1029d916cf').script.call('openInSaveMode')
    }
  }

  // 打开读取窗口
  openLoadWindow() {
    if (!UI.get('54c90b1029d916cf')) {
      UI.add('54c90b1029d916cf').script.call('openInLoadMode')
    }
  }

  // 打开交易窗口
  openTradeWindow() {
    const shopkeeper = Event.targetActor ?? Event.triggerActor
    if (!UI.get('92057ab96e5b1278') && shopkeeper && Party.player) {
      UI.add('92057ab96e5b1278').script.call('setActors', shopkeeper, Party.player)
    }
  }
}