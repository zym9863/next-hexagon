/**
 * 二维向量接口
 */
export interface Vector2D {
  x: number;
  y: number;
}

/**
 * 小球物理属性接口
 */
export interface Ball {
  position: Vector2D;
  velocity: Vector2D;
  radius: number;
  mass: number;
}

/**
 * 物理参数接口
 */
export interface PhysicsParams {
  gravity: number;
  airFriction: number;
  bounceDamping: number;
  minVelocity: number;
}

/**
 * 向量加法
 * @param v1 第一个向量
 * @param v2 第二个向量
 * @returns 结果向量
 */
export function addVectors(v1: Vector2D, v2: Vector2D): Vector2D {
  return {
    x: v1.x + v2.x,
    y: v1.y + v2.y,
  };
}

/**
 * 向量标量乘法
 * @param v 向量
 * @param scalar 标量
 * @returns 结果向量
 */
export function scaleVector(v: Vector2D, scalar: number): Vector2D {
  return {
    x: v.x * scalar,
    y: v.y * scalar,
  };
}

/**
 * 向量点积
 * @param v1 第一个向量
 * @param v2 第二个向量
 * @returns 点积结果
 */
export function dotProduct(v1: Vector2D, v2: Vector2D): number {
  return v1.x * v2.x + v1.y * v2.y;
}

/**
 * 向量长度
 * @param v 向量
 * @returns 向量长度
 */
export function vectorLength(v: Vector2D): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

/**
 * 向量归一化
 * @param v 向量
 * @returns 归一化后的向量
 */
export function normalizeVector(v: Vector2D): Vector2D {
  const length = vectorLength(v);
  if (length === 0) return { x: 0, y: 0 };
  return scaleVector(v, 1 / length);
}

/**
 * 应用重力
 * @param ball 小球对象
 * @param gravity 重力加速度
 * @param deltaTime 时间间隔
 */
export function applyGravity(
  ball: Ball,
  gravity: number,
  deltaTime: number,
): void {
  ball.velocity.y += gravity * deltaTime;
}

/**
 * 应用空气摩擦力
 * @param ball 小球对象
 * @param airFriction 空气摩擦系数
 * @param deltaTime 时间间隔
 */
export function applyAirFriction(
  ball: Ball,
  airFriction: number,
  deltaTime: number,
): void {
  const friction = 1 - airFriction * deltaTime;
  ball.velocity.x *= friction;
  ball.velocity.y *= friction;
}

/**
 * 更新小球位置
 * @param ball 小球对象
 * @param deltaTime 时间间隔
 */
export function updateBallPosition(ball: Ball, deltaTime: number): void {
  ball.position.x += ball.velocity.x * deltaTime;
  ball.position.y += ball.velocity.y * deltaTime;
}

/**
 * 计算反弹速度（考虑旋转墙壁）
 * @param velocity 入射速度
 * @param normal 墙壁法向量
 * @param wallVelocity 墙壁速度（由于旋转产生）
 * @param bounceDamping 反弹阻尼
 * @returns 反弹后的速度
 */
export function calculateBounceVelocity(
  velocity: Vector2D,
  normal: Vector2D,
  wallVelocity: Vector2D,
  bounceDamping: number,
): Vector2D {
  // 计算相对速度
  const relativeVelocity = {
    x: velocity.x - wallVelocity.x,
    y: velocity.y - wallVelocity.y,
  };

  // 计算法向速度分量
  const normalSpeed = dotProduct(relativeVelocity, normal);

  // 如果正在远离墙壁，不需要反弹
  if (normalSpeed > 0) {
    return velocity;
  }

  // 反弹速度 = 入射速度 - 2 * 法向速度分量 * 法向量
  const bounceVelocity = {
    x: velocity.x - 2 * normalSpeed * normal.x * bounceDamping,
    y: velocity.y - 2 * normalSpeed * normal.y * bounceDamping,
  };

  // 添加墙壁速度的影响
  bounceVelocity.x += wallVelocity.x * (1 - bounceDamping);
  bounceVelocity.y += wallVelocity.y * (1 - bounceDamping);

  return bounceVelocity;
}

/**
 * 限制最小速度（防止小球停止）
 * @param ball 小球对象
 * @param minVelocity 最小速度阈值
 */
export function clampMinVelocity(ball: Ball, minVelocity: number): void {
  const speed = vectorLength(ball.velocity);
  if (speed < minVelocity && speed > 0) {
    const scale = minVelocity / speed;
    ball.velocity.x *= scale;
    ball.velocity.y *= scale;
  }
}
