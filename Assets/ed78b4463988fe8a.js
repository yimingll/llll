/*
@plugin #plugin
@version 1.0
@author Yami Sama
@link https://space.bilibili.com/124952089
@desc #desc

@option operation {'enable', 'disable', 'talk'}
@alias #operation {#enable, #disable, #talk}

@string xKey
@alias #xKey
@default 'x'
@cond operation {'talk'}

@string yKey
@alias #yKey
@default 'y'
@cond operation {'talk'}

@string resultKey
@alias #resultKey
@desc #resultKey-desc
@default 'result'
@cond operation {'talk'}

@lang en
#plugin Dialogue System
#desc A Command for Dialogue System Plugin
#operation Operation
#enable Enable
#disable Disable
#talk Talk to an Actor
#xKey X Variable
#yKey Y Variable
#resultKey Result Variable
#resultKey-desc
true: succeeded
false: failed

@lang zh
#plugin 对话系统
#desc 对话系统插件的相关指令
#operation 操作
#enable 启用
#disable 禁用
#talk 找人对话
#xKey X 变量
#yKey Y 变量
#resultKey 返回结果变量
#resultKey-desc
true: 成功
false: 失败
*/

export default class DialogueSystem {
  call() {
    switch (this.operation) {
      case 'enable':
      case 'disable':
        PluginManager.DialogueSystem?.[this.operation]()
        break
      case 'talk': {
        const {xKey, yKey, resultKey} = this
        const x = Event.attributes[xKey]
        const y = Event.attributes[yKey]
        if (typeof x === 'number' && typeof y === 'number') {
          const result = !!PluginManager.DialogueSystem?.talk(x, y)
          if (resultKey) Event.attributes[resultKey] = result
        }
        break
      }
    }
  }
}