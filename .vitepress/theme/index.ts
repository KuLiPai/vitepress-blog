import Theme from "vitepress/theme";
import Archives from "./components/Archives.vue";
import Tags from "./components/Tags.vue";
import Friends from "./components/Friends.vue";
import MyLayout from "./components/MyLayout.vue";
import TwoslashFloatingVue from "@shikijs/vitepress-twoslash/client";
import "@shikijs/vitepress-twoslash/style.css";
import type { EnhanceAppContext } from "vitepress";
import { onMounted } from 'vue';

import "./custom.css";
import "./custom-tooltip.css";

export default {
  extends: Theme,
  Layout: MyLayout,
  enhanceApp({ app }: EnhanceAppContext) {
    app.component("Archives", Archives);
    app.component("Tags", Tags);
    app.component("Friends", Friends);
    app.use(TwoslashFloatingVue);
  },
  setup() {
    onMounted(() => {
      // 确保在 DOM 加载完成后执行脚本
      const script = document.createElement('script');
      script.src = '/script.js';
      document.body.appendChild(script);
    });
  },
};
