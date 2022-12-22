/*
@plugin #plugin
@version 1.0
@author Yami Sama
@link https://space.bilibili.com/124952089
@desc #desc

@option operation {'enable', 'disable', 'switch'}
@alias #operation {#enable, #disable, #switch}

@lang en
#plugin Switch Movement Path
#desc A Command for Movement Path Plugin
#operation Operation
#enable Enable
#disable Disable
#switch Switch

@lang zh
#plugin 开关移动路径
#desc 移动路径插件的相关指令
#operation 操作
#enable 开启
#disable 关闭
#switch 切换
*/

export default class SwitchMovementPath {
  call() {
    PluginManager.MovementPath?.[this.operation]()
  }
}