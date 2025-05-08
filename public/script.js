const cursor = document.createElement('div');
cursor.className = 'cursor';
document.body.appendChild(cursor);

const body = document.body;
const enlargeableElements = document.querySelectorAll('.enlarge-cursor');
const slightlyEnlargeableElements = document.querySelectorAll('.slightly-enlarge-cursor');

document.addEventListener('mousemove', (e) => {
  cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;




   // 检测鼠标下的元素
  const target = e.target;

  // 默认缩放比例
  let scale = 1;

  // 如果鼠标悬停在链接、按钮、文本元素（h1-h6, p, li）或图片上，则放大光标
  if (target.tagName === 'A' ||
      target.tagName === 'BUTTON' ||
      target.tagName.match(/^H[1-6]$/) || // 匹配 h1 到 h6 标签
      target.tagName === 'P' ||
      target.tagName === 'LI' ||
      target.tagName === 'IMG') {
    scale = 1.5; // 放大比例，你可以根据需要调整
  }

  // 应用缩放
  cursor.style.transform += ` scale(${scale})`;






});


