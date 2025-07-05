import React, { useState, useEffect, useCallback } from 'react';

const SignatureBox = ({
  x: initialX,
  y: initialY,
  text: initialText,
  fontSize: initialFontSize,
  fontWeight: initialFontWeight,
  fontStyle: initialFontStyle,
  underline: initialUnderline,
  fontFamily: initialFontFamily,
  color: initialColor,
  onUpdate,
  onDelete,
  onDragEnd,
}) => {
  const [x, setX] = useState(initialX || 100);
  const [y, setY] = useState(initialY || 100);
  const [showEditor, setShowEditor] = useState(false);
  const [text, setText] = useState(initialText || 'Signature');
  const [fontSize, setFontSize] = useState(initialFontSize || 20);
  const [fontWeight, setFontWeight] = useState(initialFontWeight || 'normal');
  const [fontStyle, setFontStyle] = useState(initialFontStyle || 'normal');
  const [underline, setUnderline] = useState(initialUnderline || false);
  const [fontFamily, setFontFamily] = useState(initialFontFamily || 'Arial');
  const [color, setColor] = useState(initialColor || '#000000');
  const [textShadow, setTextShadow] = useState(false);
  const [bgColor, setBgColor] = useState('#00ff0055'); // 8-digit hex supports transparency
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const toggleEditor = () => setShowEditor((prev) => !prev);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setOffset({
      x: e.clientX - x,
      y: e.clientY - y,
    });
    setDragging(true);
  };

  const handleMouseUp = useCallback(() => {
    setDragging(false);
    if (typeof onDragEnd === 'function') {
      onDragEnd();
    }
  }, [onDragEnd]);

  const handleMouseMove = useCallback(
    (e) => {
      if (!dragging) return;
      setX(e.clientX - offset.x);
      setY(e.clientY - offset.y);
    },
    [dragging, offset]
  );

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (typeof onUpdate === 'function') {
      onUpdate({
        x,
        y,
        text,
        fontSize,
        fontWeight,
        fontStyle,
        underline,
        fontFamily,
        color,
      });
    }
  }, [x, y, text, fontSize, fontWeight, fontStyle, underline, fontFamily, color, onUpdate]);

  return (
    <>
      {/* Signature Display Box */}
      <div
        onMouseDown={handleMouseDown}
        onClick={toggleEditor}
        style={{
          position: 'absolute',
          top: `${y}px`,
          left: `${x}px`,
          backgroundColor: bgColor,
          color,
          padding: '4px 10px',
          borderRadius: '6px',
          cursor: 'move',
          zIndex: 10,
          fontSize: `${fontSize}px`,
          fontStyle,
          fontWeight,
          fontFamily,
          textDecoration: underline ? 'underline' : 'none',
          textShadow: textShadow ? '1px 1px 2px rgba(0,0,0,0.4)' : 'none',
        }}
      >
        {text}
      </div>

      {/* Signature Editor Panel */}
      {showEditor && (
        <div
          className="fixed md:absolute z-50 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-full max-w-xs mx-auto md:w-64"
          style={{
            top: window.innerWidth < 768 ? '20%' : `${y + 60}px`,
            left: window.innerWidth < 768 ? '5%' : `${x}px`,
          }}
        >
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <label className="block font-semibold">Text</label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-2 py-1 border rounded"
              />
            </div>

            <div>
              <label className="block font-semibold">Font Size</label>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full px-2 py-1 border rounded"
              />
            </div>

            <div>
              <label className="block font-semibold">Font Family</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full px-2 py-1 border rounded"
                style={{ fontFamily }}
              >
                {[
                  'Arial',
                  'Georgia',
                  'Courier New',
                  'Times New Roman',
                  'Verdana',
                  'Cursive',
                  'Monospace',
                  'Lucida Console',
                  'Fantasy',
                ].map((font) => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold">Font Weight</label>
              <select
                value={fontWeight}
                onChange={(e) => setFontWeight(e.target.value)}
                className="w-full px-2 py-1 border rounded"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="bolder">Bolder</option>
                <option value="lighter">Lighter</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold">Font Style</label>
              <select
                value={fontStyle}
                onChange={(e) => setFontStyle(e.target.value)}
                className="w-full px-2 py-1 border rounded"
              >
                <option value="normal">Normal</option>
                <option value="italic">Italic</option>
                <option value="oblique">Oblique</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="font-semibold">Underline</label>
              <input
                type="checkbox"
                checked={underline}
                onChange={(e) => setUnderline(e.target.checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="font-semibold">Text Shadow</label>
              <input
                type="checkbox"
                checked={textShadow}
                onChange={(e) => setTextShadow(e.target.checked)}
              />
            </div>

            <div>
              <label className="block font-semibold">Text Color</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block font-semibold">Background</label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="flex justify-between gap-2 mt-4">
              <button
                onClick={() => setShowEditor(false)}
                className="w-1/2 px-3 py-1 bg-gray-300 text-black rounded hover:bg-gray-400"
              >
                Close
              </button>

              <button
                onClick={() => onDelete?.()}
                className="w-1/2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SignatureBox;

