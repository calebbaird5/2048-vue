<script setup="setup" lang="ts">
  import { ref, onMounted } from 'vue';

enum Direction {
  Left = 37,
  Up,
  Right,
  Down
}

interface Position {
  x: number;
  y: number;
}

interface Slide {
  value: number;
  id: number;
  merged?: number;
  position: Position;
}

const easyMode = ref(false);
function toggleEasyMode() {
  easyMode.value = !easyMode.value;
}

const slides: Ref<Slide[]> = ref([]);
const score = ref(0);
const gameover = ref(false);

function startNewGame(): void {
  slides.value = [];
  score.value = 0;
  gameover.value = false;
  generateRandomSlide();
  generateRandomSlide();
}

onMounted(startNewGame);

const currentSlide = ref(0);
function generateRandomSlide(): void {
  let positions = availablePositions();
  if (positions.length === 0) {
    gameover.value = true;
  } else {
    slides.value.push({
      value: Math.random() < .9 ? 2 : 4,
      id: currentSlide.value,
      position: positions[Math.floor(Math.random()*positions.length)]
    })
    currentSlide.value += 1;
  }
}

const values = ref([1,2,3,4]);
const mergedLastMove = ref(false);

import { useKeyUp } from '@/compostables/use-keyup';

useKeyUp([
  { key: 'ArrowUp', 'fn': () => handleKeyPress(Direction.Up) },
  { key: 'ArrowDown', 'fn': () => handleKeyPress(Direction.Down) },
  { key: 'ArrowLeft', 'fn': () => handleKeyPress(Direction.Left) },
  { key: 'ArrowRight', 'fn': () => handleKeyPress(Direction.Right) },
]);

function handleKeyPress(direction): void {
  console.log('in handlePress', direction)
  let slideProps: {horizontal: boolean, increase: boolean} | null = null;
  switch(direction) {
    case Direction.Left:
      slideProps = {horizontal: true, increase: false};
      break;
    case Direction.Right:
      slideProps = {horizontal: true, increase: true};
      break;
    case Direction.Up:
      slideProps = {horizontal: false, increase: false};
      break;
    case Direction.Down:
      slideProps = {horizontal: false, increase: true};
      break;
  }
  if (!mergedLastMove.value)
    slides.value = slides.value.filter(slide => !slide.merged)

  if (slideProps) {
    let {moved, merged} = slide(slideProps);
    let mergedSlides = slides.value.filter(slide => slide.merged);
    for (let slide of mergedSlides) {
      let destSlide = slides.value.find(el => el.id === slide.merged);
      if (destSlide) slide.position = destSlide.position;
    }

    if (moved || merged || easyMode.value) {
      generateRandomSlide();
    }

    mergedLastMove.value = merged;
  }
};


function slide(props: { horizontal: boolean, increase: boolean })
: {moved: boolean, merged: boolean} {
  let _slides = slides.value.filter(slide => !slide.merged);
  let moved = false;
  let merged = false;
  let sliderDim : 'x' | 'y' = props.horizontal ? 'x' : 'y';
  for (let v of values.value) {
    let destination = props.increase ? 4 : 1;

    let slider: Slide[];
    if (props.horizontal) {
      // Get the current row
      slider = _slides.filter(slide => slide.position.y === v)
    } else {
      // Get the current column
      slider = _slides.filter(slide => slide.position.x === v)
    }

    // Sort the slider
    let sorter = props.increase ?
      (l: Slide,r: Slide)=> l.position[sliderDim] < r.position[sliderDim] ? 1 : -1
    : (l: Slide,r: Slide)=> l.position[sliderDim] > r.position[sliderDim] ? 1 : -1;
    slider.sort(sorter);

    for (let i = 0; i < slider.length && slider[i]; ++i) {
      if (slider[i].position[sliderDim] !== destination) {
        moved = true;
        slider[i].position[sliderDim] = destination;
      }
      if (slider[i+1] && slider[i+1].value === slider[i].value) {
        merged = true;
        slider[i].value = slider[i+1].value *= 2;
        slider[i+1].merged = slider[i].id;
        score.value = score.value + slider[i].value;
        slider[++i].position[sliderDim] = destination;
      }
      destination = destination + (props.increase ? -1 : 1);
    }
  }
  return {moved, merged};
}

function availablePositions(): Position[] {
  let positions: Position[] = [];

  for (let x of values.value) {
    for (let y of values.value) {
      if (!slides.value.find((slide: Slide) =>
        slide.position.x === x && slide.position.y === y))
        positions.push({x,y} as Position);
    }
  }

  return positions;
}
</script>

<template>
  <section class="_2048">
    <div class="header">
      <div class="title">2048</div>
      <div class="header-right">
        <div class="score">
          <span class="title">score</span>
          <span class="value">{{score}}</span>
        </div>
        <div class="controlls">
          <button @click="startNewGame" class="new-game">New Game</button>
          <button @click="toggleEasyMode"
                  :class="['easy-mode', {active: easyMode}]"
                  >Easy Mode</button>
        </div>
      </div>
    </div>
    <div class="board">
      <div class="slots">
        <div class="slot" v-for="cell in new Array(16)"></div>
      </div>
      <div class="slides">
        <transition-group name="expand">
          <div v-for="slide in slides"
               :class="['slide',
                       slide.value > 2048 ? 'big' : '_'+slide.value,
                       {merged: slide.merged},
                       'x'+slide.position.x,
                       'y'+slide.position.y]"
               :key="slide.id"
               >{{slide.value}}</div>
      </transition-group>
    </div>
  </div>
  </section>
</template>

