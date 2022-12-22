/*
@plugin #plugin
@version 1.0
@author Yami Sama
@link https://space.bilibili.com/124952089

@number speedDev
@alias #speedDev
@clamp 0 100

@number angleDev
@alias #angleDev
@clamp 0 360

@number durationDev
@alias #durationDev
@clamp 0 36000

@lang en
#plugin Trigger - Random Parameters
#speedDev Speed Deviation
#angleDev Angle Deviation
#durationDev Duration Deviation

@lang zh
#plugin 触发器 - 随机参数
#speedDev 速度偏差
#angleDev 角度偏差
#durationDev 持续时间偏差
*/
const {random, max, radians} = Math

// 计算离散率
const vary = variance => {
  return variance === 0 ? 0 : variance * (random() - random())
}

export default class TriggerAdjustment {
  trigger //:object

  constructor(trigger) {
    this.trigger = trigger
  }

  onStart() {
    const {trigger} = this
    if (this.speedDev !== 0) {
      const dev = vary(this.speedDev)
      const speed = max(trigger.speed + dev, 0)
      trigger.setSpeed(speed)
    }
    if (this.angleDev !== 0) {
      const dev = vary(radians(this.angleDev))
      const angle = max(trigger.angle + dev, 0)
      trigger.setAngle(angle)
    }
    if (this.durationDev !== 0) {
      const dev = vary(this.durationDev)
      const duration = max(trigger.duration + dev, 0)
      trigger.duration = duration
    }
  }
}