import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutChangeEvent,
  GestureResponderEvent,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Point, Stroke } from '../types/game';
import { computeFloodFillRects, fillRectsToSvgPath } from '../utils/floodFill';

export type DrawingTool = 'brush' | 'fill' | 'eraser';

export const PALETTE_COLORS = [
  '#111827', // Black
  '#FFFFFF', // White
  '#EF4444', // Red
  '#F97316', // Orange
  '#EAB308', // Yellow
  '#16A34A', // Green
  '#06B6D4', // Cyan
  '#2563EB', // Blue
  '#7C3AED', // Purple
  '#EC4899', // Pink
  '#854D0E', // Brown
  '#64748B', // Slate Gray
  '#10B981', // Emerald
];

export const BRUSH_SIZES = [
  { label: 'S', normalizedWidth: 0.004, previewPx: 6 },
  { label: 'M', normalizedWidth: 0.008, previewPx: 11 },
  { label: 'L', normalizedWidth: 0.015, previewPx: 17 },
  { label: 'XL', normalizedWidth: 0.026, previewPx: 23 },
];

interface DrawingCanvasProps {
  strokes: Stroke[];
  onStrokeStart: (stroke: Stroke) => void;
  onStrokeMove: (strokeId: string, points: Point[]) => void;
  onStrokeEnd: (strokeId: string) => void;
  onUndo: () => void;
  onClear: () => void;
}

