<template>
    <div class="p-50">
        <div class="large grid centered square-grid">
            <h2 ref="titleElement" class="text-8xl">XG NNGY</h2>
        </div>
    </div>
</template>


<script setup lang="ts">
defineOptions({ name: 'LoginView' });

import type { WAAPIAnimationParams, WAAPIFunctionValue } from 'animejs';
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { waapi, stagger, splitText } from 'animejs';

// Referencia al elemento del título
const titleElement = ref<HTMLElement | null>(null);
let cleanup: (() => void) | null = null;

onMounted(() => {
    const el = titleElement.value;
    if (!el) return;

    // Dividir el contenido del H2 en caracteres preservando espacios
    const splitter = splitText(el, { words: false, chars: true, includeSpaces: true });
    const chars = splitter.chars as HTMLElement[];

    const animationOptions: WAAPIAnimationParams = {
        translate: '0 -6rem', // 0=posición original, -6rem=arriba
        delay: stagger(100) as unknown as WAAPIFunctionValue,
        duration: 600,
        loop: true,
        alternate: true,
        ease: 'inOut(2)',
    };

    const animation = waapi.animate(chars, animationOptions);

    // Limpieza al desmontar el componente
    cleanup = () => {
        animation.cancel();
        splitter.revert();
    };
});

onBeforeUnmount(() => {
    if (cleanup) cleanup();
});
</script>

<style scoped></style>
