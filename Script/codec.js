'use strict'

// ******************************** 编解码器 ********************************

const Codec = new class {
  // 文本编解码器
  textEncoder = new TextEncoder()
  textDecoder = new TextDecoder()

  /**
   * 解码场景(解析JSON，顺便解码地形)
   * @param {string} code 场景JSON代码
   * @returns {Object} 场景数据
   */
  decodeScene(code) {
    const SCENE = JSON.parse(code)
    const {width, height} = SCENE
    SCENE.terrains = this.decodeTerrains(SCENE.terrains, width, height)
    return SCENE
  }

  /**
   * 解码图块(编辑器对图块进行编码，大幅压缩了数据大小)
   * @param {string} code 图块数据编码
   * @param {number} width 瓦片地图宽度
   * @param {number} height 瓦片地图高度
   * @returns {Uint32Array} 图块数据列表
   */
  decodeTiles(code, width, height) {
    const {decodeClone} = this
    const BYTES = this.textEncoder.encode(code)
    const BYTES_LENGTH = BYTES.length
    const TILES = new Uint32Array(width * height)
    const TILES_LENGTH = TILES.length
    let Bi = 0
    let Ti = 0
    while (Bi < BYTES_LENGTH) {
      const CODE = BYTES[Bi]
      if (CODE <= 98) {
        TILES[Ti] =
          (BYTES[Bi    ] - 35 << 26)
        + (BYTES[Bi + 1] - 35 << 20)
        + (BYTES[Bi + 2] - 35 << 14)
        + (BYTES[Bi + 3] - 35 << 8)
        + (BYTES[Bi + 4] - 35)
        Ti += 1
        Bi += 5
      } else if (CODE <= 109) {
        if (CODE !== 109) {
          const COPY = TILES[Ti - 1]
          const END = Ti + CODE - 98
          while (Ti < END) {
            TILES[Ti++] = COPY
          }
          Bi += 1
        } else {
          const {index, count} = decodeClone(BYTES, ++Bi)
          const COPY = TILES[Ti - 1]
          const END = Ti + count
          while (Ti < END) {
            TILES[Ti++] = COPY
          }
          Bi = index
        }
      } else {
        if (CODE !== 126) {
          Ti += CODE - 109
          Bi += 1
        } else {
          const {index, count} = decodeClone(BYTES, ++Bi)
          Ti += count
          Bi = index
        }
      }
    }
    if (Bi !== BYTES_LENGTH || Ti !== TILES_LENGTH) {
      throw new RangeError(`
      Failed to decode tiles.
      Processed bytes: ${Bi} / ${BYTES_LENGTH}
      Restored data: ${Ti} / ${TILES_LENGTH}
      `)
    }
    return TILES
  }

  /**
   * 解码地形
   * @param {string} code 地形数据编码
   * @param {number} width 场景宽度
   * @param {number} height 场景高度
   * @returns {Uint8Array} 地形数据列表
   */
  decodeTerrains(code, width, height) {
    const {decodeClone} = this
    const BYTES = this.textEncoder.encode(code)
    const BYTES_LENGTH = BYTES.length
    const TERRAINS = new Uint8Array(width * height)
    const TERRAINS_LENGTH = TERRAINS.length
    let Bi = 0
    let Ti = 0
    while (Bi < BYTES_LENGTH) {
      const CODE = BYTES[Bi]
      if (CODE <= 50) {
        TERRAINS[Ti] = CODE - 35
        Ti += 1
        Bi += 1
      } else if (CODE <= 76) {
        if (CODE !== 76) {
          const COPY = TERRAINS[Ti - 1]
          const END = Ti + CODE - 50
          while (Ti < END) {
            TERRAINS[Ti++] = COPY
          }
          Bi += 1
        } else {
          const {index, count} = decodeClone(BYTES, ++Bi)
          const COPY = TERRAINS[Ti - 1]
          const END = Ti + count
          while (Ti < END) {
            TERRAINS[Ti++] = COPY
          }
          Bi = index
        }
      } else {
        if (CODE !== 126) {
          Ti += CODE - 76
          Bi += 1
        } else {
          const {index, count} = decodeClone(BYTES, ++Bi)
          Ti += count
          Bi = index
        }
      }
    }
    if (Bi !== BYTES_LENGTH || Ti !== TERRAINS_LENGTH) {
      throw new RangeError(`
      Failed to decode terrains.
      Processed bytes: ${Bi} / ${BYTES_LENGTH}
      Restored data: ${Ti} / ${TERRAINS_LENGTH}
      `)
    }
    return TERRAINS
  }

  /**
   * 编码队伍关系
   * @param {Uint8Array} relations 队伍关系数据列表
   * @returns {string} 队伍关系编码
   */
  encodeRelations(relations) {
    const RELATIONS = relations
    const LENGTH = RELATIONS.length
    const BYTES = GL.arrays[0].uint8
    let Bi = 0
    let Ri = 0
    while (Ri < LENGTH) {
      BYTES[Bi++] = 35 + (
        RELATIONS[Ri    ]
      | RELATIONS[Ri + 1] << 1
      | RELATIONS[Ri + 2] << 2
      | RELATIONS[Ri + 3] << 3
      | RELATIONS[Ri + 4] << 4
      | RELATIONS[Ri + 5] << 5
      )
      Ri += 6
    }
    return this.textDecoder.decode(
      new Uint8Array(BYTES.buffer, 0, Bi)
    )
  }

  /**
   * 解码队伍关系
   * @param {string} code 队伍关系编码
   * @param {number} length 队伍数量
   * @returns {Uint8Array} 队伍关系数据列表
   */
  decodeRelations(code, length) {
    const BYTES = this.textEncoder.encode(code)
    const BYTES_LENGTH = BYTES.length
    const RELATIONS_LENGTH = (length + 1) / 2 * length
    const RELATIONS = new Uint8Array(RELATIONS_LENGTH)
    let Bi = 0
    let Ri = 0
    while (Bi < BYTES_LENGTH) {
      const CODE = BYTES[Bi] - 35
      RELATIONS[Ri    ] = CODE      & 0b000001
      RELATIONS[Ri + 1] = CODE >> 1 & 0b00001
      RELATIONS[Ri + 2] = CODE >> 2 & 0b0001
      RELATIONS[Ri + 3] = CODE >> 3 & 0b001
      RELATIONS[Ri + 4] = CODE >> 4 & 0b01
      RELATIONS[Ri + 5] = CODE >> 5
      Ri += 6
      Bi += 1
    }
    if (Bi !== BYTES_LENGTH || Ri < RELATIONS_LENGTH) {
      throw new RangeError(`
      Failed to decode relations.
      Processed bytes: ${Bi} / ${BYTES_LENGTH}
      Restored data: ${Ri} / ${RELATIONS_LENGTH}
      `)
    }
    return RELATIONS
  }

  /**
   * 解码克隆数据
   * @param {Uint8Array} array 字节码列表
   * @param {number} index 字节码索引
   * @returns {{index: number, count: number}} {结束位置, 克隆数量}
   */
  decodeClone(array, index) {
    let count = 0
    let code
    do {
      code = array[index++] - 35
      count = count << 5 | code & 0b011111
    }
    while (code & 0b100000)
    return {index, count}
  }
}