// @ts-check
const adj = [
  '멋진',
  '잘생긴',
  '예쁜',
  '졸린',
  '우아한',
  '힙한',
  '배고픈',
  '집에 가기 싫은',
  '집에 가고 싶은',
  '귀여운',
  '중후한',
  '똑똑한',
  '이게 뭔가 싶은',
  '까리한',
  '프론트가 하고 싶은',
  '백엔드가 재미 있는',
  '몽고 디비 날려 먹은',
  '열심히하는',
  '피곤한',
  '눈빛이 초롱초롱한',
  '치킨이 땡기는',
  '술이 땡기는',
];

const member = [
  'a님',
  'b님',
  'c님',
  'd님',
  'e님',
  'f님',
  'g님',
  'h님',
  'i님',
  'j님',
  'k님',
  'l님',
  'm님',
  'n님',
  'o님',
  'p님',
  'q님',
  'r님',
  's님',
  't님',
];

const bootColor = [
  { bg: 'bg-primary', text: 'text-white' },
  { bg: 'bg-success', text: 'text-white' },
  { bg: 'bg-warning', text: 'text-black' },
  { bg: 'bg-info', text: 'text-white' },
  { bg: 'alert-primary', text: 'text-black' },
  { bg: 'alert-secondary', text: 'text-black' },
  { bg: 'alert-success', text: 'text-black' },
  { bg: 'alert-danger', text: 'text-black' },
  { bg: 'alert-warning', text: 'text-black' },
  { bg: 'alert-info', text: 'text-black' },
];

// IIFE
(() => {
  const socket = new WebSocket(`ws://${window.location.host}/chat`);
  const btnEl = document.getElementById('btn');
  const inputEl = document.getElementById('input');
  const chatEl = document.getElementById('chat');

  const chats = [];

  function pickRandom(arr) {
    const index = Math.floor(Math.random() * arr.length);
    console.log(index);
    return arr[index];
  }

  function drawChats(type, data) {
    if (type === 'sync') {
      chatEl.innerHTML = '';
      chats.forEach(({ name, msg, bg, textColor }) => {
        const msgEl = document.createElement('p');
        msgEl.innerText = `${name}: ${msg}`;
        msgEl.classList.add('p-2');
        msgEl.classList.add(bg);
        msgEl.classList.add('fw-bold');
        msgEl.classList.add(textColor);
        chatEl?.appendChild(msgEl);
        chatEl.scrollTop = chatEl.scrollHeight - chatEl.clientHeight;
      });
    } else if (type === 'chat') {
      const msgEl = document.createElement('p');
      msgEl.innerText = `${data.name}: ${data.msg}`;
      msgEl.classList.add('p-2');
      msgEl.classList.add(data.bg);
      msgEl.classList.add('fw-bold');
      msgEl.classList.add(data.textColor);
      chatEl?.appendChild(msgEl);
      chatEl.scrollTop = chatEl.scrollHeight - chatEl.clientHeight;
    }
  }

  const nickName = pickRandom(adj) + ' ' + pickRandom(member);
  const theme = pickRandom(bootColor);

  btnEl?.addEventListener('click', () => {
    const msg = inputEl?.value;
    const data = {
      name: nickName,
      msg: msg,
      bg: theme.bg,
      textColor: theme.text,
    };
    socket.send(JSON.stringify(data));
    inputEl.value = '';
  });

  inputEl?.addEventListener('keyup', (event) => {
    if (event.keyCode === 13) btnEl.click();
  });

  socket.addEventListener('message', (event) => {
    const msgData = JSON.parse(event.data);
    const { type, data } = msgData;

    if (type === 'sync') {
      const oldChats = data.chatsData;
      chats.push(...oldChats);
      drawChats(type, data);
    } else if (type === 'chat') {
      chats.push(data);
      drawChats(type, data);
    }
  });
})();
