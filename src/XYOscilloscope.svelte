<script>
    import { onDestroy, onMount } from 'svelte';
    export let width;
    export let height;
    export let left;
    export let right;
    export let leftAnalyser;
    export let rightAnalyser;

    let canvas;
    let animationFrame;

    onMount(() => {
        const ctx = canvas.getContext('2d');
        function animate() {
            animationFrame = requestAnimationFrame( animate );
            leftAnalyser.getFloatTimeDomainData(left);
            rightAnalyser.getFloatTimeDomainData(right);
            ctx.fillStyle = 'rgba(52, 52, 52, 0.1)';
            ctx.fillRect(0, 0, width, height);
            ctx.strokeStyle = 'rgba(100, 240, 100, 1)';
            ctx.beginPath();
            const scaleX = width / 2;
            const offsetX = scaleX;
            const scaleY = height / 2;
            const offsetY = scaleY;
            left.forEach((value, idx) => {
                const x = offsetX + left[idx] * scaleX;
                const y = offsetY - right[idx] * scaleY;
                if (idx) {
                    ctx.lineTo(x, y);
                } else {
                    ctx.moveTo(x, y);
                }
            });
            ctx.stroke();
        }
        animate();
    });

    onDestroy(() => {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
    });

</script>

<canvas
    bind:this={canvas}
    width={width}
    height={height}
    style={`width:${width}px;height:${height}px`}
/>

<style>

</style>
