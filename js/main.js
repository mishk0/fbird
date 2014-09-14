var fb = {};

fb.init = function(w, h) {
    var canvas = document.createElement('canvas');

    fb.inertionNode = document.querySelector('.inertion');
    fb.scoreNode = document.querySelector('.score');
    fb.startMenuNode = document.querySelector('.b-start-menu');
    fb.gameOverNode = document.querySelector('.b-gameover');
    fb.goscoreNode = document.querySelector('.gameover-score');
    fb.bestscoreNode = document.querySelector('.gameover-bestscore');
    fb.medalNode = document.querySelector('.medal');
    fb.goTitleNode = document.querySelector('.gameover-title');
    fb.goTableWrapperNode = document.querySelector('.gameover-table-wrapper');
    fb.sprite = new Image();
    fb.sprite.src = 'img/images-sd.png';
    fb.best_score = 0;
    fb.ctx = canvas.getContext('2d');

    canvas.width = w;
    canvas.height = h;

    document.querySelector('.b-game').appendChild(canvas);


};

fb.startGame = function(){
    fb.setDefaultSettings();
    fb.startMenuNode.style.display = 'none';
    fb.scoreNode.style.display = 'block';
    fb.gameOverNode.style.display = 'none';
    fb.render();
    fb.drawScore(0);
}

fb.setDefaultSettings = function(){
    fb.tubes = [
        {x: 200, gap: [200, 350]},
        {x: 350, gap: [110, 260]}
    ];
    fb.score = 0;
    fb.inertion = 0;
    fb.vx = 0;
    fb.B_W = 34;
    fb.B_H = 24;
    fb.TUBE_WIDTH = 50;
    fb.bird_pos_x = 50;
    fb.MIDDLE_GAP = 150;
    fb.bird_pos_y = fb.HEIGHT_AREA/2 - fb.B_H/2;
    fb.bird_speed = 100;
    fb.animation_timeout = 7000 / fb.bird_speed;
    fb.animation_rotate_timeout = 300;
    fb.GAP = 120;
    fb.ot = new Date(); // время последнего кадра
    fb.time_animation = new Date();
    fb.goTitleNode.classList.remove('gameover-title-tr');
    fb.goTableWrapperNode.classList.remove('gameover-table-wrapper-tr');
}

fb.render = function() {

    var t = new Date();
    var delta = t - fb.ot;
    fb.ot = t;
    fb.inertion -= 9.8 * delta / 1000;

    fb.renderBackground(delta);
    fb.renderTubes(delta);
    fb.renderBird(t);
    if (fb.checkCollision()) {
        fb.gameOver();
        return false;
    }
    fb.scoring();

    window.requestAnimationFrame(fb.render);
};

fb.gameOver = function(){
    var medalType;
    fb.scoreNode.style.display = 'none';
    fb.gameOverNode.style.display = 'block';
    fb.best_score = fb.best_score < fb.score ? fb.score : fb.best_score;
    fb.goscoreNode.innerHTML = fb.score;
    fb.bestscoreNode.innerHTML = fb.best_score;

    if (fb.score < 10) {
        medalType = 'm1';
    } else if (fb.score >= 10 && fb.score < 25) {
        medalType = 'm2';
    } else if (fb.score >= 25 && fb.score < 50) {
        medalType = 'm3';
    } else {
        medalType = 'm4';
    }
    fb.medalNode.className = 'medal ' + medalType;
    setTimeout(function(){
        fb.goTitleNode.classList.add('gameover-title-tr');
    }, 0)
    setTimeout(function(){
        fb.goTableWrapperNode.classList.add('gameover-table-wrapper-tr');
    }, 300)

};

fb.renderBird = function(t) {
    var animation_frames = 1;
    var rotate_top = fb.animation_rotate_timeout > t - fb.animation_rotate;
    var old_bird_pos = fb.bird_pos_y;
    var step = Math.floor((t - fb.time_animation) / fb.animation_timeout);

    if (step > animation_frames) {
        fb.time_animation = t;
        step = 1;
    }
    fb.bird_pos_y -= fb.inertion;
    var rotate_bottom = old_bird_pos < fb.bird_pos_y - 4;
    var ctx = fb.ctx;
    var frame = [images.bird_0.frame, images.bird_1.frame];

    ctx.save();
    ctx.translate(fb.bird_pos_x, fb.bird_pos_y);

    if (rotate_top) {
        ctx.rotate(-2*Math.PI/3);
    } else if (rotate_bottom) {
        ctx.rotate(-Math.PI/4);
    } else {
        ctx.rotate(-Math.PI/2);
    }

    ctx.drawImage(
        fb.sprite,
        frame[step].x, frame[step].y, frame[step].h, frame[step].w,
        -frame[step].h/2, -frame[step].w/2,
        frame[step].h, frame[step].w
    );

    ctx.restore();

};

