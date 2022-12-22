/*
@plugin #plugin
@version 1.0
@author Yami Sama
@link https://space.bilibili.com/124952089
@desc #desc

@number range
@alias #range
@clamp 1 100
@default 10

@number angularSpeed
@alias #angularSpeed
@clamp 0 3600
@default 90

@number angularSpeedDev
@alias #angularSpeedDev
@clamp 0 360

@lang en
#plugin Trigger - Tracker
#desc Automatically find and follow nearby targets
#range Detection Range
#angularSpeed Angular Speed
#angularSpeedDev Angular Speed Dev

@lang zh
#plugin 触发器 - 追踪器
#desc 自动寻找并跟随附近的目标
#range 锁定范围
#angularSpeed 角速度
#angularSpeedDev 角速度偏差
*/

// 目标角色池
const targets = []
let targetCount = 0

export default class Tracker {
  trigger       //:object
  target        //:object
  angularSpeed  //:number

  onStart(trigger) {
    this.trigger = trigger
    const dev = this.vary(this.angularSpeedDev)
    const angle = Math.max(this.angularSpeed + dev, 0)
    this.angularSpeed = Math.radians(angle)
    this.searchTarget()
  }

  update() {
    let target = this.target
    if (!target.active) {
      this.searchTarget()
      target = this.target
      if (!target) return
    }
    const trigger = this.trigger
    const distX = target.x - trigger.x
    const distY = target.y - trigger.y
    const sAngle = trigger.angle
    const dAngle = Math.atan2(distY, distX)
    const iAngle = dAngle - sAngle
    const diff = Math.abs(iAngle)
    if (diff < 0.0001) return
    const angle = Math.modRadians(iAngle)
    const step = Math.min(this.angularSpeed * trigger.deltaTime / 1000, diff)
    trigger.angle += angle < Math.PI ? step : -step
    trigger.updateVelocity()
  }

  // 计算离散率
  vary(variance) {
    return variance === 0 ? 0 : variance * (Math.random() - Math.random())
  }

  // 搜索目标
  searchTarget() {
    const range = this.range
    const trigger = this.trigger
    const caster = trigger.caster
    const inspector = Actor.inspectors[trigger.selector]
    const relations = Team.relationMaps[caster.teamId]
    const {x, y} = caster
    const left = x - range
    const top = y - range
    const right = x + range
    const bottom = y + range
    const cells = Scene.actors.cells.get(left, top, right, bottom)
    const count = cells.count
    const rangeSquared = range ** 2
    for (let i = 0; i < count; i++) {
      const actors = cells[i]
      const length = actors.length
      for (let i = 0; i < length; i++) {
        const actor = actors[i]
        if (actor.active && inspector(caster, actor, relations)) {
          const distSquared = (x - actor.x) ** 2 + (y - actor.y) ** 2
          if (distSquared < rangeSquared) {
            targets[targetCount++] = actor
          }
        }
      }
    }
    if (targetCount !== 0) {
      const index = Math.floor(Math.random() * targetCount)
      this.target = targets[index]
      for (let i = 0; i < targetCount; i++) {
        targets[i] = undefined
      }
      targetCount = 0
    } else {
      trigger.updaters.remove(this)
    }
  }
}