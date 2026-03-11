// GameLab 主游戏文件
import Phaser from 'phaser';

// 游戏配置
const config = {
    type: Phaser.AUTO,
    parent: 'game-canvas-container',
    width: 800,
    height: 500,
    backgroundColor: '#1a1a2e',
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    }
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 游戏变量
let player;
let platforms;
let cursors;
let stars;
let score = 0;
let scoreText;
let highScore = 0;
let highScoreText;
let gameStarted = false;

// 预加载资源
function preload() {
    // 加载简单图形（后续可替换为原创美术）
    this.load.image('ground', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    this.load.image('star', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNkYPhfz0AEYBxVSF+FAA5eJCK8lXW/AAAAAElFTkSuQmCC');
    this.load.image('player', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAKCAYAAABmBXS+AAAAFUlEQVR42mNkYPj/n4EIwDgqEVcKACUBCYlKp5vEAAAAAElFTkSuQmCC');
    
    // 加载字体（如果需要）
    this.load.bitmapFont('pixelFont', 'data:image/png;base64,', 
        'data:xml;base64,');
}

// 创建游戏场景
function create() {
    // 创建平台
    platforms = this.physics.add.staticGroup();
    
    // 地面
    platforms.create(400, 470, 'ground').setScale(10, 1).refreshBody();
    
    // 其他平台
    platforms.create(600, 400, 'ground').setScale(2, 1).refreshBody();
    platforms.create(50, 350, 'ground').setScale(2, 1).refreshBody();
    platforms.create(750, 300, 'ground').setScale(2, 1).refreshBody();
    
    // 创建玩家
    player = this.physics.add.sprite(100, 450, 'player');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    
    // 物理碰撞
    this.physics.add.collider(player, platforms);
    
    // 创建星星
    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });
    
    stars.children.iterate(function(child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });
    
    this.physics.add.collider(stars, platforms);
    this.physics.add.overlap(player, stars, collectStar, null, this);
    
    // 键盘控制
    cursors = this.input.keyboard.createCursorKeys();
    
    // 分数显示
    scoreText = this.add.text(16, 16, '分数: 0', {
        fontSize: '24px',
        fill: '#fff',
        fontFamily: 'Arial'
    });
    
    // 最高分显示 (从本地存储加载)
    highScore = localStorage.getItem('binaryAdventureHighScore') || 0;
    highScoreText = this.add.text(16, 50, '最高分: ' + highScore, {
        fontSize: '20px',
        fill: '#ffcc00',
        fontFamily: 'Arial'
    });
    
    // 游戏标题
    const title = this.add.text(400, 50, '二进制冒险 原型版', {
        fontSize: '32px',
        fill: '#00d4ff',
        fontFamily: 'Arial',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // 游戏说明
    const instructions = this.add.text(400, 100, '使用方向键移动，收集星星', {
        fontSize: '18px',
        fill: '#aaa',
        fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // 数字工匠价值观展示
    const values = this.add.text(400, 430, '数字工匠文化：开源 · 隐私 · 实用 · 迭代', {
        fontSize: '14px',
        fill: '#00ff9d',
        fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    gameStarted = true;
}

// 更新游戏逻辑
function update() {
    if (!gameStarted) return;
    
    // 左右移动
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.setFlipX(true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.setFlipX(false);
    } else {
        player.setVelocityX(0);
    }
    
    // 跳跃
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    }
}

// 收集星星
function collectStar(player, star) {
    star.disableBody(true, true);
    
    score += 10;
    scoreText.setText('分数: ' + score);
    
    // 更新最高分
    if (score > highScore) {
        highScore = score;
        highScoreText.setText('最高分: ' + highScore);
        localStorage.setItem('binaryAdventureHighScore', highScore);
    }
    
    // 如果收集完所有星星
    if (stars.countActive(true) === 0) {
        // 重新生成星星
        stars.children.iterate(function(child) {
            child.enableBody(true, child.x, 0, true, true);
        });
        
        // 显示恭喜信息
        const victoryText = this.add.text(400, 250, '恭喜！收集了所有星星！', {
            fontSize: '28px',
            fill: '#ffcc00',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // 2秒后消失
        this.time.delayedCall(2000, () => {
            victoryText.destroy();
        });
    }
}

// 游戏控制函数（供HTML按钮调用）
window.startGame = function() {
    if (game.scene.scenes[0]) {
        game.scene.start('main');
    }
};

window.pauseGame = function() {
    if (game.scene.scenes[0]) {
        if (game.scene.scenes[0].scene.isPaused()) {
            game.scene.scenes[0].scene.resume();
        } else {
            game.scene.scenes[0].scene.pause();
        }
    }
};

// 导出游戏实例（供调试使用）
window.gameInstance = game;

console.log('GameLab 游戏引擎初始化完成！');
console.log('数字工匠文化：开源、隐私、实用、持续迭代');