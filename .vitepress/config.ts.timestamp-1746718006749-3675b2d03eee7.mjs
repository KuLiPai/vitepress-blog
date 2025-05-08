// .vitepress/theme/serverUtils.ts
import { globby } from "file:///home/klp/blog/vitepress-blog/node_modules/.pnpm/globby@14.0.0/node_modules/globby/index.js";
import matter from "file:///home/klp/blog/vitepress-blog/node_modules/.pnpm/gray-matter@4.0.3/node_modules/gray-matter/index.js";
import fs from "file:///home/klp/blog/vitepress-blog/node_modules/.pnpm/fs-extra@11.2.0/node_modules/fs-extra/lib/index.js";
async function getPosts() {
  let paths = await getPostMDFilePaths();
  let posts = await Promise.all(
    paths.map(async (item) => {
      const content = await fs.readFile(item, "utf-8");
      const { data } = matter(content);
      data.date = _convertDate(data.date);
      return {
        frontMatter: data,
        regularPath: `/${item.replace(".md", ".html")}`
      };
    })
  );
  posts.sort(_compareDate);
  return posts;
}
function _convertDate(date = (/* @__PURE__ */ new Date()).toString()) {
  const json_date = new Date(date).toJSON();
  return json_date.split("T")[0];
}
function _compareDate(obj1, obj2) {
  return obj1.frontMatter.date < obj2.frontMatter.date ? 1 : -1;
}
async function getPostMDFilePaths() {
  let paths = await globby(["**.md"], {
    ignore: ["node_modules", "README.md"]
  });
  return paths.filter((item) => item.includes("posts/"));
}
async function getPostLength() {
  return [...await getPostMDFilePaths()].length;
}

// .vitepress/theme/rss.ts
import { dirname } from "path";
import fg from "file:///home/klp/blog/vitepress-blog/node_modules/.pnpm/fast-glob@3.3.2/node_modules/fast-glob/out/index.js";
import fs2 from "file:///home/klp/blog/vitepress-blog/node_modules/.pnpm/fs-extra@11.2.0/node_modules/fs-extra/lib/index.js";
import matter2 from "file:///home/klp/blog/vitepress-blog/node_modules/.pnpm/gray-matter@4.0.3/node_modules/gray-matter/index.js";
import MarkdownIt from "file:///home/klp/blog/vitepress-blog/node_modules/.pnpm/markdown-it@14.1.0/node_modules/markdown-it/index.mjs";
import { Feed } from "file:///home/klp/blog/vitepress-blog/node_modules/.pnpm/feed@4.2.2/node_modules/feed/lib/feed.js";
var DOMAIN = "https://kulipai.vercel.app/";
var AUTHOR = {
  name: "KuLiPai",
  email: "KuLiPai@proton.me",
  link: DOMAIN
};
var OPTIONS = {
  title: "KuLiPai",
  description: "KuLiPai' Blog",
  id: `${DOMAIN}/`,
  link: `${DOMAIN}/`,
  copyright: "MIT License",
  feedLinks: {
    json: DOMAIN + "/feed.json",
    atom: DOMAIN + "/feed.atom",
    rss: DOMAIN + "/feed.xml"
  },
  author: AUTHOR,
  image: "https://kulipai.vercel.app/horse.svg",
  favicon: "https://kulipai.vercel.app/horse.svg"
};
var markdown = MarkdownIt({
  html: true,
  breaks: true,
  linkify: true
});
async function buildBlogRSS() {
  const posts = await generateRSS();
  writeFeed("feed", posts);
}
async function generateRSS() {
  const files = await fg("posts/*.md");
  const posts = (await Promise.all(
    files.filter((i) => !i.includes("index")).map(async (i) => {
      const raw = await fs2.readFile(i, "utf-8");
      const { data, content } = matter2(raw);
      const html = markdown.render(content).replace('src="/', `src="${DOMAIN}/`);
      return {
        ...data,
        date: new Date(data.date),
        content: html,
        author: [AUTHOR],
        link: `${DOMAIN}/${i.replace(".md", ".html")}`
      };
    })
  )).filter(Boolean);
  posts.sort((a, b) => +new Date(b.date) - +new Date(a.date));
  return posts;
}
async function writeFeed(name, items) {
  const feed = new Feed(OPTIONS);
  items.forEach((item) => feed.addItem(item));
  await fs2.ensureDir(dirname(`./.vitepress/dist/${name}`));
  await fs2.writeFile(`./.vitepress/dist/${name}.xml`, feed.rss2(), "utf-8");
  await fs2.writeFile(`./.vitepress/dist/${name}.atom`, feed.atom1(), "utf-8");
  await fs2.writeFile(`./.vitepress/dist/${name}.json`, feed.json1(), "utf-8");
}

