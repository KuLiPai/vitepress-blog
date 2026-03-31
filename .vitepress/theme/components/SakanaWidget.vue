<template>
  <div class="sakana-shell">
    <div ref="containerRef" class="sakana-widget-container" />
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

interface SakanaWidgetInstance {
  mount: (el: HTMLElement | string) => SakanaWidgetInstance;
  unmount?: () => void;
}

interface SakanaWidgetCharacter {
  image: string;
  initialState: Record<string, number>;
}

interface SakanaWidgetConstructor {
  new (options?: Record<string, unknown>): SakanaWidgetInstance;
  getCharacter: (name: string) => SakanaWidgetCharacter | null;
  registerCharacter: (name: string, character: SakanaWidgetCharacter) => void;
}

declare global {
  interface Window {
    SakanaWidget?: SakanaWidgetConstructor;
  }
}

const SAKANA_STYLE_ID = "sakana-widget-style";
const SAKANA_SCRIPT_ID = "sakana-widget-script";
const SAKANA_STYLE_URL =
  "https://cdn.jsdelivr.net/npm/sakana-widget@2.7.1/lib/sakana.min.css";
const SAKANA_SCRIPT_URL =
  "https://cdn.jsdelivr.net/npm/sakana-widget@2.7.1/lib/sakana.min.js";
const CUSTOM_CHARACTER_NAME = "kulipai-greencat";

// 后续如果你想换图，直接改这里即可。
const CUSTOM_IMAGE_URL = "/greencat.webp";

const containerRef = ref<HTMLElement | null>(null);
let widget: SakanaWidgetInstance | null = null;
let scriptPromise: Promise<SakanaWidgetConstructor> | null = null;

function ensureStyle() {
  if (document.getElementById(SAKANA_STYLE_ID)) {
    return;
  }

  const link = document.createElement("link");
  link.id = SAKANA_STYLE_ID;
  link.rel = "stylesheet";
  link.href = SAKANA_STYLE_URL;
  document.head.appendChild(link);
}

function loadConstructor() {
  if (window.SakanaWidget) {
    return Promise.resolve(window.SakanaWidget);
  }

  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(
      SAKANA_SCRIPT_ID
    ) as HTMLScriptElement | null;

    if (existing) {
      existing.addEventListener("load", () => {
        if (window.SakanaWidget) {
          resolve(window.SakanaWidget);
          return;
        }
        reject(new Error("SakanaWidget loaded without global export."));
      });
      existing.addEventListener("error", () => {
        reject(new Error("Failed to load sakana-widget script."));
      });
      return;
    }

    const script = document.createElement("script");
    script.id = SAKANA_SCRIPT_ID;
    script.src = SAKANA_SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      if (window.SakanaWidget) {
        resolve(window.SakanaWidget);
        return;
      }
      reject(new Error("SakanaWidget loaded without global export."));
    };
    script.onerror = () => {
      reject(new Error("Failed to load sakana-widget script."));
    };
    document.body.appendChild(script);
  });

  return scriptPromise;
}

function registerCustomCharacter(SakanaWidget: SakanaWidgetConstructor) {
  if (SakanaWidget.getCharacter(CUSTOM_CHARACTER_NAME)) {
    return;
  }

  const baseCharacter = SakanaWidget.getCharacter("chisato");

  if (!baseCharacter) {
    return;
  }

  SakanaWidget.registerCharacter(CUSTOM_CHARACTER_NAME, {
    ...baseCharacter,
    image: CUSTOM_IMAGE_URL,
  });
}

onMounted(async () => {
  if (!containerRef.value) {
    return;
  }

  ensureStyle();

  try {
    const SakanaWidget = await loadConstructor();
    registerCustomCharacter(SakanaWidget);

    widget = new SakanaWidget({
      character: CUSTOM_CHARACTER_NAME,
      controls: true,
      autoFit: true,
      draggable: true,
      rod: true,
      title: true,
    });
    widget.mount(containerRef.value);
  } catch (error) {
    console.error("[sakana-widget]", error);
  }
});

onBeforeUnmount(() => {
  widget?.unmount?.();
  widget = null;
});
</script>

<style scoped>
.sakana-shell {
  width: min(calc(100vw - 12px), 210px);
}

.sakana-widget-container {
  position: relative;
  width: 100%;
  height: 180px;
  margin: 0 auto;
  overflow: visible;
}

@media (max-width: 640px) {
  .sakana-shell {
    width: min(calc(100vw - 4px), 320px);
  }

  .sakana-widget-container {
    height: 300px;
  }
}
</style>
