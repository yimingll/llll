/*
@plugin #plugin
@version 1.0
@author Yami Sama
@link https://space.bilibili.com/124952089
@desc #desc

@lang en
#plugin Exit the Game
#desc For desktop application mode

@lang zh
#plugin 退出游戏
#desc 桌面应用模式专用
*/

export default class ExitTheGame {
  call() {
    if (Stats.isOnClient) {
      window.close()
    }
  }
}