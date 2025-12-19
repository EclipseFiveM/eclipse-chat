const ui = document.getElementById('ui');
const chat = document.getElementById('chat');
const optionsEl = document.getElementById('options');
const typing = document.getElementById('typing');
const closeBtn = document.getElementById('closeBtn');

const titleName = document.getElementById('titleName');
const titleSub = document.getElementById('titleSub');
const badge = document.getElementById('badge');

let currentNodeId = null;
let currentNode = null;

closeBtn.addEventListener('click', () => closeUI());
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeUI();
});

window.addEventListener('message', (e) => {
  const data = e.data;

  if (data.action === 'open') {
    ui.classList.remove('hidden');
    chat.innerHTML = '';
    optionsEl.innerHTML = '';
    setTyping(false);

    const p = data.payload || {};
    badge.textContent = p.badge || 'ECLIPSE';
    titleName.textContent = p.title || 'Conversation';
    titleSub.textContent = p.subtitle || 'Choose carefully.';
  }

  if (data.action === 'render') {
    currentNodeId = data.nodeId;
    currentNode = data.node;

    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      addMsg('dealer', (currentNode && currentNode.text) ? currentNode.text : '...');
      renderOptions((currentNode && currentNode.options) ? currentNode.options : []);
    }, 180);
  }

  if (data.action === 'close') {
    ui.classList.add('hidden');
    setTyping(false);
  }
});

function setTyping(on){
  typing.classList.toggle('hidden', !on);
  if (on) chat.scrollTop = chat.scrollHeight;
}

function addMsg(who, text){
  const wrap = document.createElement('div');
  wrap.className = `msg ${who}`;

  const bubble = document.createElement('div');
  bubble.className = 'bubble';

  if (who === 'dealer') {
    const tag = document.createElement('div');
    tag.className = 'smalltag';
    tag.textContent = 'Dealer';
    bubble.appendChild(tag);
  }

  const body = document.createElement('div');
  body.textContent = text;
  bubble.appendChild(body);

  wrap.appendChild(bubble);
  chat.appendChild(wrap);
  chat.scrollTop = chat.scrollHeight;
}

function renderOptions(opts){
  optionsEl.innerHTML = '';

  opts.forEach((opt, idx) => {
    const btn = document.createElement('div');
    btn.className = 'opt';

    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = opt.label || '...';

    const desc = document.createElement('div');
    desc.className = 'desc';
    desc.textContent = opt.desc || (opt.close ? 'End conversation.' : 'Continue.');

    btn.appendChild(label);
    btn.appendChild(desc);

    btn.onclick = () => {
      addMsg('you', opt.label || '...');
      fetch(`https://${GetParentResourceName()}/choose`, {
        method: 'POST',
        body: JSON.stringify({ nodeId: currentNodeId, optionIndex: idx + 1 })
      });
    };

    optionsEl.appendChild(btn);
  });
}

function closeUI(){
  ui.classList.add('hidden');
  setTyping(false);
  fetch(`https://${GetParentResourceName()}/close`, { method: 'POST' });
}
