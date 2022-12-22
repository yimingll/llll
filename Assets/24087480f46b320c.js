/*
@plugin #plugin
@version 1.0
@author Yami Sama
@link https://space.bilibili.com/124952089
@desc #desc

@option operation {'enable', 'disable', 'switch'}
@alias #operation {#enable, #disable, #switch}

@lang en
#plugin Switch Trigger Shape Renderer
#desc A Command for Trigger Shape Renderer Plugin
#operation Operation
#enable Enable
#disable Disable
#switch Switch

@lang zh
#plugin 开关触发器形状渲染
#desc 触发器形状渲染器插件的相关指令
#operation 操作
#enable 开启
#disable 关闭
#switch 切换
*/

export default class SwitchTriggerShapeRenderer {
  call() {
    PluginManager.TriggerShapeRenderer?.[this.operation]()
  }
}