<!-- Global Styles -->
<style lang="scss">
body {
  background: #faf8ef;
}
</style>

<style lang="scss" scoped>
$gap: 13px;
$boardDim: min(80vw, 80vh);
$slotDim: calc((#{$boardDim} - 5*#{$gap})/4);
$background-color: #faf8ef;
$board-color: #cdc1b4;
$gap-color: #bbada0;

._2048 {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-color: $background-color;

  .header {
    width: $boardDim;
    padding: 20px 0;
    display: flex;
    justify-content: space-between;

    .title {
      font-size: 80px;
      font-weight: bold;
      color: #776e65;
    }

    .header-right {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-end;
      flex: 1;
      padding-left: 20px;

      .score {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        background-color: $gap-color;
        padding: 0 10px;
        align-items: center;
        width: 100%;

        .title {
          font-size: 13px;
          font-weight: bold;
          color: #eee4da;
        }

        .value {
          color: white;
          font-size: 25px;
          font-weight: bold;
        }
      }
      .controlls {
        button {
          background-color: #8f7a66;
          color: #f9f6f2;
          padding: 10px 20px;
          border-radius: 3px;
          border: none;
          font-size: 18px;
          font-weight: bold;

          &.active {
            background-color: #bfaa96;
          }
        }
      }
    }
  }

  .board {
    width: $boardDim;
    height: $boardDim;
    padding: $gap;
    position: relative;
    border-radius: 8px;
    background-color: $gap-color;

    .slots, .slides {
      display: grid;
      grid-gap: $gap;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      grid-template-rows: 1fr 1fr 1fr 1fr;

      .slot {
        height: $slotDim;
        border-radius: 5px;
      }

      .slot {
        background-color:$board-color;
      }
    }

    .slides {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      padding: $gap;
      display: block;
    }
  }
}


.slide {
  transition: .5s;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bolder;
  position: absolute;
  width: $slotDim;
  height: $slotDim;
  font-size: calc(#{$slotDim} / 2.5);

  &.merged{ z-index: -1 }

  &.expand-enter-active {
    width: 0;
    height: 0;
    margin-left: calc(#{$slotDim} / 2);
    margin-top: calc(#{$slotDim} / 2);
    border-radius: 50%;
    color: $board-color !important;
    z-index: -1;
    font-size: 0;
  }

  &.expand-leave-to-active {
    $slide-expanded-dim: calc(#{$slotDim} * 1.2);
    width: $slide-expanded-dim;
    height: $slide-expanded-dim;
    margin-left: calc((#{$slide-expanded-dim} - #{$slotDim}) / -2);
    margin-top: calc((#{$slide-expanded-dim} - #{$slotDim}) / -2);
    border-radius: 10px;
  }

  &.x1 {
    left: $gap;
  }
  &.x2 {
    left: calc(2 * #{$gap} + #{$slotDim});
  }
  &.x3 {
    left: calc(3 * #{$gap} + 2 * #{$slotDim});
  }
  &.x4 {
    left: calc(4 * #{$gap} + 3 * #{$slotDim});
  }
  &.y1 {
    top: $gap;
  }
  &.y2 {
    top: calc(2 * #{$gap} + #{$slotDim});
  }
  &.y3 {
    top: calc(3 * #{$gap} + 2 * #{$slotDim});
  }
  &.y4 {
    top: calc(4 * #{$gap} + 3 * #{$slotDim});
  }

  &._1_1 {
    grid-row: 1;
    grid-column: 1;
  }

  &._1_4 {
    grid-row: 1;
    grid-column: 4;
  }

  &._2 {
    background-color: #eee4da;
    color: #776e65;
  }
  &._4 {
    background-color: #eee1c9;
    color: #776e65;
  }
  &._8 {
    color: #f9f6f2;
    background: #f3b27a;
  }
  &._16 {
    color: #f9f6f2;
    background: #f69664;
  }
  &._32 {
    background-color: #f77c5f;
    color: #f9f6f2;
  }
  &._64 {
    background-color: #f75f3b;
    color: #f9f6f2;
  }
  &._128 {
    color: #f9f6f2;
    background: #edd073;
    box-shadow: 0 0 30px 10px rgb(243 215 116 / 24%),
                inset 0 0 0 1px rgb(255 255 255 / 14%);
    font-size: calc(#{$slotDim} / 3);
  }
  &._256 {
    color: #f9f6f2;
    background: #edcc62;
    box-shadow: 0 0 30px 10px rgb(243 215 116 / 32%),
                inset 0 0 0 1px rgb(255 255 255 / 19%);
    font-size: calc(#{$slotDim} / 3);
  }
  &._512 {
    color: #f9f6f2;
    background: #edc950;
    box-shadow: 0 0 30px 10px rgb(243 215 116 / 40%),
                inset 0 0 0 1px rgb(255 255 255 / 24%);
    font-size: calc(#{$slotDim} / 3);
  }
  &._1024 {
    color: #f9f6f2;
    background: #edc53f;
    box-shadow: 0 0 30px 10px rgb(243 215 116 / 48%),
                inset 0 0 0 1px rgb(255 255 255 / 29%);
    font-size: calc(#{$slotDim} / 3.5);
  }
  &._2048 {
    color: #f9f6f2;
    background: #edc22e;
    box-shadow: 0 0 30px 10px rgb(243 215 116 / 56%),
                inset 0 0 0 1px rgb(255 255 255 / 33%);
    font-size: 35px;
    font-size: calc(#{$slotDim} / 3.5);
  }
  &.big {
    color: #f9f6f2;
    background: #3c3a33;
    font-size: 30px;
    font-size: calc(#{$slotDim} / 4);
  }
}
</style>
