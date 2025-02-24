document.addEventListener('DOMContentLoaded', function () {
    const socket = io('http://localhost:3000'); // Ensure this matches your server's address and port
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const colorPicker = document.getElementById('colorPicker');
    const brushSize = document.getElementById('brushSize');
    const clearBtn = document.getElementById('clearBtn');



    function resizeCanvas() {
        canvas.width = window.innerWidth - 60;
        canvas.height = window.innerHeight - 100;
    }

    window.onresize = resizeCanvas;
    resizeCanvas();


    canvas.addEventListener('mousedown', (e) => {
        // Emit the start command with current settings
        socket.emit('draw_line', {
            lineWidth: brushSize.value, // Use current value from the slider
            strokeStyle: colorPicker.value, // Use current color
            startX: e.offsetX,
            startY: e.offsetY,
            type: 'start'
        });
    });

    canvas.addEventListener('mousemove', (e) => {
        if (e.buttons === 1) { // Left mouse button
            // Emit the draw command with current settings
            socket.emit('draw_line', {
                lineWidth: brushSize.value, // Use current value from the slider
                strokeStyle: colorPicker.value, // Use current color
                x: e.offsetX,
                y: e.offsetY,
                type: 'draw'
            });
        }
    });


    canvas.addEventListener('mouseup', () => { });

    socket.on('connect', () => {
        console.log('Connected to the server'); // Debugging
    });

    socket.on('draw_line', (data) => {
        console.log('Processing draw_line event from server', data); // Debugging
        ctx.lineWidth = data.lineWidth;
        ctx.strokeStyle = data.strokeStyle;
        if (data.type === 'start') {
            ctx.beginPath();
            ctx.moveTo(data.startX, data.startY);
        } else {
            ctx.lineTo(data.x, data.y);
            ctx.stroke();
        }
    });


    clearBtn.addEventListener('click', () => {
        console.log('Clear board button clicked'); // Debugging
        socket.emit('clear_board');
    });

    socket.on('clear_board', () => {
        console.log('Clearing the canvas on clear_board event'); // Debugging
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });



    socket.on('load', (data) => {
        console.log('Processing load event from server', data); // Debugging

        if (!Array.isArray(data)) {
            console.error('Expected data to be an array, received:', data);
            return;
        }

        let isDrawing = false;

        let lastStyle = { lineWidth: null, strokeStyle: null };

        data.forEach(line => {
            if (lastStyle.lineWidth !== line.lineWidth || lastStyle.strokeStyle !== line.strokeStyle) {
                if (isDrawing) {
                    ctx.stroke();  // Apply previous batched strokes
                    ctx.beginPath(); // Start a new path for a new style
                }
                // Update style
                ctx.lineWidth = line.lineWidth;
                ctx.strokeStyle = line.strokeStyle;
                lastStyle = { lineWidth: line.lineWidth, strokeStyle: line.strokeStyle };
            }

            if (line.type === 'start') {
                ctx.moveTo(line.startX, line.startY);
                isDrawing = true;
            } else if (line.type === 'draw' && isDrawing) {
                ctx.lineTo(line.x, line.y);
            }
        });

        if (isDrawing) {
            ctx.stroke();  // Stroke the last batched path
        }

        isDrawing = false;
    });
});