fb.renderBackground = function(delta) {
    var frame = images.bg.frame;
    fb.ctx.drawImage(fb.sprite, frame.x + 2, frame.y, frame.w - 2, frame.h, fb.vx, 0, frame.w - 2, frame.h);
    fb.ctx.drawImage(fb.sprite, frame.x + 2, frame.y, frame.w - 2, frame.h, frame.w - Math.abs(fb.vx), 0, frame.w - 2, frame.h);

    if (Math.abs(fb.vx) > frame.w) {
        fb.vx = 0;
    }
    fb.vx -= fb.bird_speed * delta / 1000;
};

fb.renderTubes = function(delta) {
    fb.recalcTubesPosition(delta);
    var l = fb.tubes.length;
    for (var i = 0; i < l; i++) {
        fb.renderTube(fb.tubes[i]);
    }
};

fb.renderTube = function(tube) {
    var ctx = fb.ctx;
    var frame = images.pipe_green.frame;
    var frame2 = images.pipe_green2.frame;

    ctx.drawImage(fb.sprite, frame2.x, frame2.y + frame2.h - tube.gap[0], frame2.w, tube.gap[0], tube.x, 0, fb.TUBE_WIDTH, tube.gap[0]);
    ctx.drawImage(fb.sprite, frame.x, frame.y, frame.w, fb.HEIGHT_AREA - tube.gap[1], tube.x, tube.gap[1], fb.TUBE_WIDTH, fb.HEIGHT_AREA - tube.gap[1]);
};

fb.recalcTubesPosition = function(delta){
    fb.tubes.map(function(i){ // двигает трубу
        i.x -= fb.bird_speed * delta / 1000;
    });
    fb.tubes.filter(function(i){ // удаляем трубу
        return i.x + fb.TUBE_WIDTH > 0;
    });

    if (fb.WIDTH_AREA - fb.tubes[fb.tubes.length - 1].x - fb.TUBE_WIDTH > fb.GAP) {
        var top_gap = Math.floor(Math.random() * 200 + 1) + 100;
        fb.tubes.push({
            x: fb.WIDTH_AREA,
            gap: [top_gap, top_gap + fb.MIDDLE_GAP]
        })
    }
}

fb.checkCollision = function() {
    if (fb.bird_pos_y < 0 || fb.bird_pos_y > fb.HEIGHT_AREA) {
        return true;
    }

    return fb.tubes.some(function(i){
        return (fb.bird_pos_x > i.x && fb.bird_pos_x < i.x + fb.TUBE_WIDTH) && (fb.bird_pos_y < i.gap[0] || fb.bird_pos_y > i.gap[1])
    });

};

fb.scoring = function() {
    fb.tubes.forEach(function(i){
        if (i.w) {
            return false;
        }
        if (fb.bird_pos_x > i.x + fb.TUBE_WIDTH) {
            i.w = true;
            fb.score += 1;
            fb.drawScore(fb.score);
        }
    });
}

fb.drawScore = function(score) {
    var score = String(score).split('');
    var fragment = document.createDocumentFragment()

    score.forEach(function(i){
        var node = document.createElement('span');
        node.classList.add('z' + i)
        fragment.appendChild(node)
    });
    fb.scoreNode.innerHTML = '';
    fb.scoreNode.appendChild(fragment)
}


document.addEventListener('keydown', function(e) {
    switch (e.keyCode) {
        case 32:
            fb.inertion += 5;
            fb.animation_rotate = new Date();
            break;
        case 38:
            fb.bird_speed += 10;
            break;
        case 40:
            if (fb.bird_speed <= 50) {
                return false;
            }
            fb.bird_speed -= 10;
            break;
    }
});

document.addEventListener('touchstart', function(e) {
    if (e.target.classList.contains('play-btn')) {
        fb.startGame();
    } else {
        fb.inertion += 5;
        fb.animation_rotate = new Date();
    }

});

(function() {
    fb.WIDTH_AREA = screen.width;
    fb.HEIGHT_AREA = screen.height - 20;

    fb.init(fb.WIDTH_AREA, fb.HEIGHT_AREA);
})();