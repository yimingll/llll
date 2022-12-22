/*
@plugin #plugin
@version 1.0
@author Yami Sama
@link https://space.bilibili.com/124952089
@desc #desc

@string xKey
@alias #xKey
@default 'x'

@string yKey
@alias #yKey
@default 'y'

@lang en
#plugin Set Map Marker
#desc A Command for Map Marker Plugin
#xKey X Variable
#yKey Y Variable

@lang zh
#plugin 设置地图标记
#desc 地图标记插件的相关指令
#xKey X 变量
#yKey Y 变量
*/

export default class SetMapMarker {
  call() {
    const x = Event.attributes[this.xKey]
    const y = Event.attributes[this.yKey]
    if (typeof x === 'number' && typeof y === 'number') {
      PluginManager.MapMarker?.set(x, y)
    }
  }
}