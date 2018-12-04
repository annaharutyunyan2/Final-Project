const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

context.scale(20, 20);


const colors = [
    null,
    '#0000FF',
    '#ADFF2F',
    '#A52A2A',
    '#FF0000', 
    '#708090',
    '#DEB887',
    '#EE82EE',
];


const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
};

const createFigure = function(type)
{
    if (type === 'I') {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === 'L') {
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
    } else if (type === 'J') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if (type === 'O') {
        return [
            [4, 4],
            [4, 4],
        ];
    } else if (type === 'Z') {
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'T') {
        return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    }
}

const createMatrix = function(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x,
                                 y + offset.y,
                                 1, 1);
            }
        });
    });
}



const arenaClean = function() {
    let rowCount = 1;
    outer: for (let y = arena.length -1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount * 15;
        rowCount *= 2;
    }
}

const touch = function(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

const createObject = function(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}




const draw = function() {
    context.fillStyle = '#FF7F50';
    context.fillRect(0, 0, canvas.width, canvas.height);

    createMatrix(arena, {x: 0, y: 0});
    createMatrix(player.matrix, player.pos);
}

const combine = function(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

const rotate = function(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

const fastDrop = function() {
    player.pos.y++;
    if (touch(arena, player)) {
        player.pos.y--;
        combine(arena, player);
        Reset();
        arenaClean();
        updateScore();
    }
    dropC = 0;
}

const surprise = function() {
    player.pos.y += 20;
    if (touch(arena, player)) {
        player.pos.y -= 20;
        combine(arena, player);
        Reset();
        arenaClean();
        updateScore();
    }
    dropC = 0;
}


const Move = function(offset) {
    player.pos.x += offset;
    if (touch(arena, player)) {
        player.pos.x -= offset;
    }
}

const Reset = function() {
    const pieces = 'TJLOSZI';
    player.matrix = createFigure(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                   (player.matrix[0].length / 2 | 0);
    if (touch(arena, player)) {
        alert("Game over" + "  " + "You scored" + " " + player.score)
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}

const Rotate = function(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (touch(arena, player)) {
        player.pos.x += offset;
        if(offset>0){
          offset = -(offset + 1);
        }
        else {
          offset = -(offset - 1);
        }
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

let dropC = 0;
let dropInt = 1000;

let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;

    dropC += deltaTime;
    if (dropC > dropInt) {
        fastDrop();
    }

    lastTime = time;

    draw();
    requestAnimationFrame(update);
}

const updateScore = function() {
    document.getElementById('score').innerText = player.score;
}


document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        Move(-1);
    } else if (event.keyCode === 39) {
        Move(1);
    } else if (event.keyCode === 40) {
        fastDrop();
    } else if (event.keyCode === 16) {
        Rotate(-1);
    } else if (event.keyCode === 38) {
        Rotate(1);
    }
    else if (event.keyCode === 32){
      surprise();
    }

});


const arena = createObject(12, 20);

updateScore();

Reset();

update();