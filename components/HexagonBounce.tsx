"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  circleSegmentCollision,
  getHexagonEdges,
  getHexagonVertices,
  getWallVelocity,
  type Hexagon,
  isPointInHexagon,
} from "@/lib/geometry";
import {
  applyAirFriction,
  applyGravity,
  type Ball,
  calculateBounceVelocity,
  clampMinVelocity,
  type PhysicsParams,
  updateBallPosition,
  type Vector2D,
} from "@/lib/physics";

/**
 * 六边形弹跳小球组件
 */
const HexagonBounce: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // 游戏状态
  const [isPaused, setIsPaused] = useState(false);
  const [showTrail, setShowTrail] = useState(true);

  // 物理参数
  const [physicsParams, setPhysicsParams] = useState<PhysicsParams>({
    gravity: 500,
    airFriction: 0.02,
    bounceDamping: 0.85,
    minVelocity: 50,
  });

  // 旋转速度（弧度/秒）
  const [rotationSpeed, setRotationSpeed] = useState(0.5);

  // 小球状态
  const ballRef = useRef<Ball>({
    position: { x: 400, y: 200 },
    velocity: { x: 200, y: 0 },
    radius: 10,
    mass: 1,
  });

  // 六边形状态
  const hexagonRef = useRef<Hexagon>({
    center: { x: 400, y: 300 },
    radius: 200,
    rotation: 0,
  });

  // 轨迹点
  const trailRef = useRef<Vector2D[]>([]);
  const maxTrailLength = 50;

  /**
   * 重置小球位置
   */
  const resetBall = useCallback(() => {
    ballRef.current = {
      position: { x: 400, y: 200 },
      velocity: { x: Math.random() * 400 - 200, y: Math.random() * 200 - 100 },
      radius: 10,
      mass: 1,
    };
    trailRef.current = [];
  }, []);

  /**
   * 处理碰撞
   */
  const handleCollisions = useCallback(
    (ball: Ball, hexagon: Hexagon, angularVelocity: number) => {
      const edges = getHexagonEdges(hexagon);

      for (const edge of edges) {
        const collision = circleSegmentCollision(
          ball.position,
          ball.radius,
          edge,
        );

        if (collision.collided && collision.normal && collision.contactPoint) {
          // 计算墙壁速度
          const wallVelocity = getWallVelocity(
            collision.contactPoint,
            hexagon,
            angularVelocity,
          );

          // 计算反弹速度
          ball.velocity = calculateBounceVelocity(
            ball.velocity,
            collision.normal,
            wallVelocity,
            physicsParams.bounceDamping,
          );

          // 推出穿透深度
          if (collision.depth) {
            ball.position.x += collision.normal.x * collision.depth;
            ball.position.y += collision.normal.y * collision.depth;
          }
        }
      }

      // 确保小球在六边形内部
      if (!isPointInHexagon(ball.position, hexagon)) {
        // 将小球移回六边形中心
        const toCenterX = hexagon.center.x - ball.position.x;
        const toCenterY = hexagon.center.y - ball.position.y;
        const distance = Math.sqrt(
          toCenterX * toCenterX + toCenterY * toCenterY,
        );

        if (distance > 0) {
          ball.position.x += (toCenterX / distance) * 5;
          ball.position.y += (toCenterY / distance) * 5;
        }
      }
    },
    [physicsParams.bounceDamping],
  );

  /**
   * 更新轨迹
   */
  const updateTrail = useCallback(
    (position: Vector2D) => {
      if (!showTrail) return;

      trailRef.current.push({ ...position });
      if (trailRef.current.length > maxTrailLength) {
        trailRef.current.shift();
      }
    },
    [showTrail],
  );

  /**
   * 游戏循环
   */
  const gameLoop = useCallback(
    (currentTime: number) => {
      if (!canvasRef.current) return;

      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;

      // 计算时间差
      const deltaTime = Math.min(
        (currentTime - lastTimeRef.current) / 1000,
        0.033,
      ); // 限制最大为33ms
      lastTimeRef.current = currentTime;

      if (!isPaused && deltaTime > 0) {
        const ball = ballRef.current;
        const hexagon = hexagonRef.current;

        // 更新六边形旋转
        hexagon.rotation += rotationSpeed * deltaTime;

        // 应用物理
        applyGravity(ball, physicsParams.gravity, deltaTime);
        applyAirFriction(ball, physicsParams.airFriction, deltaTime);

        // 更新位置
        updateBallPosition(ball, deltaTime);

        // 处理碰撞
        handleCollisions(ball, hexagon, rotationSpeed);

        // 限制最小速度
        clampMinVelocity(ball, physicsParams.minVelocity);

        // 更新轨迹
        updateTrail(ball.position);
      }

      // 清空画布，添加微妙的背景纹理
      const gradient = ctx.createRadialGradient(
        canvasRef.current.width / 2,
        canvasRef.current.height / 2,
        0,
        canvasRef.current.width / 2,
        canvasRef.current.height / 2,
        Math.max(canvasRef.current.width, canvasRef.current.height) / 2,
      );
      gradient.addColorStop(0, "#0f172a");
      gradient.addColorStop(1, "#020617");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      // 绘制增强的轨迹
      if (showTrail && trailRef.current.length > 1) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        for (let i = 1; i < trailRef.current.length; i++) {
          const alpha = (i / trailRef.current.length) * 0.8;
          const width = (i / trailRef.current.length) * 4 + 1;

          ctx.strokeStyle = `rgba(96, 165, 250, ${alpha})`;
          ctx.lineWidth = width;
          ctx.beginPath();
          ctx.moveTo(trailRef.current[i - 1].x, trailRef.current[i - 1].y);
          ctx.lineTo(trailRef.current[i].x, trailRef.current[i].y);
          ctx.stroke();
        }
      }

      // 绘制增强的六边形
      const vertices = getHexagonVertices(hexagonRef.current);

      // 六边形外发光效果
      ctx.shadowColor = "#10b981";
      ctx.shadowBlur = 20;
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 3;
      ctx.beginPath();

      vertices.forEach((vertex, index) => {
        if (index === 0) {
          ctx.moveTo(vertex.x, vertex.y);
        } else {
          ctx.lineTo(vertex.x, vertex.y);
        }
      });

      ctx.closePath();
      ctx.stroke();

      // 重置阴影
      ctx.shadowBlur = 0;

      // 绘制六边形内部的微妙填充
      ctx.fillStyle = "rgba(16, 185, 129, 0.05)";
      ctx.fill();

      // 绘制六边形中心点
      ctx.fillStyle = "#10b981";
      ctx.shadowColor = "#10b981";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(
        hexagonRef.current.center.x,
        hexagonRef.current.center.y,
        4,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.shadowBlur = 0;

      // 绘制增强的小球
      const ball = ballRef.current;

      // 小球外发光效果
      ctx.shadowColor = "#60a5fa";
      ctx.shadowBlur = 25;

      // 球体渐变
      const ballGradient = ctx.createRadialGradient(
        ball.position.x - ball.radius / 2,
        ball.position.y - ball.radius / 2,
        0,
        ball.position.x,
        ball.position.y,
        ball.radius * 1.5,
      );
      ballGradient.addColorStop(0, "#93c5fd");
      ballGradient.addColorStop(0.4, "#60a5fa");
      ballGradient.addColorStop(0.8, "#3b82f6");
      ballGradient.addColorStop(1, "#1e40af");

      ctx.fillStyle = ballGradient;
      ctx.beginPath();
      ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();

      // 添加高光效果
      const highlightGradient = ctx.createRadialGradient(
        ball.position.x - ball.radius / 3,
        ball.position.y - ball.radius / 3,
        0,
        ball.position.x - ball.radius / 3,
        ball.position.y - ball.radius / 3,
        ball.radius / 2,
      );
      highlightGradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
      highlightGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.fillStyle = highlightGradient;
      ctx.beginPath();
      ctx.arc(
        ball.position.x - ball.radius / 3,
        ball.position.y - ball.radius / 3,
        ball.radius / 2,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // 重置阴影
      ctx.shadowBlur = 0;

      // 继续动画循环
      animationRef.current = requestAnimationFrame(gameLoop);
    },
    [
      isPaused,
      rotationSpeed,
      physicsParams,
      showTrail,
      handleCollisions,
      updateTrail,
    ],
  );

  /**
   * 处理画布点击
   */
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // 设置小球到点击位置
      ballRef.current.position = { x, y };
      ballRef.current.velocity = {
        x: (Math.random() - 0.5) * 400,
        y: (Math.random() - 0.5) * 400,
      };
      trailRef.current = [];
    },
    [],
  );

  // 初始化和清理
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 设置画布大小
    canvas.width = 800;
    canvas.height = 600;

    // 开始动画循环
    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameLoop]);

  return (
    <div className="flex flex-col items-center gap-8 p-6 min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
          旋转六边形弹跳球
        </h1>
        <p className="text-gray-400 text-sm">物理引擎驱动的交互式动画演示</p>
      </div>

      {/* 画布 */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
        <canvas
          ref={canvasRef}
          className="relative border border-gray-600/50 rounded-xl cursor-pointer bg-gray-900/90 backdrop-blur-sm shadow-2xl"
          onClick={handleCanvasClick}
        />
      </div>

      {/* 控制面板 */}
      <div className="w-full max-w-4xl bg-gray-800/40 backdrop-blur-md rounded-2xl p-8 space-y-6 border border-gray-700/50 shadow-2xl">
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 font-medium"
          >
            {isPaused ? "▶️ 继续" : "⏸️ 暂停"}
          </button>
          <button
            type="button"
            onClick={resetBall}
            className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/25 font-medium"
          >
            🔄 重置小球
          </button>
          <button
            type="button"
            onClick={() => setShowTrail(!showTrail)}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25 font-medium"
          >
            {showTrail ? "🌟 隐藏轨迹" : "✨ 显示轨迹"}
          </button>
        </div>

        {/* 参数调节 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
            <label className="text-sm text-gray-200 block">
              <span className="block mb-3 font-medium text-blue-300">
                ⚡ 重力: {physicsParams.gravity}
              </span>
              <input
                type="range"
                min="0"
                max="1000"
                value={physicsParams.gravity}
                onChange={(e) =>
                  setPhysicsParams({
                    ...physicsParams,
                    gravity: Number(e.target.value),
                  })
                }
                className="w-full h-2 bg-gray-600/50 rounded-lg appearance-none cursor-pointer slider-thumb"
              />
            </label>
          </div>

          <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
            <label className="text-sm text-gray-200 block">
              <span className="block mb-3 font-medium text-purple-300">
                💨 空气摩擦: {physicsParams.airFriction.toFixed(3)}
              </span>
              <input
                type="range"
                min="0"
                max="0.1"
                step="0.001"
                value={physicsParams.airFriction}
                onChange={(e) =>
                  setPhysicsParams({
                    ...physicsParams,
                    airFriction: Number(e.target.value),
                  })
                }
                className="w-full h-2 bg-gray-600/50 rounded-lg appearance-none cursor-pointer slider-thumb"
              />
            </label>
          </div>

          <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
            <label className="text-sm text-gray-200 block">
              <span className="block mb-3 font-medium text-emerald-300">
                🏀 反弹阻尼: {physicsParams.bounceDamping.toFixed(2)}
              </span>
              <input
                type="range"
                min="0.5"
                max="1"
                step="0.01"
                value={physicsParams.bounceDamping}
                onChange={(e) =>
                  setPhysicsParams({
                    ...physicsParams,
                    bounceDamping: Number(e.target.value),
                  })
                }
                className="w-full h-2 bg-gray-600/50 rounded-lg appearance-none cursor-pointer slider-thumb"
              />
            </label>
          </div>

          <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
            <label className="text-sm text-gray-200 block">
              <span className="block mb-3 font-medium text-orange-300">
                🔄 旋转速度: {rotationSpeed.toFixed(2)} rad/s
              </span>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={rotationSpeed}
                onChange={(e) => setRotationSpeed(Number(e.target.value))}
                className="w-full h-2 bg-gray-600/50 rounded-lg appearance-none cursor-pointer slider-thumb"
              />
            </label>
          </div>
        </div>

        <div className="text-sm text-gray-400 text-center p-4 bg-gray-700/20 rounded-xl border border-gray-600/20">
          <span className="inline-flex items-center gap-2">
            <span className="text-lg">👆</span>
            点击画布可以重新设置小球位置
          </span>
        </div>
      </div>
    </div>
  );
};

export default HexagonBounce;
