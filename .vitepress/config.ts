import { getPosts, getPostLength } from "./theme/serverUtils";
import { buildBlogRSS } from "./theme/rss";
import { transformerTwoslash } from "@shikijs/vitepress-twoslash";
import { transformerHover } from "./theme/transformers/transformerHover"; // Import the custom transformer
import mathjax3 from "markdown-it-mathjax3";
import { defineConfig } from "vitepress";

async function config() {
  return defineConfig({
    lang: "en-US",
    title: "KuLiPai's Blog",
    description: "Home of KuLiPai",
    head: [
      [
        'script',
        {
          defer: '',
          src: '/_vercel/insights/script.js'
        }
      ],
      [
        "link",
        {
          rel: "icon",
          type: "image/svg",
          href: "/horse.svg",
        },
      ],
      ['link', { rel: 'stylesheet', href: '/style.css' }],
      [
        "meta",
        {
          name: "author",
          content: "KuLiPai",
        },
      ],
      [
        "meta",
        {
          property: "og:title",
          content: "Home",
        },
      ],
      [
        "meta",
        {
          property: "og:description",
          content: "Home of KuLiPai",
        },
      ],
    ],
    // cleanUrls: "with-subfolders",
    lastUpdated: false,
    themeConfig: {
      // repo: "clark-cui/homeSite",
      logo: "/horse.svg",
      avator: "/avator.png",
      search: {
        provider: "local",
      },
      docsDir: "/",
      // docsBranch: "master",
      posts: await getPosts(),
      pageSize: 5,
      postLength: await getPostLength(),
      nav: [
        {
          text: "🏡Blogs",
          link: "/",
        },
        {
          text: "🔖Tags",
          link: "/tags",
        },
        {
          text: "📃Archives",
          link: "/archives",
        },
        {
          text: "🤝Friends",
          link: "/friends",
        },
      ],
      socialLinks: [
        { icon: "github", link: "https://github.com/kulipai " },
        { icon: "telegram", link: "https://t.me/kulipai " },
        {
          icon: {
            svg: `<svg role="img" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg " width="20">
            <path d="M874.666667 375.189333V746.666667a64 64 0 0 1-64 64H213.333333a64 64 0 0 1-64-64V375.189333l266.090667 225.6a149.333333 149.333333 0 0 0 193.152 0L874.666667 375.189333zM810.666667 213.333333a64.789333 64.789333 0 0 1 22.826666 4.181334 63.616 63.616 0 0 1 26.794667 19.413333 64.32 64.32 0 0 1 9.344 15.466667c2.773333 6.570667 4.48 13.696 4.906667 21.184L874.666667 277.333333v21.333334L553.536 572.586667a64 64 0 0 1-79.893333 2.538666l-3.178667-2.56L149.333333 298.666667v-21.333334a63.786667 63.786667 0 0 1 35.136-57.130666A63.872 63.872 0 0 1 213.333333 213.333333h597.333334z" ></path>
            </svg>`,
          },
          link: "mailto:KuLiPai@proton.me",
        },
      ],
      // outline: 2, //设置右侧aside显示层级
      aside: false,
      // blogs page show firewokrs animation
      showFireworksAnimation: false,
    },
    buildEnd: buildBlogRSS,
    markdown: {
      theme: {
        light: "vitesse-light",
        dark: "vitesse-dark",
      },
      codeTransformers: [transformerTwoslash(), transformerHover()],
      config: (md) => {
        md.use(mathjax3);

        // 自定义插件：解析 Frontmatter 中的 permalink 字段
        md.core.ruler.before("normalize", "custom-permalink", (state) => {
          if (state.frontmatter && state.frontmatter.permalink) {
            const permalink = state.frontmatter.permalink;
            // 将 permalink 存储到页面的元数据中
            state.env.permalink = permalink;
          }
        });
      },
    },
    // 重写路由规则
    rewrites: {
      // 动态生成重写规则
      ...(await generateRewriteRules()),
    },
  });
}

// 生成重写规则
async function generateRewriteRules() {
  const posts = await getPosts();
  const rewriteRules = {};

  posts.forEach((post) => {
    if (post.frontmatter?.permalink) {
      // 确保路径正确，去掉 /posts 前缀
      const filePath = post.path.replace(/^\/posts\//, "/");
      rewriteRules[post.frontmatter.permalink] = filePath;
    }
  });

  return rewriteRules;
}

export default config();
