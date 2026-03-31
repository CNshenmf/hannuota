// ==============================================
// ✨ 零基础可修改配置区（所有自定义都在这里）
// ==============================================
const CONFIG = {
    diskColors: [          // 盘子颜色（马卡龙护眼）
        "#ff7675", "#fd79a8", "#6c5ce7",
        "#00b894", "#fdc968", "#74b9ff"
    ],
    errorText: "大盘子不能放在小盘子上面哦！",
    winText: "🎉 太棒啦！你成功完成汉诺塔！",
    demoSpeed: 800,        // 自动演示速度（毫秒）
    startDisks: 4          // 默认开始 4 盘
};

// ==============================================
// 下面是游戏逻辑，不用动！
// ==============================================
let currentDisks = CONFIG.startDisks;
let steps = 0;
let time = 0;
let timer;
let isPlaying = false;
let isDemo = false;
let history = [];

// 柱子
const towers = [
    document.getElementById("tower1"),
    document.getElementById("tower2"),
    document.getElementById("tower3")
];

// 元素
const stepsEl = document.getElementById("steps");
const timerEl = document.getElementById("timer");
const msgEl = document.getElementById("message");
const diffBtns = document.querySelectorAll(".diff-btn");
const resetBtn = document.getElementById("reset");
const undoBtn = document.getElementById("undo");
const demoBtn = document.getElementById("demo");
const helpBtn = document.getElementById("help");
const soundBtn = document.getElementById("sound");
const modal = document.getElementById("modal");
const closeModal = document.querySelector(".close");

// 初始化游戏
initGame(CONFIG.startDisks);

// 绑定事件
bindEvents();

// ==============================================
// 函数：初始化游戏
// ==============================================
function initGame(num) {
    currentDisks = num;
    steps = 0;
    time = 0;
    history = [];
    isPlaying = false;
    isDemo = false;
    clearInterval(timer);

    towers.forEach(t => t.innerHTML = "");
    updateInfo();
    msg("");

    // 生成盘子
    for (let i = num; i >= 1; i--) {
        const d = document.createElement("div");
        d.className = "disk";
        d.draggable = true;
        d.dataset.size = i;
        d.style.width = 60 + i * 25 + "px";
        d.style.backgroundColor = CONFIG.diskColors[i-1];
        d.innerText = i;
        towers[0].appendChild(d);
    }

    // 拖拽事件
    bindDrag();
}

// ==============================================
// 函数：拖拽功能
// ==============================================
function bindDrag() {
    const disks = document.querySelectorAll(".disk");
    disks.forEach(d => {
        d.ondragstart = e => {
            if(isDemo) return;
            e.dataTransfer.setData("size", d.dataset.size);
            e.dataTransfer.setData("from", d.parentElement.id);
        };
    });

    towers.forEach(t => {
        t.ondragover = e => e.preventDefault();
        t.ondrop = e => {
            if(isDemo) return;
            e.preventDefault();
            const size = e.dataTransfer.getData("size");
            const fromId = e.dataTransfer.getData("from");
            const from = document.getElementById(fromId);
            const to = t;

            moveDisk(from, to, size);
        };
    });
}

// ==============================================
// 函数：移动盘子
// ==============================================
function moveDisk(from, to, size) {
    const topTo = to.lastChild;
    if (topTo && topTo.dataset.size < size) {
        msg(CONFIG.errorText);
        return;
    }

    // 记录历史（用于撤销）
    history.push([from, to, size]);

    // 移动
    const disk = document.querySelector(`[data-size="${size}"]`);
    to.appendChild(disk);
    steps++;
    updateInfo();
    msg("");

    if (!isPlaying) startTimer();
    isPlaying = true;

    checkWin();
}

// ==============================================
// 函数：判断胜利
// ==============================================
function checkWin() {
    if (towers[2].children.length === currentDisks) {
        clearInterval(timer);
        msg(CONFIG.winText);
        isDemo = true;
    }
}

// ==============================================
// 函数：撤销
// ==============================================
function undo() {
    if (history.length === 0 || isDemo) return;
    const last = history.pop();
    const from = last[1];
    const to = last[0];
    const size = last[2];
    const disk = document.querySelector(`[data-size="${size}"]`);
    to.appendChild(disk);
    steps--;
    updateInfo();
    msg("");
}

// ==============================================
// 函数：自动演示
// ==============================================
function demo() {
    if(isDemo) return;
    isDemo = true;
    clearInterval(timer);
    initGame(currentDisks);
    msg("自动演示中...");

    const solution = solve(currentDisks, 0, 2, 1);
    let idx = 0;

    const play = () => {
        if (idx >= solution.length) {
            msg(CONFIG.winText);
            return;
        }
        const [f, t] = solution[idx++];
        moveDisk(towers[f], towers[t], towers[f].lastChild.dataset.size);
        setTimeout(play, CONFIG.demoSpeed);
    };
    play();
}

// 汉诺塔算法
function solve(n, a, b, c) {
    if (n === 0) return [];
    return [
        ...solve(n-1, a, c, b),
        [a, b],
        ...solve(n-1, c, b, a)
    ];
}

// ==============================================
// 工具函数
// ==============================================
function startTimer() {
    timer = setInterval(() => {
        time++;
        const m = String(Math.floor(time/60)).padStart(2,"0");
        const s = String(time%60).padStart(2,"0");
        timerEl.innerText = `${m}:${s}`;
    }, 1000);
}

function updateInfo() {
    stepsEl.innerText = steps;
}

function msg(text) {
    msgEl.innerText = text;
}

function bindEvents() {
    // 难度
    diffBtns.forEach(b => {
        b.onclick = () => {
            diffBtns.forEach(x => x.classList.remove("active"));
            b.classList.add("active");
            initGame(+b.dataset.num);
        };
    });
    diffBtns[0].classList.add("active");

    resetBtn.onclick = () => initGame(currentDisks);
    undoBtn.onclick = undo;
    demoBtn.onclick = demo;

    // 弹窗
    helpBtn.onclick = () => modal.style.display = "flex";
    closeModal.onclick = () => modal.style.display = "none";
    soundBtn.onclick = () => msg("音效已关闭");
}