// .vitepress/config.ts
import { transformerTwoslash } from "file:///home/klp/blog/vitepress-blog/node_modules/.pnpm/@shikijs+vitepress-twoslash@1.24.2_typescript@5.4.5/node_modules/@shikijs/vitepress-twoslash/dist/index.mjs";
import mathjax3 from "file:///home/klp/blog/vitepress-blog/node_modules/.pnpm/markdown-it-mathjax3@4.3.2_encoding@0.1.13/node_modules/markdown-it-mathjax3/index.js";
import { defineConfig } from "file:///home/klp/blog/vitepress-blog/node_modules/.pnpm/vitepress@1.5.0_@algolia+client-search@5.17.1_markdown-it-mathjax3@4.3.2_encoding@0.1.1_5b6f5fdf147af199a8e1c8b86ecb63d2/node_modules/vitepress/dist/node/index.js";
async function config() {
  return defineConfig({
    lang: "en-US",
    title: "KuLiPai's Blog",
    description: "Home of KuLiPai",
    head: [
      [
        "link",
        {
          rel: "icon",
          type: "image/svg",
          href: "/horse.svg"
        }
      ],
      ["link", { rel: "stylesheet", href: "/style.css" }],
      [
        "meta",
        {
          name: "author",
          content: "KuLiPai"
        }
      ],
      [
        "meta",
        {
          property: "og:title",
          content: "Home"
        }
      ],
      [
        "meta",
        {
          property: "og:description",
          content: "Home of KuLiPai"
        }
      ]
    ],
    // cleanUrls: "with-subfolders",
    lastUpdated: false,
    themeConfig: {
      // repo: "clark-cui/homeSite",
      logo: "/horse.svg",
      avator: "/avator.png",
      search: {
        provider: "local"
      },
      docsDir: "/",
      // docsBranch: "master",
      posts: await getPosts(),
      pageSize: 5,
      postLength: await getPostLength(),
      nav: [
        {
          text: "\u{1F3E1}Blogs",
          link: "/"
        },
        {
          text: "\u{1F516}Tags",
          link: "/tags"
        },
        {
          text: "\u{1F4C3}Archives",
          link: "/archives"
        },
        {
          text: "\u{1F91D}Friends",
          link: "https://kulipai.top/#/friends "
        }
      ],
      socialLinks: [
        { icon: "github", link: "https://github.com/kulipai " },
        { icon: "telegram", link: "https://t.me/kulipai " },
        {
          icon: {
            svg: `<svg role="img" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg " width="20">
            <path d="M874.666667 375.189333V746.666667a64 64 0 0 1-64 64H213.333333a64 64 0 0 1-64-64V375.189333l266.090667 225.6a149.333333 149.333333 0 0 0 193.152 0L874.666667 375.189333zM810.666667 213.333333a64.789333 64.789333 0 0 1 22.826666 4.181334 63.616 63.616 0 0 1 26.794667 19.413333 64.32 64.32 0 0 1 9.344 15.466667c2.773333 6.570667 4.48 13.696 4.906667 21.184L874.666667 277.333333v21.333334L553.536 572.586667a64 64 0 0 1-79.893333 2.538666l-3.178667-2.56L149.333333 298.666667v-21.333334a63.786667 63.786667 0 0 1 35.136-57.130666A63.872 63.872 0 0 1 213.333333 213.333333h597.333334z" ></path>
            </svg>`
          },
          link: "mailto:KuLiPai@proton.me"
        }
      ],
      // outline: 2, //设置右侧aside显示层级
      aside: false,
      // blogs page show firewokrs animation
      showFireworksAnimation: false
    },
    buildEnd: buildBlogRSS,
    markdown: {
      theme: {
        light: "vitesse-light",
        dark: "vitesse-dark"
      },
      codeTransformers: [transformerTwoslash()],
      config: (md) => {
        md.use(mathjax3);
        md.core.ruler.before("normalize", "custom-permalink", (state) => {
          if (state.frontmatter && state.frontmatter.permalink) {
            const permalink = state.frontmatter.permalink;
            state.env.permalink = permalink;
          }
        });
      }
    },
    // 重写路由规则
    rewrites: {
      // 动态生成重写规则
      ...await generateRewriteRules()
    }
  });
}
async function generateRewriteRules() {
  const posts = await getPosts();
  const rewriteRules = {};
  posts.forEach((post) => {
    if (post.frontmatter?.permalink) {
      const filePath = post.path.replace(/^\/posts\//, "/");
      rewriteRules[post.frontmatter.permalink] = filePath;
    }
  });
  return rewriteRules;
}
var config_default = config();
export {
  config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLnZpdGVwcmVzcy90aGVtZS9zZXJ2ZXJVdGlscy50cyIsICIudml0ZXByZXNzL3RoZW1lL3Jzcy50cyIsICIudml0ZXByZXNzL2NvbmZpZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL2tscC9ibG9nL3ZpdGVwcmVzcy1ibG9nLy52aXRlcHJlc3MvdGhlbWVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL2tscC9ibG9nL3ZpdGVwcmVzcy1ibG9nLy52aXRlcHJlc3MvdGhlbWUvc2VydmVyVXRpbHMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUva2xwL2Jsb2cvdml0ZXByZXNzLWJsb2cvLnZpdGVwcmVzcy90aGVtZS9zZXJ2ZXJVdGlscy50c1wiO2ltcG9ydCB7Z2xvYmJ5fSBmcm9tICdnbG9iYnknO1xuaW1wb3J0IG1hdHRlciBmcm9tIFwiZ3JheS1tYXR0ZXJcIjtcbmltcG9ydCBmcyBmcm9tIFwiZnMtZXh0cmFcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQb3N0cygpIHtcbiAgbGV0IHBhdGhzID0gYXdhaXQgZ2V0UG9zdE1ERmlsZVBhdGhzKCk7XG4gIGxldCBwb3N0cyA9IGF3YWl0IFByb21pc2UuYWxsKFxuICAgIHBhdGhzLm1hcChhc3luYyAoaXRlbSkgPT4ge1xuICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IGZzLnJlYWRGaWxlKGl0ZW0sIFwidXRmLThcIik7XG4gICAgICBjb25zdCB7IGRhdGEgfSA9IG1hdHRlcihjb250ZW50KTtcbiAgICAgIGRhdGEuZGF0ZSA9IF9jb252ZXJ0RGF0ZShkYXRhLmRhdGUpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZnJvbnRNYXR0ZXI6IGRhdGEsXG4gICAgICAgIHJlZ3VsYXJQYXRoOiBgLyR7aXRlbS5yZXBsYWNlKFwiLm1kXCIsIFwiLmh0bWxcIil9YCxcbiAgICAgIH07XG4gICAgfSlcbiAgKTtcbiAgcG9zdHMuc29ydChfY29tcGFyZURhdGUpO1xuICByZXR1cm4gcG9zdHM7XG59XG5cbmZ1bmN0aW9uIF9jb252ZXJ0RGF0ZShkYXRlID0gbmV3IERhdGUoKS50b1N0cmluZygpKSB7XG4gIGNvbnN0IGpzb25fZGF0ZSA9IG5ldyBEYXRlKGRhdGUpLnRvSlNPTigpO1xuICByZXR1cm4ganNvbl9kYXRlLnNwbGl0KFwiVFwiKVswXTtcbn1cblxuZnVuY3Rpb24gX2NvbXBhcmVEYXRlKG9iajEsIG9iajIpIHtcbiAgcmV0dXJuIG9iajEuZnJvbnRNYXR0ZXIuZGF0ZSA8IG9iajIuZnJvbnRNYXR0ZXIuZGF0ZSA/IDEgOiAtMTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0UG9zdE1ERmlsZVBhdGhzKCkge1xuICBsZXQgcGF0aHMgPSBhd2FpdCBnbG9iYnkoW1wiKioubWRcIl0sIHtcbiAgICBpZ25vcmU6IFtcIm5vZGVfbW9kdWxlc1wiLCBcIlJFQURNRS5tZFwiXSxcbiAgfSk7XG4gIHJldHVybiBwYXRocy5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0uaW5jbHVkZXMoXCJwb3N0cy9cIikpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UG9zdExlbmd0aCgpIHtcbiAgLy8gZ2V0UG9zdE1ERmlsZVBhdGggcmV0dXJuIHR5cGUgaXMgb2JqZWN0IG5vdCBhcnJheVxuICByZXR1cm4gWy4uLihhd2FpdCBnZXRQb3N0TURGaWxlUGF0aHMoKSldLmxlbmd0aDtcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUva2xwL2Jsb2cvdml0ZXByZXNzLWJsb2cvLnZpdGVwcmVzcy90aGVtZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUva2xwL2Jsb2cvdml0ZXByZXNzLWJsb2cvLnZpdGVwcmVzcy90aGVtZS9yc3MudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUva2xwL2Jsb2cvdml0ZXByZXNzLWJsb2cvLnZpdGVwcmVzcy90aGVtZS9yc3MudHNcIjtpbXBvcnQgeyBkaXJuYW1lIH0gZnJvbSBcInBhdGhcIjtcbmltcG9ydCBmZyBmcm9tIFwiZmFzdC1nbG9iXCI7XG5pbXBvcnQgZnMgZnJvbSBcImZzLWV4dHJhXCI7XG5pbXBvcnQgbWF0dGVyIGZyb20gXCJncmF5LW1hdHRlclwiO1xuaW1wb3J0IE1hcmtkb3duSXQgZnJvbSBcIm1hcmtkb3duLWl0XCI7XG5pbXBvcnQgdHlwZSB7IEZlZWRPcHRpb25zLCBJdGVtIH0gZnJvbSBcImZlZWRcIjtcbmltcG9ydCB7IEZlZWQgfSBmcm9tIFwiZmVlZFwiO1xuXG5jb25zdCBET01BSU4gPSBcImh0dHBzOi8va3VsaXBhaS52ZXJjZWwuYXBwL1wiO1xuY29uc3QgQVVUSE9SID0ge1xuICBuYW1lOiBcIkt1TGlQYWlcIixcbiAgZW1haWw6IFwiS3VMaVBhaUBwcm90b24ubWVcIixcbiAgbGluazogRE9NQUlOLFxufTtcbmNvbnN0IE9QVElPTlM6IEZlZWRPcHRpb25zID0ge1xuICB0aXRsZTogXCJLdUxpUGFpXCIsXG4gIGRlc2NyaXB0aW9uOiBcIkt1TGlQYWknIEJsb2dcIixcbiAgaWQ6IGAke0RPTUFJTn0vYCxcbiAgbGluazogYCR7RE9NQUlOfS9gLFxuICBjb3B5cmlnaHQ6IFwiTUlUIExpY2Vuc2VcIixcbiAgZmVlZExpbmtzOiB7XG4gICAganNvbjogRE9NQUlOICsgXCIvZmVlZC5qc29uXCIsXG4gICAgYXRvbTogRE9NQUlOICsgXCIvZmVlZC5hdG9tXCIsXG4gICAgcnNzOiBET01BSU4gKyBcIi9mZWVkLnhtbFwiLFxuICB9LFxuICBhdXRob3I6IEFVVEhPUixcbiAgaW1hZ2U6IFwiaHR0cHM6Ly9rdWxpcGFpLnZlcmNlbC5hcHAvaG9yc2Uuc3ZnXCIsXG4gIGZhdmljb246IFwiaHR0cHM6Ly9rdWxpcGFpLnZlcmNlbC5hcHAvaG9yc2Uuc3ZnXCIsXG59O1xuXG5jb25zdCBtYXJrZG93biA9IE1hcmtkb3duSXQoe1xuICBodG1sOiB0cnVlLFxuICBicmVha3M6IHRydWUsXG4gIGxpbmtpZnk6IHRydWUsXG59KTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJ1aWxkQmxvZ1JTUygpIHtcbiAgY29uc3QgcG9zdHMgPSBhd2FpdCBnZW5lcmF0ZVJTUygpO1xuICB3cml0ZUZlZWQoXCJmZWVkXCIsIHBvc3RzKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVSU1MoKSB7XG4gIGNvbnN0IGZpbGVzID0gYXdhaXQgZmcoXCJwb3N0cy8qLm1kXCIpO1xuXG4gIGNvbnN0IHBvc3RzOiBhbnlbXSA9IChcbiAgICBhd2FpdCBQcm9taXNlLmFsbChcbiAgICAgIGZpbGVzXG4gICAgICAgIC5maWx0ZXIoKGkpID0+ICFpLmluY2x1ZGVzKFwiaW5kZXhcIikpXG4gICAgICAgIC5tYXAoYXN5bmMgKGkpID0+IHtcbiAgICAgICAgICBjb25zdCByYXcgPSBhd2FpdCBmcy5yZWFkRmlsZShpLCBcInV0Zi04XCIpO1xuICAgICAgICAgIGNvbnN0IHsgZGF0YSwgY29udGVudCB9ID0gbWF0dGVyKHJhdyk7XG4gICAgICAgICAgY29uc3QgaHRtbCA9IG1hcmtkb3duXG4gICAgICAgICAgICAucmVuZGVyKGNvbnRlbnQpXG4gICAgICAgICAgICAucmVwbGFjZSgnc3JjPVwiLycsIGBzcmM9XCIke0RPTUFJTn0vYCk7XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgLi4uZGF0YSxcbiAgICAgICAgICAgIGRhdGU6IG5ldyBEYXRlKGRhdGEuZGF0ZSksXG4gICAgICAgICAgICBjb250ZW50OiBodG1sLFxuICAgICAgICAgICAgYXV0aG9yOiBbQVVUSE9SXSxcbiAgICAgICAgICAgIGxpbms6IGAke0RPTUFJTn0vJHtpLnJlcGxhY2UoXCIubWRcIiwgXCIuaHRtbFwiKX1gLFxuICAgICAgICAgIH07XG4gICAgICAgIH0pXG4gICAgKVxuICApLmZpbHRlcihCb29sZWFuKTtcblxuICBwb3N0cy5zb3J0KChhLCBiKSA9PiArbmV3IERhdGUoYi5kYXRlKSAtICtuZXcgRGF0ZShhLmRhdGUpKTtcbiAgcmV0dXJuIHBvc3RzO1xufVxuXG5hc3luYyBmdW5jdGlvbiB3cml0ZUZlZWQobmFtZTogc3RyaW5nLCBpdGVtczogSXRlbVtdKSB7XG4gIGNvbnN0IGZlZWQgPSBuZXcgRmVlZChPUFRJT05TKTtcbiAgaXRlbXMuZm9yRWFjaCgoaXRlbSkgPT4gZmVlZC5hZGRJdGVtKGl0ZW0pKTtcblxuICBhd2FpdCBmcy5lbnN1cmVEaXIoZGlybmFtZShgLi8udml0ZXByZXNzL2Rpc3QvJHtuYW1lfWApKTtcbiAgYXdhaXQgZnMud3JpdGVGaWxlKGAuLy52aXRlcHJlc3MvZGlzdC8ke25hbWV9LnhtbGAsIGZlZWQucnNzMigpLCBcInV0Zi04XCIpO1xuICBhd2FpdCBmcy53cml0ZUZpbGUoYC4vLnZpdGVwcmVzcy9kaXN0LyR7bmFtZX0uYXRvbWAsIGZlZWQuYXRvbTEoKSwgXCJ1dGYtOFwiKTtcbiAgYXdhaXQgZnMud3JpdGVGaWxlKGAuLy52aXRlcHJlc3MvZGlzdC8ke25hbWV9Lmpzb25gLCBmZWVkLmpzb24xKCksIFwidXRmLThcIik7XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL2tscC9ibG9nL3ZpdGVwcmVzcy1ibG9nLy52aXRlcHJlc3NcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL2tscC9ibG9nL3ZpdGVwcmVzcy1ibG9nLy52aXRlcHJlc3MvY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL2tscC9ibG9nL3ZpdGVwcmVzcy1ibG9nLy52aXRlcHJlc3MvY29uZmlnLnRzXCI7aW1wb3J0IHsgZ2V0UG9zdHMsIGdldFBvc3RMZW5ndGggfSBmcm9tIFwiLi90aGVtZS9zZXJ2ZXJVdGlsc1wiO1xyXG5pbXBvcnQgeyBidWlsZEJsb2dSU1MgfSBmcm9tIFwiLi90aGVtZS9yc3NcIjtcclxuaW1wb3J0IHsgdHJhbnNmb3JtZXJUd29zbGFzaCB9IGZyb20gXCJAc2hpa2lqcy92aXRlcHJlc3MtdHdvc2xhc2hcIjtcclxuaW1wb3J0IG1hdGhqYXgzIGZyb20gXCJtYXJrZG93bi1pdC1tYXRoamF4M1wiO1xyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZXByZXNzXCI7XHJcblxyXG5hc3luYyBmdW5jdGlvbiBjb25maWcoKSB7XHJcbiAgcmV0dXJuIGRlZmluZUNvbmZpZyh7XHJcbiAgICBsYW5nOiBcImVuLVVTXCIsXHJcbiAgICB0aXRsZTogXCJLdUxpUGFpJ3MgQmxvZ1wiLFxyXG4gICAgZGVzY3JpcHRpb246IFwiSG9tZSBvZiBLdUxpUGFpXCIsXHJcbiAgICBoZWFkOiBbXHJcbiAgICAgIFtcclxuICAgICAgICBcImxpbmtcIixcclxuICAgICAgICB7XHJcbiAgICAgICAgICByZWw6IFwiaWNvblwiLFxyXG4gICAgICAgICAgdHlwZTogXCJpbWFnZS9zdmdcIixcclxuICAgICAgICAgIGhyZWY6IFwiL2hvcnNlLnN2Z1wiLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIF0sXHJcbiAgICAgIFsnbGluaycsIHsgcmVsOiAnc3R5bGVzaGVldCcsIGhyZWY6ICcvc3R5bGUuY3NzJyB9XSxcbiAgICAgIFtcclxuICAgICAgICBcIm1ldGFcIixcclxuICAgICAgICB7XHJcbiAgICAgICAgICBuYW1lOiBcImF1dGhvclwiLFxyXG4gICAgICAgICAgY29udGVudDogXCJLdUxpUGFpXCIsXHJcbiAgICAgICAgfSxcclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIFwibWV0YVwiLFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHByb3BlcnR5OiBcIm9nOnRpdGxlXCIsXHJcbiAgICAgICAgICBjb250ZW50OiBcIkhvbWVcIixcclxuICAgICAgICB9LFxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgXCJtZXRhXCIsXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgcHJvcGVydHk6IFwib2c6ZGVzY3JpcHRpb25cIixcclxuICAgICAgICAgIGNvbnRlbnQ6IFwiSG9tZSBvZiBLdUxpUGFpXCIsXHJcbiAgICAgICAgfSxcclxuICAgICAgXSxcclxuICAgIF0sXHJcbiAgICAvLyBjbGVhblVybHM6IFwid2l0aC1zdWJmb2xkZXJzXCIsXHJcbiAgICBsYXN0VXBkYXRlZDogZmFsc2UsXHJcbiAgICB0aGVtZUNvbmZpZzoge1xyXG4gICAgICAvLyByZXBvOiBcImNsYXJrLWN1aS9ob21lU2l0ZVwiLFxyXG4gICAgICBsb2dvOiBcIi9ob3JzZS5zdmdcIixcclxuICAgICAgYXZhdG9yOiBcIi9hdmF0b3IucG5nXCIsXHJcbiAgICAgIHNlYXJjaDoge1xyXG4gICAgICAgIHByb3ZpZGVyOiBcImxvY2FsXCIsXHJcbiAgICAgIH0sXHJcbiAgICAgIGRvY3NEaXI6IFwiL1wiLFxyXG4gICAgICAvLyBkb2NzQnJhbmNoOiBcIm1hc3RlclwiLFxyXG4gICAgICBwb3N0czogYXdhaXQgZ2V0UG9zdHMoKSxcclxuICAgICAgcGFnZVNpemU6IDUsXHJcbiAgICAgIHBvc3RMZW5ndGg6IGF3YWl0IGdldFBvc3RMZW5ndGgoKSxcclxuICAgICAgbmF2OiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdGV4dDogXCJcdUQ4M0NcdURGRTFCbG9nc1wiLFxyXG4gICAgICAgICAgbGluazogXCIvXCIsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICB0ZXh0OiBcIlx1RDgzRFx1REQxNlRhZ3NcIixcclxuICAgICAgICAgIGxpbms6IFwiL3RhZ3NcIixcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHRleHQ6IFwiXHVEODNEXHVEQ0MzQXJjaGl2ZXNcIixcclxuICAgICAgICAgIGxpbms6IFwiL2FyY2hpdmVzXCIsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICB0ZXh0OiBcIlx1RDgzRVx1REQxREZyaWVuZHNcIixcclxuICAgICAgICAgIGxpbms6IFwiaHR0cHM6Ly9rdWxpcGFpLnRvcC8jL2ZyaWVuZHMgXCIsXHJcbiAgICAgICAgfSxcclxuICAgICAgXSxcclxuICAgICAgc29jaWFsTGlua3M6IFtcclxuICAgICAgICB7IGljb246IFwiZ2l0aHViXCIsIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2t1bGlwYWkgXCIgfSxcclxuICAgICAgICB7IGljb246IFwidGVsZWdyYW1cIiwgbGluazogXCJodHRwczovL3QubWUva3VsaXBhaSBcIiB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGljb246IHtcclxuICAgICAgICAgICAgc3ZnOiBgPHN2ZyByb2xlPVwiaW1nXCIgdmlld0JveD1cIjAgMCAxMDI0IDEwMjRcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIFwiIHdpZHRoPVwiMjBcIj5cclxuICAgICAgICAgICAgPHBhdGggZD1cIk04NzQuNjY2NjY3IDM3NS4xODkzMzNWNzQ2LjY2NjY2N2E2NCA2NCAwIDAgMS02NCA2NEgyMTMuMzMzMzMzYTY0IDY0IDAgMCAxLTY0LTY0VjM3NS4xODkzMzNsMjY2LjA5MDY2NyAyMjUuNmExNDkuMzMzMzMzIDE0OS4zMzMzMzMgMCAwIDAgMTkzLjE1MiAwTDg3NC42NjY2NjcgMzc1LjE4OTMzM3pNODEwLjY2NjY2NyAyMTMuMzMzMzMzYTY0Ljc4OTMzMyA2NC43ODkzMzMgMCAwIDEgMjIuODI2NjY2IDQuMTgxMzM0IDYzLjYxNiA2My42MTYgMCAwIDEgMjYuNzk0NjY3IDE5LjQxMzMzMyA2NC4zMiA2NC4zMiAwIDAgMSA5LjM0NCAxNS40NjY2NjdjMi43NzMzMzMgNi41NzA2NjcgNC40OCAxMy42OTYgNC45MDY2NjcgMjEuMTg0TDg3NC42NjY2NjcgMjc3LjMzMzMzM3YyMS4zMzMzMzRMNTUzLjUzNiA1NzIuNTg2NjY3YTY0IDY0IDAgMCAxLTc5Ljg5MzMzMyAyLjUzODY2NmwtMy4xNzg2NjctMi41NkwxNDkuMzMzMzMzIDI5OC42NjY2Njd2LTIxLjMzMzMzNGE2My43ODY2NjcgNjMuNzg2NjY3IDAgMCAxIDM1LjEzNi01Ny4xMzA2NjZBNjMuODcyIDYzLjg3MiAwIDAgMSAyMTMuMzMzMzMzIDIxMy4zMzMzMzNoNTk3LjMzMzMzNHpcIiA+PC9wYXRoPlxyXG4gICAgICAgICAgICA8L3N2Zz5gLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGxpbms6IFwibWFpbHRvOkt1TGlQYWlAcHJvdG9uLm1lXCIsXHJcbiAgICAgICAgfSxcclxuICAgICAgXSxcclxuICAgICAgLy8gb3V0bGluZTogMiwgLy9cdThCQkVcdTdGNkVcdTUzRjNcdTRGQTdhc2lkZVx1NjYzRVx1NzkzQVx1NUM0Mlx1N0VBN1xyXG4gICAgICBhc2lkZTogZmFsc2UsXHJcbiAgICAgIC8vIGJsb2dzIHBhZ2Ugc2hvdyBmaXJld29rcnMgYW5pbWF0aW9uXHJcbiAgICAgIHNob3dGaXJld29ya3NBbmltYXRpb246IGZhbHNlLFxyXG4gICAgfSxcclxuICAgIGJ1aWxkRW5kOiBidWlsZEJsb2dSU1MsXHJcbiAgICBtYXJrZG93bjoge1xyXG4gICAgICB0aGVtZToge1xyXG4gICAgICAgIGxpZ2h0OiBcInZpdGVzc2UtbGlnaHRcIixcclxuICAgICAgICBkYXJrOiBcInZpdGVzc2UtZGFya1wiLFxyXG4gICAgICB9LFxyXG4gICAgICBjb2RlVHJhbnNmb3JtZXJzOiBbdHJhbnNmb3JtZXJUd29zbGFzaCgpXSxcclxuICAgICAgY29uZmlnOiAobWQpID0+IHtcclxuICAgICAgICBtZC51c2UobWF0aGpheDMpO1xyXG5cclxuICAgICAgICAvLyBcdTgxRUFcdTVCOUFcdTRFNDlcdTYzRDJcdTRFRjZcdUZGMUFcdTg5RTNcdTY3OTAgRnJvbnRtYXR0ZXIgXHU0RTJEXHU3Njg0IHBlcm1hbGluayBcdTVCNTdcdTZCQjVcclxuICAgICAgICBtZC5jb3JlLnJ1bGVyLmJlZm9yZShcIm5vcm1hbGl6ZVwiLCBcImN1c3RvbS1wZXJtYWxpbmtcIiwgKHN0YXRlKSA9PiB7XHJcbiAgICAgICAgICBpZiAoc3RhdGUuZnJvbnRtYXR0ZXIgJiYgc3RhdGUuZnJvbnRtYXR0ZXIucGVybWFsaW5rKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBlcm1hbGluayA9IHN0YXRlLmZyb250bWF0dGVyLnBlcm1hbGluaztcclxuICAgICAgICAgICAgLy8gXHU1QzA2IHBlcm1hbGluayBcdTVCNThcdTUwQThcdTUyMzBcdTk4NzVcdTk3NjJcdTc2ODRcdTUxNDNcdTY1NzBcdTYzNkVcdTRFMkRcclxuICAgICAgICAgICAgc3RhdGUuZW52LnBlcm1hbGluayA9IHBlcm1hbGluaztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICAvLyBcdTkxQ0RcdTUxOTlcdThERUZcdTc1MzFcdTg5QzRcdTUyMTlcclxuICAgIHJld3JpdGVzOiB7XHJcbiAgICAgIC8vIFx1NTJBOFx1NjAwMVx1NzUxRlx1NjIxMFx1OTFDRFx1NTE5OVx1ODlDNFx1NTIxOVxyXG4gICAgICAuLi4oYXdhaXQgZ2VuZXJhdGVSZXdyaXRlUnVsZXMoKSksXHJcbiAgICB9LFxyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBcdTc1MUZcdTYyMTBcdTkxQ0RcdTUxOTlcdTg5QzRcdTUyMTlcclxuYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVSZXdyaXRlUnVsZXMoKSB7XHJcbiAgY29uc3QgcG9zdHMgPSBhd2FpdCBnZXRQb3N0cygpO1xyXG4gIGNvbnN0IHJld3JpdGVSdWxlcyA9IHt9O1xyXG5cclxuICBwb3N0cy5mb3JFYWNoKChwb3N0KSA9PiB7XHJcbiAgICBpZiAocG9zdC5mcm9udG1hdHRlcj8ucGVybWFsaW5rKSB7XHJcbiAgICAgIC8vIFx1Nzg2RVx1NEZERFx1OERFRlx1NUY4NFx1NkI2M1x1Nzg2RVx1RkYwQ1x1NTNCQlx1NjM4OSAvcG9zdHMgXHU1MjREXHU3RjAwXHJcbiAgICAgIGNvbnN0IGZpbGVQYXRoID0gcG9zdC5wYXRoLnJlcGxhY2UoL15cXC9wb3N0c1xcLy8sIFwiL1wiKTtcclxuICAgICAgcmV3cml0ZVJ1bGVzW3Bvc3QuZnJvbnRtYXR0ZXIucGVybWFsaW5rXSA9IGZpbGVQYXRoO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICByZXR1cm4gcmV3cml0ZVJ1bGVzO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjb25maWcoKTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNFQsU0FBUSxjQUFhO0FBQ2pWLE9BQU8sWUFBWTtBQUNuQixPQUFPLFFBQVE7QUFHZixlQUFzQixXQUFXO0FBQy9CLE1BQUksUUFBUSxNQUFNLG1CQUFtQjtBQUNyQyxNQUFJLFFBQVEsTUFBTSxRQUFRO0FBQUEsSUFDeEIsTUFBTSxJQUFJLE9BQU8sU0FBUztBQUN4QixZQUFNLFVBQVUsTUFBTSxHQUFHLFNBQVMsTUFBTSxPQUFPO0FBQy9DLFlBQU0sRUFBRSxLQUFLLElBQUksT0FBTyxPQUFPO0FBQy9CLFdBQUssT0FBTyxhQUFhLEtBQUssSUFBSTtBQUNsQyxhQUFPO0FBQUEsUUFDTCxhQUFhO0FBQUEsUUFDYixhQUFhLElBQUksS0FBSyxRQUFRLE9BQU8sT0FBTyxDQUFDO0FBQUEsTUFDL0M7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQ0EsUUFBTSxLQUFLLFlBQVk7QUFDdkIsU0FBTztBQUNUO0FBRUEsU0FBUyxhQUFhLFFBQU8sb0JBQUksS0FBSyxHQUFFLFNBQVMsR0FBRztBQUNsRCxRQUFNLFlBQVksSUFBSSxLQUFLLElBQUksRUFBRSxPQUFPO0FBQ3hDLFNBQU8sVUFBVSxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQy9CO0FBRUEsU0FBUyxhQUFhLE1BQU0sTUFBTTtBQUNoQyxTQUFP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
