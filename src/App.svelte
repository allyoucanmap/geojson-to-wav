<script>
    import { onMount } from 'svelte';
    import featuresUtils from './utils/features.js';
    import wavUtils from './utils/wav.js';
    import XYOscilloscope from './XYOscilloscope.svelte';

    let start = false;
    let collection = { type: 'FeatureCollection', features: [] };
    let loopsCount = 16;
    let tolerance = 0.01;
    let volume = 0.5;

    let audio;
    let leftAnalyser;
    let rightAnalyser;
    let left;
    let right;
    let width = 512;
    let height = 512;

    onMount(() => {
        fetch('data/countries.geo.json')
            .then((res) => res.json())
            .then((data) => {
                collection = data;
            });
    });

    function setup() {
        if (start) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContext();
            audio = new Audio('');
            audio.autoplay = true;
            audio.loop = true;
            const gainNode = audioContext.createGain();

            gainNode.gain.value = volume;

            const track = audioContext.createMediaElementSource(audio);
            gainNode.connect(audioContext.destination);
            const splitter = audioContext.createChannelSplitter();
            track.connect(splitter);
            const merger = audioContext.createChannelMerger();
            merger
                .connect(gainNode)
                .connect(audioContext.destination);

            leftAnalyser = audioContext.createAnalyser();
            leftAnalyser.fftSize = width * 2;
            leftAnalyser.smoothingTimeConstant = 1;
            left = new Float32Array(leftAnalyser.frequencyBinCount);
            const leftIndex = 0;
            splitter.connect(leftAnalyser, leftIndex, 0);
            leftAnalyser.connect(merger, 0, leftIndex);

            rightAnalyser = audioContext.createAnalyser();
            rightAnalyser.fftSize = width * 2;
            rightAnalyser.smoothingTimeConstant = 1;
            right = new Float32Array(rightAnalyser.frequencyBinCount);
            const rightIndex = 1;
            splitter.connect(rightAnalyser, rightIndex, 0);
            rightAnalyser.connect(merger, 0, rightIndex);
            
        }
    };

    function updateAudio() {
        if (audio) {
            const features = featuresUtils.map(collection, {
                width: 255,
                height: 255,
                centered: true,
                round: true,
                flipYCoords: true,
                simplify: {
                    tolerance,
                    highQuality: true
                }
            });
            let coordinates = [];
            featuresUtils.scan(features, (coords, idx) => {
                if (!idx) {
                    coordinates = [
                        ...coordinates,
                        ...[...Array(loopsCount).keys()].reduce((acc) => [ ...acc, ...coords], [])
                    ];
                }
                return coords;
            });
            audio.setAttribute('src', wavUtils.coordinatesToWav(coordinates));
        }
    }

    
    $: setup(start);
    $: updateAudio({ audio, collection, loopsCount, tolerance });

    function handleStart() {
        start = true;
    }

</script>

<div class="container">
    {#if audio}
        <XYOscilloscope
            width={width}
            height={height}
            left={left}
            right={right}
            leftAnalyser={leftAnalyser}
            rightAnalyser={rightAnalyser}
        />
    {:else}
        <button on:click={handleStart}>
            START
        </button>
    {/if}
</div>

<style>

</style>