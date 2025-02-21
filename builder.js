let isPreview = false;
document.addEventListener('DOMContentLoaded', () => {
  const builderArea = document.getElementById('builderArea');
  Sortable.create(builderArea, {
    animation: 150,
    handle: '.drag-handle',
    ghostClass: 'sortable-ghost',
    onEnd: autoSave
  });
});
function autoSave() {
  const builderArea = document.getElementById('builderArea');
  localStorage.setItem('builderContent', builderArea.innerHTML);
}
function applyInteract(el) {
  interact(el)
    .draggable({
      listeners: {
        move (event) {
          const target = event.target;
          const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
          const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
          target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
          target.setAttribute('data-x', x);
          target.setAttribute('data-y', y);
          autoSave();
        }
      }
    })
    .resizable({
      edges: { left: true, right: true, bottom: true, top: true },
      listeners: {
        move (event) {
          const target = event.target;
          let x = (parseFloat(target.getAttribute('data-x')) || 0);
          let y = (parseFloat(target.getAttribute('data-y')) || 0);
          target.style.width = event.rect.width + 'px';
          target.style.height = event.rect.height + 'px';
          x += event.deltaRect.left;
          y += event.deltaRect.top;
          target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
          target.setAttribute('data-x', x);
          target.setAttribute('data-y', y);
          autoSave();
        }
      }
    });
}
function createBlock(type) {
  const block = document.createElement('div');
  block.className = 'block';
  block.setAttribute('data-type', type);
  block.style.position = 'absolute';
  block.style.top = '10px';
  block.style.left = '10px';
  const header = document.createElement('div');
  header.className = 'block-header';
  const dragHandle = document.createElement('span');
  dragHandle.className = 'drag-handle';
  dragHandle.innerHTML = '&#9776;';
  header.appendChild(dragHandle);
  const btnDuplicate = document.createElement('button');
  btnDuplicate.innerText = 'Duplicate';
  btnDuplicate.onclick = () => {
    const clone = block.cloneNode(true);
    clone.removeAttribute('data-x');
    clone.removeAttribute('data-y');
    block.parentNode.insertBefore(clone, block.nextSibling);
    applyInteract(clone);
    autoSave();
  };
  header.appendChild(btnDuplicate);
  const btnEdit = document.createElement('button');
  btnEdit.innerText = 'Edit';
  btnEdit.onclick = () => {
    const contentDiv = block.querySelector('.block-content');
    if (type === 'image' || type === 'video' || type === 'audio') {
      let sel = type === 'image' ? 'img' : (type === 'video' ? 'iframe' : 'audio');
      const mediaElem = contentDiv.querySelector(sel);
      const newUrl = prompt('Enter new URL:', mediaElem ? mediaElem.src : '');
      if (newUrl && mediaElem) {
        mediaElem.src = newUrl;
        if (type === 'audio') {
          const sourceElem = mediaElem.querySelector('source');
          if (sourceElem) {
            sourceElem.src = newUrl;
            mediaElem.load();
          }
        }
        autoSave();
      }
    } else if (type === 'file') {
      const fileLink = contentDiv.querySelector('a');
      const newUrl = prompt('Enter file URL:', fileLink ? fileLink.href : '');
      if (newUrl && fileLink) {
        fileLink.href = newUrl;
        fileLink.innerText = newUrl.split('/').pop();
        autoSave();
      }
    } else if (type === 'button') {
      const btn = contentDiv.querySelector('button');
      const newText = prompt('Enter button text:', btn.innerText);
      const newLink = prompt('Enter button link URL:', btn.getAttribute('data-link') || '');
      if (newText && newLink) {
        btn.innerText = newText;
        btn.setAttribute('data-link', newLink);
        btn.onclick = () => window.open(newLink, '_blank');
        autoSave();
      }
    } else {
      if (contentDiv.getAttribute('contenteditable') === 'true') {
        contentDiv.removeAttribute('contenteditable');
        btnEdit.innerText = 'Edit';
        autoSave();
      } else {
        contentDiv.setAttribute('contenteditable', 'true');
        contentDiv.focus();
        btnEdit.innerText = 'Done';
      }
    }
  };
  header.appendChild(btnEdit);
  if (['heading', 'paragraph', 'code', 'html', 'quote'].includes(type)) {
    const btnStyle = document.createElement('button');
    btnStyle.innerText = 'Style';
    btnStyle.onclick = () => {
      const contentDiv = block.querySelector('.block-content');
      const newColor = prompt('Enter text color (e.g., #ff0000 or red):', contentDiv.style.color || '');
      if (newColor !== null) { contentDiv.style.color = newColor; }
      const newFont = prompt('Enter font family (e.g., Arial):', contentDiv.style.fontFamily || '');
      if (newFont !== null) { contentDiv.style.fontFamily = newFont; }
      autoSave();
    };
    header.appendChild(btnStyle);
  }
  const btnDelete = document.createElement('button');
  btnDelete.innerText = 'Delete';
  btnDelete.onclick = () => {
    if (confirm('Delete this block?')) {
      block.remove();
      autoSave();
    }
  };
  header.appendChild(btnDelete);
  block.appendChild(header);
  const content = document.createElement('div');
  content.className = 'block-content';
  switch (type) {
    case 'heading': {
      const h2 = document.createElement('h2');
      h2.innerText = 'Heading Text';
      content.appendChild(h2);
      break;
    }
    case 'paragraph': {
      const p = document.createElement('p');
      p.innerText = 'Enter your paragraph text here...';
      content.appendChild(p);
      break;
    }
    case 'image': {
      const img = document.createElement('img');
      img.src = 'https://via.placeholder.com/600x300';
      img.style.maxWidth = '100%';
      content.appendChild(img);
      break;
    }
    case 'video': {
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
      iframe.width = '100%';
      iframe.height = '315';
      iframe.frameBorder = '0';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      content.appendChild(iframe);
      break;
    }
    case 'audio': {
      const audio = document.createElement('audio');
      audio.controls = true;
      const source = document.createElement('source');
      source.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
      source.type = 'audio/mpeg';
      audio.appendChild(source);
      content.appendChild(audio);
      break;
    }
    case 'code': {
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.innerText = '// Your code here...';
      pre.appendChild(code);
      content.appendChild(pre);
      break;
    }
    case 'html': {
      const div = document.createElement('div');
      div.innerText = '<!-- Enter your HTML here -->';
      div.style.fontFamily = 'monospace';
      content.appendChild(div);
      break;
    }
    case 'quote': {
      const blockquote = document.createElement('blockquote');
      blockquote.innerText = 'Your quote here...';
      content.appendChild(blockquote);
      break;
    }
    case 'button': {
      const btn = document.createElement('button');
      btn.innerText = 'Click Me';
      btn.setAttribute('data-link', 'https://example.com');
      btn.onclick = () => window.open(btn.getAttribute('data-link'), '_blank');
      content.appendChild(btn);
      break;
    }
    case 'divider': {
      const hr = document.createElement('hr');
      content.appendChild(hr);
      break;
    }
    case 'file': {
      const input = document.createElement('input');
      input.type = 'file';
      input.onchange = () => {
        const file = input.files[0];
        if (file) {
          const fileLink = document.createElement('a');
          fileLink.href = URL.createObjectURL(file);
          fileLink.innerText = file.name;
          fileLink.target = '_blank';
          content.innerHTML = '';
          content.appendChild(fileLink);
          autoSave();
        }
      };
      content.appendChild(input);
      break;
    }
    default: { content.innerText = 'Unsupported block type.'; }
  }
  block.appendChild(content);
  applyInteract(block);
  autoSave();
  return block;
}
function addBlock(type) {
  const newBlock = createBlock(type);
  document.getElementById('builderArea').appendChild(newBlock);
  autoSave();
}
function togglePreview() {
  isPreview = !isPreview;
  const builderArea = document.getElementById('builderArea');
  if (isPreview) { builderArea.classList.add('preview'); }
  else { builderArea.classList.remove('preview'); }
  autoSave();
}
function clearPage() {
  if (confirm('Clear all blocks?')) {
    document.getElementById('builderArea').innerHTML = '';
    autoSave();
  }
}
function exportHTML() {
  const builderArea = document.getElementById('builderArea');
  const exported = builderArea.innerHTML;
  const newWindow = window.open('', '_blank');
  newWindow.document.write('<pre>' + exported.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</pre>');
  newWindow.document.close();
}
document.getElementById('builderArea').addEventListener('input', autoSave);
