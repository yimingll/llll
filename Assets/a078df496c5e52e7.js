/*
@plugin #plugin
@version 1.0
@author Yami Sama
@link https://space.bilibili.com/124952089

@actor actor
@alias #actor

@lang en
#plugin Light - Follow Actor
#actor Actor

@lang zh
#plugin 光源 - 跟随角色
#actor 角色
*/

export default class LightFollowActor {
  actor //:object
  light //:object

  constructor(light) {
    this.light = light
  }

  update() {
    const {actor, light} = this
    if (!actor.destroyed && actor.parent === Scene.actors) {
      light.x = actor.x
      light.y = actor.y
    }
  }
}