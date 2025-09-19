import type { Vector2D } from "./physics";

/**
 * 线段接口
 */
export interface LineSegment {
  start: Vector2D;
  end: Vector2D;
}

/**
 * 六边形接口
 */
export interface Hexagon {
  center: Vector2D;
  radius: number;
  rotation: number; // 弧度
}

/**
 * 获取六边形的顶点
 * @param hexagon 六边形对象
 * @returns 六个顶点的数组
 */
export function getHexagonVertices(hexagon: Hexagon): Vector2D[] {
  const vertices: Vector2D[] = [];
  const { center, radius, rotation } = hexagon;

  for (let i = 0; i < 6; i++) {
    const angle = rotation + (Math.PI / 3) * i;
    vertices.push({
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
    });
  }

  return vertices;
}

/**
 * 获取六边形的边
 * @param hexagon 六边形对象
 * @returns 六条边的数组
 */
export function getHexagonEdges(hexagon: Hexagon): LineSegment[] {
  const vertices = getHexagonVertices(hexagon);
  const edges: LineSegment[] = [];

  for (let i = 0; i < 6; i++) {
    edges.push({
      start: vertices[i],
      end: vertices[(i + 1) % 6],
    });
  }

  return edges;
}

/**
 * 计算点到线段的最短距离
 * @param point 点
 * @param segment 线段
 * @returns 最短距离和最近点
 */
export function pointToSegmentDistance(
  point: Vector2D,
  segment: LineSegment,
): { distance: number; closestPoint: Vector2D } {
  const { start, end } = segment;

  // 线段向量
  const segmentVector = {
    x: end.x - start.x,
    y: end.y - start.y,
  };

  // 点到线段起点的向量
  const pointVector = {
    x: point.x - start.x,
    y: point.y - start.y,
  };

  // 计算投影参数
  const segmentLengthSquared =
    segmentVector.x * segmentVector.x + segmentVector.y * segmentVector.y;
  let t = 0;

  if (segmentLengthSquared !== 0) {
    t =
      (pointVector.x * segmentVector.x + pointVector.y * segmentVector.y) /
      segmentLengthSquared;
    t = Math.max(0, Math.min(1, t)); // 限制在[0,1]范围内
  }

  // 计算最近点
  const closestPoint = {
    x: start.x + t * segmentVector.x,
    y: start.y + t * segmentVector.y,
  };

  // 计算距离
  const dx = point.x - closestPoint.x;
  const dy = point.y - closestPoint.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return { distance, closestPoint };
}

/**
 * 检测圆与线段的碰撞
 * @param center 圆心
 * @param radius 半径
 * @param segment 线段
 * @returns 是否碰撞和碰撞信息
 */
export function circleSegmentCollision(
  center: Vector2D,
  radius: number,
  segment: LineSegment,
): {
  collided: boolean;
  normal?: Vector2D;
  depth?: number;
  contactPoint?: Vector2D;
} {
  const { distance, closestPoint } = pointToSegmentDistance(center, segment);

  if (distance >= radius) {
    return { collided: false };
  }

  // 计算法向量（从线段指向圆心）
  const normal = {
    x: center.x - closestPoint.x,
    y: center.y - closestPoint.y,
  };

  // 归一化法向量
  const normalLength = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
  if (normalLength > 0) {
    normal.x /= normalLength;
    normal.y /= normalLength;
  }

  // 穿透深度
  const depth = radius - distance;

  return {
    collided: true,
    normal,
    depth,
    contactPoint: closestPoint,
  };
}

/**
 * 计算六边形边上某点的切向速度（由于旋转）
 * @param point 边上的点
 * @param hexagon 六边形
 * @param angularVelocity 角速度（弧度/秒）
 * @returns 切向速度向量
 */
export function getWallVelocity(
  point: Vector2D,
  hexagon: Hexagon,
  angularVelocity: number,
): Vector2D {
  // 计算点相对于中心的向量
  const relativePos = {
    x: point.x - hexagon.center.x,
    y: point.y - hexagon.center.y,
  };

  // 切向速度 = 角速度 × 半径向量（垂直方向）
  return {
    x: -relativePos.y * angularVelocity,
    y: relativePos.x * angularVelocity,
  };
}

/**
 * 获取边的外法向量
 * @param edge 边
 * @returns 归一化的外法向量
 */
export function getEdgeNormal(edge: LineSegment): Vector2D {
  // 边向量
  const edgeVector = {
    x: edge.end.x - edge.start.x,
    y: edge.end.y - edge.start.y,
  };

  // 法向量（垂直于边，指向外侧）
  const normal = {
    x: -edgeVector.y,
    y: edgeVector.x,
  };

  // 归一化
  const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
  if (length > 0) {
    normal.x /= length;
    normal.y /= length;
  }

  return normal;
}

/**
 * 检测点是否在六边形内部
 * @param point 点
 * @param hexagon 六边形
 * @returns 是否在内部
 */
export function isPointInHexagon(point: Vector2D, hexagon: Hexagon): boolean {
  const vertices = getHexagonVertices(hexagon);

  // 使用叉积判断点在所有边的同一侧
  for (let i = 0; i < 6; i++) {
    const v1 = vertices[i];
    const v2 = vertices[(i + 1) % 6];

    // 计算叉积
    const crossProduct =
      (v2.x - v1.x) * (point.y - v1.y) - (v2.y - v1.y) * (point.x - v1.x);

    // 如果点在边的外侧
    if (crossProduct < 0) {
      return false;
    }
  }

  return true;
}
