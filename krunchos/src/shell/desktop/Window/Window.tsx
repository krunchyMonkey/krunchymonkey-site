import { useRef, type PointerEvent, type ReactNode } from "react";
import type { DesktopWindow } from "../../model/windowManager";
import { getApp } from "../../../apps/registry";

interface WindowProps {
  readonly window: DesktopWindow;
  readonly children: ReactNode;
  readonly onMove: (x: number, y: number) => void;
  readonly onFocus: () => void;
  readonly onClose: () => void;
  readonly onMinimize: () => void;
}

interface DragOrigin {
  readonly clientX: number;
  readonly clientY: number;
  readonly x: number;
  readonly y: number;
}

export function Window({ window: frame, children, onMove, onFocus, onClose, onMinimize }: WindowProps) {
  const dragOrigin = useRef<DragOrigin | null>(null);
  const app = getApp(frame.id);

  function beginDrag(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    onFocus();
    dragOrigin.current = {
      clientX: event.clientX,
      clientY: event.clientY,
      x: frame.x,
      y: frame.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    const origin = dragOrigin.current;
    if (!origin) return;

    const container = event.currentTarget.closest(".desktop-workspace");
    const rect = container?.getBoundingClientRect();
    const maxX = Math.max(0, (rect?.width ?? innerWidth) - 180);
    const maxY = Math.max(0, (rect?.height ?? innerHeight) - 48);
    onMove(
      Math.max(0, Math.min(maxX, origin.x + event.clientX - origin.clientX)),
      Math.max(0, Math.min(maxY, origin.y + event.clientY - origin.clientY)),
    );
  }

  function stopDrag() {
    dragOrigin.current = null;
  }

  return (
    <section
      className="os-window"
      style={{
        left: frame.x,
        top: frame.y,
        width: frame.width,
        height: frame.height,
        zIndex: frame.zIndex,
      }}
      role="region"
      aria-label={`${app?.title ?? "Unknown"} window`}
      onPointerDown={onFocus}
    >
      <header className="window-titlebar">
        <div
          className="window-drag-handle"
          onPointerDown={beginDrag}
          onPointerMove={moveDrag}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
          aria-hidden="true"
        >
          <span className="window-app-icon">{app?.icon}</span>
          <strong>{app?.title ?? "Unknown"}</strong>
        </div>
        <div className="window-actions">
          <button type="button" onClick={onMinimize} aria-label={`Minimize ${app?.title}`}>_</button>
          <button type="button" onClick={onClose} aria-label={`Close ${app?.title}`}>×</button>
        </div>
      </header>
      <div className="window-contents">{children}</div>
    </section>
  );
}
