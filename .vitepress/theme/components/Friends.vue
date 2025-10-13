
<template>
  <div class="friends-page">
    <h1 class="page-title">🔗 友情链接</h1>

    <div v-if="friends.length" class="friends-grid">
      <a
        v-for="(friend, index) in friends"
        :key="index"
        class="friend-card"
        :href="friend.url"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img :src="friend.avatar" alt="avatar" class="avatar" />
        <div class="info">
          <div class="name">{{ friend.name }}</div>
          <div class="desc">{{ friend.description }}</div>
        </div>
      </a>
    </div>

    <div v-else class="loading">加载中...</div>

    <div class="divider"></div>

    <div class="add-me">
      <h2>📬 想添加我？</h2>
      <p>欢迎交换友链，请使用以下信息：</p>
      <pre class="info-box">
{
  "name": "苦小怕's Blog",
  "url": "https://doc.kulipai.top",
  "description": "A student.",
  "avatar": "https://doc.kulipai.top/avator.png"
}
      </pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const friends = ref<any[]>([]);

onMounted(async () => {
  try {
    const res = await fetch("/friends.json");
    if (res.ok) {
      friends.value = await res.json();
    }
  } catch (e) {
    console.error("加载友链失败：", e);
  }
});
</script>

<style scoped>
.friends-page {
  margin: 0 auto;
  padding: 2rem 1rem 4rem;
  max-width: 960px;
  color: var(--vp-c-text);
  background-color: var(--vp-c-bg);
}

.page-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.friends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
}

.friend-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: var(--vp-c-bg-alpha-with-backdrop);
  border-radius: 16px;
  padding: 1rem;
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
  border: 1px solid transparent;
}

.friend-card:hover {
  border-color: var(--vp-c-brand);
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  color: var(--vp-c-brand);
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 3px solid var(--vp-avator-border);
  flex-shrink: 0;
}

.info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.name {
  font-size: 1.1rem;
  font-weight: 600;
}

.desc {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  margin-top: 4px;
}

.divider {
  margin: 3rem 0 2rem;
  border-top: 1px dashed #c7c7c7;
}

.add-me {
  text-align: center;
}

.add-me h2 {
  margin-bottom: 0.5rem;
}

.info-box {
  text-align: left;
  display: inline-block;
  background-color: var(--vp-c-bg-alpha-with-backdrop);
  padding: 1rem;
  border-radius: 12px;
  font-family: var(--vp-font-family-mono);
  border: 1px solid var(--vp-c-brand);
  color: var(--vp-c-text);
  margin-top: 1rem;
}
</style>
