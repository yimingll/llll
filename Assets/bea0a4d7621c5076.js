/*
@plugin #plugin
@version 1.0
@author Yami Sama
@link https://space.bilibili.com/124952089
@desc #desc

@file animationId
@alias #animationId
@filter animation

@enum motion
@alias #motion

@number priority
@alias #priority
@clamp -4 4

@lang en
#plugin Map Marker
#desc
Play a marker animation at the specified position

Script Methods:
PluginManager.MapMarker.set(x, y)
#animationId Pointer Animation
#motion Motion
#priority Animation Priority

@lang zh
#plugin 地图标记
#desc
在指定位置播放一个标记动画

脚本方法:
PluginManager.MapMarker.set(x, y)
#animationId 标记动画
#motion 动作
#priority 动画优先级
*/

export default class MapMarker {
  position  //:object
  animation //:object

  onStart() {
    this.motion = this.motion?.value ?? ''
    const data = Data.animations[this.animationId]
    if (data) {
      this.position = {x: 0, y: 0}
      this.animation = new Animation(data)
      this.animation.setPosition(this.position)
      this.animation.priority = this.priority
      this.animation.destroy = Function.empty
      this.animation.version = 0
    }
  }

  // 设置位置
  set(x, y) {
    const {animation} = this
    const {animations} = Scene
    if (Scene.binding !== null &&
      animation instanceof Animation) {
      this.position.x = x
      this.position.y = y
      // 如果动画已经添加到管理器中
      animation.parent?.remove(animation)
      // 否则添加到场景中
      animations.append(animation)
      const version = ++animation.version
      if (animation.setMotion(this.motion)) {
        animation.restart()
        animation.onFinish(() => {
          Callback.push(() => {
            if (animation.version === version) {
              animations.remove(animation)
            }
          })
        })
      }
    }
  }
}