function pointsToSvgPath(points: Point[], width: number, height: number): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    const x = points[0].x * width;
    const y = points[0].y * height;
    return `M ${x.toFixed(1)} ${y.toFixed(1)} L ${(x + 0.1).toFixed(1)} ${(
      y + 0.1
    ).toFixed(1)}`;
  }

  let d = `M ${(points[0].x * width).toFixed(1)} ${(
    points[0].y * height
  ).toFixed(1)}`;

  for (let i = 1; i < points.length - 1; i++) {
    const cx = points[i].x * width;
    const cy = points[i].y * height;
    const midX = ((points[i].x + points[i + 1].x) / 2) * width;
    const midY = ((points[i].y + points[i + 1].y) / 2) * height;
    d += ` Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${midX.toFixed(1)} ${midY.toFixed(
      1
    )}`;
  }

  const last = points[points.length - 1];
  d += ` L ${(last.x * width).toFixed(1)} ${(last.y * height).toFixed(1)}`;
  return d;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  strokes,
  onStrokeStart,
  onStrokeMove,
  onStrokeEnd,
  onUndo,
  onClear,
}) => {
  const [selectedColor, setSelectedColor] = useState<string>(PALETTE_COLORS[0]);
  const [selectedSizeIdx, setSelectedSizeIdx] = useState<number>(1);
  const [activeTool, setActiveTool] = useState<DrawingTool>('brush');
  const [canvasLayout, setCanvasLayout] = useState<{
    width: number;
    height: number;
  }>({ width: 600, height: 450 });

  const activeStrokeIdRef = useRef<string | null>(null);
  const lastPointRef = useRef<Point | null>(null);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setCanvasLayout({ width, height });
    }
  }, []);

  const extractNormalizedPoint = (e: GestureResponderEvent): Point => {
    const { locationX, locationY } = e.nativeEvent;
    const x = Math.max(0, Math.min(1, locationX / (canvasLayout.width || 1)));
    const y = Math.max(0, Math.min(1, locationY / (canvasLayout.height || 1)));
    return {
      x: Math.round(x * 10000) / 10000,
      y: Math.round(y * 10000) / 10000,
    };
  };

  const handleTouchStart = (e: GestureResponderEvent) => {
    const pt = extractNormalizedPoint(e);
    const strokeId = `st_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    if (activeTool === 'fill') {
      activeStrokeIdRef.current = null;
      lastPointRef.current = null;
      const fillRects = computeFloodFillRects(strokes, pt, selectedColor);
      if (!fillRects || fillRects.length === 0) {
        return;
      }
      const fillStroke: Stroke = {
        id: strokeId,
        color: selectedColor,
        width: 0,
        points: [pt],
        isFill: true,
        fillRects,
      };
      onStrokeStart(fillStroke);
      onStrokeEnd(strokeId);
      return;
    }

    activeStrokeIdRef.current = strokeId;
    lastPointRef.current = pt;

    const isEraser = activeTool === 'eraser';
    const brushWidth = BRUSH_SIZES[selectedSizeIdx].normalizedWidth;
    const newStroke: Stroke = {
      id: strokeId,
      color: isEraser ? '#FFFFFF' : selectedColor,
      width: isEraser ? brushWidth * 2.2 : brushWidth,
      points: [pt],
      isEraser,
    };

    onStrokeStart(newStroke);
  };

  const handleTouchMove = (e: GestureResponderEvent) => {
    const strokeId = activeStrokeIdRef.current;
    if (!strokeId) return;

    const pt = extractNormalizedPoint(e);
    const prev = lastPointRef.current;
    if (prev) {
      const dx = pt.x - prev.x;
      const dy = pt.y - prev.y;
      // Filter micro-jitter (< 0.2% of canvas dimension)
      if (dx * dx + dy * dy < 0.000004) {
        return;
      }
    }

    lastPointRef.current = pt;
    onStrokeMove(strokeId, [pt]);
  };

  const handleTouchEnd = () => {
    if (activeStrokeIdRef.current) {
      onStrokeEnd(activeStrokeIdRef.current);
      activeStrokeIdRef.current = null;
      lastPointRef.current = null;
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* Interactive SVG Drawing Surface */}
      <View
        style={styles.canvasContainer}
        onLayout={handleLayout}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handleTouchStart}
        onResponderMove={handleTouchMove}
        onResponderRelease={handleTouchEnd}
        onResponderTerminate={handleTouchEnd}
      >
        <Svg
          width={canvasLayout.width}
          height={canvasLayout.height}
          style={StyleSheet.absoluteFill}
        >
          {strokes.map((stroke) => {
            if (stroke.isFill && stroke.fillRects) {
              return (
                <Path
                  key={stroke.id}
                  d={fillRectsToSvgPath(
                    stroke.fillRects,
                    canvasLayout.width,
                    canvasLayout.height
                  )}
                  fill={stroke.color}
                  stroke="none"
                />
              );
            }

            const strokePx = Math.max(
              2,
              stroke.width * canvasLayout.width
            );
            const strokeColor = stroke.isEraser ? '#FFFFFF' : stroke.color;

            if (stroke.points.length === 1) {
              return (
                <Circle
                  key={stroke.id}
                  cx={stroke.points[0].x * canvasLayout.width}
                  cy={stroke.points[0].y * canvasLayout.height}
                  r={strokePx / 2}
                  fill={strokeColor}
                />
              );
            }

            return (
              <Path
                key={stroke.id}
                d={pointsToSvgPath(
                  stroke.points,
                  canvasLayout.width,
                  canvasLayout.height
                )}
                stroke={strokeColor}
                strokeWidth={strokePx}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            );
          })}
        </Svg>
      </View>

      {/* Bottom Drawing Toolkit Bar */}
      <View style={styles.toolbar}>
        {/* Color Swatches */}
        <View style={styles.colorRow}>
          {PALETTE_COLORS.map((hex) => {
            const active = activeTool !== 'eraser' && selectedColor === hex;
            return (
              <TouchableOpacity
                key={hex}
                onPress={() => {
                  if (activeTool === 'eraser') {
                    setActiveTool('brush');
                  }
                  setSelectedColor(hex);
                }}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: hex },
                  active && styles.colorSwatchActive,
                ]}
              />
            );
          })}
        </View>

        <View style={styles.divider} />

        {/* Brush Sizes */}
        <View style={styles.toolGroup}>
          {BRUSH_SIZES.map((sz, idx) => {
            const active = activeTool !== 'fill' && selectedSizeIdx === idx;
            return (
              <TouchableOpacity
                key={sz.label}
                onPress={() => {
                  if (activeTool === 'fill') {
                    setActiveTool('brush');
                  }
                  setSelectedSizeIdx(idx);
                }}
                style={[styles.sizeBtn, active && styles.sizeBtnActive]}
              >
                <View
                  style={{
                    width: sz.previewPx,
                    height: sz.previewPx,
                    borderRadius: sz.previewPx / 2,
                    backgroundColor: active ? '#FFFFFF' : '#CBD5E1',
                  }}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.divider} />

        {/* Action Tools: Brush, Fill, Eraser, Undo, Clear */}
        <View style={styles.toolGroup}>
          <TouchableOpacity
            onPress={() => setActiveTool('brush')}
            style={[
              styles.actionBtn,
              activeTool === 'brush' && styles.actionBtnActive,
            ]}
          >
            <Text style={styles.actionBtnText}>🖌️ Brush</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              setActiveTool(activeTool === 'fill' ? 'brush' : 'fill')
            }
            style={[
              styles.actionBtn,
              activeTool === 'fill' && styles.actionBtnActive,
            ]}
          >
            <Text style={styles.actionBtnText}>🪣 Fill</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              setActiveTool(activeTool === 'eraser' ? 'brush' : 'eraser')
            }
            style={[
              styles.actionBtn,
              activeTool === 'eraser' && styles.actionBtnActive,
            ]}
          >
            <Text style={styles.actionBtnText}>🧽 Eraser</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onUndo} style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>↩️ Undo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClear}
            style={[styles.actionBtn, styles.clearBtn]}
          >
            <Text style={styles.actionBtnText}>🗑️ Clear</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#334155',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flexWrap: 'wrap',
  },
  colorSwatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  colorSwatchActive: {
    borderColor: '#FDE047',
    borderWidth: 3.5,
    transform: [{ scale: 1.15 }],
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: '#334155',
    marginHorizontal: 4,
  },
  toolGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sizeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeBtnActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#818CF8',
  },
  actionBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#475569',
  },
  actionBtnActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#818CF8',
  },
  clearBtn: {
    backgroundColor: '#7F1D1D',
    borderColor: '#B91C1C',
  },
  actionBtnText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
});
