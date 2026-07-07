import { useRef, useState } from "react";
import "./App.css";

// 도형 하나가 가져야 하는 정보
type Shape = {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

// 캔버스 크기
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;

// 선택할 수 있는 색상 목록
const COLORS = ["#4f46e5", "#16a34a", "#dc2626", "#f59e0b", "#111827"];

function App() {
  // 캔버스 div를 가리키기 위한 ref
  const canvasRef = useRef<HTMLDivElement | null>(null);

  // 캔버스 안에 있는 도형 목록
  const [shapes, setShapes] = useState<Shape[]>([
    {
      id: 1,
      x: 100,
      y: 100,
      width: 120,
      height: 80,
      color: "#4f46e5",
    },
  ]);

  // 현재 선택된 도형의 id
  const [selectedId, setSelectedId] = useState<number | null>(1);

  // 현재 드래그 중인 도형의 id
  const [draggingId, setDraggingId] = useState<number | null>(null);

  // 마우스를 도형의 어느 지점에서 잡았는지 저장
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  // 현재 선택된 도형 찾기
  const selectedShape = shapes.find((shape) => shape.id === selectedId);

  // 숫자가 최소값과 최대값 사이에 있도록 제한하는 함수
  function limit(value: number, min: number, max: number) {
    return Math.max(min, Math.min(value, max));
  }

  // 마우스의 현재 위치를 캔버스 기준 좌표로 바꾸는 함수
  function getMousePosition(event: React.MouseEvent<HTMLDivElement>) {
    const canvas = canvasRef.current;

    if (!canvas) {
      return { x: 0, y: 0 };
    }

    const rect = canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  // 사각형 추가
  function addRectangle() {
    const newShape: Shape = {
      id: Date.now(),
      x: 80,
      y: 80,
      width: 120,
      height: 80,
      color: "#4f46e5",
    };

    setShapes([...shapes, newShape]);
    setSelectedId(newShape.id);
  }

  // 선택된 도형 삭제
  function deleteSelectedShape() {
    if (selectedId === null) {
      return;
    }

    const remainingShapes = shapes.filter((shape) => shape.id !== selectedId);

    setShapes(remainingShapes);
    setSelectedId(null);
  }

  // 선택된 도형의 색상 변경
  function changeSelectedColor(newColor: string) {
    if (selectedId === null) {
      return;
    }

    const updatedShapes = shapes.map((shape) => {
      if (shape.id === selectedId) {
        return {
          ...shape,
          color: newColor,
        };
      }

      return shape;
    });

    setShapes(updatedShapes);
  }

  // 도형을 마우스로 누르는 순간 실행
  function startDragging(
    event: React.MouseEvent<HTMLDivElement>,
    shape: Shape
  ) {
    // 캔버스 클릭 이벤트까지 같이 실행되지 않도록 막음
    event.stopPropagation();

    const mousePosition = getMousePosition(event);

    setSelectedId(shape.id);
    setDraggingId(shape.id);

    // 마우스가 도형의 왼쪽 위에서 얼마나 떨어진 곳을 잡았는지 저장
    setMouseOffset({
      x: mousePosition.x - shape.x,
      y: mousePosition.y - shape.y,
    });
  }

  // 마우스를 움직일 때 실행
  function moveShape(event: React.MouseEvent<HTMLDivElement>) {
    if (draggingId === null) {
      return;
    }

    const mousePosition = getMousePosition(event);

    const updatedShapes = shapes.map((shape) => {
      if (shape.id !== draggingId) {
        return shape;
      }

      const nextX = mousePosition.x - mouseOffset.x;
      const nextY = mousePosition.y - mouseOffset.y;

      return {
        ...shape,
        x: limit(nextX, 0, CANVAS_WIDTH - shape.width),
        y: limit(nextY, 0, CANVAS_HEIGHT - shape.height),
      };
    });

    setShapes(updatedShapes);
  }

  // 마우스를 놓으면 드래그 종료
  function stopDragging() {
    setDraggingId(null);
  }

  // 캔버스 빈 곳을 클릭하면 선택 해제
  function clearSelection() {
    setSelectedId(null);
  }

  return (
    <main className="app">
      <section className="panel">
        <h1>Mini Canvas Editor</h1>
        <p className="description">
          React와 TypeScript로 만든 간단한 캔버스 편집기입니다.
        </p>

        <div className="toolbar">
          <button onClick={addRectangle}>사각형 추가</button>

          <button onClick={deleteSelectedShape} disabled={selectedId === null}>
            선택 삭제
          </button>
        </div>

        <div className="colorRow">
          <span>색상 변경</span>

          {COLORS.map((color) => (
            <button
              key={color}
              className="colorButton"
              style={{ backgroundColor: color }}
              onClick={() => changeSelectedColor(color)}
              disabled={selectedId === null}
            />
          ))}
        </div>

        <div className="infoBox">
          {selectedShape ? (
            <>
              <strong>선택된 도형</strong>
              <p>ID: {selectedShape.id}</p>
              <p>
                위치: x {Math.round(selectedShape.x)}, y{" "}
                {Math.round(selectedShape.y)}
              </p>
              <p>
                크기: {selectedShape.width} × {selectedShape.height}
              </p>
            </>
          ) : (
            <p>선택된 도형이 없습니다.</p>
          )}
        </div>
      </section>

      <section
        ref={canvasRef}
        className="canvas"
        onMouseMove={moveShape}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        onMouseDown={clearSelection}
      >
        {shapes.map((shape) => (
          <div
            key={shape.id}
            className={
              shape.id === selectedId ? "shape selectedShape" : "shape"
            }
            style={{
              left: shape.x,
              top: shape.y,
              width: shape.width,
              height: shape.height,
              backgroundColor: shape.color,
            }}
            onMouseDown={(event) => startDragging(event, shape)}
          />
        ))}
      </section>
    </main>
  );
}

export default App;